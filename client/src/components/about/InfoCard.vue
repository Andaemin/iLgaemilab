<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
})
</script>

<template>
  <v-card class="pa-6 h-100" elevation="2">
    <h2 class="text-h4 mb-4">{{ title }}</h2>
    <v-divider class="mb-4"></v-divider>
    <p class="text-body-1">{{ content }}</p>
  </v-card>
</template>

<style scoped>
</style>