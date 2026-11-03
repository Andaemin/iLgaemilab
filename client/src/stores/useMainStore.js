import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMainStore = defineStore('main', () => {
  const user = ref(null)
  const loading = ref(false)

  // 오답노트 카드 페이지에서 단계 선택 여부 (BottomNav 숨김용)
  const hideBottomNav = ref(false)

  const isAuthenticated = computed(() => !!user.value)

  const setUser = (userData) => {
    user.value = userData
  }

  const clearUser = () => {
    user.value = null
  }

  const setLoading = (state) => {
    loading.value = state
  }

  const setHideBottomNav = (state) => {
    hideBottomNav.value = state
  }

  return {
    user,
    loading,
    hideBottomNav,
    isAuthenticated,
    setUser,
    clearUser,
    setLoading,
    setHideBottomNav
  }
})