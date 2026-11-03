<script setup>
import { ref } from 'vue'

const timeline = ref([
  {
    year: '2024',
    title: '프로젝트 시작',
    description: 'ILgaemiLab 프로젝트가 시작되었습니다.'
  },
  {
    year: '2025',
    title: '첫 번째 릴리즈',
    description: '알파 버전이 출시되었습니다.'
  },
  {
    year: '미래',
    title: '지속적인 발전',
    description: '혁신적인 기능들이 계속 추가될 예정입니다.'
  }
])
</script>

<template>
  <v-row class="mt-8">
    <v-col cols="12">
      <v-card class="pa-6" elevation="2">
        <h2 class="text-h4 mb-6 text-center">프로젝트 타임라인</h2>
        <v-timeline>
          <v-timeline-item
            v-for="item in timeline"
            :key="item.year"
            dot-color="primary"
            size="small"
          >
            <template v-slot:opposite>
              <span class="text-h6 font-weight-bold">{{ item.year }}</span>
            </template>
            <v-card elevation="2" class="pa-4">
              <h3 class="text-h6">{{ item.title }}</h3>
              <p class="text-body-2 mt-2">{{ item.description }}</p>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
</style>