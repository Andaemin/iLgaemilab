<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    required: true,
    validator: (value) => ['user', 'ai', 'system', 'feedback'].includes(value)
  }
})

// 영어 번역 관련
const showTranslation = ref(false)
const englishTranslation = ref('')
const isTranslating = ref(false)

// 점수 계산 함수들
const getScorePercentage = (score, maxScore) => {
  if (!score || !maxScore) return 0
  return Math.min(Math.max((score / maxScore) * 100, 0), 100)
}

// 영어 번역 함수
const translateToEnglish = async () => {
  if (englishTranslation.value) {
    showTranslation.value = !showTranslation.value
    return
  }

  isTranslating.value = true
  try {
    const response = await axios.post('/api/translate', {
      text: props.message.content,
      targetLanguage: 'English'
    })

    if (response.data.success) {
      englishTranslation.value = response.data.translation
      showTranslation.value = true
    }
  } catch (error) {
    console.error('Translation error:', error)
    englishTranslation.value = 'Translation failed. Please try again.'
    showTranslation.value = true
  } finally {
    isTranslating.value = false
  }
}

const messageClass = computed(() => {
  return `message message-${props.type}`
})
</script>

<template>
  <div :class="messageClass">
    <!-- AI 메시지 -->
    <div v-if="type === 'ai'" class="ai-message">
      <div class="message-avatar">
        <span>🤖</span>
      </div>
      <div class="message-content-wrapper">
        <div class="message-bubble">
          <p>{{ message.content }}</p>

          <!-- 영어 번역 토글 버튼 -->
          <button
            class="translation-toggle"
            @click="translateToEnglish"
            :disabled="isTranslating"
          >
            <span v-if="isTranslating">🔄 Translating...</span>
            <span v-else-if="showTranslation">🇬🇧 Hide translation</span>
            <span v-else>🇬🇧 View in English</span>
          </button>
        </div>

        <!-- 영어 번역 드롭다운 -->
        <transition name="slide">
          <div v-if="showTranslation && englishTranslation" class="translation-box">
            <div class="translation-header">
              <span class="translation-label">🇬🇧 English</span>
            </div>
            <p class="translation-text">{{ englishTranslation }}</p>
          </div>
        </transition>
      </div>
    </div>

    <!-- 사용자 메시지 -->
    <div v-else-if="type === 'user'" class="user-message">
      <div class="message-bubble">
        <p>{{ message.content }}</p>
      </div>
    </div>

    <!-- 시스템 메시지 -->
    <div v-else-if="type === 'system'" class="system-message">
      <p>{{ message.content }}</p>
    </div>

    <!-- 피드백 메시지 -->
    <div v-else-if="type === 'feedback'" class="feedback-message">
      <div class="feedback-card">
        <div class="feedback-header">
          <h3 class="feedback-title">학습 평가 결과</h3>
          <div v-if="message.content.score" class="score-display">
            <span class="score-number">{{ message.content.score }}</span>
            <span class="score-label">점</span>
            <span class="score-grade" :class="`grade-${message.content.grade}`">{{ message.content.grade }}</span>
          </div>
        </div>

        <!-- 점수 상세 내역 -->
        <div v-if="message.content.scoreBreakdown" class="score-breakdown">
          <h4>평가 항목별 점수</h4>
          <div class="score-items">
            <div class="score-item" v-if="message.content.scoreBreakdown.grammar">
              <div class="score-item-header">
                <span>문법 정확성</span>
                <span class="score-value">{{ message.content.scoreBreakdown.grammar.score }}/25</span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="`width: ${getScorePercentage(message.content.scoreBreakdown.grammar.score, 25)}%`"></div>
              </div>
              <p class="score-comment">{{ message.content.scoreBreakdown.grammar.comment }}</p>
            </div>
            <div class="score-item" v-if="message.content.scoreBreakdown.vocabulary">
              <div class="score-item-header">
                <span>어휘 사용</span>
                <span class="score-value">{{ message.content.scoreBreakdown.vocabulary.score }}/20</span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="`width: ${getScorePercentage(message.content.scoreBreakdown.vocabulary.score, 20)}%`"></div>
              </div>
              <p class="score-comment">{{ message.content.scoreBreakdown.vocabulary.comment }}</p>
            </div>
            <div class="score-item" v-if="message.content.scoreBreakdown.communication">
              <div class="score-item-header">
                <span>의사소통</span>
                <span class="score-value">{{ message.content.scoreBreakdown.communication.score }}/20</span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="`width: ${getScorePercentage(message.content.scoreBreakdown.communication.score, 20)}%`"></div>
              </div>
              <p class="score-comment">{{ message.content.scoreBreakdown.communication.comment }}</p>
            </div>
            <div class="score-item" v-if="message.content.scoreBreakdown.fluency">
              <div class="score-item-header">
                <span>유창성</span>
                <span class="score-value">{{ message.content.scoreBreakdown.fluency.score }}/15</span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="`width: ${getScorePercentage(message.content.scoreBreakdown.fluency.score, 15)}%`"></div>
              </div>
              <p class="score-comment">{{ message.content.scoreBreakdown.fluency.comment }}</p>
            </div>
            <div class="score-item" v-if="message.content.scoreBreakdown.appropriateness">
              <div class="score-item-header">
                <span>상황 적절성</span>
                <span class="score-value">{{ message.content.scoreBreakdown.appropriateness.score }}/20</span>
              </div>
              <div class="score-bar">
                <div class="score-fill" :style="`width: ${getScorePercentage(message.content.scoreBreakdown.appropriateness.score, 20)}%`"></div>
              </div>
              <p class="score-comment">{{ message.content.scoreBreakdown.appropriateness.comment }}</p>
            </div>
          </div>
        </div>

        <!-- 구체적인 오류 수정 -->
        <div v-if="message.content.feedback?.specificExamples?.length" class="error-corrections">
          <h4>주요 수정 사항</h4>
          <div class="correction-list">
            <div v-for="(example, i) in message.content.feedback.specificExamples" :key="i" class="correction-item">
              <div class="wrong-text">❌ {{ example.wrong }}</div>
              <div class="correct-text">✅ {{ example.correct }}</div>
              <div class="explanation">💡 {{ example.explanation }}</div>
            </div>
          </div>
        </div>

        <div class="feedback-content">
          <div v-if="message.content.feedback?.strengths" class="feedback-section">
            <h4>잘한 점 ✨</h4>
            <ul>
              <li v-for="(strength, i) in message.content.feedback.strengths" :key="i">{{ strength }}</li>
            </ul>
          </div>
          <div v-if="message.content.feedback?.improvements" class="feedback-section">
            <h4>개선할 점 📝</h4>
            <ul>
              <li v-for="(improvement, i) in message.content.feedback.improvements" :key="i">{{ improvement }}</li>
            </ul>
          </div>
          <div v-if="message.content.feedback?.overallFeedback" class="overall-feedback">
            <p>{{ message.content.feedback.overallFeedback }}</p>
          </div>
          <div v-if="message.content.feedback?.nextStepRecommendation" class="next-step">
            <h4>다음 학습 추천 🎯</h4>
            <p>{{ message.content.feedback.nextStepRecommendation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message {
  margin-bottom: 16px;
  animation: messageSlide 0.3s ease-out;
}

@keyframes messageSlide {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* AI 메시지 */
.ai-message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  background: var(--common-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  box-shadow: 0 2px 8px rgba(49, 130, 246, 0.2);
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.message-content-wrapper {
  max-width: 70%;
}

/* 번역 토글 버튼 */
.translation-toggle {
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--gray-100);
  border: none;
  border-radius: 20px;
  font-size: 13px;
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.translation-toggle:hover:not(:disabled) {
  background: var(--gray-200);
}

.translation-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 영어 번역 박스 */
.translation-box {
  margin-top: 8px;
  padding: 12px;
  background: #F5F5F5;
  border-left: 3px solid #3182f6;
  border-radius: 0 8px 8px 0;
}

.translation-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.translation-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 4px;
}

.translation-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--gray-800);
  margin: 0;
  font-style: italic;
}

/* 슬라이드 애니메이션 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 사용자 메시지 */
.user-message {
  display: flex;
  justify-content: flex-end;
}

/* 메시지 버블 */
.message-bubble {
  max-width: 70%;
  padding: 14px 18px;
  border-radius: 18px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
  transition: all 0.2s ease;
}

.message-bubble:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.user-message .message-bubble {
  background: var(--common-blue);
  color: white;
  border: none;
  font-weight: 600;
}

.message-bubble p {
  margin: 0;
  line-height: 1.5;
  word-break: break-word;
  font-weight: 600;
}

/* 시스템 메시지 */
.system-message {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.system-message p {
  padding: 8px 16px;
  background: var(--gray-100);
  border-radius: 100px;
  font-size: 13px;
  color: var(--gray-600);
  margin: 0;
}

/* 피드백 메시지 */
.feedback-message {
  margin: 20px 0;
}

.feedback-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--gray-200);
  transition: all var(--transition-fast);
}

