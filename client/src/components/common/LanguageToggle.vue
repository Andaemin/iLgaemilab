<template>
  <div class="language-toggle-wrapper">
    <button
      @click="toggleLanguage"
      class="language-toggle-button"
      :class="{ 'active-en': isEnglish }"
      aria-label="Toggle Language"
    >
      <div class="toggle-track">
        <div class="toggle-slider" :class="{ 'slide-en': isEnglish }">
          <span class="slider-icon">{{ isEnglish ? '🇺🇸' : '🇰🇷' }}</span>
        </div>
      </div>
      <div class="toggle-labels">
        <span class="label-ko" :class="{ 'active': !isEnglish }">한국어</span>
        <span class="label-en" :class="{ 'active': isEnglish }">English</span>
      </div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLanguageStore } from '@/stores/useLanguageStore'

const languageStore = useLanguageStore()

const isEnglish = computed(() => languageStore.isEnglish)

const toggleLanguage = () => {
  languageStore.toggleLanguage()
}
</script>

<style scoped>
.language-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-toggle-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 24px;
  transition: background-color 0.3s ease;
}

.language-toggle-button:hover {
  background: rgba(49, 130, 246, 0.1);
}

.language-toggle-button:active {
  transform: scale(0.95);
}

.toggle-track {
  position: relative;
  width: 48px;
  height: 24px;
  background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
  border-radius: 12px;
  transition: background 0.3s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.language-toggle-button.active-en .toggle-track {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-slider.slide-en {
  transform: translateX(24px);
}

.slider-icon {
  font-size: 12px;
  line-height: 1;
  transition: transform 0.3s ease;
}

.toggle-slider.slide-en .slider-icon {
  animation: iconBounce 0.5s ease;
}

.toggle-labels {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
}

.label-ko,
.label-en {
  color: #6b7280;
  transition: color 0.3s ease, transform 0.3s ease;
}

.label-ko.active,
.label-en.active {
  color: #3182F6;
  transform: scale(1.1);
}

@keyframes iconBounce {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

/* 반응형 */
@media (max-width: 640px) {
  .language-toggle-button {
    padding: 4px 8px;
  }

  .toggle-labels {
    display: none;
  }

  .toggle-track {
    width: 44px;
    height: 22px;
  }

  .toggle-slider {
    width: 18px;
    height: 18px;
  }

  .toggle-slider.slide-en {
    transform: translateX(22px);
  }
}
</style>
