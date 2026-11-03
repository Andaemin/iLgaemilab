<script setup>
import { computed, onMounted, watch } from 'vue'
import gsap from 'gsap'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  },
  currentDialogue: {
    type: Object,
    required: true
  },
  dialogueIndex: {
    type: Number,
    required: true
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  evaluationResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['play', 'record', 'next', 'retry', 'end'])

const progress = computed(() => {
  if (!props.scenario.dialogues) return 0
  return ((props.dialogueIndex + 1) / props.scenario.dialogues.length) * 100
})

const getScoreColor = (score) => {
  if (score >= 85) return 'var(--success)'
  if (score >= 70) return 'var(--common-blue)'
  if (score >= 50) return 'var(--warning)'
  return 'var(--danger)'
}

const getScoreLabel = (score) => {
  if (score >= 85) return '완벽해요!'
  if (score >= 70) return '잘했어요!'
  if (score >= 50) return '조금 더 연습해요'
  return '다시 해보세요'
}

// 대화 변경 시 애니메이션
watch(() => props.dialogueIndex, (newIndex, oldIndex) => {
  if (newIndex > oldIndex) {
    gsap.fromTo('.dialogue-content',
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
    )
  }
})

// 녹음 애니메이션
watch(() => props.isRecording, (isRecording) => {
  if (isRecording) {
    gsap.to('.record-button', {
      scale: 1.05,
      duration: 0.5,
      repeat: -1,
      yoyo: true,
      ease: 'power2.inOut'
    })
  } else {
    gsap.killTweensOf('.record-button')
    gsap.set('.record-button', { scale: 1 })
  }
})

onMounted(() => {
  // 진입 애니메이션
  gsap.timeline()
    .fromTo('.practice-header',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5 }
    )
    .fromTo('.dialogue-section',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    )
})
</script>

<template>
  <div class="practice-session">
    <!-- 헤더 -->
    <div class="practice-header">
      <div class="header-top">
        <button class="close-button" @click="$emit('end')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h3 class="common-title4">{{ scenario.titleKo }}</h3>
        <div class="spacer"></div>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <span class="progress-text common-caption">
          {{ dialogueIndex + 1 }} / {{ scenario.dialogues?.length || 0 }}
        </span>
      </div>
    </div>

    <!-- 대화 섹션 -->
    <div class="dialogue-section">
      <CommonCard class="dialogue-card">
        <div class="dialogue-content">
          <div class="speaker-info">
            <div class="speaker-avatar">
              <span>{{ currentDialogue.role === 'foreman' ? '👷' : '👤' }}</span>
            </div>
            <span class="speaker-name common-caption">{{ currentDialogue.speaker }}</span>
          </div>

          <div class="dialogue-text">
            <p class="korean-text common-title2">{{ currentDialogue.text }}</p>
            <p class="romanization common-body2">{{ currentDialogue.romanization }}</p>
          </div>

          <button class="play-button" @click="$emit('play')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 7L13 10L8 13V7Z" fill="currentColor"/>
            </svg>
            <span>다시 듣기</span>
          </button>
        </div>
      </CommonCard>

      <!-- 예상 응답 -->
      <div v-if="currentDialogue.expectedResponses" class="expected-responses">
        <h4 class="common-title5">이렇게 대답해보세요</h4>
        <CommonCard
          v-for="(response, index) in currentDialogue.expectedResponses"
          :key="index"
          class="response-card"
        >
          <p class="response-text common-body2">{{ response.text }}</p>
          <p class="response-translation common-caption">{{ response.translation }}</p>
        </CommonCard>
      </div>
    </div>

    <!-- 녹음 섹션 -->
    <div class="recording-section">
      <div v-if="!evaluationResult" class="record-controls">
        <button
          class="record-button"
          :class="{ recording: isRecording }"
          @click="$emit('record')"
        >
          <div class="record-icon">
            <svg v-if="!isRecording" width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" stroke-width="2"/>
              <circle cx="16" cy="16" r="6" fill="currentColor"/>
            </svg>
            <svg v-else width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="10" y="10" width="12" height="12" rx="2" fill="currentColor"/>
            </svg>
          </div>
          <span class="record-text common-body1">
            {{ isRecording ? '녹음 중지' : '녹음 시작' }}
          </span>
        </button>

        <p v-if="isRecording" class="recording-hint common-caption">
          마이크에 대고 천천히 또박또박 말해주세요
        </p>
      </div>

      <!-- 평가 결과 -->
      <div v-else class="evaluation-section">
        <CommonCard class="score-card">
          <div class="score-display">
            <div class="score-circle" :style="{ borderColor: getScoreColor(evaluationResult.score) }">
              <span class="score-value">{{ evaluationResult.score }}</span>
              <span class="score-label">점</span>
            </div>
            <div class="score-info">
              <h4 class="common-title4" :style="{ color: getScoreColor(evaluationResult.score) }">
                {{ getScoreLabel(evaluationResult.score) }}
              </h4>
              <p class="common-body2 text-secondary">
                {{ evaluationResult.suggestions?.[0]?.message || '계속 연습하세요!' }}
              </p>
            </div>
          </div>
        </CommonCard>

        <div class="action-buttons">
          <CommonButton variant="secondary" size="large" @click="$emit('retry')">
            다시 시도
          </CommonButton>
          <CommonButton variant="primary" size="large" @click="$emit('next')">
            {{ dialogueIndex < scenario.dialogues.length - 1 ? '다음 대화' : '완료하기' }}
          </CommonButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.practice-session {
  min-height: 100vh;
  background: var(--gray-50);
}