.feedback-card:hover {
  box-shadow: var(--shadow-lg);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
}

.feedback-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.score-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--gray-50);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.score-number {
  font-size: 36px;
  font-weight: 700;
  color: var(--common-blue);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.score-label {
  font-size: 16px;
  color: var(--gray-600);
  font-weight: 500;
}

.score-grade {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 600;
  margin-left: var(--spacing-sm);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.grade-A { background: var(--success-light); color: var(--success); }
.grade-B { background: var(--common-blue-light); color: var(--common-blue); }
.grade-C { background: var(--warning-light); color: var(--warning); }
.grade-D { background: var(--warning-light); color: var(--warning); }
.grade-F { background: var(--danger-light); color: var(--danger); }

.score-breakdown {
  background: var(--gray-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-lg);
  border: 1px solid var(--gray-200);
}

.score-breakdown h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--spacing-md) 0;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.score-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.score-item {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.score-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-800);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.score-value {
  color: var(--common-blue);
  font-weight: 700;
  font-size: 14px;
}

.score-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-sm);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.score-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--common-blue), var(--common-blue-dark));
  border-radius: var(--radius-sm);
  transition: width 0.5s ease;
}

.score-comment {
  font-size: 12px;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.error-corrections {
  background: var(--warning-light);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-xl);
  border: 1px solid var(--warning-border, #FFE082);
}

.error-corrections h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--spacing-md) 0;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.correction-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.correction-item {
  background: white;
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
}

