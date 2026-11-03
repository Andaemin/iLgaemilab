<script setup>
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AboutHeader from '@/components/about/AboutHeader.vue'
import MissionVision from '@/components/about/MissionVision.vue'
import Timeline from '@/components/about/Timeline.vue'
import TeamSection from '@/components/about/TeamSection.vue'
</script>

<template>
  <DefaultLayout>
    <v-container>
      <AboutHeader />
      <MissionVision />
      <Timeline />
      <TeamSection />
    </v-container>
  </DefaultLayout>
</template>

<style scoped>
</style>