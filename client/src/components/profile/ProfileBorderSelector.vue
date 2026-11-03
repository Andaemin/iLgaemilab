<template>
  <CommonVCard>
    <v-card-text class="pa-6">
      <div class="d-flex align-center mb-4">
        <v-icon color="primary" size="28" class="mr-2">mdi-border-color</v-icon>
        <h3 class="text-h6 font-weight-bold">프로필 테두리 선택</h3>
      </div>

      <p class="text-body-2 text-grey-600 mb-6">
        프로필 사진을 돋보이게 할 멋진 테두리를 선택하세요
      </p>

      <v-row>
        <v-col
          v-for="border in borders"
          :key="border.value"
          cols="6"
          sm="4"
          md="3"
        >
          <div
            class="border-option"
            :class="{ 'selected': selectedBorder === border.value }"
            @click="selectBorder(border.value)"
          >
            <div class="border-preview-container" :class="`border-${border.value}`">
              <v-avatar size="60" class="border-preview-avatar">
                <span class="preview-emoji">😀</span>
              </v-avatar>
            </div>
            <div class="border-info mt-3">
              <div class="border-name">{{ border.name }}</div>
              <div class="border-description">{{ border.description }}</div>
            </div>
            <v-icon
              v-if="selectedBorder === border.value"
              color="primary"
              class="selected-icon"
            >
              mdi-check-circle
            </v-icon>
          </div>
        </v-col>
      </v-row>

      <div class="d-flex justify-end mt-6">
        <CommonVButton
          common-variant="secondary"
          @click="$emit('close')"
          class="mr-3"
        >
          취소
        </CommonVButton>
        <CommonVButton
          common-variant="primary"
          @click="saveBorder"
          :disabled="saving"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </CommonVButton>
      </div>
    </v-card-text>
  </CommonVCard>
</template>

<script setup>
import { ref } from 'vue';
import CommonVCard from '@/components/common/CommonVCard.vue';
import CommonVButton from '@/components/common/CommonVButton.vue';
import axios from 'axios';

const props = defineProps({
  currentBorder: {
    type: String,
    default: 'default'
  }
});

const emit = defineEmits(['close', 'saved']);

const selectedBorder = ref(props.currentBorder || 'default');
const saving = ref(false);

const borders = [
  { value: 'default', name: '기본', description: '심플한 기본 테두리' },
  { value: 'bronze', name: '브론즈', description: '따뜻한 구리빛 테두리' },
  { value: 'silver', name: '실버', description: '차가운 은빛 테두리' },
  { value: 'gold', name: '골드', description: '화려한 황금 테두리' },
  { value: 'diamond', name: '다이아몬드', description: '영롱한 다이아 테두리' },
  { value: 'platinum', name: '플래티넘', description: '고급스러운 백금 테두리' },
  { value: 'master', name: '마스터', description: '강렬한 보라색 테두리' },
  { value: 'challenger', name: '챌린저', description: '화려한 무지개 테두리' },
  { value: 'rainbow', name: '레인보우', description: '알록달록 무지개 테두리' },
  { value: 'fire', name: '불꽃', description: '타오르는 불꽃 테두리' },
  { value: 'ice', name: '얼음', description: '차가운 얼음 테두리' },
  { value: 'nature', name: '자연', description: '생명력 넘치는 자연 테두리' },
  { value: 'ant-queen', name: '개미 여왕', description: '황금 빛나는 여왕 테두리' },
  { value: 'trophy', name: '트로피', description: '우승 트로피 테두리' },
  { value: 'crown', name: '왕관', description: '왕실의 왕관 테두리' },
  { value: 'dragon', name: '드래곤', description: '불을 뿜는 드래곤 테두리' },
  { value: 'crystal', name: '크리스탈', description: '영롱한 크리스탈 테두리' },
  { value: 'neon', name: '네온', description: '화려한 네온 테두리' },
  { value: 'cyber', name: '사이버', description: '사이버펑크 테두리' },
  { value: 'phoenix', name: '불사조', description: '불타는 불사조 테두리' },
  { value: 'mythic', name: '미식', description: '신화급 우주 테두리' },
  { value: 'legend', name: '레전드', description: '최상급 전설 테두리' },
  { value: 'galaxy', name: '은하수', description: '별이 빛나는 은하 테두리' },
  { value: 'thunder', name: '번개', description: '전기 번개 테두리' },
  { value: 'ocean', name: '바다', description: '파도치는 바다 테두리' },
  { value: 'aurora', name: '오로라', description: '북극광 오로라 테두리' },
  { value: 'blood', name: '블러드', description: '피빛 뱀파이어 테두리' },
  { value: 'holy', name: '신성', description: '성스러운 빛 테두리' },
  { value: 'toxic', name: '독성', description: '독 구름 테두리' },
  { value: 'void', name: '공허', description: '어둠의 공허 테두리' },
  { value: 'inferno', name: '지옥불', description: '지옥의 화염 테두리' },
  { value: 'frost', name: '서리', description: '얼음 결정 테두리' },
  { value: 'shadow', name: '그림자', description: '어둠의 그림자 테두리' },
  { value: 'sakura', name: '벚꽃', description: '흩날리는 벚꽃 테두리' },
  { value: 'metal', name: '금속', description: '금속 반사 테두리' },
  { value: 'demon', name: '악마', description: '악마의 뿔 테두리' },
  { value: 'angel', name: '천사', description: '천사의 날개 테두리' },
  { value: 'storm', name: '폭풍', description: '폭풍우 테두리' },
  { value: 'lava', name: '용암', description: '용암 흐르는 테두리' },
  { value: 'lunar', name: '달빛', description: '달빛 은은한 테두리' },
  { value: 'solar', name: '태양', description: '태양 광선 테두리' },
  { value: 'cosmic', name: '우주', description: '우주 성운 테두리' }
];

