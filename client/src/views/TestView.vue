<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import AppHeader from '@/components/common/AppHeader.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import CommonCard from '@/components/common/CommonCard.vue'

// 테스트 데이터 import
import testBeginner from '@/data/test_beginner.json'
import testIntermediate from '@/data/test_intermediate.json'
import testAdvanced from '@/data/test_advanced.json'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// URL 파라미터에서 카테고리 가져오기
const category = ref(route.params.category)

// 테스트 상태 관리
const isTestStarted = ref(false)
const currentQuestionIndex = ref(0)
const isTestCompleted = ref(false)
const userAnswers = ref([])
const selectedAnswer = ref(null)
const showQuestionResult = ref(false)

// 중간저장 관련
const hasSavedProgress = ref(false)
const savedProgressData = ref(null)
const showResumeDialog = ref(false)

// AI 퀴즈 생성 관련
const isGeneratingTest = ref(false)
const aiGeneratedTest = ref(null)

// 카테고리별 테스트 데이터 매핑
const testDataMap = {
  beginner: testBeginner,
  intermediate: testIntermediate,
  advanced: testAdvanced
}

// 현재 테스트 데이터 (AI 생성 우선 사용)
const currentTestData = computed(() => {
  if (aiGeneratedTest.value) {
    return aiGeneratedTest.value
  }
  return testDataMap[category.value] || null
})

// 현재 문제
const currentQuestion = computed(() => {
  if (!currentTestData.value || !currentTestData.value.questions) {
    return null
  }
  return currentTestData.value.questions[currentQuestionIndex.value]
})

// 진행률
const progressPercentage = computed(() => {
  if (!currentTestData.value) return 0
  return Math.round(((currentQuestionIndex.value + 1) / currentTestData.value.totalQuestions) * 100)
})

// 점수 계산
const score = computed(() => {
  if (!currentTestData.value) return 0
  let correct = 0
  userAnswers.value.forEach((answer, index) => {
    if (answer === currentTestData.value.questions[index].correctAnswer) {
      correct++
    }
  })
  return correct
})

// 합격 여부
const isPassed = computed(() => {
  return score.value >= currentTestData.value?.passingScore
})

// 카테고리 한글 이름
const categoryTitle = computed(() => {
  const titles = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return titles[category.value] || ''
})

