<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Props from route
const category = ref(route.params.category) // 'beginner', 'intermediate', 'advanced'
const questions = ref([])
const currentQuestionIndex = ref(0)
const answers = ref({}) // { questionIndex: selectedOptionIndex }
const score = ref(0)

// 카테고리 정보
const categoryInfo = {
  beginner: {
    name: '초급',
    icon: '🌱',
    color: '#3182F6',
    bgColor: '#EFF6FF'
  },
  intermediate: {
    name: '중급',
    icon: '🌿',
    color: '#10b981',
    bgColor: '#F0FDF4'
  },
  advanced: {
    name: '상급',
    icon: '🌳',
    color: '#f59e0b',
    bgColor: '#FFFBEB'
  }
}

const currentCategoryInfo = computed(() => {
  return categoryInfo[category.value] || categoryInfo.beginner
})

// 현재 문제
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

// 진행률
const progress = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((currentQuestionIndex.value / questions.value.length) * 100)
})

// 오답 문제 가져오기
const fetchWrongAnswers = async () => {
  try {
    const response = await axios.get('/api/wrong-answers/list', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      params: {
        category: category.value,
        isReviewed: 'false'
      }
    })

    questions.value = response.data.wrongAnswers
    console.log('🎯 복습 테스트 시작:', {
      category: category.value,
      totalQuestions: questions.value.length,
      questions: questions.value.map((q, i) => ({
        index: i,
        id: q.id,
        question: q.question.substring(0, 30) + '...',
        hasOptions: !!q.options,
        optionsCount: q.options?.length
      }))
    })

    if (questions.value.length === 0) {
      alert('복습할 문제가 없습니다.')
      router.push({ name: 'wrong-answers' })
    }
  } catch (error) {
    console.error('❌ 오답 문제 조회 실패:', error)
    alert('문제를 불러오는데 실패했습니다.')
    router.push({ name: 'wrong-answers' })
  }
}

