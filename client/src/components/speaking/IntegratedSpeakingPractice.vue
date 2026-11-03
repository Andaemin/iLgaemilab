<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['end', 'complete'])

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031'

// 상태 관리
const sessionId = ref(null)
const dbSessionId = ref(null)
const messages = ref([])
const currentTurn = ref(0)
const maxTurns = 10
const isRecording = ref(false)
const isLoading = ref(false)
const userInput = ref('')
const conversationComplete = ref(false)
const analysis = ref(null)
const expectedResponses = ref([])
const lastPronunciationScore = ref(null)

// 녹음 관련
const mediaRecorder = ref(null)
const audioChunks = ref([])

// 대화 시작
const startConversation = async () => {
  try {
    isLoading.value = true
    const response = await axios.post(`${API_URL}/api/speaking-practice/sessions/start`, {
      scenarioId: props.scenario.id
    })

    sessionId.value = response.data.session.sessionId
    dbSessionId.value = response.data.session.id
    currentTurn.value = response.data.conversation.turnCount
    expectedResponses.value = response.data.conversation.expectedResponses

    // AI 첫 메시지 추가
    messages.value.push({
      role: 'assistant',
      content: response.data.conversation.message,
      timestamp: new Date()
    })
  } catch (error) {
    console.error('대화 시작 실패:', error)
    alert('대화를 시작하는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 사용자 응답 전송
const sendUserResponse = async (audioBlob = null, transcribedText = '') => {
  if (!transcribedText && !audioBlob) return

  // 사용자 메시지 먼저 추가
  messages.value.push({
    role: 'user',
    content: transcribedText,
    timestamp: new Date(),
    pronunciationScore: null // 평가 전
  })

  userInput.value = ''
  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('transcribedText', transcribedText)
    if (audioBlob) {
      formData.append('audio', audioBlob, 'audio.webm')
    }

    const response = await axios.post(
      `${API_URL}/api/speaking-practice/sessions/${sessionId.value}/respond`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    currentTurn.value = response.data.turnCount
    lastPronunciationScore.value = response.data.pronunciationScore

    // 사용자 메시지에 발음 점수 추가
    if (response.data.pronunciationScore) {
      messages.value[messages.value.length - 1].pronunciationScore = response.data.pronunciationScore
    }

    if (response.data.isComplete) {
      conversationComplete.value = true
      await analyzeConversation()
    } else {
      // AI 응답 추가
      messages.value.push({
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      })

      // 예상 응답 업데이트
      if (response.data.expectedResponses) {
        expectedResponses.value = response.data.expectedResponses
      }
    }
  } catch (error) {
    console.error('응답 전송 실패:', error)
    alert('응답을 전송하는데 실패했습니다.')
    // 실패한 메시지 제거
    messages.value.pop()
  } finally {
    isLoading.value = false
  }
}

// 대화 분석
const analyzeConversation = async () => {
  try {
    isLoading.value = true
    const response = await axios.post(
      `${API_URL}/api/speaking-practice/sessions/${sessionId.value}/analyze`
    )

    analysis.value = response.data.analysis
    emit('complete', analysis.value)
  } catch (error) {
    console.error('분석 실패:', error)
    alert('대화 분석에 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 녹음 시작
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })

      // STT 처리 (실제 환경에서는 서버에서 처리)
      const transcript = prompt('음성 인식 결과를 입력하세요:')
      if (transcript) {
        await sendUserResponse(audioBlob, transcript)
      }
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (error) {
    console.error('녹음 시작 실패:', error)
    alert('마이크 접근 권한이 필요합니다.')
  }
}

// 녹음 중지
const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
    mediaRecorder.value.stream.getTracks().forEach(track => track.stop())
    isRecording.value = false
  }
}

// 녹음 토글
const toggleRecording = (event) => {
  console.log('🎤 toggleRecording 호출됨!', {
    eventType: event?.type,
    isRecording: isRecording.value,
    isLoading: isLoading.value
  })

  // 이벤트 전파 방지 (중복 호출 방지)
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // disabled 상태면 무시
  if (isLoading.value) {
    console.log('⚠️ 로딩 중이라 무시됨')
    return
  }

  if (isRecording.value) {
    console.log('⏹️ 녹음 중지 시도')
    stopRecording()
  } else {
    console.log('🔴 녹음 시작 시도')
    startRecording()
  }
}

// 텍스트 입력으로 응답
const sendTextResponse = async () => {
  if (userInput.value.trim()) {
    await sendUserResponse(null, userInput.value.trim())
  }
}

// 진행률
const progress = computed(() => {
  return (currentTurn.value / maxTurns) * 100
})

// 발음 점수에 따른 색상
const getScoreColor = (score) => {
  if (score >= 90) return '#4CAF50'
  if (score >= 75) return '#8BC34A'
  if (score >= 60) return '#FFC107'
  return '#FF5252'
}

onMounted(() => {
  startConversation()
})

onUnmounted(() => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
  }
})
</script>

