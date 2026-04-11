<template>
  <div class="ant-character" :class="{ 'is-happy': showHappiness }">
    <!-- 배경 (꾸미기에서 선택한 경우만 표시) -->
    <div v-if="background !== 'garden'" class="ant-background" :class="`bg-${background}`" :style="backgroundStyle">
      <!-- 배경 장식 요소들 -->
      <div class="bg-ground"></div>
      <div class="bg-fence-left"></div>
      <div class="bg-fence-right"></div>
      <div class="bg-sunlight"></div>
      <div class="bg-decoration"></div>
    </div>

    <div class="ant-container" @click="onAntClick">
      <!-- 모자 (모든 단계에서 표시) -->
      <div v-if="hat" class="ant-hat" :class="`hat-${stage}`">
        {{ hatIcons[hat] || hat }}
      </div>

      <!-- 옷 (모든 단계에서 표시) -->
      <div v-if="clothes" class="ant-clothes" :class="[`clothes-${stage}`, `clothes-${clothes}`]">
        <!-- 티셔츠 -->
        <template v-if="clothes === 'tshirt'">
          <div class="tshirt-body"></div>
          <div class="tshirt-sleeve left"></div>
          <div class="tshirt-sleeve right"></div>
        </template>

        <!-- 정장 -->
        <template v-else-if="clothes === 'suit'">
          <div class="suit-jacket"></div>
          <div class="suit-shirt"></div>
          <div class="suit-tie"></div>
          <div class="suit-collar left"></div>
          <div class="suit-collar right"></div>
        </template>

        <!-- 드레스 -->
        <template v-else-if="clothes === 'dress'">
          <div class="dress-top"></div>
          <div class="dress-skirt"></div>
          <div class="dress-ribbon"></div>
        </template>

        <!-- 후드티 -->
        <template v-else-if="clothes === 'hoodie'">
          <div class="hoodie-body"></div>
          <div class="hoodie-hood"></div>
          <div class="hoodie-pocket"></div>
          <div class="hoodie-string left"></div>
          <div class="hoodie-string right"></div>
        </template>

        <!-- 갑옷 -->
        <template v-else-if="clothes === 'armor'">
          <div class="armor-chest"></div>
          <div class="armor-plate" v-for="i in 3" :key="i"></div>
          <div class="armor-shine"></div>
        </template>
      </div>

      <!-- 알 (Egg) - 토스 스타일 -->
      <div v-if="stage === 'egg'" class="ant-stage ant-egg">
        <div class="egg-shell" :style="{ background: eggGradient }">
          <div class="egg-shine"></div>
          <div class="egg-pattern"></div>
        </div>
      </div>

      <!-- 애벌레 (Larva) - 토스 스타일 -->
      <div v-else-if="stage === 'larva'" class="ant-stage ant-larva">
        <div class="larva-body" :style="{ background: larvaGradient }">
          <div class="larva-segment" v-for="i in 5" :key="i"></div>
          <div class="larva-shine"></div>
        </div>
        <div class="larva-face">
          <div class="larva-eyes">
            <div class="eye left">
              <div class="pupil"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
            </div>
          </div>
          <div class="larva-mouth"></div>
        </div>
      </div>

      <!-- 번데기 (Pupa) - 토스 스타일 -->
      <div v-else-if="stage === 'pupa'" class="ant-stage ant-pupa">
        <div class="pupa-shell" :style="{ background: pupaGradient }">
          <div class="pupa-shine"></div>
          <div class="pupa-lines" v-for="i in 6" :key="i"></div>
          <div class="pupa-glow"></div>
        </div>
      </div>

      <!-- 일개미 (Worker) - 토스 스타일 -->
      <div v-else-if="stage === 'worker'" class="ant-stage ant-worker">
        <div class="ant-head" :style="{ background: workerHeadGradient }">
          <div class="antenna left"></div>
          <div class="antenna right"></div>
          <div class="ant-eyes">
            <div class="eye left">
              <div class="pupil"></div>
              <div class="sparkle"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
              <div class="sparkle"></div>
            </div>
          </div>
          <div class="ant-smile"></div>
        </div>
        <div class="ant-body" :style="{ background: workerBodyGradient }">
          <div class="body-segment thorax"></div>
          <div class="body-segment abdomen"></div>
          <div class="body-shine"></div>
        </div>
        <div class="ant-legs">
          <div class="leg" v-for="i in 6" :key="i"></div>
        </div>
      </div>

      <!-- 병정개미 (Soldier) - 토스 스타일 -->
      <div v-else-if="stage === 'soldier'" class="ant-stage ant-soldier">
        <div class="ant-head soldier-head" :style="{ background: soldierHeadGradient }">
          <div class="antenna left"></div>
          <div class="antenna right"></div>
          <div class="mandibles">
            <div class="mandible left"></div>
            <div class="mandible right"></div>
          </div>
          <div class="ant-eyes">
            <div class="eye left">
              <div class="pupil"></div>
              <div class="sparkle"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
              <div class="sparkle"></div>
            </div>
          </div>
          <div class="soldier-expression"></div>
        </div>
        <div class="ant-body soldier-body" :style="{ background: soldierBodyGradient }">
          <div class="body-segment thorax"></div>
          <div class="body-segment abdomen"></div>
          <div class="armor-plates">
            <div class="armor-plate" v-for="i in 3" :key="i"></div>
          </div>
          <div class="body-shine"></div>
        </div>
        <div class="ant-legs soldier-legs">
          <div class="leg" v-for="i in 6" :key="i"></div>
        </div>
      </div>

      <!-- 여왕개미 (Queen) - 토스 스타일 -->
      <div v-else-if="stage === 'queen'" class="ant-stage ant-queen">
        <div class="queen-aura"></div>
        <div class="ant-head queen-head" :style="{ background: queenHeadGradient }">
          <div class="antenna left royal"></div>
          <div class="antenna right royal"></div>
          <div class="ant-eyes">
            <div class="eye left">
              <div class="pupil"></div>
              <div class="sparkle"></div>
              <div class="sparkle small"></div>
            </div>
            <div class="eye right">
              <div class="pupil"></div>
              <div class="sparkle"></div>
              <div class="sparkle small"></div>
            </div>
          </div>
          <div class="queen-smile"></div>
        </div>
        <div class="ant-body queen-body" :style="{ background: queenBodyGradient }">
          <div class="body-segment thorax royal"></div>
          <div class="body-segment abdomen royal"></div>
          <div class="wing left">
            <div class="wing-pattern"></div>
          </div>
          <div class="wing right">
            <div class="wing-pattern"></div>
          </div>
          <div class="body-shine royal"></div>
          <div class="royal-gems">
            <div class="gem" v-for="i in 3" :key="i"></div>
          </div>
        </div>
        <div class="ant-legs queen-legs">
          <div class="leg" v-for="i in 6" :key="i"></div>
        </div>
      </div>

      <!-- 행복도 표시 -->
      <transition name="happiness">
        <div v-if="showHappiness" class="happiness-indicator">
          <span class="heart">❤️</span>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  stage: {
    type: String,
    default: 'egg',
    validator: (value) => ['egg', 'larva', 'pupa', 'worker', 'soldier', 'queen'].includes(value),
  },
  level: {
    type: Number,
    default: 1,
  },
  name: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    default: 'brown',
  },
  happiness: {
    type: Number,
    default: 50,
  },
  hat: {
    type: String,
    default: null,
  },
  clothes: {
    type: String,
    default: null,
  },
  background: {
    type: String,
    default: 'garden',
  },
});

