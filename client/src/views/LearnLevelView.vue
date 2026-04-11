<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLearningStore } from "@/stores/useLearningStore";
import { useI18n } from "vue-i18n";
import AppHeader from "@/components/common/AppHeader.vue";
import CommonButton from "@/components/common/CommonButton.vue";
import CommonCard from "@/components/common/CommonCard.vue";
import axios from "axios";

// 각 레벨별 JSON 파일 import
import beginnerLevel1 from "@/data/beginner_1.json";
import beginnerLevel2 from "@/data/beginner_2.json";
import beginnerLevel3 from "@/data/beginner_3.json";
import beginnerLevel4 from "@/data/beginner_4.json";
import beginnerLevel5 from "@/data/beginner_5.json";
import intermediateLevel1 from "@/data/intermediate_1.json";
import intermediateLevel2 from "@/data/intermediate_2.json";
import intermediateLevel3 from "@/data/intermediate_3.json";
import intermediateLevel4 from "@/data/intermediate_4.json";
import intermediateLevel5 from "@/data/intermediate_5.json";
import advancedLevel1 from "@/data/advanced_1.json";
import advancedLevel2 from "@/data/advanced_2.json";
import advancedLevel3 from "@/data/advanced_3.json";
import advancedLevel4 from "@/data/advanced_4.json";
import advancedLevel5 from "@/data/advanced_5.json";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const learningStore = useLearningStore();
const { t, locale } = useI18n();

// URL 파라미터에서 카테고리와 레벨 가져오기
const category = ref(route.params.category);
const level = ref(parseInt(route.params.level));

// 학습 상태 관리
const isLearningStarted = ref(false);
const currentStepIndex = ref(0); // 0부터 시작
const isLearningCompleted = ref(false);
const startTime = ref(null); // 학습 시작 시간 추적

// 중간저장 관련
const hasSavedProgress = ref(false);
const savedProgressData = ref(null);
const showResumeDialog = ref(false);

// 퀴즈 상태
const selectedAnswer = ref(null);
const showQuizResult = ref(false);
const quizScore = ref(0);
const currentQuizIndex = ref(0);

// 각 퀴즈 문제의 답변 상태 저장 (문제 인덱스별로 저장)
const quizAnswersHistory = ref({});

// 완료된 단계 추적
const completedSteps = ref([]);

// 전체 레벨 진행도 (DB에서 가져옴)
const allLevelsProgress = ref({
    beginner: [false, false, false, false, false],
    intermediate: [false, false, false, false, false],
    advanced: [false, false, false, false, false],
});

// 레벨 데이터 (LearnView와 동일한 구조)
const levelData = {
    beginner: {
        title: "초급",
        subtitle: "자기소개, 인사, 생활 필수 표현",
        color: "#3182F6",
        levels: ["기본 인사와 자기소개", "숫자와 시간 표현", "장소와 위치", "일상 생활 회화", "감정·기분 표현"],
    },
    intermediate: {
        title: "중급",
        subtitle: "일상 대화 확장, 간단한 의견 표현",
        color: "#3182F6",
        levels: ["가족·친구 소개", "날씨와 계절", "취미와 여가 활동", "병원·건강 표현", "간단한 의견·감정 표현"],
    },
    advanced: {
        title: "상급",
        subtitle: "간단한 사회적 대화, 의견 교환",
        color: "#3182F6",
        levels: ["길 묻기와 안내하기", "직장·업무 관련 표현", "문화·명절·사회생활", "문제 상황 대처", "자기 생각·희망 표현"],
    },
};

// 레벨별 학습 데이터 매핑
const lessonDataMap = {
    beginner: {
        1: beginnerLevel1,
        2: beginnerLevel2,
        3: beginnerLevel3,
        4: beginnerLevel4,
        5: beginnerLevel5,
    },
    intermediate: {
        1: intermediateLevel1,
        2: intermediateLevel2,
        3: intermediateLevel3,
        4: intermediateLevel4,
        5: intermediateLevel5,
    },
    advanced: {
        1: advancedLevel1,
        2: advancedLevel2,
        3: advancedLevel3,
        4: advancedLevel4,
        5: advancedLevel5,
    },
};

// JSON 데이터에서 현재 레벨의 학습 데이터 가져오기
const currentLevelLessonData = computed(() => {
    const categoryData = lessonDataMap[category.value];
    if (!categoryData) {
        return null;
    }
    return categoryData[level.value] || null;
});

// 총 단계 수
const totalSteps = computed(() => {
    return currentLevelLessonData.value?.totalSteps || 0;
});

// 현재 단계의 레슨 데이터
const currentLesson = computed(() => {
    if (!currentLevelLessonData.value || !currentLevelLessonData.value.lessons) {
        return null;
    }
    // JSON 파일의 데이터를 그대로 사용 (챕터별 복습 퀴즈는 AI 생성 없이 기존 데이터 사용)
    return currentLevelLessonData.value.lessons[currentStepIndex.value];
});

// 현재 레벨 정보 계산
const currentLevelData = computed(() => {
    return levelData[category.value];
});

const currentLevelTitle = computed(() => {
    if (!currentLevelData.value || !currentLevelData.value.levels[level.value - 1]) {
        return "레벨을 찾을 수 없습니다";
    }
    return currentLevelData.value.levels[level.value - 1];
});

// 레벨 설명 (subtitle) - 언어별
const currentSubtitle = computed(() => {
    if (!currentLevelLessonData.value) return "";
    return locale.value === "en"
        ? currentLevelLessonData.value.subtitleEn || currentLevelLessonData.value.subtitle
        : currentLevelLessonData.value.subtitle;
});

// 유효성 검사
const isValidLevel = computed(() => {
    return currentLevelData.value && level.value >= 1 && level.value <= currentLevelData.value.levels.length;
});

// 퀴즈 총 문제 수
const totalQuizQuestions = computed(() => {
    const quizLesson = currentLevelLessonData.value?.lessons?.find((l) => l.type === "quiz");
    return quizLesson?.quiz?.questions?.length || 5;
});

// 퀴즈 정답률
const quizAccuracy = computed(() => {
    if (totalQuizQuestions.value === 0) return 0;
    return Math.round((quizScore.value / totalQuizQuestions.value) * 100);
});

