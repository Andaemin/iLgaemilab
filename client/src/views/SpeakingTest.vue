<script setup>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import gsap from 'gsap'
import AppHeader from '@/components/common/AppHeader.vue'
import CategorySelector from '@/components/speaking/CategorySelector.vue'
import CategoryConversation from '@/components/speaking/CategoryConversation.vue'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import LoadingDialog from '@/components/common/LoadingDialog.vue'

const router = useRouter()
const { t } = useI18n()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031'

// 상태 관리
const currentStep = ref('category')
const selectedCategory = ref(null)
const selectedScenario = ref(null)
const sessionId = ref(null)
const currentTurn = ref(0)
const maxTurns = 10
const isRecording = ref(false)
const isLoading = ref(false)
const showLoadingDialog = ref(false)
const loadingMessage = ref(t('speakingTest.loading.processing'))

// 대화 관련
const messages = ref([])
const userInput = ref('')
const expectedResponses = ref([])
const conversationComplete = ref(false)
const analysis = ref(null)

// 녹음 관련
const mediaRecorder = ref(null)
const audioChunks = ref([])
const audioContext = ref(null)
const analyser = ref(null)
const animationId = ref(null)

// 음성 인식 관련
const recognition = ref(null)
const isRecognizing = ref(false)
const transcribedText = ref('')

// 카테고리 정의
const categories = [
  {
    id: 'construction',
    name: t('speakingTest.categories.construction.name'),
    icon: '🏗️',
    description: t('speakingTest.categories.construction.description')
  },
  {
    id: 'manufacturing',
    name: t('speakingTest.categories.manufacturing.name'),
    icon: '🏭',
    description: t('speakingTest.categories.manufacturing.description')
  },
  {
    id: 'service',
    name: t('speakingTest.categories.service.name'),
    icon: '🏪',
    description: t('speakingTest.categories.service.description')
  },
  {
    id: 'daily',
    name: t('speakingTest.categories.daily.name'),
    icon: '💬',
    description: t('speakingTest.categories.daily.description')
  },
  {
    id: 'emergency',
    name: t('speakingTest.categories.emergency.name'),
    icon: '🚨',
    description: t('speakingTest.categories.emergency.description')
  }
]

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

// 카테고리 선택 - 바로 대화로 이동
const selectCategory = (category) => {
  selectedCategory.value = category
  showLoadingDialog.value = true
  loadingMessage.value = t('speakingTest.loading.preparingConversation')

  // 짧은 로딩 후 바로 대화 화면으로 이동
  setTimeout(() => {
    showLoadingDialog.value = false
    currentStep.value = 'conversation'
  }, 500)
}

// 대화에서 돌아오기
const handleBackFromConversation = () => {
  currentStep.value = 'category'
  selectedCategory.value = null
}

// 대화 완료 처리
const handleConversationComplete = () => {
  currentStep.value = 'category'
  selectedCategory.value = null
  messages.value = []
  currentTurn.value = 0
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
  showLoadingDialog.value = true
  loadingMessage.value = t('speakingTest.loading.processingResponse')

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
    console.error('Failed to send response:', error)
    alert(t('speakingTest.errors.sendResponseFailedMessage'))
    // 실패한 메시지 제거
    messages.value.pop()
  } finally {
    showLoadingDialog.value = false
  }
}

// 대화 분석
const analyzeConversation = async () => {
  showLoadingDialog.value = true
  loadingMessage.value = t('speakingTest.loading.analyzingConversation')

  try {
    const response = await axios.post(
      `${API_URL}/api/speaking-practice/sessions/${sessionId.value}/analyze`
    )

    analysis.value = response.data.analysis
    currentStep.value = 'result'

    // 결과 화면으로 이동 후 상단으로 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  } catch (error) {
    console.error('Analysis failed:', error)
    alert(t('speakingTest.errors.analysisFailedMessage'))
  } finally {
    showLoadingDialog.value = false
  }
}

// Web Speech API 초기화
const initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition.value = new SpeechRecognition()

    // 한국어 설정
    recognition.value.lang = 'ko-KR'
    recognition.value.continuous = true
    recognition.value.interimResults = true
    recognition.value.maxAlternatives = 1

    // 음성 인식 결과 처리
    recognition.value.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        transcribedText.value = finalTranscript
      } else if (interimTranscript) {
        transcribedText.value = interimTranscript
      }
    }

    recognition.value.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        console.log('No speech detected')
      }
    }

    recognition.value.onend = () => {
      isRecognizing.value = false
    }
  } else {
    console.warn('Browser does not support speech recognition')
  }
}