function selectBorder(borderValue) {
  selectedBorder.value = borderValue;
}

async function saveBorder() {
  saving.value = true;
  try {
    const response = await axios.put(
      '/api/profile/border',
      { borderStyle: selectedBorder.value },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    if (response.data.success) {
      emit('saved', selectedBorder.value);
      emit('close');
    }
  } catch (error) {
    console.error('테두리 저장 실패:', error);
    alert('테두리 변경에 실패했습니다.');
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.border-option {
  padding: 16px;
  border-radius: 12px;
  border: 2px solid rgb(var(--v-theme-grey-300));
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  position: relative;
}

.border-option:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.border-option.selected {
  border-color: rgb(var(--v-theme-primary));
  border-width: 3px;
  background: rgb(var(--v-theme-primary-lighten-5));
}

.border-preview-container {
  position: relative;
  display: inline-block;
  margin-bottom: 8px;
}

.border-preview-container::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

.border-preview-avatar {
  background: rgb(var(--v-theme-grey-100));
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.preview-emoji {
  font-size: 30px;
}

.border-name {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-grey-900));
  margin-bottom: 4px;
}

.border-description {
  font-size: 11px;
  color: rgb(var(--v-theme-grey-600));
  line-height: 1.3;
}

.selected-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  background: white;
  border-radius: 50%;
}

/* 테두리 스타일 복제 (ProfileMainSection과 동일) */
.border-preview-container.border-default::before {
  border: 2px solid #BDBDBD;
  box-shadow: 0 0 8px rgba(189, 189, 189, 0.3);
}

.border-preview-container.border-bronze::before {
  border: 2px solid #CD7F32;
  box-shadow: 0 0 10px rgba(205, 127, 50, 0.6);
}

.border-preview-container.border-silver::before {
  border: 2px solid #C0C0C0;
  box-shadow: 0 0 10px rgba(192, 192, 192, 0.8);
}

.border-preview-container.border-gold::before {
  border: 2px solid #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
  animation: pulse-gold 2s ease-in-out infinite;
}

@keyframes pulse-gold {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
}

.border-preview-container.border-diamond::before {
  border: 2px solid #B9F2FF;
  box-shadow: 0 0 15px rgba(185, 242, 255, 1);
  animation: shine-diamond 3s linear infinite;
}

@keyframes shine-diamond {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(30deg) brightness(1.2); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}

.border-preview-container.border-platinum::before {
  border: 3px solid #E5E4E2;
  box-shadow: 0 0 20px rgba(229, 228, 226, 1);
}

.border-preview-container.border-master::before {
  border: 3px solid #9D4EDD;
  box-shadow: 0 0 20px rgba(157, 78, 221, 1);
  animation: pulse-master 1.5s ease-in-out infinite;
}

@keyframes pulse-master {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

.border-preview-container.border-challenger::before {
  border: 3px solid;
  border-image: linear-gradient(45deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD) 1;
  box-shadow: 0 0 25px rgba(255, 107, 107, 0.8);
  animation: rotate-gradient 3s linear infinite;
}

@keyframes rotate-gradient {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.border-preview-container.border-rainbow::before {
  border: 3px solid;
  border-image: linear-gradient(90deg,
    #FF0000, #FF7F00, #FFFF00, #00FF00,
    #0000FF, #4B0082, #9400D3) 1;
  animation: rainbow-flow 3s linear infinite;
}

@keyframes rainbow-flow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

.border-preview-container.border-fire::before {
  border: 3px solid #FF4500;
  box-shadow: 0 0 20px rgba(255, 69, 0, 1);
  animation: flicker-fire 0.3s ease-in-out infinite alternate;
}

@keyframes flicker-fire {
  0% { opacity: 0.9; }
  100% { opacity: 1; }
}

.border-preview-container.border-ice::before {
  border: 3px solid #00CED1;
  box-shadow: 0 0 20px rgba(0, 206, 209, 1);
  animation: shimmer-ice 2s ease-in-out infinite;
}

@keyframes shimmer-ice {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

.border-preview-container.border-nature::before {
  border: 3px solid #2E7D32;
  box-shadow: 0 0 20px rgba(46, 125, 50, 1);
  animation: grow-nature 3s ease-in-out infinite;
}

@keyframes grow-nature {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* 🆕 새로운 화려한 테두리 스타일 */
.border-preview-container.border-ant-queen::before {
  border: 4px solid transparent;
  background: linear-gradient(135deg, #FFD700, #FFA500, #FFD700) border-box;
  box-shadow: 0 0 30px rgba(255, 215, 0, 1);
  filter: drop-shadow(0 0 15px rgba(255, 165, 0, 0.8));
  animation: glow-queen 2s ease-in-out infinite;
}

@keyframes glow-queen {
  0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) brightness(1); }
  50% { filter: drop-shadow(0 0 25px rgba(255, 215, 0, 1)) brightness(1.2); }
}

.border-preview-container.border-trophy::before {
  border: 5px solid #FFD700;
  box-shadow:
    inset 0 0 20px rgba(255, 215, 0, 0.5),
    0 0 30px rgba(255, 215, 0, 0.8),
    0 0 60px rgba(255, 215, 0, 0.6);
  animation: shine-trophy 3s linear infinite;
}

@keyframes shine-trophy {
  0% { filter: brightness(1) saturate(1); }
  50% { filter: brightness(1.3) saturate(1.5); }
  100% { filter: brightness(1) saturate(1); }
}

.border-preview-container.border-crown::before {
  border: 5px solid #9D4EDD;
  box-shadow: 0 0 40px rgba(157, 78, 221, 1);
  animation: rotate-crown 4s linear infinite;
}

@keyframes rotate-crown {
  0% { transform: rotate(0deg); filter: brightness(1); }
  50% { filter: brightness(1.3); }
  100% { transform: rotate(360deg); filter: brightness(1); }
}

.border-preview-container.border-dragon::before {
  border: 5px solid #FF4500;
  box-shadow: 0 0 50px rgba(255, 69, 0, 1);
  animation: breathe-dragon 2s ease-in-out infinite;
}

@keyframes breathe-dragon {
  0%, 100% { transform: scale(1); filter: hue-rotate(0deg); }
  50% { transform: scale(1.05); filter: hue-rotate(30deg); }
}

.border-preview-container.border-crystal::before {
  border: 5px solid #B9F2FF;
  box-shadow: 0 0 40px rgba(185, 242, 255, 1);
  animation: prismatic-crystal 4s linear infinite;
}

@keyframes prismatic-crystal {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(360deg) brightness(1.2); }
}

.border-preview-container.border-neon::before {
  border: 5px solid;
  border-image: linear-gradient(90deg, #FF00FF, #00FFFF, #FF00FF) 1;
  box-shadow: 0 0 50px rgba(255, 0, 255, 0.8);
  animation: pulse-neon 1.5s ease-in-out infinite;
}

@keyframes pulse-neon {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.border-preview-container.border-cyber::before {
  border: 5px solid #00FFFF;
  box-shadow: 0 0 40px rgba(0, 255, 255, 1);
  animation: scan-cyber 3s linear infinite;
}

@keyframes scan-cyber {
  0% { box-shadow: 0 0 40px rgba(0, 255, 255, 1); }
  50% { box-shadow: 0 0 80px rgba(0, 255, 255, 1), inset 0 0 20px rgba(0, 255, 255, 0.5); }
  100% { box-shadow: 0 0 40px rgba(0, 255, 255, 1); }
}

.border-preview-container.border-phoenix::before {
  border: 6px solid transparent;
  background: linear-gradient(45deg, #FF4500, #FFD700, #FF4500) border-box;
  box-shadow: 0 0 60px rgba(255, 69, 0, 1);
  animation: rebirth-phoenix 3s ease-in-out infinite;
}

@keyframes rebirth-phoenix {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.05) rotate(180deg); }
}

.border-preview-container.border-mythic::before {
  border: 6px solid transparent;
  background: conic-gradient(from 0deg, #FF00FF, #00FFFF, #FFD700, #FF00FF) border-box;
  box-shadow: 0 0 70px rgba(255, 0, 255, 0.8);
  animation: cosmic-mythic 4s linear infinite;
}

@keyframes cosmic-mythic {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.border-preview-container.border-legend::before {
  border: 8px solid transparent;
  background: conic-gradient(from 45deg, #FFD700, #FF69B4, #00FFFF, #FF00FF, #FFFF00, #00FF00, #FF4500, #9D4EDD, #FFD700) border-box;
  box-shadow:
    0 0 60px rgba(255, 215, 0, 1),
    0 0 120px rgba(255, 105, 180, 0.9),
    0 0 180px rgba(157, 78, 221, 0.8);
  animation: legend-ultimate 3s ease-in-out infinite;
}

@keyframes legend-ultimate {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1) saturate(1);
  }
  50% {
    transform: scale(1.05) rotate(180deg);
    filter: brightness(1.3) saturate(1.5);
  }
}

/* 🌌 은하수 Galaxy */
.border-preview-container.border-galaxy::before {
  border: 6px solid transparent;
  background: radial-gradient(circle, #1a1a2e, #0f0f1e, #000) border-box;
  box-shadow:
    0 0 40px rgba(138, 43, 226, 0.8),
    0 0 80px rgba(75, 0, 130, 0.6),
    inset 0 0 30px rgba(255, 255, 255, 0.2);
  animation: twinkle-galaxy 3s ease-in-out infinite;
}

@keyframes twinkle-galaxy {
  0%, 100% {
    box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2);
  }
  50% {
    box-shadow: 0 0 60px rgba(138, 43, 226, 1), 0 0 120px rgba(75, 0, 130, 0.8), inset 0 0 50px rgba(255, 255, 255, 0.4);
  }
}

/* ⚡ 번개 Thunder */
.border-preview-container.border-thunder::before {
  border: 5px solid #FFFF00;
  box-shadow:
    0 0 50px rgba(255, 255, 0, 1),
    0 0 100px rgba(255, 215, 0, 0.8);
  animation: strike-thunder 0.5s ease-in-out infinite;
}

@keyframes strike-thunder {
  0%, 90%, 100% {
    opacity: 1;
    box-shadow: 0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 215, 0, 0.8);
  }
  45% {
    opacity: 0.6;
    box-shadow: 0 0 80px rgba(255, 255, 0, 1), 0 0 150px rgba(255, 215, 0, 1);
  }
}

/* 🌊 바다 Ocean */
.border-preview-container.border-ocean::before {
  border: 5px solid transparent;
  background: linear-gradient(135deg, #006994, #0099CC, #00CED1) border-box;
  box-shadow: 0 0 40px rgba(0, 206, 209, 0.8);
  animation: wave-ocean 3s ease-in-out infinite;
}

@keyframes wave-ocean {
  0%, 100% {
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
  50% {
    transform: translateY(-3px) scale(1.02);
    filter: brightness(1.2);
  }
}

/* 🌈 오로라 Aurora */
.border-preview-container.border-aurora::before {
  border: 6px solid transparent;
  background: linear-gradient(45deg, #00FF87, #60EFFF, #FF00D4, #00FF87) border-box;
  box-shadow:
    0 0 50px rgba(0, 255, 135, 0.8),
    0 0 100px rgba(96, 239, 255, 0.6);
  animation: flow-aurora 4s linear infinite;
}

@keyframes flow-aurora {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(360deg) brightness(1.2); }
}

/* 🩸 블러드 Blood */
.border-preview-container.border-blood::before {
  border: 6px solid #8B0000;
  box-shadow:
    0 0 40px rgba(139, 0, 0, 1),
    0 0 80px rgba(220, 20, 60, 0.8),
    inset 0 0 30px rgba(139, 0, 0, 0.5);
  animation: pulse-blood 2s ease-in-out infinite;
}

@keyframes pulse-blood {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 40px rgba(139, 0, 0, 1), 0 0 80px rgba(220, 20, 60, 0.8);
  }
  50% {
    transform: scale(1.03);
    box-shadow: 0 0 60px rgba(139, 0, 0, 1), 0 0 120px rgba(220, 20, 60, 1);
  }
}

/* ✨ 신성 Holy */
.border-preview-container.border-holy::before {
  border: 6px solid #FFFACD;
  box-shadow:
    0 0 50px rgba(255, 250, 205, 1),
    0 0 100px rgba(255, 255, 255, 0.8);
  animation: radiance-holy 2s ease-in-out infinite;
}

@keyframes radiance-holy {
  0%, 100% {
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 250, 205, 0.8));
  }
  50% {
    filter: brightness(1.5) drop-shadow(0 0 40px rgba(255, 250, 205, 1));
  }
}

/* ☠️ 독성 Toxic */
.border-preview-container.border-toxic::before {
  border: 5px solid #00FF00;
  box-shadow:
    0 0 50px rgba(0, 255, 0, 0.9),
    0 0 100px rgba(50, 205, 50, 0.7);
  animation: corrode-toxic 2s ease-in-out infinite;
}

@keyframes corrode-toxic {
  0%, 100% {
    filter: hue-rotate(0deg) brightness(1);
  }
  50% {
    filter: hue-rotate(20deg) brightness(1.3);
  }
}

/* 🕳️ 공허 Void */
.border-preview-container.border-void::before {
  border: 7px solid #1a001a;
  box-shadow:
    0 0 60px rgba(75, 0, 130, 1),
    0 0 120px rgba(138, 43, 226, 0.8),
    inset 0 0 40px rgba(0, 0, 0, 0.9);
  animation: consume-void 3s ease-in-out infinite;
}

@keyframes consume-void {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 60px rgba(75, 0, 130, 1), 0 0 120px rgba(138, 43, 226, 0.8);
  }
  50% {
    transform: scale(0.98);
    box-shadow: 0 0 80px rgba(75, 0, 130, 1), 0 0 160px rgba(138, 43, 226, 1);
  }
}

/* 🔥 지옥불 Inferno */
.border-preview-container.border-inferno::before {
  border: 7px solid transparent;
  background: linear-gradient(135deg, #FF0000, #FF4500, #FF6347, #FF0000) border-box;
  box-shadow:
    0 0 60px rgba(255, 69, 0, 1),
    0 0 120px rgba(255, 0, 0, 0.8);
  animation: blaze-inferno 1.5s ease-in-out infinite;
}

@keyframes blaze-inferno {
  0%, 100% {
    filter: brightness(1) saturate(1.5);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.4) saturate(2);
    transform: scale(1.04);
  }
}

/* ❄️ 서리 Frost */
.border-preview-container.border-frost::before {
  border: 6px solid #E0FFFF;
  box-shadow:
    0 0 50px rgba(224, 255, 255, 1),
    0 0 100px rgba(176, 224, 230, 0.8),
    inset 0 0 30px rgba(240, 248, 255, 0.5);
  animation: crystallize-frost 3s ease-in-out infinite;
}

@keyframes crystallize-frost {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 30px rgba(224, 255, 255, 1));
  }
}

/* 🌑 그림자 Shadow */
.border-preview-container.border-shadow::before {
  border: 7px solid #2F4F4F;
  box-shadow:
    0 0 50px rgba(0, 0, 0, 1),
    0 0 100px rgba(47, 79, 79, 0.9),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
  animation: lurk-shadow 3s ease-in-out infinite;
}

@keyframes lurk-shadow {
  0%, 100% {
    opacity: 0.9;
  }
  50% {
    opacity: 0.7;
  }
}

/* 🌸 벚꽃 Sakura */
.border-preview-container.border-sakura::before {
  border: 5px solid #FFB7C5;
  box-shadow:
    0 0 40px rgba(255, 183, 197, 1),
    0 0 80px rgba(255, 192, 203, 0.8);
  animation: flutter-sakura 3s ease-in-out infinite;
}

@keyframes flutter-sakura {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

/* 🔩 금속 Metal */
.border-preview-container.border-metal::before {
  border: 6px solid #C0C0C0;
  box-shadow:
    0 0 30px rgba(192, 192, 192, 1),
    inset 0 0 20px rgba(169, 169, 169, 0.5);
  animation: shine-metal 2s linear infinite;
}

@keyframes shine-metal {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.4);
  }
  100% {
    filter: brightness(1);
  }
}

