<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import CommonSkeleton from "@/components/common/CommonSkeleton.vue";
import CommonButton from "@/components/common/CommonButton.vue";
import AppHeader from "@/components/common/AppHeader.vue";
import axios from "axios";

const { t, tm } = useI18n();

const authStore = useAuthStore();
const router = useRouter();
const isLoading = ref(true);

const completedLevels = ref({
    beginner: [false, false, false, false, false],
    intermediate: [false, false, false, false, false],
    advanced: [false, false, false, false, false],
});

// 마무리 테스트 통과 여부
const finalTestPassed = ref({
    beginner: false,
    intermediate: false,
    advanced: false
});

// 레벨 데이터 (computed로 i18n 적용)
const levelData = computed(() => [
    {
        id: "beginner",
        title: t('learn.beginner.title'),
        icon: "🌱",
        subtitle: t('learn.beginner.subtitle'),
        color: "#3182F6",
        levels: tm('learn.beginner.levels'),
    },
    {
        id: "intermediate",
        title: t('learn.intermediate.title'),
        icon: "🌿",
        subtitle: t('learn.intermediate.subtitle'),
        color: "#3182F6",
        levels: tm('learn.intermediate.levels'),
    },
    {
        id: "advanced",
        title: t('learn.advanced.title'),
        icon: "🌳",
        subtitle: t('learn.advanced.subtitle'),
        color: "#3182F6",
        levels: tm('learn.advanced.levels'),
    },
]);

// DB에서 레벨 진행도 가져오기
const fetchLevelProgress = async () => {
    try {
        const response = await axios.get('/api/learning/level-progress', {
            headers: {
                Authorization: `Bearer ${authStore.token}`
            }
        });

        if (response.data.success) {
            completedLevels.value = response.data.progress;
        }

        // 각 카테고리의 마무리 테스트 통과 여부 확인
        console.log('🔍 마무리 테스트 상태 확인 시작...');
        for (const category of ['beginner', 'intermediate', 'advanced']) {
            try {
                const testResponse = await axios.get(`/api/learning/final-test-status/${category}`, {
                    headers: {
                        Authorization: `Bearer ${authStore.token}`
                    }
                });
                if (testResponse.data.success) {
                    finalTestPassed.value[category] = testResponse.data.passed;
                    console.log(`✅ ${category} 마무리 테스트: ${testResponse.data.passed ? '통과' : '미통과'}`);
                }
            } catch (error) {
                console.error(`Failed to fetch ${category} test status:`, error);
            }
        }
        console.log('📊 최종 마무리 테스트 상태:', finalTestPassed.value);
    } catch (error) {
        console.error('Failed to fetch level progress:', error);
    } finally {
        isLoading.value = false;
    }
};

// 컴포넌트 마운트 시 진행도 가져오기
onMounted(() => {
    fetchLevelProgress();
});

const handleLevelClick = (categoryId, levelIndex) => {
    // 중급: 초급 마무리 테스트를 통과해야 접근 가능
    if (categoryId === 'intermediate' && !finalTestPassed.value.beginner) {
        alert(t('learn.alert.intermediateTest'));
        return;
    }

    // 고급: 중급 마무리 테스트를 통과해야 접근 가능
    if (categoryId === 'advanced' && !finalTestPassed.value.intermediate) {
        alert(t('learn.alert.advancedTest'));
        return;
    }

    // 이전 레벨을 완료하지 않았으면 진행 불가
    if (levelIndex > 0 && !completedLevels.value[categoryId][levelIndex - 1]) {
        alert(t('learn.alert.previousLevel'));
        return;
    }

    console.log(`클릭된 레벨: ${categoryId} - ${levelIndex + 1}`);

    // LearnLevelView로 이동 (라우터 사용)
    router.push({
        name: "learn-level",
        params: {
            category: categoryId,
            level: levelIndex + 1,
        },
    });
};

const handleTestClick = (categoryId) => {
    // 해당 카테고리의 모든 레벨을 완료해야 테스트 접근 가능
    if (!completedLevels.value[categoryId].every(level => level)) {
        alert(t('learn.alert.completeLevels'));
        return;
    }

    console.log(`마무리 테스트 클릭: ${categoryId}`);

    // FinalTestView로 이동
    router.push({
        name: "final-test",
        params: {
            category: categoryId,
        },
    });
};
</script>

