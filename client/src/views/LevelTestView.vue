<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import CommonCard from "@/components/common/CommonCard.vue";
import CommonButton from "@/components/common/CommonButton.vue";
import CommonInput from "@/components/common/CommonInput.vue";
import LoadingDialog from "@/components/common/LoadingDialog.vue";

const router = useRouter();
const questions = ref([]);
const currentQuestionIndex = ref(0);
const answers = ref({});
const selectedAnswer = ref(null);
const shortAnswer = ref("");
const recording = ref(false);
const audioLoading = ref(false);
const recordingTime = ref(0);
const recordingTimer = ref(null);
const isSubmitting = ref(false);
const submissionProgress = ref(0);

// Audio recording variables
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value]);
const progress = computed(() => ((currentQuestionIndex.value + 1) / questions.value.length) * 100);
const isLastQuestion = computed(() => currentQuestionIndex.value === questions.value.length - 1);

const canProceed = computed(() => {
    if (!currentQuestion.value) return false;

    if (currentQuestion.value.choices) {
        return selectedAnswer.value !== null;
    }
    if (currentQuestion.value.questionType === "short_answer") {
        return shortAnswer.value.trim() !== "";
    }
    if (currentQuestion.value.questionType === "speaking") {
        return answers.value[currentQuestion.value.questionNumber] !== undefined;
    }
    return true;
});

const questionTypeInfo = {
    listening: { icon: "🎧", label: "듣기 평가", color: "var(--info)" },
    reading: { icon: "📖", label: "읽기 평가", color: "var(--success)" },
    short_answer: { icon: "✍️", label: "쓰기 평가", color: "var(--warning)" },
    speaking: { icon: "🎤", label: "말하기 평가", color: "var(--danger)" },
};

// 음성 재생 횟수 추적
const audioPlayCount = ref({});

const playAudio = async () => {
    if (!currentQuestion.value) return;

    // 듣기 문제가 아니면 리턴
    if (currentQuestion.value.questionType !== "listening") {
        console.warn("Not a listening question");
        return;
    }

    const questionNum = currentQuestion.value.questionNumber;

    // 재생 횟수 체크 (2회 제한)
    if (!audioPlayCount.value[questionNum]) {
        audioPlayCount.value[questionNum] = 0;
    }

    if (audioPlayCount.value[questionNum] >= 2) {
        alert("음성은 2번까지만 들을 수 있습니다");
        return;
    }

    audioLoading.value = true;

    try {
        // 로컬 오디오 파일 경로 - 듣기 문제만 1번과 5번
        const audioPath = `/audio/level-test/question${questionNum}.m4a`;
        console.log("Loading audio:", audioPath);

        const audio = new Audio(audioPath);

        audio.onloadeddata = () => {
            console.log("Audio loaded successfully");
            audioLoading.value = false;
        };

        audio.onerror = (e) => {
            console.error("Audio load error for question", questionNum, e);
            alert(`음성 파일을 불러올 수 없습니다 (문제 ${questionNum}번)`);
            audioLoading.value = false;
        };

        audio.onended = () => {
            audioLoading.value = false;
        };

        await audio.play();
        audioPlayCount.value[questionNum]++;
        console.log("Play count:", audioPlayCount.value[questionNum]);
    } catch (error) {
        console.error("Audio playback error:", error);
        alert("음성 재생에 실패했습니다");
        audioLoading.value = false;
    }
};

