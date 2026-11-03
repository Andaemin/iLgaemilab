<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import AppHeader from '@/components/common/AppHeader.vue';
import CommonButton from '@/components/common/CommonButton.vue';
import { logGamePlay } from '@/utils/gameStats';
import {
  generateSmartQuestion,
  parseKoreanWords,
  validateAnswerWithNaver
} from '@/utils/wordGame.js';

const router = useRouter();
const { t } = useI18n();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';

// 입력창 ref
const answerInputRef = ref(null);

// 음원 관련
const bgMusic = ref(null);
const isMusicMuted = ref(localStorage.getItem('initialConsonantMusicMuted') === 'true');

// 게임 상태
const gameState = ref('tutorial'); // tutorial, countdown, playing, result
const currentTutorialStep = ref(0);
const countdownValue = ref(3);

// 게임 데이터
const currentQuestion = ref(null);
const userAnswer = ref('');
const score = ref(0);
const timeLeft = ref(60);
const answeredQuestions = ref([]);
const isLoading = ref(false);
const gameTimer = ref(null);
const csvWords = ref([]);
const isTimerPaused = ref(false);
const isScoreAnimating = ref(false);
const comboCount = ref(0);
const maxCombo = ref(0);

// Toast notification
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// 랭킹 관련
const topRankings = ref([]);
const isLoadingRankings = ref(false);
const isSavingScore = ref(false);
const myRankInfo = ref(null);  // 내 순위 정보 { rank, score, userId }
const currentUserId = ref(null);  // 현재 로그인한 사용자 ID

// 현재 사용자 이름 (myRankInfo 또는 TOP 3 랭킹에서 가져오기)
const currentUserName = computed(() => {
  // 1순위: myRankInfo에 userName이 있으면 사용
  if (myRankInfo.value && myRankInfo.value.userName) {
    return myRankInfo.value.userName;
  }
  // 2순위: TOP 3 랭킹에서 찾기
  const userRanking = topRankings.value.find(r => r.userId === currentUserId.value);
  return userRanking ? userRanking.userName : '사용자';
});

// 튜토리얼 단계 - 자세한 정보 포함
const tutorialSteps = computed(() => [
  {
    title: t('games.tutorials.initialConsonant.steps.0.title'),
    description: t('games.tutorials.initialConsonant.steps.0.description'),
    icon: t('games.tutorials.initialConsonant.steps.0.icon'),
    details: [
      t('games.tutorials.initialConsonant.steps.0.details.0'),
      t('games.tutorials.initialConsonant.steps.0.details.1'),
      t('games.tutorials.initialConsonant.steps.0.details.2'),
      t('games.tutorials.initialConsonant.steps.0.details.3')
    ]
  },
  {
    title: t('games.tutorials.initialConsonant.steps.1.title'),
    description: t('games.tutorials.initialConsonant.steps.1.description'),
    icon: t('games.tutorials.initialConsonant.steps.1.icon'),
    details: [
      t('games.tutorials.initialConsonant.steps.1.details.0'),
      t('games.tutorials.initialConsonant.steps.1.details.1'),
      t('games.tutorials.initialConsonant.steps.1.details.2'),
      t('games.tutorials.initialConsonant.steps.1.details.3')
    ]
  },
  {
    title: t('games.tutorials.initialConsonant.steps.2.title'),
    description: t('games.tutorials.initialConsonant.steps.2.description'),
    icon: t('games.tutorials.initialConsonant.steps.2.icon'),
    details: [
      t('games.tutorials.initialConsonant.steps.2.details.0'),
      t('games.tutorials.initialConsonant.steps.2.details.1'),
      t('games.tutorials.initialConsonant.steps.2.details.2'),
      t('games.tutorials.initialConsonant.steps.2.details.3'),
      t('games.tutorials.initialConsonant.steps.2.details.4')
    ]
  },
  {
    title: t('games.tutorials.initialConsonant.steps.3.title'),
    description: t('games.tutorials.initialConsonant.steps.3.description'),
    icon: t('games.tutorials.initialConsonant.steps.3.icon'),
    details: [
      t('games.tutorials.initialConsonant.steps.3.details.0'),
      t('games.tutorials.initialConsonant.steps.3.details.1'),
      t('games.tutorials.initialConsonant.steps.3.details.2'),
      t('games.tutorials.initialConsonant.steps.3.details.3'),
      t('games.tutorials.initialConsonant.steps.3.details.4')
    ]
  }
]);

