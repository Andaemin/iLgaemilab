<template>
  <div class="ant-customizer">
    <h3 class="customizer-title">🎨 개미 꾸미기</h3>

    <!-- 현재 레벨 정보 -->
    <div class="level-info">
      <span class="current-level">Lv. {{ currentLevel }}</span>
      <span class="level-name">{{ levelName }}</span>
    </div>

    <!-- 모자 선택 -->
    <div class="customizer-section">
      <h4 class="section-title">🧢 모자</h4>
      <div class="option-grid">
        <button
          v-for="(icon, key) in hatOptions"
          :key="key"
          class="option-button"
          :class="{
            active: selectedHat === key,
            locked: !isHatUnlocked(key)
          }"
          @click="selectHat(key)"
          :disabled="!isHatUnlocked(key)"
        >
          <div v-if="!isHatUnlocked(key)" class="lock-overlay">
            <span class="lock-icon">🔒</span>
            <span class="unlock-level">Lv. {{ hatUnlockLevels[key] }}</span>
          </div>
          <span class="option-icon">{{ icon }}</span>
          <span class="option-label">{{ hatLabels[key] }}</span>
        </button>
        <button
          class="option-button"
          :class="{ active: selectedHat === null }"
          @click="selectHat(null)"
        >
          <span class="option-icon">❌</span>
          <span class="option-label">없음</span>
        </button>
      </div>
    </div>

    <!-- 옷 선택 -->
    <div class="customizer-section">
      <h4 class="section-title">👕 옷</h4>
      <div class="option-grid">
        <button
          v-for="(icon, key) in clothesOptions"
          :key="key"
          class="option-button"
          :class="{
            active: selectedClothes === key,
            locked: !isClothesUnlocked(key)
          }"
          @click="selectClothes(key)"
          :disabled="!isClothesUnlocked(key)"
        >
          <div v-if="!isClothesUnlocked(key)" class="lock-overlay">
            <span class="lock-icon">🔒</span>
            <span class="unlock-level">Lv. {{ clothesUnlockLevels[key] }}</span>
          </div>
          <span class="option-icon">{{ icon }}</span>
          <span class="option-label">{{ clothesLabels[key] }}</span>
        </button>
        <button
          class="option-button"
          :class="{ active: selectedClothes === null }"
          @click="selectClothes(null)"
        >
          <span class="option-icon">❌</span>
          <span class="option-label">없음</span>
        </button>
      </div>
    </div>

    <!-- 배경 선택 -->
    <div class="customizer-section">
      <h4 class="section-title">🌈 배경</h4>
      <div class="background-grid">
        <button
          v-for="(style, key) in backgroundOptions"
          :key="key"
          class="background-button"
          :class="{
            active: selectedBackground === key,
            locked: !isBackgroundUnlocked(key)
          }"
          :style="{ background: isBackgroundUnlocked(key) ? style : '#ccc' }"
          @click="selectBackground(key)"
          :disabled="!isBackgroundUnlocked(key)"
        >
          <div v-if="!isBackgroundUnlocked(key)" class="lock-overlay">
            <span class="lock-icon">🔒</span>
            <span class="unlock-level">Lv. {{ backgroundUnlockLevels[key] }}</span>
          </div>
          <span class="background-label">{{ backgroundLabels[key] }}</span>
        </button>
      </div>
    </div>

    <!-- 저장 버튼 -->
    <div class="customizer-actions">
      <button class="save-button" @click="saveCustomization" :disabled="saving">
        {{ saving ? '저장 중...' : '💾 저장하기' }}
      </button>
    </div>

    <!-- 잠금 해제 안내 -->
    <div class="unlock-hint">
      <p>💡 레벨을 올려 더 많은 아이템을 잠금 해제하세요!</p>
      <p>학습 활동과 게임을 완료하면 경험치를 얻을 수 있어요.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAntStore } from '@/stores/useAntStore';

const antStore = useAntStore();
const emit = defineEmits(['saved']);

const selectedHat = ref(null);
const selectedClothes = ref(null);
const selectedBackground = ref('garden');
const saving = ref(false);

// 현재 레벨 정보
const currentLevel = computed(() => antStore.ant?.level || 1);
const levelName = computed(() => {
  const stage = antStore.ant?.stage || 'egg';
  const names = {
    egg: '알',
    larva: '애벌레',
    pupa: '번데기',
    worker: '일개미',
    soldier: '병정개미',
    queen: '여왕개미',
  };
  return names[stage] || '알';
});

// 모자 옵션
const hatOptions = {
  cap: '🧢',
  tophat: '🎩',
  crown: '👑',
  party: '🎉',
  graduation: '🎓',
  cowboy: '🤠',
  santa: '🎅',
};

const hatLabels = {
  cap: '야구모자',
  tophat: '실크햇',
  crown: '왕관',
  party: '파티',
  graduation: '학사모',
  cowboy: '카우보이',
  santa: '산타',
};

// 모자 잠금 해제 레벨
const hatUnlockLevels = {
  cap: 1,        // 레벨 1 (알)
  tophat: 2,     // 레벨 2 (애벌레)
  crown: 3,      // 레벨 3 (번데기)
  party: 4,      // 레벨 4 (일개미)
  graduation: 5, // 레벨 5 (병정개미)
  cowboy: 5,     // 레벨 5 (병정개미)
  santa: 6,      // 레벨 6 (여왕개미)
};

// 옷 옵션
const clothesOptions = {
  tshirt: '👕',
  suit: '🤵',
  dress: '👗',
  hoodie: '🧥',
  armor: '🛡️',
};