const toggleRecording = async () => {
    if (!recording.value) {
        try {
            // 마이크 권한 요청 및 스트림 시작
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];

            // MediaRecorder 초기화
            mediaRecorder = new MediaRecorder(audioStream, {
                mimeType: "audio/webm;codecs=opus",
            });

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // 녹음된 오디오를 Blob으로 변환
                const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

                // WebM을 WAV로 변환
                const wavBlob = await convertWebMToWAV(audioBlob);

                // RTZR API로 전송하여 텍스트 변환
                await transcribeAudio(wavBlob);
            };

            // 녹음 시작
            mediaRecorder.start();
            recording.value = true;
            recordingTime.value = 0;
            recordingTimer.value = setInterval(() => {
                recordingTime.value++;
                // 최대 60초 제한
                if (recordingTime.value >= 60) {
                    toggleRecording();
                }
            }, 1000);
        } catch (error) {
            console.error("녹음 시작 실패:", error);
            alert("마이크 권한이 필요합니다");
        }
    } else {
        // 녹음 종료
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }

        // 스트림 정지
        if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop());
        }

        recording.value = false;
        clearInterval(recordingTimer.value);
    }
};

// WebM을 WAV로 변환하는 함수
const convertWebMToWAV = async (webmBlob) => {
    return new Promise((resolve) => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

                // WAV 형식으로 변환
                const wavArrayBuffer = audioBufferToWav(audioBuffer);
                const wavBlob = new Blob([wavArrayBuffer], { type: "audio/wav" });

                resolve(wavBlob);
            } catch (error) {
                console.error("Audio conversion error:", error);
                // 변환 실패 시 원본 반환
                resolve(webmBlob);
            }
        };

        fileReader.onerror = () => {
            console.error("FileReader error");
            resolve(webmBlob);
        };

        fileReader.readAsArrayBuffer(webmBlob);
    });
};

// AudioBuffer를 WAV로 변환하는 헬퍼 함수
const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;

    // WAV 헤더 작성
    const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, length * 2, true);

    // 오디오 데이터 작성
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
        offset += 2;
    }

    return arrayBuffer;
};

