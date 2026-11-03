<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import ChatMessage from '@/components/common/ChatMessage.vue'
import ChatInput from '@/components/common/ChatInput.vue'
import gsap from 'gsap'

const { t } = useI18n()

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  difficulty: {
    type: String,
    default: 'beginner'
  }
})

const emit = defineEmits(['back', 'complete'])

// State
const sessionId = ref('')
const messages = ref([])
const userInput = ref('')
const isRecording = ref(false)
const isLoading = ref(false)
const turnCount = ref(0)
const recognition = ref(null)
const messagesContainer = ref(null)
const isSessionComplete = ref(false)
const isEvaluating = ref(false)
const hasEvaluationResult = ref(false)
const suggestedResponses = ref([]) // AI가 제안하는 응답
const currentAudio = ref(null) // 현재 재생 중인 오디오
const playingMessageIndex = ref(-1) // 재생 중인 메시지 인덱스
const chatInputRef = ref(null) // ChatInput 컴포넌트 ref

// 음성 인식 초기화
const initSpeechRecognition = () => {
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition.value = new SpeechRecognition()
    recognition.value.lang = 'ko-KR'
    recognition.value.continuous = false
    recognition.value.interimResults = true
    recognition.value.maxAlternatives = 1

    recognition.value.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('')

      userInput.value = transcript
    }

    recognition.value.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isRecording.value = false
    }

    recognition.value.onend = () => {
      isRecording.value = false
      if (userInput.value.trim()) {
        sendMessage()
      }
    }
  }
}

// 대화 시작
const startConversation = async () => {
  isLoading.value = true

  try {
    const response = await axios.post('/api/speaking-practice/sessions/start', {
      category: props.category.id,
      difficulty: props.difficulty
    })

    if (response.data.success) {
      sessionId.value = response.data.sessionId
      turnCount.value = response.data.turnCount

      // AI 첫 메시지 추가
      messages.value.push({
        type: 'ai',
        content: response.data.message,
        timestamp: new Date()
      })

      // 제안 응답 업데이트
      if (response.data.suggestedResponses && response.data.suggestedResponses.length > 0) {
        suggestedResponses.value = response.data.suggestedResponses
      }

      await scrollToBottom()

      // 입력창 자동 포커스
      await nextTick()
      if (chatInputRef.value) {
        chatInputRef.value.focus()
      }
    }
  } catch (error) {
    console.error('Error starting conversation:', error)
    messages.value.push({
      type: 'system',
      content: t('categoryConversation.errors.startFailed'),
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}

// 메시지 전송
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value || !sessionId.value) return

  const messageText = userInput.value
  userInput.value = ''

  // 사용자 메시지 추가
  messages.value.push({
    type: 'user',
    content: messageText,
    timestamp: new Date()
  })

  await scrollToBottom()
  isLoading.value = true

  try {
    const response = await axios.post(`/api/speaking-practice/sessions/${sessionId.value}/respond`, {
      userMessage: messageText
    })

    if (response.data.success) {
      turnCount.value = response.data.turnCount

      // AI 응답 추가
      messages.value.push({
        type: 'ai',
        content: response.data.message,
        timestamp: new Date()
      })

      // 제안 응답 업데이트
      if (response.data.suggestedResponses && response.data.suggestedResponses.length > 0) {
        suggestedResponses.value = response.data.suggestedResponses
      } else {
        suggestedResponses.value = []
      }

      await scrollToBottom()

      // 대화 완료 체크
      if (response.data.isComplete) {
        isSessionComplete.value = true
        suggestedResponses.value = [] // 완료 시 제안 제거
        await analyzeConversation()
      } else {
        // 대화가 계속되면 입력창 자동 포커스
        await nextTick()
        if (chatInputRef.value) {
          chatInputRef.value.focus()
        }
      }
    }
  } catch (error) {
    console.error('Error sending message:', error)
    messages.value.push({
      type: 'system',
      content: t('categoryConversation.errors.sendFailed'),
      timestamp: new Date()
    })
  } finally {
    isLoading.value = false
  }
}

// 대화 분석
const analyzeConversation = async () => {
  isEvaluating.value = true

  try {
    const response = await axios.post(`/api/speaking-practice/sessions/${sessionId.value}/analyze`)

    if (response.data.success) {
      const analysis = response.data.analysis

      // 피드백 메시지 추가
      messages.value.push({
        type: 'feedback',
        content: analysis,
        timestamp: new Date()
      })

      hasEvaluationResult.value = true

      // 평가 결과 나온 후 상단으로 스크롤
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 100)
    }
  } catch (error) {
    console.error('Error analyzing conversation:', error)
    messages.value.push({
      type: 'system',
      content: t('categoryConversation.errors.evaluationFailed'),
      timestamp: new Date()
    })
  } finally {
    isEvaluating.value = false
  }
}

