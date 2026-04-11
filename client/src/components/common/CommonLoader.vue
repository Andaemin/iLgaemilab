<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '로딩 중'
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  overlay: {
    type: Boolean,
    default: true
  }
})

const dots = ref('.')
const loadingMessages = [
  '잠시만 기다려주세요',
  '데이터를 불러오고 있어요',
  '거의 다 됐어요',
  '조금만 더 기다려주세요'
]

const currentMessage = ref(0)

onMounted(() => {
  // 점 애니메이션
  const dotInterval = setInterval(() => {
    dots.value = dots.value.length >= 3 ? '.' : dots.value + '.'
  }, 500)

  // 메시지 순환
  const messageInterval = setInterval(() => {
    currentMessage.value = (currentMessage.value + 1) % loadingMessages.length
  }, 3000)

  // 클린업
  onBeforeUnmount(() => {
    clearInterval(dotInterval)
    clearInterval(messageInterval)
  })
})
</script>

<template>
  <div
    class="common-loader"
    :class="{
      'loader-fullscreen': fullscreen,
      'loader-overlay': overlay
    }"
  >
    <div class="loader-content">
      <!-- 로고 또는 스피너 -->
      <div class="loader-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-icon">🐜</div>
      </div>

      <!-- 텍스트 -->
      <div class="loader-text">
        <p class="loader-main-text">{{ text }}{{ dots }}</p>
        <p class="loader-sub-text">{{ loadingMessages[currentMessage] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.common-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl);
}

.loader-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: white;
}

.loader-overlay {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xl);
  animation: fadeIn 0.3s ease-out;
}

.loader-spinner {
  position: relative;
  width: 80px;
  height: 80px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid var(--gray-200);
  border-top-color: var(--common-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-family: 'TossFaceFont', system-ui;
  animation: pulse 1.5s ease-in-out infinite;
}

.loader-text {
  text-align: center;
}

.loader-main-text {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.loader-sub-text {
  font-size: 14px;
  color: var(--gray-500);
  animation: fadeInOut 3s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
</style>