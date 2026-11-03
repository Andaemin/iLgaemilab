<script setup>
import { computed, onMounted, watch, ref, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLearningStore } from '@/stores/useLearningStore'
import { useLoadingStore } from '@/stores/useLoadingStore'

const { t } = useI18n()
const learningStore = useLearningStore()
const loadingStore = useLoadingStore()

// 실제 세션 시간 추적
const sessionStartTime = ref(Date.now())
const currentSessionMinutes = ref(0)
let sessionInterval = null

// 세션 시간 업데이트
const updateSessionTime = () => {
  const elapsed = Date.now() - sessionStartTime.value
  currentSessionMinutes.value = Math.floor(elapsed / (1000 * 60))
}

onMounted(() => {
  // 매 10초마다 세션 시간 업데이트
  sessionInterval = setInterval(updateSessionTime, 10000)
})

onBeforeUnmount(() => {
  if (sessionInterval) {
    clearInterval(sessionInterval)
  }
})

// 스토어에서 데이터 가져오기
const dailyGoal = computed(() => learningStore.dailyGoal)
const progressPercentage = computed(() => learningStore.progressPercentage)
const completedTasksCount = computed(() => learningStore.completedTasksCount)
const isGoalCompleted = computed(() => learningStore.isGoalCompleted)

// 태스크 토글 함수 - 체크 해제만 가능 (완료는 자동)
const toggleTask = async (taskId) => {
  const task = dailyGoal.value.tasks.find(t => t.id === taskId)
  if (task && task.completed) {
    // 이미 완료된 태스크만 체크 해제 가능
    await learningStore.updateTask(taskId, false)
  }
}

// 완료 메시지 표시
const showCompletionMessage = (task) => {
  // 여기에 토스트 메시지나 알림을 추가할 수 있음
  console.log(`🎉 ${task.title} 완료!`)
}

// 진도 색상 결정
const getProgressColor = computed(() => {
  const percentage = progressPercentage.value
  if (percentage >= 100) return 'var(--success)'
  if (percentage >= 70) return 'var(--common-blue)'
  if (percentage >= 30) return 'var(--warning)'
  return 'var(--gray-400)'
})

// 스트릭 표시 여부
const showStreak = computed(() => dailyGoal.value.streak > 0)

// 컴포넌트 마운트 시 데이터 가져오기
onMounted(async () => {
  loadingStore.startLoading('목표 불러오는 중...')
  await learningStore.fetchDailyGoal()
  loadingStore.stopLoading()
})

// 목표 완료 시 효과
watch(isGoalCompleted, (newValue) => {
  if (newValue) {
    // 목표 달성 시 축하 효과
    console.log('🎆 오늘의 목표를 달성했습니다!')
  }
})
</script>

<template>
  <section class="daily-goal-section">
    <h2 class="section-title">
      {{ t('home.dailyGoal.title') }}
      <span class="streak-badge" v-if="showStreak">
        🔥 {{ t('home.dailyGoal.streak', { count: dailyGoal.streak }) }}
      </span>
    </h2>

    <div class="goal-card">
      <!-- 진도 상황 -->
      <div class="goal-progress">
        <div class="progress-header">
          <span class="progress-label">{{ t('home.dailyGoal.studyTime') }}</span>
          <span class="progress-time">
            <strong>{{ t('home.stats.minutes', { count: currentSessionMinutes }) }}</strong>
          </span>
        </div>
        
        <div class="circular-progress">
          <svg viewBox="0 0 100 100" class="progress-svg">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--gray-100)"
              stroke-width="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              :stroke="getProgressColor"
              stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="`${progressPercentage * 2.83} 283`"
              transform="rotate(-90 50 50)"
              class="progress-circle"
            />
          </svg>
          <div class="progress-text">
            <span class="progress-value">{{ progressPercentage }}%</span>
            <span class="progress-status" v-if="isGoalCompleted">🎉 {{ t('home.dailyGoal.completed') }}</span>
            <span class="progress-status" v-else>{{ t('home.dailyGoal.fighting') }}</span>
          </div>
        </div>
      </div>

      <!-- 태스크 리스트 -->
      <div class="task-list">
        <h3 class="task-list-title">
          {{ t('home.dailyGoal.tasks') }}
          <span class="task-count">
            {{ t('home.dailyGoal.tasksCount', { completed: completedTasksCount, total: dailyGoal.tasks.length }) }}
            <span v-if="dailyGoal.totalTaskCompletions > 0" class="total-completions">
              {{ t('home.dailyGoal.totalCompletions', { count: dailyGoal.totalTaskCompletions }) }}
            </span>
          </span>
        </h3>
        <div class="tasks">
          <div
            v-for="task in dailyGoal.tasks"
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <span class="task-check">
              <span v-if="task.completed">✓</span>
            </span>
            <span class="task-title">
              {{ task.titleKey ? t(task.titleKey) : task.title }}
              <span v-if="task.completionCount > 0" class="completion-count">
                {{ t('home.dailyGoal.completionCount', { count: task.completionCount }) }}
              </span>
            </span>
            <span class="task-points" v-if="task.points">
              +{{ task.points }}🎆
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.daily-goal-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.streak-badge {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  background: var(--warning-light);
  color: var(--warning);
  border-radius: var(--radius-full);
}

