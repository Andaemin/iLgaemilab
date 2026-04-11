<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import AppHeader from '@/components/common/AppHeader.vue'
import UserGreeting from '@/components/home/UserGreeting.vue'
import StatsGrid from '@/components/home/StatsGrid.vue'
import QuickActions from '@/components/home/QuickActions.vue'
import LearningProgress from '@/components/home/LearningProgress.vue'
import DailyGoal from '@/components/home/DailyGoal.vue'
import CommonButton from '@/components/common/CommonButton.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// User data
const hasCompletedLevelTest = computed(() => authStore.hasCompletedLevelTest)

// Navigation
const startLevelTest = () => {
  router.push('/level-test-intro')
}
</script>

<template>
  <div class="common-page">
    <!-- Header Component -->
    <AppHeader />

    <!-- Main Content -->
    <main class="home-content">
      <div class="common-container-lg">
        <!-- User Greeting Component -->
        <UserGreeting />

        <!-- Level Test Alert (if not completed) -->
        <div v-if="!hasCompletedLevelTest" class="alert-banner common-animate-fade-in">
          <div class="alert-content">
            <div class="alert-icon">📝</div>
            <div class="alert-text">
              <h3 class="common-title2">{{ t('home.levelTest.title') }}</h3>
              <p class="common-body2">{{ t('home.levelTest.subtitle') }}</p>
            </div>
            <CommonButton variant="primary" @click="startLevelTest">
              {{ t('home.levelTest.start') }}
            </CommonButton>
          </div>
        </div>

        <!-- Stats Grid Component -->
        <StatsGrid v-else />

        <!-- Quick Actions Component -->
        <QuickActions />

        <!-- Learning Progress Component -->
        <LearningProgress />

        <!-- Daily Goal Component -->
        <DailyGoal />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Main Content */
.home-content {
  padding: var(--spacing-lg) 0;
}

/* Alert Banner */
.alert-banner {
  background: linear-gradient(135deg, var(--common-blue-light), var(--info-light));
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.alert-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.alert-icon {
  font-size: 48px;
  font-family: 'TossFaceFont', system-ui;
  flex-shrink: 0;
}

.alert-text {
  flex: 1;
}

.alert-text h3 {
  margin-bottom: var(--spacing-xs);
  color: var(--gray-900);
}

.alert-text p {
  color: var(--gray-600);
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .common-header {
    padding: var(--spacing-lg) 0 var(--spacing-md) 0;
  }

  .user-name {
    font-size: 14px;
  }

  /* Alert Banner */
  .alert-banner {
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .alert-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .alert-icon {
    font-size: 36px;
  }

  .alert-text h3 {
    font-size: 16px;
  }

  .alert-text p {
    font-size: 14px;
  }

  /* Bottom padding for navigation */
  .common-page {
    padding-bottom: calc(56px + env(safe-area-inset-bottom) + var(--spacing-lg));
  }
}

/* Tablet Responsive */
@media (min-width: 481px) and (max-width: 768px) {
  .alert-content {
    gap: var(--spacing-md);
  }

  .alert-icon {
    font-size: 40px;
  }
}

/* Small Mobile (iPhone SE, etc.) */
@media (max-width: 375px) {
  .user-name {
    font-size: 13px;
  }
}
</style>