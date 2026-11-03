<script setup>
import { onMounted } from 'vue'
import gsap from 'gsap'
import CommonCard from '@/components/common/CommonCard.vue'

const props = defineProps({
  scenarios: {
    type: Array,
    required: true
  },
  category: {
    type: Object,
    default: () => ({ icon: '📚', name: '학습' })
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select', 'back'])

const getDifficultyColor = (difficulty) => {
  const colors = {
    beginner: { bg: '#E8F5E9', text: '#2E7D32' },
    intermediate: { bg: '#E3F2FD', text: '#1565C0' },
    advanced: { bg: '#FCE4EC', text: '#C2185B' }
  }
  return colors[difficulty] || colors.beginner
}

const getDifficultyLabel = (difficulty) => {
  const labels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[difficulty] || '초급'
}

const selectScenario = (scenario, index) => {
  gsap.to(`.scenario-item-${index}`, {
    scale: 0.98,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      emit('select', scenario)
    }
  })
}

onMounted(() => {
  // 페이지 진입 애니메이션
  gsap.fromTo('.page-header',
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  )

  gsap.fromTo('.scenario-item',
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.2
    }
  )
})
</script>

<template>
  <div class="scenario-selector">
    <div class="common-container">
      <div class="page-header">
        <button class="back-button" @click="$emit('back')">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <div class="header-content">
          <div class="category-badge">
            <span class="badge-icon">{{ category.icon }}</span>
            <span class="badge-text">{{ category.name }}</span>
          </div>
          <h1 class="common-title2">상황을 선택하세요</h1>
        </div>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="common-loading"></div>
        <p class="common-body2 text-secondary">시나리오를 불러오는 중...</p>
      </div>

      <div v-else class="scenarios-list">
        <CommonCard
          v-for="(scenario, index) in scenarios"
          :key="scenario.id"
          :class="`scenario-item scenario-item-${index}`"
          :clickable="true"
          :padding="'none'"
          @click="selectScenario(scenario, index)"
        >
          <div class="scenario-content">
            <div class="scenario-header">
              <h3 class="common-title3">{{ scenario.titleKo }}</h3>
              <span
                class="difficulty-badge"
                :style="{
                  background: getDifficultyColor(scenario.difficulty).bg,
                  color: getDifficultyColor(scenario.difficulty).text
                }"
              >
                {{ getDifficultyLabel(scenario.difficulty) }}
              </span>
            </div>

            <p class="scenario-context common-body2 text-secondary">
              {{ scenario.context }}
            </p>

            <div class="scenario-meta">
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V8L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span class="common-caption">약 {{ scenario.dialogues?.length || 0 }}분</span>
              </div>
              <div class="meta-item">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6C4 6 6 2 8 2C10 2 12 6 12 6C12 6 10 14 8 14C6 14 4 6 4 6Z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <span class="common-caption">대화 {{ scenario.dialogues?.length || 0 }}개</span>
              </div>
            </div>
          </div>
        </CommonCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-selector {
  padding: 60px 0 100px;
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  padding: 0 20px;
}

.back-button {
  width: 48px;
  height: 48px;
  border: none;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.back-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.back-button:active {
  transform: translateY(0);
}

.header-content {
  flex: 1;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--gray-50);
  border-radius: 100px;
  margin-bottom: 12px;
}

.badge-icon {
  font-size: 20px;
}

.badge-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.scenarios-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 20px;
}

.scenario-item {
  cursor: pointer;
  transition: all 0.2s;
}

.scenario-content {
  padding: 20px;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
}

.scenario-header h3 {
  flex: 1;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 600;
}

.scenario-context {
  margin-bottom: 16px;
  line-height: 1.5;
}

.scenario-meta {
  display: flex;
  gap: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-500);
}

.meta-item svg {
  color: var(--gray-400);
}

.text-secondary {
  color: var(--gray-600);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .scenario-selector {
    padding: 56px 0 100px;
  }

  .page-header {
    padding: 0 16px;
  }

  .scenarios-list {
    padding: 0 16px;
  }

  .scenario-content {
    padding: 16px;
  }
}
</style>