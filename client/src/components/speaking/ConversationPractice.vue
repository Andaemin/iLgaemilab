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
const messages = ref([])
const currentTurn = ref(0)
const maxTurns = 10
const isRecording = ref(false)
const isLoading = ref(false)
const userInput = ref('')
const conversationComplete = ref(false)
const analysis = ref(null)

// 녹음 관련
const mediaRecorder = ref(null)
const audioChunks = ref([])

// 대화 시작
const startConversation = async () => {
  try {
    isLoading.value = true
    const response = await axios.post(`${API_URL}/api/conversation/start`, {
      scenarioId: props.scenario.id
    })

    sessionId.value = response.data.sessionId
    currentTurn.value = response.data.turnCount

    // AI 첫 메시지 추가
    messages.value.push({
      role: 'assistant',
      content: response.data.message,
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
const sendUserResponse = async (audioTranscript = null) => {
  if (!userInput.value && !audioTranscript) return

  const userMessage = userInput.value || audioTranscript

  // 사용자 메시지 추가
  messages.value.push({
    role: 'user',
    content: userMessage,
    timestamp: new Date()
  })

  userInput.value = ''
  isLoading.value = true

  try {
    const formData = new FormData()
    formData.append('sessionId', sessionId.value)
    formData.append('userMessage', userMessage)
    if (audioTranscript) {
      formData.append('audioTranscript', audioTranscript)
    }

    const response = await axios.post(
      `${API_URL}/api/conversation/respond`,
      formData
    )

    currentTurn.value = response.data.turnCount

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
    }
  } catch (error) {
    console.error('응답 전송 실패:', error)
    alert('응답을 전송하는데 실패했습니다.')
  } finally {
    isLoading.value = false
  }
}

// 대화 분석
const analyzeConversation = async () => {
  try {
    isLoading.value = true
    const response = await axios.get(
      `${API_URL}/api/conversation/analyze/${sessionId.value}`
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
      // 여기서 STT 처리 후 sendUserResponse 호출
      // 일단은 텍스트 입력으로 대체
      const transcript = prompt('음성 인식 결과를 입력하세요:')
      if (transcript) {
        await sendUserResponse(transcript)
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
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 진행률
const progress = computed(() => {
  return (currentTurn.value / maxTurns) * 100
})

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
  <div class="conversation-practice">
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
            <span class="message-time common-caption">
              {{ new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit'
              }) }}
            </span>
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
    </div>

    <!-- 평가 결과 -->
    <div v-else-if="analysis" class="analysis-section">
      <CommonCard class="analysis-card">
        <div class="analysis-header">
          <div class="score-display">
            <div class="score-circle">
              <span class="score-value">{{ analysis.totalScore }}</span>
              <span class="score-label">점</span>
            </div>
            <h2 class="common-title2">대화 평가 결과</h2>
          </div>
        </div>

        <div class="score-breakdown">
          <h3 class="common-title4">세부 평가</h3>
          <div class="breakdown-items">
            <div class="breakdown-item">
              <span class="item-label">문법 정확도</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.breakdown.grammar.score / 30) * 100}%`
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.breakdown.grammar.score }}/30</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">어휘 적절성</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.breakdown.vocabulary.score / 25) * 100}%`
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.breakdown.vocabulary.score }}/25</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">상황 적합성</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.breakdown.context.score / 25) * 100}%`
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.breakdown.context.score }}/25</span>
            </div>
            <div class="breakdown-item">
              <span class="item-label">의사소통 능력</span>
              <div class="item-bar">
                <div
                  class="item-fill"
                  :style="{
                    width: `${(analysis.breakdown.communication.score / 20) * 100}%`
                  }"
                ></div>
              </div>
              <span class="item-score">{{ analysis.breakdown.communication.score }}/20</span>
            </div>
          </div>
        </div>

        <div class="feedback-section">
          <h3 class="common-title4">피드백</h3>

          <div class="feedback-block">
            <h4 class="feedback-title">💪 잘한 점</h4>
            <ul>
              <li v-for="(strength, index) in analysis.strengths" :key="index">
                {{ strength }}
              </li>
            </ul>
          </div>

          <div class="feedback-block">
            <h4 class="feedback-title">📝 개선할 점</h4>
            <ul>
              <li v-for="(improvement, index) in analysis.improvements" :key="index">
                {{ improvement }}
              </li>
            </ul>
          </div>

          <div v-if="analysis.corrections?.length" class="corrections-block">
            <h4 class="feedback-title">✏️ 문장 교정</h4>
            <div
              v-for="(correction, index) in analysis.corrections"
              :key="index"
              class="correction-item"
            >
              <p class="original">❌ {{ correction.original }}</p>
              <p class="corrected">✅ {{ correction.corrected }}</p>
              <p class="explanation common-caption">{{ correction.explanation }}</p>
            </div>
          </div>

          <div class="overall-feedback">
            <p class="common-body1">{{ analysis.overallFeedback }}</p>
          </div>
        </div>

        <div class="action-buttons">
          <CommonButton variant="secondary" size="large" @click="$emit('end')">
            다른 연습하기
          </CommonButton>
          <CommonButton variant="primary" size="large" @click="$emit('end')">
            완료
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
          placeholder="메시지를 입력하세요..."
          class="message-input"
          @keyup.enter="sendUserResponse()"
          :disabled="isLoading"
        />
        <button
          class="record-button"
          :class="{ recording: isRecording }"
          @click="toggleRecording"
          :disabled="isLoading"
        >
          <svg v-if="!isRecording" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="8" y="8" width="8" height="8" rx="2" fill="currentColor"/>
          </svg>
        </button>
        <button
          class="send-button"
          @click="sendUserResponse()"
          :disabled="!userInput || isLoading"
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
.conversation-practice {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--gray-50);
}