// 오디오를 서버로 전송하여 텍스트로 변환
const transcribeAudio = async (audioBlob) => {
    try {
        audioLoading.value = true;

        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.wav");

        const token = localStorage.getItem("token");
        const response = await axios.post("/api/level-test/transcribe-voice", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        if (response.data.success) {
            // 변환된 텍스트를 답변으로 저장
            answers.value[currentQuestion.value.questionNumber] = response.data.transcript;
            console.log("Transcribed text:", response.data.transcript);
        }
    } catch (error) {
        console.error("Transcription error:", error);
        alert("음성 인식에 실패했습니다. 다시 시도해주세요.");
    } finally {
        audioLoading.value = false;
    }
};

const formatRecordingTime = computed(() => {
    const minutes = Math.floor(recordingTime.value / 60);
    const seconds = recordingTime.value % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

const previousQuestion = () => {
    if (currentQuestionIndex.value > 0) {
        saveAnswer();
        currentQuestionIndex.value--;
        loadAnswer();
    }
};

const nextQuestion = async () => {
    saveAnswer();

    if (isLastQuestion.value) {
        // 제출하기 버튼을 누르는 순간 바로 로딩 표시
        isSubmitting.value = true;
        submissionProgress.value = 0;

        // 강제로 DOM 업데이트
        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        // 실제 제출 로직 실행
        await submitTest();
    } else {
        currentQuestionIndex.value++;
        loadAnswer();
    }
};

const saveAnswer = () => {
    if (!currentQuestion.value) return;

    if (currentQuestion.value.choices) {
        answers.value[currentQuestion.value.questionNumber] = selectedAnswer.value;
    } else if (currentQuestion.value.questionType === "short_answer") {
        answers.value[currentQuestion.value.questionNumber] = shortAnswer.value;
    }
};

const loadAnswer = () => {
    if (!currentQuestion.value) return;

    const savedAnswer = answers.value[currentQuestion.value.questionNumber];
    if (currentQuestion.value.choices) {
        selectedAnswer.value = savedAnswer || null;
    } else if (currentQuestion.value.questionType === "short_answer") {
        shortAnswer.value = savedAnswer || "";
    }
};

const submitTest = async () => {
    try {
        submissionProgress.value = 10;

        const token = localStorage.getItem("token");
        if (!token) {
            isSubmitting.value = false;
            alert("로그인이 필요합니다");
            router.push("/login");
            return;
        }

        // 프로그레스 바 애니메이션을 보여주기 위한 지연
        await new Promise((resolve) => setTimeout(resolve, 500));
        submissionProgress.value = 30;

        const response = await axios.post(
            "/api/level-test/submit",
            {
                answers: answers.value,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        submissionProgress.value = 70;

        if (response.data.success) {
            // 세션 ID를 로컬 스토리지에 저장
            localStorage.setItem("levelTestSessionId", response.data.sessionId);

            // 사용자 레벨 정보도 저장 (완료 여부 확인용)
            localStorage.setItem("userLevel", response.data.userLevel);
            localStorage.setItem("levelTestCompleted", "true");

            submissionProgress.value = 90;

            // 결과를 직접 전달하며 결과 페이지로 이동
            submissionProgress.value = 100;

            setTimeout(() => {
                router.push({
                    name: "level-test-result",
                    params: {
                        sessionId: response.data.sessionId,
                    },
                    query: {
                        score: response.data.totalScore,
                        level: response.data.userLevel,
                    },
                });
            }, 500);
        }
    } catch (error) {
        console.error("Submit error:", error);
        alert("제출 중 오류가 발생했습니다");
        submissionProgress.value = 0;
    } finally {
        isSubmitting.value = false;
    }
};

const fetchQuestions = async () => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/level-test/questions", {
            headers: token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {},
        });
        if (response.data.success) {
            questions.value = response.data.questions;
            console.log("Loaded questions:", questions.value);
            console.log(
                "Question types:",
                questions.value.map((q) => `${q.questionNumber}: ${q.questionType}`)
            );
        }
    } catch (error) {
        console.error("Failed to fetch questions:", error);
        alert("레벨 테스트 문제를 불러올 수 없습니다. 다시 시도해주세요.");
        router.push("/home");
        return;
        // 임시 질문 데이터 제거 - 서버에서 정상적으로 가져와야 함
        /* questions.value = [
      {
        questionNumber: 1,
        questionType: 'listening',
        questionText: '다음 대화를 듣고 질문에 답하세요.',
        choices: [
          { id: 'a', text: '회사에 출근합니다' },
          { id: 'b', text: '집에 갑니다' },
          { id: 'c', text: '식당에 갑니다' },
          { id: 'd', text: '병원에 갑니다' }
        ]
      },
      {
        questionNumber: 2,
        questionType: 'reading',
        questionText: '다음 글을 읽고 맞는 답을 고르세요.\n\n"오늘은 날씨가 좋습니다. 하늘이 맑고 바람이 시원합니다."',
        choices: [
          { id: 'a', text: '날씨가 나쁩니다' },
          { id: 'b', text: '비가 옵니다' },
          { id: 'c', text: '날씨가 좋습니다' },
          { id: 'd', text: '눈이 옵니다' }
        ]
      },
      {
        questionNumber: 3,
        questionType: 'short_answer',
        questionText: '"안녕하세요"의 뜻을 한국어로 설명해주세요.'
      },
      {
        questionNumber: 4,
        questionType: 'speaking',
        questionText: '자기소개를 30초 동안 해주세요. (이름, 나라, 직업)'
      }
    ] */
    }
};

onMounted(() => {
    fetchQuestions();
});
</script>

<template>
    <div class="common-page">
        <!-- Loading Dialog for Submission -->
        <LoadingDialog
            v-model="isSubmitting"
            message="당신의 테스트 결과를 준비중입니다..."
            submessage="답안을 분석하고 점수를 계산하고 있습니다"
            :show-progress-bar="true"
            :progress="submissionProgress"
        />

        <div class="common-container-md">
            <!-- Progress Bar -->
            <div class="progress-section">
                <div class="progress-info">
                    <span class="common-title3">문제 {{ currentQuestionIndex + 1 }} / {{ questions.length }}</span>
                    <span class="common-body2">{{ Math.round(progress) }}% 완료</span>
                </div>
                <div class="common-progress-bar">
                    <div class="common-progress-fill" :style="{ width: `${progress}%` }" />
                </div>
            </div>

            <!-- Question Card -->
            <CommonCard class="question-card common-animate-fade-in" :key="currentQuestionIndex">
                <div v-if="currentQuestion">
                    <!-- Question Type Badge -->
                    <div class="question-type-badge">
                        <span class="badge-icon">{{ questionTypeInfo[currentQuestion.questionType]?.icon }}</span>
                        <span class="badge-label">{{ questionTypeInfo[currentQuestion.questionType]?.label }}</span>
                    </div>

                    <!-- Question Content -->
                    <div class="question-content">
                        <!-- Listening Question -->
                        <div v-if="currentQuestion.questionType === 'listening'">
                            <h2 class="common-title1 question-text">{{ currentQuestion.questionText }}</h2>
                            <div class="audio-controls">
                                <CommonButton variant="primary" size="large" :loading="audioLoading" @click="playAudio">
                                    <span class="button-icon">🔊</span>
                                    음성 재생하기
                                </CommonButton>
                                <p class="common-caption audio-hint">* 2번까지 들을 수 있습니다</p>
                            </div>
                        </div>

                        <!-- Reading Question -->
                        <div v-else-if="currentQuestion.questionType === 'reading'">
                            <h2 class="common-title1 question-text">{{ currentQuestion.questionText }}</h2>
                            <div v-if="currentQuestion.passage" class="reading-passage">
                                <p class="common-body1">{{ currentQuestion.passage }}</p>
                            </div>
                        </div>

                        <!-- Short Answer Question -->
                        <div v-else-if="currentQuestion.questionType === 'short_answer'">
                            <h2 class="common-title1 question-text">{{ currentQuestion.questionText }}</h2>
                            <div class="answer-input">
                                <CommonInput v-model="shortAnswer" placeholder="답을 입력하세요" :multiline="true" :rows="4" />
                                <p class="common-caption input-hint">* 한국어로 작성해주세요</p>
                            </div>
                        </div>

                        <!-- Speaking Question -->
                        <div v-else-if="currentQuestion.questionType === 'speaking'">
                            <h2 class="common-title1 question-text">{{ currentQuestion.questionText }}</h2>
                            <div class="recording-controls">
                                <CommonButton :variant="recording ? 'danger' : 'primary'" size="large" :loading="audioLoading" @click="toggleRecording">
                                    <span class="button-icon" v-if="!audioLoading">{{ recording ? "⏹️" : "🎤" }}</span>
                                    {{ audioLoading ? "변환 중..." : recording ? "녹음 중지" : "녹음 시작" }}
                                </CommonButton>
                                <div v-if="recording" class="recording-indicator">
                                    <span class="recording-dot"></span>
                                    <span class="recording-time">{{ formatRecordingTime }}</span>
                                </div>
                                <p v-if="audioLoading" class="common-caption loading-text">🔄 음성을 텍스트로 변환하고 있습니다...</p>
                            </div>

                            <!-- 인식된 텍스트 표시 영역 (하단) -->
                            <div v-if="answers[currentQuestion.questionNumber]" class="recognized-text-section">
                                <div class="recognized-text-header">
                                    <span class="success-icon">✅</span>
                                    <span class="common-body2">음성 인식 결과</span>
                                </div>
                                <div class="recognized-text-box">
                                    <p class="recognized-text">{{ answers[currentQuestion.questionNumber] }}</p>
                                </div>
                                <p class="common-caption text-hint">* 잘못 인식된 경우 다시 녹음해주세요</p>
                            </div>
                        </div>

                        <!-- Multiple Choice Options -->
                        <div v-if="currentQuestion.choices" class="choices-section">
                            <div
                                v-for="choice in currentQuestion.choices"
                                :key="choice.id"
                                class="common-choice-item"
                                :class="{ 'common-choice-item-selected': selectedAnswer === choice.id }"
                                @click="selectedAnswer = choice.id"
                            >
                                <div class="common-radio">
                                    <div v-if="selectedAnswer === choice.id" class="common-radio-dot"></div>
                                </div>
                                <span class="common-body1">{{ choice.text }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-else class="common-loading">
                    <span class="common-loading-icon">⏳</span>
                    <p class="common-body1">문제를 불러오는 중...</p>
                </div>
            </CommonCard>

            <!-- Navigation -->
            <div class="navigation-section">
                <CommonButton variant="secondary" size="large" :disabled="currentQuestionIndex === 0" @click="previousQuestion"> 이전 문제 </CommonButton>

                <div class="skip-button" v-if="!isLastQuestion">
                    <button class="skip-link" @click="nextQuestion" :disabled="canProceed">건너뛰기</button>
                </div>

                <CommonButton variant="primary" size="large" :disabled="!canProceed" @click="nextQuestion">
                    {{ isLastQuestion ? "제출하기" : "다음 문제" }}
                </CommonButton>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Page Specific */
.common-page {
    padding: var(--spacing-xl) var(--spacing-lg);
}

/* Progress Section */
.progress-section {
    margin-bottom: var(--spacing-xl);
}

.progress-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

/* Question Card */
.question-card {
    padding: var(--spacing-2xl) !important;
    margin-bottom: var(--spacing-xl);
}

/* Question Type Badge */
.question-type-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--gray-100);
    border-radius: var(--radius-full);
    margin-bottom: var(--spacing-lg);
}