const emit = defineEmits(['ant-clicked']);

const showHappiness = ref(false);

// 색상 매핑
const colorMap = {
  brown: '#8B4513',
  red: '#D32F2F',
  black: '#212121',
  yellow: '#FDD835',
  green: '#388E3C',
  blue: '#1976D2',
  purple: '#7B1FA2',
};

const antColorValue = computed(() => colorMap[props.color] || colorMap.brown);

// 토스 스타일 그라디언트 - 알
const eggGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 50%, ${baseColor}aa 100%)`;
});

// 토스 스타일 그라디언트 - 애벌레
const larvaGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(180deg, ${baseColor}ee 0%, ${baseColor} 50%, ${baseColor}dd 100%)`;
});

// 토스 스타일 그라디언트 - 번데기
const pupaGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(135deg, ${baseColor}dd 0%, ${baseColor}99 40%, ${baseColor}bb 60%, ${baseColor}cc 100%)`;
});

// 토스 스타일 그라디언트 - 일개미 머리
const workerHeadGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `radial-gradient(circle at 30% 30%, ${baseColor}ff 0%, ${baseColor}dd 50%, ${baseColor}bb 100%)`;
});

// 토스 스타일 그라디언트 - 일개미 몸통
const workerBodyGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(90deg, ${baseColor}dd 0%, ${baseColor} 50%, ${baseColor}dd 100%)`;
});

// 토스 스타일 그라디언트 - 병정개미 머리
const soldierHeadGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `radial-gradient(circle at 35% 30%, ${baseColor}ff 0%, ${baseColor}ee 40%, ${baseColor}cc 100%)`;
});