// 퀴즈 합격 여부 (80% 이상)
const isQuizPassed = computed(() => {
    return quizAccuracy.value >= 80;
});

// 언어별 표시 텍스트 (한영 토글)
const currentExplanation = computed(() => {
    if (!currentLesson.value?.expression) return "";
    return locale.value === "en"
        ? currentLesson.value.expression.explanationEn || currentLesson.value.expression.explanation
        : currentLesson.value.expression.explanation;
});

const currentWhenToUse = computed(() => {
    if (!currentLesson.value?.expression) return "";
    return locale.value === "en"
        ? currentLesson.value.expression.whenToUseEn || currentLesson.value.expression.whenToUse
        : currentLesson.value.expression.whenToUse;
});

const currentCulturalTip = computed(() => {
    if (!currentLesson.value?.expression) return "";
    return locale.value === "en"
        ? currentLesson.value.expression.culturalTipEn || currentLesson.value.expression.culturalTip
        : currentLesson.value.expression.culturalTip;
});

// 진행률 계산
const progressPercentage = computed(() => {
    if (totalSteps.value === 0) return 0;
    return Math.round(((currentStepIndex.value + 1) / totalSteps.value) * 100);
});

// 다음 단계로 진행 가능 여부 체크
const canProceedToNext = computed(() => {
    // 퀴즈 타입인 경우 답을 선택해야 진행 가능
    if (currentLesson.value?.type === "quiz") {
        return showQuizResult.value;
    }
    // 일반 학습은 항상 진행 가능
    return true;
});

// 뒤로가기
const goBack = () => {
    if (isLearningCompleted.value) {
        router.push({ name: "learn" });
    } else if (isLearningStarted.value) {
        isLearningStarted.value = false;
        currentStepIndex.value = 0;
        completedSteps.value = []; // 진도 초기화
        quizAnswersHistory.value = {}; // 퀴즈 답변 히스토리 초기화
    } else {
        router.push({ name: "learn" });
    }
};

// DB에서 전체 레벨 진행도 가져오기
const fetchAllLevelsProgress = async () => {
    try {
        const response = await axios.get("/api/learning/level-progress", {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });

        if (response.data.success) {
            allLevelsProgress.value = response.data.progress;
        }
    } catch (error) {
        console.error("Failed to fetch all levels progress:", error);
    }
};

// 중간 저장된 진행 상황 확인
const checkSavedProgress = async () => {
    if (!authStore.isLoggedIn || !authStore.token) {
        return;
    }

    try {
        const response = await axios.get(`/api/progress-save/get/${category.value}/${level.value}/lesson`, {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });

        if (response.data.success && response.data.hasSave) {
            hasSavedProgress.value = true;
            savedProgressData.value = response.data.data;
            showResumeDialog.value = true;
        }
    } catch (error) {
        console.error("저장된 진행 상황 확인 실패:", error);
    }
};

// 저장된 위치에서 이어하기
const resumeFromSave = () => {
    if (savedProgressData.value) {
        isLearningStarted.value = true;
        currentStepIndex.value = savedProgressData.value.currentPage;

        // 저장된 추가 데이터가 있으면 복원
        if (savedProgressData.value.savedData) {
            quizScore.value = savedProgressData.value.savedData.quizScore || 0;
            currentQuizIndex.value = savedProgressData.value.savedData.currentQuizIndex || 0;
            completedSteps.value = savedProgressData.value.savedData.completedSteps || [];
        }

        startTime.value = Date.now();
        showResumeDialog.value = false;

        console.log(`✅ ${currentStepIndex.value + 1}페이지부터 학습 재개`);
    }
};

// 처음부터 다시 시작
const startFromBeginning = async () => {
    // 저장된 진행 상황 삭제
    if (authStore.isLoggedIn && authStore.token) {
        try {
            await axios.delete(`/api/progress-save/delete/${category.value}/${level.value}/lesson`, {
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            });
        } catch (error) {
            console.error("저장된 진행 상황 삭제 실패:", error);
        }
    }

    showResumeDialog.value = false;
    hasSavedProgress.value = false;
    savedProgressData.value = null;
    startLesson();
};