<template>
  <div class="integrated-speaking-practice">
    <!-- 헤더 -->
    <div class="practice-header">
      <div class="header-content">
        <button class="close-button" @click="$emit('end')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="header-info">
          <h3 class="common-title4">{{ scenario.titleKo }}</h3>
          <p class="common-caption text-secondary">{{ scenario.context }}</p>
        </div>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text common-caption">
          대화 {{ currentTurn }} / {{ maxTurns }}
        </span>
      </div>
    </div>

    <!-- 대화 내용 -->
    <div class="conversation-content" v-if="!conversationComplete">
      <div class="messages-container">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message"
          :class="`message-${message.role}`"
        >
          <div class="message-avatar">
            <span>{{ message.role === 'assistant' ? '🤖' : '👤' }}</span>
          </div>
          <div class="message-bubble">
            <p class="message-text">{{ message.content }}</p>
            <div class="message-meta">
              <span class="message-time common-caption">
                {{ new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) }}
              </span>
              <span
                v-if="message.pronunciationScore"
                class="pronunciation-score"
                :style="{ color: getScoreColor(message.pronunciationScore) }"
              >
                발음: {{ message.pronunciationScore }}점
              </span>
            </div>
          </div>
        </div>

        <!-- 로딩 표시 -->
        <div v-if="isLoading" class="message message-assistant">
          <div class="message-avatar">
            <span>🤖</span>
          </div>
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 예상 응답 힌트 -->
      <div v-if="expectedResponses.length > 0 && !isLoading" class="expected-responses">
        <p class="common-caption text-secondary">예시 응답:</p>
        <div class="response-chips">
          <button
            v-for="(response, idx) in expectedResponses.slice(0, 3)"
            :key="idx"
            class="response-chip"
            @click="userInput = response"
          >
            {{ response }}
          </button>
        </div>
      </div>
    </div>

    <!-- 종합 평가 결과 -->
    <div v-else-if="analysis" class="analysis-section">
      <CommonCard class="analysis-card">
        <div class="analysis-header">
          <div class="score-display">
            <div class="score-circle" :style="{ borderColor: getScoreColor(analysis.totalScore) }">
              <span class="score-value">{{ analysis.totalScore }}</span>
              <span class="score-label">점</span>
            </div>
            <h2 class="common-title2">종합 평가 결과</h2>
          </div>
        </div>

        <!-- 발음 평가 -->
        <div class="pronunciation-section">
          <h3 class="common-title4">발음 평가</h3>
          <div class="pronunciation-summary">
            <div class="summary-item">
              <span class="item-label">평균 발음 점수</span>
              <span class="item-value">{{ analysis.pronunciationAnalysis.averageScore }}점</span>
            </div>
            <div class="turn-scores">
              <div
                v-for="(score, idx) in analysis.pronunciationAnalysis.turnByTurnScores"
                :key="idx"
                class="turn-score"
                :style="{ backgroundColor: getScoreColor(score) + '20' }"
              >
                <span class="turn-number">{{ idx + 1 }}턴</span>
                <span class="turn-value">{{ score }}</span>
              </div>
            </div>
          </div>

          <!-- 어려운 단어 -->
          <div v-if="analysis.pronunciationAnalysis.commonIssues?.difficultWords?.length > 0" class="difficult-words">
            <p class="common-caption">발음이 어려운 단어:</p>
            <div class="word-chips">
              <span
                v-for="word in analysis.pronunciationAnalysis.commonIssues.difficultWords"
                :key="word.word"
                class="word-chip"
              >
                {{ word.word }} ({{ word.avgScore }}점)
              </span>
            </div>
          </div>
        </div>

        <!-- 언어 능력 평가 -->
        <div class="language-section">
          <h3 class="common-title4">언어 능력 평가</h3>
          <div class="breakdown-items">
            <div class="breakdown-item">
              <span class="item-label">문법 정확도</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.languageAnalysis.breakdown.grammar.score / 30) * 100}%`,
                    backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.grammar.score / 30) * 100)
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.languageAnalysis.breakdown.grammar.score }}/30</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">어휘 적절성</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.languageAnalysis.breakdown.vocabulary.score / 25) * 100}%`,
                    backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.vocabulary.score / 25) * 100)
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.languageAnalysis.breakdown.vocabulary.score }}/25</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">상황 적합성</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.languageAnalysis.breakdown.context.score / 25) * 100}%`,
                    backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.context.score / 25) * 100)
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.languageAnalysis.breakdown.context.score }}/25</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">의사소통 능력</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.languageAnalysis.breakdown.communication.score / 20) * 100}%`,
                    backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.communication.score / 20) * 100)
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.languageAnalysis.breakdown.communication.score }}/20</span>
            </div>
          </div>
        </div>

        <!-- 개선 추천 사항 -->
        <div class="recommendations-section">
          <h3 class="common-title4">개선 추천 사항</h3>
          <div class="recommendations-list">
            <div
              v-for="(rec, idx) in analysis.recommendations"
              :key="idx"
              class="recommendation-item"
              :class="`priority-${rec.priority}`"
            >
              <div class="rec-header">
                <span class="rec-area">{{ rec.area }}</span>
                <span class="rec-priority">{{ rec.priority === 'high' ? '높음' : '보통' }}</span>
              </div>
              <p class="rec-suggestion">{{ rec.suggestion }}</p>
              <div class="rec-exercises">
                <span v-for="exercise in rec.exercises" :key="exercise" class="exercise-chip">
                  {{ exercise }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 피드백 -->
        <div class="feedback-section">
          <h3 class="common-title4">종합 피드백</h3>
          <p class="feedback-text">{{ analysis.languageAnalysis.overallFeedback }}</p>

          <div v-if="analysis.languageAnalysis.corrections?.length > 0" class="corrections">
            <p class="common-caption">교정 사항:</p>
            <div class="correction-list">
              <div v-for="(correction, idx) in analysis.languageAnalysis.corrections" :key="idx" class="correction-item">
                <span class="original">{{ correction.original }}</span>
                <span class="arrow">→</span>
                <span class="corrected">{{ correction.corrected }}</span>
                <p class="explanation">{{ correction.explanation }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="action-buttons">
          <CommonButton @click="$emit('end')" variant="secondary">
            종료
          </CommonButton>
          <CommonButton @click="startConversation" variant="primary">
            다시 연습하기
          </CommonButton>
        </div>
      </CommonCard>
    </div>

    <!-- 입력 영역 -->
    <div v-if="!conversationComplete" class="input-section">
      <div class="input-container">
        <input
          v-model="userInput"
          type="text"
          placeholder="메시지를 입력하거나 마이크 버튼을 눌러 음성으로 답하세요"
          @keyup.enter="sendTextResponse"
          :disabled="isLoading"
        />
        <button
          class="mic-button"
          :class="{ 'recording': isRecording }"
          @touchend="toggleRecording"
          @click="toggleRecording"
          :disabled="isLoading"
          type="button"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 19V23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M8 23H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button
          class="send-button"
          @click="sendTextResponse"
          :disabled="!userInput.trim() || isLoading"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.integrated-speaking-practice {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f8f9fa;
}

.practice-header {
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
}

.header-info h3 {
  margin: 0 0 4px 0;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4CAF50;
  transition: width 0.3s ease;
}

.conversation-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.message-user .message-avatar {
  background: #e3f2fd;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-user .message-bubble {
  background: #2196F3;
  color: white;
}

.message-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  align-items: center;
}

.message-time {
  color: #999;
  font-size: 12px;
}

.message-user .message-time {
  color: rgba(255,255,255,0.8);
}

.pronunciation-score {
  font-size: 12px;
  font-weight: 600;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.expected-responses {
  max-width: 800px;
  margin: 20px auto 0;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.response-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.response-chip {
  padding: 8px 16px;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.response-chip:hover {
  background: #e0e0e0;
}

.analysis-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.analysis-card {
  max-width: 900px;
  margin: 0 auto;
}

.analysis-header {
  text-align: center;
  margin-bottom: 32px;
}

.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 36px;
  font-weight: bold;
}

.score-label {
  font-size: 14px;
  color: #666;
}

.pronunciation-section,
.language-section,
.recommendations-section,
.feedback-section {
  margin-bottom: 32px;
}

.pronunciation-summary {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.turn-scores {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.turn-score {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  gap: 4px;
}

.turn-number {
  color: #666;
}

.turn-value {
  font-weight: 600;
}

.difficult-words {
  margin-top: 16px;
}

.word-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.word-chip {
  padding: 4px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 12px;
  font-size: 13px;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-label {
  flex: 0 0 120px;
  font-size: 14px;
  color: #666;
}

.item-bar {
  flex: 1;
  height: 24px;
  background: #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
}

.item-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.item-score {
  flex: 0 0 60px;
  text-align: right;
  font-weight: 600;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-item.priority-high {
  border-left-color: #ff5252;
}

.recommendation-item.priority-medium {
  border-left-color: #ffc107;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rec-area {
  font-weight: 600;
}

.rec-priority {
  font-size: 12px;
  padding: 2px 8px;
  background: white;
  border-radius: 4px;
}

.rec-suggestion {
  margin: 8px 0;
  color: #333;
}

.rec-exercises {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.exercise-chip {
  padding: 4px 8px;
  background: white;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.feedback-text {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  line-height: 1.6;
}

.corrections {
  margin-top: 16px;
}

.correction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.correction-item {
  padding: 12px;
  background: #fff3cd;
  border-radius: 6px;
}

.original {
  color: #dc3545;
  text-decoration: line-through;
}

.arrow {
  margin: 0 8px;
  color: #666;
}

.corrected {
  color: #28a745;
  font-weight: 600;
}

.explanation {
  margin-top: 4px;
  font-size: 13px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: center;
}

.input-section {
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  position: relative;
  z-index: 100;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  position: relative;
  z-index: 100;
}

.input-container input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
}

.input-container input:focus {
  border-color: #2196F3;
}

.mic-button,
.send-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #f0f0f0;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  /* 모바일 터치 최적화 */
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  -ms-user-select: none !important;
  min-width: 48px !important;
  min-height: 48px !important;
  /* iOS Safari에서 버튼이 눌리지 않는 문제 해결 */
  position: relative !important;
  z-index: 1000 !important;
  pointer-events: auto !important;
  /* SVG가 이벤트를 가로채지 않도록 */
}

.mic-button svg,
.send-button svg {
  pointer-events: none !important;
}

.mic-button:hover,
.send-button:hover {
  background: #e0e0e0;
}

.mic-button:active,
.send-button:active {
  transform: scale(0.95);
}

.mic-button.recording {
  background: #f44336;
  color: white;
  animation: pulse 1s infinite;
}

/* 모바일에서 버튼 크기 증가 */
@media (max-width: 768px) {
  .mic-button,
  .send-button {
    width: 56px;
    height: 56px;
    min-width: 56px !important;
    min-height: 56px !important;
  }

  .mic-button svg,
  .send-button svg {
    width: 28px;
    height: 28px;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.mic-button:disabled,
.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none !important;
}

/* 활성 상태의 버튼은 터치 가능하도록 */
.mic-button:not(:disabled),
.send-button:not(:disabled) {
  pointer-events: auto !important;
}
</style>