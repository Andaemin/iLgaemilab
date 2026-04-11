<script setup>
import { ref, computed } from 'vue'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const props = defineProps({
  currentAvatar: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'preset-select'])

const show = computed({
  get: () => props.modelValue || props.show,
  set: (value) => {
    emit('update:modelValue', value)
  }
})

// Avatar preset categories
const presetCategories = ref([
  {
    id: 'common_characters',
    name: '토스 캐릭터',
    icon: '🏢',
    avatars: [
      { id: 'common_1', emoji: '😊', name: '토스 프렌즈 1' },
      { id: 'common_2', emoji: '🥰', name: '토스 프렌즈 2' },
      { id: 'common_3', emoji: '😎', name: '토스 프렌즈 3' },
      { id: 'common_4', emoji: '🤗', name: '토스 프렌즈 4' },
      { id: 'common_5', emoji: '😋', name: '토스 프렌즈 5' },
      { id: 'common_6', emoji: '🤔', name: '토스 프렌즈 6' }
    ]
  },
  {
    id: 'emotions',
    name: '감정 표현',
    icon: '😀',
    avatars: [
      { id: 'happy_1', emoji: '😄', name: '기쁨' },
      { id: 'happy_2', emoji: '😃', name: '웃음' },
      { id: 'love_1', emoji: '😍', name: '사랑' },
      { id: 'cool_1', emoji: '😎', name: '멋짐' },
      { id: 'think_1', emoji: '🤔', name: '생각' },
      { id: 'wink_1', emoji: '😉', name: '윙크' },
      { id: 'peace_1', emoji: '😌', name: '평화' },
      { id: 'star_1', emoji: '🤩', name: '별눈' }
    ]
  },
  {
    id: 'professionals',
    name: '직업군',
    icon: '👨‍💼',
    avatars: [
      { id: 'worker_1', emoji: '👷', name: '건설근로자' },
      { id: 'factory_1', emoji: '👨‍🏭', name: '공장근로자' },
      { id: 'farmer_1', emoji: '👨‍🌾', name: '농업인' },
      { id: 'driver_1', emoji: '👨‍✈️', name: '운전기사' },
      { id: 'service_1', emoji: '👨‍🍳', name: '서비스업' },
      { id: 'office_1', emoji: '👨‍💼', name: '사무직' }
    ]
  },
  {
    id: 'animals',
    name: '동물 친구들',
    icon: '🐱',
    avatars: [
      { id: 'cat_1', emoji: '🐱', name: '고양이' },
      { id: 'dog_1', emoji: '🐶', name: '강아지' },
      { id: 'bear_1', emoji: '🐻', name: '곰' },
      { id: 'rabbit_1', emoji: '🐰', name: '토끼' },
      { id: 'fox_1', emoji: '🦊', name: '여우' },
      { id: 'panda_1', emoji: '🐼', name: '판다' },
      { id: 'tiger_1', emoji: '🐯', name: '호랑이' },
      { id: 'lion_1', emoji: '🦁', name: '사자' }
    ]
  },
  {
    id: 'objects',
    name: '오브젝트',
    icon: '⭐',
    avatars: [
      { id: 'star_1', emoji: '⭐', name: '별' },
      { id: 'heart_1', emoji: '❤️', name: '하트' },
      { id: 'crown_1', emoji: '👑', name: '왕관' },
      { id: 'diamond_1', emoji: '💎', name: '다이아몬드' },
      { id: 'fire_1', emoji: '🔥', name: '불꽃' },
      { id: 'rocket_1', emoji: '🚀', name: '로켓' }
    ]
  }
])

const selectedCategory = ref('common_characters')
const selectedAvatar = ref('')

// Computed
const currentCategory = computed(() => {
  return presetCategories.value.find(cat => cat.id === selectedCategory.value)
})

const categoryTabs = computed(() => {
  return presetCategories.value.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon
  }))
})

// Methods
const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
}

const selectAvatar = (avatar) => {
  selectedAvatar.value = avatar.id
}

