import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSnackbarStore = defineStore('snackbar', () => {
  const show = ref(false)
  const message = ref('')
  const type = ref('success')
  const timeout = ref(3000)


  const showSuccess = (msg, duration = 3000) => {
    message.value = msg
    type.value = 'success'
    timeout.value = duration
    show.value = true
  }

  const showError = (msg, duration = 4000) => {
    message.value = msg
    type.value = 'error'
    timeout.value = duration
    show.value = true
  }

  const showWarning = (msg, duration = 3500) => {
    message.value = msg
    type.value = 'warning'
    timeout.value = duration
    show.value = true
  }

  const showInfo = (msg, duration = 3000) => {
    message.value = msg
    type.value = 'info'
    timeout.value = duration
    show.value = true
  }

  const hide = () => {
    show.value = false
  }

  // Common 스타일 표준 메시지들
  const showSaveSuccess = () => showSuccess('저장 완료 ✨')
  const showSaveError = () => showError('저장에 실패했습니다')
  const showUploadSuccess = () => showSuccess('업로드 완료 📷')
  const showUploadError = () => showError('업로드에 실패했습니다')
  const showUpdateSuccess = () => showSuccess('업데이트 완료 🔄')
  const showUpdateError = () => showError('업데이트에 실패했습니다')
  const showDeleteSuccess = () => showSuccess('삭제 완료 🗑️')
  const showDeleteError = () => showError('삭제에 실패했습니다')

  return {
    show,
    message,
    type,
    timeout,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide,
    // 표준 메시지들
    showSaveSuccess,
    showSaveError,
    showUploadSuccess,
    showUploadError,
    showUpdateSuccess,
    showUpdateError,
    showDeleteSuccess,
    showDeleteError
  }
})