<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import CommonButton from '@/components/common/CommonButton.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// 레벨 진행도 데이터 (테스트용으로 일부 완료 상태)
const levelProgress = ref({
  beginner: [true, true, true, true, false], // 4개 완료
  intermediate: [false, false, false, false, false],
  advanced: [false, false, false, false, false]
})

// 로딩 상태
const isLoading = ref(false)

// 현재 레벨 상태 계산
const currentLevel = computed(() => {
  // 완료된 레벨 수 계산
  const beginnerCompleted = levelProgress.value.beginner.filter(v => v).length
  const intermediateCompleted = levelProgress.value.intermediate.filter(v => v).length
  const advancedCompleted = levelProgress.value.advanced.filter(v => v).length

  const totalCompleted = beginnerCompleted + intermediateCompleted + advancedCompleted

  let currentCategory = 'beginner'
  let currentStage = 1

  // 현재 학습 중인 카테고리와 완료된 단계 수 결정
  if (beginnerCompleted < 5) {
    currentCategory = 'beginner'
    currentStage = beginnerCompleted // 완료된 단계 수
  } else if (intermediateCompleted < 5) {
    currentCategory = 'intermediate'
    currentStage = intermediateCompleted // 완료된 단계 수
  } else if (advancedCompleted < 5) {
    currentCategory = 'advanced'
    currentStage = advancedCompleted // 완료된 단계 수
  } else {
    // 모든 레벨 완료
    currentCategory = 'advanced'
    currentStage = 5
  }

  const categoryTitles = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '상급'
  }

  const lessonTitles = {
    beginner: ['기본 인사와 자기소개', '숫자와 시간 표현', '장소와 위치', '일상 생활 회화', '감정·기분 표현'],
    intermediate: ['가족·친구 소개', '날씨와 계절', '취미와 여가 활동', '병원·건강 표현', '간단한 의견·감정 표현'],
    advanced: ['길 묻기와 안내하기', '직장·업무 관련 표현', '문화·명절·사회생활', '문제 상황 대처', '자기 생각·희망 표현']
  }

  // 다음 레슨 결정
  let nextLesson = t('home.learningProgress.allLessonsCompleted')
  if (totalCompleted < 15) {
    if (currentStage < 5) {
      // 현재 카테고리에서 다음 레슨
      nextLesson = lessonTitles[currentCategory][currentStage] || t('home.learningProgress.allLessonsCompleted')
    } else {
      // 다음 카테고리의 첫 번째 레슨
      if (currentCategory === 'beginner') {
        nextLesson = lessonTitles['intermediate'][0]
      } else if (currentCategory === 'intermediate') {
        nextLesson = lessonTitles['advanced'][0]
      }
    }
  }

  // 전체 진행률 계산 (0-100%)
  const progress = Math.round((totalCompleted / 15) * 100)

  // 진행도 계산 디버깅 (개발용)
  console.log('Progress calculation:', {
    levelProgress: levelProgress.value,
    beginnerCompleted,
    intermediateCompleted,
    advancedCompleted,
    totalCompleted,
    progress,
    currentCategory,
    currentStage
  })

  return {
    level: categoryTitles[currentCategory],
    stage: currentStage,
    totalStages: 5,
    nextLesson: nextLesson,
    progress: progress,
    completedLessons: totalCompleted,
    totalLessons: 15,
    currentCategory: currentCategory
  }
})

// DB에서 레벨 진행도 가져오기
const fetchLevelProgress = async () => {
  if (!authStore.isAuthenticated || !authStore.token) {
    console.log('User not authenticated, using default progress')
    return
  }

  isLoading.value = true
  try {
    const response = await axios.get('/api/learning/level-progress', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      levelProgress.value = response.data.progress
      console.log('Level progress loaded:', response.data.progress)
    } else {
      console.warn('Failed to fetch progress, using default')
    }
  } catch (error) {
    console.error('Failed to fetch level progress:', error)
    // API 실패 시에도 기본값 유지
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  // 인증 상태와 관계없이 기본 UI 표시
  console.log('LearningProgress mounted, auth status:', authStore.isAuthenticated)

  if (authStore.isAuthenticated) {
    await fetchLevelProgress()
  } else {
    console.log('Not authenticated, showing default progress')
  }
})

const startNextLesson = () => {
  // 다음 학습할 레벨로 이동
  const nextLevel = getNextLevel()
  if (nextLevel) {
    router.push({
      name: 'learn-level',
      params: {
        category: nextLevel.category,
        level: nextLevel.level
      }
    })
  } else {
    router.push('/learn')
  }
}