/* 😈 악마 Demon */
.border-preview-container.border-demon::before {
  border: 7px solid #8B0000;
  box-shadow:
    0 0 60px rgba(139, 0, 0, 1),
    0 0 120px rgba(255, 0, 0, 0.8),
    inset 0 0 40px rgba(0, 0, 0, 0.8);
  animation: menace-demon 2s ease-in-out infinite;
}

@keyframes menace-demon {
  0%, 100% {
    filter: brightness(1) contrast(1.2);
  }
  50% {
    filter: brightness(1.3) contrast(1.5);
  }
}

/* 👼 천사 Angel */
.border-preview-container.border-angel::before {
  border: 6px solid #F0F8FF;
  box-shadow:
    0 0 50px rgba(240, 248, 255, 1),
    0 0 100px rgba(255, 255, 255, 0.9);
  animation: glow-angel 2s ease-in-out infinite;
}

@keyframes glow-angel {
  0%, 100% {
    filter: brightness(1.3);
    box-shadow: 0 0 50px rgba(240, 248, 255, 1), 0 0 100px rgba(255, 255, 255, 0.9);
  }
  50% {
    filter: brightness(1.6);
    box-shadow: 0 0 70px rgba(240, 248, 255, 1), 0 0 140px rgba(255, 255, 255, 1);
  }
}