// 토스 스타일 그라디언트 - 병정개미 몸통
const soldierBodyGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(90deg, ${baseColor}ee 0%, ${baseColor}ff 30%, ${baseColor}dd 70%, ${baseColor}ee 100%)`;
});

// 토스 스타일 그라디언트 - 여왕개미 머리
const queenHeadGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `radial-gradient(circle at 30% 25%, ${baseColor}ff 0%, #FFD700 20%, ${baseColor}ff 40%, ${baseColor}dd 100%)`;
});

// 토스 스타일 그라디언트 - 여왕개미 몸통
const queenBodyGradient = computed(() => {
  const baseColor = antColorValue.value;
  return `linear-gradient(135deg, ${baseColor}ff 0%, #FFD700 15%, ${baseColor}ff 30%, ${baseColor}ee 60%, ${baseColor}dd 100%)`;
});

// 모자 아이콘 매핑
const hatIcons = {
  cap: '🧢',
  tophat: '🎩',
  crown: '👑',
  party: '🎉',
  graduation: '🎓',
  cowboy: '🤠',
  santa: '🎅',
};

// 옷 스타일 매핑
const clothesStyles = {
  tshirt: '👕',
  suit: '🤵',
  dress: '👗',
  hoodie: '🧥',
  armor: '🛡️',
};

// 배경 스타일 매핑
const backgroundStyles = {
  garden: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
  beach: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)',
  night: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
  rainbow: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  space: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  sakura: 'linear-gradient(135deg, #ffeef8 0%, #ffb6d9 100%)',
};

const backgroundStyle = computed(() => ({
  background: backgroundStyles[props.background] || backgroundStyles.garden,
}));

// 행복도가 높으면 자동으로 하트 표시
watch(() => props.happiness, (newVal) => {
  if (newVal >= 80 && !showHappiness.value) {
    showHappiness.value = true;
    setTimeout(() => {
      showHappiness.value = false;
    }, 2000);
  }
});

// 개미 클릭 이벤트
function onAntClick() {
  showHappiness.value = true;
  setTimeout(() => {
    showHappiness.value = false;
  }, 1500);
  emit('ant-clicked');
}
</script>

<style scoped>
.ant-character {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  overflow: hidden;
  border-radius: 16px;
  min-height: 250px;
}

/* 배경 */
.ant-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  z-index: 0;
  opacity: 1;
  filter: none;
  pointer-events: none;
}

/* 모자 - 픽셀 개미 크기에 맞게 조정 */
.ant-hat {
  position: absolute;
  font-size: 28px;
  z-index: 10;
  animation: hatFloat 2s ease-in-out infinite;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
  image-rendering: pixelated !important;
}

.ant-hat.hat-egg {
  top: calc(var(--pixel) * -7);
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
}

.ant-hat.hat-larva {
  top: calc(var(--pixel) * -6);
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
}

.ant-hat.hat-pupa {
  top: calc(var(--pixel) * -7);
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
}

.ant-hat.hat-worker {
  top: calc(var(--pixel) * -6);
  left: 50%;
  transform: translateX(-50%);
  font-size: 22px;
}

.ant-hat.hat-soldier {
  top: calc(var(--pixel) * -6);
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
}

.ant-hat.hat-queen {
  top: calc(var(--pixel) * -7);
  left: 50%;
  transform: translateX(-50%);
  font-size: 26px;
}

@keyframes hatFloat {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-3px); }
}

/* 옷 - 픽셀 개미 크기에 맞게 조정 */
.ant-clothes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
  pointer-events: none;
  image-rendering: pixelated !important;
}

/* ===== 티셔츠 (T-shirt) ===== */
.tshirt-body {
  width: 40px;
  height: 35px;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 8px 8px 12px 12px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.tshirt-sleeve {
  position: absolute;
  width: 12px;
  height: 20px;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  border-radius: 6px;
  top: 2px;
}

.tshirt-sleeve.left {
  left: -10px;
  transform: rotate(-15deg);
}

.tshirt-sleeve.right {
  right: -10px;
  transform: rotate(15deg);
}

/* 알 단계 티셔츠 (10x12 픽셀 = 50x60px) */
.clothes-egg.clothes-tshirt {
  top: 55%;
}

.clothes-egg.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 8);
  height: calc(var(--pixel) * 6);
  border-radius: 4px 4px 6px 6px;
}

.clothes-egg.clothes-tshirt .tshirt-sleeve {
  width: calc(var(--pixel) * 2);
  height: calc(var(--pixel) * 3);
}

/* 애벌레 단계 티셔츠 (14x9 픽셀 = 70x45px) */
.clothes-larva.clothes-tshirt {
  top: 60%;
}

.clothes-larva.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 5);
  border-radius: 12px;
}