<template>
    <div class="common-page">
        <!-- Header Component -->
        <AppHeader />

        <div class="common-container-md">
            <CommonSkeleton v-if="isLoading" type="article" :count="3" class="mb-lg" />

            <!-- 학습 진행도 -->
            <template v-else>
                <div class="learning-progress">
                    <div class="page-header-section">
                        <h4 class="common-title1">📚 한국어 공부하기</h4>
                    </div>

                    

                    <div v-for="(category, categoryIndex) in levelData" :key="category.id" class="category-section"
                        :class="{
                            'category-locked': (category.id === 'intermediate' && !finalTestPassed.beginner) ||
                                               (category.id === 'advanced' && !finalTestPassed.intermediate)
                        }">
                        <!-- 카테고리 제목 -->
                        <div class="category-header">
                            <h3 class="common-title2">
                                {{ category.icon }} {{ category.title }}
                                <span v-if="(category.id === 'intermediate' && !finalTestPassed.beginner) ||
                                           (category.id === 'advanced' && !finalTestPassed.intermediate)" class="category-lock-icon">🔒</span>
                            </h3>
                            <p class="common-body2 text-gray-600">{{ category.subtitle }}</p>
                        </div>

                        <!-- 레벨 진행도 -->
                        <div class="level-progress">
                            <div class="progress-line">
                                <!-- 레벨 원들 -->
                                <div
                                    v-for="(level, levelIndex) in category.levels"
                                    :key="levelIndex"
                                    class="level-item"
                                    :class="{
                                        locked: levelIndex > 0 && !completedLevels[category.id][levelIndex - 1]
                                    }"
                                    @click="handleLevelClick(category.id, levelIndex)"
                                >
                                    <!-- 연결선 (첫 번째 제외) -->
                                    <div
                                        v-if="levelIndex > 0"
                                        class="connection-line"
                                        :class="{
                                            completed: completedLevels[category.id][levelIndex - 1] && completedLevels[category.id][levelIndex],
                                            active: completedLevels[category.id][levelIndex - 1] && !completedLevels[category.id][levelIndex]
                                        }"
                                        :style="{ '--line-color': category.color }"
                                    ></div>

                                    <!-- 레벨 원 -->
                                    <div
                                        class="level-circle"
                                        :class="{
                                            completed: completedLevels[category.id][levelIndex],
                                            current: !completedLevels[category.id][levelIndex] && (levelIndex === 0 || completedLevels[category.id][levelIndex - 1]),
                                            locked: levelIndex > 0 && !completedLevels[category.id][levelIndex - 1]
                                        }"
                                        :style="{ '--level-color': category.color }"
                                    >
                                        <span v-if="levelIndex > 0 && !completedLevels[category.id][levelIndex - 1]" class="lock-icon">🔒</span>
                                        <span v-else class="level-number">{{ levelIndex + 1 }}</span>
                                    </div>

                                    <!-- 레벨 제목 -->
                                    <div class="level-title">
                                        {{ level }}
                                    </div>
                                </div>

                                <!-- 마무리 테스트 (왕관) -->
                                <div class="test-item"
                                    :class="{
                                        'test-locked': !completedLevels[category.id].every((level) => level)
                                    }"
                                    @click="handleTestClick(category.id)">
                                    <!-- 연결선 -->
                                    <div
                                        class="connection-line final-line"
                                        :class="{
                                            completed: completedLevels[category.id].every((level) => level),
                                        }"
                                        :style="{ '--line-color': category.color }"
                                    ></div>

                                    <!-- 테스트 왕관 -->
                                    <div
                                        class="test-crown"
                                        :class="{
                                            completed: finalTestPassed[category.id],
                                            current: completedLevels[category.id].every((level) => level) && !finalTestPassed[category.id],
                                            locked: !completedLevels[category.id].every((level) => level)
                                        }"
                                        :style="{ '--level-color': category.color }"
                                    >
                                        <span v-if="!completedLevels[category.id].every((level) => level)" class="lock-icon">🔒</span>
                                        <span v-else>👑</span>
                                    </div>

                                    <!-- 테스트 제목 -->
                                    <div class="test-title">{{ t('learn.finalTest') }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
/* 기본 간격 변수 (프로젝트에 없다면 추가) */
:root {
    --spacing-xs: 8px;
    --spacing-sm: 12px;
    --spacing-md: 16px;
    --spacing-lg: 24px;
    --spacing-xl: 32px;
}

.common-container-md {
    margin-top: var(--spacing-md);
    max-width: auto;
    margin-left: auto;
    margin-right: auto;
    padding: 0 var(--spacing-md);
}

.text-center {
    text-align: center;
}

.text-gray-600 {
    color: #6b7280;
}

.mb-lg {
    margin-bottom: var(--spacing-lg);
}

.mb-md {
    margin-bottom: var(--spacing-md);
}

/* 학습 진행도 스타일 */
.learning-progress {
    padding: var(--spacing-md) 0;
}

/* 페이지 헤더 섹션 */
.page-header-section {
    text-align: center;
    margin-bottom: var(--spacing-md);
}

.page-header-section h2 {
    margin: 0;
}

.category-section {
    margin-bottom: 48px;
}

.category-section.category-locked {
    opacity: 0.5;
    pointer-events: none;
}

.category-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-md);
    background: #f8fafc;
    border-radius: 12px;
}