// 녹음 시작
const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // 오디오 컨텍스트 설정 (시각화용)
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    analyser.value = audioContext.value.createAnalyser()
    const source = audioContext.value.createMediaStreamSource(stream)
    source.connect(analyser.value)

    // MediaRecorder 설정
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []
    transcribedText.value = ''

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })

      // 음성 인식 결과 사용
      if (transcribedText.value) {
        await sendUserResponse(audioBlob, transcribedText.value)
      } else {
        // 음성 인식 실패 시 사용자 입력 유도
        showLoadingDialog.value = false
        alert(t('speakingTest.errors.speechRecognitionFailed'))
      }

      // 스트림 정리
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true

    // Web Speech API 시작
    if (!recognition.value) {
      initSpeechRecognition()
    }
    if (recognition.value) {
      recognition.value.start()
      isRecognizing.value = true
    }

    visualizeAudio()
  } catch (error) {
    console.error('Failed to start recording:', error)
    alert(t('speakingTest.errors.microphonePermission'))
  }
}

// 녹음 중지
const stopRecording = () => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    // 음성 인식 중지
    if (recognition.value && isRecognizing.value) {
      recognition.value.stop()
      isRecognizing.value = false
    }

    mediaRecorder.value.stop()
    isRecording.value = false

    // 시각화 중지
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
    }

    // 오디오 컨텍스트 정리
    if (audioContext.value) {
      audioContext.value.close()
    }
  }
}

// 오디오 시각화
const visualizeAudio = () => {
  if (!analyser.value) return

  const dataArray = new Uint8Array(analyser.value.frequencyBinCount)

  const draw = () => {
    if (isRecording.value) {
      animationId.value = requestAnimationFrame(draw)
      analyser.value.getByteFrequencyData(dataArray)

      // 볼륨 계산
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length

      // 시각화 요소 업데이트 (CSS 변수 활용)
      document.documentElement.style.setProperty('--audio-volume', volume / 100)
    }
  }

  draw()
}

// 녹음 토글
const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// 텍스트 입력으로 응답
const sendTextResponse = async () => {
  if (userInput.value.trim()) {
    await sendUserResponse(null, userInput.value.trim())
  }
}

// 다시 시작
const restartPractice = () => {
  messages.value = []
  currentTurn.value = 0
  conversationComplete.value = false
  analysis.value = null
  currentStep.value = 'category'
  selectedCategory.value = null
  selectedScenario.value = null
  sessionId.value = null
}


// 컴포넌트 초기화
onMounted(() => {
  // Web Speech API 초기화
  initSpeechRecognition()
})

// 컴포넌트 정리
onUnmounted(() => {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop()
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
})
</script>

