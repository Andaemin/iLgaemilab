<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()

const emit = defineEmits(['show-learning-note', 'show-ant-garden', 'show-edit-profile'])

const showLogoutDialog = ref(false)

const menuItems = [
  {
    commonIcon: '🐜',
    label: '일개미 키우기',
    description: '학습하면서 귀여운 개미를 성장시켜보세요!',
    action: 'showAntGarden',
    color: 'amber'
  },
  {
    commonIcon: '✏️',
    label: '정보 수정하기',
    description: '내 개인정보와 프로필을 수정하세요',
    action: 'showEditProfile',
    color: 'blue'
  },
  {
    commonIcon: '🎮',
    label: '게임하기',
    description: '재미있는 게임으로 학습을 즐겨보세요',
    path: '/game',
    color: 'indigo'
  },
  {
    commonIcon: '📝',
    label: '레벨테스트',
    description: '나의 한국어 실력을 테스트해보세요',
    path: '/level-test',
    color: 'teal'
  },
  {
    commonIcon: '📚',
    label: '학습 노트',
    description: '오늘 배운 내용을 영어로 번역하며 정리하세요',
    action: 'showLearningNote',
    color: 'cyan'
  },
  {
    commonIcon: '🚪',
    label: '로그아웃',
    description: '안전하게 로그아웃합니다',
    action: 'logout',
    color: 'red'
  }
]

const navigateTo = (path) => {
  router.push(path)
}

const handleMenuClick = (item) => {
  if (item.action === 'logout') {
    showLogoutDialog.value = true
  } else if (item.action === 'showLearningNote') {
    emit('show-learning-note')
  } else if (item.action === 'showAntGarden') {
    emit('show-ant-garden')
  } else if (item.action === 'showEditProfile') {
    emit('show-edit-profile')
  } else if (item.path) {
    navigateTo(item.path)
  }
}

const confirmLogout = () => {
  authStore.logout()
  router.push('/login')
  showLogoutDialog.value = false
  snackbarStore.showSuccess('로그아웃되었습니다 👋')
}

const cancelLogout = () => {
  showLogoutDialog.value = false
}
</script>

<template>
  <CommonVCard class="profile-menu-section">
    <v-card-text class="pa-0">
      <v-list class="pa-0">
        <template v-for="(item, index) in menuItems" :key="item.label">
          <v-list-item
            :ripple="true"
            class="menu-item pa-4"
            @click="handleMenuClick(item)"
          >
            <template v-slot:prepend>
              <div
                class="menu-icon-wrapper common-icon-wrapper"
                :style="{ backgroundColor: `rgb(var(--v-theme-${item.color}-50))` }"
              >
                <span class="common-icon">{{ item.commonIcon }}</span>
              </div>
            </template>

            <v-list-item-title class="font-weight-bold text-grey-900 mb-1">
              {{ item.label }}
            </v-list-item-title>
            
            <v-list-item-subtitle class="text-grey-600 text-caption">
              {{ item.description }}
            </v-list-item-subtitle>

            <template v-slot:append>
              <v-icon color="grey-400">mdi-chevron-right</v-icon>
            </template>
          </v-list-item>

          <v-divider v-if="index < menuItems.length - 1" />
        </template>
      </v-list>
    </v-card-text>
    
    <!-- 로그아웃 확인 다이얼로그 -->
    <v-dialog v-model="showLogoutDialog" max-width="400" persistent>
      <CommonVCard class="text-center">
        <v-card-text class="pa-6">
          <div class="logout-emoji mb-4">
            <span class="common-emoji-large">😢</span>
          </div>
          <h3 class="text-h6 font-weight-bold mb-3">정말 로그아웃하시겠어요?</h3>
          <p class="text-body-2 text-grey-600 mb-6">
            로그아웃하시면 다시 로그인해야 합니다.
          </p>
          
          <div class="d-flex gap-3 justify-center">
            <CommonVButton
              common-variant="secondary"
              @click="cancelLogout"
              size="large"
              class="flex-grow-1"
            >
              취소
            </CommonVButton>
            <CommonVButton
              common-variant="primary"
              @click="confirmLogout"
              size="large"
              class="flex-grow-1"
              color="error"
            >
              로그아웃
            </CommonVButton>
          </div>
        </v-card-text>
      </CommonVCard>
    </v-dialog>
  </CommonVCard>
</template>

<style scoped>
.profile-menu-section {
  margin-bottom: 24px;
}

.menu-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:hover {
  background-color: rgb(var(--v-theme-grey-50));
  transform: translateY(-1px);
}

.menu-icon-wrapper {
  margin-right: 16px !important;
  border-radius: 12px !important;
}

.common-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.common-icon {
  font-size: 24px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  line-height: 1;
}

.menu-item:hover .common-icon-wrapper {
  transform: scale(1.05);
}

:deep(.v-list-item__prepend) {
  padding-right: 16px;
}

:deep(.v-list-item__append) {
  padding-left: 16px;
}

/* 로그아웃 다이얼로그 스타일 */
.logout-emoji {
  display: flex;
  justify-content: center;
  align-items: center;
}

.common-emoji-large {
  font-size: 48px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  line-height: 1;
}
</style>