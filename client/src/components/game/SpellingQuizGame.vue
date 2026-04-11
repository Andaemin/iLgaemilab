<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import AppHeader from '@/components/common/AppHeader.vue';
import CommonButton from '@/components/common/CommonButton.vue';
import { logGamePlay } from '@/utils/gameStats';

const router = useRouter();
const { t } = useI18n();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';

// 음원 관련
const bgMusic = ref(null);
const isMusicMuted = ref(localStorage.getItem('spellingQuizMusicMuted') === 'true');

// 랭킹 관련
const topRankings = ref([]);
const isLoadingRankings = ref(false);
const isSavingScore = ref(false);
const myRankInfo = ref(null);
const currentUserId = ref(null);

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

// 내 랭킹인지 확인 (동점자 처리 포함)
const isMyRank = (ranking) => {
  if (!myRankInfo.value) return false;

  // 정확히 일치하는 레코드가 있으면 우선
  if (ranking.id === myRankInfo.value.gameScoreId) return true;

  // 동점자 처리: 같은 userId와 score를 가진 경우도 표시
  // 단, topRankings 중에 gameScoreId가 정확히 일치하는 것이 없을 때만
  const hasExactMatch = topRankings.value.some(r => r.id === myRankInfo.value.gameScoreId);
  if (!hasExactMatch && ranking.userId === myRankInfo.value.userId && ranking.score === myRankInfo.value.score) {
    return true;
  }

  return false;
};

// 게임 상태
const gameState = ref('tutorial'); // tutorial, question-count-select, countdown, playing, result
const currentTutorialStep = ref(0);
const countdownValue = ref(3);
const selectedQuestionCount = ref(10); // 10문제 또는 20문제

// 게임 데이터
const allQuizData = ref([]); // 전체 문제
const selectedQuizzes = ref([]); // 선택된 문제들
const currentQuizIndex = ref(0);
const userAnswers = ref([]); // 사용자의 답안 [{quizId, selectedAnswer, isCorrect}]

// Toast notification
const toast = ref({
  show: false,
  message: '',
  type: 'success'
});

// 튜토리얼 단계
const tutorialSteps = computed(() => [
  {
    title: t('games.tutorials.spellingQuiz.steps.0.title'),
    description: t('games.tutorials.spellingQuiz.steps.0.description'),
    icon: t('games.tutorials.spellingQuiz.steps.0.icon'),
    details: [
      t('games.tutorials.spellingQuiz.steps.0.details.0'),
      t('games.tutorials.spellingQuiz.steps.0.details.1'),
      t('games.tutorials.spellingQuiz.steps.0.details.2'),
      t('games.tutorials.spellingQuiz.steps.0.details.3')
    ]
  },
  {
    title: t('games.tutorials.spellingQuiz.steps.1.title'),
    description: t('games.tutorials.spellingQuiz.steps.1.description'),
    icon: t('games.tutorials.spellingQuiz.steps.1.icon'),
    details: [
      t('games.tutorials.spellingQuiz.steps.1.details.0'),
      t('games.tutorials.spellingQuiz.steps.1.details.1'),
      t('games.tutorials.spellingQuiz.steps.1.details.2'),
      t('games.tutorials.spellingQuiz.steps.1.details.3')
    ]
  },
  {
    title: t('games.tutorials.spellingQuiz.steps.2.title'),
    description: t('games.tutorials.spellingQuiz.steps.2.description'),
    icon: t('games.tutorials.spellingQuiz.steps.2.icon'),
    details: [
      t('games.tutorials.spellingQuiz.steps.2.details.0'),
      t('games.tutorials.spellingQuiz.steps.2.details.1'),
      t('games.tutorials.spellingQuiz.steps.2.details.2'),
      t('games.tutorials.spellingQuiz.steps.2.details.3')
    ]
  },
  {
    title: t('games.tutorials.spellingQuiz.steps.3.title'),
    description: t('games.tutorials.spellingQuiz.steps.3.description'),
    icon: t('games.tutorials.spellingQuiz.steps.3.icon'),
    details: [
      t('games.tutorials.spellingQuiz.steps.3.details.0'),
      t('games.tutorials.spellingQuiz.steps.3.details.1'),
      t('games.tutorials.spellingQuiz.steps.3.details.2'),
      t('games.tutorials.spellingQuiz.steps.3.details.3'),
      t('games.tutorials.spellingQuiz.steps.3.details.4')
    ]
  }
]);

