<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
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

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const isFocused = ref(false)

const inputClasses = computed(() => {
  const classes = ['common-input']
  if (props.error) classes.push('common-input-error')
  if (isFocused.value) classes.push('common-input-focused')
  return classes.join(' ')
})

const updateValue = (event) => {
  emit('update:modelValue', event.target.value)
}

const handleFocus = (event) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event) => {
  isFocused.value = false
  emit('blur', event)
}
</script>

<template>
  <div class="common-input-wrapper">
    <label v-if="label" class="common-label">
      {{ label }}
      <span v-if="required" class="common-required">*</span>
    </label>
    <div class="common-input-container">
      <span v-if="icon" class="common-input-icon">{{ icon }}</span>
      <input
        :type="type"
        :class="inputClasses"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="updateValue"
        @focus="handleFocus"
        @blur="handleBlur"
      />
    </div>
    <span v-if="error" class="common-input-error-message">{{ error }}</span>
  </div>
</template>

<style scoped>
.common-input-wrapper {
  width: 100%;
}

.common-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.common-input-icon {
  position: absolute;
  left: 20px;  /* 16px -> 20px */
  font-family: 'TossFaceFont';
  font-size: 24px;  /* 20px -> 24px */
  color: var(--gray-500);
  pointer-events: none;
}

.common-input-container .common-input {
  padding-left: 56px;  /* 44px -> 56px */
}

.common-input-container:not(:has(.common-input-icon)) .common-input {
  padding-left: 20px;  /* 16px -> 20px */
}

.common-required {
  color: var(--danger);
  margin-left: 4px;
}

.common-input-error-message {
  display: block;
  margin-top: 10px;  /* 8px -> 10px */
  font-size: 15px;  /* 14px -> 15px */
  color: var(--danger);
  font-weight: 500;  /* 굵기 추가 */
}

.common-input-focused {
  border-color: var(--common-blue);
}
</style>