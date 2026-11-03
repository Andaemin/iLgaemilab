<script setup>
defineProps({
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
})
</script>

<template>
  <v-card class="pa-4 text-center h-100" elevation="1">
    <v-avatar size="80" color="primary" class="mb-4">
      <v-icon size="40">mdi-account</v-icon>
    </v-avatar>
    <h3 class="text-h6">{{ name }}</h3>
    <p class="text-body-2 text-grey mt-2">{{ role }}</p>
  </v-card>
</template>

<style scoped>
</style>