.clothes-larva.clothes-tshirt .tshirt-sleeve {
  width: calc(var(--pixel) * 2);
  height: calc(var(--pixel) * 2.5);
  top: calc(var(--pixel) * 1);
}

/* 번데기 단계 티셔츠 (10x13 픽셀 = 50x65px) */
.clothes-pupa.clothes-tshirt {
  top: 60%;
}

.clothes-pupa.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 7);
  height: calc(var(--pixel) * 8);
  border-radius: 14px 14px 16px 16px;
}

.clothes-pupa.clothes-tshirt .tshirt-sleeve {
  display: none;
}

/* 일개미 단계 티셔츠 (8x8 + 10x11 = 40+55px) */
.clothes-worker.clothes-tshirt {
  top: 70%;
}

.clothes-worker.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 9);
  height: calc(var(--pixel) * 8);
}

/* 병정개미 단계 티셔츠 (9x9 + 11x12 = 45+60px) */
.clothes-soldier.clothes-tshirt {
  top: 70%;
}

.clothes-soldier.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 9);
}

/* 여왕개미 단계 티셔츠 (10x10 + 13x15 = 50+75px) */
.clothes-queen.clothes-tshirt {
  top: 75%;
}

.clothes-queen.clothes-tshirt .tshirt-body {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 11);
}

/* ===== 정장 (Suit) ===== */
.suit-jacket {
  width: 45px;
  height: 40px;
  background: linear-gradient(135deg, #2C3E50 0%, #1A252F 100%);
  border-radius: 8px 8px 14px 14px;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.suit-shirt {
  position: absolute;
  width: 20px;
  height: 30px;
  background: white;
  top: 5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px 4px 0 0;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
}

.suit-tie {
  position: absolute;
  width: 8px;
  height: 18px;
  background: linear-gradient(135deg, #C0392B 0%, #96281B 100%);
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  clip-path: polygon(50% 0%, 0% 15%, 20% 100%, 80% 100%, 100% 15%);
}

.suit-collar {
  position: absolute;
  width: 12px;
  height: 12px;
  background: white;
  top: 5px;
  clip-path: polygon(0 0, 100% 0, 50% 100%);
}

.suit-collar.left {
  left: 8px;
  transform: rotate(-20deg);
}

.suit-collar.right {
  right: 8px;
  transform: rotate(20deg);
}

/* 알 단계 정장 */
.clothes-egg.clothes-suit {
  top: 55%;
}

.clothes-egg.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 8);
  height: calc(var(--pixel) * 6);
  border-radius: 4px 4px 6px 6px;
}

.clothes-egg.clothes-suit .suit-shirt {
  width: calc(var(--pixel) * 3.5);
  height: calc(var(--pixel) * 5);
}

.clothes-egg.clothes-suit .suit-tie {
  width: calc(var(--pixel) * 1.5);
  height: calc(var(--pixel) * 3);
}

/* 애벌레 단계 정장 */
.clothes-larva.clothes-suit {
  top: 60%;
}

.clothes-larva.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 5);
  border-radius: 12px;
}

.clothes-larva.clothes-suit .suit-collar {
  display: none;
}

/* 번데기 단계 정장 */
.clothes-pupa.clothes-suit {
  top: 60%;
}

.clothes-pupa.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 7);
  height: calc(var(--pixel) * 8);
  border-radius: 14px 14px 16px 16px;
}

.clothes-pupa.clothes-suit .suit-collar {
  display: none;
}

/* 일개미 단계 정장 */
.clothes-worker.clothes-suit {
  top: 70%;
}

.clothes-worker.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 9);
  height: calc(var(--pixel) * 8);
}

/* 병정개미 단계 정장 */
.clothes-soldier.clothes-suit {
  top: 70%;
}

.clothes-soldier.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 9);
}

/* 여왕개미 단계 정장 */
.clothes-queen.clothes-suit {
  top: 75%;
}

.clothes-queen.clothes-suit .suit-jacket {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 11);
}

/* ===== 드레스 (Dress) ===== */
.dress-top {
  width: 40px;
  height: 25px;
  background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
  border-radius: 8px 8px 0 0;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.dress-skirt {
  position: absolute;
  width: 50px;
  height: 25px;
  background: linear-gradient(135deg, #FFB6D9 0%, #FF69B4 100%);
  top: 25px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 0 0 25px 25px;
  clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
}

.dress-ribbon {
  position: absolute;
  width: 15px;
  height: 8px;
  background: #FF1493;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}

.dress-ribbon::before,
.dress-ribbon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: #FF1493;
  border-radius: 50%;
  top: 0;
}

.dress-ribbon::before {
  left: -6px;
}

.dress-ribbon::after {
  right: -6px;
}

/* 알 단계 드레스 */
.clothes-egg.clothes-dress {
  top: 55%;
}

.clothes-egg.clothes-dress .dress-top {
  width: calc(var(--pixel) * 7);
  height: calc(var(--pixel) * 4);
}

.clothes-egg.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 8.5);
  height: calc(var(--pixel) * 3.5);
  top: calc(var(--pixel) * 4);
}

