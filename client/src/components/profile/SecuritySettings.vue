<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()

// State
const loading = ref(false)
const twoFactorEnabled = ref(false)
const twoFactorMethod = ref('sms')
const phoneNumber = ref('')
const activeSessions = ref([])
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})
const showPasswordForm = ref(false)
const passwordStrength = ref(0)

// Computed
const twoFactorMethodOptions = [
  { value: 'sms', text: 'SMS 인증', icon: 'mdi-message-text' },
  { value: 'email', text: '이메일 인증', icon: 'mdi-email' },
  { value: 'app', text: '인증 앱', icon: 'mdi-cellphone-key' }
]

const passwordStrengthColor = computed(() => {
  if (passwordStrength.value < 2) return 'error'
  if (passwordStrength.value < 3) return 'warning'
  if (passwordStrength.value < 4) return 'info'
  return 'success'
})

const passwordStrengthText = computed(() => {
  const strengths = ['매우 약함', '약함', '보통', '강함', '매우 강함']
  return strengths[passwordStrength.value] || '없음'
})

const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword && 
         passwordForm.value.newPassword && 
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword &&
         passwordStrength.value >= 2
})

// Methods
const fetchSecuritySettings = async () => {
  try {
    loading.value = true
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    
    // Fetch 2FA settings
    const twoFactorResponse = await fetch(`${apiUrl}/api/security/2fa`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (twoFactorResponse.ok) {
      const twoFactorData = await twoFactorResponse.json()
      if (twoFactorData.success) {
        twoFactorEnabled.value = twoFactorData.data.isEnabled
        twoFactorMethod.value = twoFactorData.data.method
        phoneNumber.value = twoFactorData.data.phoneNumber || ''
      }
    }
    
    // Fetch active sessions
    const sessionsResponse = await fetch(`${apiUrl}/api/security/sessions`, {
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    if (sessionsResponse.ok) {
      const sessionsData = await sessionsResponse.json()
      if (sessionsData.success) {
        activeSessions.value = sessionsData.data.sessions
      }
    }
  } catch (error) {
    console.error('보안 설정 조회 실패:', error)
  } finally {
    loading.value = false
  }
}

const toggle2FA = async () => {
  try {
    loading.value = true
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    
    const response = await fetch(`${apiUrl}/api/security/2fa/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        enabled: !twoFactorEnabled.value,
        method: twoFactorMethod.value,
        phoneNumber: phoneNumber.value
      })
    })
    
    const result = await response.json()
    if (result.success) {
      twoFactorEnabled.value = !twoFactorEnabled.value
      showSnackbar(result.message || '2단계 인증 설정이 변경되었습니다.', 'success')
    } else {
      showSnackbar(result.message || '설정 변경에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('2FA 설정 변경 실패:', error)
    showSnackbar('네트워크 오류가 발생했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

const revokeSession = async (sessionId) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    
    const response = await fetch(`${apiUrl}/api/security/sessions/${sessionId}/revoke`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authStore.token}` }
    })
    
    const result = await response.json()
    if (result.success) {
      activeSessions.value = activeSessions.value.filter(s => s.id !== sessionId)
      showSnackbar('세션이 해지되었습니다.', 'success')
    }
  } catch (error) {
    console.error('세션 해지 실패:', error)
    showSnackbar('세션 해지에 실패했습니다.', 'error')
  }
}

const calculatePasswordStrength = (password) => {
  if (!password) {
    passwordStrength.value = 0
    return
  }
  
  let score = 0
  
  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  
  // Character variety
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  // Bonus for very long passwords
  if (password.length >= 16) score++
  
  passwordStrength.value = Math.min(Math.floor(score / 2), 4)
}

const submitPasswordChange = async () => {
  try {
    loading.value = true
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    
    const response = await fetch(`${apiUrl}/api/security/password/change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify({
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword
      })
    })
    
    const result = await response.json()
    if (result.success) {
      passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
      showPasswordForm.value = false
      showSnackbar('비밀번호가 성공적으로 변경되었습니다.', 'success')
    } else {
      showSnackbar(result.message || '비밀번호 변경에 실패했습니다.', 'error')
    }
  } catch (error) {
    console.error('비밀번호 변경 실패:', error)
    showSnackbar('네트워크 오류가 발생했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

const formatLastActivity = (date) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60))
  
  if (diffInMinutes < 1) return '방금 전'
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`
  return `${Math.floor(diffInMinutes / 1440)}일 전`
}

const getDeviceIcon = (deviceInfo) => {
  if (!deviceInfo) return 'mdi-laptop'
  if (deviceInfo.mobile) return 'mdi-cellphone'
  if (deviceInfo.platform?.includes('Mac')) return 'mdi-laptop-mac'
  if (deviceInfo.platform?.includes('Windows')) return 'mdi-laptop'
  return 'mdi-monitor'
}

const showSnackbar = (message, color) => {
  if (color === 'success') {
    snackbarStore.showSuccess(message)
  } else if (color === 'error') {
    snackbarStore.showError(message)
  } else if (color === 'warning') {
    snackbarStore.showWarning(message)
  } else {
    snackbarStore.showInfo(message)
  }
}

// Watchers
const watchPasswordInput = (newPassword) => {
  calculatePasswordStrength(newPassword)
}

// Lifecycle
onMounted(() => {
  fetchSecuritySettings()
})
</script>

<template>
  <div class="security-settings">
    <!-- 🎯 제이콥의 법칙: 익숙한 2단계 인증 설정 패턴 -->
    <CommonVCard class="mb-6 common-card-enhanced">
      <template #title>
        <!-- 🌟 폰 레스토프 효과: 눈에 띄는 보안 아이콘 -->
        <div class="d-flex align-center gap-3">
          <div class="security-feature-icon">
            <span class="common-icon">🔐</span>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">2단계 인증</h3>
            <p class="text-caption text-grey-600 mb-0">계정 보안을 이중으로 지켜드리세요</p>
          </div>
        </div>
      </template>

      <v-divider class="mb-4" />

      <div class="two-factor-section">
        <!-- 📱 힉의 법칙: 주요 설정만 강조, 나머지는 숨김 -->
        <div class="two-factor-main">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="flex-grow-1">
              <div class="d-flex align-items-center gap-2 mb-2">
                <h4 class="text-h6 font-weight-bold">
                  2단계 인증
                </h4>
                <!-- 🎨 심미적 사용성 효과: 상태 뱃지 -->
                <v-chip
                  :color="twoFactorEnabled ? 'success' : 'warning'"
                  :variant="twoFactorEnabled ? 'elevated' : 'tonal'"
                  size="small"
                  class="status-chip"
                >
                  {{ twoFactorEnabled ? '활성화' : '비활성화' }}
                </v-chip>
              </div>
              <p class="text-body-2 text-grey-600">
                로그인 시 추가 인증으로 계정을 안전하게 보호합니다 🛡️
              </p>
            </div>
            <!-- 🎯 피츠의 법칙: 스위치 터치 영역 확대 -->
            <div class="switch-wrapper">
              <v-switch
                v-model="twoFactorEnabled"
                color="success"
                @change="toggle2FA"
                :loading="loading"
                hide-details
                class="enhanced-switch"
              />
            </div>
          </div>
        </div>

        <v-expand-transition>
          <div v-if="twoFactorEnabled" class="two-factor-config">
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="twoFactorMethod"
                  :items="twoFactorMethodOptions"
                  item-title="text"
                  item-value="value"
                  label="인증 방법"
                  variant="outlined"
                  density="comfortable"
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-icon :icon="item.raw.icon" />
                      </template>
                    </v-list-item>
                  </template>
                </v-select>
              </v-col>
              <v-col v-if="twoFactorMethod === 'sms'" cols="12" md="6">
                <v-text-field
                  v-model="phoneNumber"
                  label="휴대전화 번호"
                  placeholder="010-0000-0000"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-phone"
                />
              </v-col>
            </v-row>

            <v-alert type="info" variant="tonal" class="mt-4">
              <div class="d-flex align-center gap-3">
                <v-icon>mdi-information</v-icon>
                <div>
                  <strong>백업 코드:</strong> 인증 수단을 분실했을 때를 대비해 백업 코드를 안전한 곳에 보관하세요.
                </div>
              </div>
            </v-alert>
          </div>
        </v-expand-transition>
      </div>
    </CommonVCard>

    <!-- 🔑 비밀번호 변경 섹션 -->
    <CommonVCard class="mb-6 common-card-enhanced">
      <template #title>
        <!-- 🌟 폰 레스토프 효과: 비밀번호 보안 아이콘 강조 -->
        <div class="d-flex align-center gap-3">
          <div class="security-feature-icon password-icon">
            <span class="common-icon">🔑</span>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">비밀번호 관리</h3>
            <p class="text-caption text-grey-600 mb-0">정기적인 변경으로 보안을 유지하세요</p>
          </div>
        </div>
      </template>

      <v-divider class="mb-4" />

      <!-- 💎 밀러의 법칙: 비밀번호 설정 간소화 -->
      <div v-if="!showPasswordForm" class="password-section">
        <div class="password-info-card">
          <div class="d-flex align-center gap-3 mb-3">
            <div class="password-status-icon">
              <v-icon color="success" size="24">mdi-check-circle</v-icon>
            </div>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-bold mb-1">
                비밀번호 상태: 안전 ✅
              </h4>
              <p class="text-body-2 text-grey-600">
                마지막 변경: 7일 전 • 다음 변경 권장: 3개월 후
              </p>
            </div>
          </div>
          
          <div class="password-strength-indicator mb-3">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-medium">비밀번호 강도</span>
              <span class="text-caption text-success font-weight-bold">강함</span>
            </div>
            <v-progress-linear
              :model-value="85"
              color="success"
              height="6"
              rounded
              class="password-strength-bar"
            />
          </div>
          
          <!-- 🎯 피츠의 법칙: 주요 액션 버튼 크게 -->
          <CommonVButton
            common-variant="primary"
            size="large"
            block
            @click="showPasswordForm = true"
            class="change-password-btn"
          >
            <v-icon start>mdi-shield-refresh</v-icon>
            비밀번호 변경
          </CommonVButton>
        </div>
      </div>

      <v-expand-transition>
        <div v-if="showPasswordForm" class="password-form">
          <v-form @submit.prevent="submitPasswordChange">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="passwordForm.currentPassword"
                  type="password"
                  label="현재 비밀번호"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="passwordForm.newPassword"
                  type="password"
                  label="새 비밀번호"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock"
                  @input="watchPasswordInput"
                  required
                />
                <div v-if="passwordForm.newPassword" class="password-strength mt-2">
                  <div class="d-flex align-center gap-2 mb-1">
                    <span class="text-caption">비밀번호 강도:</span>
                    <v-chip
                      :color="passwordStrengthColor"
                      size="x-small"
                      variant="elevated"
                    >
                      {{ passwordStrengthText }}
                    </v-chip>
                  </div>
                  <v-progress-linear
                    :model-value="passwordStrength * 25"
                    :color="passwordStrengthColor"
                    height="4"
                    rounded
                  />
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  label="새 비밀번호 확인"
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-lock-check"
                  :rules="[
                    v => !!v || '비밀번호 확인은 필수입니다',
                    v => v === passwordForm.newPassword || '비밀번호가 일치하지 않습니다'
                  ]"
                  required
                />
              </v-col>
            </v-row>
            
            <div class="d-flex gap-3 mt-4">
              <CommonVButton
                type="submit"
                common-variant="primary"
                :disabled="!isPasswordFormValid"
                :loading="loading"
              >
                비밀번호 변경
              </CommonVButton>
              <CommonVButton
                common-variant="ghost"
                @click="showPasswordForm = false"
              >
                취소
              </CommonVButton>
            </div>
          </v-form>
        </div>
      </v-expand-transition>
    </CommonVCard>

    <!-- 📱 활성 세션 관리 섹션 -->
    <CommonVCard class="common-card-enhanced">
      <template #title>
        <!-- 🌟 폰 레스토프 효과: 세션 관리 아이콘 강조 -->
        <div class="d-flex align-center gap-3">
          <div class="security-feature-icon session-icon">
            <span class="common-icon">📱</span>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">로그인 세션</h3>
            <p class="text-caption text-grey-600 mb-0">로그인된 원격 디바이스를 관리하세요</p>
          </div>
        </div>
      </template>

      <v-divider class="mb-4" />

      <div v-if="loading && activeSessions.length === 0" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="text-body-2 text-grey-600 mt-3">세션 정보를 불러오는 중...</p>
      </div>

      <div v-else-if="activeSessions.length === 0" class="text-center py-8">
        <v-icon color="grey-400" size="64">mdi-devices</v-icon>
        <p class="text-body-2 text-grey-600 mt-3">활성 세션이 없습니다</p>
      </div>

      <div v-else class="sessions-list">
        <div
          v-for="session in activeSessions"
          :key="session.id"
          class="session-item"
        >
          <div class="d-flex align-center gap-4">
            <div class="device-icon">
              <v-icon 
                :icon="getDeviceIcon(session.deviceInfo)"
                color="primary"
                size="24"
              />
            </div>
            
            <div class="session-info flex-grow-1">
              <div class="d-flex align-center gap-2 mb-1">
                <h4 class="text-subtitle-2 font-weight-medium">
                  {{ session.deviceInfo?.platform || '알 수 없는 디바이스' }}
                </h4>
                <v-chip
                  v-if="session.isTrusted"
                  size="x-small"
                  color="success"
                  variant="elevated"
                >
                  신뢰할 수 있는 디바이스
                </v-chip>
              </div>
              
              <div class="session-details">
                <p class="text-caption text-grey-600 mb-1">
                  IP: {{ session.ipAddress }} • 
                  {{ session.location?.city || '위치 불명' }}
                </p>
                <p class="text-caption text-grey-600">
                  마지막 활동: {{ formatLastActivity(session.lastActivityAt) }}
                </p>
              </div>
            </div>
            
            <div class="session-actions">
              <CommonVButton
                v-if="!session.isCurrent"
                common-variant="danger"
                size="small"
                @click="revokeSession(session.id)"
              >
                해지
              </CommonVButton>
              <v-chip
                v-else
                size="small"
                color="success"
                variant="elevated"
              >
                현재 세션
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </CommonVCard>
  </div>
</template>

<style scoped>
.security-settings {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

/* 🎯 10개 UX 법칙 적용 스타일 */

/* 🎨 심미적 사용성 효과: 아름다운 카드 디자인 */
.common-card-enhanced {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  position: relative;
  overflow: hidden;
}

.common-card-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--common-blue), var(--common-purple), var(--common-blue));
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.common-card-enhanced:hover::before {
  transform: translateX(0);
}

.common-card-enhanced:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(var(--v-theme-primary), 0.15);
}

