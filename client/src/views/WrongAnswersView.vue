
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import { useMainStore } from '@/stores/useMainStore'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import CommonLoader from '@/components/common/CommonLoader.vue'
import AppHeader from '@/components/common/AppHeader.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const mainStore = useMainStore()

const isLoading = ref(true)
const wrongAnswers = ref([])

// 교과서 뷰 상태
const selectedBook = ref(null) // 'beginner', 'intermediate', 'advanced', null
const currentPageIndex = ref(0)
const isReviewTestMode = ref(false)
const reviewTestAnswers = ref({})
const reviewTestScore = ref(0)
const isReviewTestCompleted = ref(false) // 복습 테스트 완료 여부

// 카테고리 매핑
const categoryMap = computed(() => ({
  beginner: {
    name: t('wrongAnswers.categories.beginner'),
    color: '#3182F6',
    icon: '🌱',
    bgColor: '#EFF6FF',
    bookColor: '#60a5fa'
  },
  intermediate: {
    name: t('wrongAnswers.categories.intermediate'),
    color: '#10b981',
    icon: '🌿',
    bgColor: '#F0FDF4',
    bookColor: '#34d399'
  },
  advanced: {
    name: t('wrongAnswers.categories.advanced'),
    color: '#f59e0b',
    icon: '🌳',
    bgColor: '#FFFBEB',
    bookColor: '#fbbf24'
  }
}))

// 오답 데이터 조회
const fetchWrongAnswers = async () => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }

  isLoading.value = true
  try {
    const response = await axios.get('/api/wrong-answers/list', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      },
      params: {
        isReviewed: 'false' // 복습 안 한 문제만 가져오기
      }
    })

    wrongAnswers.value = response.data.wrongAnswers
    console.log(`📊 오답노트 데이터 로드 완료:`, {
      total: wrongAnswers.value.length,
      beginner: wrongAnswers.value.filter(w => w.category === 'beginner').length,
      intermediate: wrongAnswers.value.filter(w => w.category === 'intermediate').length,
      advanced: wrongAnswers.value.filter(w => w.category === 'advanced').length
    })
  } catch (error) {
    console.error('❌ 오답 목록 조회 실패:', error)
  } finally {
    isLoading.value = false
  }
}

// 카테고리별로 그룹화
const groupedByCategory = computed(() => {
  const grouped = {
    beginner: [],
    intermediate: [],
    advanced: []
  }

  wrongAnswers.value.forEach(answer => {
    if (grouped[answer.category]) {
      grouped[answer.category].push(answer)
    }
  })

  return grouped
})

// 각 교과서별 오답 개수
const bookStats = computed(() => {
  return {
    beginner: groupedByCategory.value.beginner.length,
    intermediate: groupedByCategory.value.intermediate.length,
    advanced: groupedByCategory.value.advanced.length
  }
})

// 현재 선택된 교과서의 오답 문제들
const currentBookPages = computed(() => {
  if (!selectedBook.value) return []
  return groupedByCategory.value[selectedBook.value] || []
})

// 현재 페이지
const currentPage = computed(() => {
  if (!currentBookPages.value.length) return null
  return currentBookPages.value[currentPageIndex.value]
})

