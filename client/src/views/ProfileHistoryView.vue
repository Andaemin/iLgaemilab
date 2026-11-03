<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileChangeHistory from '@/components/profile/ProfileChangeHistory.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const router = useRouter()

const showHelp = ref(false)

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="profile-history-page">
    <AppHeader>
      <template #title>
        <div class="header-title">
          <span class="common-icon mr-2">📝</span>
          <span>변경 이력</span>
        </div>
      </template>
      <template #left>
        <!-- 🎯 피츠의 법칙: 뒤로가기 버튼 크게 터치 영역 확보 -->
        <CommonVButton
          common-variant="ghost"
          icon="mdi-arrow-left"
          @click="goBack"
          size="large"
          class="back-button-enhanced"
        />
      </template>
    </AppHeader>

    <!-- 🚀 도허티 임계: 빠른 로딩을 위한 스켈레톤 감싸기 -->
    <v-container class="pa-6">
      <!-- 🏆 피크엔드 법칙: 상단에 성취감 주는 웰컴 섹션 -->
      <div class="welcome-section mb-6">
        <v-card 
          class="welcome-card gradient-border"
          elevation="0"
        >
          <v-card-text class="pa-6">
            <div class="d-flex align-center gap-4">
              <!-- 🌟 폰 레스토프 효과: 눈에 띄는 아이콘 배치 -->
              <div class="header-icon-enhanced">
                <span class="common-icon">📜</span>
              </div>
              <div class="flex-grow-1">
                <h1 class="text-h5 font-weight-bold text-grey-900 mb-2">
                  📊 내 활동 기록
                </h1>
                <p class="text-body-2 text-grey-600">
                  모든 변경 사항이 안전하게 기록됩니다. 투명하고 신뢰할 수 있는 서비스를 제공합니다 ✨
                </p>
              </div>
              <!-- 🎨 심미적 사용성 효과: 레벨 뱃지 표시 -->
              <v-chip
                color="primary"
                variant="elevated"
                size="large"
                class="security-chip"
              >
                <v-icon start>mdi-shield-check</v-icon>
                보안 로그
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 💎 밀러의 법칙: 핵심 정보만 간결하게 표시 -->
      <div class="stats-section mb-6">
        <v-row>
          <v-col cols="6" md="3">
            <v-card class="stats-card" elevation="0">
              <v-card-text class="text-center pa-4">
                <div class="stats-icon mb-2">🔄</div>
                <div class="text-h6 font-weight-bold text-primary">5</div>
                <div class="text-caption text-grey-600">총 변경</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="stats-card" elevation="0">
              <v-card-text class="text-center pa-4">
                <div class="stats-icon mb-2">🔒</div>
                <div class="text-h6 font-weight-bold text-success">2</div>
                <div class="text-caption text-grey-600">보안 관련</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="stats-card" elevation="0">
              <v-card-text class="text-center pa-4">
                <div class="stats-icon mb-2">📷</div>
                <div class="text-h6 font-weight-bold text-info">1</div>
                <div class="text-caption text-grey-600">이미지 변경</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6" md="3">
            <v-card class="stats-card" elevation="0">
              <v-card-text class="text-center pa-4">
                <div class="stats-icon mb-2">⏰</div>
                <div class="text-h6 font-weight-bold text-warning">방금</div>
                <div class="text-caption text-grey-600">최근 활동</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="header-section mb-6">
        <div class="d-flex align-center gap-3 mb-3">
          <div class="header-icon">
            <span class="common-icon">📝</span>
          </div>
          <div>
            <h1 class="text-h5 font-weight-bold text-grey-900 mb-1">
              프로필 변경 이력
            </h1>
            <p class="text-body-2 text-grey-600">
              개인정보 변경 내역과 보안 로그를 확인할 수 있습니다
            </p>
          </div>
        </div>
        
        <!-- 🤝 포스텔의 법칙: 사용자에게 친근하고 이해하기 쉬운 안내 -->
        <v-alert 
          type="info" 
          variant="elevated" 
          class="info-alert-enhanced"
          icon="mdi-information-outline"
        >
          <div class="alert-content">
            <div class="d-flex align-center gap-2 mb-2">
              <span class="text-h6 font-weight-bold">🛡️ 보안 안내</span>
            </div>
            <p class="mb-2">
              <strong>본인이 변경하지 않은 내역</strong>을 발견하시면 즉시 아래 조치를 취해주세요:
            </p>
            <ul class="security-checklist">
              <li>✅ 비밀번호 즉시 변경</li>
              <li>✅ 2단계 인증 활성화</li>
              <li>✅ 의심스러운 세션 해지</li>
            </ul>
            <!-- 📱 힉의 법칙: 주요 액션만 노출 -->
            <div class="d-flex gap-2 mt-3">
              <CommonVButton 
                common-variant="primary" 
                size="small"
                @click="$router.push('/profile/security')"
              >
                <v-icon start>mdi-shield-check</v-icon>
                보안 설정
              </CommonVButton>
              <CommonVButton 
                common-variant="ghost" 
                size="small"
                @click="$router.push('/profile')"
              >
                프로필로 돌아가기
              </CommonVButton>
            </div>
          </div>
        </v-alert>
      </div>

      <!-- 📋 테슬러의 법칙: 복잡한 이력 데이터는 컴포넌트가 관리 -->
      <div class="history-wrapper">
        <ProfileChangeHistory class="common-card-transition" />
      </div>

      <!-- 🔮 마이크로인터랙션: 플로팅 도움말 버튼 -->
      <v-fab
        location="bottom end"
        size="56"
        color="primary"
        icon="mdi-help-circle"
        class="floating-help"
        @click="showHelp = true"
      />

      <!-- 도움말 다이얼로그 -->
      <v-dialog v-model="showHelp" max-width="400">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon color="primary" class="mr-2">mdi-help-circle</v-icon>
            변경 이력 도움말
          </v-card-title>
          <v-card-text>
            <div class="help-content">
              <div class="help-item mb-3">
                <h4 class="text-subtitle-2 font-weight-bold mb-1">🔍 변경 이력 확인</h4>
                <p class="text-caption">모든 개인정보 변경 사항이 시간순으로 기록됩니다.</p>
              </div>
              <div class="help-item mb-3">
                <h4 class="text-subtitle-2 font-weight-bold mb-1">🔒 보안 중요 표시</h4>
                <p class="text-caption">중요한 보안 관련 변경사항은 별도로 표시됩니다.</p>
              </div>
              <div class="help-item">
                <h4 class="text-subtitle-2 font-weight-bold mb-1">🚨 의심 활동 신고</h4>
                <p class="text-caption">본인이 하지 않은 변경사항 발견 시 즉시 보안 설정에서 조치하세요.</p>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <CommonVButton
              common-variant="primary"
              @click="showHelp = false"
            >
              확인
            </CommonVButton>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<style scoped>
