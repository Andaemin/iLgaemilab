<script setup>
import { computed } from 'vue'

const props = defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'elevated',
    validator: (value) => ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'].includes(value)
  }
})

const emit = defineEmits(['click'])

const cardClasses = computed(() => ({
  'common-card--clickable': props.clickable,
  'common-card--no-padding': props.noPadding
}))

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<template>
  <v-card
    :class="cardClasses"
    :variant="variant"
    @click="handleClick"
    class="common-v-card"
  >
    <slot />
  </v-card>
</template>

<style scoped>
.common-v-card {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06) !important;
  transition: all 0.2s ease;
}

.common-card--clickable {
  cursor: pointer;
}

.common-card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
}

.common-card--no-padding :deep(.v-card-text) {
  padding: 0 !important;
}
</style>