// 학습 진행 상황 자동 저장
const saveProgress = async () => {
    if (!authStore.isLoggedIn || !authStore.token || !isLearningStarted.value) {
        return;
    }

    try {
        await axios.post(
            "/api/progress-save/save",
            {
                category: category.value,
                level: level.value,
                type: "lesson",
                currentPage: currentStepIndex.value,
                totalPages: totalSteps.value,
                savedData: {
                    quizScore: quizScore.value,
                    currentQuizIndex: currentQuizIndex.value,
                    completedSteps: completedSteps.value,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            }
        );
        console.log(`💾 진행 상황 자동 저장 완료 (${currentStepIndex.value + 1}/${totalSteps.value})`);
    } catch (error) {
        console.error("진행 상황 저장 실패:", error);
    }
};

// 저장된 진행 상황 삭제 (완료 시)
const clearSavedProgress = async () => {
    if (!authStore.isLoggedIn || !authStore.token) {
        return;
    }

    try {
        await axios.delete(`/api/progress-save/delete/${category.value}/${level.value}/lesson`, {
            headers: {
                Authorization: `Bearer ${authStore.token}`,
            },
        });
        console.log("✅ 저장된 진행 상황 삭제 완료");
    } catch (error) {
        console.error("저장된 진행 상황 삭제 실패:", error);
    }
};

// 학습 시작
const startLesson = async () => {
    console.log(`${category.value} ${level.value}단계 학습 시작`);
    isLearningStarted.value = true;
    currentStepIndex.value = 0;
    completedSteps.value = []; // 진도 초기화
    quizScore.value = 0; // 퀴즈 점수 초기화
    quizAnswersHistory.value = {}; // 퀴즈 답변 히스토리 초기화
    startTime.value = Date.now(); // 시작 시간 기록

    // 스크롤 포커스 상단 이동
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    // DB에 학습 시작 기록
    try {
        await axios.post(
            "/api/learning/start-level",
            {
                category: category.value,
                level: level.value,
            },
            {
                headers: {
                    Authorization: `Bearer ${authStore.token}`,
                },
            }
        );
    } catch (error) {
        console.error("Failed to record level start:", error);
    }
};

// 다음 단계로 이동
const nextStep = async () => {
    // 진행 가능 여부 체크
    if (!canProceedToNext.value) {
        return;
    }

    // 현재 단계를 완료 목록에 추가
    if (!completedSteps.value.includes(currentStepIndex.value)) {
        completedSteps.value.push(currentStepIndex.value);
    }

    if (currentLesson.value?.type === "quiz") {
        // 퀴즈 타입인 경우
        if (currentQuizIndex.value < currentLesson.value.quiz.questions.length - 1) {
            // 다음 문제로
            currentQuizIndex.value++;

            // 다음 문제에 저장된 답변이 있으면 복원
            const savedAnswer = quizAnswersHistory.value[currentQuizIndex.value];
            if (savedAnswer !== undefined) {
                selectedAnswer.value = savedAnswer;
                showQuizResult.value = true;
            } else {
                selectedAnswer.value = null;
                showQuizResult.value = false;
            }
        } else {
            // 퀴즈 완료
            completeLesson();
            return;
        }
    } else {
        // 일반 학습 타입
        if (currentStepIndex.value < totalSteps.value - 1) {
            currentStepIndex.value++;
            selectedAnswer.value = null;
            showQuizResult.value = false;
            currentQuizIndex.value = 0;
        } else {
            completeLesson();
            return;
        }
    }

    // 진행 상황 자동 저장
    await saveProgress();

    // 맨 위로 스크롤 (진행 상황 바가 보이도록)
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// 이전 단계로 이동
const prevStep = () => {
    if (currentLesson.value?.type === "quiz" && currentQuizIndex.value > 0) {
        // 퀴즈 내에서 이전 문제로 이동
        currentQuizIndex.value--;

        // 이전에 저장된 답변이 있으면 복원
        const savedAnswer = quizAnswersHistory.value[currentQuizIndex.value];
        if (savedAnswer !== undefined) {
            selectedAnswer.value = savedAnswer;
            showQuizResult.value = true;
        } else {
            selectedAnswer.value = null;
            showQuizResult.value = false;
        }
    } else if (currentLesson.value?.type === "quiz" && currentQuizIndex.value === 0) {
        // 퀴즈의 첫 번째 문제인 경우 이전 학습 내용으로 돌아가지 못하도록 차단
        return;
    } else if (currentStepIndex.value > 0) {
        currentStepIndex.value--;
        selectedAnswer.value = null;
        showQuizResult.value = false;
        currentQuizIndex.value = 0;
    }

    // 맨 위로 스크롤 (진행 상황 바가 보이도록)
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// 퀴즈 답안 선택
const selectAnswer = async (optionIndex) => {
    // 이미 답변한 문제인 경우 다시 선택하지 못하도록 방지
    if (quizAnswersHistory.value[currentQuizIndex.value] !== undefined) {
        return;
    }

    selectedAnswer.value = optionIndex;
    showQuizResult.value = true;

    // 답변을 히스토리에 저장
    quizAnswersHistory.value[currentQuizIndex.value] = optionIndex;

    // 정답인 경우 점수 증가
    const currentQuestion = currentLesson.value.quiz.questions[currentQuizIndex.value];
    if (optionIndex === currentQuestion.correctAnswer) {
        quizScore.value++;
    } else {
        // 오답인 경우 저장 (로그인한 경우에만)
        if (authStore.isLoggedIn && authStore.token) {
            try {
                await axios.post(
                    "/api/wrong-answers/save",
                    {
                        category: category.value,
                        level: level.value,
                        questionType: "quiz",
                        question: currentQuestion.question,
                        questionEn: currentQuestion.questionEn,
                        correctAnswer: currentQuestion.options[currentQuestion.correctAnswer],
                        userAnswer: currentQuestion.options[optionIndex],
                        options: currentQuestion.options,
                        explanation: currentQuestion.explanation,
                        explanationEn: currentQuestion.explanationEn,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${authStore.token}`,
                        },
                    }
                );
                console.log("✅ 오답 저장 성공");
            } catch (error) {
                console.error("❌ 오답 저장 실패:", error);
            }
        }
    }
};

// 학습 완료
const completeLesson = async () => {
    console.log(`${category.value} ${level.value}단계 학습 완료`);
    isLearningCompleted.value = true;

    // 스크롤 포커스 상단 이동
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);

    // 학습 시간 계산 (초 단위)
    const timeSpent = startTime.value ? Math.floor((Date.now() - startTime.value) / 1000) : 0;

    // 퀴즈 합격 여부 확인 (80% 이상)
    if (!isQuizPassed.value) {
        console.log(`⚠️ 퀴즈 불합격 (정답률: ${quizAccuracy.value}%) - 다시 학습이 필요합니다.`);
        return;
    }

    // 🆕 오늘의 목표 미션 자동 완료
    try {
        await learningStore.completeLesson();
        console.log('✅ 오늘의 목표 "레슨 완료하기" 미션 체크 완료');
    } catch (error) {
        console.error("❌ 미션 완료 처리 실패:", error);
    }

    // DB에 레벨 완료 기록 (로그인한 경우이고, 퀴즈를 합격한 경우에만)
    if (authStore.isLoggedIn && authStore.token) {
        try {
            const response = await axios.post(
                "/api/learning/complete-level",
                {
                    category: category.value,
                    level: level.value,
                    quizScore: quizScore.value,
                    timeSpent: timeSpent,
                },
                {
                    headers: {
                        Authorization: `Bearer ${authStore.token}`,
                    },
                }
            );

            console.log(`✅ 레벨 완료 기록 성공 - 점수: ${quizScore.value}, 시간: ${timeSpent}초`, response.data);

            // 학습 완료 시 저장된 진행 상황 삭제
            await clearSavedProgress();
        } catch (error) {
            console.error("❌ 레벨 완료 기록 실패:", error.response?.data || error.message);
            console.log("서버 응답:", error.response);
        }
    } else {
        console.log("⚠️ 로그인하지 않아 학습 진도가 저장되지 않습니다.");
    }
};

// 학습 목록으로 돌아가기
const returnToLearning = () => {
    router.push({ name: "learn" });
    // 스크롤 포커스 상단 이동
    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
};

// 다시 학습하기
const retryLesson = () => {
    isLearningStarted.value = false;
    isLearningCompleted.value = false;
    currentStepIndex.value = 0;
    completedSteps.value = [];
    quizScore.value = 0;
    quizAnswersHistory.value = {}; // 퀴즈 답변 히스토리 초기화
    selectedAnswer.value = null;
    showQuizResult.value = false;
    currentQuizIndex.value = 0;
    window.scrollTo({ top: 0, behavior: "smooth" });
};

// 페이지 마운트 시 유효성 검사 및 진행도 가져오기
onMounted(async () => {
    console.log("현재 파라미터:", { category: category.value, level: level.value });
    console.log("레벨 데이터:", currentLevelData.value);
    console.log("유효성:", isValidLevel.value);

    if (!isValidLevel.value) {
        console.warn("유효하지 않은 레벨입니다. 학습 페이지로 이동합니다.");
        router.replace({ name: "learn" });
        return;
    }

    // 전체 레벨 진행도 가져오기
    await fetchAllLevelsProgress();

    // 저장된 진행 상황 확인
    await checkSavedProgress();
});

// 라우트 파라미터 변경 감지
watch(
    () => route.params,
    (newParams) => {
        category.value = newParams.category;
        level.value = parseInt(newParams.level);

        if (!isValidLevel.value) {
            router.replace({ name: "learn" });
        }
    }
);
</script>

<template>
    <div class="common-page learn-level-page">
        <!-- Header Component -->
        <AppHeader />

        <div class="common-container">
            <!-- 유효하지 않은 레벨인 경우 로딩 표시 -->
            <div v-if="!isValidLevel" class="loading-container">
                <p>올바르지 않은 레벨입니다. 학습 페이지로 이동합니다...</p>
            </div>

            <!-- 유효한 레벨인 경우 컨텐츠 표시 -->
            <template v-else>
                <!-- 이어하기 다이얼로그 -->
                <div v-if="showResumeDialog" class="resume-dialog-overlay">
                    <div class="resume-dialog">
                        <div class="resume-dialog-header">
                            <h2 class="common-title2">💾 저장된 학습 진행 상황</h2>
                        </div>
                        <div class="resume-dialog-body">
                            <p class="common-body1">
                                이전에 학습하던 내용이 있습니다.<br />
                                <strong>{{ savedProgressData?.currentPage + 1 }}페이지</strong>부터 이어서 학습하시겠습니까?
                            </p>
                            <div class="resume-progress-info">
                                <span class="progress-label">진행률:</span>
                                <span class="progress-value">
                                    {{ savedProgressData?.currentPage + 1 }} / {{ savedProgressData?.totalPages }} ({{
                                        Math.round(((savedProgressData?.currentPage + 1) / savedProgressData?.totalPages) * 100)
                                    }}%)
                                </span>
                            </div>
                        </div>
                        <div class="resume-dialog-actions">
                            <CommonButton variant="secondary" @click="startFromBeginning" fullWidth> 처음부터 시작 </CommonButton>
                            <CommonButton variant="primary" @click="resumeFromSave" fullWidth> 이어서 학습하기 </CommonButton>
                        </div>
                    </div>
                </div>

                <!-- 학습 시작 전 화면 -->
                <div v-if="!isLearningStarted" class="intro-view">
                    <!-- 뒤로가기 버튼 -->
                    <div class="intro-header">
                        <CommonButton variant="ghost" @click="goBack" class="back-btn">
                            {{ t("learnLevel.intro.back") }}
                        </CommonButton>
                    </div>

                    <CommonCard class="intro-card">
                        <!-- 레벨 정보 -->
                        <div class="level-info">
                            <div class="level-badge-group">
                                <span class="category-badge">{{ t(`learn.${category}.title`) }}</span>
                                <span class="level-number-badge">{{ t("learnLevel.intro.levelBadge", { level }) }}</span>
                            </div>

                            <h1 class="common-title1 level-title">{{ currentLevelTitle }}</h1>
                            <p class="common-body1 level-subtitle">{{ currentSubtitle }}</p>
                        </div>

                        <!-- 학습 진도 시각화 -->
                        <div v-if="currentLevelData?.levels" class="lesson-progress-viz">
                            <h3 class="progress-viz-title">{{ currentLevelData.title }} 전체 진행도</h3>
                            <div class="progress-steps">
                                <div v-for="(levelTitle, index) in currentLevelData.levels" :key="index" class="progress-step-item">
                                    <!-- 연결선 (첫 번째 제외) -->
                                    <div
                                        v-if="index > 0"
                                        class="step-connection-line"
                                        :class="{
                                            completed: allLevelsProgress[category][index - 1] && allLevelsProgress[category][index],
                                            active:
                                                allLevelsProgress[category][index - 1] && !allLevelsProgress[category][index] && index === level - 1,
                                        }"
                                    ></div>

                                    <!-- 단계 원 -->
                                    <div
                                        class="progress-step-circle"
                                        :class="{
                                            completed: allLevelsProgress[category][index],
                                            current: index === level - 1 && !allLevelsProgress[category][index],
                                            available: !allLevelsProgress[category][index] && (index === 0 || allLevelsProgress[category][index - 1]),
                                        }"
                                    >
                                        <span v-if="allLevelsProgress[category][index]" class="step-icon">✓</span>
                                        <span v-else-if="index === level - 1" class="step-icon">📍</span>
                                        <span v-else class="step-number">{{ index + 1 }}</span>
                                    </div>

                                    <!-- 단계 제목 -->
                                    <div class="progress-step-title" :class="{ 'current-level': index === level - 1 }">
                                        {{ levelTitle }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 학습 정보 -->
                        <div class="lesson-info">
                            <div class="info-item">
                                <span class="info-icon">📚</span>
                                <span class="info-text">{{ t("learnLevel.intro.lessonCount", { count: totalSteps }) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">⏱️</span>
                                <span class="info-text">{{ t("learnLevel.intro.estimatedTime", { minutes: totalSteps * 2 }) }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">🎯</span>
                                <span class="info-text">{{ t("learnLevel.intro.includesQuiz") }}</span>
                            </div>
                        </div>

                        <!-- 시작 버튼 -->
                        <CommonButton variant="primary" @click="startLesson" class="start-button">
                            {{ t("learnLevel.intro.start") }}
                        </CommonButton>
                    </CommonCard>
                </div>

                <!-- 학습 중 화면 -->
                <div v-else-if="isLearningStarted && !isLearningCompleted" class="learning-view">
                    <!-- 진행 상황 표시 (상단 고정) -->
                    <div class="progress-header-wrapper">
                        <div class="progress-header">
                            <CommonButton variant="ghost" @click="goBack" class="back-btn"> ← 돌아가기 </CommonButton>
                            <div class="progress-info">
                                <span class="progress-text">{{ currentStepIndex + 1 }} / {{ totalSteps }}</span>
                                <div class="progress-bar">
                                    <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 학습 컨텐츠 영역 (flex-grow로 공간 차지) -->
                    <div class="content-wrapper">
                        <!-- 학습 컨텐츠 -->
                        <div v-if="currentLesson" class="lesson-container">
                            <!-- 단일 표현 학습 -->
                            <CommonCard v-if="currentLesson.type === 'single_expression'" class="expression-card">
                                <div class="expression-content">
                                    <!-- 왼쪽: 메인 표현 -->
                                    <div class="content-left">
                                        <!-- 한국어 표현 -->
                                        <div class="korean-section">
                                            <h2 class="korean-text">{{ currentLesson.expression.korean }}</h2>
                                            <p class="romanization">{{ currentLesson.expression.romanization }}</p>
                                            <p class="meaning">{{ currentLesson.expression.meaning }}</p>
                                            <p v-if="currentLesson.expression.meaningVi" class="meaning-vi">
                                                {{ currentLesson.expression.meaningVi }}
                                            </p>
                                        </div>

                                        <!-- 설명 -->
                                        <div class="explanation-section">
                                            <h3 class="section-title">📖 설명</h3>
                                            <p class="explanation-text">{{ currentExplanation }}</p>
                                        </div>

                                        <!-- 언제 사용하나요? -->
                                        <div class="when-to-use-section">
                                            <h3 class="section-title">💡 언제 사용하나요?</h3>
                                            <p class="when-to-use-text">{{ currentWhenToUse }}</p>
                                        </div>
                                    </div>

                                    <!-- 오른쪽: 예문과 팁 -->
                                    <div class="content-right">
                                        <!-- 예문 -->
                                        <div class="examples-section">
                                            <h3 class="section-title">✏️ 예문</h3>
                                            <div class="examples-list">
                                                <CommonCard
                                                    v-for="(example, index) in currentLesson.expression.examples"
                                                    :key="index"
                                                    variant="outline"
                                                    class="example-item"
                                                >
                                                    <p class="example-korean">{{ example.korean }}</p>
                                                    <p class="example-romanization">{{ example.romanization }}</p>
                                                    <p class="example-meaning">{{ example.meaning }}</p>
                                                    <p v-if="example.meaningVi" class="example-meaning-vi">{{ example.meaningVi }}</p>
                                                </CommonCard>
                                            </div>
                                        </div>

                                        <!-- 문화 팁 -->
                                        <div class="cultural-tip-section">
                                            <div class="cultural-tip">
                                                <span class="tip-icon">💭</span>
                                                <div class="tip-content">
                                                    <p class="tip-text">{{ currentCulturalTip }}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CommonCard>

                            <!-- 퀴즈 -->
                            <CommonCard v-else-if="currentLesson?.type === 'quiz'" class="quiz-card">
                                <div class="quiz-content">
                                    <div class="quiz-header">
                                        <h2 class="quiz-title">{{ currentLesson.quiz.title }}</h2>
                                        <p class="quiz-description">{{ currentLesson.quiz.description }}</p>
                                        <div class="quiz-info">
                                            <span class="quiz-progress"
                                                >문제 {{ currentQuizIndex + 1 }} / {{ currentLesson.quiz.questions.length }}</span
                                            >
                                        </div>
                                        <div v-if="currentQuizIndex > 0 || showQuizResult" class="quiz-stats">
                                            <div class="stat-badge correct-badge">
                                                <span class="stat-icon">✅</span>
                                                <span class="stat-text">정답 {{ quizScore }}</span>
                                            </div>
                                            <div class="stat-badge wrong-badge">
                                                <span class="stat-icon">❌</span>
                                                <span class="stat-text"
                                                    >오답 {{ Math.max(0, currentQuizIndex + (showQuizResult ? 1 : 0) - quizScore) }}</span
                                                >
                                            </div>
                                        </div>
                                    </div>

                                    <div class="quiz-question-section">
                                        <h3 class="question-text">
                                            {{ currentLesson.quiz.questions[currentQuizIndex].question }}
                                        </h3>
                                        <p v-if="currentLesson.quiz.questions[currentQuizIndex].questionEn" class="question-text-en">
                                            {{ currentLesson.quiz.questions[currentQuizIndex].questionEn }}
                                        </p>

                                        <div class="options-list">
                                            <CommonButton
                                                v-for="(option, index) in currentLesson.quiz.questions[currentQuizIndex].options"
                                                :key="index"
                                                :variant="
                                                    selectedAnswer === index
                                                        ? index === currentLesson.quiz.questions[currentQuizIndex].correctAnswer
                                                            ? 'primary'
                                                            : 'danger'
                                                        : 'outline'
                                                "
                                                @click="selectAnswer(index)"
                                                :disabled="showQuizResult"
                                                class="option-button"
                                            >
                                                {{ option }}
                                            </CommonButton>
                                        </div>

                                        <!-- 정답 설명 -->
                                        <div v-if="showQuizResult" class="quiz-result">
                                            <div
                                                class="result-message"
                                                :class="
                                                    selectedAnswer === currentLesson.quiz.questions[currentQuizIndex].correctAnswer
                                                        ? 'correct'
                                                        : 'incorrect'
                                                "
                                            >
                                                <span v-if="selectedAnswer === currentLesson.quiz.questions[currentQuizIndex].correctAnswer">
                                                    ✅ 정답입니다!
                                                </span>
                                                <span v-else>
                                                    ❌ 틀렸습니다. 정답은 "{{
                                                        currentLesson.quiz.questions[currentQuizIndex].options[
                                                            currentLesson.quiz.questions[currentQuizIndex].correctAnswer
                                                        ]
                                                    }}"입니다.
                                                </span>
                                            </div>
                                            <p class="result-explanation">
                                                {{ currentLesson.quiz.questions[currentQuizIndex].explanation }}
                                            </p>
                                            <p v-if="currentLesson.quiz.questions[currentQuizIndex].explanationEn" class="result-explanation-en">
                                                {{ currentLesson.quiz.questions[currentQuizIndex].explanationEn }}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CommonCard>
                        </div>
                    </div>

                    <!-- 네비게이션 버튼 (화면 하단 고정) -->
                    <div class="navigation-buttons-wrapper">
                        <div class="navigation-buttons">
                            <CommonButton
                                variant="outline"
                                @click="prevStep"
                                :disabled="
                                    !currentLesson ||
                                    (currentStepIndex === 0 && currentQuizIndex === 0) ||
                                    (currentLesson?.type === 'quiz' && currentQuizIndex === 0)
                                "
                                class="nav-btn"
                            >
                                ← 이전
                            </CommonButton>

                            <CommonButton variant="primary" @click="nextStep" :disabled="!currentLesson || !canProceedToNext" class="nav-btn">
                                {{
                                    currentLesson?.type === "quiz" && currentQuizIndex < currentLesson.quiz.questions.length - 1
                                        ? "다음 문제"
                                        : currentStepIndex === totalSteps - 1 &&
                                            (currentLesson?.type !== "quiz" || currentQuizIndex === currentLesson.quiz.questions.length - 1)
                                          ? "학습 완료"
                                          : "다음"
                                }}
                                →
                            </CommonButton>
                        </div>
                    </div>
                </div>

                <!-- 학습 완료 화면 -->
                <div v-else-if="isLearningCompleted" class="completion-view">
                    <CommonCard class="completion-card">
                        <div class="completion-content">
                            <!-- 합격 시 -->
                            <template v-if="isQuizPassed">
                                <div class="completion-icon">🎉</div>
                                <h1 class="common-title1 completion-title">{{ t("learn.completion.title") }}</h1>
                                <p class="common-body1 completion-subtitle">
                                    {{
                                        t("learn.completion.subtitle", {
                                            category: t(`learn.${category}.title`),
                                            level: level,
                                            title: currentLevelTitle,
                                        })
                                    }}
                                </p>
                            </template>

                            <!-- 불합격 시 -->
                            <template v-else>
                                <div class="completion-icon">📚</div>
                                <h1 class="common-title1 completion-title" style="color: #dc2626">{{ t("learn.completion.retryTitle") }}</h1>
                                <p class="common-body1 completion-subtitle">
                                    {{ t("learn.completion.retrySubtitle") }}
                                </p>
                            </template>

                            <div class="completion-stats">
                                <div class="stat-item">
                                    <div class="stat-number">{{ totalSteps }}</div>
                                    <div class="stat-label">{{ t("learn.completion.stats.lessonsCompleted") }}</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-number">{{ quizScore }} / {{ totalQuizQuestions }}</div>
                                    <div class="stat-label">{{ t("learn.completion.stats.quizScore") }}</div>
                                </div>
                                <div class="stat-item" :class="{ 'stat-failed': !isQuizPassed }">
                                    <div class="stat-number">{{ quizAccuracy }}%</div>
                                    <div class="stat-label">{{ t("learn.completion.stats.accuracy") }}</div>
                                </div>
                            </div>

                            <!-- 합격 시: 학습 목록으로 -->
                            <CommonButton v-if="isQuizPassed" variant="primary" @click="returnToLearning" class="return-button">
                                {{ t("learn.completion.returnToList") }}
                            </CommonButton>

                            <!-- 불합격 시: 다시 학습하기 -->
                            <div v-else class="retry-buttons">
                                <CommonButton variant="primary" @click="retryLesson" class="retry-button">
                                    {{ t("learn.completion.retry") }}
                                </CommonButton>
                                <CommonButton variant="outline" @click="returnToLearning" class="return-button-secondary">
                                    {{ t("learn.completion.returnToList") }}
                                </CommonButton>
                            </div>
                        </div>
                    </CommonCard>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
/* 기본 스타일 */
.learn-level-page {
    min-height: 100vh;
    background: #f8fafc;
}

.common-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-lg);
}

/* 데스크톱: 더 넓은 컨테이너 */
@media (min-width: 1024px) {
    .common-container {
        max-width: 1200px;
    }

    .progress-header {
        max-width: 1200px;
    }

    .navigation-buttons {
        max-width: 1200px;
    }
}

/* 로딩 */
.loading-container {
    text-align: center;
    padding: var(--spacing-xl);
    color: #6b7280;
}

/* 인트로 화면 */
.intro-view {
    padding: var(--spacing-xl) 0;
}

.intro-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.intro-card {
    text-align: center;
    padding: var(--spacing-xl);
}

.level-info {
    margin-bottom: var(--spacing-xl);
}

.level-badge-group {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.category-badge {
    background: #3182f6;
    color: white;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.level-number-badge {
    background: #e0f2fe;
    color: #0369a1;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.level-title {
    margin: var(--spacing-md) 0;
    color: #1f2937;
}

.level-subtitle {
    color: #6b7280;
    margin: 0;
}

/* 학습 진도 시각화 */
.lesson-progress-viz {
    margin: var(--spacing-xl) 0;
    padding: var(--spacing-lg);
    background: #f9fafb;
    border-radius: 16px;
}

.progress-viz-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    text-align: center;
    margin: 0 0 var(--spacing-lg) 0;
}

.progress-steps {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
    padding: var(--spacing-md) 0;
}

.progress-step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    flex: 0 0 auto;
    min-width: 70px;
}

/* 연결선 */
.step-connection-line {
    position: absolute;
    top: 18px;
    left: -35px;
    width: 70px;
    height: 3px;
    background: #e5e7eb;
    transition: all 0.3s ease;
    z-index: 1;
}

.step-connection-line.completed {
    background: #3182f6;
}

.step-connection-line.active {
    background: #3182f6;
}

/* 단계 원 */
.progress-step-circle {
    width: 36px;
    height: 36px;
    border: 3px solid #e5e7eb;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: white;
    font-weight: 600;
    font-size: 13px;
    color: #6b7280;
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    margin-bottom: var(--spacing-xs);
}

.progress-step-circle.completed {
    border-color: #3182f6;
    background: #3182f6;
    color: white;
    animation: completePulse 0.5s ease-in-out;
}

.progress-step-circle.current {
    border-color: #3182f6;
    background: #3182f6;
    color: white;
    animation: pulse 2s ease-in-out infinite;
}

.progress-step-circle.available {
    border-color: #3182f6;
    border-width: 3px;
    background: white;
    color: #3182f6;
    box-shadow: 0 0 0 4px rgba(49, 130, 246, 0.15);
}

.step-icon {
    font-size: 16px;
}

.step-number {
    font-size: 13px;
}

/* 단계 제목 */
.progress-step-title {
    font-size: 11px;
    font-weight: 500;
    color: #6b7280;
    text-align: center;
    line-height: 1.3;
    max-width: 70px;
    word-break: keep-all;
}

.progress-step-title.current-level {
    color: #ec4899;
    font-weight: 600;
}

/* 애니메이션 */
@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 0 0 8px rgba(236, 72, 153, 0);
    }
}

@keyframes completePulse {
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

.lesson-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
}

.info-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    background: #f9fafb;
    border-radius: 8px;
}

.info-icon {
    font-size: 20px;
}

.info-text {
    font-size: 15px;
    color: #374151;
}

.start-button {
    width: 100%;
    max-width: 300px;
    padding: var(--spacing-md);
    font-size: 16px;
    font-weight: 600;
}

/* 학습 화면 */
.learning-view {
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 80px); /* 헤더 높이 제외 */
    padding: 0;
}

/* 진행 상황 바 래퍼 - 상단 고정 */
.progress-header-wrapper {
    position: sticky;
    top: 0;
    left: 0;
    right: 0;
    background: #f8fafc;
    z-index: 20;
    padding: var(--spacing-md) 0;
    margin: 0 calc(-1 * var(--spacing-lg));
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
}

.progress-header {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: var(--spacing-md);
    margin: 0;
    width: 100%;
}

/* 컨텐츠 래퍼 - flex-grow로 남은 공간 차지 */
.content-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    padding: var(--spacing-md) 0;
    margin-bottom: var(--spacing-xl);
}

.back-btn {
    flex-shrink: 0;
}

.progress-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    min-width: 0;
}

.progress-text {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    white-space: nowrap;
    flex-shrink: 0;
}

.progress-bar {
    flex: 1;
    height: 10px;
    background: #e5e7eb;
    border-radius: 5px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #3182f6;
    transition: width 0.3s ease;
}

.expression-card,
.quiz-card {
    padding: var(--spacing-xl);
    display: flex;
    flex-direction: column;
    flex: 1;
    border: none;
    box-shadow: none;
}

/* 학습 컨텐츠 */
.lesson-container {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.expression-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

/* 모바일: 세로 레이아웃 명시 */
.content-left,
.content-right {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    width: 100%;
}

/* 데스크톱: 2단 레이아웃 */
@media (min-width: 1024px) {
    .expression-content {
        flex-direction: row;
        gap: var(--spacing-xl);
        align-items: flex-start;
    }

    .content-left {
        flex: 1;
        min-width: 0; /* flexbox overflow 방지 */
    }

    .content-right {
        flex: 1;
        min-width: 0; /* flexbox overflow 방지 */
    }
}

.korean-section {
    text-align: center;
    padding: var(--spacing-xl);
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-radius: 16px;
}

.korean-text {
    font-size: 36px;
    font-weight: 700;
    color: #1e40af;
    margin: 0 0 var(--spacing-sm) 0;
}

.romanization {
    font-size: 18px;
    color: #3b82f6;
    font-style: italic;
    margin: 0 0 var(--spacing-sm) 0;
}

.meaning {
    font-size: 16px;
    color: #0369a1;
    font-weight: 600;
    margin: 0;
}

.meaning-vi {
    font-size: 14px;
    color: #059669;
    font-style: italic;
    margin: 4px 0 0 0;
    font-weight: 500;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 var(--spacing-md) 0;
}

.explanation-text,
.when-to-use-text {
    font-size: 15px;
    color: #374151;
    line-height: 1.6;
    margin: 0;
}

.explanation-text-vi,
.when-to-use-text-vi {
    font-size: 13px;
    color: #059669;
    line-height: 1.5;
    margin: 8px 0 0 0;
    font-style: italic;
}

.examples-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.example-item {
    padding: var(--spacing-md);
    text-align: left;
}

.example-korean {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 var(--spacing-xs) 0;
}

.example-romanization {
    font-size: 14px;
    color: #6b7280;
    font-style: italic;
    margin: 0 0 var(--spacing-xs) 0;
}

.example-meaning {
    font-size: 14px;
    color: #374151;
    margin: 0;
}

.example-meaning-vi {
    font-size: 12px;
    color: #059669;
    margin: 4px 0 0 0;
    font-style: italic;
}

.cultural-tip {
    display: flex;
    align-items: flex-start;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    border-radius: 12px;
    border: 2px solid #3182f6;
}

.tip-icon {
    font-size: 24px;
    flex-shrink: 0;
}

.tip-content {
    flex: 1;
}

.tip-text {
    font-size: 14px;
    color: #1e40af;
    line-height: 1.5;
    margin: 0;
}

.tip-text-vi {
    font-size: 12px;
    color: #059669;
    line-height: 1.4;
    margin: 6px 0 0 0;
    font-style: italic;
}

/* 퀴즈 */
.quiz-card {
    padding: var(--spacing-xl);
}

.quiz-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xl);
}

.quiz-header {
    text-align: center;
}

.quiz-title {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 var(--spacing-sm) 0;
}

.quiz-description {
    font-size: 15px;
    color: #6b7280;
    margin: 0 0 var(--spacing-md) 0;
}

.quiz-title-vi,
.quiz-description-vi {
    font-size: 13px;
    color: #059669;
    font-style: italic;
    margin: 4px 0 0 0;
}

.quiz-info {
    display: flex;
    justify-content: center;
    margin-bottom: var(--spacing-md);
}

.quiz-progress {
    font-size: 15px;
    font-weight: 600;
    color: #3182f6;
    background: #eff6ff;
    padding: 6px 16px;
    border-radius: 20px;
}

.quiz-stats {
    display: flex;
    justify-content: center;
    gap: var(--spacing-sm);
    flex-wrap: wrap;
}

.stat-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.correct-badge {
    background: #ecfdf5;
    color: #059669;
    border: 2px solid #d1fae5;
}

.wrong-badge {
    background: #fef2f2;
    color: #dc2626;
    border: 2px solid #fecaca;
}

.stat-icon {
    font-size: 16px;
}

.stat-text {
    font-size: 14px;
}

.question-text {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 var(--spacing-lg) 0;
    line-height: 1.5;
}

.question-text-en {
    font-size: 15px;
    color: #3182f6;
    font-style: italic;
    margin: 8px 0 var(--spacing-lg) 0;
    line-height: 1.4;
}

.options-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-lg);
}

.option-button {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 16px;
    text-align: left;
    justify-content: flex-start;
}

.quiz-result {
    padding: var(--spacing-md);
    background: #f9fafb;
    border-radius: 12px;
}

.result-message {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
}

.result-message.correct {
    color: #059669;
}

.result-message.incorrect {
    color: #dc2626;
}

.result-explanation {
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
    margin: 0;
}

.result-explanation-en {
    font-size: 13px;
    color: #3182f6;
    line-height: 1.4;
    margin: 6px 0 0 0;
    font-style: italic;
}

/* 네비게이션 버튼 래퍼 - 하단 고정 */
.navigation-buttons-wrapper {
    position: sticky;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, #f8fafc 0%, #f8fafc 80%, transparent 100%);
    padding: var(--spacing-xl) 0 var(--spacing-lg) 0;
    margin: 0 calc(-1 * var(--spacing-lg));
    padding-left: var(--spacing-lg);
    padding-right: var(--spacing-lg);
    z-index: 10;
}

/* 네비게이션 */
.navigation-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    max-width: 800px;
    margin: 0 auto;
}

.nav-btn {
    padding: var(--spacing-md);
    font-size: 15px;
    font-weight: 600;
}

/* 완료 화면 */
.completion-view {
    padding: var(--spacing-xl) 0;
}

.completion-card {
    padding: var(--spacing-xl);
    text-align: center;
}

.completion-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-md);
}

.completion-title {
    margin: var(--spacing-md) 0;
    color: #1f2937;
}

.completion-subtitle {
    color: #6b7280;
    margin: 0 0 var(--spacing-xl) 0;
}

.completion-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
}

.stat-item {
    padding: var(--spacing-md);
    background: #f9fafb;
    border-radius: 12px;
}

.stat-item.stat-failed {
    background: #fef2f2;
    border: 2px solid #fecaca;
}

.stat-item.stat-failed .stat-number {
    color: #dc2626;
}

.stat-number {
    font-size: 28px;
    font-weight: 700;
    color: #3182f6;
    margin-bottom: var(--spacing-xs);
    word-break: break-word;
}

.stat-label {
    font-size: 14px;
    color: #6b7280;
}

.retry-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
}

.retry-button {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 16px;
    font-weight: 600;
}

.return-button {
    width: 100%;
    max-width: 300px;
    padding: var(--spacing-md);
    font-size: 16px;
    font-weight: 600;
}

.return-button-secondary {
    width: 100%;
    padding: var(--spacing-md);
    font-size: 16px;
    font-weight: 600;
}

/* 반응형 */
@media (max-width: 640px) {
    .common-container {
        padding: var(--spacing-md);
    }

    .korean-text {
        font-size: 28px;
    }

    .romanization {
        font-size: 16px;
    }

    .meaning {
        font-size: 14px;
    }

    .progress-header-wrapper {
        padding: var(--spacing-sm) 0;
    }

    .progress-header {
        flex-direction: column;
        align-items: stretch;
        gap: var(--spacing-sm);
    }

    .progress-info {
        width: 100%;
        min-width: 0;
    }

    .progress-text {
        font-size: 13px;
        min-width: fit-content;
    }

    .progress-bar {
        min-width: 0;
    }

    .completion-stats {
        grid-template-columns: 1fr;
    }

    .stat-number {
        font-size: 24px;
    }

    .completion-icon {
        font-size: 48px;
    }
}

/* 이어하기 다이얼로그 스타일 */
.resume-dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--spacing-md);
}

.resume-dialog {
    background: white;
    border-radius: 16px;
    max-width: 480px;
    width: 100%;
    box-shadow:
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04);
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.resume-dialog-header {
    padding: var(--spacing-xl);
    border-bottom: 1px solid #e5e7eb;
    text-align: center;
}

.resume-dialog-header h2 {
    margin: 0;
    color: #1f2937;
}

.resume-dialog-body {
    padding: var(--spacing-xl);
    text-align: center;
}

.resume-dialog-body p {
    margin: 0 0 var(--spacing-lg) 0;
    color: #4b5563;
    line-height: 1.6;
}

.resume-progress-info {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.progress-label {
    font-size: 14px;
    color: #6b7280;
    font-weight: 500;
}

.progress-value {
    font-size: 16px;
    color: #3182f6;
    font-weight: 600;
}

.resume-dialog-actions {
    padding: var(--spacing-lg) var(--spacing-xl) var(--spacing-xl);
    display: flex;
    gap: var(--spacing-md);
}

@media (max-width: 768px) {
    .resume-dialog-actions {
        flex-direction: column;
    }
}
</style>
