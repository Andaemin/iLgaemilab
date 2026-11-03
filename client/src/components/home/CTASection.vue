<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLearnMore = () => {
  router.push('/about')
}
</script>

<template>
  <v-row class="mt-12" justify="center">
    <v-col cols="12" md="8">
      <v-card class="pa-8" elevation="1">
        <h2 class="text-h4 text-center mb-6">시작하기</h2>
        <v-divider class="mb-6"></v-divider>
        <p class="text-body-1 text-center mb-6">
          ILgaemiLab은 최신 기술을 활용한 혁신적인 프로젝트입니다.
          지금 바로 시작해보세요!
        </p>
        <div class="text-center">
          <v-btn 
            color="primary" 
            size="large" 
            rounded="pill"
            @click="handleLearnMore"
          >
            자세히 알아보기
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<style scoped>
</style>