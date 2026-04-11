<template>
  <div class="ant-garden">
    <!-- 로딩 상태 -->
    <CommonVCard v-if="loading && !antStore.isLoaded">
      <v-card-text class="text-center py-12">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
          class="mb-4"
        />
        <p class="text-body-1 text-grey-600">개미 불러오는 중...</p>
      </v-card-text>
    </CommonVCard>

    <!-- 에러 상태 -->
    <CommonVCard v-else-if="error">
      <v-card-text class="text-center py-12">
        <v-icon color="error" size="64" class="mb-4">mdi-alert-circle</v-icon>
        <p class="text-body-1 text-grey-800 mb-4">{{ error }}</p>
        <CommonVButton
          common-variant="primary"
          @click="loadAnt"
          prepend-icon="mdi-reload"
        >
          다시 시도
        </CommonVButton>
      </v-card-text>
    </CommonVCard>

    <!-- 개미 정원 -->
    <div v-else class="garden-content">
      <!-- 헤더 카드 -->
      <CommonVCard class="mb-6">
        <v-card-text class="pa-6 text-center">
          <div class="d-flex align-center justify-center mb-2">
            <v-icon size="32" color="amber">mdi-bug</v-icon>
            <h2 class="text-h5 font-weight-bold ml-2">일개미랩 개미 키우기</h2>
          </div>
          <p class="text-body-2 text-grey-600 mb-4">학습하면서 개미를 성장시켜보세요!</p>
          <div class="d-flex gap-3 justify-center flex-wrap">
            <CommonVButton
              common-variant="primary"
              @click="showCustomizer = true"
              prepend-icon="mdi-palette"
            >
              꾸미기
            </CommonVButton>
            <CommonVButton
              common-variant="secondary"
              @click="syncStats"
              :disabled="loading"
              prepend-icon="mdi-sync"
            >
              동기화
            </CommonVButton>
          </div>
        </v-card-text>
      </CommonVCard>

      <!-- 메인 영역 -->
      <v-row>
        <!-- 개미 디스플레이 -->
        <v-col cols="12" md="5">
          <CommonVCard class="mb-6">
            <v-card-text class="pa-6">
              <div class="garden-background">
                <AntCharacter
                  :stage="antStore.antStage"
                  :level="antStore.antLevel"
                  :name="antStore.antName"
                  :color="antColor"
                  :happiness="antStore.happiness"
                  :hat="antStore.ant?.hat"
                  :clothes="antStore.ant?.clothes"
                  :background="antStore.ant?.background || 'garden'"
                  @ant-clicked="onAntClicked"
                />
              </div>

              <!-- 개미 이름 편집 -->
              <div class="ant-name-editor mb-4">
                <v-text-field
                  v-if="editingName"
                  v-model="newAntName"
                  @blur="saveName"
                  @keyup.enter="saveName"
                  variant="outlined"
                  density="comfortable"
                  placeholder="개미 이름 입력"
                  maxlength="50"
                  autofocus
                  hide-details
                />
                <v-chip
                  v-else
                  color="primary"
                  variant="tonal"
                  size="large"
                  @click="startEditingName"
                  class="px-4"
                  style="cursor: pointer;"
                >
                  <v-icon start>mdi-pencil</v-icon>
                  {{ antStore.antName }}
                </v-chip>
              </div>

              <!-- 색상 선택 -->
              <div class="color-selector">
                <v-chip
                  v-for="color in availableColors"
                  :key="color.value"
                  @click="changeColor(color.value)"
                  :color="antColor === color.value ? 'primary' : 'grey-lighten-3'"
                  :variant="antColor === color.value ? 'elevated' : 'flat'"
                  size="large"
                  class="color-chip"
                >
                  <div class="color-preview" :style="{ backgroundColor: color.hex }"></div>
                  {{ color.label }}
                </v-chip>
              </div>
            </v-card-text>
          </CommonVCard>
        </v-col>

        <!-- 통계 영역 -->
        <v-col cols="12" md="7">
          <AntStats
            :level="antStore.antLevel"
            :total-experience="antStore.totalExperience"
            :happiness="antStore.happiness"
            :progress="antStore.progress"
            :level-info="antStore.levelInfo"
            :stats="antStore.stats"
          />
        </v-col>
      </v-row>

      <!-- 성장 이력 -->
      <CommonVCard v-if="specialEvents.length > 0" class="mt-6">
        <v-card-text class="pa-6">
          <div class="d-flex align-center mb-4">
            <v-icon color="primary" size="24" class="mr-2">mdi-history</v-icon>
            <h3 class="text-h6 font-weight-bold">성장 이력</h3>
          </div>
          <v-list lines="two" class="pa-0 bg-transparent">
            <template v-for="(event, index) in specialEvents.slice(0, 5)" :key="index">
              <v-list-item class="px-0 py-3">
                <template v-slot:prepend>
                  <v-avatar color="primary-lighten-4" size="40">
                    <v-icon color="primary" size="20">mdi-arrow-up-bold</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-medium">
                  {{ event.message }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption">
                  {{ formatDate(event.timestamp) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="index < specialEvents.slice(0, 5).length - 1" />
            </template>
          </v-list>
        </v-card-text>
      </CommonVCard>
    </div>

    <!-- 레벨업 알림 모달 -->
    <v-dialog
      :model-value="!!antStore.levelUpNotification"
      max-width="500"
      persistent
    >
      <CommonVCard class="level-up-card">
        <v-card-text class="pa-8 text-center position-relative">
          <!-- 픽셀 폭죽 이펙트 -->
          <div class="pixel-confetti">
            <div class="pixel-particle" v-for="i in 30" :key="i"></div>
          </div>

          <!-- 픽셀 스타일 축하 배너 -->
          <div class="pixel-celebration mb-6">
            <div class="pixel-banner">
              🎮 LEVEL UP! 🎮
            </div>
          </div>

          <h3 class="text-h4 font-weight-bold mb-4 pixel-text">축하합니다!</h3>
          <p class="text-h6 mb-4 pixel-message">
            {{ antStore.levelUpNotification?.message }}
          </p>

          <!-- 픽셀 스타일 레벨 칩 -->
          <div class="pixel-level-chip mb-6">
            <div class="pixel-border">
              <span class="level-text">
                Lv. {{ antStore.levelUpNotification?.newLevel }}
              </span>
            </div>
          </div>

          <!-- 픽셀 스타일 버튼 -->
          <div class="mt-6">
            <button class="pixel-button" @click="closeLevelUp">
              <span class="button-text">확인</span>
            </button>
          </div>
        </v-card-text>
      </CommonVCard>
    </v-dialog>

    <!-- 보상 알림 스낵바 -->
    <v-snackbar
      :model-value="!!antStore.recentReward"
      location="top right"
      color="success"
      timeout="3000"
    >
      <div class="d-flex align-center">
        <v-icon start>mdi-star</v-icon>
        <span class="font-weight-medium">
          {{ antStore.recentReward?.activityName }} +{{ antStore.recentReward?.xpGained }} XP
        </span>
      </div>
    </v-snackbar>

    <!-- 꾸미기 모달 -->
    <v-dialog
      v-model="showCustomizer"
      max-width="900"
      scrollable
    >
      <CommonVCard>
        <v-card-title class="d-flex align-center justify-space-between pa-6">
          <div class="d-flex align-center">
            <v-icon color="primary" size="28" class="mr-2">mdi-palette</v-icon>
            <span class="text-h6 font-weight-bold">개미 꾸미기</span>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="showCustomizer = false"
          />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <AntCustomizer @saved="onCustomizationSaved" />
        </v-card-text>
      </CommonVCard>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAntStore } from '@/stores/useAntStore';
import CommonVCard from '@/components/common/CommonVCard.vue';
import CommonVButton from '@/components/common/CommonVButton.vue';
import AntCharacter from './AntCharacter.vue';
import AntStats from './AntStats.vue';
import AntCustomizer from './AntCustomizer.vue';

const antStore = useAntStore();

const loading = ref(false);
const error = ref(null);
const editingName = ref(false);
const newAntName = ref('');
const antColor = ref('brown');
const specialEvents = ref([]);
const showCustomizer = ref(false);

const availableColors = [
  { value: 'brown', label: '갈색', hex: '#8B4513' },
  { value: 'red', label: '빨강', hex: '#D32F2F' },
  { value: 'black', label: '검정', hex: '#212121' },
  { value: 'yellow', label: '노랑', hex: '#FDD835' },
  { value: 'green', label: '초록', hex: '#388E3C' },
  { value: 'blue', label: '파랑', hex: '#1976D2' },
  { value: 'purple', label: '보라', hex: '#7B1FA2' },
];

onMounted(async () => {
  await loadAnt();
  await loadHistory();
});

async function loadAnt() {
  loading.value = true;
  error.value = null;

  try {
    await antStore.fetchAntStatus();
    antColor.value = antStore.ant?.antColor || 'brown';
  } catch (err) {
    error.value = err.message || '개미를 불러오는데 실패했습니다.';
  } finally {
    loading.value = false;
  }
}

async function loadHistory() {
  try {
    const history = await antStore.fetchAntHistory();
    specialEvents.value = history.specialEvents || [];
  } catch (err) {
    console.error('이력 불러오기 실패:', err);
  }
}

async function syncStats() {
  loading.value = true;
  try {
    await antStore.syncStats();
    await loadHistory();
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function startEditingName() {
  editingName.value = true;
  newAntName.value = antStore.antName;
}

async function saveName() {
  if (!newAntName.value || newAntName.value.trim() === '') {
    editingName.value = false;
    return;
  }

  try {
    await antStore.updateAntName(newAntName.value.trim());
    editingName.value = false;
  } catch (err) {
    error.value = err.message;
    editingName.value = false;
  }
}

async function changeColor(color) {
  try {
    await antStore.updateAntColor(color);
    antColor.value = color;
  } catch (err) {
    error.value = err.message;
  }
}

async function onAntClicked() {
  console.log('개미를 클릭했어요! 💕');
  try {
    await antStore.clickAnt();
  } catch (err) {
    console.error('개미 클릭 처리 실패:', err);
  }
}

function closeLevelUp() {
  antStore.closeLevelUpNotification();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '방금 전';
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return date.toLocaleDateString('ko-KR');
}

function onCustomizationSaved() {
  showCustomizer.value = false;
  // 개미 상태를 다시 불러와서 최신 커스터마이징 반영
  loadAnt();
}
</script>

<style scoped>
.ant-garden {
  width: 100%;
}

/* 정원 배경 */
.garden-background {
  background: linear-gradient(180deg, #E3F2FD 0%, #FFFDE7 50%, #F1F8E9 100%);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  position: relative;
  overflow: hidden;
  margin-bottom: 20px;
}

.garden-background::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: repeating-linear-gradient(
    90deg,
    #81C784 0px,
    #81C784 10px,
    #66BB6A 10px,
    #66BB6A 20px
  );
  opacity: 0.3;
}

/* 이름 편집 */
.ant-name-editor {
  text-align: center;
}

/* 색상 선택 */
.color-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.color-chip {
  cursor: pointer;
  transition: all 0.2s ease;
}

.color-chip:hover {
  transform: translateY(-2px);
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
}

/* 축하 애니메이션 */
.celebration {
  font-size: 64px;
  animation: celebrate 0.6s ease infinite;
}

@keyframes celebrate {
  0%, 100% { transform: rotate(-10deg) scale(1); }
  50% { transform: rotate(10deg) scale(1.1); }
}

/* 🎮 픽셀 아트 스타일 레벨업 알림 */
.level-up-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 4px solid #fff;
  box-shadow:
    0 0 0 4px #000,
    8px 8px 0 0 rgba(0, 0, 0, 0.3);
  image-rendering: pixelated;
}

/* 픽셀 폭죽 이펙트 */
.pixel-confetti {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.pixel-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FFD700;
  box-shadow:
    0 0 0 2px #FF69B4,
    0 0 0 4px #00FFFF;
  animation: pixel-explode 1.5s ease-out infinite;
  image-rendering: pixelated;
}

.pixel-particle:nth-child(2n) { background: #FF69B4; animation-delay: 0.1s; }
.pixel-particle:nth-child(3n) { background: #00FFFF; animation-delay: 0.2s; }
.pixel-particle:nth-child(4n) { background: #00FF00; animation-delay: 0.15s; }
.pixel-particle:nth-child(5n) { background: #FF00FF; animation-delay: 0.25s; }

.pixel-particle:nth-child(1) { left: 10%; top: 10%; }
.pixel-particle:nth-child(2) { left: 20%; top: 15%; }
.pixel-particle:nth-child(3) { left: 30%; top: 20%; }
.pixel-particle:nth-child(4) { left: 40%; top: 10%; }
.pixel-particle:nth-child(5) { left: 50%; top: 5%; }
.pixel-particle:nth-child(6) { left: 60%; top: 15%; }
.pixel-particle:nth-child(7) { left: 70%; top: 20%; }
.pixel-particle:nth-child(8) { left: 80%; top: 10%; }
.pixel-particle:nth-child(9) { left: 90%; top: 15%; }
.pixel-particle:nth-child(10) { left: 15%; top: 80%; }
.pixel-particle:nth-child(11) { left: 25%; top: 85%; }
.pixel-particle:nth-child(12) { left: 35%; top: 90%; }
.pixel-particle:nth-child(13) { left: 45%; top: 85%; }
.pixel-particle:nth-child(14) { left: 55%; top: 90%; }
.pixel-particle:nth-child(15) { left: 65%; top: 85%; }
.pixel-particle:nth-child(16) { left: 75%; top: 90%; }
.pixel-particle:nth-child(17) { left: 85%; top: 85%; }
.pixel-particle:nth-child(18) { left: 5%; top: 40%; }
.pixel-particle:nth-child(19) { left: 95%; top: 45%; }
.pixel-particle:nth-child(20) { left: 10%; top: 50%; }
.pixel-particle:nth-child(21) { left: 90%; top: 55%; }
.pixel-particle:nth-child(22) { left: 15%; top: 60%; }
.pixel-particle:nth-child(23) { left: 85%; top: 65%; }
.pixel-particle:nth-child(24) { left: 20%; top: 70%; }
.pixel-particle:nth-child(25) { left: 80%; top: 75%; }
.pixel-particle:nth-child(26) { left: 50%; top: 95%; }
.pixel-particle:nth-child(27) { left: 50%; top: 50%; }
.pixel-particle:nth-child(28) { left: 25%; top: 50%; }
.pixel-particle:nth-child(29) { left: 75%; top: 50%; }
.pixel-particle:nth-child(30) { left: 50%; top: 25%; }

@keyframes pixel-explode {
  0% {
    transform: translate(0, 0) scale(0);
    opacity: 1;
  }
  50% {
    transform: translate(var(--tx, 20px), var(--ty, -30px)) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx, 40px), var(--ty, 50px)) scale(0);
    opacity: 0;
  }
}

/* 픽셀 배너 */
.pixel-celebration {
  position: relative;
  z-index: 1;
}

.pixel-banner {
  display: inline-block;
  padding: 16px 32px;
  background: #FFD700;
  border: 4px solid #000;
  box-shadow:
    inset -4px -4px 0 0 #FFA500,
    4px 4px 0 0 #000;
  font-size: 28px;
  font-weight: 900;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
  color: #fff;
  letter-spacing: 2px;
  animation: pixel-bounce 0.6s ease-in-out infinite;
  image-rendering: pixelated;
}

@keyframes pixel-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-8px) scale(1.05); }
}

/* 픽셀 텍스트 */
.pixel-text {
  color: #fff;
  text-shadow:
    3px 3px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
  letter-spacing: 1px;
  animation: pixel-glow 1s ease-in-out infinite;
}

.pixel-message {
  color: #fff;
  text-shadow:
    2px 2px 0 #000,
    -1px -1px 0 #000;
  font-weight: 600;
}

@keyframes pixel-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(255, 255, 255, 1));
  }
}

