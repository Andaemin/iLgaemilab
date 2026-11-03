<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'ghost', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  fullWidth: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['common-button']

  // Variant
  classes.push(`common-button-${props.variant}`)

  // Size
  if (props.size === 'large') classes.push('common-button-large')
  if (props.size === 'small') classes.push('common-button-small')

  // Full width
  if (props.fullWidth) classes.push('common-button-full')

  return classes.join(' ')
})

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="common-button-loader">
      <svg class="common-spinner" width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
          <animate attributeName="stroke-dasharray" values="0 50;40 50;40 50" dur="1s" repeatCount="indefinite" />
          <animate attributeName="stroke-dashoffset" values="0;-10;-50" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </span>
    <span v-if="icon && !loading" class="common-button-icon">{{ icon }}</span>
    <span class="common-button-text">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.common-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.common-button-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.common-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.common-button-icon {
  font-family: 'TossFaceFont';
  font-size: 1.2em;
}

.common-button-danger {
  background-color: var(--danger);
  color: white;
}

.common-button-danger:hover:not(:disabled) {
  background-color: #DC2B3A;
}
</style>