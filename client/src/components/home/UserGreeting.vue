<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'

const { t } = useI18n()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.name || t('home.greeting'))

// 현재 시간대에 따른 인사말과 이모지
const getTimeInfo = () => {
  const hour = new Date().getHours()
  if (hour < 6) {
    return { greetingKey: 'home.greetings.dawn', emoji: '🌙' }
  } else if (hour < 12) {
    return { greetingKey: 'home.greetings.morning', emoji: '☀️' }
  } else if (hour < 17) {
    return { greetingKey: 'home.greetings.afternoon', emoji: '🌤️' }
  } else if (hour < 20) {
    return { greetingKey: 'home.greetings.evening', emoji: '🌆' }
  } else {
    return { greetingKey: 'home.greetings.night', emoji: '🌃' }
  }
}

const timeInfo = getTimeInfo()
const greeting = computed(() => t(timeInfo.greetingKey))
const timeEmoji = timeInfo.emoji

// 학습 격려 메시지 - 번역된 배열에서 랜덤 선택
const getRandomEncouragement = () => {
  const randomIndex = Math.floor(Math.random() * 4) // 0-3
  return `home.encouragements[${randomIndex}]`
}

const encouragement = computed(() => t(getRandomEncouragement()))
</script>

<template>
  <div class="greeting-container">
    <div class="greeting-content">
      <div class="greeting-header">
        <span class="time-emoji">{{ timeEmoji }}</span>
        <div class="greeting-text">
          <p class="user-greeting">{{ greeting }},</p>
          <h1 class="user-name">{{ t('common.userName', { name: userName }) }}!</h1>
        </div>
      </div>
      <p class="header-subtitle">{{ encouragement }}</p>
    </div>
  </div>
</template>

<style scoped>
.greeting-container {
  margin-bottom: var(--spacing-xl);
  /* 스티키 비활성화 - position 제거 */
}

.greeting-content {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
}

.greeting-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
}

.time-emoji {
  font-size: 48px;
  font-family: 'TossFaceFont', system-ui;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.greeting-text {
  flex: 1;
}

.user-greeting {
  font-size: var(--text-lg);
  color: var(--gray-600);
  margin-bottom: var(--spacing-xs);
}

.user-name {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.header-subtitle {
  font-size: var(--text-base);
  color: var(--gray-500);
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .greeting-container {
    margin-bottom: var(--spacing-lg);
  }

  .greeting-content {
    padding: var(--spacing-lg);
  }

  .greeting-header {
    gap: var(--spacing-md);
  }

  .time-emoji {
    font-size: 36px;
    width: 48px;
    height: 48px;
  }

  .user-greeting {
    font-size: 14px;
  }

  .user-name {
    font-size: 22px;
  }

  .header-subtitle {
    font-size: 13px;
  }
}

@media (max-width: 375px) {
  .greeting-content {
    padding: var(--spacing-md);
  }

  .time-emoji {
    font-size: 32px;
    width: 44px;
    height: 44px;
  }

  .user-name {
    font-size: 20px;
  }
}
</style>