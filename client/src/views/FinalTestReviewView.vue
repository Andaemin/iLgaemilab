<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 라우트 쿼리에서 데이터 가져오기
const category = ref(route.query.category || 'beginner')
const score = ref(parseInt(route.query.score) || 0)
const totalQuestions = ref(parseInt(route.query.total) || 0)

// 세션 스토리지에서 문제 및 답변 데이터 가져오기
const questions = ref([])
const answers = ref({})

// 필터 상태
const reviewFilter = ref('all') // 'all', 'wrong', 'correct'

// 카테고리 정보
const categoryInfo = {
  beginner: {
    title: '초급',
    icon: '🌱',
    color: '#3182F6'
  },
  intermediate: {
    title: '중급',
    icon: '🌿',
    color: '#3182F6'
  },
  advanced: {
    title: '상급',
    icon: '🌳',
    color: '#3182F6'
  }
}

// 현재 카테고리 정보
const currentCategoryInfo = computed(() => {
  return categoryInfo[category.value] || categoryInfo.beginner
})

// 정답률
const accuracy = computed(() => {
  if (totalQuestions.value === 0) return 0
  return Math.round((score.value / totalQuestions.value) * 100)
})

// 통과 여부 (80% 이상)
const isPassed = computed(() => {
  return accuracy.value >= 80
})

// 틀린 문제 수
const wrongCount = computed(() => {
  return totalQuestions.value - score.value
})

// 필터링된 문제 목록
const filteredQuestions = computed(() => {
  const questionsWithIndex = questions.value.map((q, index) => ({
    ...q,
    originalIndex: index
  }))

  if (reviewFilter.value === 'wrong') {
    return questionsWithIndex.filter(q => answers.value[q.originalIndex] !== q.correctAnswer)
  } else if (reviewFilter.value === 'correct') {
    return questionsWithIndex.filter(q => answers.value[q.originalIndex] === q.correctAnswer)
  }
  return questionsWithIndex
})

// 결과 화면으로 돌아가기
const goBackToResult = () => {
  router.push({
    name: 'final-test',
    params: { category: category.value },
    query: {
      showResult: 'true',
      score: score.value,
      total: totalQuestions.value
    }
  })
}

// 학습 페이지로 돌아가기
const goBackToLearn = () => {
  // 세션 스토리지 정리
  sessionStorage.removeItem('finalTestQuestions')
  sessionStorage.removeItem('finalTestAnswers')
  router.push({ name: 'learn' })
}

onMounted(() => {
  // 세션 스토리지에서 데이터 로드
  const savedQuestions = sessionStorage.getItem('finalTestQuestions')
  const savedAnswers = sessionStorage.getItem('finalTestAnswers')

  if (savedQuestions && savedAnswers) {
    questions.value = JSON.parse(savedQuestions)
    answers.value = JSON.parse(savedAnswers)
  } else {
    // 데이터가 없으면 학습 페이지로 리다이렉트
    alert('해설 데이터를 찾을 수 없습니다.')
    router.push({ name: 'learn' })
  }
})
</script>

<template>
  <div class="common-page">
    <AppHeader />

    <div class="common-container-md">
      <div class="review-page">
        <!-- 헤더 -->
        <div class="review-page-header">
          <button class="back-button" @click="goBackToResult">
            <span class="back-icon">←</span>
            <span>돌아가기</span>
          </button>

          <div class="header-title">
            <span class="category-icon">{{ currentCategoryInfo.icon }}</span>
            <h1>{{ currentCategoryInfo.title }} 마무리 테스트 해설</h1>
          </div>

          <div class="header-stats">
            <div class="stat-badge" :class="{ 'passed': isPassed, 'failed': !isPassed }">
              {{ isPassed ? '합격' : '불합격' }} · {{ accuracy }}%
            </div>
            <div class="stat-detail">
              {{ score }} / {{ totalQuestions }} 정답
            </div>
          </div>
        </div>

        <CommonCard class="review-card">
          <!-- 필터 탭 -->
          <div class="review-filter-section">
            <div class="review-tabs">
              <button
                class="review-tab"
                :class="{ active: reviewFilter === 'all' }"
                @click="reviewFilter = 'all'"
              >
                전체 ({{ questions.length }})
              </button>
              <button
                class="review-tab"
                :class="{ active: reviewFilter === 'wrong' }"
                @click="reviewFilter = 'wrong'"
              >
                틀린 문제 ({{ wrongCount }})
              </button>
              <button
                class="review-tab"
                :class="{ active: reviewFilter === 'correct' }"
                @click="reviewFilter = 'correct'"
              >
                맞은 문제 ({{ score }})
              </button>
            </div>
          </div>

          <!-- 문제 목록 -->
          <div class="review-list">
            <div
              v-for="(question, index) in filteredQuestions"
              :key="index"
              class="review-item"
              :class="{
                'correct': answers[question.originalIndex] === question.correctAnswer,
                'wrong': answers[question.originalIndex] !== question.correctAnswer
              }"
            >
              <div class="review-item-header">
                <span class="question-number">문제 {{ question.originalIndex + 1 }}</span>
                <span
                  class="result-badge"
                  :class="{
                    'correct': answers[question.originalIndex] === question.correctAnswer,
                    'wrong': answers[question.originalIndex] !== question.correctAnswer
                  }"
                >
                  {{ answers[question.originalIndex] === question.correctAnswer ? '✅ 정답' : '❌ 오답' }}
                </span>
              </div>

              <p class="review-question-text">{{ question.question }}</p>
              <p v-if="question.questionVi" class="review-question-vi">{{ question.questionVi }}</p>

              <!-- 선택지 표시 -->
              <div class="review-options">
                <div
                  v-for="(option, optionIndex) in question.options"
                  :key="optionIndex"
                  class="review-option"
                  :class="{
                    'user-selected': answers[question.originalIndex] === optionIndex,
                    'correct-answer': question.correctAnswer === optionIndex,
                    'wrong-selected': answers[question.originalIndex] === optionIndex && question.correctAnswer !== optionIndex
                  }"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + optionIndex) }}</span>
                  <span class="option-content">{{ option }}</span>
                  <span v-if="question.correctAnswer === optionIndex" class="option-tag correct">정답</span>
                  <span v-if="answers[question.originalIndex] === optionIndex && question.correctAnswer !== optionIndex" class="option-tag wrong">내 답</span>
                </div>
              </div>

              <!-- 해설 -->
              <div class="review-explanation" v-if="question.explanation || question.explanationVi">
                <div class="explanation-header">
                  <span class="explanation-icon">💡</span>
                  <span class="explanation-title">해설</span>
                </div>
                <p class="explanation-text">{{ question.explanation }}</p>
                <p v-if="question.explanationVi" class="explanation-text-vi">{{ question.explanationVi }}</p>
              </div>
            </div>

            <!-- 필터된 결과가 없을 때 -->
            <div v-if="filteredQuestions.length === 0" class="no-results">
              <span class="no-results-icon">📭</span>
              <p>{{ reviewFilter === 'wrong' ? '틀린 문제가 없습니다!' : '맞은 문제가 없습니다.' }}</p>
            </div>
          </div>

          <!-- 하단 버튼 -->
          <div class="review-actions">
            <CommonButton variant="primary" @click="goBackToLearn">
              학습 페이지로
            </CommonButton>
          </div>
        </CommonCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 공통 */
