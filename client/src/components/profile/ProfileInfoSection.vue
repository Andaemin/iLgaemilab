<script setup>
import { computed } from 'vue'
import CommonVCard from '@/components/common/CommonVCard.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const occupationNames = {
  manufacturing: '제조업',
  construction: '건설업',
  agriculture: '농업',
  logistics: '물류',
  service: '서비스업'
}

const learningGoalNames = {
  daily_conversation: '일상 회화',
  business_communication: '업무 소통',
  cultural_understanding: '한국 문화 이해',
  job_preparation: '취업 준비',
  exam_preparation: '시험 대비',
  life_adaptation: '한국 생활 적응'
}

const genderOptions = [
  { title: '남성', value: 'male' },
  { title: '여성', value: 'female' }
]

// Computed
const displayGender = computed(() => {
  if (!props.user.gender) return '-'
  const option = genderOptions.find(opt => opt.value === props.user.gender)
  return option?.title || '-'
})

const displayOccupation = computed(() => {
  return occupationNames[props.user.occupationCategory] ||
         occupationNames[props.user.occupation] ||
         props.user.occupationCategory ||
         props.user.occupation ||
         '-'
})

const displayLearningGoal = computed(() => {
  if (!props.user.learningGoal || props.user.learningGoal.length === 0) {
    return '-'
  }

  let goals = props.user.learningGoal

  if (typeof goals === 'string') {
    try {
      goals = JSON.parse(goals)
    } catch (e) {
      console.error('Failed to parse learningGoal:', e)
      return '-'
    }
  }

  if (!Array.isArray(goals)) return '-'

  return goals.map(goal => learningGoalNames[goal] || goal).join(', ')
})

const displayBirthDate = computed(() => {
  if (!props.user.birthDate) return '-'

  try {
    const date = new Date(props.user.birthDate)
    if (isNaN(date.getTime())) return '-'

    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    console.error('Failed to parse birthDate:', e)
    return '-'
  }
})
</script>

<template>
  <CommonVCard class="profile-info-section">
    <v-card-text class="pa-6">
      <div class="section-header">
        <h3 class="section-title">개인정보</h3>
      </div>

      <!-- 개인정보 보기 -->
      <div class="info-view">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">이름</div>
            <div class="info-value">{{ user.name || '-' }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">이메일</div>
            <div class="info-value">{{ user.email || '-' }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">휴대전화</div>
            <div class="info-value">{{ user.phone || '-' }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">생년월일</div>
            <div class="info-value">{{ displayBirthDate }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">성별</div>
            <div class="info-value">{{ displayGender }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">직업군</div>
            <div class="info-value">{{ displayOccupation }}</div>
          </div>

          <v-divider class="my-3" />

          <div class="info-item">
            <div class="info-label">학습 목적</div>
            <div class="info-value learning-goals">{{ displayLearningGoal }}</div>
          </div>
        </div>
      </div>
    </v-card-text>
  </CommonVCard>
</template>

<style scoped>
.profile-info-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.edit-button {
  border-radius: 8px !important;
  font-size: 14px;
  font-weight: 500;
  gap: 4px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.info-label {
  font-size: 15px;
  font-weight: 500;
  color: #6b7280;
  min-width: 80px;
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  text-align: right;
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

.learning-goals {
  max-width: 200px;
  word-wrap: break-word;
  line-height: 1.4;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.common-input :deep(.v-field__outline) {
  border-radius: 12px !important;
}

.common-input :deep(.v-field--focused .v-field__outline) {
  border-color: rgb(var(--v-theme-primary)) !important;
  border-width: 2px !important;
}

.common-input :deep(.v-label) {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  font-weight: 500;
  color: #6b7280;
}

.common-input :deep(.v-field__input) {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
  font-weight: 500;
  color: #1f2937;
}

.edit-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
}

.cancel-btn {
  min-width: 80px;
}

.save-btn {
  min-width: 80px;
}

/* 모바일 반응형 */
@media (max-width: 600px) {
  .edit-actions {
    flex-direction: column-reverse;
    gap: 8px;
  }

  .cancel-btn,
  .save-btn {
    width: 100%;
    min-width: unset;
  }

  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .info-value {
    text-align: left;
    width: 100%;
  }
}
</style>
