<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'elevated',
    validator: (value) => ['elevated', 'flat', 'tonal', 'outlined', 'text', 'plain'].includes(value)
  },
  color: {
    type: String,
    default: 'primary'
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  commonVariant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const baseClass = 'common-v-button'
  return [
    baseClass,
    `${baseClass}--${props.commonVariant}`
  ]
})

const vuetifyColor = computed(() => {
  switch (props.commonVariant) {
    case 'primary': return 'primary'
    case 'secondary': return 'grey-400'
    case 'ghost': return 'primary'
    case 'danger': return 'error'
    default: return props.color
  }
})

const vuetifyVariant = computed(() => {
  switch (props.commonVariant) {
    case 'ghost': return 'tonal'
    default: return props.variant
  }
})

const handleClick = (event) => {
  emit('click', event)
}
</script>

<template>
  <v-btn
    :class="buttonClasses"
    :variant="vuetifyVariant"
    :color="vuetifyColor"
    :size="size"
    :block="block"
    :disabled="disabled"
    :loading="loading"
    @click="handleClick"
  >
    <slot />
  </v-btn>
</template>

<style scoped>
.common-v-button {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif !important;
  font-weight: 600 !important;
  border-radius: 12px !important;
  text-transform: none !important;
  transition: all 0.2s ease;
  letter-spacing: -0.3px;
}

.common-v-button--primary {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

.common-v-button--secondary {
  background-color: rgb(var(--v-theme-grey-100)) !important;
  color: rgb(var(--v-theme-grey-700)) !important;
}

.common-v-button--ghost {
  background-color: rgb(var(--v-theme-blue-50)) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

.common-v-button--danger {
  background-color: rgb(var(--v-theme-error)) !important;
  color: white !important;
}

.common-v-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
}

.common-v-button--secondary:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.common-v-button--danger:hover {
  box-shadow: 0 4px 12px rgba(255, 87, 87, 0.3);
}
</style>