/* 헤더 */
.practice-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  padding: 16px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.spacer {
  width: 40px;
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
  min-width: 50px;
  text-align: right;
}

/* 대화 섹션 */
.dialogue-section {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

.dialogue-card {
  margin-bottom: 20px;
}

.dialogue-content {
  padding: 24px;
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.speaker-avatar {
  width: 48px;
  height: 48px;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.speaker-name {
  color: var(--gray-600);
}

.dialogue-text {
  margin-bottom: 20px;
}

.korean-text {
  margin-bottom: 8px;
  line-height: 1.4;
}

.romanization {
  color: var(--gray-600);
  font-style: italic;
}

.play-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--common-blue);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.play-button:hover {
  background: var(--common-blue-dark);
  transform: translateY(-2px);
}

.play-button:active {
  transform: translateY(0);
}

/* 예상 응답 */
.expected-responses {
  margin-top: 20px;
}

.expected-responses h4 {
  margin-bottom: 12px;
}

.response-card {
  margin-bottom: 8px;
  padding: 16px;
}

.response-text {
  margin-bottom: 4px;
  color: var(--gray-900);
}

.response-translation {
  color: var(--gray-600);
}

/* 녹음 섹션 */
.recording-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid var(--gray-200);
  padding: 20px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
}

.record-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.record-button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: var(--common-blue);
  color: white;
  border: none;
  border-radius: 100px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.record-button:hover {
  background: var(--common-blue-dark);
  transform: scale(1.02);
}

.record-button.recording {
  background: var(--danger);
}

.record-icon svg {
  display: block;
}

.recording-hint {
  color: var(--gray-600);
}

/* 평가 섹션 */
.evaluation-section {
  max-width: 600px;
  margin: 0 auto;
}

.score-card {
  margin-bottom: 20px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
}

.score-circle {
  width: 80px;
  height: 80px;
  border: 4px solid;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 28px;
  font-weight: 700;
}

.score-label {
  font-size: 12px;
  color: var(--gray-600);
}

.score-info {
  flex: 1;
}

.score-info h4 {
  margin-bottom: 4px;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons button {
  flex: 1;
}

.text-secondary {
  color: var(--gray-600);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .dialogue-section {
    padding: 16px;
  }

  .dialogue-content {
    padding: 20px;
  }

  .recording-section {
    padding: 16px;
  }
}
</style>