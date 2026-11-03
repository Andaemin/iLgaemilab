<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLearningStore } from '@/stores/useLearningStore'

const { t } = useI18n()
const authStore = useAuthStore()
const learningStore = useLearningStore()

// Props로 받을 수도 있도록 설정
const props = defineProps({
  customStats: {
    type: Array,
    default: null
  }
})

// 실제 데이터를 기반으로 한 통계
const stats = computed(() => {
  if (props.customStats) return props.customStats

  return [
    {
      label: t('home.stats.streakDays'),
      value: learningStore.dailyGoal.streak || 0,
      icon: '🔥',
      color: 'var(--warning)'
    },
    {
      label: t('home.stats.todayStudy'),
      value: t('home.stats.minutes', { count: learningStore.dailyGoal.completedMinutes }),
      icon: '⏰',
      color: 'var(--success)'
    },
    {
      label: t('home.stats.completedTasks'),
      value: t('home.stats.tasksCount', { completed: learningStore.completedTasksCount, total: learningStore.dailyGoal.tasks.length }),
      icon: '✅',
      color: 'var(--common-blue)'
    },
    {
      label: t('home.stats.learningProgress'),
      value: t('home.stats.percent', { value: learningStore.progressPercentage }),
      icon: '📈',
      color: learningStore.isGoalCompleted ? 'var(--success)' : 'var(--info)'
    }
  ]
})

const displayStats = computed(() => stats.value)

// 컴포넌트 마운트 시 데이터 가져오기
onMounted(() => {
  // 스토어가 초기화되어 있지 않으면 가져오기
  if (!learningStore.dailyGoal.tasks.length) {
    learningStore.fetchDailyGoal()
  }
})
</script>

<template>
  <div class="stats-section">
    <div class="stats-grid">
      <div
        v-for="stat in displayStats"
        :key="stat.label"
        class="common-stat-card"
      >
        <span class="stat-icon">{{ stat.icon }}</span>
        <div class="stat-content">
          <span class="stat-value" :style="{ color: stat.color }">
            {{ stat.value }}
          </span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-section {
  margin-bottom: var(--spacing-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
}

.common-stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.common-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon {
  font-size: 28px;
  font-family: 'TossFaceFont', system-ui;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
  }

  .common-stat-card {
    padding: var(--spacing-md);
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-label {
    font-size: 12px;
  }

  .stat-icon {
    font-size: 24px;
  }
}

@media (max-width: 375px) {
  .stats-grid {
    gap: 8px;
  }

  .common-stat-card {
    padding: 12px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-label {
    font-size: 11px;
  }
}
</style>