const getNextLevel = () => {
  // 초급부터 확인
  for (let i = 0; i < 5; i++) {
    if (!levelProgress.value.beginner[i]) {
      return { category: 'beginner', level: i + 1 }
    }
  }

  // 중급 확인
  for (let i = 0; i < 5; i++) {
    if (!levelProgress.value.intermediate[i]) {
      return { category: 'intermediate', level: i + 1 }
    }
  }

  // 상급 확인
  for (let i = 0; i < 5; i++) {
    if (!levelProgress.value.advanced[i]) {
      return { category: 'advanced', level: i + 1 }
    }
  }

  return null // 모든 레벨 완료
}

const viewAllLessons = () => {
  router.push('/learn')
}
</script>

<template>
  <section class="learning-progress-section">
    <h2 class="section-title">{{ t('home.learningProgress.title') }}</h2>

    <div class="progress-card" :class="{ loading: isLoading }">
      <!-- 로딩 상태 -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>{{ t('home.learningProgress.loading') }}</p>
      </div>

      <!-- 레벨 헤더 -->
      <div class="level-header">
        <div class="level-info">
          <span class="level-badge">{{ currentLevel.level }}</span>
          <span class="level-stage">{{ t('home.learningProgress.stage', { current: currentLevel.stage, total: currentLevel.totalStages }) }}</span>
        </div>
        <span class="progress-percentage">{{ currentLevel.progress }}%</span>
      </div>

      <!-- 프로그레스 바 -->
      <div class="progress-bar-container">
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${currentLevel.progress}%` }"
            :data-progress="currentLevel.progress"
          ></div>
        </div>
      </div>

      <!-- 레슨 정보 -->
      <div class="lesson-info">
        <div class="lesson-details">
          <p class="next-lesson-label">{{ t('home.learningProgress.nextLesson') }}</p>
          <h3 class="next-lesson-title">{{ currentLevel.nextLesson }}</h3>
          <p class="lessons-count">
            {{ t('home.learningProgress.lessonsCompleted', { completed: currentLevel.completedLessons, total: currentLevel.totalLessons }) }}
          </p>
        </div>
        <div class="lesson-icon">
          <span>📖</span>
        </div>
      </div>

      <!-- 액션 버튼들 -->
      <div class="action-buttons">
        <CommonButton
          variant="secondary"
          size="medium"
          @click="viewAllLessons"
        >
          {{ t('home.learningProgress.viewAllLessons') }}
        </CommonButton>
        <CommonButton
          variant="primary"
          size="medium"
          @click="router.push('/learn')"
        >
          {{ t('home.learningProgress.startLearning') }}
        </CommonButton>
      </div>
    </div>
  </section>
</template>

<style scoped>
.learning-progress-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-lg);
}

.progress-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  position: relative;
  min-height: 200px;
}

.progress-card.loading {
  opacity: 0.7;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--common-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
}

/* Level Header */
.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.level-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  background: var(--common-blue);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
}

.level-stage {
  font-size: 14px;
  color: var(--gray-600);
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
  color: var(--common-blue);
}

/* Progress Bar */
.progress-bar-container {
  margin-bottom: 32px;
}

.progress-bar {
  height: 12px;
  background: #F1F5F9;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: #3182F6; /* Common Blue */
  border-radius: 6px;
  transition: width 0.5s ease;
  min-width: 0;
}

/* Lesson Info */
.lesson-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
}

.lesson-details {
  flex: 1;
}

.next-lesson-label {
  font-size: 12px;
  color: var(--gray-500);
  margin-bottom: 4px;
}

.next-lesson-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 8px;
}

.lessons-count {
  font-size: 14px;
  color: var(--gray-600);
}

.lesson-icon {
  font-size: 40px;
  font-family: 'TossFaceFont', system-ui;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
}

.action-buttons .common-button {
  flex: 1;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .learning-progress-section {
    margin-bottom: var(--spacing-xl);
  }

  .section-title {
    font-size: 18px;
    margin-bottom: var(--spacing-md);
  }

  .progress-card {
    padding: var(--spacing-lg);
  }

  .level-header {
    margin-bottom: var(--spacing-md);
  }

  .level-badge {
    font-size: 11px;
    padding: 3px 10px;
  }

  .level-stage {
    font-size: 12px;
  }

  .progress-percentage {
    font-size: 20px;
  }

  .progress-bar {
    height: 10px;
  }

  .lesson-info {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-md);
  }

  .next-lesson-label {
    font-size: 11px;
  }

  .next-lesson-title {
    font-size: 16px;
  }

  .lessons-count {
    font-size: 12px;
  }

  .lesson-icon {
    font-size: 32px;
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
}

@media (max-width: 375px) {
  .progress-card {
    padding: var(--spacing-md);
  }

  .progress-percentage {
    font-size: 18px;
  }

  .next-lesson-title {
    font-size: 14px;
  }

  .lesson-icon {
    font-size: 28px;
  }
}
</style>