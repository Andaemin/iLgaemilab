<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

console.log('SimpleHomeView 로드됨', user.value)
</script>

<template>
  <div class="simple-home" style="padding: 20px; min-height: 100vh; background: white;">
    <h1 style="color: #333; font-size: 28px; margin-bottom: 20px;">
      🐜 일개미랩 홈
    </h1>

    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px; margin-bottom: 20px;">
      <h2 style="font-size: 20px; margin-bottom: 10px;">환영합니다!</h2>
      <p v-if="user">안녕하세요, {{ user.name || user.email }}님!</p>
      <p v-else>로그인 정보를 불러오는 중...</p>
    </div>

    <div style="padding: 20px; background: #e3f2fd; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-bottom: 10px;">빠른 메뉴</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button
          @click="$router.push('/learn')"
          style="padding: 10px 20px; background: #3182f6; color: white; border: none; border-radius: 6px; cursor: pointer;"
        >
          학습 시작
        </button>
        <button
          @click="$router.push('/vocabulary')"
          style="padding: 10px 20px; background: #3182f6; color: white; border: none; border-radius: 6px; cursor: pointer;"
        >
          단어장
        </button>
        <button
          @click="$router.push('/rtzrtest')"
          style="padding: 10px 20px; background: #3182f6; color: white; border: none; border-radius: 6px; cursor: pointer;"
        >
          연습하기
        </button>
      </div>
    </div>

    <div style="padding: 20px; background: #fff3e0; border-radius: 8px;">
      <h3 style="margin-bottom: 10px;">오늘의 학습 목표</h3>
      <p>📚 단어 10개 학습하기</p>
      <p>🎤 발음 연습 5분</p>
      <p>✏️ 문장 만들기 3개</p>
    </div>
  </div>
</template>

<style scoped>
.simple-home {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>