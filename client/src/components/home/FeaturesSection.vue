<script setup>
import { ref } from 'vue'
import FeatureCard from './FeatureCard.vue'

const features = ref([
  {
    icon: 'mdi-speedometer',
    title: '빠른 성능',
    subtitle: '최적화된 성능으로 빠른 로딩 속도 제공'
  },
  {
    icon: 'mdi-shield-check',
    title: '안전한 보안',
    subtitle: '안전한 데이터 처리와 보안 시스템'
  },
  {
    icon: 'mdi-account-group',
    title: '사용자 중심',
    subtitle: '직관적인 인터페이스와 사용자 경험'
  }
])
</script>

<template>
  <v-row class="mt-8">
    <v-col 
      v-for="feature in features" 
      :key="feature.title" 
      cols="12" 
      md="4"
    >
      <FeatureCard 
        :icon="feature.icon"
        :title="feature.title"
        :subtitle="feature.subtitle"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
</style>