<script setup>

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  currentStep: {
    type: Number,
    default: 0
  }
})

const getStepClass = (index) => {
  const classes = ['step']
  if (index < props.currentStep) classes.push('step-completed')
  if (index === props.currentStep) classes.push('step-active')
  return classes.join(' ')
}

const getLineClass = (index) => {
  const classes = ['step-line']
  if (index < props.currentStep) classes.push('step-line-completed')
  return classes.join(' ')
}
</script>

<template>
  <div class="common-stepper">
    <div class="steps-container">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-wrapper"
      >
        <div :class="getStepClass(index)">
          <div class="step-circle">
            <span v-if="index < currentStep" class="step-check">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <div class="step-label">{{ step }}</div>
        </div>
        <div
          v-if="index < steps.length - 1"
          :class="getLineClass(index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.common-stepper {
  width: 100%;
  margin-bottom: var(--spacing-xl);
}

.steps-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.step-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.step-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  background: var(--gray-100);
  color: var(--gray-500);
  border: 2px solid var(--gray-300);
  transition: all var(--transition-base);
}

.step-active .step-circle {
  background: var(--common-blue);
  color: white;
  border-color: var(--common-blue);
  animation: common-pulse 2s ease-in-out infinite;
}

.step-completed .step-circle {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.step-check {
  font-size: 20px;
}

.step-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  white-space: nowrap;
}

.step-active .step-label {
  color: var(--common-blue);
  font-weight: 600;
}

.step-completed .step-label {
  color: var(--gray-900);
}

.step-line {
  flex: 1;
  height: 2px;
  background: var(--gray-300);
  margin: 0 var(--spacing-sm);
  margin-bottom: 28px;
  transition: all var(--transition-base);
}

.step-line-completed {
  background: var(--success);
}

@media (max-width: 480px) {
  .step-label {
    font-size: 12px;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
}
</style>