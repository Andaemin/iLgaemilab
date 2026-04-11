<script setup>
import { onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLoadingStore } from '@/stores/useLoadingStore'
import CommonBottomNav from '@/components/common/CommonBottomNav.vue'
import CommonLoader from '@/components/common/CommonLoader.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loadingStore = useLoadingStore()

// 하단 네비게이션을 숨겨야 하는 페이지 확인
const shouldHideFooter = computed(() => {
  return route.meta.hideFooter === true
})

onMounted(async () => {
  console.log('App.vue mounted')
  // 앱 초기화
  try {
    await authStore.initializeAuth()
    console.log('Auth initialized')
  } catch (error) {
    console.error('Auth initialization error:', error)
  }
})

// 라우터 네비게이션 로딩 효과
router.beforeEach(() => {
  console.log('Router navigation started')
  loadingStore.startLoading()
})

router.afterEach(() => {
  setTimeout(() => {
    loadingStore.stopLoading()
  }, 300)
})
</script>

<template>
  <div id="app">
    <!-- 글로벌 로딩 -->
    <CommonLoader
      v-if="loadingStore.isLoading"
      :fullscreen="true"
      :text="loadingStore.loadingText"
    />

    <!-- 메인 콘텐츠 영역 -->
    <div class="app-container">
      <RouterView v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>

    <!-- 하단 네비게이션 (hideFooter가 true인 페이지에서는 숨김) -->
    <CommonBottomNav v-if="!shouldHideFooter" />
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: var(--gray-50);
  font-family: 'Pretendard', 'TossFaceFont', system-ui, -apple-system, sans-serif;
}

.app-container {
  min-height: 100vh;
  padding-bottom: calc(56px + env(safe-area-inset-bottom));
}

/* Mobile Safe Area */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .app-container {
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 480px) {
  .app-container {
    padding-bottom: calc(56px + env(safe-area-inset-bottom));
  }
}

/* 페이지 전환 애니메이션 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
