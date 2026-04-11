<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import LoadingDialog from '@/components/common/LoadingDialog.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(true)
const loadingMessage = ref('채점 중입니다...')
const testResult = ref(null)
const showDetails = ref(false)

// 레벨별 색상 매핑
const levelColors = {
  0: '#6B7280', // gray
  1: '#10B981', // green
  2: '#3B82F6', // blue
  3: '#8B5CF6', // purple
  4: '#EF4444', // red
}

const levelNames = {
  0: '초급',
  1: '초중급',
  2: '중급',
  3: '중상급',
  4: '고급'
}

const scorePercentage = computed(() => {
  if (!testResult.value) return 0
  // 100점 만점 기준
  return testResult.value.score
})

const scoreColor = computed(() => {
  const percentage = scorePercentage.value
  if (percentage >= 80) return 'var(--success)'
  if (percentage >= 60) return 'var(--common-blue)'
  if (percentage >= 40) return 'var(--warning)'
  return 'var(--danger)'
})

const fetchTestResult = async () => {
  try {
    // 세션 ID 가져오기
    const sessionId = localStorage.getItem('levelTestSessionId') || router.currentRoute.value.params.sessionId

    if (!sessionId) {
      // 세션 ID가 없으면 테스트 페이지로
      router.push('/level-test-intro')
      return
    }

    const token = localStorage.getItem('token')
    const response = await axios.get(`/api/level-test/result/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.data.success) {
      // 결과 데이터 매핑
      testResult.value = {
        levelNumber: response.data.currentLevel,
        score: response.data.totalScore,
        testDate: response.data.testDate,
        levelName: response.data.levelName,
        koreanLevel: response.data.levelDescription,
        evaluationDetails: response.data.detailedResults?.map(result => ({
          questionNumber: result.questionNumber,
          questionType: result.questionType,
          score: result.score,
          maxScore: result.maxScore || 20,
          isCorrect: result.isCorrect,
          feedback: result.feedback,
          userAnswer: result.userAnswer
        })) || [],
        feedback: response.data.feedback
      }
    } else {
      router.push('/level-test-intro')
    }
  } catch (error) {
    console.error('Failed to fetch test result:', error)
    // 로컬 스토리지에서 세션 ID 제거
    localStorage.removeItem('levelTestSessionId')
    router.push('/level-test-intro')
  } finally {
    isLoading.value = false
  }
}

const getQuestionTypeIcon = (type) => {
  const icons = {
    listening: '🎧',
    reading: '📖',
    writing: '✍️',
    short_answer: '✍️',
    speaking: '🎤'
  }
  return icons[type] || '📝'
}

const getQuestionTypeLabel = (type) => {
  const labels = {
    listening: '듣기',
    reading: '읽기',
    writing: '쓰기',
    short_answer: '쓰기',
    speaking: '말하기'
  }
  return labels[type] || '기타'
}

const goToHome = () => {
  router.push('/home')
}

const retakeTest = async () => {
  // DB에서 테스트 기록 초기화 (관리자만 가능하도록 해야 함)
  if (confirm('레벨 테스트를 다시 보시겠습니까?\n(이전 결과는 삭제됩니다)')) {
    router.push('/level-test')
  }
}

onMounted(() => {
  fetchTestResult()
})
</script>

<template>
  <div class="level-test-result-container">
    <LoadingDialog
      v-model="isLoading"
      :message="loadingMessage"
      submessage="잠시만 기다려주세요..."
    />

    <div v-if="!isLoading && testResult" class="result-content">
      <!-- 헤더 -->
      <div class="result-header">
        <h1 class="result-title">레벨 테스트 결과</h1>
        <p class="result-subtitle">{{ authStore.user?.name }}님의 한국어 실력을 평가했습니다</p>
      </div>

      <!-- 메인 결과 카드 -->
      <CommonCard class="main-result-card">
        <!-- 상단: 레벨과 점수를 나란히 -->
        <div class="result-summary">
          <div class="level-section">
            <div class="level-badge" :style="{ backgroundColor: levelColors[testResult.levelNumber || 0] }">
              Level {{ testResult.levelNumber || 0 }}
            </div>
            <h2 class="level-name">{{ levelNames[testResult.levelNumber || 0] }}</h2>
          </div>

          <div class="score-section">
            <div class="score-circle">
              <svg viewBox="0 0 100 100" class="score-svg">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--gray-200)"
                  stroke-width="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  :stroke="scoreColor"
                  stroke-width="8"
                  stroke-linecap="round"
                  :stroke-dasharray="`${scorePercentage * 2.83} 283`"
                  transform="rotate(-90 50 50)"
                  class="score-progress"
                />
              </svg>
              <div class="score-text">
                <span class="score-value">{{ testResult.score }}</span>
                <span class="score-label">점</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 하단: 설명 -->
        <div class="result-description">
          <p class="level-description">{{ testResult.koreanLevel }}</p>
        </div>
      </CommonCard>

      <!-- 간단한 통계 카드들 -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-label">총 문제</div>
            <div class="stat-value">{{ testResult.evaluationDetails.length }}개</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-label">정답</div>
            <div class="stat-value">{{ testResult.evaluationDetails.filter(d => d.isCorrect).length }}개</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <div class="stat-label">정답률</div>
            <div class="stat-value">{{ Math.round((testResult.evaluationDetails.filter(d => d.isCorrect).length / testResult.evaluationDetails.length) * 100) }}%</div>
          </div>
        </div>
      </div>

      <!-- 상세 결과 -->
      <CommonCard class="detail-card">
        <div class="detail-header" @click="showDetails = !showDetails">
          <h3>문제별 상세 결과</h3>
          <span class="toggle-icon">{{ showDetails ? '▼' : '▶' }}</span>
        </div>

        <Transition name="details">
          <div v-if="showDetails" class="detail-content">
            <div
              v-for="(detail, index) in testResult.evaluationDetails"
              :key="index"
              class="question-result"
            >
              <div class="question-header">
                <span class="question-number">문제 {{ detail.questionNumber }}</span>
                <span class="question-icon">{{ getQuestionTypeIcon(detail.questionType) }}</span>
                <span class="question-type">{{ getQuestionTypeLabel(detail.questionType) }}</span>
                <span class="question-score" :class="{ correct: detail.isCorrect }">
                  {{ detail.score }} / {{ detail.maxScore }}점
                </span>
              </div>
              <div v-if="detail.feedback" class="question-feedback">
                <p v-if="typeof detail.feedback === 'string'">{{ detail.feedback }}</p>
                <div v-else>
                  <p v-if="detail.feedback.feedback">{{ detail.feedback.feedback }}</p>
                  <p v-else-if="detail.feedback.message">{{ detail.feedback.message }}</p>

                  <!-- 개선점 표시 -->
                  <div v-if="detail.feedback.improvements && detail.feedback.improvements.length > 0" class="improvements">
                    <strong>개선점:</strong>
                    <ul>
                      <li v-for="(imp, i) in detail.feedback.improvements" :key="i">{{ imp }}</li>
                    </ul>
                  </div>

                  <!-- 수정된 답변 -->
                  <div v-if="detail.feedback.correctedAnswer" class="corrected-answer">
                    <strong>수정된 답변:</strong> {{ detail.feedback.correctedAnswer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </CommonCard>

      <!-- 추천 학습 -->
      <CommonCard class="recommendation-card">
        <h3>추천 학습 과정</h3>
        <p class="recommendation-text">
          {{ levelNames[testResult.levelNumber || 0] }} 레벨에 맞는 학습 콘텐츠를 준비했습니다.
        </p>
        <ul class="recommendation-list">
          <li v-if="testResult.levelNumber <= 1">기초 한글 및 발음 연습</li>
          <li v-if="testResult.levelNumber <= 2">일상 회화 표현 학습</li>
          <li v-if="testResult.levelNumber >= 2">직장 상황 대화 연습</li>
          <li v-if="testResult.levelNumber >= 3">비즈니스 한국어 학습</li>
          <li>매일 10분 단어 학습</li>
        </ul>
      </CommonCard>

      <!-- 액션 버튼 -->
      <div class="action-buttons">
        <CommonButton variant="primary" size="large" @click="goToHome">
          학습 시작하기
        </CommonButton>
        <!-- 관리자만 볼 수 있도록 나중에 조건 추가 필요 -->
        <!-- <CommonButton variant="secondary" size="large" @click="retakeTest">
          다시 테스트하기
        </CommonButton> -->
      </div>
    </div>
  </div>
</template>

<style scoped>
.level-test-result-container {
  min-height: 100vh;
  background: var(--gray-50);
  padding: var(--spacing-xl);
}

.result-content {
  max-width: 800px;
  margin: 0 auto;
}

.result-header {
  text-align: center;
  color: var(--gray-900);
  margin-bottom: var(--spacing-2xl);
}

.result-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: var(--spacing-md);
}

.result-subtitle {
  font-size: 18px;
  color: var(--gray-600);
}

.main-result-card {
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
}

.result-summary {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: var(--spacing-2xl);
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.level-section {
  text-align: center;
}

.level-badge {
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-full);
  color: white;
  font-weight: 700;
  font-size: 18px;
  margin-bottom: var(--spacing-md);
}

.level-name {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.score-section {
  display: flex;
  justify-content: center;
}

.score-circle {
  position: relative;
  width: 160px;
  height: 160px;
}

.result-description {
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
  text-align: center;
}

.level-description {
  font-size: 16px;
  color: var(--gray-600);
  margin: 0;
}

/* 통계 그리드 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}

.score-svg {
  width: 100%;
  height: 100%;
}

.score-progress {
  transition: stroke-dasharray 1s ease;
}

.score-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--gray-900);
  display: block;
}

.score-label {
  font-size: 18px;
  color: var(--gray-600);
  display: block;
}

.detail-card {
  margin-bottom: var(--spacing-xl);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: var(--spacing-md) 0;
}

.detail-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
}

.toggle-icon {
  color: var(--gray-600);
  transition: transform 0.3s;
}

.detail-content {
  padding: 0;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--gray-200);
}

.question-result {
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--gray-100);
}

.question-result:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.question-icon {
  font-size: 24px;
}

.question-type {
  font-weight: 600;
  color: var(--gray-700);
}

.question-score {
  margin-left: auto;
  font-weight: 600;
  color: var(--danger);
}

.question-score.correct {
  color: var(--success);
}

.question-number {
  font-weight: 600;
  color: var(--gray-800);
  margin-right: 8px;
}

.question-feedback {
  margin-left: 40px;
  padding: var(--spacing-sm);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--gray-700);
}

.question-feedback .improvements {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--gray-200);
}

.question-feedback .improvements ul {
  margin: 4px 0 0 20px;
  padding: 0;
}

.question-feedback .corrected-answer {
  margin-top: 8px;
  padding: 8px;
  background: var(--info-light);
  border-radius: var(--radius-sm);
  color: var(--info);
}

.recommendation-card {
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-xl);
}

.recommendation-card h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-md);
}

.recommendation-text {
  color: var(--gray-600);
  margin-bottom: var(--spacing-lg);
}

.recommendation-list {
  list-style: none;
  padding: 0;
}

.recommendation-list li {
  padding: var(--spacing-sm) 0;
  padding-left: 24px;
  position: relative;
  color: var(--gray-700);
}

.recommendation-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success);
  font-weight: 700;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

/* 트랜지션 */
.details-enter-active,
.details-leave-active {
  transition: all 0.3s ease;
}

.details-enter-from,
.details-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 반응형 */
@media (max-width: 768px) {
  .result-summary {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-value {
    font-size: 32px;
  }

  .level-name {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: var(--spacing-md);
  }

  .stat-value {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .result-summary {
    gap: var(--spacing-md);
  }

  .main-result-card {
    padding: var(--spacing-lg);
  }
}
</style>