// 음성 녹음 토글
const toggleRecording = () => {
  if (!recognition.value) return

  if (isRecording.value) {
    recognition.value.stop()
    isRecording.value = false
  } else {
    userInput.value = ''
    recognition.value.start()
    isRecording.value = true
  }
}

// 스크롤 최하단으로 이동
const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 제안 응답 선택 (자동 전송)
const selectSuggestion = async (suggestion) => {
  userInput.value = suggestion
  // 바로 전송
  await sendMessage()
}

// TTS 재생
const playTTS = async (text, messageIndex) => {
  try {
    // 이미 재생 중인 오디오가 있으면 중지
    if (currentAudio.value) {
      currentAudio.value.pause()
      currentAudio.value = null
      playingMessageIndex.value = -1
    }

    // 같은 메시지를 다시 클릭하면 중지
    if (playingMessageIndex.value === messageIndex) {
      return
    }

    playingMessageIndex.value = messageIndex

    // TTS API 호출
    const response = await axios.post('/api/speaking-practice/tts',
      { text },
      {
        responseType: 'blob' // 오디오 데이터를 blob으로 받음
      }
    )

    // Blob을 오디오로 재생
    const audioBlob = new Blob([response.data], { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    currentAudio.value = audio

    audio.onended = () => {
      playingMessageIndex.value = -1
      currentAudio.value = null
      URL.revokeObjectURL(audioUrl)
    }

    audio.onerror = () => {
      playingMessageIndex.value = -1
      currentAudio.value = null
      URL.revokeObjectURL(audioUrl)
      console.error('오디오 재생 오류')
    }

    await audio.play()
  } catch (error) {
    console.error('TTS 재생 오류:', error)
    playingMessageIndex.value = -1
  }
}


onMounted(() => {
  // 대화 화면 진입 시 스크롤 상단으로 이동
  window.scrollTo({ top: 0, behavior: 'instant' })

  initSpeechRecognition()
  startConversation()

  // 애니메이션
  gsap.fromTo('.conversation-header',
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )
})

onBeforeUnmount(() => {
  if (recognition.value) {
    recognition.value.stop()
  }
})
</script>

<template>
  <div class="category-conversation">
    <div class="conversation-header">
      <button class="back-button" @click="$emit('back')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>

      <div class="header-info">
        <div class="category-badge">
          <span class="badge-icon">{{ category.icon }}</span>
          <span class="badge-text">{{ category.name }}</span>
        </div>
        <div class="turn-counter">{{ t('categoryConversation.progress.turn', { current: turnCount }) }}</div>
      </div>
    </div>

    <div class="conversation-container">
      <div ref="messagesContainer" class="messages-area">
        <div v-if="isLoading && messages.length === 0" class="loading-initial">
          <div class="common-loading"></div>
          <p class="common-body2 text-secondary">{{ t('categoryConversation.loading.preparing') }}</p>
        </div>

        <div
          v-for="(message, index) in messages"
          :key="index"
          class="message-wrapper"
        >
          <ChatMessage
            :message="message"
            :type="message.type"
          />
          <!-- AI 메시지에만 TTS 버튼 표시 -->
          <button
            v-if="message.type === 'ai'"
            @click="playTTS(message.content, index)"
            class="tts-button"
            :class="{ 'playing': playingMessageIndex === index }"
            :aria-label="playingMessageIndex === index ? 'Stop playback' : 'Play audio'"
          >
            <svg v-if="playingMessageIndex !== index" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          </button>
        </div>

        <div v-if="isLoading && messages.length > 0" class="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- 제안 응답 Chip (입력창 위) -->
      <div v-if="!isSessionComplete && suggestedResponses.length > 0" class="suggestion-chips-area">
        <p class="suggestion-label">{{ t('categoryConversation.suggestions.label') }}</p>
        <div class="suggestion-chips">
          <button
            v-for="(suggestion, index) in suggestedResponses.slice(0, 3)"
            :key="index"
            class="suggestion-chip"
            @click="selectSuggestion(suggestion)"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <ChatInput
        ref="chatInputRef"
        v-if="!isSessionComplete"
        v-model="userInput"
        :disabled="isLoading || isEvaluating"
        :is-recording="isRecording"
        @send="sendMessage"
        @toggle-voice="toggleRecording"
      />

      <div v-if="isSessionComplete && hasEvaluationResult" class="completion-area">
        <CommonButton
          variant="primary"
          size="large"
          @click="$emit('complete')"
          :fullWidth="true"
        >
          {{ t('categoryConversation.completion.button') }}
        </CommonButton>
      </div>
    </div>

    <!-- 평가 중 로딩 다이얼로그 -->
    <div v-if="isEvaluating" class="evaluation-loading-overlay">
      <div class="evaluation-loading-dialog">
        <div class="loading-animation">
          <div class="loading-circle"></div>
        </div>
        <h3>{{ t('categoryConversation.evaluation.title') }}</h3>
        <p>{{ t('categoryConversation.evaluation.wait') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.category-conversation {
  height: calc(100vh - 104px); /* AppHeader(64px) + SpeakingTest padding(40px) */
  display: flex;
  flex-direction: column;
  background: var(--gray-50);
  position: relative;
  overflow: hidden;
}

.conversation-header {
  background: white;
  padding: 16px 20px;
  border-bottom: none;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.back-button {
  width: 44px;
  height: 44px;
  border: none;
  background: var(--gray-50);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--gray-700);
}

.back-button:hover {
  background: var(--gray-100);
  transform: scale(1.05);
}

.back-button:active {
  transform: scale(0.95);
}

.header-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: var(--common-blue-light);
  border-radius: 100px;
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--common-blue);
}

.turn-counter {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
  background: var(--gray-100);
  padding: 6px 14px;
  border-radius: 100px;
}

.conversation-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 80px;
  min-height: 0;
}

.loading-initial {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  gap: 16px;
}


.typing-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
}

