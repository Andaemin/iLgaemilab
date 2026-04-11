<script setup>
import { computed } from 'vue'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

const snackbarStore = useSnackbarStore()

const show = computed({
  get: () => snackbarStore.show,
  set: (value) => {
    if (!value) snackbarStore.hide()
  }
})


const colorMap = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info'
}

const emojiMap = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️'
}
</script>

<template>
  <v-snackbar
    v-model="show"
    :color="colorMap[snackbarStore.type]"
    :timeout="snackbarStore.timeout"
    location="top"
    variant="elevated"
    class="common-snackbar"
  >
    <div class="d-flex align-center">
      <span class="emoji mr-2">{{ emojiMap[snackbarStore.type] }}</span>
      <span class="message">{{ snackbarStore.message }}</span>
    </div>

    <template v-slot:actions>
      <v-btn
        variant="text"
        icon="mdi-close"
        size="small"
        @click="show = false"
      />
    </template>
  </v-snackbar>
</template>

<style scoped>
.common-snackbar {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.emoji {
  font-size: 16px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
}

.message {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
}

/* Vuetify 스낵바 커스터마이징 */
:deep(.v-snackbar__wrapper) {
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  min-width: 300px;
  max-width: 400px;
}

:deep(.v-snackbar__content) {
  padding: 12px 16px !important;
}

/* 성공 메시지 스타일링 */
:deep(.v-snackbar--variant-elevated.bg-success) {
  background: rgb(var(--v-theme-success)) !important;
  color: white !important;
}

/* 에러 메시지 스타일링 */
:deep(.v-snackbar--variant-elevated.bg-error) {
  background: rgb(var(--v-theme-error)) !important;
  color: white !important;
}

/* 경고 메시지 스타일링 */
:deep(.v-snackbar--variant-elevated.bg-warning) {
  background: rgb(var(--v-theme-warning)) !important;
  color: white !important;
}

/* 정보 메시지 스타일링 */
:deep(.v-snackbar--variant-elevated.bg-info) {
  background: rgb(var(--v-theme-info)) !important;
  color: white !important;
}
</style>