.badge-icon {
    font-size: 20px;
    font-family: "TossFaceFont", system-ui;
}

.badge-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
}

/* Question Content */
.question-content {
    margin-top: var(--spacing-lg);
}

.question-text {
    margin-bottom: var(--spacing-xl);
    line-height: 1.6;
    color: var(--gray-900);
}

/* Audio Controls */
.audio-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

.button-icon {
    margin-right: var(--spacing-sm);
    font-size: 20px;
    font-family: "TossFaceFont", system-ui;
}

.audio-hint,
.input-hint {
    color: var(--gray-500);
    text-align: center;
}

/* Reading Passage */
.reading-passage {
    padding: var(--spacing-lg);
    background: var(--gray-50);
    border-radius: var(--radius-md);
    margin-top: var(--spacing-lg);
    border-left: 4px solid var(--common-blue);
}

/* Answer Input */
.answer-input {
    margin-top: var(--spacing-xl);
}

/* Recording Controls */
.recording-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

.recording-indicator {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--danger-light);
    border-radius: var(--radius-full);
}

.recording-dot {
    width: 12px;
    height: 12px;
    background: var(--danger);
    border-radius: 50%;
    animation: pulse 1.5s ease-in-out infinite;
}

.recording-time {
    font-weight: 600;
    color: var(--danger);
}