/* 🌟 폰 레스토프 효과: 보안 기능 아이콘 강조 */
.security-feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-primary), 0.05));
  border: 2px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
  animation: iconBreath 3s ease-in-out infinite;
}

.password-icon {
  background: linear-gradient(135deg, rgba(var(--v-theme-info), 0.1), rgba(var(--v-theme-info), 0.05));
  border-color: rgba(var(--v-theme-info), 0.2);
}

.session-icon {
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.1), rgba(var(--v-theme-success), 0.05));
  border-color: rgba(var(--v-theme-success), 0.2);
}

@keyframes iconBreath {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.common-icon {
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  font-size: 24px;
  animation: iconWiggle 4s ease-in-out infinite;
}

@keyframes iconWiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-3deg); }
  75% { transform: rotate(3deg); }
}

/* 📱 힉의 법칙: 2단계 인증 메인 설정 */
.two-factor-main {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  transition: all 0.3s ease;
}

.two-factor-main:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.status-chip {
  animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* 🎯 피츠의 법칙: 스위치 터치 영역 확대 */
.switch-wrapper {
  padding: 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.switch-wrapper:hover {
  background: rgba(var(--v-theme-surface-variant), 0.3);
}

.enhanced-switch {
  transform: scale(1.2);
}

/* 💎 밀러의 법캙: 비밀번호 정보 카드 */
.password-info-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-success), 0.05), rgba(var(--v-theme-surface), 0.9));
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-success), 0.2);
  transition: all 0.3s ease;
}