<template>
  <div class="speaking-test-page">
    <!-- AppHeader는 카테고리 선택 화면에서만 표시 -->
    <AppHeader v-if="currentStep === 'category' || currentStep === 'result'" />

    <!-- Loading Dialog -->
    <LoadingDialog v-if="showLoadingDialog" :message="loadingMessage" />

    <div class="speaking-test-content">
      <!-- 카테고리 선택 -->
      <div v-if="currentStep === 'category'" class="category-section">
        <CategorySelector
          :categories="categories"
          @select="selectCategory"
        />
      </div>

      <!-- 대화 화면 -->
      <div v-else-if="currentStep === 'conversation'" class="conversation-section">
        <CategoryConversation
          :category="selectedCategory"
          :difficulty="'beginner'"
          @back="handleBackFromConversation"
          @complete="handleConversationComplete"
        />
      </div>

      <!-- 대화형 연습 -->
      <div v-else-if="currentStep === 'practice'" class="practice-section">
        <!-- 헤더 -->
        <div class="practice-header">
          <div class="header-content">
            <button class="close-button" @click="restartPractice">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="header-info">
              <h3 class="common-title4">{{ selectedScenario.titleKo }}</h3>
              <p class="common-caption text-secondary">{{ selectedScenario.context }}</p>
            </div>
          </div>

          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <span class="progress-text common-caption">
              {{ t('speakingTest.progress.turn', { current: currentTurn }) }}
            </span>
          </div>
        </div>

        <!-- 대화 내용 -->
        <div class="conversation-area">
          <div class="messages-container">
            <TransitionGroup name="message-list" tag="div">
              <div
                v-for="(message, index) in messages"
                :key="`${message.role}-${index}`"
                class="message"
                :class="`message-${message.role}`"
              >
                <div class="message-avatar">
                  <span>{{ message.role === 'assistant' ? '🤖' : '👤' }}</span>
                </div>
                <div class="message-content">
                  <div class="message-bubble">
                    <p>{{ message.content }}</p>
                  </div>
                  <div class="message-meta">
                    <span class="message-time">
                      {{ new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                    <span
                      v-if="message.pronunciationScore"
                      class="pronunciation-score"
                      :style="{ color: getScoreColor(message.pronunciationScore) }"
                    >
                      {{ t('speakingTest.result.pronunciation.score', { score: message.pronunciationScore }) }}
                    </span>
                  </div>
                </div>
              </div>
            </TransitionGroup>

            <!-- 로딩 표시 -->
            <div v-if="isLoading && !showLoadingDialog" class="message message-assistant">
              <div class="message-avatar">
                <span>🤖</span>
              </div>
              <div class="message-content">
                <div class="message-bubble typing-bubble">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- 입력 영역 -->
        <div v-if="!conversationComplete" class="input-section">
          <!-- 예상 응답 힌트 (입력창 위에 배치) -->
          <div v-if="expectedResponses.length > 0" class="suggestion-chips-container">
            <p class="suggestion-label">{{ t('speakingTest.suggestions.label') }}</p>
            <div class="suggestion-chips">
              <button
                v-for="(hint, idx) in expectedResponses.slice(0, 3)"
                :key="idx"
                class="suggestion-chip"
                @click="userInput = hint"
              >
                {{ hint }}
              </button>
            </div>
          </div>
          <!-- 음성 인식 상태 표시 -->
          <div v-if="isRecording" class="recognition-status">
            <div class="recording-indicator">
              <span class="recording-dot"></span>
              <span>{{ t('speakingTest.recording.inProgress') }}</span>
            </div>
            <div v-if="transcribedText" class="transcribed-text">
              {{ transcribedText }}
            </div>
          </div>

          <div class="input-container">
            <input
              v-model="userInput"
              type="text"
              :placeholder="t('speakingTest.input.placeholder')"
              @keyup.enter="sendTextResponse"
              :disabled="isLoading || isRecording"
              class="text-input"
            />
            <button
              class="mic-button"
              :class="{ 'recording': isRecording }"
              @click="toggleRecording"
              :disabled="isLoading"
            >
              <svg v-if="!isRecording" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z" stroke="currentColor" stroke-width="2"/>
                <path d="M19 10V12C19 15.87 15.87 19 12 19C8.13 19 5 15.87 5 12V10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 19V23M8 23H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
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

      <!-- 평가 결과 -->
      <div v-else-if="currentStep === 'result' && analysis" class="result-section">
        <div class="result-header">
          <h2 class="common-title1">{{ t('speakingTest.result.title') }}</h2>
        </div>

        <CommonCard class="score-card">
          <div class="total-score">
            <div class="score-circle" :style="{ borderColor: getScoreColor(analysis.totalScore) }">
              <span class="score-value">{{ analysis.totalScore }}</span>
              <span class="score-label">{{ t('speakingTest.result.pronunciation.score', { score: '' }).split(':')[1] }}</span>
            </div>
            <h3 class="common-title3">{{ t('speakingTest.result.totalScore') }}</h3>
          </div>

          <!-- 발음 평가 섹션 -->
          <div class="evaluation-section">
            <h4 class="section-title">{{ t('speakingTest.result.pronunciation.title') }}</h4>
            <div class="pronunciation-overview">
              <div class="stat-item">
                <span class="stat-label">{{ t('speakingTest.result.pronunciation.averageScore') }}</span>
                <span class="stat-value">{{ t('speakingTest.result.pronunciation.score', { score: analysis.pronunciationAnalysis.averageScore }) }}</span>
              </div>

              <!-- 턴별 점수 그래프 -->
              <div class="turn-scores">
                <div
                  v-for="(score, idx) in analysis.pronunciationAnalysis.turnByTurnScores"
                  :key="idx"
                  class="turn-bar"
                >
                  <div
                    class="bar-fill"
                    :style="{
                      height: `${score}%`,
                      backgroundColor: getScoreColor(score)
                    }"
                  ></div>
                  <span class="turn-label">{{ idx + 1 }}</span>
                </div>
              </div>
            </div>

            <!-- 어려운 단어 -->
            <div v-if="analysis.pronunciationAnalysis.commonIssues?.difficultWords?.length > 0" class="difficult-words">
              <p class="subsection-title">{{ t('speakingTest.result.pronunciation.difficultWords') }}</p>
              <div class="word-list">
                <span
                  v-for="word in analysis.pronunciationAnalysis.commonIssues.difficultWords"
                  :key="word.word"
                  class="word-tag"
                >
                  {{ word.word }} ({{ t('speakingTest.result.pronunciation.score', { score: word.avgScore }) }})
                </span>
              </div>
            </div>
          </div>

          <!-- 언어 능력 평가 -->
          <div class="evaluation-section">
            <h4 class="section-title">{{ t('speakingTest.result.language.title') }}</h4>
            <div class="skill-breakdown">
              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">{{ t('speakingTest.result.language.grammar') }}</span>
                  <span class="skill-score">{{ analysis.languageAnalysis.breakdown.grammar.score }}/30</span>
                </div>
                <div class="skill-bar">
                  <div
                    class="skill-progress"
                    :style="{
                      width: `${(analysis.languageAnalysis.breakdown.grammar.score / 30) * 100}%`,
                      backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.grammar.score / 30) * 100)
                    }"
                  ></div>
                </div>
                <p class="skill-comment">{{ analysis.languageAnalysis.breakdown.grammar.comment }}</p>
              </div>

              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">{{ t('speakingTest.result.language.vocabulary') }}</span>
                  <span class="skill-score">{{ analysis.languageAnalysis.breakdown.vocabulary.score }}/25</span>
                </div>
                <div class="skill-bar">
                  <div
                    class="skill-progress"
                    :style="{
                      width: `${(analysis.languageAnalysis.breakdown.vocabulary.score / 25) * 100}%`,
                      backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.vocabulary.score / 25) * 100)
                    }"
                  ></div>
                </div>
                <p class="skill-comment">{{ analysis.languageAnalysis.breakdown.vocabulary.comment }}</p>
              </div>

              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">{{ t('speakingTest.result.language.context') }}</span>
                  <span class="skill-score">{{ analysis.languageAnalysis.breakdown.context.score }}/25</span>
                </div>
                <div class="skill-bar">
                  <div
                    class="skill-progress"
                    :style="{
                      width: `${(analysis.languageAnalysis.breakdown.context.score / 25) * 100}%`,
                      backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.context.score / 25) * 100)
                    }"
                  ></div>
                </div>
                <p class="skill-comment">{{ analysis.languageAnalysis.breakdown.context.comment }}</p>
              </div>

              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">{{ t('speakingTest.result.language.communication') }}</span>
                  <span class="skill-score">{{ analysis.languageAnalysis.breakdown.communication.score }}/20</span>
                </div>
                <div class="skill-bar">
                  <div
                    class="skill-progress"
                    :style="{
                      width: `${(analysis.languageAnalysis.breakdown.communication.score / 20) * 100}%`,
                      backgroundColor: getScoreColor((analysis.languageAnalysis.breakdown.communication.score / 20) * 100)
                    }"
                  ></div>
                </div>
                <p class="skill-comment">{{ analysis.languageAnalysis.breakdown.communication.comment }}</p>
              </div>
            </div>
          </div>

          <!-- 개선 추천 -->
          <div class="evaluation-section">
            <h4 class="section-title">{{ t('speakingTest.result.recommendations.title') }}</h4>
            <div class="recommendations">
              <div
                v-for="(rec, idx) in analysis.recommendations"
                :key="idx"
                class="recommendation-card"
                :class="`priority-${rec.priority}`"
              >
                <div class="rec-header">
                  <span class="rec-area">{{ rec.area }}</span>
                  <span class="rec-priority-badge">
                    {{ rec.priority === 'high' ? t('speakingTest.result.recommendations.high') : t('speakingTest.result.recommendations.medium') }}
                  </span>
                </div>
                <p class="rec-content">{{ rec.suggestion }}</p>
                <div class="rec-exercises">
                  <span v-for="ex in rec.exercises" :key="ex" class="exercise-tag">
                    {{ ex }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 전체 피드백 -->
          <div class="evaluation-section">
            <h4 class="section-title">{{ t('speakingTest.result.overallFeedback') }}</h4>
            <div class="overall-feedback">
              <p>{{ analysis.languageAnalysis.overallFeedback }}</p>
            </div>

            <!-- 교정 사항 -->
            <div v-if="analysis.languageAnalysis.corrections?.length > 0" class="corrections">
              <p class="subsection-title">{{ t('speakingTest.result.corrections.title') }}</p>
              <div class="correction-list">
                <div
                  v-for="(corr, idx) in analysis.languageAnalysis.corrections"
                  :key="idx"
                  class="correction-item"
                >
                  <div class="correction-content">
                    <span class="original">{{ corr.original }}</span>
                    <span class="arrow">→</span>
                    <span class="corrected">{{ corr.corrected }}</span>
                  </div>
                  <p class="correction-explanation">{{ corr.explanation }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="action-buttons">
            <CommonButton @click="restartPractice" variant="secondary" size="large">
              {{ t('speakingTest.actions.backToStart') }}
            </CommonButton>
            <CommonButton @click="restartPractice" variant="primary" size="large">
              {{ t('speakingTest.actions.retry') }}
            </CommonButton>
          </div>
        </CommonCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.speaking-test-page {
  min-height: 100vh;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.speaking-test-content {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 카테고리/결과 화면일 때 - AppHeader 있음 */
.speaking-test-page:has(.app-header) .speaking-test-content {
  min-height: calc(100vh - 64px - 56px);
}

/* 대화/연습 화면일 때 - AppHeader 없음 */
.speaking-test-page:not(:has(.app-header)) .speaking-test-content {
  min-height: calc(100vh - 56px);
}

.conversation-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.back-button {
  background: white;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.back-button:hover {
  transform: translateX(-2px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

/* 대화형 연습 섹션 */
.practice-section {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.practice-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.close-button:hover {
  color: #333;
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
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #8BC34A);
  transition: width 0.3s ease;
}

/* 대화 영역 */
.conversation-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.messages-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 20px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.message-assistant .message-avatar {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message-user .message-bubble {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.typing-bubble {
  padding: 16px 24px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
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
    transform: translateY(0);
  }
  30% {
    opacity: 1;
    transform: translateY(-10px);
  }
}

.message-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  padding: 0 4px;
  font-size: 12px;
  color: #999;
}

.pronunciation-score {
  font-weight: 600;
}

/* 입력 영역 */
.input-section {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e0e0e0;
}

/* 제안 chip 컨테이너 (입력창 위) */
.suggestion-chips-container {
  max-width: 800px;
  margin: 0 auto 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  border-radius: 12px;
  border: 1px solid #667eea30;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.suggestion-label {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-chip {
  padding: 10px 16px;
  background: white;
  border: 2px solid #667eea;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
}

.suggestion-chip:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.suggestion-chip:active {
  transform: translateY(0);
}

/* 음성 인식 상태 */
.recognition-status {
  max-width: 800px;
  margin: 0 auto 12px;
  padding: 12px;
  background: #e3f2fd;
  border-radius: 8px;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #1565c0;
  margin-bottom: 8px;
}

.recording-dot {
  width: 8px;
  height: 8px;
  background: #f44336;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50%, 100% {
    opacity: 1;
  }
  25%, 75% {
    opacity: 0.3;
  }
}

.transcribed-text {
  padding: 8px;
  background: white;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  min-height: 40px;
  border: 1px solid #b3d9ff;
}

.input-container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: center;
}

.text-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.text-input:focus {
  border-color: #667eea;
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
  /* 모바일 터치 개선 */
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  user-select: none;
  -webkit-user-select: none;
  /* 최소 터치 영역 확보 (44x44px) */
  min-width: 48px;
  min-height: 48px;
  padding: 0;
  flex-shrink: 0;
}

.mic-button:hover,
.send-button:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.mic-button.recording {
  background: #f44336;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 결과 섹션 */
.result-section {
  max-width: 900px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  margin-bottom: 32px;
}

.score-card {
  padding: 32px;
}

.total-score {
  text-align: center;
  margin-bottom: 48px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 6px solid;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.score-value {
  font-size: 48px;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: #666;
  margin-top: 4px;
}

/* 평가 섹션 */
.evaluation-section {
  margin-bottom: 40px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.pronunciation-overview {
  margin-bottom: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-label {
  color: #666;
}

.stat-value {
  font-weight: 600;
  color: #333;
}

.turn-scores {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  height: 100px;
  padding: 16px 0;
}

.turn-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.turn-label {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.difficult-words {
  margin-top: 20px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
}

.word-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.word-tag {
  padding: 6px 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 16px;
  font-size: 13px;
}

/* 스킬 평가 */
.skill-breakdown {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.skill-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.skill-name {
  font-weight: 500;
}

.skill-score {
  font-weight: 600;
  color: #667eea;
}

.skill-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.skill-progress {
  height: 100%;
  transition: width 0.5s ease;
}

.skill-comment {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 추천 사항 */
.recommendations {
  display: grid;
  gap: 16px;
}

.recommendation-card {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-card.priority-high {
  border-left-color: #f44336;
}

.recommendation-card.priority-medium {
  border-left-color: #ffc107;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rec-area {
  font-weight: 600;
  color: #333;
}

.rec-priority-badge {
  padding: 4px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
}

.rec-content {
  color: #666;
  margin-bottom: 12px;
}

.rec-exercises {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.exercise-tag {
  padding: 4px 8px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 4px;
  font-size: 12px;
}

/* 피드백 */
.overall-feedback {
  background: white;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.6;
}

.corrections {
  margin-top: 20px;
}

.correction-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.correction-item {
  background: #fff9c4;
  padding: 12px;
  border-radius: 8px;
}

.correction-content {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.original {
  color: #d32f2f;
  text-decoration: line-through;
}

.arrow {
  color: #999;
}

.corrected {
  color: #388e3c;
  font-weight: 600;
}

.correction-explanation {
  font-size: 13px;
  color: #666;
  margin: 0;
}

/* 액션 버튼 */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 32px;
}

/* 트랜지션 */
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s ease;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 반응형 */
@media (max-width: 768px) {
  .speaking-test-content {
    padding: 12px;
  }

  /* 모바일에서 카테고리/결과 화면일 때 - AppHeader 있음 */
  .speaking-test-page:has(.app-header) .speaking-test-content {
    min-height: calc(100vh - 56px - 56px);
  }

  /* 모바일에서 대화/연습 화면일 때 - AppHeader 없음 */
  .speaking-test-page:not(:has(.app-header)) .speaking-test-content {
    min-height: calc(100vh - 56px);
  }

  .category-section {
    padding: 8px;
  }

  .conversation-section {
    padding: 0;
    height: 100%;
  }

  .practice-section {
    height: 100%;
    border-radius: 12px;
  }

  .conversation-area {
    padding: 12px;
  }

  .messages-container {
    padding: 8px;
  }

  .practice-header {
    padding: 12px;
  }

  .input-section {
    padding: 12px;
  }

  .message-content {
    max-width: 85%;
  }

  .message-bubble {
    padding: 10px 14px;
    font-size: 14px;
  }

  .suggestion-chips-container {
    margin: 0 0 12px;
    padding: 10px 12px;
  }

  .suggestion-label {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .suggestion-chip {
    padding: 8px 14px;
    font-size: 13px;
  }

  .text-input {
    font-size: 14px;
    padding: 10px 16px;
  }

  .mic-button,
  .send-button {
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
  }

  /* 입력 컨테이너 간격 조정 */
  .input-container {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .speaking-test-content {
    padding: 8px;
  }

  .practice-section {
    border-radius: 8px;
  }

  .conversation-area {
    padding: 8px;
  }

  .practice-header {
    padding: 10px;
  }

  .input-section {
    padding: 10px;
  }

  .skill-breakdown {
    gap: 16px;
  }

  .turn-scores {
    height: 80px;
  }

  /* 모바일에서 버튼 더 크게 */
  .mic-button,
  .send-button {
    width: 56px;
    height: 56px;
    min-width: 56px;
    min-height: 56px;
  }

  /* SVG 아이콘도 크게 */
  .mic-button svg,
  .send-button svg {
    width: 26px;
    height: 26px;
  }
}
</style>