const clothesLabels = {
  tshirt: '티셔츠',
  suit: '정장',
  dress: '드레스',
  hoodie: '후드티',
  armor: '갑옷',
};

// 옷 잠금 해제 레벨
const clothesUnlockLevels = {
  tshirt: 1,  // 레벨 1 (알)
  suit: 2,    // 레벨 2 (애벌레)
  dress: 3,   // 레벨 3 (번데기)
  hoodie: 4,  // 레벨 4 (일개미)
  armor: 5,   // 레벨 5 (병정개미)
};

// 배경 옵션 (그라데이션 추가)
const backgroundOptions = {
  garden: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
  beach: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  sunset: 'linear-gradient(135deg, #ff6b6b 0%, #ffa06b 50%, #ffdd6b 100%)',
  ocean: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  night: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  forest: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  fire: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  space: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  aurora: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 50%, #d299c2 100%)',
  sakura: 'linear-gradient(135deg, #ffeef8 0%, #ffb6d9 100%)',
  golden: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
};

const backgroundLabels = {
  garden: '정원',
  beach: '해변',
  sunset: '일몰',
  ocean: '바다',
  night: '밤',
  forest: '숲',
  rainbow: '무지개',
  fire: '불꽃',
  space: '우주',
  aurora: '오로라',
  sakura: '벚꽃',
  golden: '황금',
};

// 배경 잠금 해제 레벨
const backgroundUnlockLevels = {
  garden: 1,   // 레벨 1 (알)
  beach: 2,    // 레벨 2 (애벌레)
  sunset: 2,   // 레벨 2 (애벌레)
  ocean: 3,    // 레벨 3 (번데기)
  night: 3,    // 레벨 3 (번데기)
  forest: 4,   // 레벨 4 (일개미)
  rainbow: 4,  // 레벨 4 (일개미)
  fire: 5,     // 레벨 5 (병정개미)
  space: 5,    // 레벨 5 (병정개미)
  aurora: 6,   // 레벨 6 (여왕개미)
  sakura: 6,   // 레벨 6 (여왕개미)
  golden: 6,   // 레벨 6 (여왕개미)
};

// 잠금 해제 확인 함수들
function isHatUnlocked(hatKey) {
  return currentLevel.value >= hatUnlockLevels[hatKey];
}

function isClothesUnlocked(clothesKey) {
  return currentLevel.value >= clothesUnlockLevels[clothesKey];
}

function isBackgroundUnlocked(backgroundKey) {
  return currentLevel.value >= backgroundUnlockLevels[backgroundKey];
}

// 선택 함수들
function selectHat(hat) {
  if (hat === null || isHatUnlocked(hat)) {
    selectedHat.value = hat;
  }
}

function selectClothes(clothes) {
  if (clothes === null || isClothesUnlocked(clothes)) {
    selectedClothes.value = clothes;
  }
}

function selectBackground(background) {
  if (isBackgroundUnlocked(background)) {
    selectedBackground.value = background;
  }
}

// 저장 함수
async function saveCustomization() {
  saving.value = true;

  try {
    await antStore.updateCustomization({
      hat: selectedHat.value,
      clothes: selectedClothes.value,
      background: selectedBackground.value,
    });

    emit('saved');
  } catch (error) {
    console.error('커스터마이징 저장 실패:', error);
    alert('꾸미기 저장에 실패했습니다.');
  } finally {
    saving.value = false;
  }
}

// 현재 설정 불러오기
onMounted(() => {
  if (antStore.ant) {
    selectedHat.value = antStore.ant.hat;
    selectedClothes.value = antStore.ant.clothes;
    selectedBackground.value = antStore.ant.background || 'garden';
  }
});
</script>

<style scoped>
.ant-customizer {
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.customizer-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}

.level-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.current-level {
  font-size: 20px;
  font-weight: 700;
  color: white;
}

.level-name {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
}

.customizer-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #555;
  margin-bottom: 12px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.option-button {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px;
  background: #f5f5f5;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-button:not(:disabled):hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.option-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.option-button.locked {
  background: #e0e0e0;
  cursor: not-allowed;
  opacity: 0.6;
}

.option-button:disabled {
  cursor: not-allowed;
}

.lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 10px;
  z-index: 2;
}

.lock-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.unlock-level {
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 2px 6px;
  border-radius: 8px;
}

.option-icon {
  font-size: 32px;
  filter: grayscale(0);
  transition: filter 0.2s ease;
}

.option-button.locked .option-icon {
  filter: grayscale(100%);
  opacity: 0.4;
}

.option-label {
  font-size: 12px;
  font-weight: 500;
}

.option-button.active .option-label {
  color: white;
}

.option-button.locked .option-label {
  color: #999;
}

.background-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.background-button {
  position: relative;
  height: 80px;
  border: 3px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.background-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.background-button.active {
  border-color: white;
  box-shadow: 0 0 0 3px #667eea;
}

.background-button.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.background-button:disabled {
  cursor: not-allowed;
}

.background-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  background: rgba(0, 0, 0, 0.3);
  padding: 4px 12px;
  border-radius: 8px;
  white-space: nowrap;
  z-index: 1;
}

.customizer-actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.save-button {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.save-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.unlock-hint {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #ffeef8 0%, #ffe8f5 100%);
  border-radius: 12px;
  border: 2px solid #ffb6d9;
}

.unlock-hint p {
  margin: 0;
  font-size: 13px;
  color: #666;
  text-align: center;
  line-height: 1.6;
}

.unlock-hint p:first-child {
  font-weight: 600;
  color: #764ba2;
  margin-bottom: 4px;
}
</style>
