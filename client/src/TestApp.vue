<script setup>
import { ref } from 'vue'

const message = ref('일개미랩 테스트 앱이 정상 작동합니다! 🐜')
const counter = ref(0)

const increment = () => {
  counter.value++
}
</script>

<template>
  <div class="test-app">
    <h1>{{ message }}</h1>
    <p>카운터: {{ counter }}</p>
    <button @click="increment">클릭하세요</button>

    <div class="status">
      <h3>상태 체크:</h3>
      <ul>
        <li>✅ Vue 3 앱이 마운트되었습니다</li>
        <li>✅ 반응성이 작동합니다</li>
        <li>✅ 이벤트 핸들링이 작동합니다</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.test-app {
  padding: 20px;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #333;
}

button {
  padding: 10px 20px;
  background-color: #3182F6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #1B64DA;
}

.status {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 5px 0;
}
</style>