.wrong-text {
  color: var(--danger);
  font-size: 14px;
  margin-bottom: var(--spacing-xs);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.correct-text {
  color: var(--success);
  font-size: 14px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.explanation {
  color: var(--gray-700);
  font-size: 12px;
  line-height: 1.5;
  margin-top: var(--spacing-xs);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.feedback-content {
  color: var(--gray-700);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.feedback-section {
  margin-bottom: var(--spacing-lg);
  background: var(--gray-50);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-200);
}

.feedback-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 var(--spacing-md) 0;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.feedback-section ul {
  margin: 0;
  padding-left: var(--spacing-lg);
}

.feedback-section li {
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: var(--spacing-xs);
  color: var(--gray-700);
}

.overall-feedback {
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-md);
  border: 1px solid var(--gray-200);
}

.overall-feedback p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: var(--gray-800);
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.next-step {
  background: linear-gradient(135deg, var(--common-blue) 0%, var(--common-blue-dark) 100%);
  color: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  margin-top: var(--spacing-lg);
  border: 1px solid var(--common-blue);
  box-shadow: var(--shadow-md);
}

.next-step h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  color: white;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.next-step p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  color: white;
  font-family: Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }

  .feedback-card {
    padding: var(--spacing-lg);
  }

  .feedback-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .score-display {
    align-self: flex-end;
  }

  .score-breakdown {
    padding: var(--spacing-md);
  }

  .feedback-section {
    padding: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .feedback-card {
    padding: var(--spacing-md);
  }

  .feedback-title {
    font-size: 18px;
  }

  .score-number {
    font-size: 28px;
  }

  .feedback-section h4 {
    font-size: 15px;
  }

  .next-step h4 {
    font-size: 15px;
  }
}
</style>