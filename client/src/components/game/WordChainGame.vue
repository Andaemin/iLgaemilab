<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import AppHeader from '@/components/common/AppHeader.vue';
import CommonButton from '@/components/common/CommonButton.vue';
import { logGamePlay } from '@/utils/gameStats';

const router = useRouter();
const { t } = useI18n();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';

// 게임 상태
const gameState = ref('tutorial'); // tutorial, countdown, playing, result
const selectedTurn = ref(null); // 'user' (선공), 'ai' (후공)
const messages = ref([]);
const userInput = ref('');
const isLoading = ref(false);
const gameOver = ref(false);
const winner = ref(null); // 'user', 'ai', 'draw'

// 랭킹 관련 상태
const topRankings = ref([]);
const isLoadingRankings = ref(false);
const isSavingScore = ref(false);
const myRankInfo = ref(null);
const currentUserId = ref(null);

// 튜토리얼 상태
const currentTutorialStep = ref(0);
const countdownValue = ref(3);

// 타이머
const turnTimeLeft = ref(30); // 30초 제한
const timerInterval = ref(null);

// 게임 통계
const totalWords = ref(0);
const userWordsCount = ref(0);
const aiWordsCount = ref(0);
const usedWords = ref([]);
const lastUserTurnTime = ref(null); // 사용자 마지막 턴 시작 시간
const lastAITurnTime = ref(null); // AI 마지막 턴 시작 시간
const userTurnIntervals = ref([]); // 사용자 턴 인터벌 배열
const aiTurnIntervals = ref([]); // AI 턴 인터벌 배열

// Toast notification
const toast = ref({
    show: false,
    message: '',
    type: 'success'
});

// 단어 뜻 모달
const showWordMeaningModal = ref(false);
const selectedWordForModal = ref(null);
const wordMeanings = ref([]);

// 입력창 ref
const inputRef = ref(null);
const conversationRef = ref(null);

// 음원 관련
const bgMusic = ref(null);
const isMusicMuted = ref(localStorage.getItem('wordChainMusicMuted') === 'true');

// 튜토리얼 단계
const tutorialSteps = computed(() => [
    {
        title: t('games.tutorials.wordChain.steps.0.title'),
        description: t('games.tutorials.wordChain.steps.0.description'),
        icon: t('games.tutorials.wordChain.steps.0.icon'),
        details: [
            t('games.tutorials.wordChain.steps.0.details.0'),
            t('games.tutorials.wordChain.steps.0.details.1'),
            t('games.tutorials.wordChain.steps.0.details.2'),
            t('games.tutorials.wordChain.steps.0.details.3')
        ]
    },
    {
        title: t('games.tutorials.wordChain.steps.1.title'),
        description: t('games.tutorials.wordChain.steps.1.description'),
        icon: t('games.tutorials.wordChain.steps.1.icon'),
        details: [
            t('games.tutorials.wordChain.steps.1.details.0'),
            t('games.tutorials.wordChain.steps.1.details.1'),
            t('games.tutorials.wordChain.steps.1.details.2'),
            t('games.tutorials.wordChain.steps.1.details.3')
        ]
    },
    {
        title: t('games.tutorials.wordChain.steps.2.title'),
        description: t('games.tutorials.wordChain.steps.2.description'),
        icon: t('games.tutorials.wordChain.steps.2.icon'),
        details: [
            t('games.tutorials.wordChain.steps.2.details.0'),
            t('games.tutorials.wordChain.steps.2.details.1'),
            t('games.tutorials.wordChain.steps.2.details.2'),
            t('games.tutorials.wordChain.steps.2.details.3')
        ]
    },
    {
        title: t('games.tutorials.wordChain.steps.3.title'),
        description: t('games.tutorials.wordChain.steps.3.description'),
        icon: t('games.tutorials.wordChain.steps.3.icon'),
        details: [
            t('games.tutorials.wordChain.steps.3.details.0'),
            t('games.tutorials.wordChain.steps.3.details.1'),
            t('games.tutorials.wordChain.steps.3.details.2'),
            t('games.tutorials.wordChain.steps.3.details.3')
        ]
    },
    {
        title: t('games.tutorials.wordChain.steps.4.title'),
        description: t('games.tutorials.wordChain.steps.4.description'),
        icon: t('games.tutorials.wordChain.steps.4.icon'),
        details: [
            t('games.tutorials.wordChain.steps.4.details.0'),
            t('games.tutorials.wordChain.steps.4.details.1'),
            t('games.tutorials.wordChain.steps.4.details.2'),
            t('games.tutorials.wordChain.steps.4.details.3'),
            t('games.tutorials.wordChain.steps.4.details.4')
        ]
    }
]);

// 타이머 시작
const startTurnTimer = () => {
    stopTurnTimer();
    turnTimeLeft.value = 30;

    timerInterval.value = setInterval(() => {
        turnTimeLeft.value--;

        if (turnTimeLeft.value <= 0) {
            stopTurnTimer();
            handleTimeUp();
        }
    }, 1000);
};

// 타이머 중지
const stopTurnTimer = () => {
    if (timerInterval.value) {
        clearInterval(timerInterval.value);
        timerInterval.value = null;
    }
};

// 시간 초과 처리
const handleTimeUp = () => {
    pauseMusic(); // 시간 초과 시 음악 정지
    gameOver.value = true;
    winner.value = 'ai';
    gameState.value = 'result';
    showToast('시간 초과! AI 승리! 😢', 'error');
};

// 튜토리얼 이전 단계
const prevTutorialStep = () => {
    if (currentTutorialStep.value > 0) {
        currentTutorialStep.value--;
    }
};

// 튜토리얼 다음 단계
const nextTutorialStep = () => {
    if (currentTutorialStep.value < tutorialSteps.value.length - 1) {
        currentTutorialStep.value++;
    } else {
        showTurnSelection();
    }
};

// 튜토리얼 건너뛰기
const skipTutorial = () => {
    showTurnSelection();
};

// 선공/후공 선택 화면으로
const showTurnSelection = () => {
    gameState.value = 'turn-selection';
};

// 시작 화면 - 선공/후공 선택
const selectTurn = (turn) => {
    selectedTurn.value = turn;
    gameState.value = 'countdown';
    countdownValue.value = 3;
    startCountdown();
};

// 카운트다운
const startCountdown = () => {
    const countdownInterval = setInterval(() => {
        countdownValue.value--;
        if (countdownValue.value < 0) {
            clearInterval(countdownInterval);
            // Game Start 확대 애니메이션과 동시에 게임 시작
            setTimeout(() => {
                startGame();
            }, 600);
        }
    }, 1000);
};