const handleConfirm = () => {
  if (selectedAvatar.value) {
    const avatar = currentCategory.value.avatars.find(a => a.id === selectedAvatar.value)
    emit('preset-select', {
      type: 'preset',
      id: selectedAvatar.value,
      emoji: avatar.emoji,
      name: avatar.name,
      category: selectedCategory.value
    })
  }
  handleClose()
}

const handleClose = () => {
  selectedAvatar.value = ''
  show.value = false
}

// 랜덤 아바타 선택
const selectRandomAvatar = () => {
  const allAvatars = presetCategories.value.flatMap(cat => 
    cat.avatars.map(avatar => ({ ...avatar, category: cat.id }))
  )
  const randomIndex = Math.floor(Math.random() * allAvatars.length)
  const randomAvatar = allAvatars[randomIndex]
  
  selectedCategory.value = randomAvatar.category
  selectedAvatar.value = randomAvatar.id
}

// 인기 아바타 (사용 빈도 시뮬레이션)
const popularAvatars = computed(() => {
  const popular = [
    { categoryId: 'common_characters', avatarId: 'common_2', usage: 95 },
    { categoryId: 'emotions', avatarId: 'happy_1', usage: 87 },
    { categoryId: 'animals', avatarId: 'cat_1', usage: 82 },
    { categoryId: 'common_characters', avatarId: 'common_1', usage: 79 },
    { categoryId: 'emotions', avatarId: 'love_1', usage: 76 }
  ]
  
  return popular.map(item => {
    const category = presetCategories.value.find(cat => cat.id === item.categoryId)
    const avatar = category?.avatars.find(av => av.id === item.avatarId)
    return {
      ...avatar,
      category: item.categoryId,
      usage: item.usage
    }
  }).filter(Boolean)
})
</script>

<template>
  <v-dialog
    v-model="show"
    max-width="700"
    persistent
  >
    <CommonVCard class="avatar-preset-modal">
      <template #title>
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center gap-2">
            <span class="common-icon">🎨</span>
            <span class="text-h6 font-weight-bold">아바타 선택</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="handleClose"
          />
        </div>
      </template>

      <v-divider />

      <div class="preset-content pa-6">
        <!-- 인기 아바타 섹션 -->
        <div class="popular-section mb-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <h4 class="text-subtitle-1 font-weight-bold">🔥 인기 아바타</h4>
            <CommonVButton
              common-variant="ghost"
              size="small"
              @click="selectRandomAvatar"
              icon="mdi-dice-6"
            >
              랜덤 선택
            </CommonVButton>
          </div>
          
          <div class="popular-avatars">
            <div
              v-for="avatar in popularAvatars"
              :key="avatar.id"
              class="popular-avatar-item"
              :class="{ selected: selectedAvatar === avatar.id }"
              @click="selectedCategory = avatar.category; selectedAvatar = avatar.id"
            >
              <div class="avatar-display">
                <span class="avatar-emoji">{{ avatar.emoji }}</span>
                <div class="usage-indicator">
                  <v-chip
                    size="x-small"
                    color="error"
                    variant="elevated"
                  >
                    {{ avatar.usage }}%
                  </v-chip>
                </div>
              </div>
              <p class="avatar-name text-caption mt-1">{{ avatar.name }}</p>
            </div>
          </div>
        </div>

        <!-- 카테고리 탭 -->
        <div class="category-tabs mb-4">
          <v-tabs
            v-model="selectedCategory"
            color="primary"
            align-tabs="center"
            show-arrows
          >
            <v-tab
              v-for="category in categoryTabs"
              :key="category.id"
              :value="category.id"
              class="category-tab"
            >
              <span class="tab-icon">{{ category.icon }}</span>
              <span class="tab-name">{{ category.name }}</span>
            </v-tab>
          </v-tabs>
        </div>

        <!-- 아바타 그리드 -->
        <div class="avatar-grid-container">
          <div v-if="currentCategory" class="avatar-grid">
            <div
              v-for="avatar in currentCategory.avatars"
              :key="avatar.id"
              class="avatar-item"
              :class="{ selected: selectedAvatar === avatar.id }"
              @click="selectAvatar(avatar)"
            >
              <div class="avatar-display">
                <span class="avatar-emoji">{{ avatar.emoji }}</span>
              </div>
              <p class="avatar-name text-caption mt-2">{{ avatar.name }}</p>
            </div>
          </div>
        </div>

        <!-- 선택된 아바타 미리보기 -->
        <div v-if="selectedAvatar" class="selected-preview mt-6">
          <v-divider class="mb-4" />
          <div class="d-flex align-center gap-4">
            <div class="preview-avatar">
              <v-avatar size="64" class="selected-avatar-display">
                <span class="preview-emoji">
                  {{ currentCategory.avatars.find(a => a.id === selectedAvatar)?.emoji }}
                </span>
              </v-avatar>
            </div>
            <div class="preview-info flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-medium">
                {{ currentCategory.avatars.find(a => a.id === selectedAvatar)?.name }}
              </h4>
              <p class="text-body-2 text-grey-600">
                {{ currentCategory.name }} 카테고리
              </p>
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <CommonVButton
          common-variant="secondary"
          @click="handleClose"
          class="mr-3"
        >
          취소
        </CommonVButton>
        <CommonVButton
          common-variant="primary"
          @click="handleConfirm"
          :disabled="!selectedAvatar || props.loading"
          :loading="props.loading"
        >
          선택 완료
        </CommonVButton>
      </v-card-actions>
    </CommonVCard>
  </v-dialog>