.loading-text {
    color: var(--common-blue);
    font-weight: 500;
    margin-top: var(--spacing-md);
}

/* Recognized Text Section */
.recognized-text-section {
    margin-top: var(--spacing-2xl);
    padding: var(--spacing-lg);
    background: var(--success-light);
    border-radius: var(--radius-lg);
    border: 1px solid var(--success);
}

.recognized-text-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.success-icon {
    font-size: 20px;
}

.recognized-text-box {
    padding: var(--spacing-md);
    background: white;
    border-radius: var(--radius-md);
    border: 1px solid var(--gray-200);
    margin-bottom: var(--spacing-sm);
}

.recognized-text {
    font-size: 18px;
    line-height: 1.6;
    color: var(--gray-900);
    margin: 0;
}

.text-hint {
    color: var(--gray-500);
    font-size: 12px;
    margin: 0;
}

/* Choices Section */
.choices-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-top: var(--spacing-xl);
}

/* Navigation Section */
.navigation-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--spacing-md);
}

.skip-button {
    flex: 1;
    text-align: center;
}

.skip-link {
    color: var(--gray-500);
    text-decoration: underline;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 14px;
    padding: var(--spacing-sm);
    transition: color var(--transition-fast);
}

.skip-link:hover:not(:disabled) {
    color: var(--common-blue);
}

