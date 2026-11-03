<script setup>
console.log('SimpleApp.vue loaded')
</script>

<template>
  <div style="padding: 20px; background: #fff; min-height: 100vh;">
    <h1 style="color: #333;">일개미랩 앱이 작동합니다!</h1>
    <p style="color: #666;">이 메시지가 보인다면 Vue 앱이 정상적으로 렌더링되고 있습니다.</p>

    <div style="margin-top: 20px; padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3>체크리스트:</h3>
      <ul>
        <li>✅ HTML 렌더링 정상</li>
        <li>✅ Vue 앱 마운트 정상</li>
        <li>✅ 컴포넌트 로딩 정상</li>
      </ul>
    </div>

    <!-- 라우터 뷰 테스트 -->
    <div style="margin-top: 20px; padding: 20px; border: 2px solid #3182F6; border-radius: 8px;">
      <h3>Router View:</h3>
      <RouterView />
    </div>
  </div>
</template>