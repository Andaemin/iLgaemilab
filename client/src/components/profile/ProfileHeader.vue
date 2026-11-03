<script setup>
import { computed, onMounted } from 'vue'
import { useAntStore } from '@/stores/useAntStore'
import CommonVCard from '@/components/common/CommonVCard.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  profileImageUrl: {
    type: String,
    default: ''
  }
})

const antStore = useAntStore()

const levelNames = {
  1: '초급',
  2: '중급',
  3: '고급'
}

onMounted(async () => {
  try {
    await antStore.fetchAntStatus()
  } catch (error) {
    console.error('개미 상태를 불러오지 못했습니다:', error)
  }
})
</script>

<template>
  <CommonVCard class="profile-header-card">
    <v-card-text class="pa-6">
      <div class="profile-layout">
        <!-- 프로필 이미지 섹션 -->
        <div class="profile-left">
          <div class="profile-avatar-container" :class="`border-${user.profileBorder || 'default'}`">
            <v-avatar size="80" class="profile-avatar">
              <!-- 업로드된 이미지나 URL 이미지인 경우 -->
              <v-img
                v-if="profileImageUrl && !profileImageUrl.startsWith('preset:')"
                :src="profileImageUrl"
                alt="프로필 이미지"
                cover
              />
              <!-- 프리셋 아바타인 경우 (preset:id:emoji 형식) -->
              <span
                v-else-if="profileImageUrl && profileImageUrl.startsWith('preset:')"
                class="avatar-emoji"
              >
                {{ profileImageUrl.split(':')[2] || '🥰' }}
              </span>
              <!-- 기본 이모지 -->
              <span v-else class="avatar-emoji">🥰</span>
            </v-avatar>
          </div>

          <h2 class="text-h5 font-weight-bold mt-4 mb-2">{{ user.name }}</h2>
          <p class="text-body-2 text-grey-600 mb-3">{{ user.email }}</p>

          <div class="profile-badges">
            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              Lv. {{ antStore.antLevel }} ({{ antStore.levelInfo.name }})
            </v-chip>
          </div>
        </div>

        <!-- 슬롯으로 추가 콘텐츠 허용 -->
        <slot />
      </div>
    </v-card-text>
  </CommonVCard>
</template>

<style scoped>
.profile-header-card {
  margin-bottom: 24px;
}

.profile-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.profile-left {
  flex: 0 0 auto;
  text-align: center;
  min-width: 200px;
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 16px;
}

.profile-avatar {
  background: rgb(var(--v-theme-grey-100));
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  position: relative;
  z-index: 2;
}

/* 프로필 테두리 스타일 */
.profile-avatar-container::before {
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

/* 기본 테두리 */
.profile-avatar-container.border-default::before {
  border: 2px solid #BDBDBD;
  box-shadow: 0 0 8px rgba(189, 189, 189, 0.3);
}

/* 브론즈 테두리 */
.profile-avatar-container.border-bronze::before {
  border: 3px solid #CD7F32;
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.6),
              inset 0 0 10px rgba(205, 127, 50, 0.3);
  background: radial-gradient(circle, transparent 60%, rgba(205, 127, 50, 0.1) 100%);
}

/* 실버 테두리 */
.profile-avatar-container.border-silver::before {
  border: 3px solid #C0C0C0;
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.8),
              inset 0 0 10px rgba(192, 192, 192, 0.4);
  background: radial-gradient(circle, transparent 60%, rgba(192, 192, 192, 0.1) 100%);
}

/* 골드 테두리 */
.profile-avatar-container.border-gold::before {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
              0 0 40px rgba(255, 215, 0, 0.4),
              inset 0 0 15px rgba(255, 215, 0, 0.3);
  background: radial-gradient(circle, transparent 60%, rgba(255, 215, 0, 0.15) 100%);
  animation: pulse-gold 2s ease-in-out infinite;
}

@keyframes pulse-gold {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
}

/* 다이아몬드 테두리 */
.profile-avatar-container.border-diamond::before {
  border: 3px solid #B9F2FF;
  box-shadow: 0 0 20px rgba(185, 242, 255, 1),
              0 0 40px rgba(185, 242, 255, 0.6),
              inset 0 0 15px rgba(185, 242, 255, 0.4);
  background: radial-gradient(circle, transparent 60%, rgba(185, 242, 255, 0.2) 100%);
  animation: shine-diamond 3s linear infinite;
}