.clothes-egg.clothes-dress .dress-ribbon {
  width: calc(var(--pixel) * 2.5);
  height: calc(var(--pixel) * 1.5);
  top: calc(var(--pixel) * 3.5);
}

/* 애벌레 단계 드레스 */
.clothes-larva.clothes-dress {
  top: 60%;
}

.clothes-larva.clothes-dress .dress-top {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 4);
  border-radius: 10px 10px 0 0;
}

.clothes-larva.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 4);
  top: calc(var(--pixel) * 4);
  border-radius: 0 0 30px 30px;
}

/* 번데기 단계 드레스 */
.clothes-pupa.clothes-dress {
  top: 60%;
}

.clothes-pupa.clothes-dress .dress-top {
  width: calc(var(--pixel) * 7.5);
  height: calc(var(--pixel) * 6);
  border-radius: 15px 15px 0 0;
}

.clothes-pupa.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 9.5);
  height: calc(var(--pixel) * 5);
  top: calc(var(--pixel) * 6);
}

/* 일개미 단계 드레스 */
.clothes-worker.clothes-dress {
  top: 70%;
}

.clothes-worker.clothes-dress .dress-top {
  width: calc(var(--pixel) * 9);
  height: calc(var(--pixel) * 5);
}

.clothes-worker.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 11);
  height: calc(var(--pixel) * 6);
  top: calc(var(--pixel) * 5);
}

/* 병정개미 단계 드레스 */
.clothes-soldier.clothes-dress {
  top: 70%;
}

.clothes-soldier.clothes-dress .dress-top {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 6);
}

.clothes-soldier.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 7);
  top: calc(var(--pixel) * 6);
}

/* 여왕개미 단계 드레스 */
.clothes-queen.clothes-dress {
  top: 75%;
}

.clothes-queen.clothes-dress .dress-top {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 7);
}

.clothes-queen.clothes-dress .dress-skirt {
  width: calc(var(--pixel) * 14);
  height: calc(var(--pixel) * 8);
  top: calc(var(--pixel) * 7);
}

/* ===== 후드티 (Hoodie) ===== */
.hoodie-body {
  width: 45px;
  height: 38px;
  background: linear-gradient(135deg, #7B68EE 0%, #6A5ACD 100%);
  border-radius: 10px 10px 14px 14px;
  position: relative;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.hoodie-hood {
  position: absolute;
  width: 35px;
  height: 20px;
  background: linear-gradient(135deg, #9370DB 0%, #7B68EE 100%);
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50% 50% 0 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.hoodie-pocket {
  position: absolute;
  width: 25px;
  height: 15px;
  background: linear-gradient(135deg, #6A5ACD 0%, #5B4BBD 100%);
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.hoodie-string {
  position: absolute;
  width: 2px;
  height: 12px;
  background: #F0F0F0;
  top: -8px;
  border-radius: 1px;
}

.hoodie-string.left {
  left: 40%;
}

.hoodie-string.right {
  right: 40%;
}

/* 알 단계 후드티 */
.clothes-egg.clothes-hoodie {
  top: 55%;
}

.clothes-egg.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 8);
  height: calc(var(--pixel) * 6);
}

.clothes-egg.clothes-hoodie .hoodie-hood {
  width: calc(var(--pixel) * 6.5);
  height: calc(var(--pixel) * 3.5);
  top: calc(var(--pixel) * -2.5);
}

.clothes-egg.clothes-hoodie .hoodie-pocket {
  width: calc(var(--pixel) * 4.5);
  height: calc(var(--pixel) * 2.5);
}

/* 애벌레 단계 후드티 */
.clothes-larva.clothes-hoodie {
  top: 60%;
}

.clothes-larva.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 5);
  border-radius: 12px;
}

.clothes-larva.clothes-hoodie .hoodie-hood {
  width: calc(var(--pixel) * 8.5);
  height: calc(var(--pixel) * 3.5);
  top: calc(var(--pixel) * -3);
}

/* 번데기 단계 후드티 */
.clothes-pupa.clothes-hoodie {
  top: 60%;
}

.clothes-pupa.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 7);
  height: calc(var(--pixel) * 8);
  border-radius: 14px 14px 16px 16px;
}