.common-page {
  min-height: 100vh;
  background: #f9fafb;
}

.common-container-md {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

.review-page {
  padding: var(--spacing-md) 0;
}

/* 헤더 */
.review-page-header {
  margin-bottom: var(--spacing-xl);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-lg);
}

.back-button:hover {
  background: #f3f4f6;
  color: #374151;
}

.back-icon {
  font-size: 18px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.category-icon {
  font-size: 32px;
}

.header-title h1 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.header-stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

.stat-badge.passed {
  background: #dcfce7;
  color: #059669;
}

.stat-badge.failed {
  background: #fee2e2;
  color: #dc2626;
}

.stat-detail {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

/* 리뷰 카드 */
.review-card {
  padding: var(--spacing-xl);
}

/* 필터 섹션 */
.review-filter-section {
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid #e5e7eb;
}

.review-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.review-tab {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-tab:hover {
  background: #e5e7eb;
  color: #374151;
}

.review-tab.active {
  background: #3182F6;
  color: white;
}

/* 문제 목록 */
.review-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.review-item {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: var(--spacing-lg);
  transition: all 0.2s ease;
}

.review-item.correct {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.review-item.wrong {
  border-color: #f87171;
  background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
}

.review-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.question-number {
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
}

.result-badge {
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  border-radius: 20px;
}

.result-badge.correct {
  background: #dcfce7;
  color: #059669;
}

.result-badge.wrong {
  background: #fee2e2;
  color: #dc2626;
}

.review-question-text {
  font-size: 17px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 var(--spacing-xs) 0;
  line-height: 1.6;
}

.review-question-vi {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 var(--spacing-lg) 0;
  font-style: italic;
}

/* 선택지 */
.review-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: var(--spacing-lg);
}

.review-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.review-option.correct-answer {
  background: #dcfce7;
  border-color: #10b981;
}

.review-option.wrong-selected {
  background: #fee2e2;
  border-color: #f87171;
}

.review-option.user-selected.correct-answer {
  background: #dcfce7;
  border-color: #10b981;
}

.option-letter {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
  flex-shrink: 0;
}

.review-option.correct-answer .option-letter {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.review-option.wrong-selected .option-letter {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
}

.option-content {
  flex: 1;
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.option-tag {
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 12px;
}

.option-tag.correct {
  background: #10b981;
  color: white;
}

.option-tag.wrong {
  background: #dc2626;
  color: white;
}

/* 해설 */
.review-explanation {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: var(--spacing-md);
}

.explanation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.explanation-icon {
  font-size: 20px;
}

.explanation-title {
  font-size: 15px;
  font-weight: 700;
  color: #92400e;
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

/* 결과 없음 */
.no-results {
  text-align: center;
  padding: var(--spacing-2xl);
  color: #9ca3af;
}

.no-results-icon {
  font-size: 56px;
  display: block;
  margin-bottom: var(--spacing-md);
}

.no-results p {
  font-size: 16px;
  margin: 0;
}

/* 하단 버튼 */
.review-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-lg);
  border-top: 1px solid #e5e7eb;
}

.review-actions .common-button {
  min-width: 200px;
}

/* 반응형 */
@media (max-width: 768px) {
  .header-title h1 {
    font-size: 20px;
  }

  .review-tabs {
    gap: 8px;
  }

  .review-tab {
    padding: 10px 16px;
    font-size: 13px;
  }

  .review-question-text {
    font-size: 15px;
  }

  .review-option {
    padding: 12px 14px;
    gap: 10px;
  }

  .option-letter {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .option-content {
    font-size: 14px;
  }

  .review-actions {
    flex-direction: column;
    align-items: center;
  }

  .review-actions .common-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
