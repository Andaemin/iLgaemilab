import { createApp } from 'vue'
import TestApp from './TestApp.vue'

console.log('테스트 main.js 시작')

try {
  const app = createApp(TestApp)

  console.log('Vue 앱 생성됨')

  app.mount('#app')

  console.log('Vue 앱 마운트됨')
} catch (error) {
  console.error('Vue 앱 초기화 에러:', error)
}