.typing-dots {
  display: flex;
  gap: 4px;
  padding: 8px 16px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.typing-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gray-400);
  animation: typingDot 1.4s infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}


/* 제안 응답 Chip 영역 */
.suggestion-chips-area {
  padding: 12px 16px;
  background: white;
  border-top: 1px solid var(--gray-200);
  animation: slideUpFade 0.3s ease-out;
}

@keyframes slideUpFade {
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
  color: var(--common-blue);
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
  border: 2px solid var(--common-blue);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--common-blue);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(49, 130, 246, 0.1);
}

.suggestion-chip:hover {
  background: var(--common-blue);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(49, 130, 246, 0.2);
}

.suggestion-chip:active {
  transform: translateY(0);
}

.completion-area {
  padding: 20px;
  background: white;
  border-top: 1px solid var(--gray-200);
}

.text-secondary {
  color: var(--gray-600);
}

/* TTS 버튼 */
.message-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.tts-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--common-blue);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.tts-button:hover {
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.05);
}

.tts-button:active {
  transform: scale(0.95);
}

.tts-button.playing {
  background: var(--common-blue);
  color: white;
}

.tts-button.playing:hover {
  background: var(--common-blue-dark, #2563eb);
}

/* 태블릿 */
@media (max-width: 768px) {
  .conversation-header {
    padding: 10px 12px;
  }

  .back-button {
    width: 36px;
    height: 36px;
  }

  .category-badge {
    padding: 4px 10px;
  }

  .badge-icon {
    font-size: 16px;
  }

  .badge-text {
    font-size: 12px;
  }

  .turn-counter {
    font-size: 12px;
  }

  .messages-area {
    padding: 12px;
  }

  .completion-area {
    padding: 12px;
  }

  .suggestion-chips-area {
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
}

/* 모바일 */
@media (max-width: 480px) {
  .category-conversation {
    height: calc(100vh - 88px); /* AppHeader(56px) + SpeakingTest padding(16px*2) */
    height: calc(100dvh - 88px); /* Dynamic viewport height for mobile */
  }

  .conversation-header {
    padding: 8px 12px;
  }

  .messages-area {
    padding: 8px;
    padding-bottom: 100px;
  }

  .loading-initial {
    height: 150px;
  }
}

/* 평가 로딩 다이얼로그 */
.evaluation-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.evaluation-loading-dialog {
  background: white;
  border-radius: 16px;
  padding: 40px 32px;
  max-width: 300px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.loading-animation {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.loading-circle {
  width: 48px;
  height: 48px;
  border: 4px solid var(--gray-200);
  border-top: 4px solid var(--primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.evaluation-loading-dialog h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 8px 0;
}

.evaluation-loading-dialog p {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
}
</style>