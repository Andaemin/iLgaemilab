<script setup>
import { ref } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select'])

const selectedCategory = ref(null)

const selectCategory = (category, index) => {
  selectedCategory.value = category

  // 애니메이션
  gsap.to(`.category-card-${index}`, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      emit('select', category)
    }
  })
}

const getCategoryGradient = (categoryId) => {
  const gradients = {
    construction: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    manufacturing: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    service: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    daily: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    emergency: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  }
  return gradients[categoryId] || gradients.daily
}
</script>

<template>
  <div class="category-selector-new">
    <!-- 헤더 섹션 -->
    <div class="app-header">
      <div class="header-content">
        <div class="header-badge">
          <span class="badge-icon">💬</span>
          <span class="badge-text">AI 말하기 연습</span>
        </div>
        <h1 class="main-title">
          오늘은 어떤 상황을
          <span class="gradient-text">연습</span>하실래요?
        </h1>
        <p class="subtitle">실전처럼 대화하며 한국어 실력을 키워보세요</p>
      </div>
    </div>

    <!-- 카테고리 카드 그리드 -->
    <div class="categories-container">
      <div class="category-cards">
        <div
          v-for="(category, index) in categories"
          :key="category.id"
          :class="`category-card category-card-${index}`"
          @click="selectCategory(category, index)"
        >
          <div class="card-gradient" :style="{ background: getCategoryGradient(category.id) }"></div>
          <div class="card-content">
            <div class="card-icon">
              <span class="icon-emoji">{{ category.icon }}</span>
            </div>
            <div class="card-info">
              <h3 class="card-title">{{ category.name }}</h3>
              <p class="card-desc">{{ category.description }}</p>
            </div>
            <div class="card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
          <div class="card-hover-effect"></div>
        </div>
      </div>
    </div>

    <!-- 하단 정보 -->
    <div class="footer-info">
      <p class="info-text">🎯 각 대화는 10턴으로 구성되어 있어요</p>
    </div>
  </div>
</template>

<style scoped>
.category-selector-new {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  position: relative;
  overflow: hidden;
}

/* 배경 장식 */
.category-selector-new::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 헤더 */
.app-header {
  padding: 24px 20px 32px;
  position: relative;
  z-index: 1;
}

.header-content {
  max-width: 600px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: white;
  border-radius: 100px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 16px;
}

.badge-icon {
  font-size: 16px;
}

.badge-text {
  font-size: 12px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.3;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 15px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* 카테고리 컨테이너 */
.categories-container {
  flex: 1;
  padding: 0 20px;
  overflow-y: auto;
  position: relative;
  z-index: 1;
}

.category-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

/* 카테고리 카드 */
.category-card {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  aspect-ratio: 1 / 1.1;
}

.category-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 12px 24px rgba(0,0,0,0.12);
}

.category-card:active {
  transform: scale(0.98);
}

.card-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  transition: height 0.3s;
}

.category-card:hover .card-gradient {
  height: 100%;
  opacity: 0.08;
}

.card-content {
  position: relative;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  z-index: 1;
}

.card-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.category-card:hover .card-icon {
  transform: rotate(10deg) scale(1.1);
  background: #e5e7eb;
}

.icon-emoji {
  font-size: 32px;
}

.card-info {
  flex: 1;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  letter-spacing: -0.3px;
}

.card-desc {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.card-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 50%;
  color: #9ca3af;
  transition: all 0.3s;
  opacity: 0;
}

.category-card:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.card-hover-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.5s;
}

.category-card:hover .card-hover-effect {
  width: 200%;
  height: 200%;
}

/* 하단 정보 */
.footer-info {
  padding: 16px 20px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.info-text {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

/* 태블릿 */
@media (min-width: 768px) {
  .app-header {
    padding: 32px 32px 40px;
  }

  .main-title {
    font-size: 36px;
  }

  .subtitle {
    font-size: 16px;
  }

  .categories-container {
    padding: 0 32px;
  }

  .category-cards {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .category-card {
    aspect-ratio: 1 / 1;
  }

  .card-icon {
    width: 72px;
    height: 72px;
  }

  .icon-emoji {
    font-size: 36px;
  }

  .card-title {
    font-size: 18px;
  }

  .card-desc {
    font-size: 13px;
  }
}

/* 모바일 */
@media (max-width: 480px) {
  .main-title {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .category-cards {
    gap: 10px;
  }

  .card-content {
    padding: 16px;
  }

  .card-icon {
    width: 48px;
    height: 48px;
  }

  .icon-emoji {
    font-size: 28px;
  }

  .card-title {
    font-size: 14px;
  }

  .card-desc {
    font-size: 11px;
  }
}
</style>