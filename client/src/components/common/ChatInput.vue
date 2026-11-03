<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '메시지를 입력하세요...'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showVoiceButton: {
    type: Boolean,
    default: true
  },
  isRecording: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'send', 'toggleVoice', 'keydown'])

const inputValue = ref(props.modelValue)
const inputRef = ref(null)

watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal
})

watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleSend = () => {
  if (inputValue.value.trim() && !props.disabled) {
    emit('send')
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
  emit('keydown', e)
}

const handleToggleVoice = () => {
  if (!props.disabled) {
    emit('toggleVoice')
  }
}

// 부모 컴포넌트에서 호출할 수 있도록 focus 메소드 노출
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus()
  }
}

defineExpose({
  focus
})
</script>

<template>
  <div class="chat-input-container">
    <div class="chat-input-wrapper">
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        :disabled="disabled"
        @keydown="handleKeydown"
        class="chat-input"
      />

      <div class="input-actions">
        <button
          v-if="showVoiceButton"
          @click="handleToggleVoice"
          :class="['voice-button', { 'recording': isRecording }]"
          :disabled="disabled"
        >
          <svg v-if="!isRecording" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 1C8.34 1 7 2.34 7 4V10C7 11.66 8.34 13 10 13C11.66 13 13 11.66 13 10V4C13 2.34 11.66 1 10 1Z"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 8V10C4 13.31 6.69 16 10 16C13.31 16 16 13.31 16 10V8"
                  stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10 16V19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div v-else class="recording-pulse"></div>
        </button>

        <button
          @click="handleSend"
          class="send-button"
          :disabled="!inputValue.trim() || disabled"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M18 2L9 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 2L12 18L9 11L2 8L18 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-input-container {
  background: var(--gray-50);
  padding: 16px;
  border-top: none;
}

.chat-input-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  max-width: 100%;
  background: white;
  padding: 8px;
  border-radius: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.chat-input-wrapper:focus-within {
  box-shadow: 0 4px 16px rgba(49, 130, 246, 0.15);
}

.chat-input {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s;
  background: transparent;
  font-weight: 500;
}

.chat-input:focus {
  background: transparent;
}

.chat-input:disabled {
  background: transparent;
  color: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.voice-button,
.send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.voice-button {
  background: var(--gray-100);
  color: var(--gray-600);
}

.voice-button:hover:not(:disabled) {
  background: var(--gray-200);
  transform: scale(1.05);
}

.voice-button.recording {
  background: var(--danger);
  color: white;
  position: relative;
}

.voice-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recording-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--danger);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

.send-button {
  background: var(--common-blue);
  color: white;
}

.send-button:hover:not(:disabled) {
  background: var(--common-blue-dark);
  transform: scale(1.05);
}

.send-button:active:not(:disabled) {
  transform: scale(0.95);
}

.send-button:disabled {
  background: var(--gray-300);
  cursor: not-allowed;
  opacity: 0.5;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .chat-input-container {
    padding: 12px 16px;
  }

  .chat-input {
    padding: 10px 14px;
    font-size: 14px;
  }

  .voice-button,
  .send-button {
    width: 40px;
    height: 40px;
  }
}
</style>