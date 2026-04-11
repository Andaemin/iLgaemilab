<script setup>
import { computed } from 'vue'

const props = defineProps({
  clickable: {
    type: Boolean,
    default: false
  },
  shadow: {
    type: String,
    default: 'sm',
    validator: (value) => ['none', 'xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  padding: {
    type: String,
    default: 'lg'
  }
})

const emit = defineEmits(['click'])

const cardClasses = computed(() => {
  const classes = ['common-card']
  if (props.clickable) classes.push('common-card-clickable')
  classes.push(`common-card-shadow-${props.shadow}`)
  classes.push(`common-card-padding-${props.padding}`)
  return classes.join(' ')
})

const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<template>
  <div :class="cardClasses" @click="handleClick">
    <div v-if="$slots.header" class="common-card-header">
      <slot name="header" />
    </div>
    <div class="common-card-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="common-card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.common-card {
  background: white;
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
}

.common-card-clickable {
  cursor: pointer;
}

.common-card-clickable:hover {
  transform: translateY(-2px);
}

.common-card-clickable:active {
  transform: translateY(0);
}

/* Shadow variants */
.common-card-shadow-none { box-shadow: none; }
.common-card-shadow-xs { box-shadow: var(--shadow-xs); }
.common-card-shadow-sm { box-shadow: var(--shadow-sm); }
.common-card-shadow-md { box-shadow: var(--shadow-md); }
.common-card-shadow-lg { box-shadow: var(--shadow-lg); }
.common-card-shadow-xl { box-shadow: var(--shadow-xl); }

.common-card-shadow-sm:hover { box-shadow: var(--shadow-md); }
.common-card-shadow-md:hover { box-shadow: var(--shadow-lg); }

/* Padding variants */
.common-card-padding-none .common-card-body { padding: 0; }
.common-card-padding-sm .common-card-body { padding: var(--spacing-sm); }
.common-card-padding-md .common-card-body { padding: var(--spacing-md); }
.common-card-padding-lg .common-card-body { padding: var(--spacing-lg); }
.common-card-padding-xl .common-card-body { padding: var(--spacing-xl); }

.common-card-header {
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: var(--spacing-md);
}

.common-card-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--gray-200);
  margin-top: var(--spacing-md);
}
</style>