// CSV 데이터 로딩
const loadCSVWords = async () => {
  try {
    const response = await fetch('/data/koreanWords.csv');
    const csvText = await response.text();
    const words = parseKoreanWords(csvText);
    csvWords.value = words;
    console.log(`📊 CSV 데이터 로딩 완료: ${words.length}개 단어`);
    return words;
  } catch (error) {
    console.error('CSV 데이터 로딩 실패:', error);
    csvWords.value = [];
    return [];
  }
};

// 게임 시작 (카운트다운 시작)
const startGame = async () => {
  await loadCSVWords();
  gameState.value = 'countdown';
  countdownValue.value = 3;
  startCountdown();

  // 게임 플레이 로그 기록 (인기 게임 통계용)
  logGamePlay('initial_consonant');
};

// 카운트다운
const startCountdown = () => {
  const countdownInterval = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value < 0) {
      clearInterval(countdownInterval);
      // Game Start 확대 애니메이션과 동시에 게임 시작
      setTimeout(() => {
        beginGame();
      }, 600);
    }
  }, 1000);
};

// 실제 게임 시작
const beginGame = () => {
  gameState.value = 'playing';
  score.value = 0;
  timeLeft.value = 60;
  answeredQuestions.value = [];
  isTimerPaused.value = false;
  comboCount.value = 0;
  maxCombo.value = 0;
  generateNewQuestion();
  startTimer();
  playMusic(); // 게임 시작 시 음악 재생
};

// 타이머 시작
const startTimer = () => {
  gameTimer.value = setInterval(() => {
    if (!isTimerPaused.value) {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        endGame();
      }
    }
  }, 1000);
};

// 타이머 일시정지
const pauseTimer = () => {
  isTimerPaused.value = true;
};

// 타이머 재개
const resumeTimer = () => {
  isTimerPaused.value = false;
};

// 새 문제 생성
const generateNewQuestion = async () => {
  const question = generateSmartQuestion(csvWords.value, {
    maxLength: 2,
    difficulty: 'easy'
  });
  currentQuestion.value = question;
  userAnswer.value = '';
  console.log('🎯 새 문제 생성:', question);

  // 다음 틱에 입력창 포커스
  await nextTick();
  if (answerInputRef.value) {
    answerInputRef.value.focus();
  }
};

// Toast notification
const showToast = (message, type = 'success') => {
  toast.value.message = message;
  toast.value.type = type;
  toast.value.show = true;

  setTimeout(() => {
    toast.value.show = false;
  }, type === 'success' ? 2000 : 1000);
};

