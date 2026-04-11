<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: '처리 중입니다...'
  },
  submessage: {
    type: String,
    default: ''
  },
  showProgressBar: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, (newVal) => {
  isOpen.value = newVal
})

watch(isOpen, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div v-if="isOpen" class="loading-dialog-overlay">
        <div class="loading-dialog">
          <div class="loading-spinner-container">
            <div class="loading-spinner"></div>
          </div>
          <h3 class="loading-message">{{ message }}</h3>
          <p v-if="submessage" class="loading-submessage">{{ submessage }}</p>

          <!-- Progress Bar -->
          <div v-if="showProgressBar" class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
            <span class="progress-text">{{ Math.round(progress) }}%</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.loading-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-dialog {
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  min-width: 320px;
  text-align: center;
  box-shadow: var(--shadow-2xl);
}

.loading-spinner-container {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-xl);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--common-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-message {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.loading-submessage {
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
}

/* Progress Bar */
.progress-container {
  margin-top: var(--spacing-lg);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--common-blue), var(--common-blue-dark));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 12px;
  color: var(--gray-600);
  font-weight: 500;
}

/* Transitions */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .loading-dialog,
.dialog-leave-to .loading-dialog {
  transform: scale(0.9);
}
</style>