// 현재 문제
const currentQuiz = computed(() => {
  if (selectedQuizzes.value.length === 0) return null;
  return selectedQuizzes.value[currentQuizIndex.value];
});

// 진행률
const progress = computed(() => {
  return `${currentQuizIndex.value + 1} / ${selectedQuestionCount.value}`;
});

// 문제당 점수
const pointsPerQuestion = computed(() => {
  return selectedQuestionCount.value === 10 ? 10 : 5;
});

// 점수 계산
const finalScore = computed(() => {
  const correctCount = userAnswers.value.filter(a => a.isCorrect).length;
  return correctCount * pointsPerQuestion.value;
});

// 점수 평가 문구
const scoreMessage = computed(() => {
  const score = finalScore.value;
  if (score === 100) return '혹시 세종대왕님이세요?';
  if (score >= 80) return '맞춤법 마스터!';
  if (score >= 60) return '맞춤법 2% 부족할 때';
  if (score >= 40) return '맞춤법 오류, 멈춰!';
  return '오늘부터 키보드 압수!';
});

// 점수 서브 문구
const scoreSubMessage = computed(() => {
  const score = finalScore.value;
  if (score === 100) return '완벽한 한글 맞춤법 실력!<br>당신을 인간 맞춤법 사전으로 명명합니다.';
  if (score >= 80) return '훌륭한 맞춤법 실력!<br>자주 헷갈리는 몇 가지만 기억하면 완벽합니다.';
  if (score >= 60) return '한글을 사랑하지만 아쉬운 느낌,<br>조금만 더 연습하면 완벽해질 수 있어요!';
  if (score >= 40) return '아직 맞춤법이 부족하군요.<br>틀린 문제들을 다시 한번 확인해보세요.';
  return '맞춤법 자동 교정이 필요해요!<br>아래 오답 노트를 꼭 확인하세요.';
});

// 숫자를 한글로 변환
const numberToKorean = (num) => {
  const koreanNumbers = [
    '', '하나', '둘', '셋', '넷', '다섯', '여섯', '일곱', '여덟', '아홉', '열',
    '열하나', '열둘', '열셋', '열넷', '열다섯', '열여섯', '열일곱', '열여덟', '열아홉', '스물'
  ];
  return koreanNumbers[num] || num.toString();
};

// {blank}를 밑줄로 변환
const formatQuestion = (question) => {
  return question.replace(/{blank}/g, '<span class="blank-underline">___________</span>');
};

// 퀴즈 데이터 로딩 및 랜덤 선택
const loadQuizData = async (questionCount) => {
  try {
    const response = await fetch('/data/spellingQuiz.json');
    const data = await response.json();
    allQuizData.value = data.quizzes;

    // 랜덤하게 선택된 개수만큼 선택
    const shuffled = [...allQuizData.value].sort(() => Math.random() - 0.5);
    selectedQuizzes.value = shuffled.slice(0, questionCount);
  } catch (error) {
    console.error('퀴즈 데이터 로딩 실패:', error);
    allQuizData.value = [];
    selectedQuizzes.value = [];
  }
};

// 문제 수 선택 후 게임 시작
const startGameWithQuestionCount = async (count) => {
  selectedQuestionCount.value = count;
  await loadQuizData(count);
  gameState.value = 'countdown';
  countdownValue.value = 3;
  startCountdown();

  // 게임 플레이 로그 기록 (인기 게임 통계용)
  logGamePlay('spelling_quiz');
};

// 카운트다운
const startCountdown = () => {
  const countdownInterval = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value < 0) {
      clearInterval(countdownInterval);
      setTimeout(() => {
        beginGame();
      }, 600);
    }
  }, 1000);
};

// 실제 게임 시작
const beginGame = () => {
  gameState.value = 'playing';
  currentQuizIndex.value = 0;
  userAnswers.value = [];
  playMusic();
};