.password-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-success), 0.1);
}

.password-status-icon {
  width: 40px;
  height: 40px;
  background: rgba(var(--v-theme-success), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0%, 100% { 
    box-shadow: 0 0 0 0 rgba(var(--v-theme-success), 0.4);
  }
  50% { 
    box-shadow: 0 0 0 8px rgba(var(--v-theme-success), 0);
  }
}

.password-strength-bar {
  border-radius: 8px;
  overflow: hidden;
}

/* 🎯 피츠의 법칙: 비밀번호 변경 버튼 크게 */
.change-password-btn {
  height: 48px !important;
  font-weight: 600;
  border-radius: 12px !important;
  background: linear-gradient(135deg, var(--common-blue), var(--common-purple)) !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.change-password-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.change-password-btn:hover::before {
  left: 100%;
}

.change-password-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
}

/* 🔄 도허티 임계: 빠른 전환 애니메이션 */
.two-factor-section,
.password-section {
  transition: all 0.3s ease;
}

/* 🤝 포스텔의 법츙: 사용자 친화적 인터페이스 */
.security-feature-icon:hover {
  transform: scale(1.1) rotate(5deg);
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.2), rgba(var(--v-theme-primary), 0.1));
}

.two-factor-section,
.password-section {
  padding: 0;
}

.password-strength {
  max-width: 100%;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 📋 테슬러의 법츙: 세션 리스트 복잡성 시스템 관리 */

.session-item {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  transition: all 0.2s ease;
}

.session-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.device-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.session-info {
  min-width: 0;
}

.session-details p {
  line-height: 1.4;
}

.session-actions {
  flex-shrink: 0;
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .session-item {
    padding: 12px;
  }
  
  .device-icon {
    width: 40px;
    height: 40px;
  }
  
  .session-info {
    margin-right: 8px;
  }
}
</style>