@keyframes shine-diamond {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(30deg) brightness(1.2); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}

/* 플래티넘 테두리 */
.profile-avatar-container.border-platinum::before {
  border: 4px solid #E5E4E2;
  box-shadow: 0 0 25px rgba(229, 228, 226, 1),
              0 0 50px rgba(229, 228, 226, 0.6),
              inset 0 0 20px rgba(229, 228, 226, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(229, 228, 226, 0.2) 100%);
}

/* 마스터 테두리 */
.profile-avatar-container.border-master::before {
  border: 4px solid #9D4EDD;
  box-shadow: 0 0 30px rgba(157, 78, 221, 1),
              0 0 60px rgba(157, 78, 221, 0.6),
              inset 0 0 25px rgba(157, 78, 221, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(157, 78, 221, 0.25) 100%);
  animation: pulse-master 1.5s ease-in-out infinite;
}

@keyframes pulse-master {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(157, 78, 221, 1); }
  50% { transform: scale(1.03); box-shadow: 0 0 50px rgba(157, 78, 221, 1); }
}

/* 챌린저 테두리 */
.profile-avatar-container.border-challenger::before {
  border: 5px solid;
  border-image: linear-gradient(45deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD, #FF6B6B) 1;
  box-shadow: 0 0 40px rgba(255, 107, 107, 0.8),
              0 0 80px rgba(255, 107, 107, 0.4);
  animation: rotate-gradient 3s linear infinite;
}

@keyframes rotate-gradient {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* 무지개 테두리 */
.profile-avatar-container.border-rainbow::before {
  border: 4px solid;
  border-image: linear-gradient(90deg,
    #FF0000, #FF7F00, #FFFF00, #00FF00,
    #0000FF, #4B0082, #9400D3) 1;
  box-shadow: 0 0 35px rgba(255, 0, 255, 0.7);
  animation: rainbow-flow 3s linear infinite;
}

@keyframes rainbow-flow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* 불꽃 테두리 */
.profile-avatar-container.border-fire::before {
  border: 4px solid #FF4500;
  box-shadow: 0 0 30px rgba(255, 69, 0, 1),
              0 0 60px rgba(255, 140, 0, 0.7),
              inset 0 0 25px rgba(255, 69, 0, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(255, 69, 0, 0.3) 100%);
  animation: flicker-fire 0.3s ease-in-out infinite alternate;
}

@keyframes flicker-fire {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.02); }
}

/* 얼음 테두리 */
.profile-avatar-container.border-ice::before {
  border: 4px solid #00CED1;
  box-shadow: 0 0 30px rgba(0, 206, 209, 1),
              0 0 60px rgba(64, 224, 208, 0.7),
              inset 0 0 25px rgba(0, 206, 209, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(0, 206, 209, 0.25) 100%);
  animation: shimmer-ice 2s ease-in-out infinite;
}

@keyframes shimmer-ice {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

/* 자연 테두리 */
.profile-avatar-container.border-nature::before {
  border: 4px solid #2E7D32;
  box-shadow: 0 0 30px rgba(46, 125, 50, 1),
              0 0 60px rgba(102, 187, 106, 0.7),
              inset 0 0 25px rgba(46, 125, 50, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(46, 125, 50, 0.25) 100%);
  animation: grow-nature 3s ease-in-out infinite;
}

@keyframes grow-nature {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* === 롤 스타일 화려한 테두리 === */
.profile-avatar-container.border-ant-queen::before {border: 5px solid transparent;background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 20px rgba(255, 215, 0, 1), 0 0 40px rgba(255, 165, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.6), inset 0 0 30px rgba(255, 215, 0, 0.4), 0 4px 15px rgba(0, 0, 0, 0.3);animation: ant-queen-glow 2s ease-in-out infinite;}@keyframes ant-queen-glow {0%, 100% {filter: brightness(1) drop-shadow(0 0 10px #FFD700);transform: scale(1);}50% {filter: brightness(1.3) drop-shadow(0 0 20px #FFA500);transform: scale(1.02);}}
.profile-avatar-container.border-trophy::before {border: 5px solid;border-image: linear-gradient(135deg, #C9A961, #FFD700, #E6C56C, #FFD700, #C9A961) 1;box-shadow: 0 0 25px rgba(255, 215, 0, 1), 0 0 50px rgba(201, 169, 97, 0.8), 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 2px 10px rgba(255, 255, 255, 0.5), inset 0 -2px 10px rgba(0, 0, 0, 0.3);background: radial-gradient(circle, transparent 60%, rgba(255, 215, 0, 0.2) 100%);animation: trophy-shine 3s linear infinite;}@keyframes trophy-shine {0% { filter: brightness(1); }50% { filter: brightness(1.4); }100% { filter: brightness(1); }}
.profile-avatar-container.border-crown::before {border: 6px solid transparent;background: linear-gradient(60deg, #9D4EDD, #C77DFF, #E0AAFF, #C77DFF, #9D4EDD) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 30px rgba(157, 78, 221, 1), 0 0 60px rgba(199, 125, 255, 0.8), 0 0 90px rgba(224, 170, 255, 0.6), inset 0 0 20px rgba(199, 125, 255, 0.5), 0 5px 20px rgba(0, 0, 0, 0.4);animation: crown-royal 3s ease-in-out infinite;}@keyframes crown-royal {0%, 100% {transform: scale(1) rotate(0deg);filter: brightness(1);}50% {transform: scale(1.03) rotate(1deg);filter: brightness(1.3);}}
.profile-avatar-container.border-dragon::before {border: 5px solid;border-image: linear-gradient(90deg, #8B0000, #DC143C, #FF4500, #DC143C, #8B0000) 1;box-shadow: 0 0 35px rgba(220, 20, 60, 1), 0 0 70px rgba(255, 69, 0, 0.9), 0 0 105px rgba(139, 0, 0, 0.7), inset 0 0 30px rgba(255, 69, 0, 0.6), 0 6px 25px rgba(0, 0, 0, 0.5);background: radial-gradient(circle, transparent 55%, rgba(255, 69, 0, 0.3) 100%);animation: dragon-breath 1.5s ease-in-out infinite;}@keyframes dragon-breath {0%, 100% {filter: brightness(1) hue-rotate(0deg);transform: scale(1);}25% {filter: brightness(1.4) hue-rotate(5deg);transform: scale(1.02);}75% {filter: brightness(1.2) hue-rotate(-5deg);transform: scale(1.01);}}
.profile-avatar-container.border-crystal::before {border: 5px solid transparent;background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(185, 242, 255, 0.8) 25%, rgba(224, 170, 255, 0.8) 50%, rgba(255, 192, 203, 0.8) 75%, rgba(255, 255, 255, 0.9) 100%) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 30px rgba(185, 242, 255, 1), 0 0 60px rgba(224, 170, 255, 0.8), 0 0 90px rgba(255, 255, 255, 0.6), inset 0 0 25px rgba(255, 255, 255, 0.7);animation: crystal-prism 4s linear infinite;}@keyframes crystal-prism {0% { filter: hue-rotate(0deg) brightness(1.2); }100% { filter: hue-rotate(360deg) brightness(1.2); }}
.profile-avatar-container.border-neon::before {border: 4px solid;border-image: linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00, #00FF00, #00FFFF) 1;box-shadow: 0 0 15px rgba(0, 255, 255, 1), 0 0 30px rgba(255, 0, 255, 1), 0 0 45px rgba(255, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3);animation: neon-pulse 1s ease-in-out infinite;}@keyframes neon-pulse {0%, 100% {filter: brightness(1);opacity: 1;}50% {filter: brightness(1.5);opacity: 0.9;}}
.profile-avatar-container.border-cyber::before {border: 5px solid;border-image: linear-gradient(45deg, #00D9FF, #7C3AED, #FF006E, #7C3AED, #00D9FF) 1;box-shadow: 0 0 25px rgba(0, 217, 255, 1), 0 0 50px rgba(124, 58, 237, 0.8), 0 0 75px rgba(255, 0, 110, 0.6), inset 0 0 20px rgba(0, 217, 255, 0.5), 0 4px 20px rgba(0, 0, 0, 0.6);animation: cyber-scan 2s linear infinite;}@keyframes cyber-scan {0% { filter: hue-rotate(0deg) brightness(1); }100% { filter: hue-rotate(360deg) brightness(1); }}
.profile-avatar-container.border-phoenix::before {border: 6px solid transparent;background: linear-gradient(90deg, #FF4500 0%, #FFD700 25%, #FF69B4 50%, #FF8C00 75%, #FF4500 100%) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 40px rgba(255, 69, 0, 1), 0 0 80px rgba(255, 215, 0, 0.9), 0 0 120px rgba(255, 105, 180, 0.7), inset 0 0 35px rgba(255, 140, 0, 0.6), 0 8px 30px rgba(0, 0, 0, 0.5);animation: phoenix-rebirth 2.5s ease-in-out infinite;}@keyframes phoenix-rebirth {0%, 100% {transform: scale(1) rotate(0deg);filter: brightness(1);}25% {transform: scale(1.04) rotate(2deg);filter: brightness(1.5);}75% {transform: scale(1.02) rotate(-2deg);filter: brightness(1.3);}}
.profile-avatar-container.border-mythic::before {border: 7px solid transparent;background: conic-gradient(from 0deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3, #FF00FF, #FF0000) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 50px rgba(255, 255, 255, 1), 0 0 100px rgba(138, 43, 226, 0.9), 0 0 150px rgba(75, 0, 130, 0.7), inset 0 0 40px rgba(255, 255, 255, 0.7), 0 10px 40px rgba(0, 0, 0, 0.6);animation: mythic-cosmos 4s linear infinite;}@keyframes mythic-cosmos {0% {filter: hue-rotate(0deg) brightness(1.2);transform: rotate(0deg) scale(1);}100% {filter: hue-rotate(360deg) brightness(1.2);transform: rotate(360deg) scale(1);}}
.profile-avatar-container.border-legend::before {border: 8px solid transparent;background: conic-gradient(from 45deg, #FFD700, #FF69B4, #00FFFF, #FF00FF, #FFFF00, #00FF00, #FF4500, #9D4EDD, #FFD700) border-box;-webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);-webkit-mask-composite: xor;mask-composite: exclude;box-shadow: 0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 105, 180, 0.9), 0 0 180px rgba(157, 78, 221, 0.8), 0 0 240px rgba(0, 255, 255, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.8), 0 12px 50px rgba(0, 0, 0, 0.7);animation: legend-ultimate 3s ease-in-out infinite;}@keyframes legend-ultimate {0%, 100% {transform: rotate(0deg) scale(1);filter: brightness(1.3) hue-rotate(0deg) saturate(1.5);}33% {transform: rotate(120deg) scale(1.05);filter: brightness(1.6) hue-rotate(120deg) saturate(2);}66% {transform: rotate(240deg) scale(1.03);filter: brightness(1.5) hue-rotate(240deg) saturate(1.8);}}
.profile-avatar-container.border-galaxy::before {border: 6px solid transparent;background: radial-gradient(circle, #1a1a2e, #0f0f1e, #000) border-box;box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2);animation: twinkle-galaxy 3s ease-in-out infinite;}@keyframes twinkle-galaxy {0%, 100% {box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2);}50% {box-shadow: 0 0 60px rgba(138, 43, 226, 1), 0 0 120px rgba(75, 0, 130, 0.8), inset 0 0 50px rgba(255, 255, 255, 0.4);}}
.profile-avatar-container.border-thunder::before {border: 5px solid #FFFF00;box-shadow: 0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 215, 0, 0.8);animation: strike-thunder 0.5s ease-in-out infinite;}@keyframes strike-thunder {0%, 90%, 100% {opacity: 1;box-shadow: 0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 215, 0, 0.8);}45% {opacity: 0.6;box-shadow: 0 0 80px rgba(255, 255, 0, 1), 0 0 150px rgba(255, 215, 0, 1);}}
.profile-avatar-container.border-ocean::before {border: 5px solid transparent;background: linear-gradient(135deg, #006994, #0099CC, #00CED1) border-box;box-shadow: 0 0 40px rgba(0, 206, 209, 0.8);animation: wave-ocean 3s ease-in-out infinite;}@keyframes wave-ocean {0%, 100% {transform: translateY(0) scale(1);filter: brightness(1);}50% {transform: translateY(-3px) scale(1.02);filter: brightness(1.2);}}
.profile-avatar-container.border-aurora::before {border: 6px solid transparent;background: linear-gradient(45deg, #00FF87, #60EFFF, #FF00D4, #00FF87) border-box;box-shadow: 0 0 50px rgba(0, 255, 135, 0.8), 0 0 100px rgba(96, 239, 255, 0.6);animation: flow-aurora 4s linear infinite;}@keyframes flow-aurora {0% {filter: hue-rotate(0deg) brightness(1);}100% {filter: hue-rotate(360deg) brightness(1.2);}}
.profile-avatar-container.border-blood::before {border: 6px solid #8B0000;box-shadow: 0 0 40px rgba(139, 0, 0, 1), 0 0 80px rgba(220, 20, 60, 0.8), inset 0 0 30px rgba(139, 0, 0, 0.5);animation: pulse-blood 2s ease-in-out infinite;}@keyframes pulse-blood {0%, 100% {transform: scale(1);box-shadow: 0 0 40px rgba(139, 0, 0, 1), 0 0 80px rgba(220, 20, 60, 0.8);}50% {transform: scale(1.03);box-shadow: 0 0 60px rgba(139, 0, 0, 1), 0 0 120px rgba(220, 20, 60, 1);}}
.profile-avatar-container.border-holy::before {border: 6px solid #FFFACD;box-shadow: 0 0 50px rgba(255, 250, 205, 1), 0 0 100px rgba(255, 255, 255, 0.8);animation: radiance-holy 2s ease-in-out infinite;}@keyframes radiance-holy {0%, 100% {filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 250, 205, 0.8));}50% {filter: brightness(1.5) drop-shadow(0 0 40px rgba(255, 250, 205, 1));}}
.profile-avatar-container.border-toxic::before {border: 5px solid #00FF00;box-shadow: 0 0 50px rgba(0, 255, 0, 0.9), 0 0 100px rgba(50, 205, 50, 0.7);animation: corrode-toxic 2s ease-in-out infinite;}@keyframes corrode-toxic {0%, 100% {filter: hue-rotate(0deg) brightness(1);}50% {filter: hue-rotate(20deg) brightness(1.3);}}
.profile-avatar-container.border-void::before {border: 7px solid #1a001a;box-shadow: 0 0 60px rgba(75, 0, 130, 1), 0 0 120px rgba(138, 43, 226, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.9);animation: consume-void 3s ease-in-out infinite;}@keyframes consume-void {0%, 100% {transform: scale(1);box-shadow: 0 0 60px rgba(75, 0, 130, 1), 0 0 120px rgba(138, 43, 226, 0.8);}50% {transform: scale(0.98);box-shadow: 0 0 80px rgba(75, 0, 130, 1), 0 0 160px rgba(138, 43, 226, 1);}}
.profile-avatar-container.border-inferno::before {border: 7px solid transparent;background: linear-gradient(135deg, #FF0000, #FF4500, #FF6347, #FF0000) border-box;box-shadow: 0 0 60px rgba(255, 69, 0, 1), 0 0 120px rgba(255, 0, 0, 0.8);animation: blaze-inferno 1.5s ease-in-out infinite;}@keyframes blaze-inferno {0%, 100% {filter: brightness(1) saturate(1.5);transform: scale(1);}50% {filter: brightness(1.4) saturate(2);transform: scale(1.04);}}
.profile-avatar-container.border-frost::before {border: 6px solid #E0FFFF;box-shadow: 0 0 50px rgba(224, 255, 255, 1), 0 0 100px rgba(176, 224, 230, 0.8), inset 0 0 30px rgba(240, 248, 255, 0.5);animation: crystallize-frost 3s ease-in-out infinite;}@keyframes crystallize-frost {0%, 100% {filter: brightness(1);}50% {filter: brightness(1.3) drop-shadow(0 0 30px rgba(224, 255, 255, 1));}}
.profile-avatar-container.border-shadow::before {border: 7px solid #2F4F4F;box-shadow: 0 0 50px rgba(0, 0, 0, 1), 0 0 100px rgba(47, 79, 79, 0.9), inset 0 0 40px rgba(0, 0, 0, 0.8);animation: lurk-shadow 3s ease-in-out infinite;}@keyframes lurk-shadow {0%, 100% {opacity: 0.9;}50% {opacity: 0.7;}}
.profile-avatar-container.border-sakura::before {border: 5px solid #FFB7C5;box-shadow: 0 0 40px rgba(255, 183, 197, 1), 0 0 80px rgba(255, 192, 203, 0.8);animation: flutter-sakura 3s ease-in-out infinite;}@keyframes flutter-sakura {0%, 100% {transform: translateY(0) rotate(0deg);}50% {transform: translateY(-5px) rotate(5deg);}}
.profile-avatar-container.border-metal::before {border: 6px solid #C0C0C0;box-shadow: 0 0 30px rgba(192, 192, 192, 1), inset 0 0 20px rgba(169, 169, 169, 0.5);animation: shine-metal 2s linear infinite;}@keyframes shine-metal {0% {filter: brightness(1);}50% {filter: brightness(1.4);}100% {filter: brightness(1);}}
.profile-avatar-container.border-demon::before {border: 7px solid #8B0000;box-shadow: 0 0 60px rgba(139, 0, 0, 1), 0 0 120px rgba(255, 0, 0, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.8);animation: menace-demon 2s ease-in-out infinite;}@keyframes menace-demon {0%, 100% {filter: brightness(1) contrast(1.2);}50% {filter: brightness(1.3) contrast(1.5);}}
.profile-avatar-container.border-angel::before {border: 6px solid #F0F8FF;box-shadow: 0 0 50px rgba(240, 248, 255, 1), 0 0 100px rgba(255, 255, 255, 0.9);animation: glow-angel 2s ease-in-out infinite;}@keyframes glow-angel {0%, 100% {filter: brightness(1.3);box-shadow: 0 0 50px rgba(240, 248, 255, 1), 0 0 100px rgba(255, 255, 255, 0.9);}50% {filter: brightness(1.6);box-shadow: 0 0 70px rgba(240, 248, 255, 1), 0 0 140px rgba(255, 255, 255, 1);}}
.profile-avatar-container.border-storm::before {border: 6px solid #4B0082;box-shadow: 0 0 50px rgba(75, 0, 130, 1), 0 0 100px rgba(138, 43, 226, 0.8);animation: rage-storm 1s ease-in-out infinite;}@keyframes rage-storm {0%, 100% {transform: translateX(0);}25% {transform: translateX(-2px);}75% {transform: translateX(2px);}}
.profile-avatar-container.border-lava::before {border: 7px solid transparent;background: linear-gradient(135deg, #FF4500, #FF6347, #FF8C00, #FF4500) border-box;box-shadow: 0 0 60px rgba(255, 69, 0, 1), 0 0 120px rgba(255, 140, 0, 0.8);animation: flow-lava 3s ease-in-out infinite;}@keyframes flow-lava {0%, 100% {filter: brightness(1.2);}50% {filter: brightness(1.5) saturate(1.5);}}
.profile-avatar-container.border-lunar::before {border: 5px solid #E6E6FA;box-shadow: 0 0 40px rgba(230, 230, 250, 1), 0 0 80px rgba(216, 191, 216, 0.8);animation: phases-lunar 4s ease-in-out infinite;}@keyframes phases-lunar {0%, 100% {opacity: 0.9;filter: brightness(1);}50% {opacity: 1;filter: brightness(1.3);}}
.profile-avatar-container.border-solar::before {border: 7px solid #FFD700;box-shadow: 0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 165, 0, 0.9), 0 0 180px rgba(255, 140, 0, 0.7);animation: radiate-solar 2s ease-in-out infinite;}@keyframes radiate-solar {0%, 100% {transform: scale(1);filter: brightness(1.3);}50% {transform: scale(1.05);filter: brightness(1.6);}}
.profile-avatar-container.border-cosmic::before {border: 8px solid transparent;background: conic-gradient(from 90deg, #4B0082, #8A2BE2, #9370DB, #BA55D3, #4B0082) border-box;box-shadow: 0 0 70px rgba(138, 43, 226, 1), 0 0 140px rgba(147, 112, 219, 0.8);animation: nebula-cosmic 5s linear infinite;}@keyframes nebula-cosmic {0% {transform: rotate(0deg);filter: hue-rotate(0deg);}100% {transform: rotate(360deg);filter: hue-rotate(360deg);}}

.avatar-emoji {
  font-size: 40px;
  font-family: 'TossFaceFont', system-ui;
}

.profile-badges {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .profile-layout {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-left {
    min-width: auto;
    width: 100%;
  }
}
</style>