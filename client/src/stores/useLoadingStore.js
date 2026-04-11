import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
  const isLoading = ref(false)
  const loadingText = ref('로딩 중')
  const loadingQueue = ref(0)

  const startLoading = (text = '로딩 중') => {
    loadingQueue.value++
    isLoading.value = true
    loadingText.value = text
  }

  const stopLoading = () => {
    if (loadingQueue.value > 0) {
      loadingQueue.value--
    }
    if (loadingQueue.value === 0) {
      isLoading.value = false
    }
  }

  const forceStopLoading = () => {
    loadingQueue.value = 0
    isLoading.value = false
  }

  const setLoadingText = (text) => {
    loadingText.value = text
  }

  return {
    isLoading: computed(() => isLoading.value),
    loadingText: computed(() => loadingText.value),
    startLoading,
    stopLoading,
    forceStopLoading,
    setLoadingText
  }
})