// 교과서 선택
const selectBook = (category) => {
  if (bookStats.value[category] === 0) return
  selectedBook.value = category
  currentPageIndex.value = 0
  isReviewTestMode.value = false
  reviewTestAnswers.value = {}
  reviewTestScore.value = 0
  isReviewTestCompleted.value = false
  mainStore.setHideBottomNav(true) // BottomNav 숨김
  console.log(`📖 교과서 선택: ${category}, 오답 문제 수: ${groupedByCategory.value[category].length}`)
  // 스크롤 포커스 상단 이동
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 교과서 닫기
const closeBook = () => {
  selectedBook.value = null
  currentPageIndex.value = 0
  isReviewTestMode.value = false
  reviewTestAnswers.value = {}
  reviewTestScore.value = 0
  isReviewTestCompleted.value = false
  mainStore.setHideBottomNav(false) // BottomNav 다시 표시
  // 오답노트 데이터 다시 가져오기
  fetchWrongAnswers()
}

// 다음 페이지
const nextPage = () => {
  if (currentPageIndex.value < currentBookPages.value.length - 1) {
    // 복습 테스트 모드에서는 1문제씩, 교과서 모드에서는 2페이지씩
    const increment = isReviewTestMode.value ? 1 : 2
    currentPageIndex.value += increment
    // 마지막 페이지를 넘지 않도록
    if (currentPageIndex.value >= currentBookPages.value.length) {
      currentPageIndex.value = currentBookPages.value.length - 1
    }
  }

  // 스크롤 맨 위로
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 이전 페이지
const prevPage = () => {
  if (currentPageIndex.value > 0) {
    // 복습 테스트 모드에서는 1문제씩, 교과서 모드에서는 2페이지씩
    const decrement = isReviewTestMode.value ? 1 : 2
    currentPageIndex.value -= decrement
    // 0보다 작아지지 않도록
    if (currentPageIndex.value < 0) {
      currentPageIndex.value = 0
    }
  }

  // 스크롤 맨 위로
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 복습 테스트 시작 - 새로운 페이지로 이동
const startReviewTest = () => {
  if (currentBookPages.value.length === 0) return

  console.log('🎯 복습 테스트 시작:', {
    category: selectedBook.value,
    totalQuestions: currentBookPages.value.length
  })

  // 새로운 복습 테스트 페이지로 이동
  router.push({
    name: 'review-test',
    params: {
      category: selectedBook.value
    }
  })
}

// 복습 테스트 답안 선택
const selectReviewAnswer = async (questionIndex, optionIndex) => {
  // 이미 답변한 문제는 다시 선택 불가
  if (reviewTestAnswers.value[questionIndex] !== undefined) return

  const question = currentBookPages.value[questionIndex]
  reviewTestAnswers.value[questionIndex] = optionIndex

  // 정답 체크
  const isCorrect = question.correctAnswer === question.options[optionIndex]
  if (isCorrect) {
    reviewTestScore.value++

    // 맞춘 문제는 즉시 오답 노트에서 삭제
    try {
      await axios.delete(`/api/wrong-answers/${question.id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log(`✅ 오답 삭제 성공 - Question ID: ${question.id}`)

      // 로컬 wrongAnswers 배열에서도 제거 (데이터 일관성 유지)
      wrongAnswers.value = wrongAnswers.value.filter(w => w.id !== question.id)
    } catch (error) {
      console.error('❌ 오답 삭제 실패:', error)
    }
  }

  // 모든 문제에 답했는지 확인
  if (Object.keys(reviewTestAnswers.value).length === currentBookPages.value.length) {
    // 모든 문제 완료 - 결과 화면으로 전환
    setTimeout(() => {
      isReviewTestCompleted.value = true
      // 스크롤 포커스 상단 이동
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }, 500) // 마지막 답변 피드백을 볼 시간을 주기 위해 0.5초 대기
  }
}

// 복습 테스트 정답률
const reviewTestAccuracy = computed(() => {
  if (currentBookPages.value.length === 0) return 0
  return Math.round((reviewTestScore.value / currentBookPages.value.length) * 100)
})

// 복습 테스트 통과 여부 (80% 이상)
const isReviewTestPassed = computed(() => {
  return reviewTestAccuracy.value >= 80
})

// 복습 테스트 다시 시도
const retryReviewTest = () => {
  isReviewTestMode.value = false
  isReviewTestCompleted.value = false
  reviewTestAnswers.value = {}
  reviewTestScore.value = 0
  currentPageIndex.value = 0
}

onMounted(() => {
  fetchWrongAnswers()
})

// 컴포넌트 언마운트 시 BottomNav 다시 표시
onUnmounted(() => {
  mainStore.setHideBottomNav(false)
})
</script>

<template>
  <div class="common-page wrong-answers-view">
    <AppHeader />

    <div class="content-container">
      <CommonLoader v-if="isLoading" />

      <!-- 교과서 선택 화면 (메인) -->
      <div v-else-if="!selectedBook" class="main-view">
        <div class="page-header">
          <h1 class="common-title1">{{ t('wrongAnswers.title') }}</h1>
          <p class="common-body1 text-secondary">{{ t('wrongAnswers.subtitle') }}</p>
        </div>

        <!-- 빈 상태 -->
        <div v-if="wrongAnswers.length === 0" class="empty-state">
          <div class="empty-icon">🎉</div>
          <h3 class="common-title3">{{ t('wrongAnswers.empty.title') }}</h3>
          <p class="common-body2">{{ t('wrongAnswers.empty.message') }}</p>
          <CommonButton variant="primary" @click="router.push({ name: 'learn' })">
            {{ t('wrongAnswers.empty.goToLearn') }}
          </CommonButton>
        </div>

        <!-- 교과서 그리드 -->
        <div v-else class="books-grid">
          <div
            v-for="category in ['beginner', 'intermediate', 'advanced']"
            :key="category"
            class="book-card"
            :class="{ 'disabled': bookStats[category] === 0 }"
            @click="selectBook(category)"
          >
            <div class="book-icon-wrapper">
              <span class="book-icon">{{ categoryMap[category].icon }}</span>
            </div>
            <h3 class="common-title3">{{ categoryMap[category].name }}</h3>
            <p class="common-body3 text-secondary">
              <span v-if="bookStats[category] > 0">{{ t('wrongAnswers.stats.problems', { count: bookStats[category] }) }}</span>
              <span v-else>{{ t('wrongAnswers.stats.none') }}</span>
            </p>
            <div class="book-status-badge" :class="{ 'available': bookStats[category] > 0 }">
              {{ bookStats[category] > 0 ? t('wrongAnswers.stats.available') : t('wrongAnswers.stats.perfect') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 교과서 읽기 화면 (학습 모드) -->
      <div v-else-if="selectedBook && !isReviewTestMode" class="book-reader">
        <div class="book-reader-header">
          <CommonButton variant="ghost" @click="closeBook">
            ← {{ t('wrongAnswers.reader.back') }}
          </CommonButton>
          <div class="book-info">
            <div class="badge-group">
              <div class="category-badge" :style="{ backgroundColor: categoryMap[selectedBook].bgColor, color: categoryMap[selectedBook].color }">
                {{ categoryMap[selectedBook].icon }} {{ categoryMap[selectedBook].name }}
              </div>
              <div class="progress-badge">
                {{ Math.floor(currentPageIndex / 2) + 1 }} / {{ Math.ceil(currentBookPages.length / 2) }}
              </div>
            </div>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: `${Math.round(((Math.floor(currentPageIndex / 2) + 1) / Math.ceil(currentBookPages.length / 2)) * 100)}%` }"></div>
            </div>
          </div>
          <CommonButton variant="primary" @click="startReviewTest">
            🎯 {{ t('wrongAnswers.reader.reviewTest') }}
          </CommonButton>
        </div>

        <!-- 책 페이지 -->
        <div class="book-page-container">
          <div class="book-pages-wrapper">
            <!-- 왼쪽 페이지 -->
            <CommonCard class="book-page" v-if="currentBookPages[currentPageIndex]">
              <div class="page-header">
                <span class="page-label">Question {{ (Math.floor(currentPageIndex / 2) * 2) + 1 }}</span>
              </div>
              <h3 class="question-title">{{ currentBookPages[currentPageIndex].question }}</h3>

              <div class="answer-comparison">
                <!-- 내 답변 (오답) -->
                <div class="answer-item wrong">
                  <div class="answer-badge wrong">❌ {{ t('wrongAnswers.reader.myAnswer') }}</div>
                  <div class="answer-content">{{ currentBookPages[currentPageIndex].userAnswer }}</div>
                </div>

                <!-- 정답 -->
                <div class="answer-item correct">
                  <div class="answer-badge correct">✅ {{ t('wrongAnswers.reader.correctAnswer') }}</div>
                  <div class="answer-content">{{ currentBookPages[currentPageIndex].correctAnswer }}</div>
                </div>
              </div>

              <!-- 해설 -->
              <div class="explanation-box" v-if="currentBookPages[currentPageIndex].explanation">
                <div class="explanation-header">💡 {{ t('wrongAnswers.reader.explanation') }}</div>
                <p class="explanation-text">{{ currentBookPages[currentPageIndex].explanation }}</p>
                <p v-if="currentBookPages[currentPageIndex].explanationEn" class="explanation-text-en">{{ currentBookPages[currentPageIndex].explanationEn }}</p>
              </div>
            </CommonCard>

            <!-- 오른쪽 페이지 -->
            <CommonCard class="book-page" v-if="currentBookPages[currentPageIndex + 1]">
              <div class="page-header">
                <span class="page-label">Question {{ (Math.floor(currentPageIndex / 2) * 2) + 2 }}</span>
              </div>
              <h3 class="question-title">{{ currentBookPages[currentPageIndex + 1].question }}</h3>

              <div class="answer-comparison">
                <!-- 내 답변 (오답) -->
                <div class="answer-item wrong">
                  <div class="answer-badge wrong">❌ {{ t('wrongAnswers.reader.myAnswer') }}</div>
                  <div class="answer-content">{{ currentBookPages[currentPageIndex + 1].userAnswer }}</div>
                </div>

                <!-- 정답 -->
                <div class="answer-item correct">
                  <div class="answer-badge correct">✅ {{ t('wrongAnswers.reader.correctAnswer') }}</div>
                  <div class="answer-content">{{ currentBookPages[currentPageIndex + 1].correctAnswer }}</div>
                </div>
              </div>

              <!-- 해설 -->
              <div class="explanation-box" v-if="currentBookPages[currentPageIndex + 1].explanation">
                <div class="explanation-header">💡 {{ t('wrongAnswers.reader.explanation') }}</div>
                <p class="explanation-text">{{ currentBookPages[currentPageIndex + 1].explanation }}</p>
                <p v-if="currentBookPages[currentPageIndex + 1].explanationEn" class="explanation-text-en">{{ currentBookPages[currentPageIndex + 1].explanationEn }}</p>
              </div>
            </CommonCard>

            <!-- 빈 페이지 (마지막 페이지가 홀수일 때) -->
            <div class="book-page empty-page" v-else-if="currentPageIndex % 2 === 0">
              <div class="empty-page-text">📖</div>
            </div>
          </div>
        </div>

        <!-- 페이지 네비게이션 (하단 고정) -->
        <div class="navigation-buttons-wrapper">
          <div class="navigation-buttons">
            <CommonButton
              variant="outline"
              @click="prevPage"
              :disabled="currentPageIndex === 0"
              class="nav-btn"
            >
              {{ t('wrongAnswers.reader.previous') }}
            </CommonButton>
            <CommonButton
              variant="primary"
              @click="nextPage"
              :disabled="currentPageIndex >= currentBookPages.length - 2"
              class="nav-btn"
            >
              {{ t('wrongAnswers.reader.next') }}
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- 복습 테스트 완료 - 결과 화면 -->
      <div v-else-if="selectedBook && isReviewTestMode && isReviewTestCompleted" class="review-test-result">
        <CommonCard class="result-card">
          <div class="result-header">
            <div class="result-icon" :class="{ 'passed': isReviewTestPassed, 'failed': !isReviewTestPassed }">
              {{ isReviewTestPassed ? '🎉' : '📚' }}
            </div>
            <h1 class="common-title1">{{ isReviewTestPassed ? '훌륭해요!' : '조금 더 힘내요!' }}</h1>
            <p class="common-body1 result-subtitle">
              {{ isReviewTestPassed ? '복습 테스트를 통과했습니다!' : '조금 더 복습이 필요해요' }}
            </p>
          </div>

          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-label">정답 수</div>
              <div class="stat-value">{{ reviewTestScore }} / {{ currentBookPages.length }}</div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-label">정답률</div>
              <div class="stat-value" :class="{ 'passed': isReviewTestPassed, 'failed': !isReviewTestPassed }">
                {{ reviewTestAccuracy }}%
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">통과 기준</div>
              <div class="stat-value">80%</div>
            </div>
          </div>

          <div class="result-message" :class="{ 'passed': isReviewTestPassed, 'failed': !isReviewTestPassed }">
            <div class="message-icon">{{ isReviewTestPassed ? '✅' : '💪' }}</div>
            <div class="message-text">
              <strong v-if="isReviewTestPassed">축하합니다!</strong>
              <strong v-else>정답률 80% 이상이 필요합니다</strong>
              <p v-if="isReviewTestPassed">이 주제들을 완전히 마스터했습니다!</p>
              <p v-else>복습 후 다시 도전해보세요!</p>
            </div>
          </div>

          <div class="result-actions">
            <CommonButton variant="outline" @click="closeBook">
              목록으로
            </CommonButton>
            <CommonButton v-if="!isReviewTestPassed" variant="primary" @click="retryReviewTest">
              다시 도전하기
            </CommonButton>
            <CommonButton v-else variant="primary" @click="closeBook">
              확인
            </CommonButton>
          </div>
        </CommonCard>
      </div>

      <!-- 복습 테스트 모드 -->
      <div v-else-if="selectedBook && isReviewTestMode && !isReviewTestCompleted" class="review-test-mode">
        <div class="test-header">
          <div class="test-back-button">
            <CommonButton variant="ghost" @click="isReviewTestMode = false">
              {{ t('wrongAnswers.reader.back') }}
            </CommonButton>
          </div>
          <div class="test-info">
            <span class="test-category">{{ t('wrongAnswers.test.title', { icon: categoryMap[selectedBook].icon, category: categoryMap[selectedBook].name }) }}</span>
            <div class="test-status">
              <span class="page-number">{{ t('wrongAnswers.test.page', { current: currentPageIndex + 1, total: currentBookPages.length }) }}</span>
              <span class="score-text">{{ t('wrongAnswers.test.score', { count: reviewTestScore }) }}</span>
            </div>
          </div>
          <div class="test-hint">{{ t('wrongAnswers.test.hint') }}</div>
        </div>

        <!-- 테스트 문제 -->
        <div class="test-question-container" v-if="currentPage">
          <div class="single-page-wrapper">
            <CommonCard class="test-question-card">
            <h3 class="question-title">{{ currentPage.question }}</h3>

            <!-- 선택지 -->
            <div class="options-list">
              <CommonButton
                v-for="(option, index) in currentPage.options"
                :key="index"
                :variant="reviewTestAnswers[currentPageIndex] === index
                  ? (currentPage.correctAnswer === option ? 'primary' : 'danger')
                  : 'outline'"
                @click="selectReviewAnswer(currentPageIndex, index)"
                :disabled="reviewTestAnswers[currentPageIndex] !== undefined"
                class="option-button"
              >
                {{ option }}
              </CommonButton>
            </div>

            <!-- 정답 설명 -->
            <div v-if="reviewTestAnswers[currentPageIndex] !== undefined" class="test-result">
              <div
                class="result-message"
                :class="currentPage.correctAnswer === currentPage.options[reviewTestAnswers[currentPageIndex]] ? 'correct' : 'incorrect'"
              >
                <span v-if="currentPage.correctAnswer === currentPage.options[reviewTestAnswers[currentPageIndex]]">
                  {{ t('wrongAnswers.test.correct') }}
                </span>
                <span v-else>
                  {{ t('wrongAnswers.test.incorrect', { answer: currentPage.correctAnswer }) }}
                </span>
              </div>
              <p class="result-explanation" v-if="currentPage.explanation">
                {{ currentPage.explanation }}
              </p>
              <p v-if="currentPage.explanationEn" class="result-explanation-en">
                {{ currentPage.explanationEn }}
              </p>
            </div>
          </CommonCard>
          </div>

          <!-- 테스트 네비게이션 -->
          <div class="navigation-buttons-wrapper">
            <div class="navigation-buttons">
              <CommonButton
                variant="outline"
                @click="prevPage"
                :disabled="currentPageIndex === 0"
                class="nav-btn"
              >
                ← 이전
              </CommonButton>
              <CommonButton
                variant="primary"
                @click="nextPage"
                :disabled="currentPageIndex === currentBookPages.length - 1"
                class="nav-btn"
              >
                다음 →
              </CommonButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrong-answers-view {
  min-height: 100vh;
  background: #f8fafc;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

/* 메인 화면 */
.main-view {
  padding: var(--spacing-xl) 0;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.page-header h1 {
  margin: 0 0 12px 0;
}

.text-secondary {
  color: #6b7280;
}

/* 빈 상태 */
.empty-state {
  text-align: center;
  padding: 64px 32px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  color: #1f2937;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

/* 게임 스타일의 카드 그리드 */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

.book-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  position: relative;
}

.book-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #3182F6;
}

.book-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f9fafb;
}

.book-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: #f8fafc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-icon {
  font-size: 48px;
}

.book-card h3 {
  margin: 0 0 8px 0;
  color: #1f2937;
}

.book-card p {
  margin: 0 0 16px 0;
  min-height: 20px;
}

.book-status-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: #e5e7eb;
  color: #6b7280;
}

.book-status-badge.available {
  background: #dbeafe;
  color: #1e40af;
}

/* 책 읽기 화면 */
.book-reader,
.review-test-mode {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 140px);
}

.book-reader-header,
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px var(--spacing-lg);
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.book-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 400px;
}

.badge-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.progress-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 700;
  background: #f3f4f6;
  color: #374151;
}

.progress-bar-container {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3182F6 0%, #60a5fa 100%);
  transition: width 0.3s ease;
  border-radius: 3px;
}

.page-number {
  font-size: 13px;
  color: #6b7280;
  font-weight: 600;
}

.test-back-button {
  position: absolute;
  left: var(--spacing-lg);
}

.test-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.test-category {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.test-status {
  display: flex;
  gap: 16px;
  align-items: center;
}

.test-status .score-text {
  font-size: 13px;
  color: #3182F6;
  font-weight: 600;
}

.test-hint {
  position: absolute;
  right: var(--spacing-lg);
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.book-page-container,
.test-question-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
  background: #f9fafb;
}

.book-pages-wrapper {
  display: flex;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.single-page-wrapper {
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
}

.book-page {
  flex: 1;
  max-width: 650px;
  margin: 0 0 16px 0;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideUp 0.4s ease;
}

.book-page:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.book-page.empty-page {
  background: transparent;
  box-shadow: none;
  border: 2px dashed #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-page-text {
  font-size: 48px;
  opacity: 0.2;
}

.page-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.page-label {
  font-size: 12px;
  font-weight: 700;
  color: #3182F6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.question-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.answer-item {
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid;
}

.answer-item.wrong {
  border-color: #fecaca;
  background: #fef2f2;
}

.answer-item.correct {
  border-color: #d1fae5;
  background: #ecfdf5;
}

.answer-badge {
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
}

.answer-badge.wrong {
  background: #fecaca;
  color: #991b1b;
}

.answer-badge.correct {
  background: #d1fae5;
  color: #065f46;
}

.answer-content {
  padding: 12px 16px;
  font-size: 15px;
  font-weight: 500;
  color: #1f2937;
  line-height: 1.6;
}

.explanation-box {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 12px;
  padding: 16px;
  margin-top: 8px;
}

.explanation-header {
  font-size: 14px;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 10px;
}

.explanation-text {
  font-size: 14px;
  color: #78350f;
  line-height: 1.6;
  margin: 0;
}

.explanation-text-vi {
  font-size: 13px;
  color: #92400e;
  line-height: 1.5;
  margin: 10px 0 0 0;
  font-style: italic;
}

.test-question-card {
  padding: var(--spacing-xl);
}

.single-page-wrapper .test-question-card {
  max-width: 100%;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.option-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 16px;
  text-align: left;
  justify-content: flex-start;
} 

.test-result {
  padding: var(--spacing-lg);
  background: #f9fafb;
  border-radius: 12px;
  margin-top: var(--spacing-lg);
}

.result-message {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.result-message.correct {
  color: #059669;
}

.result-message.incorrect {
  color: #dc2626;
}

.result-explanation {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  margin: 0;
}

.result-explanation-vi {
  font-size: 13px;
  color: #059669;
  line-height: 1.4;
  margin: 6px 0 0 0;
  font-style: italic;
}

.test-navigation {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.navigation-buttons-wrapper {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 24px calc(env(safe-area-inset-bottom, 10px) + 10px) 24px;
  margin: 0 calc(-1 * 24px);
  border-top: 1px solid #e5e7eb;
  z-index: 100;
}

.navigation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  max-width: 900px;
  margin: 0 auto;
}

.nav-btn {
  padding: var(--spacing-md);
  font-size: 15px;
  font-weight: 600;
}

/* 반응형 */
@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: 1fr;
  }

  .book-reader,
  .review-test-mode {
    height: calc(100vh - 110px);
    border-radius: 0;
  }

  .book-reader-header,
  .test-header {
    flex-direction: column;
    gap: 12px;
    padding: 12px 16px;
  }

  .book-info {
    max-width: 100%;
  }

  .badge-group {
    flex-wrap: wrap;
    justify-content: center;
  }

  .category-badge,
  .progress-badge {
    font-size: 12px;
    padding: 4px 12px;
  }

  .test-back-button {
    position: static;
    width: 100%;
  }

  .test-hint {
    position: static;
    text-align: center;
    width: 100%;
    font-size: 11px;
  }

  .book-page-container,
  .test-question-container {
    padding: 16px;
  }

  .book-pages-wrapper {
    flex-direction: column;
    gap: 16px;
  }

  .book-page {
    padding: 20px;
    max-width: 100%;
    margin-bottom: 12px;
  }

  .book-page.empty-page {
    display: none;
  }

  .page-header {
    margin-bottom: 12px;
    padding-bottom: 10px;
  }

  .page-label {
    font-size: 11px;
  }

  .question-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .answer-badge {
    padding: 6px 12px;
    font-size: 12px;
  }

  .answer-content {
    padding: 10px 12px;
    font-size: 14px;
  }

  .explanation-box {
    padding: 12px;
  }

  .explanation-header {
    font-size: 13px;
  }

  .explanation-text {
    font-size: 13px;
  }

  .explanation-text-vi {
    font-size: 12px;
  }

  .test-question-card {
    padding: 20px;
  }

  .navigation-buttons-wrapper {
    padding: 10px 10px calc(env(safe-area-inset-bottom, 20px) + 10px) 10px;
    margin: 0 calc(-1 * 16px);
  }
}

/* ========== 복습 테스트 결과 화면 ========== */
.review-test-result {
  padding: var(--spacing-xl) 0;
}

.result-card {
  padding: var(--spacing-2xl);
}

.result-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.result-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-lg);
}

.result-subtitle {
  color: #6b7280;
  margin-top: var(--spacing-sm);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item.highlight {
  background: #eff6ff;
  border: 2px solid #3182F6;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-value.passed {
  color: #059669;
}

.stat-value.failed {
  color: #dc2626;
}

.result-message {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-radius: 12px;
  margin-bottom: var(--spacing-2xl);
}

.result-message.passed {
  background: #ecfdf5;
  border: 2px solid #d1fae5;
}

.result-message.failed {
  background: #fef2f2;
  border: 2px solid #fecaca;
}

.message-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.message-text strong {
  display: block;
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
}

.message-text p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.result-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

/* 반응형 - 결과 화면 */
@media (max-width: 768px) {
  .result-stats {
    grid-template-columns: 1fr;
  }

  .result-actions {
    grid-template-columns: 1fr;
  }
}
</style>
