import { defineStore } from 'pinia'
import i18n from '@/plugins/i18n'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    currentLanguage: localStorage.getItem('language') || 'ko', // 'ko' or 'en'
  }),
  getters: {
    isKorean: (state) => state.currentLanguage === 'ko',
    isEnglish: (state) => state.currentLanguage === 'en',
  },
  actions: {
    toggleLanguage() {
      this.currentLanguage = this.currentLanguage === 'ko' ? 'en' : 'ko'
      localStorage.setItem('language', this.currentLanguage)
      // i18n locale 업데이트
      i18n.global.locale.value = this.currentLanguage
    },
    setLanguage(lang) {
      if (lang === 'ko' || lang === 'en') {
        this.currentLanguage = lang
        localStorage.setItem('language', lang)
        // i18n locale 업데이트
        i18n.global.locale.value = lang
      }
    },
  },
})
