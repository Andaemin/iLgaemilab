<script setup>
import { onMounted, ref } from 'vue'
import { fadeIn, slideUp, staggerReveal, bounceIn } from '@/utils/animations'

const titleRef = ref(null)
const cardsRef = ref(null)
const buttonRef = ref(null)

onMounted(() => {
  // Title animation
  if (titleRef.value) {
    fadeIn(titleRef.value, 1, 0.3)
  }

  // Cards stagger animation
  if (cardsRef.value) {
    const cards = cardsRef.value.querySelectorAll('.card-item')
    staggerReveal(cards, 0.8, 0.2)
  }

  // Button bounce animation
  if (buttonRef.value) {
    bounceIn(buttonRef.value, 1, 1.5)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
    <!-- Tailwind + GSAP Animation Example -->
    <div class="container mx-auto max-w-6xl">

      <!-- Title with Tailwind styling -->
      <h1 ref="titleRef" class="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-12">
        Tailwind CSS + GSAP
      </h1>

      <!-- Cards Grid with Tailwind -->
      <div ref="cardsRef" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <!-- Card 1 -->
        <div class="card-item bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4"></div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Tailwind CSS</h3>
          <p class="text-gray-600">유틸리티 기반의 CSS 프레임워크로 빠른 스타일링이 가능합니다.</p>
        </div>

        <!-- Card 2 -->
        <div class="card-item bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full mb-4"></div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">GSAP</h3>
          <p class="text-gray-600">강력한 애니메이션 라이브러리로 부드러운 모션을 구현합니다.</p>
        </div>

        <!-- Card 3 -->
        <div class="card-item bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4"></div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">Vue.js</h3>
          <p class="text-gray-600">반응형 컴포넌트 기반 프레임워크로 동적 UI를 구축합니다.</p>
        </div>
      </div>

      <!-- CTA Button with Tailwind -->
      <div class="text-center">
        <button
          ref="buttonRef"
          class="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-full hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          시작하기
        </button>
      </div>

      <!-- Features List with Tailwind utilities -->
      <div class="mt-16 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">주요 기능</h2>
        <ul class="space-y-3">
          <li class="flex items-center text-gray-700">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            반응형 디자인 (Responsive Design)
          </li>
          <li class="flex items-center text-gray-700">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            부드러운 애니메이션 (Smooth Animations)
          </li>
          <li class="flex items-center text-gray-700">
            <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
            모던한 UI/UX (Modern Interface)
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Vuetify와 충돌하지 않는 추가 스타일 */
.card-item {
  @apply transform transition-transform duration-300;
}

.card-item:hover {
  @apply -translate-y-2;
}
</style>