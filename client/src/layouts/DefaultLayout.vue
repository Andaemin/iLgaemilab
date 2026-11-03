<script setup>
import { ref } from 'vue'
import { useMainStore } from '@/stores/useMainStore'

const drawer = ref(false)
const mainStore = useMainStore()

const menuItems = [
  { title: '홈', icon: 'mdi-home', to: '/' },
  { title: '소개', icon: 'mdi-information', to: '/about' }
]
</script>

<template>
  <v-layout>
    <v-main>
      <v-container fluid class="pa-0">
        <slot />
      </v-container>
    </v-main>
  </v-layout>
</template>

<style scoped>
</style>