// 게임 시작
const startGame = async () => {
    gameState.value = 'playing';
    messages.value = [];
    userInput.value = '';
    gameOver.value = false;
    winner.value = null;
    totalWords.value = 0;
    userWordsCount.value = 0;
    aiWordsCount.value = 0;
    usedWords.value = [];
    userTurnIntervals.value = [];
    aiTurnIntervals.value = [];
    lastUserTurnTime.value = null;
    lastAITurnTime.value = null;
    playMusic(); // 게임 시작 시 음악 재생

    // 게임 플레이 로그 기록 (인기 게임 통계용)
    logGamePlay('word_chain');

    // AI가 선공이면 AI가 먼저 시작
    if (selectedTurn.value === 'ai') {
        lastAITurnTime.value = Date.now();
        await startAITurn(null);
    } else {
        // 사용자 선공이면 타이머 시작 및 입력창 포커스
        lastUserTurnTime.value = Date.now();
        startTurnTimer();
        await nextTick();
        if (inputRef.value) {
            inputRef.value.focus();
        }
    }
};

// AI 턴 시작
const startAITurn = async (previousWord) => {
    isLoading.value = true;
    stopTurnTimer();

    // AI 턴 인터벌 계산
    if (lastAITurnTime.value !== null) {
        const interval = (Date.now() - lastAITurnTime.value) / 1000; // 초 단위
        aiTurnIntervals.value.push(interval);
    }

    try {
        const response = await axios.post(`${API_URL}/api/word-chain/ai-turn`, {
            previousWord: previousWord,
            usedWords: usedWords.value
        });

        const aiWord = response.data.word;
        const isValid = response.data.isValid;
        const meaning = response.data.meaning || '';

        if (!isValid || !aiWord) {
            // AI가 단어를 찾지 못하면 사용자 승리
            pauseMusic(); // AI 패배 시 음악 정지
            gameOver.value = true;
            winner.value = 'user';
            showToast('AI가 단어를 찾지 못했습니다! 승리! 😊', 'success');
            gameState.value = 'result';
            return;
        }

        // AI 메시지 추가
        messages.value.push({
            role: 'ai',
            word: aiWord,
            timestamp: new Date(),
            meaning: meaning
        });

        usedWords.value.push(aiWord);
        aiWordsCount.value++;
        totalWords.value++;

        // 자동 스크롤
        await scrollToBottom();

        // 사용자 턴 시작 (타이머 시작)
        lastUserTurnTime.value = Date.now();
        startTurnTimer();

    } catch (error) {
        console.error('AI 턴 오류:', error);
        showToast('AI 응답 중 오류가 발생했습니다.', 'error');
    } finally {
        isLoading.value = false;

        // 입력창 포커스 (로딩이 끝난 후)
        await nextTick();
        if (inputRef.value) {
            inputRef.value.focus();
        }
    }
};

// 사용자 단어 제출
const submitWord = async () => {
    const trimmedInput = userInput.value.trim();
    if (!trimmedInput || isLoading.value || gameOver.value) return;

    const userWord = trimmedInput;
    isLoading.value = true;

    try {
        // 이전 단어 찾기
        const previousWord = messages.value.length > 0
            ? messages.value[messages.value.length - 1].word
            : null;

        // 서버에 검증 요청
        const response = await axios.post(`${API_URL}/api/word-chain/validate`, {
            word: userWord,
            previousWord: previousWord,
            usedWords: usedWords.value
        });

        const isValid = response.data.isValid;
        const message = response.data.message;
        const meaning = response.data.meaning || '';

        if (!isValid) {
            // 오답 처리 - 타이머는 계속 흐름
            showToast(message || '올바르지 않은 단어입니다.', 'error');
            userInput.value = '';
            isLoading.value = false;

            // 입력창 포커스
            await nextTick();
            if (inputRef.value) {
                inputRef.value.focus();
            }
            return;
        }

        // 정답 처리 - 타이머 중지
        stopTurnTimer();

        // 사용자 턴 인터벌 계산
        if (lastUserTurnTime.value !== null) {
            const interval = (Date.now() - lastUserTurnTime.value) / 1000; // 초 단위
            userTurnIntervals.value.push(interval);
        }

        // 사용자 메시지 추가 (뜻 포함)
        messages.value.push({
            role: 'user',
            word: userWord,
            timestamp: new Date(),
            meaning: meaning
        });

        usedWords.value.push(userWord);
        userWordsCount.value++;
        totalWords.value++;
        userInput.value = '';

        // 자동 스크롤
        await scrollToBottom();

        // AI 턴 시작 (약간의 지연)
        lastAITurnTime.value = Date.now();
        setTimeout(async () => {
            await startAITurn(userWord);
        }, 300);

    } catch (error) {
        console.error('단어 제출 오류:', error);
        showToast('단어 검증 중 오류가 발생했습니다.', 'error');

        // 입력창 포커스
        await nextTick();
        if (inputRef.value) {
            inputRef.value.focus();
        }
    } finally {
        isLoading.value = false;
    }
};

// 자동 스크롤
const scrollToBottom = async () => {
    await nextTick();
    if (conversationRef.value) {
        conversationRef.value.scrollTop = conversationRef.value.scrollHeight;
    }
};

// Toast notification
const showToast = (message, type = 'success') => {
    toast.value.message = message;
    toast.value.type = type;
    toast.value.show = true;

    setTimeout(() => {
        toast.value.show = false;
    }, type === 'success' ? 2000 : 3000);
};

// 포기하기
const giveUp = () => {
    stopTurnTimer();
    pauseMusic(); // 포기 시 음악 정지
    gameOver.value = true;
    winner.value = 'ai';
    gameState.value = 'result';
    showToast('포기하셨습니다. AI 승리! 😢', 'error');
};

// 게임 허브로 돌아가기
const goToGameHub = () => {
    stopTurnTimer();
    pauseMusic(); // 페이지 이동 시 음악 정지
    router.push('/game');
};

// 다시 시작 (튜토리얼 건너뛰고 선공/후공 선택으로)
const restartGame = () => {
    stopTurnTimer();
    gameState.value = 'turn-selection';
    selectedTurn.value = null;
    messages.value = [];
    userInput.value = '';
    gameOver.value = false;
    winner.value = null;
    totalWords.value = 0;
    userWordsCount.value = 0;
    aiWordsCount.value = 0;
    usedWords.value = [];
    currentTutorialStep.value = 0;
};