.goal-card {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-xl);
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--spacing-xl);
  align-items: center;
}

/* Progress Section */
.goal-progress {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.progress-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  font-size: 14px;
}

.progress-label {
  color: var(--gray-600);
}

.progress-time {
  color: var(--gray-700);
}

.progress-time strong {
  color: var(--common-blue);
  font-weight: 700;
}

/* Circular Progress */
.circular-progress {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-svg {
  width: 100%;
  height: 100%;
}

.progress-circle {
  transition: stroke-dasharray 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
}

.progress-status {
  display: block;
  font-size: 12px;
  color: var(--gray-600);
  margin-top: 4px;
}

/* Task List */
.task-list {
  flex: 1;
}

.task-list-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-md);
}

.task-count {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 400;
}

.total-completions {
  color: var(--success);
  font-weight: 500;
}

.tasks {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.task-item.completed {
  background: var(--success-light);
  opacity: 1;
}

.task-check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gray-300);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  background: white;
  transition: all var(--transition-fast);
}

.task-item.completed .task-check {
  background: var(--success);
  border-color: var(--success);
}

.task-title {
  font-size: 14px;
  color: var(--gray-700);
  flex: 1;
  transition: all var(--transition-fast);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--gray-500);
}

.task-points {
  font-size: 12px;
  color: var(--warning);
  font-weight: 600;
  margin-left: auto;
}

.completion-count {
  font-size: 12px;
  color: var(--success);
  font-weight: 500;
  margin-left: 8px;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .daily-goal-section {
    margin-bottom: var(--spacing-xl);
  }

  .section-title {
    font-size: 18px;
    margin-bottom: var(--spacing-md);
    flex-wrap: wrap;
  }

  .streak-badge {
    font-size: 12px;
    padding: 3px 10px;
  }

  .goal-card {
    padding: var(--spacing-lg);
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .goal-progress {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }

  .progress-header {
    flex: 1;
    margin-bottom: 0;
    margin-right: var(--spacing-lg);
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: var(--spacing-xs);
  }

  .circular-progress {
    width: 100px;
    height: 100px;
  }

  .progress-value {
    font-size: 24px;
  }

  .progress-status {
    font-size: 11px;
  }

  .task-list-title {
    font-size: 14px;
  }

  .task-count {
    font-size: 12px;
  }

  .tasks {
    gap: var(--spacing-xs);
  }

  .task-item {
    padding: var(--spacing-sm) var(--spacing-md);
  }

  .task-title {
    font-size: 13px;
  }

  .task-check {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 375px) {
  .goal-card {
    padding: var(--spacing-md);
  }

  .circular-progress {
    width: 80px;
    height: 80px;
  }

  .progress-value {
    font-size: 20px;
  }

  .task-item {
    padding: 10px 12px;
    gap: 10px;
  }

  .task-title {
    font-size: 12px;
  }
}
</style>