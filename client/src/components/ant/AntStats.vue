<template>
  <div class="ant-stats">
    <!-- 레벨 정보 -->
    <CommonVCard class="mb-4">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between mb-3">
          <h3 class="text-h6 font-weight-bold">{{ levelInfo.name }}</h3>
          <v-chip color="primary" variant="elevated" size="large">
            Lv. {{ level }}
          </v-chip>
        </div>
        <p class="text-body-2 text-grey-600 mb-4">{{ levelInfo.description }}</p>

        <!-- 경험치 진행바 -->
        <div class="mb-2">
          <v-progress-linear
            :model-value="progress.percentage"
            height="32"
            rounded
            color="success"
            class="mb-2"
          >
            <template v-slot:default="{ value }">
              <strong class="text-white">{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
          <div class="d-flex justify-space-between text-caption">
            <span class="font-weight-bold text-success">{{ totalExperience }} XP</span>
            <span v-if="!progress.isMaxLevel" class="text-grey-600">
              다음 레벨까지 {{ progress.requiredXp - totalExperience }} XP
            </span>
            <span v-else class="font-weight-bold text-warning">최고 레벨 달성! 🎉</span>
          </div>
        </div>
      </v-card-text>
    </CommonVCard>

    <!-- 행복도 -->
    <CommonVCard class="mb-4">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-3">
          <v-icon :color="happinessColor" size="28" class="mr-3">mdi-emoticon-happy</v-icon>
          <span class="text-h6 font-weight-bold">행복도</span>
          <v-spacer />
          <span class="text-h6 font-weight-bold" :style="{ color: happinessColor }">{{ happiness }}%</span>
        </div>
        <v-progress-linear
          :model-value="happiness"
          height="12"
          rounded
          :color="happinessColor"
        />
      </v-card-text>
    </CommonVCard>

    <!-- 학습 통계 -->
    <CommonVCard class="mb-4">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" size="24" class="mr-2">mdi-school</v-icon>
          <h4 class="text-h6 font-weight-bold">학습 활동</h4>
        </div>
        <v-row>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="blue-lighten-4" size="48" class="mb-2">
                <v-icon color="blue" size="24">mdi-book-open</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.lessonsCompleted }}</div>
              <div class="stat-label">완료한 레슨</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="green-lighten-4" size="48" class="mb-2">
                <v-icon color="green" size="24">mdi-text</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.wordsLearned }}</div>
              <div class="stat-label">학습한 단어</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="purple-lighten-4" size="48" class="mb-2">
                <v-icon color="purple" size="24">mdi-microphone</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.speakingMinutes }}</div>
              <div class="stat-label">발음 연습(분)</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="orange-lighten-4" size="48" class="mb-2">
                <v-icon color="orange" size="24">mdi-check-circle</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.quizzesCompleted }}</div>
              <div class="stat-label">완료한 퀴즈</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </CommonVCard>

    <!-- 연속 학습 -->
    <CommonVCard class="mb-4">
      <v-card-text class="pa-6">
        <div class="d-flex align-center mb-4">
          <v-icon color="primary" size="24" class="mr-2">mdi-calendar-check</v-icon>
          <h4 class="text-h6 font-weight-bold">학습 기록</h4>
        </div>
        <v-row>
          <v-col cols="6" sm="3">
            <div class="stat-card highlight">
              <v-avatar color="deep-orange-lighten-4" size="48" class="mb-2">
                <v-icon color="deep-orange" size="24">mdi-fire</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.currentStreak }}</div>
              <div class="stat-label">연속 학습일</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="amber-lighten-4" size="48" class="mb-2">
                <v-icon color="amber-darken-2" size="24">mdi-trophy</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.longestStreak }}</div>
              <div class="stat-label">최장 연속일</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="indigo-lighten-4" size="48" class="mb-2">
                <v-icon color="indigo" size="24">mdi-calendar</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.totalStudyDays }}</div>
              <div class="stat-label">총 학습일</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-card">
              <v-avatar color="pink-lighten-4" size="48" class="mb-2">
                <v-icon color="pink" size="24">mdi-food-apple</v-icon>
              </v-avatar>
              <div class="stat-value">{{ stats.feedCount }}</div>
              <div class="stat-label">먹이 횟수</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </CommonVCard>

    <!-- 총 완료 활동 -->
    <CommonVCard>
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon color="primary" size="28" class="mr-3">mdi-star-circle</v-icon>
            <span class="text-h6 font-weight-bold">총 완료한 학습 활동</span>
          </div>
          <v-chip color="primary" variant="elevated" size="x-large" class="px-4">
            <span class="text-h5 font-weight-bold">{{ stats.totalTasksCompleted }}</span>
          </v-chip>
        </div>
      </v-card-text>
    </CommonVCard>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import CommonVCard from '@/components/common/CommonVCard.vue';

const props = defineProps({
  level: {
    type: Number,
    default: 1,
  },
  totalExperience: {
    type: Number,
    default: 0,
  },
  happiness: {
    type: Number,
    default: 50,
  },
  progress: {
    type: Object,
    default: () => ({
      percentage: 0,
      currentXp: 0,
      requiredXp: 300,
      isMaxLevel: false,
    }),
  },
  levelInfo: {
    type: Object,
    default: () => ({
      name: '알',
      description: '작고 소중한 개미 알이에요',
    }),
  },
  stats: {
    type: Object,
    default: () => ({
      totalTasksCompleted: 0,
      lessonsCompleted: 0,
      wordsLearned: 0,
      speakingMinutes: 0,
      quizzesCompleted: 0,
      totalStudyDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      feedCount: 0,
    }),
  },
});

const happinessColor = computed(() => {
  if (props.happiness >= 80) return 'success';
  if (props.happiness >= 50) return 'warning';
  return 'error';
});
</script>

<style scoped>
.ant-stats {
  width: 100%;
}

.stat-card {
  text-align: center;
  padding: 16px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: default;
}

.stat-card:hover {
  background: rgb(var(--v-theme-grey-50));
  transform: translateY(-2px);
}

.stat-card.highlight {
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 193, 7, 0.1) 100%);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: rgb(var(--v-theme-grey-900));
  margin: 8px 0 4px 0;
}

.stat-label {
  font-size: 12px;
  color: rgb(var(--v-theme-grey-600));
  font-weight: 500;
}
</style>
