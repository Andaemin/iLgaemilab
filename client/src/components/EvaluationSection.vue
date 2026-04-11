<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  targetText: String,
  finalText: String
})

const isEvaluating = ref(false)
const evaluationResult = ref(null)

const canEvaluate = computed(() => props.targetText && props.finalText && !isEvaluating.value)

const scoreColor = computed(() => {
  if (!evaluationResult.value) return ''
  const score = evaluationResult.value.score
  if (score >= 80) return 'success'
  if (score >= 60) return 'info'
  if (score >= 40) return 'warning'
  return 'error'
})

const evaluate = async () => {
  if (!canEvaluate.value) return

  isEvaluating.value = true
  evaluationResult.value = null

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    const response = await fetch(`${apiUrl}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: props.targetText,
        asrText: props.finalText
      })
    })

    if (!response.ok) throw new Error('평가 요청 실패')

    evaluationResult.value = await response.json()
  } catch (error) {
    console.error('Evaluation error:', error)
  } finally {
    isEvaluating.value = false
  }
}
</script>

<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="text-h5">
      <v-icon start>mdi-check-circle</v-icon>
      발음 평가
    </v-card-title>
    
    <v-card-text>
      <v-btn
        :disabled="!canEvaluate"
        :loading="isEvaluating"
        color="primary"
        block
        size="large"
        variant="elevated"
        @click="evaluate"
      >
        <v-icon start>mdi-play-circle</v-icon>
        발음 평가하기
      </v-btn>
      
      <v-alert
        v-if="evaluationResult"
        :color="scoreColor"
        variant="tonal"
        class="mt-4"
        prominent
      >
        <v-alert-title class="text-h6">
          평가 점수: {{ evaluationResult.score }}점
        </v-alert-title>
        <div class="mt-2">{{ evaluationResult.feedback }}</div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>