// 정답 제출
const submitAnswer = async () => {
  if (!userAnswer.value.trim() || !currentQuestion.value || isLoading.value) return;

  // 중복 답변 검사 (같은 초성에 같은 답변이 이미 있는지 확인)
  const currentInitials = currentQuestion.value.initials;
  const currentAnswer = userAnswer.value.trim();
  const isDuplicate = answeredQuestions.value.some(
    q => q.initials === currentInitials && q.userAnswer === currentAnswer && q.isCorrect
  );

  if (isDuplicate) {
    // 중복 답변 처리
    showToast('이미 사용한 답변입니다! 다른 단어를 입력하세요 😢', 'error');
    userAnswer.value = '';

    // 입력창 포커스
    await nextTick();
    if (answerInputRef.value) {
      answerInputRef.value.focus();
    }
    return;
  }

  isLoading.value = true;
  // API 검증 시작 시 타이머 일시정지
  pauseTimer();

  try {
    // 국립국어원 API 기반 검증
    const result = await validateAnswerWithNaver(
      userAnswer.value.trim(),
      currentQuestion.value.initials
    );

    const gameResult = {
      id: Date.now(),
      initials: currentQuestion.value.initials,
      userAnswer: userAnswer.value.trim(),
      isCorrect: result.isValid,
      timestamp: new Date(),
      message: result.message,
      meaning: result.meaning || '' // 단어 뜻 추가
    };

    answeredQuestions.value.push(gameResult);

    if (result.isValid) {
      // 정답 처리 - 타이머는 이미 일시정지 상태 유지
      score.value += 10;
      comboCount.value++;
      maxCombo.value = Math.max(maxCombo.value, comboCount.value);

      // 콤보 보너스
      if (comboCount.value >= 5) {
        score.value += comboCount.value * 2;
      }

      // 점수 애니메이션 트리거
      isScoreAnimating.value = true;
      setTimeout(() => {
        isScoreAnimating.value = false;
      }, 600);

      showToast('정답입니다 😊', 'success');

      // 2초 대기 후 다음 문제로 (사용자가 뜻을 볼 시간 제공)
      setTimeout(async () => {
        await generateNewQuestion();
        resumeTimer(); // 다음 문제로 넘어가면 타이머 재개
      }, 2000);
    } else {
      // 오답 처리 - 콤보 초기화 및 타이머 재개
      comboCount.value = 0;
      showToast('오답입니다 😢', 'error');

      // 타이머 즉시 재개
      resumeTimer();

      // 1초 후 입력창 포커스
      setTimeout(async () => {
        // 입력창 포커스
        await nextTick();
        if (answerInputRef.value) {
          answerInputRef.value.focus();
        }
      }, 1000);
      userAnswer.value = '';
    }
  } catch (error) {
    console.error('답안 제출 오류:', error);
    // 에러 발생 시에도 타이머 재개
    resumeTimer();
  } finally {
    isLoading.value = false;
  }
};

// 문제 넘어가기
const skipQuestion = () => {
  answeredQuestions.value.push({
    id: Date.now(),
    initials: currentQuestion.value.initials,
    userAnswer: '건너뜀',
    isCorrect: false,
    timestamp: new Date(),
    message: '문제를 건너뛰었습니다',
    skipped: true
  });

  comboCount.value = 0; // 콤보 초기화
  pauseTimer();
  setTimeout(async () => {
    await generateNewQuestion();
    resumeTimer();
  }, 500);
};

// 현재 사용자 ID 가져오기
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // JWT 토큰 디코딩 (payload 부분만)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.id;
  } catch (error) {
    console.error('사용자 ID 가져오기 실패:', error);
    return null;
  }
};

// 게임 점수 저장
const saveScore = async () => {
  try {
    isSavingScore.value = true;
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('로그인하지 않은 사용자 - 점수 저장 스킵');
      return;
    }

    const correctCount = answeredQuestions.value.filter(q => q.isCorrect).length;
    const totalQuestions = answeredQuestions.value.length;

    console.log('📤 점수 저장 요청:', {
      gameType: 'initial_consonant',
      score: score.value,
      accuracy: accuracy.value,
      maxCombo: maxCombo.value
    });

    const response = await axios.post(
      `${API_URL}/api/game-scores`,
      {
        gameType: 'initial_consonant',
        score: score.value,
        additionalData: {
          accuracy: accuracy.value,
          maxCombo: maxCombo.value,
          correctCount: correctCount,
          totalQuestions: totalQuestions
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('📥 API 응답:', response.data);

    // 내 순위 정보 저장 (이번 차시 플레이 정보)
    if (response.data.success && response.data.data && response.data.data.rank) {
      myRankInfo.value = {
        rank: response.data.data.rank,
        score: score.value,
        userId: currentUserId.value,
        gameScoreId: response.data.data.gameScore.id,  // 이번 플레이의 고유 ID
        userName: response.data.data.userName  // 사용자명
      };
      console.log('✅ 내 순위 정보 저장:', myRankInfo.value);
    } else {
      console.warn('⚠️ 순위 정보 없음:', response.data);
    }
  } catch (error) {
    console.error('❌ 점수 저장 실패:', error);
  } finally {
    isSavingScore.value = false;
  }
};

// 랭킹 조회
const fetchRankings = async () => {
  try {
    isLoadingRankings.value = true;
    const response = await axios.get(
      `${API_URL}/api/game-scores/rankings/initial_consonant?limit=3`
    );

    if (response.data.success) {
      topRankings.value = response.data.data;
      console.log('🏆 TOP 3 랭킹 조회 완료');
    }
  } catch (error) {
    console.error('❌ 랭킹 조회 실패:', error);
    topRankings.value = [];
  } finally {
    isLoadingRankings.value = false;
  }
};

// 게임 종료
const endGame = async () => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value);
  }
  pauseMusic(); // 게임 종료 시 음악 정지
  gameState.value = 'result';

  console.log('🎮 게임 종료 - 현재 사용자 ID:', currentUserId.value);

  // 점수 저장 및 랭킹 조회
  await saveScore();
  await fetchRankings();

  console.log('📊 최종 상태 - myRankInfo:', myRankInfo.value);
  console.log('📊 최종 상태 - topRankings:', topRankings.value);
};