</template>

<style scoped>
.avatar-preset-modal {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  max-height: 90vh;
  overflow-y: auto;
}

.common-icon {
  font-size: 24px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
}

/* 인기 아바타 섹션 */
.popular-avatars {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 12px;
  max-width: 100%;
}

.popular-avatar-item {
  position: relative;
  padding: 12px 8px;
  border-radius: var(--radius-md);
  border: 2px solid rgba(var(--v-theme-outline), 0.12);
  background: rgba(var(--v-theme-surface), 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.popular-avatar-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.popular-avatar-item.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.avatar-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.avatar-emoji {
  font-size: 32px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  line-height: 1;
}

.usage-indicator {
  position: absolute;
  top: -4px;
  right: -4px;
}

.avatar-name {
  font-weight: 500;
  color: rgb(var(--v-theme-grey-700));
  line-height: 1.2;
  min-height: 16px;
}

/* 카테고리 탭 */
.category-tab {
  min-width: 80px !important;
  padding: 8px 12px !important;
}

.tab-icon {
  font-size: 18px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  margin-right: 4px;
}

.tab-name {
  font-size: 12px;
  font-weight: 500;
}

/* 아바타 그리드 */
.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.avatar-item {
  padding: 16px 12px;
  border-radius: var(--radius-lg);
  border: 2px solid rgba(var(--v-theme-outline), 0.12);
  background: rgba(var(--v-theme-surface), 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.avatar-item:hover {
  border-color: rgba(var(--v-theme-primary), 0.5);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.avatar-item.selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.avatar-item .avatar-emoji {
  font-size: 36px;
}

/* 선택된 아바타 미리보기 */
.selected-preview {
  background: rgba(var(--v-theme-primary), 0.05);
  border-radius: var(--radius-lg);
  padding: 16px;
}

.selected-avatar-display {
  border: 2px solid rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
}

.preview-emoji {
  font-size: 32px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
}

.preview-info h4 {
  color: rgb(var(--v-theme-primary));
}

/* 반응형 디자인 */
@media (max-width: 600px) {
  .popular-avatars {
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
  }
  
  .popular-avatar-item {
    padding: 8px 4px;
  }
  
  .popular-avatar-item .avatar-emoji {
    font-size: 24px;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 12px 0;
  }
  
  .avatar-item {
    padding: 12px 8px;
  }
  
  .avatar-item .avatar-emoji {
    font-size: 28px;
  }
  
  .tab-icon {
    font-size: 16px;
  }
  
  .tab-name {
    font-size: 11px;
  }
  
  .selected-preview {
    padding: 12px;
  }
}

/* 스크롤바 스타일링 */
.avatar-preset-modal::-webkit-scrollbar {
  width: 6px;
}

.avatar-preset-modal::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-grey-200), 0.5);
  border-radius: 3px;
}

.avatar-preset-modal::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-grey-400), 0.8);
  border-radius: 3px;
}

.avatar-preset-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-grey-500), 0.8);
}
</style>