// 중간 저장된 진행 상황 확인
const checkSavedProgress = async () => {
  if (!authStore.isLoggedIn || !authStore.token) {
    return
  }

  try {
    const response = await axios.get(
      `/api/progress-save/get/${category.value}/0/test`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    if (response.data.success && response.data.hasSave) {
      hasSavedProgress.value = true
      savedProgressData.value = response.data.data
      showResumeDialog.value = true
    }
  } catch (error) {
    console.error('저장된 진행 상황 확인 실패:', error)
  }
}

// 저장된 위치에서 이어하기
const resumeFromSave = () => {
  if (savedProgressData.value) {
    isTestStarted.value = true
    currentQuestionIndex.value = savedProgressData.value.currentPage

    // 저장된 추가 데이터가 있으면 복원
    if (savedProgressData.value.savedData) {
      userAnswers.value = savedProgressData.value.savedData.userAnswers || []
      selectedAnswer.value = savedProgressData.value.savedData.selectedAnswer || null
      showQuestionResult.value = savedProgressData.value.savedData.showQuestionResult || false
    }

    showResumeDialog.value = false
    console.log(`✅ ${currentQuestionIndex.value + 1}번 문제부터 테스트 재개`)
  }
}

// 처음부터 다시 시작
const startFromBeginning = async () => {
  // 저장된 진행 상황 삭제
  if (authStore.isLoggedIn && authStore.token) {
    try {
      await axios.delete(
        `/api/progress-save/delete/${category.value}/0/test`,
        {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        }
      )
    } catch (error) {
      console.error('저장된 진행 상황 삭제 실패:', error)
    }
  }

  showResumeDialog.value = false
  hasSavedProgress.value = false
  savedProgressData.value = null
  startTest()
}

// 테스트 진행 상황 자동 저장
const saveProgress = async () => {
  if (!authStore.isLoggedIn || !authStore.token || !isTestStarted.value) {
    return
  }

  try {
    await axios.post(
      '/api/progress-save/save',
      {
        category: category.value,
        level: 0, // 마무리 테스트는 level 0
        type: 'test',
        currentPage: currentQuestionIndex.value,
        totalPages: currentTestData.value.totalQuestions,
        savedData: {
          userAnswers: userAnswers.value,
          selectedAnswer: selectedAnswer.value,
          showQuestionResult: showQuestionResult.value
        }
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    console.log(`💾 테스트 진행 상황 자동 저장 완료 (${currentQuestionIndex.value + 1}/${currentTestData.value.totalQuestions})`)
  } catch (error) {
    console.error('테스트 진행 상황 저장 실패:', error)
  }
}

// 저장된 진행 상황 삭제 (완료 시)
const clearSavedProgress = async () => {
  if (!authStore.isLoggedIn || !authStore.token) {
    return
  }

  try {
    await axios.delete(
      `/api/progress-save/delete/${category.value}/0/test`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )
    console.log('✅ 저장된 테스트 진행 상황 삭제 완료')
  } catch (error) {
    console.error('저장된 테스트 진행 상황 삭제 실패:', error)
  }
}

// AI 마무리 테스트 생성
const generateAIFinalTest = async () => {
  if (!authStore.isLoggedIn || !authStore.token) {
    console.log('⚠️ 로그인하지 않아 AI 테스트를 생성하지 않습니다.')
    return
  }

  isGeneratingTest.value = true
  try {
    const response = await axios.post('/api/ai-quiz/generate-final-test', {
      category: category.value
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      aiGeneratedTest.value = response.data.test
      console.log('✅ AI 마무리 테스트 생성 완료:', aiGeneratedTest.value.questions.length, '문제')
    }
  } catch (error) {
    console.error('❌ AI 마무리 테스트 생성 실패:', error)
    // 실패해도 기존 테스트 사용
    aiGeneratedTest.value = null
  } finally {
    isGeneratingTest.value = false
  }
}

// 테스트 시작
const startTest = () => {
  isTestStarted.value = true
  currentQuestionIndex.value = 0
  userAnswers.value = []
  selectedAnswer.value = null
  showQuestionResult.value = false

  // AI 테스트 생성 (백그라운드에서)
  generateAIFinalTest()
}

// 답안 선택
const selectAnswer = async (optionIndex) => {
  if (showQuestionResult.value) return
  selectedAnswer.value = optionIndex
  showQuestionResult.value = true

  // 오답인 경우 서버에 저장
  const question = currentQuestion.value
  if (optionIndex !== question.correctAnswer && authStore.isLoggedIn && authStore.token) {
    try {
      await axios.post('/api/wrong-answers/save', {
        category: category.value,
        level: 0, // 마무리 테스트는 level 0으로 저장
        questionType: 'level_test',
        question: question.question,
        questionVi: question.questionVi || null,
        correctAnswer: question.options[question.correctAnswer],
        userAnswer: question.options[optionIndex],
        options: question.options,
        explanation: question.explanation || null,
        explanationVi: question.explanationVi || null
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log('✅ 마무리 테스트 오답 저장 완료')
    } catch (error) {
      console.error('❌ 마무리 테스트 오답 저장 실패:', error)
    }
  }
}

// 다음 문제
const nextQuestion = async () => {
  // 현재 답안 저장
  userAnswers.value[currentQuestionIndex.value] = selectedAnswer.value

  if (currentQuestionIndex.value < currentTestData.value.totalQuestions - 1) {
    currentQuestionIndex.value++
    selectedAnswer.value = null
    showQuestionResult.value = false

    // 진행 상황 자동 저장
    await saveProgress()

    window.scrollTo({ top: 80, behavior: 'smooth' })
  } else {
    completeTest()
  }
}

// 이전 문제
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
    selectedAnswer.value = userAnswers.value[currentQuestionIndex.value] || null
    showQuestionResult.value = selectedAnswer.value !== null
    window.scrollTo({ top: 80, behavior: 'smooth' })
  }
}

// 테스트 완료
const completeTest = async () => {
  isTestCompleted.value = true

  // 서버로 테스트 결과 전송
  if (authStore.isLoggedIn && authStore.token) {
    try {
      await axios.post('/api/learning/final-test-complete', {
        category: category.value,
        score: score.value,
        totalQuestions: currentTestData.value.totalQuestions
      }, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log('✅ 마무리 테스트 결과 저장 완료')

      // 테스트 완료 시 저장된 진행 상황 삭제
      await clearSavedProgress()
    } catch (error) {
      console.error('❌ 마무리 테스트 결과 저장 실패:', error)
    }
  }
}

// 학습 목록으로 돌아가기
const returnToLearning = () => {
  router.push({ name: 'learn' })
}

// 테스트 다시 보기
const retakeTest = () => {
  isTestStarted.value = false
  isTestCompleted.value = false
  currentQuestionIndex.value = 0
  userAnswers.value = []
  selectedAnswer.value = null
  showQuestionResult.value = false
}

// 페이지 마운트 시 유효성 검사 및 저장 상태 확인
onMounted(async () => {
  if (!currentTestData.value) {
    router.replace({ name: 'learn' })
    return
  }

  // 저장된 진행 상황 확인
  await checkSavedProgress()
})
</script>

<template>
  <div class="common-page test-page">
    <AppHeader />

    <div class="common-container">
      <!-- 이어하기 다이얼로그 -->
      <div v-if="showResumeDialog" class="resume-dialog-overlay">
        <div class="resume-dialog">
          <div class="resume-dialog-header">
            <h2 class="common-title2">💾 저장된 테스트 진행 상황</h2>
          </div>
          <div class="resume-dialog-body">
            <p class="common-body1">
              이전에 보던 테스트가 있습니다.<br />
              <strong>{{ savedProgressData?.currentPage + 1 }}번 문제</strong>부터 이어서 보시겠습니까?
            </p>
            <div class="resume-progress-info">
              <span class="progress-label">진행률:</span>
              <span class="progress-value">
                {{ savedProgressData?.currentPage + 1 }} / {{ savedProgressData?.totalPages }}
                ({{ Math.round(((savedProgressData?.currentPage + 1) / savedProgressData?.totalPages) * 100) }}%)
              </span>
            </div>
          </div>
          <div class="resume-dialog-actions">
            <CommonButton variant="secondary" @click="startFromBeginning" fullWidth>
              처음부터 시작
            </CommonButton>
            <CommonButton variant="primary" @click="resumeFromSave" fullWidth>
              이어서 풀기
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- 테스트 시작 전 화면 -->
      <div v-if="!isTestStarted && !isTestCompleted" class="intro-view">
        <CommonCard class="intro-card">
          <div class="test-info">
            <div class="test-badge">{{ categoryTitle }} 마무리 테스트</div>
            <h1 class="common-title1 test-title">{{ currentTestData?.title }}</h1>
            <p class="common-body1 test-subtitle">{{ currentTestData?.subtitle }}</p>
          </div>

          <div class="test-details">
            <div class="detail-item">
              <span class="detail-icon">📝</span>
              <span class="detail-text">총 {{ currentTestData?.totalQuestions }}문제</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">✅</span>
              <span class="detail-text">합격 기준: {{ currentTestData?.passingScore }}문제 이상</span>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⏱️</span>
              <span class="detail-text">약 {{ currentTestData?.totalQuestions }}분 소요</span>
            </div>
          </div>

          <CommonButton variant="primary" @click="startTest" class="start-button">
            테스트 시작하기
          </CommonButton>
        </CommonCard>
      </div>

      <!-- 테스트 진행 화면 -->
      <div v-else-if="isTestStarted && !isTestCompleted" class="test-view">
        <div class="progress-header">
          <CommonButton variant="ghost" @click="returnToLearning" class="back-btn">
            ← 돌아가기
          </CommonButton>
          <div class="progress-info">
            <span class="progress-text">{{ currentQuestionIndex + 1 }} / {{ currentTestData?.totalQuestions }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- 컨텐츠 래퍼 -->
        <div class="content-wrapper">
          <div v-if="currentQuestion" class="question-container">
          <CommonCard class="question-card">
            <div class="question-header">
              <span class="question-category">{{ currentQuestion.category }}</span>
              <h2 class="question-text">{{ currentQuestion.question }}</h2>
            </div>

            <div class="options-list">
              <CommonButton
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                :variant="selectedAnswer === index ? (index === currentQuestion.correctAnswer ? 'primary' : 'danger') : 'outline'"
                @click="selectAnswer(index)"
                :disabled="showQuestionResult"
                class="option-button"
              >
                {{ option }}
              </CommonButton>
            </div>

            <div v-if="showQuestionResult" class="question-result">
              <div
                class="result-message"
                :class="selectedAnswer === currentQuestion.correctAnswer ? 'correct' : 'incorrect'"
              >
                <span v-if="selectedAnswer === currentQuestion.correctAnswer">
                  {{ t('testView.question.correctAnswer') }}
                </span>
                <span v-else>
                  {{ t('testView.question.incorrectAnswer', { answer: currentQuestion.options[currentQuestion.correctAnswer] }) }}
                </span>
              </div>
              <p class="result-explanation">
                {{ currentQuestion.explanation }}
              </p>
            </div>
          </CommonCard>
          </div>
        </div>

        <!-- 네비게이션 버튼 (화면 하단 고정) -->
        <div class="navigation-buttons-wrapper">
          <div class="navigation-buttons">
            <CommonButton
              variant="outline"
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
              class="nav-btn"
            >
              ← 이전
            </CommonButton>

            <CommonButton
              variant="primary"
              @click="nextQuestion"
              :disabled="!showQuestionResult"
              class="nav-btn"
            >
              {{ currentQuestionIndex === currentTestData?.totalQuestions - 1 ? '결과 보기' : '다음' }} →
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- 테스트 완료 화면 -->
      <div v-else-if="isTestCompleted" class="completion-view">
        <CommonCard class="completion-card">
          <div class="completion-content">
            <div class="completion-icon">{{ isPassed ? '🎉' : '📚' }}</div>
            <h1 class="common-title1 completion-title">
              {{ isPassed ? '테스트 통과!' : '조금 더 공부해보세요!' }}
            </h1>
            <p class="common-body1 completion-subtitle">
              {{ categoryTitle }} 마무리 테스트를 완료했습니다!
            </p>

            <div class="score-display">
              <div class="score-circle" :class="{ 'passed': isPassed }">
                <span class="score-number">{{ score }}</span>
                <span class="score-total">/ {{ currentTestData?.totalQuestions }}</span>
              </div>
              <p class="score-text">{{ Math.round((score / currentTestData?.totalQuestions) * 100) }}% 정답률</p>
            </div>

            <div class="result-stats">
              <div class="stat-item correct">
                <div class="stat-label">정답</div>
                <div class="stat-value">{{ score }}문제</div>
              </div>
              <div class="stat-item incorrect">
                <div class="stat-label">오답</div>
                <div class="stat-value">{{ currentTestData?.totalQuestions - score }}문제</div>
              </div>
            </div>

            <div class="result-message" :class="{ 'passed': isPassed }">
              <p v-if="isPassed">
                축하합니다! {{ categoryTitle }} 과정을 성공적으로 마스터했습니다! 🎊
              </p>
              <p v-else>
                합격 기준({{ currentTestData?.passingScore }}문제)에 조금 못 미쳤습니다.
                다시 한 번 학습하고 도전해보세요! 💪
              </p>
            </div>

            <div class="action-buttons">
              <CommonButton variant="outline" @click="retakeTest" class="action-btn">
                다시 보기
              </CommonButton>
              <CommonButton variant="primary" @click="returnToLearning" class="action-btn">
                학습 목록으로
              </CommonButton>
            </div>
          </div>
        </CommonCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.test-page {
  min-height: 100vh;
  background: #f8fafc;
}

.common-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

/* 인트로 화면 */
.intro-view {
  padding: var(--spacing-xl) 0;
}

.intro-card {
  text-align: center;
  padding: var(--spacing-xl);
}

.test-info {
  margin-bottom: var(--spacing-xl);
}

.test-badge {
  background: #3182F6;
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  margin-bottom: var(--spacing-md);
}

.test-title {
  margin: var(--spacing-md) 0;
  color: #1f2937;
}

.test-subtitle {
  color: #6b7280;
  margin: 0;
}

.test-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: #f9fafb;
  border-radius: 8px;
}

.detail-icon {
  font-size: 20px;
}

.detail-text {
  font-size: 15px;
  color: #374151;
}

.start-button {
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-md);
  font-size: 16px;
  font-weight: 600;
}

/* 테스트 진행 화면 */
.test-view {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 80px); /* 헤더 높이 제외 */
  padding: var(--spacing-md) 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  gap: var(--spacing-md);
}

/* 컨텐츠 래퍼 - flex-grow로 남은 공간 차지 */
.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  margin-bottom: var(--spacing-md);
}

.back-btn {
  flex-shrink: 0;
}

.progress-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3182F6;
  transition: width 0.3s ease;
}

/* 문제 */
.question-container {
  margin-bottom: var(--spacing-lg);
}

.question-card {
  padding: var(--spacing-xl);
}

.question-header {
  margin-bottom: var(--spacing-lg);
}

.question-category {
  display: inline-block;
  background: #eff6ff;
  color: #3182F6;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}

.question-text {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: var(--spacing-md) 0 0 0;
  line-height: 1.5;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.option-button {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 16px;
  text-align: left;
  justify-content: flex-start;
}

.question-result {
  padding: var(--spacing-md);
  background: #f9fafb;
  border-radius: 12px;
  margin-top: var(--spacing-md);
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

/* 네비게이션 버튼 래퍼 - 하단 고정 */
.navigation-buttons-wrapper {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #f8fafc 0%, #f8fafc 80%, transparent 100%);
  padding: var(--spacing-md) 0 var(--spacing-lg) 0;
  margin: 0 calc(-1 * var(--spacing-lg));
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
  z-index: 10;
}

/* 네비게이션 */
.navigation-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  max-width: 800px;
  margin: 0 auto;
}

.nav-btn {
  padding: var(--spacing-md);
  font-size: 15px;
  font-weight: 600;
}

/* 완료 화면 */
.completion-view {
  padding: var(--spacing-xl) 0;
}

.completion-card {
  padding: var(--spacing-xl);
  text-align: center;
}

.completion-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-md);
}

.completion-title {
  margin: var(--spacing-md) 0;
  color: #1f2937;
}

.completion-subtitle {
  color: #6b7280;
  margin: 0 0 var(--spacing-xl) 0;
}

.score-display {
  margin-bottom: var(--spacing-xl);
}

.score-circle {
  width: 150px;
  height: 150px;
  border: 8px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-md) auto;
  transition: all 0.3s ease;
}