/* 픽셀 레벨 칩 */
.pixel-level-chip {
  display: inline-block;
  position: relative;
  z-index: 1;
}

.pixel-border {
  background: #FF69B4;
  border: 4px solid #000;
  padding: 16px 40px;
  box-shadow:
    inset -4px -4px 0 0 #FF1493,
    6px 6px 0 0 #000;
  position: relative;
  animation: pixel-pulse 0.8s ease-in-out infinite;
}

.pixel-border::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  animation: pixel-shine 2s linear infinite;
}

.level-text {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  text-shadow:
    3px 3px 0 #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000;
  letter-spacing: 2px;
}

@keyframes pixel-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes pixel-shine {
  0% { opacity: 0; transform: rotate(0deg); }
  50% { opacity: 1; }
  100% { opacity: 0; transform: rotate(360deg); }
}

/* 픽셀 버튼 */
.pixel-button {
  background: #00FF00;
  border: 4px solid #000;
  padding: 16px 48px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 900;
  color: #000;
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
  box-shadow:
    inset -4px -4px 0 0 #00CC00,
    6px 6px 0 0 #000;
  transition: all 0.1s;
  position: relative;
  z-index: 1;
  image-rendering: pixelated;
  letter-spacing: 2px;
}

.pixel-button:hover {
  background: #00FF7F;
  transform: translate(2px, 2px);
  box-shadow:
    inset -4px -4px 0 0 #00DD00,
    4px 4px 0 0 #000;
}

.pixel-button:active {
  transform: translate(4px, 4px);
  box-shadow:
    inset -2px -2px 0 0 #00DD00,
    2px 2px 0 0 #000;
}

.button-text {
  display: inline-block;
  animation: pixel-button-text 0.5s ease-in-out infinite;
}

@keyframes pixel-button-text {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 반응형 */
@media (max-width: 960px) {
  .garden-background {
    padding: 24px;
    min-height: 250px;
  }

  .pixel-banner {
    font-size: 20px;
    padding: 12px 24px;
  }

  .level-text {
    font-size: 24px;
  }

  .pixel-button {
    padding: 12px 32px;
    font-size: 16px;
  }
}
</style>
