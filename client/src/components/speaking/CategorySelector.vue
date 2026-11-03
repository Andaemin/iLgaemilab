<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import gsap from 'gsap'
import CommonCard from '@/components/common/CommonCard.vue'

const { t } = useI18n()

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['select'])

const selectedCategory = ref(null)

const selectCategory = (category, index) => {
  console.log('CategorySelector - 카테고리 선택:', category, index)
  selectedCategory.value = category

  // GSAP 애니메이션
  gsap.to(`.category-item-${index}`, {
    scale: 0.95,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
    onComplete: () => {
      console.log('CategorySelector - emit select:', category)
      emit('select', category)
    }
  })
}

const beforeEnter = (el) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(30px)'
}

const enter = (el, done) => {
  gsap.to(el, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    delay: el.dataset.index * 0.1,
    ease: 'power2.out',
    onComplete: done
  })
}
</script>

<template>
  <div class="category-selector">
    <div class="common-container">
      <div class="section-header common-animate-fade-in">
        <h1 class="common-title1">{{ t('categorySelector.title') }}</h1>
        <p class="common-body1 text-secondary">
          {{ t('categorySelector.subtitle') }}
        </p>
      </div>

      <transition-group
        name="category-list"
        tag="div"
        class="category-grid"
        @before-enter="beforeEnter"
        @enter="enter"
      >
        <CommonCard
          v-for="(category, index) in categories"
          :key="category.id"
          :class="`category-item category-item-${index}`"
          :data-index="index"
          :clickable="true"
          :padding="'none'"
          @click="selectCategory(category, index)"
        >
          <div class="category-content">
            <div class="category-emoji">{{ category.icon }}</div>
            <div class="category-info">
              <h3 class="common-title3">{{ category.name }}</h3>
              <p class="common-caption text-secondary">{{ category.description }}</p>
            </div>
            <svg class="arrow-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </CommonCard>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.category-selector {
  padding: 40px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  text-align: center;
  margin-bottom: 32px;
}

.section-header h1 {
  margin-bottom: 12px;
}

.text-secondary {
  color: var(--gray-600);
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  flex: 1;
  align-content: center;
}

.category-item {
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 20px;
  gap: 12px;
  height: 100%;
  min-height: 180px;
}

.category-emoji {
  font-size: 56px;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--gray-50), white);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.category-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.category-info h3 {
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}

.category-info p {
  font-size: 13px;
  line-height: 1.4;
}

.arrow-icon {
  display: none;
}

/* 태블릿 */
@media (max-width: 768px) {
  .category-selector {
    padding: 16px;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    align-content: start;
    padding-top: 16px;
  }

  .category-content {
    min-height: 160px;
    padding: 20px 16px;
  }

  .category-emoji {
    font-size: 48px;
    width: 72px;
    height: 72px;
  }

  .category-info h3 {
    font-size: 16px;
  }
}

/* 모바일 */
@media (max-width: 480px) {
  .category-selector {
    padding: 12px;
  }

  .category-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .category-content {
    min-height: 150px;
    padding: 16px 12px;
  }

  .category-emoji {
    font-size: 40px;
    width: 64px;
    height: 64px;
  }

  .category-info h3 {
    font-size: 14px;
  }

  .category-info p {
    font-size: 12px;
  }

  .category-emoji {
    font-size: 40px;
    width: 56px;
    height: 56px;
  }

  .category-content {
    padding: 16px;
  }
}
</style>