<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()

// State
const changeHistory = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})
const selectedFilter = ref('all')

// Computed
const filteredHistory = computed(() => {
  if (selectedFilter.value === 'all') return changeHistory.value
  return changeHistory.value.filter(item => item.changeType === selectedFilter.value)
})

const filterOptions = [
  { value: 'all', text: '전체' },
  { value: 'profile_update', text: '개인정보 변경' },
  { value: 'avatar_change', text: '프로필 이미지' },
  { value: 'phone_change', text: '휴대전화' },
  { value: 'learning_preferences', text: '학습 설정' }
]

// Methods
const fetchChangeHistory = async (page = 1) => {
  try {
    loading.value = true
    error.value = null
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    const response = await fetch(`${apiUrl}/api/profile/change-history?page=${page}&limit=${pagination.value.limit}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    const result = await response.json()
    
    if (result.success) {
      changeHistory.value = result.data.history
      pagination.value = result.data.pagination
    } else {
      error.value = result.message || '변경 이력을 불러올 수 없습니다.'
      snackbarStore.showError(error.value)
    }
  } catch (err) {
    console.error('변경 이력 조회 실패:', err)
    error.value = '네트워크 오류가 발생했습니다.'
    snackbarStore.showError(error.value)
  } finally {
    loading.value = false
  }
}

const getChangeIcon = (changeType) => {
  switch (changeType) {
    case 'profile_update': return 'mdi-account-edit'
    case 'avatar_change': return 'mdi-camera'
    case 'phone_change': return 'mdi-phone'
    case 'learning_preferences': return 'mdi-school'
    case 'password_change': return 'mdi-lock'
    case 'email_change': return 'mdi-email'
    default: return 'mdi-pencil'
  }
}

const getChangeColor = (changeType, isSecuritySensitive) => {
  if (isSecuritySensitive) return 'error'
  switch (changeType) {
    case 'avatar_change': return 'primary'
    case 'learning_preferences': return 'success'
    default: return 'info'
  }
}

const formatFieldName = (fieldName) => {
  const fieldNames = {
    name: '이름',
    phone: '휴대전화',
    birthDate: '생년월일',
    gender: '성별',
    occupation: '직업군',
    learningGoal: '학습 목적',
    profileImage: '프로필 이미지'
  }
  return fieldNames[fieldName] || fieldName
}

const formatValue = (value, fieldName) => {
  if (!value || value === 'null') return '설정 안함'
  
  if (fieldName === 'learningGoal') {
    try {
      const goals = JSON.parse(value)
      const goalNames = {
        daily_conversation: '일상 회화',
        business_communication: '업무 소통',
        cultural_understanding: '문화 이해',
        job_preparation: '취업 준비',
        exam_preparation: '시험 대비',
        life_adaptation: '생활 적응'
      }
      return Array.isArray(goals) 
        ? goals.map(g => goalNames[g] || g).join(', ')
        : goalNames[goals] || goals
    } catch {
      return value
    }
  }
  
  if (fieldName === 'occupation') {
    const occupations = {
      manufacturing: '제조업',
      construction: '건설업',
      agriculture: '농업',
      logistics: '물류',
      service: '서비스업'
    }
    return occupations[value] || value
  }
  
  if (fieldName === 'gender') {
    return value === 'male' ? '남성' : value === 'female' ? '여성' : value
  }
  
  if (fieldName === 'profileImage') {
    return value ? '이미지 설정됨' : '이미지 없음'
  }
  
  return value
}

const loadMoreHistory = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    fetchChangeHistory(pagination.value.page + 1)
  }
}

// Lifecycle
onMounted(() => {
  fetchChangeHistory()
})
</script>

<template>
  <!-- 🎯 제이콥의 법칙: 익숙한 변경 이력 패턴 -->
  <CommonVCard class="history-card-enhanced">
    <template #title>
      <!-- 🌟 폰 레스토프 효과: 눈에 띄는 이력 아이콘 -->
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <div class="history-feature-icon">
            <span class="common-icon">📜</span>
          </div>
          <div>
            <h3 class="text-h6 font-weight-bold mb-1">내 활동 기록</h3>
            <p class="text-caption text-grey-600 mb-0">모든 변경사항이 안전하게 기록됩니다</p>
          </div>
        </div>
        <!-- 📱 힉의 법캙: 필터 옵션 간소화 -->
        <div class="filter-wrapper">
          <v-select
            v-model="selectedFilter"
            :items="filterOptions"
            item-title="text"
            item-value="value"
            variant="outlined"
            density="compact"
            hide-details
            class="filter-select"
            prepend-inner-icon="mdi-filter-outline"
          >
            <template #selection="{ item }">
              <v-chip size="small" color="primary" variant="tonal">
                {{ item.title }}
              </v-chip>
            </template>
          </v-select>
        </div>
      </div>
    </template>

    <v-divider class="mb-4" />

    <!-- 🚀 도허티 임계: 빠른 로딩 상태 -->
    <div v-if="loading && changeHistory.length === 0" class="loading-state">
      <div class="loading-content">
        <div class="loading-icon mb-3">
          <span class="common-icon">🔄</span>
        </div>
        <v-progress-circular 
          indeterminate 
          color="primary" 
          size="48"
          width="4"
          class="mb-3"
        />
        <p class="text-body-2 text-grey-600">변경 이력을 불러오는 중... ✨</p>
      </div>
    </div>

    <!-- 🤝 포스텔의 법캙: 사용자 친화적 에러 메시지 -->
    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <div class="error-icon mb-3">
          <span class="common-icon">😔</span>
        </div>
        <h4 class="text-h6 font-weight-bold mb-2">이런, 문제가 생겼네요</h4>
        <p class="text-body-2 text-grey-600 mb-4">{{ error }}</p>
        <!-- 🎯 피츠의 법캙: 재시도 버튼 크게 -->
        <CommonVButton 
          common-variant="primary" 
          size="large"
          @click="fetchChangeHistory(1)"
          class="retry-button"
        >
          <v-icon start>mdi-refresh</v-icon>
          다시 시도하기
        </CommonVButton>
      </div>
    </div>

    <!-- 💎 밀러의 법캙: 빈 상태 간소하게 표시 -->
    <div v-else-if="filteredHistory.length === 0" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon mb-3">
          <span class="common-icon">🌱</span>
        </div>
        <h4 class="text-h6 font-weight-bold mb-2">아직 변경 이력이 없어요</h4>
        <p class="text-body-2 text-grey-600">프로필을 수정하면 여기에 기록이 남습니다 📝</p>
      </div>
    </div>

    <!-- 📋 테슬러의 법캙: 복잡한 이력 데이터 시스템 관리 -->
    <div v-else class="history-timeline-wrapper">
      <v-timeline align="start" side="end" class="timeline-enhanced">
        <v-timeline-item
          v-for="(item, index) in filteredHistory"
          :key="item.id"
          :dot-color="getChangeColor(item.changeType, item.isSecuritySensitive)"
          size="small"
          class="timeline-item-enhanced mb-4"
          :class="{ 'timeline-item-recent': index < 2 }"
        >
          <template #icon>
            <v-icon 
              :color="getChangeColor(item.changeType, item.isSecuritySensitive)"
              size="16"
            >
              {{ getChangeIcon(item.changeType) }}
            </v-icon>
          </template>

          <!-- 🎨 심미적 사용성 효과: 아름다운 변경 아이템 -->
          <div class="change-item-enhanced">
            <div class="change-header">
              <div class="d-flex align-center gap-2 mb-2">
                <div class="change-type-icon">
                  <v-icon 
                    :color="getChangeColor(item.changeType, item.isSecuritySensitive)"
                    size="20"
                  >
                    {{ getChangeIcon(item.changeType) }}
                  </v-icon>
                </div>
                <h4 class="text-subtitle-1 font-weight-bold flex-grow-1">
                  {{ item.changeDescription }}
                </h4>
                <!-- 🌟 폰 레스토프 효과: 보안 중요 뱃지 강조 -->
                <v-chip
                  v-if="item.isSecuritySensitive"
                  size="small"
                  color="error"
                  variant="elevated"
                  class="security-badge"
                >
                  <v-icon start size="16">mdi-shield-alert</v-icon>
                  보안 중요
                </v-chip>
              </div>
            </div>

            <div class="change-details">
              <div class="d-flex align-center gap-4 mb-2">
                <div class="field-info">
                  <span class="text-caption text-grey-600">필드:</span>
                  <span class="text-body-2 font-weight-medium ml-1">
                    {{ formatFieldName(item.fieldName) }}
                  </span>
                </div>
                <div class="time-info">
                  <span class="text-caption text-grey-600">시간:</span>
                  <span class="text-body-2 ml-1">{{ item.timeAgo }}</span>
                </div>
              </div>

              <div v-if="item.oldValue !== item.newValue" class="value-changes">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-icon size="14" color="error">mdi-minus</v-icon>
                  <span class="text-body-2 text-error">
                    {{ formatValue(item.oldValue, item.fieldName) }}
                  </span>
                </div>
                <div class="d-flex align-center gap-2">
                  <v-icon size="14" color="success">mdi-plus</v-icon>
                  <span class="text-body-2 text-success">
                    {{ formatValue(item.newValue, item.fieldName) }}
                  </span>
                </div>
              </div>

              <div class="device-info mt-2">
                <v-chip
                  size="x-small"
                  variant="outlined"
                  color="grey"
                  class="mr-2"
                >
                  {{ item.changedBy === 'user' ? '사용자' : item.changedBy }}
                </v-chip>
                <span class="text-caption text-grey-500">
                  IP: {{ item.ipAddress }}
                </span>
              </div>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>

      <!-- 🎯 피츠의 법캙: 더 보기 버튼 크게 -->
      <div v-if="pagination.page < pagination.totalPages" class="load-more-section">
        <div class="load-more-divider mb-4">
          <span class="load-more-text">더 많은 이력</span>
        </div>
        <CommonVButton
          common-variant="primary"
          size="large"
          block
          :loading="loading"
          @click="loadMoreHistory"
          class="load-more-button"
        >
          <v-icon start>mdi-plus</v-icon>
          {{ pagination.total - changeHistory.length }}개 더 보기
        </CommonVButton>
      </div>
    </div>

    <!-- 🔮 마이크로인터랙션: 하단 요약 정보 -->
    <div v-if="changeHistory.length > 0" class="history-summary mt-4">
      <v-card class="summary-card" elevation="0">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center gap-2">
              <span class="common-icon">📊</span>
              <span class="text-body-2 font-weight-medium">요약</span>
            </div>
            <div class="d-flex gap-4">
              <div class="summary-item">
                <span class="text-caption text-grey-600">총 변경</span>
                <span class="text-subtitle-2 font-weight-bold text-primary ml-1">{{ pagination.total }}</span>
              </div>
              <div class="summary-item">
                <span class="text-caption text-grey-600">보안 관련</span>
                <span class="text-subtitle-2 font-weight-bold text-error ml-1">
                  {{ changeHistory.filter(item => item.isSecuritySensitive).length }}
                </span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </CommonVCard>
</template>

<style scoped>
/* 🎯 10개 UX 법캙 적용 스타일 */

/* 🎨 심미적 사용성 효과: 아름다운 이력 카드 */
.history-card-enhanced {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  position: relative;
  overflow: hidden;
}

.history-card-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.history-card-enhanced:hover::before {
  transform: translateX(0);
}

.history-card-enhanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
}

/* 🌟 폰 레스토프 효과: 이력 기능 아이콘 강조 */
.history-feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05));
  border: 2px solid rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
  animation: historyIconFloat 3s ease-in-out infinite;
}

@keyframes historyIconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}

.common-icon {
  font-family: 'TossFaceFont', 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui;
  font-size: 24px;
  animation: iconPulse 4s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* 📱 힉의 법캙: 필터 옵션 인터페이스 */
.filter-wrapper {
  min-width: 160px;
}

.filter-select {
  border-radius: 12px;
}

/* 🚀 도허티 임계: 빠른 로딩 상태 */
.loading-state {
  padding: 48px 24px;
  text-align: center;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  font-size: 32px;
  animation: loadingBounce 1.5s ease-in-out infinite;
}

@keyframes loadingBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-8px); }
  60% { transform: translateY(-4px); }
}

/* 🤝 포스텔의 법캙: 친화적 에러 상태 */
.error-state {
  padding: 48px 24px;
  text-align: center;
}

.error-content {
  max-width: 300px;
  margin: 0 auto;
}

.error-icon {
  font-size: 48px;
  animation: errorShake 2s ease-in-out;
}

@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.retry-button {
  height: 44px !important;
  border-radius: 12px !important;
  font-weight: 600;
}

/* 💎 밀러의 법캙: 빈 상태 */
.empty-state {
  padding: 48px 24px;
  text-align: center;
}

.empty-content {
  max-width: 300px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 48px;
  animation: emptyGrow 3s ease-in-out infinite;
}

@keyframes emptyGrow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 📋 테슬러의 법캙: 타임라인 인터페이스 */
.history-timeline-wrapper {
  animation: timelineSlideIn 0.5s ease-out;
}

@keyframes timelineSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timeline-enhanced :deep(.v-timeline-item__body) {
  padding-left: 20px !important;
}

.timeline-item-enhanced {
  transition: all 0.2s ease;
}

.timeline-item-recent {
  position: relative;
}

.timeline-item-recent::before {
  content: 'NEW';
  position: absolute;
  top: -8px;
  left: 40px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: bold;
  z-index: 10;
  animation: newBadgePulse 2s ease-in-out infinite;
}

@keyframes newBadgePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* 🎨 심미적 사용성 효과: 변경 아이템 */
.change-item-enhanced {
  background: rgba(var(--v-theme-surface), 1);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.change-item-enhanced::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), 0.8), rgba(var(--v-theme-primary), 0.3));
  transition: width 0.3s ease;
}

.change-item-enhanced:hover {
  background: rgba(var(--v-theme-surface), 1);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.1);
  transform: translateX(4px);
}

.change-item-enhanced:hover::before {
  width: 8px;
}

.change-header {
  position: relative;
}

.change-type-icon {
  width: 32px;
  height: 32px;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.change-item-enhanced:hover .change-type-icon {
  background: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.1);
}

.security-badge {
  animation: securityBlink 2s ease-in-out infinite;
}

@keyframes securityBlink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.7; }
}

/* 🎯 피츠의 법츙: 더 보기 버튼 */
.load-more-section {
  margin-top: 32px;
  padding: 20px;
  text-align: center;
}

.load-more-divider {
  position: relative;
  text-align: center;
}

.load-more-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-outline), 0.3), transparent);
}

.load-more-text {
  background: var(--v-theme-surface);
  padding: 0 16px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-weight: 500;
}

.load-more-button {
  height: 48px !important;
  border-radius: 12px !important;
  font-weight: 600;
  background: linear-gradient(135deg, var(--common-blue), var(--common-purple)) !important;
  transition: all 0.3s ease;
}

.load-more-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
}

/* 🔮 마이크로인터랙션: 요약 정보 */
.history-summary {
  animation: summarySlideUp 0.5s ease-out 0.3s both;
}

@keyframes summarySlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.summary-card {
  background: rgba(var(--v-theme-surface-variant), 0.3) !important;
  border: 1px solid rgba(var(--v-theme-outline), 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.summary-card:hover {
  background: rgba(var(--v-theme-surface-variant), 0.5) !important;
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 레거시 스타일 유지 (하위 호환성) */
.change-item {
  background: rgba(var(--v-theme-surface), 0.8);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
  transition: all 0.2s ease;
}

.change-item:hover {
  background: rgba(var(--v-theme-surface), 1);
  box-shadow: var(--shadow-sm);
}

.change-details {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.field-info, .time-info {
  display: flex;
  align-items: center;
}

.value-changes {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.3);
}

.device-info {
  padding-top: 8px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.08);
}
</style>