.score-circle.passed {
  border-color: #10b981;
  background: #f0fdf4;
}

.score-number {
  font-size: 48px;
  font-weight: 700;
  color: #1f2937;
}

.score-total {
  font-size: 20px;
  color: #6b7280;
}

.score-text {
  font-size: 18px;
  font-weight: 600;
  color: #3182F6;
  margin: 0;
}

.result-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  padding: var(--spacing-md);
  border-radius: 12px;
}

.stat-item.correct {
  background: #f0fdf4;
  border: 2px solid #bbf7d0;
}

.stat-item.incorrect {
  background: #fef2f2;
  border: 2px solid #fecaca;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.result-message {
  padding: var(--spacing-md);
  border-radius: 12px;
  margin-bottom: var(--spacing-xl);
  background: #f9fafb;
}

.result-message.passed {
  background: #f0fdf4;
  border: 2px solid #10b981;
  color: #065f46;
}

.result-message p {
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;
}

.action-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.action-btn {
  padding: var(--spacing-md);
  font-size: 16px;
  font-weight: 600;
}

/* 반응형 */
@media (max-width: 640px) {
  .common-container {
    padding: var(--spacing-md);
  }

  .progress-header {
    flex-direction: column;
    align-items: stretch;
  }

  .question-text {
    font-size: 18px;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-number {
    font-size: 36px;
  }

  .score-total {
    font-size: 16px;
  }

  .completion-icon {
    font-size: 48px;
  }

  .action-buttons {
    grid-template-columns: 1fr;
  }
}

/* 이어하기 다이얼로그 스타일 */
.resume-dialog-overlay {
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
  padding: var(--spacing-md);
}

.resume-dialog {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
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

.resume-dialog-header {
  padding: var(--spacing-xl);
  border-bottom: 1px solid #e5e7eb;
  text-align: center;
}

.resume-dialog-header h2 {
  margin: 0;
  color: #1f2937;
}

.resume-dialog-body {
  padding: var(--spacing-xl);
  text-align: center;
}

.resume-dialog-body p {
  margin: 0 0 var(--spacing-lg) 0;
  color: #4b5563;
  line-height: 1.6;
}

.resume-progress-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.progress-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  font-size: 16px;
  color: #3182F6;
  font-weight: 600;
}

.resume-dialog-actions {
  padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
  display: flex;
  gap: var(--spacing-md);
}

@media (max-width: 768px) {
  .resume-dialog-actions {
    flex-direction: column;
  }
}
</style>