// 답안 선택
const selectAnswer = (answerIndex) => {
  if (!currentQuiz.value) return;

  const isCorrect = answerIndex === currentQuiz.value.correctAnswer;

  // 답안 저장
  userAnswers.value.push({
    quizId: currentQuiz.value.id,
    quiz: currentQuiz.value,
    selectedAnswer: answerIndex,
    isCorrect: isCorrect
  });

  // 다음 문제로 또는 결과 화면으로
  if (currentQuizIndex.value < selectedQuestionCount.value - 1) {
    setTimeout(() => {
      currentQuizIndex.value++;
    }, 300);
  } else {
    setTimeout(() => {
      endGame();
    }, 300);
  }
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

    console.log('📤 점수 저장 요청:', {
      gameType: 'spelling_quiz',
      gameMode: `${selectedQuestionCount.value}questions`,
      score: finalScore.value
    });

    const response = await axios.post(
      `${API_URL}/api/game-scores`,
      {
        gameType: 'spelling_quiz',
        gameMode: `${selectedQuestionCount.value}questions`,
        score: finalScore.value,
        additionalData: {
          questionCount: selectedQuestionCount.value,
          correctCount: userAnswers.value.filter(a => a.isCorrect).length
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('📥 API 응답:', response.data);

    // 내 순위 정보 저장
    if (response.data.success && response.data.data && response.data.data.rank) {
      myRankInfo.value = {
        rank: response.data.data.rank,
        score: finalScore.value,
        userId: currentUserId.value,
        gameScoreId: response.data.data.gameScore.id,
        userName: response.data.data.userName
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
      `${API_URL}/api/game-scores/rankings/spelling_quiz?limit=3&gameMode=${selectedQuestionCount.value}questions`
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
  pauseMusic();
  gameState.value = 'result';

  console.log('🎮 게임 종료 - 현재 사용자 ID:', currentUserId.value);

  // 점수 저장 및 랭킹 조회
  await saveScore();
  await fetchRankings();

  console.log('📊 최종 상태 - myRankInfo:', myRankInfo.value);
  console.log('📊 최종 상태 - topRankings:', topRankings.value);
};

// 게임 재시작 (문제 수 선택 화면으로)
const restartGame = () => {
  currentQuizIndex.value = 0;
  userAnswers.value = [];
  selectedQuizzes.value = [];
  gameState.value = 'question-count-select';
};

// 홈으로 가기
const goHome = () => {
  pauseMusic();
  router.push('/game');
};

// 튜토리얼 다음 단계
const nextTutorialStep = () => {
  if (currentTutorialStep.value < tutorialSteps.value.length - 1) {
    currentTutorialStep.value++;
  } else {
    gameState.value = 'question-count-select';
  }
};

// 튜토리얼 이전 단계
const prevTutorialStep = () => {
  if (currentTutorialStep.value > 0) {
    currentTutorialStep.value--;
  }
};

// 튜토리얼 건너뛰기
const skipTutorial = () => {
  gameState.value = 'question-count-select';
};

// 배경음악 재생
const playMusic = () => {
  if (!bgMusic.value || isMusicMuted.value) return;
  bgMusic.value.currentTime = 0;
  bgMusic.value.play().catch(err => console.log('음악 재생 실패:', err));
};

// 배경음악 일시정지
const pauseMusic = () => {
  if (!bgMusic.value) return;
  bgMusic.value.pause();
};

// 음악 토글
const toggleMusic = () => {
  isMusicMuted.value = !isMusicMuted.value;
  localStorage.setItem('spellingQuizMusicMuted', isMusicMuted.value);

  if (isMusicMuted.value) {
    pauseMusic();
  } else if (gameState.value === 'playing') {
    playMusic();
  }
};

// Toast notification
const showToast = (message, type = 'success') => {
  toast.value.message = message;
  toast.value.type = type;
  toast.value.show = true;

  setTimeout(() => {
    toast.value.show = false;
  }, 2000);
};

// 컴포넌트 마운트
onMounted(() => {
  // 현재 로그인한 사용자 ID 가져오기
  currentUserId.value = getCurrentUserId();

  // 배경음악 초기화
  bgMusic.value = new Audio('/audio/NyanCat.mp3');
  bgMusic.value.loop = true;
  bgMusic.value.volume = 0.5;

  // 하단 네비게이션 숨기기
  const bottomNav = document.querySelector('.common-bottom-nav, .bottom-nav, [class*="BottomNav"]');
  if (bottomNav) {
    bottomNav.style.display = 'none';
  }
});

// 컴포넌트 언마운트
onUnmounted(() => {
  if (bgMusic.value) {
    bgMusic.value.pause();
    bgMusic.value = null;
  }

  // 하단 네비게이션 다시 표시
  const bottomNav = document.querySelector('.common-bottom-nav, .bottom-nav, [class*="BottomNav"]');
  if (bottomNav) {
    bottomNav.style.display = '';
  }
});

// 게임 상태 변경 시 스크롤 맨 위로
watch(gameState, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
</script>

<template>
  <div class="spelling-quiz-game">
    <AppHeader v-if="gameState !== 'playing'" />

    <!-- 색연필 효과용 SVG 필터 -->
    <svg style="position: absolute; width: 0; height: 0;">
      <defs>
        <!-- 색연필 질감 필터 - 더 강한 거친 효과 -->
        <filter id="crayon-texture">
          <feTurbulence type="fractalNoise" baseFrequency="1.5" numOctaves="5" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
          <feGaussianBlur stdDeviation="0.4"/>
        </filter>

        <!-- 색연필 그림자 - 더 강한 번짐 효과 -->
        <filter id="crayon-shadow">
          <feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#ff4757" flood-opacity="0.5"/>
        </filter>
      </defs>
    </svg>

    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        {{ toast.message }}
      </div>
    </Transition>

    <div class="game-content">
      <!-- 튜토리얼 화면 -->
      <div v-if="gameState === 'tutorial'" class="tutorial-section">
        <div class="game-header">
          <button class="back-button" @click="goHome">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">📚</div>
            <div class="header-text">
              <h2 class="common-title2">{{ t('games.tutorials.spellingQuiz.gameExplanation') }}</h2>
              <p class="common-caption text-secondary">{{ t('games.tutorials.spellingQuiz.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
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
                {{ t('games.tutorials.spellingQuiz.previous') }}
              </CommonButton>
              <CommonButton
                v-else
                @click="skipTutorial"
                variant="secondary"
                size="large"
              >
                {{ t('games.tutorials.spellingQuiz.startDirectly') }}
              </CommonButton>
              <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.spellingQuiz.next') : t('games.tutorials.spellingQuiz.startGame') }}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 문제 수 선택 화면 -->
      <div v-if="gameState === 'question-count-select'" class="question-count-section">
        <div class="game-header">
          <button class="back-button" @click="goHome">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">🎯</div>
            <div class="header-text">
              <h2 class="common-title2">문제 수 선택</h2>
              <p class="common-caption text-secondary">원하는 문제 수를 선택하세요.</p>
            </div>
          </div>
        </div>

        <div class="question-count-cards">
          <div class="question-count-card" @click="startGameWithQuestionCount(10)">
            <div class="count-icon" style="color: #4CAF50;">📝</div>
            <h3 class="count-label">10문제</h3>
            <div class="count-info">
              <p>문제당 10점</p>
              <p>빠르게 즐기기</p>
            </div>
          </div>

          <div class="question-count-card" @click="startGameWithQuestionCount(20)">
            <div class="count-icon" style="color: #FF9800;">📚</div>
            <h3 class="count-label">20문제</h3>
            <div class="count-info">
              <p>문제당 5점</p>
              <p>도전! 긴 여정</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 카운트다운 화면 -->
      <div v-if="gameState === 'countdown'" class="countdown-screen">
        <div v-if="countdownValue > 0" class="countdown-number">{{ countdownValue }}</div>
        <div v-else class="countdown-text">
          <span class="game-start-text">Game Start!</span>
        </div>
      </div>

      <!-- 게임 플레이 화면 -->
      <div v-if="gameState === 'playing'" class="playing-section">
        <!-- 상단 헤더 -->
        <div class="game-playing-header">
          <button class="back-button" @click="goHome">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <h3 class="common-title4">맞춤법 퀴즈</h3>
            <p class="common-caption text-secondary">{{ progress }}</p>
          </div>
          <div class="header-right">
            <button class="music-toggle-button" @click="toggleMusic" :title="isMusicMuted ? '음악 켜기' : '음악 끄기'">
              {{ isMusicMuted ? '🔇' : '🔊' }}
            </button>
          </div>
        </div>

        <!-- 진행률 표시 -->
        <div class="progress-indicator">
          <div class="progress-bar-container">
            <div class="progress-bar-fill" :style="{ width: ((currentQuizIndex + 1) / selectedQuestionCount * 100) + '%' }"></div>
          </div>
        </div>

        <!-- 퀴즈 컨테이너 -->
        <div class="minimal-quiz-container" v-if="currentQuiz">
          <!-- 상단: 문제 번호 -->
          <div class="quiz-number-pill">
            {{ numberToKorean(currentQuizIndex + 1) }}
          </div>

          <!-- 문제 제목 -->
          <h3 class="quiz-title">
            다음 중 <span class="highlight-underline">맞는 것</span>을 고르세요.
          </h3>

          <!-- 문장 문제 -->
          <p class="quiz-sentence" v-html="formatQuestion(currentQuiz.question)"></p>

          <!-- 선택지 버튼 -->
          <div class="answer-buttons">
            <button
              v-for="(option, index) in currentQuiz.options"
              :key="index"
              class="answer-btn"
              @click="selectAnswer(index)"
            >
              {{ option }}
            </button>
          </div>

          <!-- 페이지 표시 -->
          <div class="page-indicator">{{ currentQuizIndex + 1 }}/{{ selectedQuestionCount }}</div>
        </div>
      </div>

      <!-- 결과 화면 -->
      <div v-if="gameState === 'result'" class="result-section">
        <div class="game-header">
          <button class="back-button" @click="goHome">
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
          <div class="result-header">
            <p class="result-title">맞춤법 퀴즈</p>
            <div class="score-display">
              <span class="score-number">{{ finalScore }}</span>
              <span class="score-unit">점</span>
            </div>
            <p class="score-message-text">{{ scoreMessage }}</p>
            <p class="score-sub-message" v-html="scoreSubMessage"></p>
          </div>

          <!-- 정답 오답 표 -->
          <div class="answer-board">
            <div class="answer-board-header">
              <strong>[ 정답 ]</strong>
            </div>
            <ul class="answer-list">
              <li v-for="(answer, index) in userAnswers" :key="index" class="answer-item">
                <span class="answer-number" :class="{ 'correct-mark': answer.isCorrect, 'wrong-mark': !answer.isCorrect }">
                  {{ index + 1 }}
                </span>
                <div class="answer-content">
                  <p class="answer-question" v-html="formatQuestion(answer.quiz.question)">
                  </p>
                  <div class="answer-words">
                    <span v-if="!answer.isCorrect" class="wrong-answer">
                      {{ answer.quiz.options[answer.selectedAnswer] }}
                    </span>
                    <span class="correct-answer" :class="{ 'with-check': answer.isCorrect }">
                      {{ answer.quiz.options[answer.quiz.correctAnswer] }}
                    </span>
                  </div>
                  <p class="answer-explanation">
                    {{ answer.quiz.explanation }}
                  </p>
                  <p v-if="answer.quiz.example" class="answer-example">
                    💡 예시: {{ answer.quiz.example }}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <!-- 랭킹 섹션 -->
          <div v-if="topRankings.length > 0" class="ranking-section animate-ranking">
            <h3 class="ranking-title">
              🏆 맞춤법 퀴즈
              <span :style="{ color: selectedQuestionCount === 10 ? '#4CAF50' : '#f44336' }">
                {{ selectedQuestionCount }}문제
              </span>
              TOP 3 랭킹
            </h3>
            <div class="ranking-list">
              <div
                v-for="(ranking, index) in topRankings"
                :key="ranking.id"
                class="ranking-item"
                :class="{ 'my-rank': isMyRank(ranking) }"
                :style="{ animationDelay: `${0.5 + index * 0.1}s` }"
              >
                <div class="ranking-medal">
                  <span v-if="index === 0" class="medal gold">🥇</span>
                  <span v-else-if="index === 1" class="medal silver">🥈</span>
                  <span v-else-if="index === 2" class="medal bronze">🥉</span>
                </div>
                <span class="ranking-name">{{ ranking.userName }}</span>
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
                <span class="ranking-score">{{ myRankInfo.score }}점</span>
              </div>
            </div>
          </div>
          <div v-else-if="isLoadingRankings" class="ranking-loading">
            <span class="loading-spinner">⏳</span>
            <span>랭킹을 불러오는 중...</span>
          </div>

          <div class="result-buttons">
            <CommonButton variant="secondary" @click="restartGame" size="large">
              다시 도전
            </CommonButton>
            <CommonButton variant="primary" @click="goHome" size="large">
              게임 센터로
            </CommonButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spelling-quiz-game {
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

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: var(--radius-lg);
  font-weight: 600;
  z-index: 1000;
  box-shadow: var(--shadow-lg);
}

.toast-notification.success {
  background: var(--common-blue);
  color: white;
}

.toast-notification.error {
  background: #ff4757;
  color: white;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

/* 튜토리얼 화면 */
.tutorial-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

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

.header-text h2,
.header-text h3 {
  margin: 0 0 4px 0;
  color: var(--gray-900);
}

.text-secondary {
  color: var(--gray-600);
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

/* 카운트다운 화면 */
.countdown-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
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

/* 게임 플레이 화면 - 미니멀 디자인 */
.playing-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #F9F9F9;
  display: flex;
  flex-direction: column;
  z-index: 999;
}

/* 상단 헤더 */
.game-playing-header {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.game-playing-header .back-button {
  margin-right: 0;
}

.game-playing-header .header-info {
  flex: 1;
}

.game-playing-header .header-info h3 {
  margin: 0 0 2px 0;
  font-size: 17px;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
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

/* 진행률 표시 */
.progress-indicator {
  padding: 0 20px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  flex-shrink: 0;
}

.progress-bar-container {
  width: 100%;
  height: 4px;
  background: var(--gray-200);
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--common-blue) 0%, #4c9aff 100%);
  transition: width 0.3s ease;
}

.minimal-quiz-container {
  flex: 1;
  max-width: 900px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  padding: 60px 40px;
  animation: fadeInUp 0.5s ease;
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

/* 문제 번호 (작은 둥근 버튼) */
.quiz-number-pill {
  display: inline-block;
  padding: 12px 28px;
  background: white;
  border: 1px solid #E0E0E0;
  border-radius: 30px;
  font-size: 17px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

/* 문제 제목 */
.quiz-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.highlight-underline {
  border-bottom: 5px solid #C6E0F9;
  padding-bottom: 2px;
}

/* 문장 문제 */
.quiz-sentence {
  font-size: 24px;
  color: #444;
  text-align: center;
  margin: 0;
  line-height: 1.8;
  letter-spacing: -0.2px;
  font-weight: 500;
}

.blank-underline {
  display: inline-block;
  border-bottom: 2px solid #333;
  min-width: 100px;
  text-align: center;
  margin: 0 4px;
}

/* 선택지 버튼 */
.answer-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 500px;
}

.answer-btn {
  width: 100%;
  padding: 24px 40px;
  background: #F3F3F3;
  border: none;
  border-radius: 40px;
  font-size: 22px;
  font-weight: 600;
  color: #333;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.answer-btn:hover {
  background: #E8E8E8;
  transform: translateY(-2px);
}

.answer-btn:active {
  transform: translateY(0);
}

/* 페이지 표시 */
.page-indicator {
  font-size: 16px;
  color: #999;
  font-weight: 500;
  text-align: center;
}

/* 결과 화면 */
.result-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.result-card {
  background: white;
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-md);
  animation: resultFadeIn 0.6s ease;
}

@keyframes resultFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 32px;
  border-bottom: 2px solid var(--gray-200);
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 16px;
}

.score-display {
  margin-bottom: 20px;
  animation: scoreAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  display: inline-block;
  padding-bottom: 10px;
}

/* 색연필 채점 밑줄 - 첫 번째 줄 (위쪽, 오른쪽이 올라감) */
.score-display::before {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%) rotate(-3.5deg);
  width: 130%;
  height: 4px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 71, 87, 0.3) 1%,
    rgba(255, 71, 87, 0.7) 2.5%,
    #ff4757 4%,
    #ff4757 96%,
    rgba(255, 71, 87, 0.7) 97.5%,
    rgba(255, 71, 87, 0.3) 99%,
    transparent 100%);
  opacity: 0.9;
  filter: url(#crayon-texture) drop-shadow(0 1px 2px rgba(255, 71, 87, 0.5));
  box-shadow:
    0 0.5px 0 rgba(255, 71, 87, 0.6),
    0 1px 3px rgba(255, 71, 87, 0.4);
  animation: underlineAppear1 0.5s ease 0.8s backwards;
}

/* 색연필 채점 밑줄 - 두 번째 줄 (아래쪽, 약간 다른 각도) */
.score-display::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) rotate(-2.8deg);
  width: 128%;
  height: 4px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(255, 71, 87, 0.3) 1%,
    rgba(255, 71, 87, 0.65) 2.5%,
    rgba(255, 71, 87, 0.95) 4%,
    rgba(255, 71, 87, 0.95) 96%,
    rgba(255, 71, 87, 0.65) 97.5%,
    rgba(255, 71, 87, 0.3) 99%,
    transparent 100%);
  opacity: 0.85;
  filter: url(#crayon-texture) drop-shadow(0 1px 2px rgba(255, 71, 87, 0.4));
  box-shadow:
    0 0.5px 0 rgba(255, 71, 87, 0.5),
    0 1px 2px rgba(255, 71, 87, 0.3);
  animation: underlineAppear2 0.5s ease 0.95s backwards;
}

@keyframes underlineAppear1 {
  0% {
    transform: translateX(-50%) rotate(-3.5deg) scaleX(0);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) rotate(-3.5deg) scaleX(1);
    opacity: 0.9;
  }
}

@keyframes underlineAppear2 {
  0% {
    transform: translateX(-50%) rotate(-2.8deg) scaleX(0);
    opacity: 0;
  }
  100% {
    transform: translateX(-50%) rotate(-2.8deg) scaleX(1);
    opacity: 0.85;
  }
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

.score-number {
  font-size: 80px;
  font-weight: 700;
  color: var(--common-blue);
  line-height: 1;
}

.score-unit {
  font-size: 32px;
  font-weight: 600;
  color: var(--gray-700);
  margin-left: 8px;
}

.score-message-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
}

.score-sub-message {
  font-size: 16px;
  color: var(--gray-600);
  line-height: 1.6;
}

/* 정답 오답 표 */
.answer-board {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px 24px;
  margin-bottom: 32px;
  border: 2px solid var(--gray-200);
}

.answer-board-header {
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 24px;
  text-align: left;
}

.answer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.answer-item {
  display: flex;
  gap: 16px;
  padding: 20px 16px;
  border-bottom: 1px solid var(--gray-100);
}

.answer-item:last-child {
  border-bottom: none;
}

.answer-number {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-600);
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 정답 - 빨간색 타원형 동그라미 (실제 손으로 그린 채점 느낌) */
.answer-number.correct-mark {
  color: #ff4757;
}

.answer-number.correct-mark::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-8deg) scale(1.15, 0.9);
  width: 32px;
  height: 34px;
  border: 4px solid #ff4757;
  border-radius: 48% 52% 51% 49% / 46% 50% 50% 54%;
  opacity: 0.85;
  filter: url(#crayon-texture) drop-shadow(0 0 3px rgba(255, 71, 87, 0.6));
  box-shadow:
    /* 겹쳐 그은 느낌 - 선생님이 빠르게 동그라미 칠 때 */
    inset 1.5px 1px 0 rgba(255, 71, 87, 0.5),
    inset -1px -1.5px 0 rgba(255, 71, 87, 0.5),
    inset 0 2px 0 rgba(255, 71, 87, 0.4),
    /* 외부 그림자 - 색연필 가루 */
    0 0 0 1px rgba(255, 71, 87, 0.4),
    1px 1px 3px rgba(255, 71, 87, 0.5),
    -1px -1px 2px rgba(255, 71, 87, 0.4);
}

/* 틀린 답 - 빨간색 대각선 / (색연필 느낌) */
.answer-number.wrong-mark {
  color: #ff4757;
}

/* 왼쪽 위에서 오른쪽 아래로 대각선 (/) - 색연필로 그은 느낌 */
.answer-number.wrong-mark::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(47deg);
  width: 4px;
  height: 38px;
  background: linear-gradient(to bottom,
    transparent 0%,
    rgba(255, 71, 87, 0.5) 3%,
    #ff4757 8%,
    #ff4757 92%,
    rgba(255, 71, 87, 0.5) 97%,
    transparent 100%);
  opacity: 0.85;
  filter: url(#crayon-texture) drop-shadow(0 0 2px rgba(255, 71, 87, 0.5));
  box-shadow:
    1px 0 0 rgba(255, 71, 87, 0.6),
    -0.5px 0 0 rgba(255, 71, 87, 0.4),
    0 1px 2px rgba(255, 71, 87, 0.3);
}

.answer-content {
  flex: 1;
}

.answer-question {
  color: var(--gray-700);
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 10px;
  font-weight: 500;
}

.answer-words {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.wrong-answer {
  font-size: 17px;
  font-weight: 600;
  color: var(--gray-900);
  text-decoration: line-through;
  text-decoration-color: #ff4757;
  text-decoration-thickness: 2px;
}

.correct-answer {
  font-size: 17px;
  font-weight: 700;
  color: var(--gray-900);
}

/* 정답 맞춘 경우 체크 마크 표시 */
.correct-answer.with-check::before {
  content: '✓';
  display: inline-block;
  margin-right: 6px;
  color: #26de81;
  font-weight: 700;
  font-size: 18px;
}

.answer-explanation {
  color: var(--gray-700);
  line-height: 1.7;
  margin-bottom: 8px;
  font-size: 14px;
}

.answer-example {
  color: var(--gray-600);
  font-size: 13px;
  padding: 10px 14px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  margin-top: 10px;
  border-left: 3px solid var(--common-blue);
}

/* 랭킹 섹션 */
.ranking-section {
  margin-top: 24px;
  margin-bottom: 24px;
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
  grid-template-columns: 60px 1fr 100px;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  transition: all 0.2s;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInLeft 0.4s ease-out forwards;
}

.ranking-item:hover {
  background: var(--gray-100);
  transform: translateX(4px);
}

/* 본인 순위 강조 */
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

.result-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 반응형 */
@media (max-width: 768px) {
  .game-content {
    padding: 16px;
  }

  .minimal-quiz-container {
    gap: 32px;
    padding: 40px 24px;
  }

  .quiz-number-pill {
    padding: 10px 24px;
    font-size: 16px;
  }

  .quiz-title {
    font-size: 24px;
  }

  .quiz-sentence {
    font-size: 22px;
  }

  .answer-buttons {
    max-width: 450px;
  }

  .answer-btn {
    padding: 20px 36px;
    font-size: 20px;
  }

  .result-card {
    padding: 32px 24px;
  }

  .score-number {
    font-size: 64px;
  }

  .score-message-text {
    font-size: 20px;
  }

  .answer-board {
    padding: 24px 20px;
  }

  .ranking-item {
    grid-template-columns: 50px 1fr 90px;
    padding: 14px 16px;
    gap: 12px;
  }

  .medal {
    font-size: 28px;
  }

  .rank-number {
    font-size: 16px;
  }

  .ranking-name {
    font-size: 15px;
  }

  .ranking-score {
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .game-content {
    padding: 12px;
  }

  .minimal-quiz-container {
    gap: 28px;
    padding: 32px 20px;
  }

  .quiz-number-pill {
    padding: 10px 22px;
    font-size: 15px;
  }

  .quiz-title {
    font-size: 22px;
  }

  .quiz-sentence {
    font-size: 20px;
  }

  .answer-buttons {
    max-width: 100%;
    gap: 14px;
  }

  .answer-btn {
    padding: 18px 32px;
    font-size: 18px;
  }

  .blank-underline {
    min-width: 80px;
  }

  .result-card {
    padding: 24px 16px;
  }

  .score-number {
    font-size: 56px;
  }

  .score-unit {
    font-size: 24px;
  }

  .score-message-text {
    font-size: 18px;
  }

  .score-sub-message {
    font-size: 14px;
  }

  .answer-board {
    padding: 20px 16px;
  }

  .answer-item {
    padding: 16px 12px;
  }

  .answer-words {
    gap: 6px;
  }

  .wrong-answer,
  .correct-answer {
    font-size: 16px;
  }

  .countdown-number,
  .countdown-text {
    font-size: 80px;
  }

  .ranking-item {
    grid-template-columns: 50px 1fr 80px;
    padding: 12px 14px;
    gap: 10px;
  }

  .medal {
    font-size: 26px;
  }

  .rank-number {
    font-size: 15px;
  }

  .ranking-name {
    font-size: 14px;
  }

  .ranking-score {
    font-size: 16px;
  }
}

/* 문제 수 선택 화면 */
.question-count-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-count-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.question-count-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow-sm);
  border: 2px solid transparent;
}

.question-count-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--common-blue);
}

.count-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.count-label {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 16px;
}

.count-info p {
  color: var(--gray-600);
  font-size: 15px;
  margin: 8px 0;
  font-weight: 500;
}

@media (max-width: 768px) {
  .question-count-cards {
    grid-template-columns: 1fr;
  }
}
</style>