.skip-link:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Animations */
@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

/* Mobile Responsive - 768px 이하 */
@media (max-width: 768px) {
    .common-page {
        padding: 12px;
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
    }

    .common-container-md {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: calc(100dvh - 24px);
        max-width: 100%;
        width: 100%;
    }

    .question-card {
        padding: 16px !important;
        margin-bottom: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        min-height: 0;
        width: 100%;
    }

    /* Progress 섹션 */
    .progress-section {
        margin-bottom: 16px;
        flex-shrink: 0;
    }

    .progress-info {
        margin-bottom: 8px;
    }

    .progress-info .common-title3 {
        font-size: 15px;
        font-weight: 600;
    }

    .progress-info .common-body2 {
        font-size: 13px;
    }

    .common-progress-bar {
        height: 6px;
        border-radius: 3px;
    }

    /* Question Type Badge */
    .question-type-badge {
        padding: 6px 12px;
        margin-bottom: 12px;
    }

    .badge-icon {
        font-size: 18px;
    }

    .badge-label {
        font-size: 13px;
    }

    /* 질문 텍스트 */
    .question-text {
        font-size: 17px;
        line-height: 1.5;
        margin-bottom: 16px;
        font-weight: 500;
    }

    .question-content {
        margin-top: 12px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    /* 오디오/녹음 컨트롤 */
    .audio-controls,
    .recording-controls {
        margin-top: 20px;
        gap: 12px;
        width: 100%;
    }

    .audio-controls button,
    .recording-controls button {
        padding: 14px 24px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        border-radius: 12px !important;
        width: 100%;
        max-width: 320px;
    }

    .button-icon {
        font-size: 18px;
        margin-right: 6px;
    }

    .audio-hint,
    .input-hint,
    .loading-text {
        font-size: 12px;
        margin-top: 8px;
    }

    /* 인식된 텍스트 섹션 */
    .recognized-text-section {
        margin-top: 16px;
        padding: 12px;
        border-radius: 8px;
    }

    .recognized-text-header {
        gap: 6px;
        margin-bottom: 8px;
    }

    .recognized-text-header .common-body2 {
        font-size: 13px;
    }

    .success-icon {
        font-size: 18px;
    }

    .recognized-text-box {
        padding: 10px;
        margin-bottom: 6px;
        border-radius: 6px;
    }

    .recognized-text {
        font-size: 15px;
        line-height: 1.4;
    }

    .text-hint {
        font-size: 11px;
    }

    /* 선택지 섹션 */
    .choices-section {
        margin-top: 16px;
        gap: 10px;
        width: 100%;
    }

    .common-choice-item {
        padding: 14px 16px !important;
        border-radius: 8px !important;
        width: 100%;
    }

    .common-choice-item .common-body1 {
        font-size: 15px;
    }

    .common-radio {
        width: 18px;
        height: 18px;
    }

    /* 입력 필드 */
    .answer-input {
        margin-top: 16px;
        width: 100%;
    }

    .answer-input textarea {
        font-size: 15px !important;
        min-height: 100px !important;
        border-radius: 8px !important;
        padding: 12px !important;
        width: 100% !important;
    }

    /* 네비게이션 섹션 */
    .navigation-section {
        flex-direction: column;
        gap: 10px;
        flex-shrink: 0;
        margin-top: auto;
        padding-top: 16px;
    }

    .navigation-section button {
        width: 100%;
        padding: 14px 20px !important;
        font-size: 15px !important;
        font-weight: 600 !important;
        min-height: 48px !important;
        border-radius: 12px !important;
    }

    .skip-button {
        order: 0;
        width: 100%;
        display: none; /* 모바일에서는 건너뛰기 숨김 */
    }

    /* 녹음 인디케이터 */
    .recording-indicator {
        padding: 6px 12px;
        border-radius: 20px;
    }

    .recording-dot {
        width: 10px;
        height: 10px;
    }

    .recording-time {
        font-size: 13px;
        font-weight: 600;
    }

    /* 읽기 문단 */
    .reading-passage {
        padding: 12px;
        margin-top: 16px;
        border-left-width: 4px;
        border-radius: 4px;
    }

    .reading-passage .common-body1 {
        font-size: 15px;
        line-height: 1.5;
    }
}

/* Small Mobile - 480px 이하 */
@media (max-width: 480px) {
    .common-page {
        padding: 10px;
    }

    .common-container-md {
        height: calc(100dvh - 20px);
        width: 100%;
    }

    .question-card {
        padding: 16px !important;
        margin-bottom: 12px;
    }

    .progress-section {
        margin-bottom: 12px;
    }

    .progress-info .common-title3 {
        font-size: 14px;
    }

    .question-text {
        font-size: 16px;
        margin-bottom: 14px;
    }

    .question-type-badge {
        padding: 5px 10px;
        margin-bottom: 10px;
    }

    .badge-icon {
        font-size: 16px;
    }

    .badge-label {
        font-size: 12px;
    }

    .navigation-section {
        padding-top: 12px;
        gap: 8px;
    }

    .navigation-section button {
        padding: 12px 16px !important;
        font-size: 14px !important;
        min-height: 44px !important;
    }

    .audio-controls button,
    .recording-controls button {
        padding: 12px 20px !important;
        font-size: 14px !important;
        width: 100%;
        max-width: none;
    }

    .choices-section {
        gap: 8px;
        width: 100%;
    }

    .common-choice-item {
        padding: 12px !important;
        width: 100%;
    }

    .common-choice-item .common-body1 {
        font-size: 14px;
    }
}

/* Landscape Mobile - 가로 모드 */
@media (max-width: 768px) and (orientation: landscape) {
    .common-page {
        padding: 6px 10px;
        min-height: 100vh;
        min-height: 100dvh;
    }

    .common-container-md {
        max-height: calc(100dvh - 12px);
    }

    .question-card {
        padding: 8px !important;
        margin-bottom: 6px;
    }

    .progress-section {
        margin-bottom: 4px;
    }

    .progress-info .common-title3 {
        font-size: 13px;
    }

    .progress-info .common-body2 {
        font-size: 11px;
    }

    .common-progress-bar {
        height: 3px;
    }

    .question-type-badge {
        padding: 2px 6px;
        margin-bottom: 4px;
    }

    .badge-icon {
        font-size: 14px;
    }

    .badge-label {
        font-size: 10px;
    }

    .question-text {
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.3;
    }

    .audio-controls,
    .recording-controls {
        margin-top: 8px;
    }

    .audio-controls button,
    .recording-controls button {
        padding: 6px 12px !important;
        font-size: 12px !important;
    }

    .recognized-text-section {
        margin-top: 8px;
        padding: 6px;
    }

    .recognized-text {
        font-size: 12px;
    }

    .choices-section {
        margin-top: 8px;
        gap: 6px;
    }

    .common-choice-item {
        padding: 6px !important;
    }

    .common-choice-item .common-body1 {
        font-size: 12px;
    }

    .navigation-section {
        flex-direction: row;
        padding-top: 6px;
    }

    .navigation-section button {
        width: auto;
        min-width: 80px;
        padding: 6px 10px !important;
        font-size: 11px !important;
        min-height: 28px !important;
    }

    .skip-button {
        order: 0;
        width: auto;
    }

    .skip-link {
        font-size: 11px;
        padding: 6px;
    }
}
</style>
