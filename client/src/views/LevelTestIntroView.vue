<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'

const { t, tm } = useI18n()
const router = useRouter()

const testInfo = computed(() => [
  { icon: '⏱️', title: t('levelTest.intro.duration'), description: t('levelTest.intro.durationValue') },
  { icon: '📝', title: t('levelTest.intro.questionCount'), description: t('levelTest.intro.questionCountValue') },
  { icon: '🎯', title: t('levelTest.intro.evaluationItems'), description: t('levelTest.intro.evaluationItemsValue') },
])

const instructions = computed(() => tm('levelTest.intro.instructions'))

const startTest = () => {
  router.push('/level-test')
}

const goBack = () => {
  router.push('/home')
}
</script>

<template>
  <div class="intro-page">
    <div class="intro-container">
      <CommonCard class="intro-card">
        <!-- Header -->
        <div class="intro-header">
          <span class="intro-icon">📊</span>
          <h1>{{ t('levelTest.intro.title') }}</h1>
          <p class="intro-subtitle">
            {{ t('levelTest.intro.subtitle') }}
          </p>
        </div>

        <!-- Test Info Grid -->
        <div class="test-info-grid">
          <div v-for="item in testInfo" :key="item.title" class="info-item">
            <span class="info-icon">{{ item.icon }}</span>
            <div class="info-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="instructions-section">
          <h2>{{ t('levelTest.intro.checklistTitle') }}</h2>
          <div class="instruction-list">
            <div v-for="item in instructions" :key="item" class="instruction-item">
              <span class="check-icon">✓</span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <CommonButton
            variant="secondary"
            size="large"
            @click="goBack"
          >
            {{ t('levelTest.intro.later') }}
          </CommonButton>
          <CommonButton
            variant="primary"
            size="large"
            @click="startTest"
          >
            {{ t('levelTest.intro.start') }}
          </CommonButton>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<style scoped>
.intro-page {
  min-height: 100vh;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.intro-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.intro-card {
  padding: var(--spacing-2xl);
}

/* Header */
.intro-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.intro-icon {
  font-size: 64px;
  font-family: 'TossFaceFont', system-ui;
  display: block;
  margin-bottom: var(--spacing-lg);
}

.intro-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.intro-subtitle {
  font-size: 16px;
  color: var(--gray-600);
  line-height: 1.5;
}

/* Test Info Grid */
.test-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.info-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.info-icon {
  font-size: 32px;
  font-family: 'TossFaceFont', system-ui;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.info-content p {
  font-size: 16px;
  font-weight: 700;
  color: var(--common-blue);
}

/* Instructions */
.instructions-section {
  margin-bottom: var(--spacing-2xl);
}

.instructions-section h2 {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-lg);
}

.instruction-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--gray-700);
}

.check-icon {
  color: var(--success);
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.action-buttons .common-button {
  flex: 1;
  max-width: 200px;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .intro-page {
    padding: 0;
    align-items: flex-start;
  }

  .intro-container {
    width: 100%;
    max-width: 100%;
  }

  .intro-card {
    padding: var(--spacing-lg);
    box-shadow: none;
    border-radius: 0;
  }

  .intro-header {
    margin-bottom: var(--spacing-lg);
  }

  .intro-icon {
    font-size: 48px;
    margin-bottom: var(--spacing-md);
  }

  .intro-header h1 {
    font-size: 24px;
    margin-bottom: var(--spacing-xs);
  }

  .intro-subtitle {
    font-size: 14px;
  }

  .test-info-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .info-item {
    gap: var(--spacing-sm);
  }

  .info-icon {
    font-size: 24px;
  }

  .info-content h3 {
    font-size: 12px;
  }

  .info-content p {
    font-size: 14px;
  }

  .instructions-section {
    margin-bottom: var(--spacing-lg);
  }

  .instructions-section h2 {
    font-size: 18px;
    margin-bottom: var(--spacing-md);
  }

  .instruction-list {
    gap: var(--spacing-xs);
  }

  .instruction-item {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 13px;
    gap: var(--spacing-sm);
  }

  .check-icon {
    font-size: 14px;
  }

  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .action-buttons .common-button {
    width: 100%;
    max-width: 100%;
  }
}

/* Tablet Responsive */
@media (min-width: 481px) and (max-width: 768px) {
  .intro-card {
    padding: var(--spacing-xl);
  }

  .test-info-grid {
    grid-template-columns: 1fr;
    padding: var(--spacing-lg);
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .common-button {
    width: 100%;
    max-width: 100%;
  }
}
</style>