// 답안 선택
const selectAnswer = async (optionIndex) => {
  // 이미 답변한 문제는 다시 선택 불가
  if (answers.value[currentQuestionIndex.value] !== undefined) return

  const question = currentQuestion.value
  answers.value[currentQuestionIndex.value] = optionIndex

  // 정답 체크
  const isCorrect = question.correctAnswer === question.options[optionIndex]

  console.log('📝 답안 제출:', {
    questionIndex: currentQuestionIndex.value,
    questionId: question.id,
    selectedOption: optionIndex,
    selectedAnswer: question.options[optionIndex],
    correctAnswer: question.correctAnswer,
    isCorrect
  })

  if (isCorrect) {
    score.value++

    // 맞춘 문제는 오답 노트에서 삭제
    try {
      await axios.delete(`/api/wrong-answers/${question.id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log(`✅ 오답 삭제 성공 - Question ID: ${question.id}`)
    } catch (error) {
      console.error('❌ 오답 삭제 실패:', error)
    }
  }

  // 1.5초 후 다음 문제로 이동 (답변 피드백 시간)
  setTimeout(() => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
      // 스크롤 맨 위로
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // 모든 문제 완료 - 오답 노트 목록으로 이동
      completeTest()
    }
  }, 1500)
}

// 테스트 완료 - 오답 노트 목록으로 이동
const completeTest = () => {
  // 완료 메시지 표시 후 오답 노트로 이동
  setTimeout(() => {
    alert('모든 문제를 다 풀었습니다! 오답 노트로 돌아갑니다.')
    router.push({ name: 'wrong-answers' })
  }, 500)
}

// 목록으로 돌아가기
const goBack = () => {
  router.push({ name: 'wrong-answers' })
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  fetchWrongAnswers()
})
</script>

<template>
  <div class="common-page">
    <AppHeader />

    <div class="common-container-md">
      <!-- 테스트 진행 중 -->
      <div v-if="currentQuestion" class="test-screen">
        <!-- 헤더 -->
        <div class="test-header">
          <div class="header-top">
            <CommonButton variant="ghost" @click="goBack">
              ← 나가기
            </CommonButton>
            <div class="category-badge" :style="{ backgroundColor: currentCategoryInfo.bgColor, color: currentCategoryInfo.color }">
              {{ currentCategoryInfo.icon }} {{ currentCategoryInfo.name }}
            </div>
          </div>

          <div class="progress-section">
            <div class="progress-text">
              <span class="current">{{ currentQuestionIndex + 1 }}</span>
              <span class="divider">/</span>
              <span class="total">{{ questions.length }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
          </div>

          <div class="score-info">
            현재 점수: <strong>{{ score }}</strong>
          </div>
        </div>

        <!-- 문제 -->
        <CommonCard class="question-card">
          <h2 class="question-title">{{ currentQuestion.question }}</h2>

          <!-- 선택지 -->
          <div class="options-list">
            <button
              v-for="(option, index) in currentQuestion.options"
              :key="index"
              class="option-button"
              :class="{
                'selected': answers[currentQuestionIndex] === index,
                'correct': answers[currentQuestionIndex] === index && currentQuestion.correctAnswer === option,
                'incorrect': answers[currentQuestionIndex] === index && currentQuestion.correctAnswer !== option
              }"
              :disabled="answers[currentQuestionIndex] !== undefined"
              @click="selectAnswer(index)"
            >
              <span class="option-number">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
              <span v-if="answers[currentQuestionIndex] === index && currentQuestion.correctAnswer === option" class="check-icon">✓</span>
              <span v-if="answers[currentQuestionIndex] === index && currentQuestion.correctAnswer !== option" class="x-icon">✗</span>
            </button>
          </div>

          <!-- 정답 설명 -->
          <div v-if="answers[currentQuestionIndex] !== undefined" class="feedback-section">
            <div v-if="currentQuestion.correctAnswer === currentQuestion.options[answers[currentQuestionIndex]]" class="feedback correct">
              <span class="feedback-icon">🎉</span>
              <span class="feedback-text">정답입니다!</span>
            </div>
            <div v-else class="feedback incorrect">
              <span class="feedback-icon">😅</span>
              <span class="feedback-text">정답: {{ currentQuestion.correctAnswer }}</span>
            </div>

            <div v-if="currentQuestion.explanation" class="explanation">
              <div class="explanation-header">💡 해설</div>
              <p class="explanation-text">{{ currentQuestion.explanation }}</p>
              <p v-if="currentQuestion.explanationEn" class="explanation-text-en">{{ currentQuestion.explanationEn }}</p>
            </div>
          </div>
        </CommonCard>
      </div>

      <!-- 로딩 중 -->
      <div v-else class="loading-screen">
        <div class="loading-spinner">⏳</div>
        <p>문제를 불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.common-page {
  min-height: 100vh;
  background: #f9fafb;
  padding-bottom: 60px;
}

.common-container-md {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* 테스트 화면 */
.test-screen {
  animation: fadeIn 0.3s ease;
}

.test-header {
  margin-bottom: var(--spacing-lg);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.category-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.progress-section {
  margin-bottom: var(--spacing-sm);
}

.progress-text {
  text-align: center;
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
  color: #6b7280;
}

.current {
  font-size: 24px;
  font-weight: 700;
  color: #3182F6;
}

.divider {
  margin: 0 8px;
}

.total {
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3182F6 0%, #60a5fa 100%);
  transition: width 0.3s ease;
}

.score-info {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  margin-top: var(--spacing-sm);
}

.score-info strong {
  color: #3182F6;
  font-size: 18px;
}

/* 문제 카드 */
.question-card {
  padding: var(--spacing-xl);
}

.question-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: var(--spacing-lg);
}

.option-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  text-align: left;
}

.option-button:hover:not(:disabled) {
  border-color: #3182F6;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.15);
}

.option-button:disabled {
  cursor: not-allowed;
}

.option-button.selected {
  background: #f0f9ff;
}

.option-button.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-button.incorrect {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  font-weight: 700;
  color: #6b7280;
  flex-shrink: 0;
}

.option-button.correct .option-number {
  background: #10b981;
  color: white;
}

.option-button.incorrect .option-number {
  background: #ef4444;
  color: white;
}

.option-text {
  flex: 1;
  color: #374151;
}

.check-icon,
.x-icon {
  font-size: 24px;
  font-weight: 700;
  flex-shrink: 0;
}

.check-icon {
  color: #10b981;
}

.x-icon {
  color: #ef4444;
}

/* 피드백 */
.feedback-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid #e5e7eb;
}

.feedback {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: var(--spacing-md);
}

.feedback.correct {
  background: #d1fae5;
  color: #065f46;
}

.feedback.incorrect {
  background: #fee2e2;
  color: #991b1b;
}

.feedback-icon {
  font-size: 24px;
}

.feedback-text {
  font-size: 16px;
  font-weight: 600;
}

.explanation {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: var(--spacing-md);
}

.explanation-header {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
}

.explanation-text {
  font-size: 14px;
  color: #78350f;
  margin: 0;
  line-height: 1.7;
}

.explanation-text-vi {
  font-size: 13px;
  color: #92400e;
  margin: 10px 0 0 0;
  font-style: italic;
  line-height: 1.6;
}

/* 결과 화면 */
.result-screen {
  animation: fadeIn 0.5s ease;
}

.result-card {
  padding: var(--spacing-2xl);
  text-align: center;
}

.result-header {
  margin-bottom: var(--spacing-xl);
}

.result-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-md);
}

.result-subtitle {
  color: #6b7280;
  margin-top: var(--spacing-sm);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  padding: var(--spacing-md);
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item.highlight {
  background: #eff6ff;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-value.passed {
  color: #10b981;
}

.stat-value.failed {
  color: #ef4444;
}

.result-message {
  padding: var(--spacing-lg);
  border-radius: 12px;
  margin-bottom: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.result-message.passed {
  background: #d1fae5;
}

.result-message.failed {
  background: #fee2e2;
}

.message-icon {
  font-size: 48px;
}

.message-text {
  text-align: left;
  flex: 1;
}

.message-text strong {
  display: block;
  font-size: 18px;
  margin-bottom: 8px;
}

.message-text p {
  margin: 0;
  color: #6b7280;
}

.result-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.result-actions .common-button {
  min-width: 150px;
}

/* 로딩 화면 */
.loading-screen {
  text-align: center;
  padding: var(--spacing-2xl);
  color: #6b7280;
}

.loading-spinner {
  font-size: 48px;
  margin-bottom: var(--spacing-md);
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 반응형 */
@media (max-width: 768px) {
  .question-title {
    font-size: 18px;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-direction: column;
  }

  .result-actions .common-button {
    width: 100%;
  }
}
</style>
