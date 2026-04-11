<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  { icon: '📚', title: '학습 콘텐츠', description: '체계적인 한국어 학습 자료' },
  { icon: '🎤', title: '발음 연습', description: 'AI 기반 발음 교정 시스템' },
  { icon: '📝', title: '단어장', description: '맞춤형 단어 학습' },
  { icon: '💬', title: '대화 연습', description: '실전 회화 시뮬레이션' }
]
</script>

<template>
  <div class="construction-page">
    <div class="construction-container">
      <!-- Icon & Title -->
      <div class="construction-header">
        <div class="construction-icon">
          <span class="icon-emoji">🚧</span>
        </div>
        <h1>페이지 준비중입니다</h1>
        <p class="subtitle">
          더 나은 서비스를 위해 열심히 개발하고 있어요!
        </p>
      </div>

      <!-- Progress Bar -->
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p class="progress-text">70% 완성</p>
      </div>

      <!-- Features Preview -->
      <div class="features-preview">
        <h2>곧 만나보실 수 있어요</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <span class="feature-icon">{{ feature.icon }}</span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="construction-actions">
        <button
          class="btn-primary"
          @click="router.push('/home')"
        >
          홈으로 돌아가기
        </button>
        <button
          class="btn-secondary"
          @click="router.back()"
        >
          이전 페이지
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.construction-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
}

.construction-container {
  width: 100%;
  max-width: 600px;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-2xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

/* Header */
.construction-header {
  margin-bottom: var(--spacing-2xl);
}

.construction-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto var(--spacing-xl);
  background: var(--common-blue-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 2s infinite;
}

.icon-emoji {
  font-size: 64px;
  font-family: 'TossFaceFont', system-ui;
}

.construction-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  color: var(--gray-600);
  font-size: 16px;
  line-height: 1.5;
}

/* Progress Bar */
.progress-container {
  margin-bottom: var(--spacing-2xl);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-sm);
}

.progress-fill {
  height: 100%;
  width: 70%;
  background: var(--common-blue);
  border-radius: var(--radius-full);
  animation: progressAnimation 2s ease-out;
}

@keyframes progressAnimation {
  from { width: 0; }
  to { width: 70%; }
}

.progress-text {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 600;
}

/* Features */
.features-preview {
  margin-bottom: var(--spacing-2xl);
}

.features-preview h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-lg);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.feature-card {
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.feature-card:hover {
  background: var(--common-blue-light);
  transform: translateY(-2px);
}

.feature-icon {
  display: block;
  font-size: 32px;
  font-family: 'TossFaceFont', system-ui;
  margin-bottom: var(--spacing-sm);
}

.feature-card h3 {
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: 4px;
}

.feature-card p {
  font-size: 12px;
  color: var(--gray-600);
}

/* Actions */
.construction-actions {
  display: flex;
  gap: var(--spacing-md);
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--common-blue);
  color: white;
}

.btn-primary:hover {
  background: var(--common-blue-dark);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-secondary:hover {
  background: var(--gray-200);
}

/* Animation */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .construction-container {
    padding: var(--spacing-xl);
  }

  .construction-icon {
    width: 80px;
    height: 80px;
  }

  .icon-emoji {
    font-size: 48px;
  }

  .construction-header h1 {
    font-size: 24px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .construction-actions {
    flex-direction: column;
  }
}
</style>