// 다시 시작
const restartGame = async () => {
  await loadCSVWords();
  gameState.value = 'countdown';
  countdownValue.value = 3;
  startCountdown();
};

// 게임 허브로 돌아가기
const goToGameHub = () => {
  pauseMusic(); // 페이지 이동 시 음악 정지
  router.push('/game');
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
    startGame();
  }
};

// 튜토리얼 건너뛰기
const skipTutorial = () => {
  startGame();
};

// 시간 포맷
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// 정답률 계산
const accuracy = computed(() => {
  if (answeredQuestions.value.length === 0) return 0;
  const correct = answeredQuestions.value.filter(q => q.isCorrect).length;
  return Math.round((correct / answeredQuestions.value.length) * 100);
});

// 음원 초기화 및 재생
const initMusic = () => {
  if (!bgMusic.value) {
    bgMusic.value = new Audio('/audio/IcecreamSong.mp3');
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
  localStorage.setItem('initialConsonantMusicMuted', isMusicMuted.value);

  if (isMusicMuted.value) {
    pauseMusic();
  } else {
    playMusic();
  }
};

// 컴포넌트 초기화
onMounted(() => {
  // 현재 로그인한 사용자 ID 가져오기
  currentUserId.value = getCurrentUserId();
});

// 컴포넌트 정리
onUnmounted(() => {
  if (gameTimer.value) {
    clearInterval(gameTimer.value);
  }
  pauseMusic();
});

// 게임 상태 변경 시 스크롤 맨 위로
watch(gameState, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div class="game-page">
    <AppHeader />

    <div class="game-content">
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
              <h2 class="common-title2">{{ t('games.tutorials.initialConsonant.gameExplanation') }}</h2>
              <p class="common-caption text-secondary">{{ t('games.tutorials.initialConsonant.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
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
                {{ t('games.tutorials.initialConsonant.previous') }}
              </CommonButton>
              <CommonButton
                v-else
                @click="skipTutorial"
                variant="secondary"
                size="large"
              >
                {{ t('games.tutorials.initialConsonant.startDirectly') }}
              </CommonButton>
              <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.initialConsonant.next') : t('games.tutorials.initialConsonant.startGame') }}
              </CommonButton>
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
        <div class="game-header">
          <button class="back-button" @click="goToGameHub">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">🎯</div>
            <div class="header-text">
              <h2 class="common-title3">초성게임</h2>
              <p class="common-caption text-secondary">{{ answeredQuestions.length }}개 답변</p>
            </div>
          </div>
          <div class="header-center">
            <div v-if="isTimerPaused" class="timer-paused-badge">
              ⏸️ 일시정지
            </div>
          </div>
          <div class="header-stats">
            <div class="stat-item" v-if="comboCount >= 2">
              <span class="stat-label">콤보</span>
              <span class="stat-value combo-value">🔥 {{ comboCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">점수</span>
              <span class="stat-value" :class="{ 'score-bounce': isScoreAnimating }">{{ score }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">시간</span>
              <span class="stat-value" :class="{ 'time-warning': timeLeft <= 10 }">{{ formattedTime }}</span>
            </div>
            <button class="music-toggle-button" @click="toggleMusic" :title="isMusicMuted ? '음악 켜기' : '음악 끄기'">
              {{ isMusicMuted ? '🔇' : '🔊' }}
            </button>
          </div>
        </div>

        <div class="question-section">
          <div class="question-card">
            <p class="question-label common-caption text-secondary">초성</p>
            <div class="initials-display">
              {{ currentQuestion?.formattedInitials || currentQuestion?.initials || '...' }}
            </div>
            <p class="question-hint common-caption text-secondary">
              국립국어원 표준국어대사전에 등재된 2글자 단어를 입력하세요.
            </p>
          </div>

          <div class="answer-input-area">
            <input
              ref="answerInputRef"
              v-model="userAnswer"
              type="text"
              placeholder="정답을 입력하세요."
              @keyup.enter="submitAnswer"
              :disabled="isLoading"
              class="answer-input"
              autofocus
            />
            <CommonButton
              @click="submitAnswer"
              :disabled="!userAnswer.trim() || isLoading"
              variant="primary"
              size="large"
            >
              {{ isLoading ? '확인 중...' : '제출' }}
            </CommonButton>
            <CommonButton
              @click="skipQuestion"
              :disabled="isLoading"
              variant="secondary"
              size="large"
            >
              넘어가기
            </CommonButton>
          </div>
        </div>

        <!-- 최근 답변 기록 -->
        <div v-if="answeredQuestions.length > 0" class="history-section">
          <h3 class="common-title4">최근 답변</h3>
          <div class="history-list">
            <div
              v-for="(item, idx) in answeredQuestions.slice(-5).reverse()"
              :key="idx"
              class="history-item"
              :class="{ correct: item.isCorrect, incorrect: !item.isCorrect, skipped: item.skipped }"
            >
              <span class="history-question">{{ item.initials }}</span>
              <span class="history-arrow">→</span>
              <span class="history-answer">{{ item.userAnswer }}</span>
              <span class="history-icon">{{ item.isCorrect ? '✅' : item.skipped ? '⏭️' : '❌' }}</span>
              <span class="history-meaning" v-if="item.isCorrect && item.meaning">{{ item.meaning }}</span>
              <span class="history-message" v-if="!item.isCorrect && item.message">{{ item.message }}</span>
            </div>
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
              <span class="score-value">{{ score }}</span>
              <span class="score-label">점</span>
            </div>
            <div class="score-message">
              <span v-if="accuracy >= 80" class="common-title4">🎉 훌륭해요!</span>
              <span v-else-if="accuracy >= 60" class="common-title4">👍 잘했어요!</span>
              <span v-else-if="accuracy >= 40" class="common-title4">💪 괜찮아요!</span>
              <span v-else class="common-title4">😊 다시 도전!</span>
            </div>
          </div>

          <div class="result-stats animate-stats">
            <div class="result-stat-item" style="animation-delay: 0.1s">
              <span class="result-stat-label">정답 수</span>
              <span class="result-stat-value">{{ answeredQuestions.filter(q => q.isCorrect).length }}</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.2s">
              <span class="result-stat-label">오답 수</span>
              <span class="result-stat-value">{{ answeredQuestions.filter(q => !q.isCorrect).length }}</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.3s">
              <span class="result-stat-label">정답률</span>
              <span class="result-stat-value">{{ accuracy }}%</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.4s">
              <span class="result-stat-label">최대 콤보</span>
              <span class="result-stat-value">{{ maxCombo }}연속</span>
            </div>
          </div>

          <!-- 랭킹 섹션 -->
          <div v-if="topRankings.length > 0" class="ranking-section animate-ranking">
            <h3 class="ranking-title">🏆 초성게임 TOP 3 랭킹</h3>
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
                <span class="ranking-accuracy">정답률 {{ ranking.additionalData?.accuracy }}%</span>
                <span class="ranking-combo" v-if="ranking.additionalData?.maxCombo > 0">최대 콤보 {{ ranking.additionalData?.maxCombo }}</span>
                <span class="ranking-combo-empty" v-else>-</span>
                <span class="ranking-score">{{ ranking.score }}점</span>
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
                <span class="ranking-name">{{ currentUserName }}</span>
                <span class="ranking-accuracy">정답률 {{ accuracy }}%</span>
                <span class="ranking-combo" v-if="maxCombo > 0">최대 콤보 {{ maxCombo }}</span>
                <span class="ranking-combo-empty" v-else>-</span>
                <span class="ranking-score">{{ myRankInfo.score }}점</span>
              </div>
            </div>
          </div>
          <div v-else-if="isLoadingRankings" class="ranking-loading">
            <span class="loading-spinner">⏳</span>
            <span>랭킹을 불러오는 중...</span>
          </div>

          <div class="result-actions animate-actions">
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
  </div>
</template>

<style scoped>
.game-page {
  min-height: 100vh;
  background: var(--gray-50);
  display: flex;
  flex-direction: column;
}

.game-content {
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

/* 게임 헤더 (연습 화면과 동일한 너비) */
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

.header-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.header-stats {
  display: flex;
  gap: 24px;
  align-items: center;
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

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: var(--gray-600);
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  transition: all 0.3s ease;
}

.stat-value.score-bounce {
  animation: scorePop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes scorePop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.4);
    color: var(--common-blue);
  }
  50% {
    transform: scale(1.3) rotate(-5deg);
    color: var(--common-blue);
  }
  70% {
    transform: scale(1.3) rotate(5deg);
    color: var(--common-blue);
  }
  100% {
    transform: scale(1) rotate(0deg);
    color: var(--gray-900);
  }
}

.time-warning {
  color: var(--danger) !important;
  font-weight: 700 !important;
  animation: pulse-warning 1s infinite;
}

@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.combo-value {
  color: #FF6B6B !important;
  animation: comboPulse 0.3s ease;
}

@keyframes comboPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

/* 일시정지 배지 (헤더 가운데) */
.timer-paused-badge {
  padding: 8px 16px;
  background: var(--common-blue-light);
  border: 2px solid var(--common-blue);
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 600;
  color: var(--common-blue);
  animation: badgePulse 1.5s ease-in-out infinite;
  white-space: nowrap;
  pointer-events: auto;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
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
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-section {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 20px;
  overflow: hidden;
}

.question-card {
  text-align: center;
  padding: 40px 20px;
}

.question-label {
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.initials-display {
  font-size: 56px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
  letter-spacing: 8px;
}

.question-hint {
  color: var(--gray-600);
}

.answer-input-area {
  padding: 20px;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 12px;
}

.answer-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-lg);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.answer-input:focus {
  border-color: var(--common-blue);
}

/* 답변 기록 */
.history-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
}

.history-section h3 {
  margin-bottom: 16px;
  color: var(--gray-900);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  font-size: 14px;
  flex-wrap: wrap;
}

.history-item.correct {
  background: #e8f5e9;
}

.history-item.incorrect {
  background: #ffebee;
}

.history-item.skipped {
  background: #f5f5f5;
}

.history-question {
  font-weight: 600;
  color: var(--gray-900);
}

.history-arrow {
  color: var(--gray-400);
}

.history-answer {
  color: var(--gray-700);
}

.history-icon {
  font-size: 16px;
}

.history-meaning {
  width: 100%;
  margin-top: 4px;
  color: var(--common-blue);
  font-size: 12px;
  font-weight: 500;
}

.history-message {
  width: 100%;
  margin-top: 4px;
  color: var(--gray-600);
  font-size: 12px;
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
  padding: 40px;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.final-score {
  margin-bottom: 40px;
}

.score-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 6px solid var(--common-blue);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  background: white;
  box-shadow: var(--shadow-md);
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
}

.score-label {
  font-size: 16px;
  color: var(--gray-600);
  margin-top: 4px;
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

.animate-actions {
  animation: fadeInUp 0.5s ease-out 0.4s both;
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

@keyframes fadeInUp {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.result-stats {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-bottom: 40px;
  padding: 20px;
  background: var(--gray-50);
  border-radius: var(--radius-lg);
}

.result-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.result-stat-label {
  font-size: 14px;
  color: var(--gray-600);
}

.result-stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
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

/* 모바일 반응형 */
@media (max-width: 768px) {
  .game-content {
    padding: 16px;
  }

  .game-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .header-center {
    position: static;
    transform: none;
    order: 2;
    align-self: center;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
    gap: 16px;
  }

  .tutorial-card {
    padding: 32px 20px;
  }

  .initials-display {
    font-size: 48px;
  }

  .countdown-number {
    font-size: 80px;
  }

  .countdown-text {
    font-size: 48px;
  }
}

@media (max-width: 480px) {
  .game-content {
    padding: 12px;
  }

  .game-page {
    height: 100vh;
    height: 100dvh;
  }

  .header-icon {
    font-size: 36px;
  }

  .tutorial-icon {
    font-size: 64px;
  }

  .tutorial-actions,
  .result-actions {
    flex-direction: column;
    width: 100%;
  }

  .initials-display {
    font-size: 40px;
    letter-spacing: 4px;
  }

  .answer-input-area {
    flex-direction: column;
  }

  .question-card {
    padding: 30px 16px;
  }

  .initials-display {
    font-size: 44px;
  }

  .score-circle {
    width: 120px;
    height: 120px;
  }

  .score-value {
    font-size: 36px;
  }

  .countdown-number {
    font-size: 64px;
  }

  .countdown-text {
    font-size: 36px;
  }

  .header-stats {
    flex-wrap: wrap;
  }

  .ranking-item {
    grid-template-columns: 50px 1fr 100px 100px 80px;
    padding: 12px 16px;
    gap: 10px;
  }

  .medal {
    font-size: 28px;
  }

  .rank-number {
    font-size: 16px;
  }

  .ranking-name {
    font-size: 14px;
  }

  .ranking-accuracy {
    font-size: 12px;
  }

  .ranking-combo {
    font-size: 11px;
    padding: 3px 6px;
  }

  .ranking-combo-empty {
    font-size: 12px;
  }

  .ranking-score {
    font-size: 16px;
  }
}

/* 랭킹 섹션 */
.ranking-section {
  margin-top: 24px;
  margin-bottom: 24px;  /* 버튼과의 여백 추가 */
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  opacity: 0;
  transform: translateY(20px);
}

.ranking-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 16px 0;
  text-align: center;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: grid;
  grid-template-columns: 60px 1fr 140px 140px 100px;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.4s ease-out forwards;
  position: relative;
}

.ranking-item:hover {
  background: var(--gray-100);
  transform: translateX(4px);
}

/* 본인 순위 강조 */
.ranking-item.my-rank {
  background: white;  /* 흰색 배경 */
  border: 2px solid #ffd700;  /* 노란색 테두리만 */
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
  animation: slideInLeft 0.4s ease-out forwards, glowPulse 2s ease-in-out infinite;
}

.ranking-item.my-rank:hover {
  background: #fffef5;  /* 호버 시 아주 연한 노란색 */
  transform: translateX(4px) scale(1.02);
}

.ranking-medal {
  display: flex;
  align-items: center;
  justify-content: center;
}

.medal {
  font-size: 32px;
  animation: medalRotate 0.6s ease-out;
}

.rank-number {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-700);
}

.ranking-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
}

.ranking-accuracy {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  white-space: nowrap;
  text-align: center;
}

.ranking-combo {
  font-size: 13px;
  font-weight: 500;
  color: #ff6b6b;
  padding: 4px 10px;
  background: rgba(255, 107, 107, 0.08);
  border-radius: 6px;
  white-space: nowrap;
  text-align: center;
  justify-self: center;
}

.ranking-combo-empty {
  font-size: 14px;
  color: var(--gray-400);
  text-align: center;
}

.ranking-score {
  font-size: 18px;
  font-weight: 700;
  color: var(--common-blue);
  text-align: right;
  white-space: nowrap;
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

.ranking-loading {
  margin-top: 24px;
  padding: 32px;
  text-align: center;
  color: var(--gray-600);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.loading-spinner {
  display: inline-block;
  font-size: 24px;
  margin-bottom: 8px;
  animation: spin 2s linear infinite;
}

/* 애니메이션 */
.animate-ranking {
  animation: fadeInUp 0.5s ease-out 0.5s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes medalRotate {
  0% {
    transform: rotate(0deg) scale(0);
  }
  50% {
    transform: rotate(180deg) scale(1.2);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes glowPulse {
  0%, 100% {
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
  }
  50% {
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.4);
  }
}
</style>