/* 🌪️ 폭풍 Storm */
.border-preview-container.border-storm::before {
  border: 6px solid #4B0082;
  box-shadow:
    0 0 50px rgba(75, 0, 130, 1),
    0 0 100px rgba(138, 43, 226, 0.8);
  animation: rage-storm 1s ease-in-out infinite;
}

@keyframes rage-storm {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* 🌋 용암 Lava */
.border-preview-container.border-lava::before {
  border: 7px solid transparent;
  background: linear-gradient(135deg, #FF4500, #FF6347, #FF8C00, #FF4500) border-box;
  box-shadow:
    0 0 60px rgba(255, 69, 0, 1),
    0 0 120px rgba(255, 140, 0, 0.8);
  animation: flow-lava 3s ease-in-out infinite;
}

@keyframes flow-lava {
  0%, 100% {
    filter: brightness(1.2);
  }
  50% {
    filter: brightness(1.5) saturate(1.5);
  }
}

/* 🌙 달빛 Lunar */
.border-preview-container.border-lunar::before {
  border: 5px solid #E6E6FA;
  box-shadow:
    0 0 40px rgba(230, 230, 250, 1),
    0 0 80px rgba(216, 191, 216, 0.8);
  animation: phases-lunar 4s ease-in-out infinite;
}

@keyframes phases-lunar {
  0%, 100% {
    opacity: 0.9;
    filter: brightness(1);
  }
  50% {
    opacity: 1;
    filter: brightness(1.3);
  }
}

/* ☀️ 태양 Solar */
.border-preview-container.border-solar::before {
  border: 7px solid #FFD700;
  box-shadow:
    0 0 60px rgba(255, 215, 0, 1),
    0 0 120px rgba(255, 165, 0, 0.9),
    0 0 180px rgba(255, 140, 0, 0.7);
  animation: radiate-solar 2s ease-in-out infinite;
}

@keyframes radiate-solar {
  0%, 100% {
    transform: scale(1);
    filter: brightness(1.3);
  }
  50% {
    transform: scale(1.05);
    filter: brightness(1.6);
  }
}

/* 🪐 우주 Cosmic */
.border-preview-container.border-cosmic::before {
  border: 8px solid transparent;
  background: conic-gradient(from 90deg, #4B0082, #8A2BE2, #9370DB, #BA55D3, #4B0082) border-box;
  box-shadow:
    0 0 70px rgba(138, 43, 226, 1),
    0 0 140px rgba(147, 112, 219, 0.8);
  animation: nebula-cosmic 5s linear infinite;
}

@keyframes nebula-cosmic {
  0% {
    transform: rotate(0deg);
    filter: hue-rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
    filter: hue-rotate(360deg);
  }
}
</style>