.category-lock-icon {
    font-size: 20px;
    margin-left: 8px;
}

.category-header h3 {
    margin: 0 0 var(--spacing-xs) 0;
    color: #1f2937;
}

.category-header p {
    margin: 0;
}

/* 레벨 진행도 */
.level-progress {
    position: relative;
    padding: var(--spacing-lg) 0;
    overflow-x: auto;
    /* 스크롤바 스타일링 */
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.level-progress::-webkit-scrollbar {
    height: 6px;
}

.level-progress::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
}

.level-progress::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.level-progress::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}

.progress-line {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-md);
    flex-wrap: nowrap;
    justify-content: flex-start;
    padding: var(--spacing-md);
    min-width: max-content;
}

.level-item,
.test-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    cursor: pointer;
    flex: 0 0 auto;
    min-width: 120px;
    padding: var(--spacing-sm);
}

.level-item.locked {
    cursor: not-allowed;
    opacity: 0.6;
}

/* 연결선 */
.connection-line {
    position: absolute;
    /* level-circle 높이 40px, 중심은 20px + padding-top (12px) = 32px */
    top: calc(var(--spacing-sm) + 20px);
    left: calc(-50% - var(--spacing-md) / 2);
    width: calc(100% + var(--spacing-md));
    height: 3px;
    background: #e5e7eb;
    transition: background 0.3s ease;
    z-index: 1;
}

.connection-line.completed {
    background: var(--line-color);
    animation: fillLine 0.5s ease-in-out;
}

.connection-line.active {
    background: var(--line-color);
}

/* 마무리 테스트 연결선 - 이전 레벨 원(40px)의 중심(20px)과 맞춤 */
.final-line {
    top: calc(var(--spacing-sm) + 20px);
    width: calc(100% + var(--spacing-md));
    left: calc(-50% - var(--spacing-md) / 2);
}

/* 마무리 테스트 왕관 위치 조정 - 레벨 원 중심과 맞추기 위해 위로 4px 이동 */
.test-item .test-crown {
    margin-top: -4px;
}

/* 레벨 원 */
.level-circle {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    font-weight: 600;
    font-size: 14px;
    color: #6b7280;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    margin-bottom: var(--spacing-sm);
}

.level-circle:hover {
    transform: translateY(-2px) scale(1.05);
}

.level-circle.completed {
    border-color: var(--level-color);
    background: var(--level-color);
    color: white;
    animation: fillCircle 0.5s ease-in-out;
}

.level-circle.current {
    border-color: #3182F6;
    border-width: 3px;
    background: white;
    color: #3182F6;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.2);
    animation: pulse 2s ease-in-out infinite;
}

.level-circle.locked {
    border-color: #d1d5db;
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
}

.lock-icon {
    font-size: 16px;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(49, 130, 246, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 8px rgba(49, 130, 246, 0);
    }
}

/* 테스트 왕관 */
.test-crown {
    width: 48px;
    height: 48px;
    border: 3px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    font-size: 20px;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    margin-bottom: var(--spacing-sm);
}

.test-crown:hover {
    transform: translateY(-2px) scale(1.05);
}

.test-crown.completed {
    border-color: var(--level-color);
    background: var(--level-color);
    animation: fillCircle 0.5s ease-in-out;
}