.clothes-pupa.clothes-hoodie .hoodie-hood {
  width: calc(var(--pixel) * 6);
  height: calc(var(--pixel) * 3.5);
  top: calc(var(--pixel) * -2.5);
}

/* 일개미 단계 후드티 */
.clothes-worker.clothes-hoodie {
  top: 70%;
}

.clothes-worker.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 9);
  height: calc(var(--pixel) * 8);
}

/* 병정개미 단계 후드티 */
.clothes-soldier.clothes-hoodie {
  top: 70%;
}

.clothes-soldier.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 9);
}

/* 여왕개미 단계 후드티 */
.clothes-queen.clothes-hoodie {
  top: 75%;
}

.clothes-queen.clothes-hoodie .hoodie-body {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 11);
}

/* ===== 갑옷 (Armor) ===== */
.armor-chest {
  width: 45px;
  height: 40px;
  background: linear-gradient(135deg, #B8B8B8 0%, #707070 50%, #4A4A4A 100%);
  border-radius: 8px 8px 12px 12px;
  position: relative;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.armor-plate {
  position: absolute;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.4) 50%,
    rgba(255, 255, 255, 0.2) 100%
  );
  border-top: 1px solid rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(0, 0, 0, 0.3);
  left: 0;
}

.armor-plate:nth-child(2) {
  top: 25%;
}

.armor-plate:nth-child(3) {
  top: 50%;
}

.armor-plate:nth-child(4) {
  top: 75%;
}

.armor-shine {
  position: absolute;
  width: 15px;
  height: 25px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  top: 8px;
  left: 12px;
  border-radius: 50%;
  filter: blur(2px);
}

/* 알 단계 갑옷 */
.clothes-egg.clothes-armor {
  top: 55%;
}

.clothes-egg.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 8);
  height: calc(var(--pixel) * 6);
  border-radius: 4px 4px 6px 6px;
}

.clothes-egg.clothes-armor .armor-plate {
  height: calc(var(--pixel) * 1);
}

/* 애벌레 단계 갑옷 */
.clothes-larva.clothes-armor {
  top: 60%;
}

.clothes-larva.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 5);
  border-radius: 12px;
}

/* 번데기 단계 갑옷 */
.clothes-pupa.clothes-armor {
  top: 60%;
}

.clothes-pupa.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 7);
  height: calc(var(--pixel) * 8);
  border-radius: 14px 14px 16px 16px;
}

/* 일개미 단계 갑옷 */
.clothes-worker.clothes-armor {
  top: 70%;
}

.clothes-worker.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 9);
  height: calc(var(--pixel) * 8);
}

/* 병정개미 단계 갑옷 강화 */
.clothes-soldier.clothes-armor {
  top: 70%;
}

.clothes-soldier.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 10);
  height: calc(var(--pixel) * 9);
  background: linear-gradient(135deg, #C0C0C0 0%, #808080 50%, #505050 100%);
}

/* 여왕개미 단계 갑옷 강화 (황금) */
.clothes-queen.clothes-armor {
  top: 75%;
}

.clothes-queen.clothes-armor .armor-chest {
  width: calc(var(--pixel) * 12);
  height: calc(var(--pixel) * 11);
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
}

.clothes-queen.clothes-armor .armor-shine {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 215, 0, 0.3) 100%);
}

.ant-container {
  position: relative;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.3s ease;
  z-index: 10;
}

.ant-container:hover {
  transform: scale(1.05);
}

.ant-container:active {
  transform: scale(0.95);
}

.ant-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: antBreathe 3s ease-in-out infinite;
}

@keyframes antBreathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}


/* ===== 알 (Egg) - 토스 스타일 ===== */
.ant-egg {
  width: 80px;
  height: 100px;
}

.egg-shell {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  position: relative;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 -2px 8px rgba(0, 0, 0, 0.1),
    inset 0 2px 8px rgba(255, 255, 255, 0.4);
  animation: eggWobble 4s ease-in-out infinite;
}

@keyframes eggWobble {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

.egg-shine {
  position: absolute;
  top: 20%;
  left: 25%;
  width: 25px;
  height: 35px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(2px);
}

.egg-pattern {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 90%;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(255, 255, 255, 0.05) 8px,
    rgba(255, 255, 255, 0.05) 16px
  );
}

/* ===== 애벌레 (Larva) - 토스 스타일 ===== */
.ant-larva {
  width: 90px;
  height: 60px;
  flex-direction: column;
  gap: 8px;
}

.larva-body {
  width: 90px;
  height: 45px;
  border-radius: 50% 50% 40% 40% / 60% 60% 50% 50%;
  position: relative;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 -2px 6px rgba(0, 0, 0, 0.15),
    inset 0 2px 8px rgba(255, 255, 255, 0.3);
  animation: larvaWiggle 2s ease-in-out infinite;
}