// 두음법칙 변형 가능 글자 맵핑
const getDoubleConsonantVariants = (char) => {
    const doubleConsonantMap = {
        '녀': ['여'], '뇨': ['요'], '뉴': ['유'], '냐': ['야'], '녜': ['예'],
        '녁': ['역'], '년': ['연'], '렬': ['열'], '녕': ['영'],
        '리': ['이'], '릴': ['일'], '릭': ['익'], '린': ['인'], '립': ['입'],
        '량': ['양'], '려': ['여'], '련': ['연'], '령': ['영'], '례': ['예'],
        '룡': ['용'], '륙': ['육'], '률': ['율'], '륜': ['윤'], '류': ['유']
    };
    return doubleConsonantMap[char] || [];
};

// 마지막 단어의 마지막 글자
const lastCharacter = computed(() => {
    if (messages.value.length === 0) return '';
    const lastWord = messages.value[messages.value.length - 1].word;
    return lastWord.charAt(lastWord.length - 1);
});

// 두음법칙 적용 가능 여부
const hasDoubleConsonantRule = computed(() => {
    if (messages.value.length === 0) return false;
    const variants = getDoubleConsonantVariants(lastCharacter.value);
    return variants.length > 0;
});

// 두음법칙 변형 글자들
const doubleConsonantVariants = computed(() => {
    if (!hasDoubleConsonantRule.value) return [];
    return getDoubleConsonantVariants(lastCharacter.value);
});

// 타이머 색상
const timerColor = computed(() => {
    if (turnTimeLeft.value > 20) return 'var(--success)';
    if (turnTimeLeft.value > 10) return 'var(--warning)';
    return 'var(--danger)';
});

// 평균 인터벌 계산
const userAvgInterval = computed(() => {
    if (userTurnIntervals.value.length === 0) return 0;
    const sum = userTurnIntervals.value.reduce((a, b) => a + b, 0);
    return (sum / userTurnIntervals.value.length).toFixed(1);
});

const aiAvgInterval = computed(() => {
    if (aiTurnIntervals.value.length === 0) return 0;
    const sum = aiTurnIntervals.value.reduce((a, b) => a + b, 0);
    return (sum / aiTurnIntervals.value.length).toFixed(1);
});

// 음원 초기화 및 재생
const initMusic = () => {
    if (!bgMusic.value) {
        bgMusic.value = new Audio('/audio/SuperMarioSong.mp3');
        bgMusic.value.loop = true;
        bgMusic.value.volume = 0.5;
    }
};

const playMusic = () => {
    if (!isMusicMuted.value) {
        initMusic();
        bgMusic.value.play().catch(err => {
            console.log('음악 자동재생 제한:', err);
        });
    }
};

const pauseMusic = () => {
    if (bgMusic.value) {
        bgMusic.value.pause();
    }
};

const toggleMusic = () => {
    isMusicMuted.value = !isMusicMuted.value;
    localStorage.setItem('wordChainMusicMuted', isMusicMuted.value);

    if (isMusicMuted.value) {
        pauseMusic();
    } else {
        playMusic();
    }
};

// 단어 클릭 시 뜻 모달 표시
const showWordMeaning = async (word) => {
    selectedWordForModal.value = word;
    showWordMeaningModal.value = true;
    wordMeanings.value = [];

    try {
        const response = await axios.post(`${API_URL}/api/word-chain/get-meaning`, {
            word: word
        });

        if (response.data.meanings && response.data.meanings.length > 0) {
            wordMeanings.value = response.data.meanings;
        } else if (response.data.meaning) {
            // 단일 뜻인 경우
            wordMeanings.value = [response.data.meaning];
        } else {
            wordMeanings.value = ['뜻을 찾을 수 없습니다.'];
        }
    } catch (error) {
        console.error('단어 뜻 조회 오류:', error);
        wordMeanings.value = ['뜻을 조회하는 중 오류가 발생했습니다.'];
    }
};

// 모달 닫기
const closeWordMeaningModal = () => {
    showWordMeaningModal.value = false;
    selectedWordForModal.value = null;
    wordMeanings.value = [];
};

// JWT 토큰에서 사용자 ID 가져오기
const getCurrentUserId = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
    } catch (error) {
        console.error('토큰 파싱 오류:', error);
        return null;
    }
};