.test-crown.current {
    border-color: #3182F6;
    border-width: 3px;
    background: white;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.2);
    animation: pulse 2s ease-in-out infinite;
}

.test-crown.locked {
    border-color: #d1d5db;
    background: #f3f4f6;
    cursor: not-allowed;
}

.test-item.test-locked {
    cursor: not-allowed;
    opacity: 0.6;
}

/* 제목 스타일 */
.level-title,
.test-title {
    font-size: 12px;
    font-weight: 500;
    color: #374151;
    text-align: center;
    line-height: 1.4;
    max-width: 110px;
    word-break: keep-all;
    overflow-wrap: break-word;
}

/* 애니메이션 */
@keyframes fillCircle {
    0% {
        transform: scale(0.8);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

@keyframes fillLine {
    0% {
        width: 0;
    }
    100% {
        width: 120px;
    }
}

/* 반응형 - 태블릿 */
@media (max-width: 768px) {
    .progress-line {
        padding: var(--spacing-sm) var(--spacing-md);
        gap: var(--spacing-sm);
    }

    .level-item,
    .test-item {
        min-width: 100px;
    }

    .connection-line {
        top: calc(var(--spacing-sm) + 20px);
        left: calc(-50% - var(--spacing-sm) / 2);
        width: calc(100% + var(--spacing-sm));
    }

    .final-line {
        top: calc(var(--spacing-sm) + 20px);
        left: calc(-50% - var(--spacing-sm) / 2);
        width: calc(100% + var(--spacing-sm));
    }

    .level-title,
    .test-title {
        font-size: 11px;
        max-width: 90px;
    }
}

/* 반응형 - 모바일 */
@media (max-width: 480px) {
    .common-container-md {
        padding: 0 var(--spacing-xs);
    }

    .learning-progress {
        padding: var(--spacing-sm) 0;
    }

    .category-header {
        padding: var(--spacing-sm);
        margin-bottom: var(--spacing-lg);
    }

    .level-progress {
        padding: var(--spacing-md) 0;
    }

    .progress-line {
        padding: var(--spacing-xs);
        gap: var(--spacing-xs);
    }

    .level-item,
    .test-item {
        min-width: 85px;
        padding: var(--spacing-xs);
    }

    /* 모바일에서 level-circle 36px, 중심은 18px */
    .connection-line {
        top: calc(var(--spacing-xs) + 18px);
        left: calc(-50% - var(--spacing-xs) / 2);
        width: calc(100% + var(--spacing-xs));
    }

    .final-line {
        top: calc(var(--spacing-xs) + 18px);
        left: calc(-50% - var(--spacing-xs) / 2);
        width: calc(100% + var(--spacing-xs));
    }

    .level-circle {
        width: 36px;
        height: 36px;
        font-size: 13px;
    }

    .test-crown {
        width: 40px;
        height: 40px;
        font-size: 18px;
    }

    /* 모바일에서 왕관 위치 조정 - (40-36)/2 = 2px */
    .test-item .test-crown {
        margin-top: -2px;
    }

    .level-title,
    .test-title {
        font-size: 10px;
        max-width: 75px;
        line-height: 1.3;
    }
}

/* 반응형 - 작은 모바일 */
@media (max-width: 360px) {
    .level-item,
    .test-item {
        min-width: 75px;
    }

    /* 작은 모바일에서 level-circle 32px, 중심은 16px */
    .connection-line {
        top: calc(var(--spacing-xs) + 16px);
        left: calc(-50% - var(--spacing-xs) / 2);
        width: calc(100% + var(--spacing-xs));
    }

    .final-line {
        top: calc(var(--spacing-xs) + 16px);
        left: calc(-50% - var(--spacing-xs) / 2);
        width: calc(100% + var(--spacing-xs));
    }

    .level-circle {
        width: 32px;
        height: 32px;
        font-size: 12px;
    }

    .test-crown {
        width: 36px;
        height: 36px;
        font-size: 16px;
    }

    /* 작은 모바일에서 왕관 위치 조정 - (36-32)/2 = 2px */
    .test-item .test-crown {
        margin-top: -2px;
    }

    .level-title,
    .test-title {
        font-size: 9px;
        max-width: 65px;
    }
}

/* 가로 스크롤 힌트 애니메이션 */
@media (max-width: 768px) {
    .level-progress::after {
        content: "";
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 40px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8));
        pointer-events: none;
    }
}
</style>