.profile-history-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  padding-bottom: 80px;
  position: relative;
}

/* 🎯 10개 UX 법칙 적용 스타일 */

/* 🏆 피크엔드 법칙: 성취감 있는 웰컴 카드 */
.welcome-card {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  background-size: 200% 100%;
  animation: gradientSlide 3s ease-in-out infinite;
}

@keyframes gradientSlide {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.gradient-border {
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3), 0 2px 16px rgba(255, 255, 255, 0.1);
}

/* 🌟 폰 레스토프 효과: 눈에 띄는 헤더 아이콘 */
.header-icon-enhanced {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(102, 126, 234, 0.2);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
}

.security-chip {
  animation: chipPulse 2s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes chipPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 💎 밀러의 법칙: 통계 카드 스타일 */
.stats-section {
  margin-bottom: 32px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  border-radius: 16px;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.2);
  background: rgba(255, 255, 255, 0.95) !important;
}

.stats-icon {
  font-size: 24px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-2px); }
  60% { transform: translateY(-1px); }
}

/* 🎯 피츠의 법칙: 뒤로가기 버튼 터치 영역 확대 */
.back-button-enhanced {
  min-width: 48px !important;
  min-height: 48px !important;
  border-radius: 12px !important;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.2) !important;
  transition: all 0.2s ease;
}

.back-button-enhanced:hover {
  background: rgba(255, 255, 255, 0.3) !important;
  transform: scale(1.05);
}

/* 🔄 도허티 임계: 빠른 전환 애니메이션 */
.common-card-transition {
  transition: all 0.2s ease;
}

.common-card-transition:hover {
  transform: translateY(-2px);
}

.history-wrapper {
  animation: slideInUp 0.5s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 🎨 심미적 사용성 효과: 아름다운 알림창 */
.info-alert-enhanced {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.1);
}

.security-checklist {
  list-style: none;
  padding: 0;
  margin: 0;
}

.security-checklist li {
  padding: 4px 0;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* 🔮 마이크로인터랙션: 플로팅 도움말 */
.floating-help {
  position: fixed !important;
  bottom: 100px;
  right: 20px;
  z-index: 1000;
  animation: float 3s ease-in-out infinite;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

.floating-help:hover {
  animation-play-state: paused;
  transform: scale(1.1);
}

/* 🎯 제이콥의 법칙: 친숙한 헤더 스타일 */
.header-title {
  display: flex;
  align-items: center;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-size: 18px;
}

.common-icon {
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  font-size: 20px;
  animation: iconWiggle 3s ease-in-out infinite;
}

@keyframes iconWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}

/* 도움말 다이얼로그 스타일 */
.help-content {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.help-item {
  padding: 8px 0;
  border-left: 3px solid transparent;
  padding-left: 12px;
  transition: all 0.2s ease;
  border-radius: 0 8px 8px 0;
}

.help-item:hover {
  border-left-color: rgba(102, 126, 234, 0.4);
  background: rgba(102, 126, 234, 0.05);
}

.header-section {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(15px);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.header-section:hover {
  box-shadow: 0 12px 48px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.header-icon {
  width: 56px;
  height: 56px;
  background: rgba(var(--v-theme-info), 0.1);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.common-icon {
  font-size: 28px;
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  line-height: 1;
}

.info-alert {
  border-radius: var(--radius-md);
}

.alert-content {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .profile-history-page {
    padding-bottom: 100px;
  }
  
  .header-section {
    padding: 20px 16px;
    margin: 0 -6px 24px -6px;
    border-radius: var(--radius-md);
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .common-icon {
    font-size: 24px;
  }
}
</style>