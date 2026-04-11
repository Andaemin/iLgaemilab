<script setup>
defineProps({
  partialText: String,
  finalText: String
})
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="text-h5">
      <v-icon start>mdi-text-to-speech</v-icon>
      인식 결과
    </v-card-title>
    
    <v-card-text>
      <v-alert
        v-if="partialText"
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
      >
        <strong>실시간 인식:</strong> {{ partialText }}
      </v-alert>
      
      <v-alert
        v-if="finalText"
        type="success"
        variant="tonal"
        density="comfortable"
      >
        <strong>최종 인식:</strong> {{ finalText }}
      </v-alert>
      
      <v-alert
        v-if="!partialText && !finalText"
        type="info"
        variant="text"
        density="compact"
      >
        음성을 인식하려면 녹음을 시작하세요
      </v-alert>
    </v-card-text>
  </v-card>
</template>