/* 헤더 */
.practice-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 16px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.close-button {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-button:hover {
  background: var(--gray-200);
}

.header-info {
  flex: 1;
}

.header-info h3 {
  margin-bottom: 4px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: var(--gray-200);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--common-blue);
  transition: width 0.3s ease;
}

.progress-text {
  color: var(--gray-600);
  min-width: 80px;
  text-align: right;
}

/* 대화 내용 */
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
  width: 40px;
  height: 40px;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-bubble {
  max-width: 70%;
  background: white;
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
}

.message-user .message-bubble {
  background: var(--common-blue);
  color: white;
}

.message-text {
  margin-bottom: 4px;
  line-height: 1.5;
}

.message-time {
  color: var(--gray-500);
}

.message-user .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* 타이핑 인디케이터 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--gray-400);
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
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* 입력 영역 */
.input-section {
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: 16px 20px;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--gray-300);
  border-radius: 24px;
  font-size: 16px;
  outline: none;
  transition: all 0.2s;
}

.message-input:focus {
  border-color: var(--common-blue);
}

.record-button,
.send-button {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--common-blue);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.record-button:hover,
.send-button:hover {
  background: var(--common-blue-dark);
  transform: scale(1.05);
}

.record-button.recording {
  background: var(--danger);
  animation: pulse 1s infinite;
}

.send-button:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 평가 결과 */
.analysis-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.analysis-card {
  max-width: 800px;
  margin: 0 auto;
}

.analysis-header {
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
}

.score-display {
  display: flex;
  align-items: center;
  gap: 24px;
}

.score-circle {
  width: 100px;
  height: 100px;
  border: 4px solid var(--common-blue);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--common-blue-light);
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--common-blue);
}

.score-label {
  font-size: 14px;
  color: var(--gray-600);
}

/* 세부 평가 */
.score-breakdown {
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
}

.score-breakdown h3 {
  margin-bottom: 20px;
}

.breakdown-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.breakdown-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.item-label {
  width: 120px;
  font-size: 14px;
  color: var(--gray-700);
}

.item-bar {
  flex: 1;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.item-fill {
  height: 100%;
  background: var(--common-blue);
  transition: width 0.5s ease;
}

.item-score {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  min-width: 50px;
  text-align: right;
}

/* 피드백 */
.feedback-section {
  padding: 24px;
}

.feedback-section h3 {
  margin-bottom: 20px;
}

.feedback-block {
  margin-bottom: 24px;
}

.feedback-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--gray-800);
}

.feedback-block ul {
  list-style: none;
  padding-left: 24px;
}

.feedback-block li {
  position: relative;
  margin-bottom: 8px;
  color: var(--gray-700);
}

.feedback-block li::before {
  content: "•";
  position: absolute;
  left: -16px;
  color: var(--common-blue);
}

/* 문장 교정 */
.corrections-block {
  margin-bottom: 24px;
}

.correction-item {
  background: var(--gray-50);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.correction-item .original {
  color: var(--danger);
  margin-bottom: 4px;
}

.correction-item .corrected {
  color: var(--success);
  margin-bottom: 4px;
}

.correction-item .explanation {
  color: var(--gray-600);
  margin-top: 8px;
}

.overall-feedback {
  background: var(--common-blue-light);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid var(--gray-200);
}

.action-buttons button {
  flex: 1;
}

.text-secondary {
  color: var(--gray-600);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .breakdown-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .item-label {
    width: 100%;
  }

  .item-score {
    width: 100%;
    text-align: left;
  }
}
</style>