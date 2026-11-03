<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'text', // text, card, list, avatar, button
    validator: (value) => ['text', 'card', 'list', 'avatar', 'button'].includes(value)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: 'auto'
  },
  count: {
    type: Number,
    default: 1
  },
  animated: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <div class="common-skeleton">
    <!-- Text Skeleton -->
    <template v-if="type === 'text'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-text"
        :class="{ 'skeleton-animated': animated }"
        :style="{ width: i === count && count > 1 ? '60%' : width }"
      />
    </template>

    <!-- Card Skeleton -->
    <template v-else-if="type === 'card'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-card"
        :class="{ 'skeleton-animated': animated }"
        :style="{ width, height }"
      >
        <div class="skeleton-card-header">
          <div class="skeleton-avatar" />
          <div class="skeleton-card-title">
            <div class="skeleton-text" style="width: 60%" />
            <div class="skeleton-text" style="width: 40%" />
          </div>
        </div>
        <div class="skeleton-card-body">
          <div class="skeleton-text" />
          <div class="skeleton-text" />
          <div class="skeleton-text" style="width: 80%" />
        </div>
      </div>
    </template>

    <!-- List Skeleton -->
    <template v-else-if="type === 'list'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-list-item"
        :class="{ 'skeleton-animated': animated }"
      >
        <div class="skeleton-avatar" />
        <div class="skeleton-list-content">
          <div class="skeleton-text" style="width: 70%" />
          <div class="skeleton-text" style="width: 50%" />
        </div>
      </div>
    </template>

    <!-- Avatar Skeleton -->
    <template v-else-if="type === 'avatar'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-avatar"
        :class="{ 'skeleton-animated': animated }"
        :style="{ width: width || '40px', height: height || '40px' }"
      />
    </template>

    <!-- Button Skeleton -->
    <template v-else-if="type === 'button'">
      <div
        v-for="i in count"
        :key="i"
        class="skeleton-button"
        :class="{ 'skeleton-animated': animated }"
        :style="{ width, height: height || '44px' }"
      />
    </template>
  </div>
</template>

<style scoped>
.common-skeleton {
  width: 100%;
}

/* Base Skeleton Styles */
.skeleton-text,
.skeleton-card,
.skeleton-avatar,
.skeleton-button,
.skeleton-list-item {
  background: var(--gray-200);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

.skeleton-text {
  height: 16px;
  margin-bottom: var(--spacing-sm);
}

.skeleton-text:last-child {
  margin-bottom: 0;
}

/* Card Skeleton */
.skeleton-card {
  padding: var(--spacing-lg);
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-md);
}

.skeleton-card-header {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.skeleton-card-title {
  flex: 1;
}

.skeleton-card-body {
  margin-top: var(--spacing-md);
}

/* List Skeleton */
.skeleton-list-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: white;
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-sm);
}

.skeleton-list-content {
  flex: 1;
}

/* Avatar Skeleton */
.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Button Skeleton */
.skeleton-button {
  height: 44px;
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-sm);
}

/* Animation */
.skeleton-animated::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(200%);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .skeleton-card {
    padding: var(--spacing-md);
  }
}
</style>