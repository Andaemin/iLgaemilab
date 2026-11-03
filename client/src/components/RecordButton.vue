<script setup>
import { computed } from 'vue'

const props = defineProps({
  isRecording: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['toggle'])

const buttonColor = computed(() => props.isRecording ? 'error' : 'primary')
const buttonText = computed(() => props.isRecording ? '녹음 중지' : '녹음 시작')
const buttonIcon = computed(() => props.isRecording ? 'mdi-stop' : 'mdi-microphone')
</script>

<template>
  <v-btn
    :color="buttonColor"
    :disabled="disabled"
    size="x-large"
    rounded="circle"
    elevation="8"
    :loading="disabled"
    @click="emit('toggle')"
    @touchstart.prevent="emit('toggle')"
    class="record-button"
    :class="{ 'pulse-animation': isRecording }"
  >
    <v-icon size="48">{{ buttonIcon }}</v-icon>
  </v-btn>
</template>

<style scoped>
.record-button {
  width: 150px !important;
  height: 150px !important;
  /* 모바일 터치 최적화 */
  touch-action: manipulation !important;
  -webkit-tap-highlight-color: transparent !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  /* 최소 터치 영역 확보 */
  min-width: 150px !important;
  min-height: 150px !important;
  /* 터치 반응성 개선 */
  cursor: pointer !important;
}

.record-button:active {
  transform: scale(0.95);
  transition: transform 0.1s ease;
}

.pulse-animation {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 30px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

/* 모바일 환경에서 추가 여백 확보 */
@media (max-width: 768px) {
  .record-button {
    margin: 20px 0 !important;
  }
}
</style>