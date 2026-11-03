<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '선택하세요'
  },
  options: {
    type: Array,
    required: true
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectClasses = computed(() => {
  const classes = ['common-select']
  if (props.error) classes.push('common-select-error')
  if (!props.modelValue) classes.push('common-select-placeholder')
  return classes.join(' ')
})

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
  emit('change', event.target.value)
}

const getDisplayText = computed(() => {
  if (!props.modelValue) return props.placeholder
  const option = props.options.find(opt =>
    (typeof opt === 'object' ? opt.value : opt) === props.modelValue
  )
  return option ? (typeof option === 'object' ? (option.label || option.text) : option) : props.placeholder
})
</script>

<template>
  <div class="common-select-wrapper">
    <label v-if="label" class="common-label">
      {{ label }}
      <span v-if="required" class="common-required">*</span>
    </label>
    <div class="common-select-container">
      <span v-if="icon" class="common-select-icon">{{ icon }}</span>
      <select
        :class="selectClasses"
        :value="modelValue"
        :disabled="disabled"
        @change="updateValue"
      >
        <option value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="typeof option === 'object' ? option.value : option"
          :value="typeof option === 'object' ? option.value : option"
        >
          {{ typeof option === 'object' ? (option.label || option.text) : option }}
        </option>
      </select>
      <span class="common-select-arrow">▼</span>
    </div>
    <span v-if="error" class="common-select-error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.common-select-wrapper {
  width: 100%;
}

.common-select-container {
  position: relative;
  display: flex;
  align-items: center;
}

.common-select {
  width: 100%;
  padding: 14px 40px 14px 16px;
  font-size: 16px;
  border: 1px solid var(--gray-300);
  border-radius: var(--radius-sm);
  background-color: white;
  transition: all var(--transition-fast);
  outline: none;
  appearance: none;
  cursor: pointer;
  font-family: inherit;
}

.common-select-container .common-select {
  padding-left: 44px;
}

.common-select-container:not(:has(.common-select-icon)) .common-select {
  padding-left: 16px;
}

.common-select:focus {
  border-color: var(--common-blue);
  box-shadow: 0 0 0 3px var(--common-blue-light);
}

.common-select:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.common-select-placeholder {
  color: var(--gray-500);
}

.common-select-error {
  border-color: var(--danger);
}

.common-select-error:focus {
  box-shadow: 0 0 0 3px var(--danger-light);
}

.common-select-icon {
  position: absolute;
  left: 16px;
  font-family: 'TossFaceFont';
  font-size: 20px;
  color: var(--gray-500);
  pointer-events: none;
  z-index: 1;
}

.common-select-arrow {
  position: absolute;
  right: 16px;
  font-size: 12px;
  color: var(--gray-500);
  pointer-events: none;
}

.common-required {
  color: var(--danger);
  margin-left: 4px;
}

.common-select-error-message {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: var(--danger);
}
</style>