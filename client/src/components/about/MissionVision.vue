<script setup>
import InfoCard from './InfoCard.vue'

const missionVisionData = [
  {
    title: '우리의 미션',
    content: 'ILgaemiLab은 최신 기술을 활용하여 사용자에게 최고의 경험을 제공하는 것을 목표로 합니다. 우리는 지속적인 혁신과 개선을 통해 더 나은 서비스를 만들어갑니다.'
  },
  {
    title: '우리의 비전',
    content: '기술의 힘으로 세상을 더 나은 곳으로 만들고, 모든 사용자가 쉽고 편리하게 접근할 수 있는 서비스를 제공합니다.'
  }
]
</script>

<template>
  <v-row class="mt-8">
    <v-col 
      v-for="(item, index) in missionVisionData" 
      :key="index"
      cols="12" 
      md="6"
    >
      <InfoCard 
        :title="item.title"
        :content="item.content"
      />
    </v-col>
  </v-row>
</template>

<style scoped>
</style>