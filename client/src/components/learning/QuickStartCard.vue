<script setup>
import { computed } from 'vue'
import CommonCard from '@/components/common/CommonCard.vue'

const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  isFlipped: {
    type: Boolean,
    default: false
  },
  showTranslation: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['flip', 'toggle-translation'])

const difficultyInfo = {
  beginner: { label: '초급', color: 'var(--success)', icon: '🌱' },
  intermediate: { label: '중급', color: 'var(--warning)', icon: '🌿' },
  advanced: { label: '고급', color: 'var(--danger)', icon: '🌳' }
}

const currentDifficulty = computed(() => difficultyInfo[props.card.difficulty] || difficultyInfo.beginner)

const flipCard = () => {
  emit('flip')
}

const toggleTranslation = () => {
  emit('toggle-translation')
}
</script>

<template>
  <div class="quick-start-card" :class="{ 'is-flipped': isFlipped }">
    <div class="card-inner">
      <!-- Front Side -->
      <CommonCard class="card-face card-front" @click="flipCard">
        <!-- Category & Difficulty Badge -->
        <div class="card-badges">
          <span class="category-badge">
            <span class="badge-icon">{{ card.categoryIcon }}</span>
            {{ card.category }}
          </span>
          <span
            class="difficulty-badge"
            :style="{ backgroundColor: `${currentDifficulty.color}20`, color: currentDifficulty.color }"
          >
            {{ currentDifficulty.icon }} {{ currentDifficulty.label }}
          </span>
        </div>

        <!-- Korean Text -->
        <div class="card-content">
          <h2 class="korean-text common-headline2">{{ card.korean }}</h2>
          <p class="pronunciation common-body2">{{ card.pronunciation }}</p>
        </div>

        <!-- Context -->
        <div class="card-context">
          <p class="context-label common-caption">사용 상황</p>
          <p class="context-text common-body2">{{ card.context }}</p>
        </div>

        <!-- Flip Hint -->
        <div class="flip-hint">
          <span class="hint-icon">👆</span>
          <span class="hint-text common-caption">카드를 눌러 뜻을 확인하세요</span>
        </div>
      </CommonCard>

      <!-- Back Side -->
      <CommonCard class="card-face card-back" @click="flipCard">
        <!-- Translation Toggle -->
        <div class="translation-toggle">
          <button
            class="toggle-button"
            @click.stop="toggleTranslation"
            :class="{ 'active': showTranslation }"
          >
            <span class="toggle-icon">{{ showTranslation ? '🌏' : '🇰🇷' }}</span>
            {{ showTranslation ? card.nativeLanguage || '모국어' : '한국어' }}
          </button>
        </div>

        <!-- Meaning -->
        <div class="card-meaning">
          <h3 class="meaning-label common-title2">의미</h3>
          <p class="meaning-text common-headline3">
            {{ showTranslation ? card.translation : card.meaning }}
          </p>
        </div>

        <!-- Example -->
        <div class="card-example">
          <h4 class="example-label common-title3">예문</h4>
          <div class="example-content">
            <p class="example-korean common-body1">{{ card.exampleKorean }}</p>
            <p class="example-translation common-caption">{{ card.exampleTranslation }}</p>
          </div>
        </div>

        <!-- Usage Tips -->
        <div v-if="card.tips" class="usage-tips">
          <span class="tips-icon">💡</span>
          <p class="tips-text common-caption">{{ card.tips }}</p>
        </div>

        <!-- Flip Back Hint -->
        <div class="flip-hint">
          <span class="hint-icon">↩️</span>
          <span class="hint-text common-caption">다시 보기</span>
        </div>
      </CommonCard>
    </div>
  </div>
</template>

<style scoped>
.quick-start-card {
  width: 100%;
  height: 400px;
  perspective: 1000px;
  cursor: pointer;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-xl) !important;
}

.card-front {
  z-index: 2;
}

.card-back {
  transform: rotateY(180deg);
}

/* Card Badges */
.card-badges {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  color: var(--gray-700);
}

.badge-icon {
  font-family: 'TossFaceFont', system-ui;
}

.difficulty-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
}

/* Card Content */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin: var(--spacing-lg) 0;
}

.korean-text {
  color: var(--gray-900);
  margin-bottom: var(--spacing-md);
  word-break: keep-all;
  line-height: 1.4;
}

.pronunciation {
  color: var(--gray-500);
  font-style: italic;
}

/* Context */
.card-context {
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-lg);
}

.context-label {
  color: var(--gray-500);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.context-text {
  color: var(--gray-700);
}

/* Translation Toggle */
.translation-toggle {
  position: absolute;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
}

.toggle-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toggle-button:hover {
  border-color: var(--common-blue);
  background: var(--common-blue-light);
}

.toggle-button.active {
  background: var(--common-blue);
  color: white;
  border-color: var(--common-blue);
}

.toggle-icon {
  font-family: 'TossFaceFont', system-ui;
  font-size: 16px;
}

/* Meaning */
.card-meaning {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.meaning-label {
  color: var(--gray-500);
  margin-bottom: var(--spacing-sm);
}

.meaning-text {
  color: var(--common-blue);
  word-break: keep-all;
  line-height: 1.5;
}

/* Example */
.card-example {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--common-blue);
}

.example-label {
  color: var(--gray-700);
  margin-bottom: var(--spacing-sm);
}

.example-korean {
  color: var(--gray-900);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.example-translation {
  color: var(--gray-500);
  font-style: italic;
}

/* Usage Tips */
.usage-tips {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background: var(--warning-light);
  border-radius: var(--radius-sm);
}

.tips-icon {
  font-family: 'TossFaceFont', system-ui;
  font-size: 20px;
  flex-shrink: 0;
}

.tips-text {
  color: var(--gray-700);
  line-height: 1.4;
}

/* Flip Hint */
.flip-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-top: auto;
  padding-top: var(--spacing-md);
}

.hint-icon {
  font-family: 'TossFaceFont', system-ui;
  font-size: 16px;
  animation: bounce 2s ease-in-out infinite;
}

.hint-text {
  color: var(--gray-500);
}

/* Animations */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .quick-start-card {
    height: 450px;
  }

  .card-face {
    padding: var(--spacing-lg) !important;
  }

  .korean-text {
    font-size: 24px;
  }

  .meaning-text {
    font-size: 20px;
  }
}

/* Hover Effects */
.quick-start-card:hover .card-inner {
  transform: translateY(-2px);
}

.is-flipped.quick-start-card:hover .card-inner {
  transform: rotateY(180deg) translateY(-2px);
}
</style>