@keyframes larvaWiggle {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.larva-segment {
  position: absolute;
  width: calc(100% - 8px);
  height: 6px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 50%;
  left: 4px;
}

.larva-segment:nth-child(1) { top: 15%; }
.larva-segment:nth-child(2) { top: 30%; }
.larva-segment:nth-child(3) { top: 45%; }
.larva-segment:nth-child(4) { top: 60%; }
.larva-segment:nth-child(5) { top: 75%; }

.larva-shine {
  position: absolute;
  top: 20%;
  left: 30%;
  width: 20px;
  height: 25px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(2px);
}

.larva-face {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
}

.larva-eyes {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.larva-eyes .eye {
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
}

.larva-eyes .pupil {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #333;
  border-radius: 50%;
}

.larva-mouth {
  width: 8px;
  height: 4px;
  background: rgba(255, 200, 200, 0.6);
  border-radius: 0 0 50% 50%;
  margin: 4px auto 0;
}

/* ===== 번데기 (Pupa) - 토스 스타일 ===== */
.ant-pupa {
  width: 70px;
  height: 95px;
}

.pupa-shell {
  width: 100%;
  height: 100%;
  border-radius: 50% 50% 45% 45% / 55% 55% 45% 45%;
  position: relative;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 -3px 10px rgba(0, 0, 0, 0.2),
    inset 0 3px 12px rgba(255, 255, 255, 0.3);
  animation: pupaGlow 3s ease-in-out infinite;
}

@keyframes pupaGlow {
  0%, 100% { box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 -3px 10px rgba(0, 0, 0, 0.2),
    inset 0 3px 12px rgba(255, 255, 255, 0.3);
  }
  50% { box-shadow:
    0 4px 20px rgba(255, 215, 0, 0.4),
    inset 0 -3px 10px rgba(0, 0, 0, 0.2),
    inset 0 3px 12px rgba(255, 255, 255, 0.4);
  }
}

.pupa-shine {
  position: absolute;
  top: 25%;
  left: 30%;
  width: 20px;
  height: 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(2px);
}

.pupa-lines {
  position: absolute;
  width: 90%;
  height: 2px;
  left: 5%;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 1px;
}

.pupa-lines:nth-child(2) { top: 20%; }
.pupa-lines:nth-child(3) { top: 35%; }
.pupa-lines:nth-child(4) { top: 50%; }
.pupa-lines:nth-child(5) { top: 65%; }
.pupa-lines:nth-child(6) { top: 80%; }

.pupa-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.1); }
}

/* ===== 일개미, 병정개미, 여왕개미 공통 스타일 ===== */
.ant-worker,
.ant-soldier,
.ant-queen {
  width: 120px;
  height: 120px;
}

.ant-head {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  position: relative;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.15),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1),
    inset 0 2px 6px rgba(255, 255, 255, 0.3);
  z-index: 2;
}

.antenna {
  position: absolute;
  width: 3px;
  height: 25px;
  background: linear-gradient(to top, rgba(139, 69, 19, 0.8), rgba(139, 69, 19, 1));
  border-radius: 3px;
  top: -8px;
}

.antenna::after {
  content: '';
  position: absolute;
  top: -6px;
  left: -2px;
  width: 7px;
  height: 7px;
  background: #A0522D;
  border-radius: 50%;
}

.antenna.left {
  left: 25%;
  transform: rotate(-30deg);
  transform-origin: bottom;
}

.antenna.right {
  right: 25%;
  transform: rotate(30deg);
  transform-origin: bottom;
}

.ant-eyes {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
}

.eye {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.pupil {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: #333;
  border-radius: 50%;
}

.sparkle {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
}

.ant-smile,
.ant-body {
  margin-top: -8px;
}

.ant-body {
  width: 70px;
  height: 80px;
  border-radius: 45% 45% 48% 48% / 50% 50% 50% 50%;
  position: relative;
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.15),
    inset 0 -3px 8px rgba(0, 0, 0, 0.1),
    inset 0 3px 10px rgba(255, 255, 255, 0.25);
  z-index: 1;
}

.ant-legs {
  display: none;
}

/* ===== 일개미 (Worker) 전용 스타일 ===== */
.ant-worker .ant-smile {
  width: 16px;
  height: 8px;
  border-radius: 0 0 50% 50%;
  background: rgba(255, 200, 200, 0.6);
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
}

.ant-worker .body-segment {
  position: absolute;
  width: 100%;
  height: 3px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 50%;
}

.ant-worker .thorax {
  top: 30%;
}

.ant-worker .abdomen {
  top: 60%;
}

