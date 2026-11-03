<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  }
})
</script>

<template>
  <v-card class="pa-6 text-center h-100" elevation="2" hover>
    <v-icon :icon="icon" size="48" color="primary" class="mb-4"></v-icon>
    <h3 class="text-h5 mb-2">{{ title }}</h3>
    <p class="text-body-1 text-grey">{{ subtitle }}</p>
  </v-card>
</template>

<style scoped>
</style>