// 게임 점수 저장
const saveScore = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('로그인하지 않은 사용자 - 점수 저장 생략');
        return;
    }

    const userId = getCurrentUserId();
    if (!userId) {
        console.log('유효하지 않은 토큰 - 점수 저장 생략');
        return;
    }

    currentUserId.value = userId;

    // 플레이어의 마지막 단어 찾기
    let lastUserWord = '';
    for (let i = messages.value.length - 1; i >= 0; i--) {
        if (messages.value[i].role === 'user') {
            lastUserWord = messages.value[i].word;
            break;
        }
    }

    isSavingScore.value = true;
    try {
        const response = await axios.post(
            `${API_URL}/api/game-scores`,
            {
                gameType: 'word_chain',
                score: userWordsCount.value,
                additionalData: {
                    wordCount: userWordsCount.value,
                    lastWord: usedWords.value[usedWords.value.length - 1] || '',
                    isWin: winner.value === 'user'
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        console.log('끝말잇기 점수 저장 성공:', response.data);
        if (response.data.success && response.data.data && response.data.data.rank) {
            myRankInfo.value = {
                rank: response.data.data.rank,
                score: userWordsCount.value,
                userId: currentUserId.value,
                gameScoreId: response.data.data.gameScore.id,
                userName: response.data.data.userName
            };
            console.log('✅ 내 순위 정보 저장:', myRankInfo.value);
        } else {
            console.warn('⚠️ 순위 정보 없음:', response.data);
        }
    } catch (error) {
        console.error('점수 저장 오류:', error);
    } finally {
        isSavingScore.value = false;
    }
};

// 랭킹 조회
const fetchRankings = async () => {
    isLoadingRankings.value = true;
    try {
        const response = await axios.get(
            `${API_URL}/api/game-scores/rankings/word_chain?limit=3`
        );
        topRankings.value = response.data.data || [];
        console.log('끝말잇기 랭킹 조회 성공:', topRankings.value);
    } catch (error) {
        console.error('랭킹 조회 오류:', error);
        topRankings.value = [];
    } finally {
        isLoadingRankings.value = false;
    }
};

// 컴포넌트 초기화
onMounted(() => {
    // 현재 로그인한 사용자 ID 가져오기
    currentUserId.value = getCurrentUserId();
});

// 컴포넌트 정리
onUnmounted(() => {
    stopTurnTimer();
    pauseMusic();
});

// 게임 상태 변경 시 스크롤 맨 위로
watch(gameState, async (newState) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 결과 화면으로 전환 시 점수 저장 및 랭킹 조회
    if (newState === 'result') {
        await saveScore();
        await fetchRankings();
    }
});
</script>

<template>
    <div class="word-chain-page">
        <!-- 시작/결과/튜토리얼 화면에서만 헤더 표시 -->
        <AppHeader v-if="gameState !== 'playing'" />

        <div class="word-chain-content">
            <!-- 튜토리얼 -->
            <div v-if="gameState === 'tutorial'" class="tutorial-section">
                <div class="game-header">
                    <button class="back-button" @click="goToGameHub">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">📚</div>
                        <div class="header-text">
                            <h2 class="common-title2">{{ t('games.tutorials.wordChain.gameExplanation') }}</h2>
                            <p class="common-caption text-secondary">{{ t('games.tutorials.wordChain.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
                        </div>
                    </div>
                </div>

                <div class="tutorial-card">
                    <div class="tutorial-content">
                        <div class="tutorial-icon">{{ tutorialSteps[currentTutorialStep].icon }}</div>
                        <h3 class="common-title2">{{ tutorialSteps[currentTutorialStep].title }}</h3>
                        <p class="common-body1 tutorial-description">{{ tutorialSteps[currentTutorialStep].description }}</p>

                        <div class="tutorial-details">
                            <ul>
                                <li v-for="(detail, idx) in tutorialSteps[currentTutorialStep].details" :key="idx">
                                    {{ detail }}
                                </li>
                            </ul>
                        </div>

                        <div class="tutorial-progress">
                            <div
                                v-for="(step, idx) in tutorialSteps"
                                :key="idx"
                                class="progress-dot"
                                :class="{ active: idx === currentTutorialStep }"
                            ></div>
                        </div>

                        <div class="tutorial-actions">
                            <CommonButton
                                v-if="currentTutorialStep > 0"
                                @click="prevTutorialStep"
                                variant="secondary"
                                size="large"
                            >
                                {{ t('games.tutorials.wordChain.previous') }}
                            </CommonButton>
                            <CommonButton
                                v-else
                                @click="skipTutorial"
                                variant="secondary"
                                size="large"
                            >
                                {{ t('games.tutorials.wordChain.startDirectly') }}
                            </CommonButton>
                            <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.wordChain.next') : t('games.tutorials.wordChain.startGame') }}
                            </CommonButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 선공/후공 선택 -->
            <div v-else-if="gameState === 'turn-selection'" class="turn-selection-section">
                <div class="game-header">
                    <button class="back-button" @click="goToGameHub">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">🔄</div>
                        <div class="header-text">
                            <h2 class="common-title2">끝말잇기</h2>
                            <p class="common-caption text-secondary">누가 먼저 시작할까요?</p>
                        </div>
                    </div>
                </div>

                <div class="turn-selection-card">
                    <div class="turn-options">
                        <div class="turn-option" @click="selectTurn('user')">
                            <div class="turn-icon">👤</div>
                            <h4 class="common-title3">내가 먼저</h4>
                            <p class="common-caption text-secondary">선공으로 시작합니다.</p>
                        </div>

                        <div class="turn-option" @click="selectTurn('ai')">
                            <div class="turn-icon">🤖</div>
                            <h4 class="common-title3">AI가 먼저</h4>
                            <p class="common-caption text-secondary">후공으로 시작합니다.</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 카운트다운 -->
            <div v-else-if="gameState === 'countdown'" class="countdown-section">
                <div class="countdown-display">
                    <div v-if="countdownValue > 0" class="countdown-number">{{ countdownValue }}</div>
                    <div v-else class="countdown-text">
                        <span class="game-start-text">Game Start!</span>
                    </div>
                </div>
            </div>

            <!-- 게임 진행 -->
            <div v-else-if="gameState === 'playing'" class="playing-section">
                <!-- 헤더 -->
                <div class="game-playing-header">
                    <button class="back-button" @click="goToGameHub">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="header-info">
                        <h3 class="common-title4">끝말잇기</h3>
                        <p class="common-caption text-secondary">
                            {{ selectedTurn === 'user' ? '내가 선공' : 'AI가 선공' }}
                        </p>
                    </div>
                    <div class="header-right">
                        <button class="music-toggle-button" @click="toggleMusic" :title="isMusicMuted ? '음악 켜기' : '음악 끄기'">
                            {{ isMusicMuted ? '🔇' : '🔊' }}
                        </button>
                        <div class="timer-display" :style="{ color: timerColor }">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            <span class="timer-value">{{ turnTimeLeft }}초</span>
                        </div>
                    </div>
                </div>

                <!-- 대화 영역 -->
                <div class="conversation-area" ref="conversationRef">
                    <div class="messages-container">
                        <!-- 시작 안내 메시지 -->
                        <div v-if="messages.length === 0 && selectedTurn === 'user'" class="system-message">
                            <p>첫 단어를 입력해주세요!</p>
                        </div>

                        <!-- 메시지 목록 -->
                        <TransitionGroup name="message-list" tag="div">
                            <div
                                v-for="(message, index) in messages"
                                :key="`${message.role}-${index}`"
                                class="message"
                                :class="`message-${message.role}`"
                            >
                                <div class="message-avatar">
                                    <span>{{ message.role === 'ai' ? '🤖' : '🧑' }}</span>
                                </div>
                                <div class="message-content">
                                    <div class="message-bubble">
                                        <p class="word-display">{{ message.word }}</p>
                                        <p v-if="message.meaning" class="message-text">{{ message.meaning }}</p>
                                    </div>
                                    <div class="message-meta">
                                        <span class="message-time">
                                            {{ new Date(message.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </TransitionGroup>

                        <!-- 로딩 표시 -->
                        <div v-if="isLoading" class="message message-ai">
                            <div class="message-avatar">
                                <span>🤖</span>
                            </div>
                            <div class="message-content">
                                <div class="message-bubble typing-bubble">
                                    <div class="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 다음 글자 힌트 -->
                <div v-if="messages.length > 0 && !isLoading && !gameOver" class="hint-section">
                    <p class="hint-label">
                        <strong>"{{ lastCharacter }}"</strong>(으)로 시작하는 단어를 입력하세요.
                    </p>
                    <p v-if="hasDoubleConsonantRule" class="hint-double-consonant">
                        🔤 두음법칙: <strong>"{{ doubleConsonantVariants.join('", "') }}"</strong>(으)로도 시작 가능합니다
                    </p>
                </div>

                <!-- 입력 영역 -->
                <div v-if="!gameOver" class="input-section">
                    <div class="input-container">
                        <input
                            ref="inputRef"
                            v-model="userInput"
                            type="text"
                            placeholder="단어를 입력하세요."
                            @keyup.enter="submitWord"
                            class="text-input"
                            autofocus
                        />
                        <button
                            class="send-button"
                            @click="submitWord"
                            :disabled="!userInput.trim() || isLoading"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button
                            class="give-up-button"
                            @click="giveUp"
                            :disabled="isLoading"
                        >
                            포기
                        </button>
                    </div>
                </div>
            </div>

            <!-- 결과 화면 -->
            <div v-else-if="gameState === 'result'" class="result-section">
                <div class="game-header">
                    <button class="back-button" @click="goToGameHub">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">🏆</div>
                        <div class="header-text">
                            <h2 class="common-title2">게임 종료</h2>
                            <p class="common-caption text-secondary">결과 확인</p>
                        </div>
                    </div>
                </div>

                <div class="result-card">
                    <div class="final-score animate-score">
                        <div class="score-circle">
                            <span class="result-emoji">{{ winner === 'user' ? '🎉' : '😢' }}</span>
                        </div>
                        <div class="score-message">
                            <span v-if="winner === 'user'" class="common-title3">승리!</span>
                            <span v-else class="common-title3">패배</span>
                        </div>
                    </div>

                    <div class="result-stats animate-stats">
                        <div class="result-stat-item">
                            <span class="result-stat-label">전체 단어</span>
                            <span class="result-stat-value">{{ totalWords }}</span>
                        </div>
                        <div class="result-stat-item">
                            <span class="result-stat-label">내 평균 시간</span>
                            <span class="result-stat-value">{{ userAvgInterval }}초</span>
                        </div>
                        <div class="result-stat-item">
                            <span class="result-stat-label">AI 평균 시간</span>
                            <span class="result-stat-value">{{ aiAvgInterval }}초</span>
                        </div>
                    </div>

                    <!-- 사용한 단어 목록 -->
                    <div class="used-words-section">
                        <div class="section-header">
                            <h4 class="section-title">사용한 단어</h4>
                            <div class="word-legend">
                                <span class="legend-item user">
                                    <span class="legend-icon">🧑</span>
                                    <span class="legend-label">사용자</span>
                                </span>
                                <span class="legend-item ai">
                                    <span class="legend-icon">🤖</span>
                                    <span class="legend-label">AI</span>
                                </span>
                            </div>
                        </div>
                        <div class="used-words-list">
                            <button
                                v-for="(message, idx) in messages"
                                :key="idx"
                                class="word-tag"
                                :class="message.role"
                                @click="showWordMeaning(message.word)"
                            >
                                <span class="word-index">{{ idx + 1 }}</span>
                                <span class="word-text">{{ message.word }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- 랭킹 섹션 -->
                    <div v-if="topRankings.length > 0" class="ranking-section animate-ranking">
                        <h3 class="ranking-title">🏆 끝말잇기 TOP 3 랭킹</h3>
                        <div class="ranking-list">
                            <div
                                v-for="(ranking, index) in topRankings"
                                :key="ranking.id"
                                class="ranking-item"
                                :class="{ 'my-rank': myRankInfo && ranking.id === myRankInfo.gameScoreId }"
                                :style="{ animationDelay: `${0.5 + index * 0.1}s` }"
                            >
                                <div class="ranking-medal">
                                    <span v-if="index === 0" class="medal gold">🥇</span>
                                    <span v-else-if="index === 1" class="medal silver">🥈</span>
                                    <span v-else-if="index === 2" class="medal bronze">🥉</span>
                                </div>
                                <span class="ranking-name">{{ ranking.userName }}</span>
                                <span class="ranking-word-count">{{ ranking.additionalData?.wordCount || ranking.score }}개 단어</span>
                                <span class="ranking-last-word">마지막 단어: {{ ranking.additionalData?.lastWord || '-' }}</span>
                                <span class="ranking-result" :class="ranking.additionalData?.isWin ? 'win' : 'lose'">
                                    {{ ranking.additionalData?.isWin ? '승리' : '패배' }}
                                </span>
                            </div>

                            <!-- 4위 이하이지만 본인 순위가 있을 경우 -->
                            <div v-if="myRankInfo && myRankInfo.rank > 3" class="ranking-separator">
                                <span class="separator-dots">···</span>
                            </div>
                            <div
                                v-if="myRankInfo && myRankInfo.rank > 3"
                                class="ranking-item my-rank"
                                :style="{ animationDelay: '0.8s' }"
                            >
                                <div class="ranking-medal">
                                    <span class="rank-number">{{ myRankInfo.rank }}위</span>
                                </div>
                                <span class="ranking-name">{{ myRankInfo.userName }}</span>
                                <span class="ranking-word-count">{{ userWordsCount }}개 단어</span>
                                <span class="ranking-last-word">마지막 단어: {{ usedWords[usedWords.length - 1] || '-' }}</span>
                                <span class="ranking-result" :class="winner === 'user' ? 'win' : 'lose'">
                                    {{ winner === 'user' ? '승리' : '패배' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="result-actions">
                        <CommonButton @click="restartGame" variant="secondary" size="large">
                            다시 도전
                        </CommonButton>
                        <CommonButton @click="goToGameHub" variant="primary" size="large">
                            게임센터로
                        </CommonButton>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
            {{ toast.message }}
        </div>

        <!-- 단어 뜻 모달 -->
        <div v-if="showWordMeaningModal" class="word-meaning-modal" @click.self="closeWordMeaningModal">
            <div class="word-meaning-card">
                <div class="word-meaning-header">
                    <h3 class="word-title">{{ selectedWordForModal }}</h3>
                </div>
                <div class="word-meanings-content">
                    <div v-if="wordMeanings.length === 0" class="loading-meanings">
                        <div class="spinner"></div>
                        <p>뜻을 조회하는 중...</p>
                    </div>
                    <div v-else class="meanings-list">
                        <div v-for="(meaning, idx) in wordMeanings" :key="idx" class="meaning-item">
                            <span class="meaning-number">{{ idx + 1 }}</span>
                            <span class="meaning-text">{{ meaning }}</span>
                        </div>
                    </div>
                </div>
                <div class="word-meaning-footer">
                    <CommonButton @click="closeWordMeaningModal" variant="primary" size="medium">
                        닫기
                    </CommonButton>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.word-chain-page {
    min-height: 100vh;
    background: var(--gray-50);
    display: flex;
    flex-direction: column;
}

.word-chain-content {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.text-secondary {
    color: var(--gray-600);
}

/* 게임 헤더 */
.game-header {
    background: white;
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-sm);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
}

.back-button {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    color: var(--gray-600);
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
}

.back-button:hover {
    color: var(--gray-900);
}

.header-info {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.header-icon {
    font-size: 48px;
}

.header-text h2 {
    margin: 0 0 4px 0;
    color: var(--gray-900);
}

/* 튜토리얼 */
.tutorial-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.tutorial-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.tutorial-content {
    text-align: center;
    max-width: 680px;
    width: 100%;
    display: flex;
    flex-direction: column;
    height: 100%;
    position: relative;
    justify-content: space-between;
    gap: 24px;
}

.tutorial-icon {
    font-size: 72px;
    margin-bottom: 8px;
    animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

.tutorial-content h3 {
    margin-bottom: 12px;
    color: var(--gray-900);
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.5px;
}

.tutorial-description {
    margin-bottom: 0;
    color: var(--gray-600);
    font-size: 17px;
    line-height: 1.5;
    font-weight: 500;
}

.tutorial-details {
    background: linear-gradient(135deg, var(--gray-50) 0%, #f8f9fa 100%);
    border: 2px solid var(--gray-200);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    text-align: left;
    flex: 0 0 auto;
    min-height: 200px;
    display: flex;
    align-items: flex-start;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.tutorial-details ul {
    margin: 0;
    padding-left: 24px;
    width: 100%;
}

.tutorial-details li {
    margin-bottom: 14px;
    color: var(--gray-800);
    line-height: 1.7;
    font-size: 16px;
    font-weight: 500;
    position: relative;
}

.tutorial-details li:last-child {
    margin-bottom: 0;
}

.tutorial-details li::marker {
    color: var(--common-blue);
    font-weight: 700;
}

.tutorial-progress {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 0;
    flex-shrink: 0;
}

.progress-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--gray-300);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-dot.active {
    width: 32px;
    border-radius: 5px;
    background: var(--common-blue);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
}

.tutorial-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 0;
}

/* 선공/후공 선택 */
.turn-selection-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.turn-selection-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 24px 20px;
    box-shadow: var(--shadow-sm);
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.turn-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    max-width: 700px;
    width: 100%;
}

.turn-option {
    padding: 48px 32px;
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 3px solid transparent;
    text-align: center;
}

.turn-option:hover {
    background: var(--common-blue-light);
    border-color: var(--common-blue);
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
}

.turn-icon {
    font-size: 72px;
    margin-bottom: 16px;
}

.turn-option h4 {
    margin-bottom: 8px;
    color: var(--gray-900);
    font-size: 20px;
}

/* 카운트다운 */
.countdown-section {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}

.countdown-display {
    text-align: center;
}

.countdown-number {
    font-size: 120px;
    font-weight: 700;
    color: var(--common-blue);
    animation: countdown-pulse 1s ease-in-out;
}

.countdown-text {
    font-size: 120px;
    font-weight: 700;
    color: var(--common-blue);
}

.game-start-text {
    display: inline-block;
    animation: gameStartExpand 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes countdown-pulse {
    0% {
        transform: scale(0.5);
        opacity: 0;
    }
    50% {
        transform: scale(1.2);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes gameStartExpand {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    100% {
        transform: scale(15);
        opacity: 0;
    }
}

/* 게임 진행 */
.playing-section {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: white;
    z-index: 999;
}

.game-playing-header {
    padding: 16px 20px;
    border-bottom: 2px solid var(--gray-200);
    background: white;
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    box-shadow: var(--shadow-sm);
}

.back-button {
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    color: var(--gray-600);
    transition: color 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.back-button:hover {
    color: var(--gray-900);
}

.header-info {
    flex: 1;
}

.header-info h3 {
    margin: 0 0 2px 0;
    font-size: 17px;
    font-weight: 600;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 16px;
}

.music-toggle-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 8px;
    transition: transform 0.2s, opacity 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.music-toggle-button:hover {
    transform: scale(1.1);
}

.music-toggle-button:active {
    transform: scale(0.95);
}

.timer-display {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 800;
    font-size: 24px;
}

.timer-value {
    min-width: 50px;
    text-align: center;
}

/* 대화 영역 */
.conversation-area {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: var(--gray-50);
    min-height: 0;
}

.messages-container {
    max-width: 800px;
    width: 100%;
    margin: 0 auto;
    padding-bottom: 8px;
}

.system-message {
    text-align: center;
    padding: 12px;
    background: var(--gray-100);
    border-radius: var(--radius-lg);
    margin-bottom: 12px;
}

.system-message p {
    margin: 0;
    color: var(--gray-700);
    font-weight: 500;
    font-size: 13px;
}

.message {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.message-user {
    flex-direction: row-reverse;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--common-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.message-ai .message-avatar {
    background: var(--info);
}

.message-content {
    max-width: 75%;
}

.message-bubble {
    padding: 12px 16px;
    background: white;
    border-radius: 16px;
    box-shadow: var(--shadow-xs);
}

.message-user .message-bubble {
    background: var(--common-blue);
    color: white;
}

.word-display {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px 0;
}

.message-text {
    margin: 0;
    font-size: 13px;
    opacity: 0.9;
    line-height: 1.4;
}

.typing-bubble {
    padding: 10px 16px;
}

.typing-indicator {
    display: flex;
    gap: 4px;
}

.typing-indicator span {
    width: 7px;
    height: 7px;
    background: var(--gray-500);
    border-radius: 50%;
    animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0%, 60%, 100% {
        opacity: 0.3;
        transform: translateY(0);
    }
    30% {
        opacity: 1;
        transform: translateY(-8px);
    }
}

.message-meta {
    display: flex;
    gap: 10px;
    margin-top: 4px;
    padding: 0 4px;
    font-size: 11px;
    color: var(--gray-500);
}

/* 힌트 섹션 */
.hint-section {
    padding: 10px 14px;
    background: white;
    border-top: 1px solid var(--gray-200);
    text-align: center;
    flex-shrink: 0;
}

.hint-label {
    margin: 0;
    font-size: 13px;
    color: var(--gray-700);
}

.hint-label strong {
    color: var(--common-blue);
    font-size: 16px;
}

.hint-double-consonant {
    margin: 6px 0 0 0;
    padding: 6px 12px;
    background: var(--common-blue-light);
    border-radius: var(--radius-md);
    font-size: 12px;
    color: var(--gray-700);
    display: inline-block;
}

.hint-double-consonant strong {
    color: var(--common-blue);
    font-weight: 700;
}

/* 입력 영역 */
.input-section {
    padding: 10px 14px;
    padding-bottom: max(10px, env(safe-area-inset-bottom));
    background: white;
    border-top: 1px solid var(--gray-200);
    flex-shrink: 0;
    position: relative;
    z-index: 10;
}

.input-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    gap: 8px;
    align-items: center;
}

.text-input {
    flex: 1;
    padding: 9px 16px;
    border: 2px solid var(--gray-200);
    border-radius: 20px;
    font-size: 13px;
    outline: none;
    transition: border-color 0.2s;
}

.text-input:focus {
    border-color: var(--common-blue);
}

.send-button,
.give-up-button {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: var(--gray-100);
    color: var(--gray-600);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    flex-shrink: 0;
}

.send-button:hover {
    background: var(--common-blue);
    color: white;
    transform: scale(1.05);
}

.give-up-button {
    width: auto;
    padding: 0 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
}

.give-up-button:hover {
    background: var(--gray-200);
}

.send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* 결과 화면 */
.result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.result-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 28px 24px;
    box-shadow: var(--shadow-sm);
    text-align: center;
}

.final-score {
    margin-bottom: 28px;
}

.score-circle {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid var(--common-blue);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    background: white;
    box-shadow: var(--shadow-md);
}

.result-emoji {
    font-size: 48px;
}

.score-message {
    text-align: center;
    color: var(--gray-800);
}

/* 결과 애니메이션 */
.animate-score {
    animation: scoreAppear 0.6s ease-out;
}

.animate-stats .result-stat-item {
    animation: statSlideIn 0.5s ease-out both;
}

@keyframes scoreAppear {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes statSlideIn {
    0% {
        transform: translateX(-30px);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.result-stats {
    display: flex;
    justify-content: space-around;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: var(--gray-50);
    border-radius: var(--radius-lg);
}

.result-stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.result-stat-label {
    font-size: 12px;
    color: var(--gray-600);
}

.result-stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--gray-900);
}

/* 랭킹 섹션 */
.ranking-section {
    margin-bottom: 24px;
    padding: 20px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: var(--radius-lg);
    border: 2px solid var(--gray-200);
}

.ranking-title {
    margin: 0 0 16px 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
    text-align: center;
    letter-spacing: -0.3px;
}

.ranking-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.ranking-item {
    display: grid;
    grid-template-columns: 60px 1fr 140px 140px 100px;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background: white;
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.ranking-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ranking-item.my-rank {
    background: white;
    border: 2px solid #ffd700;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
    animation: slideInLeft 0.4s ease-out forwards, glowPulse 2s ease-in-out infinite;
}

.ranking-item.my-rank:hover {
    background: #fffef5;
    transform: translateX(4px) scale(1.02);
}

@keyframes slideInLeft {
    0% {
        opacity: 0;
        transform: translateX(-20px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes glowPulse {
    0%, 100% {
        box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
    }
    50% {
        box-shadow: 0 0 16px rgba(255, 215, 0, 0.4);
    }
}

.ranking-medal {
    font-size: 32px;
    text-align: center;
    flex-shrink: 0;
}

.ranking-name {
    font-size: 15px;
    font-weight: 600;
    color: var(--gray-900);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ranking-word-count {
    font-size: 13px;
    color: var(--gray-600);
    text-align: center;
    font-weight: 500;
}

.ranking-last-word {
    font-size: 13px;
    color: var(--gray-600);
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.ranking-result {
    font-size: 13px;
    font-weight: 700;
    text-align: center;
    justify-self: center;
}

.ranking-result.win {
    color: #1976d2;
}

.ranking-result.lose {
    color: #d32f2f;
}

/* 랭킹 구분선 */
.ranking-separator {
    text-align: center;
    padding: 8px 0;
}

.separator-dots {
    font-size: 24px;
    color: var(--gray-400);
    letter-spacing: 4px;
}

/* 순위 번호 */
.rank-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-700);
}

/* 랭킹 애니메이션 */
.animate-ranking {
    animation: rankingSlideIn 0.6s ease-out;
}

@keyframes rankingSlideIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.ranking-list .ranking-item {
    animation: rankingItemAppear 0.4s ease-out both;
}

.ranking-list .ranking-item:nth-child(1) {
    animation-delay: 0.1s;
}

.ranking-list .ranking-item:nth-child(2) {
    animation-delay: 0.2s;
}

.ranking-list .ranking-item:nth-child(3) {
    animation-delay: 0.3s;
}

@keyframes rankingItemAppear {
    0% {
        opacity: 0;
        transform: translateX(-20px);
    }
    100% {
        opacity: 1;
        transform: translateX(0);
    }
}

/* 사용한 단어 목록 */
.used-words-section {
    margin-bottom: 24px;
    padding: 24px;
    background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
    border-radius: var(--radius-lg);
    border: 2px solid var(--gray-200);
}

.section-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    position: relative;
}

.section-title {
    margin: 0;
    color: var(--gray-900);
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.3px;
}

/* 범례 */
.word-legend {
    display: flex;
    gap: 12px;
    align-items: center;
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
}

.legend-item.user {
    background: var(--common-blue);
    color: white;
}

.legend-item.ai {
    background: white;
    color: var(--gray-700);
    border: 1px solid var(--gray-300);
}

.legend-icon {
    font-size: 14px;
}

.legend-label {
    font-size: 11px;
}

.used-words-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    max-height: 400px;
    overflow-y: auto;
    padding: 16px;
    background: white;
    border-radius: var(--radius-md);
}

.word-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.word-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 사용자 단어 - 게임 메시지와 동일한 파란색 */
.word-tag.user {
    background: var(--common-blue);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);
}

.word-tag.user:hover {
    background: #005cbf;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

/* AI 단어 - 게임 메시지와 동일한 흰색 */
.word-tag.ai {
    background: white;
    color: var(--gray-700);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.word-tag.ai:hover {
    background: var(--gray-50);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.word-index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
}

.word-tag.user .word-index {
    background: rgba(255, 255, 255, 0.25);
    color: white;
}

.word-tag.ai .word-index {
    background: var(--gray-100);
    color: var(--gray-600);
}

.word-text {
    font-size: 14px;
    font-weight: 600;
}

.result-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
}

/* Toast */
.toast {
    position: fixed;
    top: var(--spacing-lg);
    left: 50%;
    transform: translateX(-50%);
    padding: var(--spacing-md) var(--spacing-lg);
    background: white;
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-lg);
    z-index: 9999;
    font-weight: 500;
    animation: toastAppear 0.3s ease-out;
}

.toast-success {
    background: var(--success);
    color: white;
}

.toast-error {
    background: var(--danger);
    color: white;
}

@keyframes toastAppear {
    0% {
        transform: translateX(-50%) translateY(-20px);
        opacity: 0;
    }
    100% {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
}

/* 트랜지션 */
.message-list-enter-active,
.message-list-leave-active {
    transition: all 0.3s ease;
}

.message-list-enter-from {
    opacity: 0;
    transform: translateY(16px);
}

.message-list-leave-to {
    opacity: 0;
    transform: translateX(-16px);
}

/* 모바일 반응형 */
@media (max-width: 768px) {
    .word-chain-content {
        padding: 0;
    }

    .playing-section {
        height: 100vh;
        border-radius: 0;
    }

    .tutorial-card,
    .turn-selection-card {
        padding: 32px 24px;
    }

    .turn-options {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .turn-option {
        padding: 40px 24px;
    }

    .turn-icon {
        font-size: 64px;
    }

    .turn-option h4 {
        font-size: 18px;
    }

    /* 랭킹 섹션 반응형 */
    .ranking-item {
        grid-template-columns: 50px 1fr 120px 120px 80px;
        gap: 12px;
        padding: 14px 16px;
    }

    .ranking-medal {
        font-size: 28px;
    }

    .ranking-name {
        font-size: 14px;
    }

    .ranking-word-count,
    .ranking-last-word,
    .ranking-result {
        font-size: 12px;
    }
}

@media (max-width: 480px) {
    .word-chain-content {
        padding: 0;
    }

    .playing-section {
        bottom: 0;
    }

    .hint-section {
        padding-bottom: 8px;
    }

    .input-section {
        padding-bottom: max(10px, env(safe-area-inset-bottom));
    }

    .game-header {
        padding: 12px 16px;
        margin-bottom: 12px;
    }

    .header-icon {
        font-size: 32px;
    }

    .tutorial-icon {
        font-size: 56px;
    }

    .tutorial-card,
    .turn-selection-card {
        padding: 28px 20px;
    }

    .turn-option {
        padding: 36px 20px;
    }

    .turn-icon {
        font-size: 60px;
    }

    .turn-option h4 {
        font-size: 17px;
    }

    .conversation-area {
        padding: 12px;
    }

    .message-avatar {
        width: 32px;
        height: 32px;
        font-size: 16px;
    }

    .word-display {
        font-size: 16px;
    }

    .message-text {
        font-size: 11px;
    }

    .countdown-number {
        font-size: 88px;
    }

    .countdown-text {
        font-size: 48px;
    }

    .result-card {
        padding: 28px 20px;
    }

    .score-circle {
        width: 100px;
        height: 100px;
    }

    .result-emoji {
        font-size: 48px;
    }

    .result-stats {
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px;
    }

    .result-stat-value {
        font-size: 22px;
    }

    /* 랭킹 섹션 반응형 - 모바일 */
    .ranking-item {
        grid-template-columns: 40px 1fr 100px 100px 70px;
        gap: 8px;
        padding: 12px 14px;
    }

    .ranking-medal {
        font-size: 24px;
    }

    .ranking-name {
        font-size: 13px;
    }

    .ranking-word-count,
    .ranking-last-word,
    .ranking-result {
        font-size: 11px;
    }

    .ranking-title {
        font-size: 16px;
    }

    .ranking-section {
        padding: 16px;
    }

    .used-words-section {
        padding: 18px;
    }

    .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }

    .section-title {
        font-size: 16px;
    }

    .word-legend {
        gap: 8px;
    }

    .legend-item {
        padding: 3px 8px;
        gap: 4px;
    }

    .legend-icon {
        font-size: 12px;
    }

    .legend-label {
        font-size: 10px;
    }

    .used-words-list {
        max-height: 300px;
        padding: 12px;
        gap: 8px;
    }

    .word-tag {
        padding: 7px 12px;
        font-size: 13px;
    }

    .word-index {
        width: 18px;
        height: 18px;
        font-size: 10px;
    }

    .word-text {
        font-size: 13px;
    }
}

/* 단어 뜻 모달 */
.word-meaning-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(3px);
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.word-meaning-card {
    background: white;
    border-radius: 20px;
    padding: 0;
    max-width: 420px;
    width: 90%;
    max-height: 70vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
    animation: slideUp 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}

@keyframes slideUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.word-meaning-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--gray-100);
    position: relative;
    background: var(--gray-50);
}

.word-meaning-header .word-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--gray-900);
    margin: 0;
    letter-spacing: -0.4px;
    text-align: center;
}

.word-meanings-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 120px;
}

.loading-meanings {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: var(--gray-500);
}

.spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--gray-200);
    border-top-color: var(--gray-500);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 12px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.loading-meanings p {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
}

.meanings-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.meaning-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 12px 14px;
    background: var(--gray-50);
    border-radius: 12px;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.meaning-item:hover {
    background: var(--common-blue-light);
    border-color: var(--common-blue);
}

.meaning-number {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    background: var(--common-blue);
    color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
}

.meaning-text {
    flex: 1;
    font-size: 14px;
    line-height: 1.6;
    color: var(--gray-800);
    font-weight: 500;
}

.word-meaning-footer {
    padding: 14px 20px;
    border-top: 1px solid var(--gray-100);
    display: flex;
    justify-content: center;
    background: white;
}

@media (max-width: 768px) {
    .word-meaning-card {
        width: 92%;
        max-height: 75vh;
    }

    .word-meaning-header {
        padding: 14px 18px;
    }

    .word-meaning-header .word-title {
        font-size: 18px;
    }

    .word-meanings-content {
        padding: 16px;
    }

    .word-meaning-footer {
        padding: 12px 16px;
    }

    .meaning-item {
        padding: 10px 12px;
    }

    .meaning-text {
        font-size: 13px;
    }
}

@media (max-width: 480px) {
    .word-meaning-header .word-title {
        font-size: 20px;
    }

    .meaning-item {
        padding: 12px 14px;
        gap: 10px;
    }

    .meaning-text {
        font-size: 13px;
    }

    .meaning-number {
        width: 20px;
        height: 20px;
        font-size: 11px;
    }
}
</style>