.ant-worker .body-shine {
  position: absolute;
  top: 20%;
  left: 25%;
  width: 20px;
  height: 30px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(3px);
}

/* ===== 병정개미 (Soldier) 전용 스타일 ===== */
.ant-soldier {
  width: 130px;
  height: 130px;
}

.soldier-head {
  width: 48px !important;
  height: 48px !important;
}

.mandibles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
}

.mandible {
  position: absolute;
  width: 18px;
  height: 12px;
  background: linear-gradient(135deg, #654321 0%, #8B4513 100%);
  border-radius: 40% 60% 30% 70% / 50% 50% 50% 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  top: 60%;
}

.mandible.left {
  left: -12px;
  transform: rotate(-25deg);
}

.mandible.right {
  right: -12px;
  transform: rotate(25deg);
}

.soldier-expression {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 6px;
  border-top: 2px solid rgba(0, 0, 0, 0.2);
}

.soldier-body {
  width: 75px !important;
  height: 85px !important;
}

.armor-plates {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.armor-plates .armor-plate {
  position: absolute;
  width: 90%;
  left: 5%;
  height: 4px;
  background: linear-gradient(90deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0.1) 100%
  );
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
}

.armor-plates .armor-plate:nth-child(1) {
  top: 25%;
}

.armor-plates .armor-plate:nth-child(2) {
  top: 50%;
}

.armor-plates .armor-plate:nth-child(3) {
  top: 75%;
}

.soldier-body .body-shine {
  position: absolute;
  top: 20%;
  left: 25%;
  width: 22px;
  height: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(3px);
}

/* ===== 여왕개미 (Queen) 전용 스타일 ===== */
.ant-queen {
  width: 150px;
  height: 150px;
}

.queen-aura {
  position: absolute;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
  animation: queenAura 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes queenAura {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.queen-head {
  width: 50px !important;
  height: 50px !important;
}

.antenna.royal {
  width: 4px;
  height: 30px;
  background: linear-gradient(to top, #FFD700, #FFA500) !important;
}

.antenna.royal::after {
  width: 9px;
  height: 9px;
  background: #FFD700 !important;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}

.queen-smile {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 10px;
  border-radius: 0 0 50% 50%;
  background: rgba(255, 180, 180, 0.7);
}

.queen-body {
  width: 85px !important;
  height: 95px !important;
}

.wing {
  position: absolute;
  width: 45px;
  height: 60px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(200, 220, 255, 0.5) 100%);
  border-radius: 50% 50% 50% 20%;
  top: 10px;
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 1px 3px rgba(255, 255, 255, 0.8);
  animation: wingFlutter 2s ease-in-out infinite;
}

.wing.left {
  left: -35px;
  transform-origin: right center;
}

.wing.right {
  right: -35px;
  transform-origin: left center;
  transform: scaleX(-1);
}

@keyframes wingFlutter {
  0%, 100% { transform: rotateY(0deg); opacity: 0.7; }
  50% { transform: rotateY(15deg); opacity: 0.9; }
}

.wing-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 8px,
    rgba(255, 255, 255, 0.2) 8px,
    rgba(255, 255, 255, 0.2) 10px
  );
  border-radius: 50% 50% 50% 20%;
}

.royal-gems {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

.gem {
  position: absolute;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  border-radius: 50%;
  box-shadow:
    0 0 6px rgba(255, 215, 0, 0.8),
    inset 0 1px 2px rgba(255, 255, 255, 0.6);
  animation: gemSparkle 2s ease-in-out infinite;
}

.gem:nth-child(1) {
  top: 20%;
  left: 30%;
  animation-delay: 0s;
}

.gem:nth-child(2) {
  top: 40%;
  right: 25%;
  animation-delay: 0.7s;
}

.gem:nth-child(3) {
  bottom: 30%;
  left: 35%;
  animation-delay: 1.4s;
}

@keyframes gemSparkle {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.3); opacity: 1; }
}

.queen-body .body-shine.royal {
  position: absolute;
  top: 20%;
  left: 25%;
  width: 25px;
  height: 35px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 215, 0, 0.2) 50%, rgba(255, 255, 255, 0) 100%);
  border-radius: 50%;
  filter: blur(4px);
}

/* 행복도 표시 */
.happiness-indicator {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  animation: happinessFloat 1s ease-out;
  z-index: 100;
}

@keyframes happinessFloat {
  0% { transform: translateX(-50%) translateY(0); opacity: 1; }
  100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
}

.happiness-enter-active,
.happiness-leave-active {
  transition: opacity 0.3s;
}

.happiness-enter-from,
.happiness-leave-to {
  opacity: 0;
}

</style>
