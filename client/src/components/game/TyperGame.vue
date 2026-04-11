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

// 입력창 ref
const gameInputRef = ref(null);

// 음원 관련
const bgMusic = ref(null);
const isMusicMuted = ref(localStorage.getItem('typerGameMusicMuted') === 'true');

// 게임 상태
const gameState = ref('tutorial'); // tutorial, difficulty-select, countdown, playing, result
const currentTutorialStep = ref(0);
const countdownValue = ref(3);
const selectedDifficulty = ref('beginner');

// 게임 데이터
const allWords = ref([]);
const unusedWords = ref([]); // 아직 사용되지 않은 단어 풀
const fallingWords = ref([]);
const userInput = ref('');
const score = ref(0);
const life = ref(3);
const survivalTime = ref(0);
const comboCount = ref(0);
const maxCombo = ref(0);

// 아이템 효과 목록
const itemEffects = [
  { type: 'slowDown', name: '시간 느리기', icon: '⏱️' },
  { type: 'clearAll', name: '전체 클리어', icon: '💥' },
  { type: 'hideWords', name: '단어 숨기기', icon: '🙈' },
  { type: 'speedUp', name: '시간 빠르기', icon: '⚡' },
  { type: 'lifeAdd', name: '생명 추가', icon: '❤️' }
];

// 아이템 효과 상태
const activeEffects = ref({
  slowDown: false,
  speedUp: false,
  hideWords: false
});
const activeEffectName = ref(''); // 현재 활성화된 효과 이름
let effectTimeouts = {};

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

// 애니메이션 및 타이머
let animationFrame = null;
let spawnInterval = null;
let timerInterval = null;
let wordIdCounter = 0;
let wordCounter = 0; // 생성된 단어 개수 카운터
let nextItemWordCount = 0; // 다음 아이템이 나올 단어 개수

// 난이도 설정
const difficultyConfig = {
  beginner: {
    label: '초급',
    speed: 0.8,
    spawnInterval: 2000,
    wordLengthMin: 2,
    wordLengthMax: 4,
    icon: '🌱',
    color: '#4CAF50'
  },
  intermediate: {
    label: '중급',
    speed: 1.3,
    spawnInterval: 1500,
    wordLengthMin: 3,
    wordLengthMax: 6,
    icon: '🔥',
    color: '#F44336'
  },
  advanced: {
    label: '고급',
    speed: 2.0,
    spawnInterval: 1000,
    wordLengthMin: 4,
    wordLengthMax: 8,
    icon: '⚡',
    color: '#FFC107'
  }
};

// 현재 난이도 설정
const currentConfig = computed(() => difficultyConfig[selectedDifficulty.value]);

// 튜토리얼 단계
const tutorialSteps = computed(() => [
  {
    title: t('games.tutorials.typer.steps.0.title'),
    description: t('games.tutorials.typer.steps.0.description'),
    icon: t('games.tutorials.typer.steps.0.icon'),
    details: [
      t('games.tutorials.typer.steps.0.details.0'),
      t('games.tutorials.typer.steps.0.details.1'),
      t('games.tutorials.typer.steps.0.details.2'),
      t('games.tutorials.typer.steps.0.details.3')
    ]
  },
  {
    title: t('games.tutorials.typer.steps.1.title'),
    description: t('games.tutorials.typer.steps.1.description'),
    icon: t('games.tutorials.typer.steps.1.icon'),
    details: [
      t('games.tutorials.typer.steps.1.details.0'),
      t('games.tutorials.typer.steps.1.details.1'),
      t('games.tutorials.typer.steps.1.details.2'),
      t('games.tutorials.typer.steps.1.details.3')
    ]
  },
  {
    title: t('games.tutorials.typer.steps.2.title'),
    description: t('games.tutorials.typer.steps.2.description'),
    icon: t('games.tutorials.typer.steps.2.icon'),
    details: [
      t('games.tutorials.typer.steps.2.details.0'),
      t('games.tutorials.typer.steps.2.details.1'),
      t('games.tutorials.typer.steps.2.details.2'),
      t('games.tutorials.typer.steps.2.details.3')
    ]
  },
  {
    title: t('games.tutorials.typer.steps.3.title'),
    description: t('games.tutorials.typer.steps.3.description'),
    icon: t('games.tutorials.typer.steps.3.icon'),
    details: [
      t('games.tutorials.typer.steps.3.details.0'),
      t('games.tutorials.typer.steps.3.details.1'),
      t('games.tutorials.typer.steps.3.details.2'),
      t('games.tutorials.typer.steps.3.details.3'),
      t('games.tutorials.typer.steps.3.details.4'),
      t('games.tutorials.typer.steps.3.details.5')
    ]
  },
  {
    title: t('games.tutorials.typer.steps.4.title'),
    description: t('games.tutorials.typer.steps.4.description'),
    icon: t('games.tutorials.typer.steps.4.icon'),
    details: [
      t('games.tutorials.typer.steps.4.details.0'),
      t('games.tutorials.typer.steps.4.details.1'),
      t('games.tutorials.typer.steps.4.details.2'),
      t('games.tutorials.typer.steps.4.details.3'),
      t('games.tutorials.typer.steps.4.details.4')
    ]
  }
]);

// 생존 시간 포맷
const formattedTime = computed(() => {
  const minutes = Math.floor(survivalTime.value / 60);
  const seconds = survivalTime.value % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 생명 아이콘 표시
const lifeIcons = computed(() => {
  const hearts = [];
  // 현재 생명 개수만큼 하트 표시 (3개 이상도 가능)
  for (let i = 0; i < life.value; i++) {
    hearts.push('❤️');
  }
  return hearts.join('');
});

// 최종 점수 계산
const finalScore = computed(() => {
  return score.value;
});

// 점수 평가 메시지
const scoreMessage = computed(() => {
  const total = finalScore.value;
  if (total >= 1000) return '타자 신!';
  if (total >= 700) return '타자 마스터!';
  if (total >= 500) return '타자 고수!';
  if (total >= 300) return '잘했어요!';
  return '더 연습해보세요!';
});

// 점수 서브 메시지
const scoreSubMessage = computed(() => {
  const total = finalScore.value;
  if (total >= 1000) return '완벽한 타자 실력!<br>당신은 타자의 신입니다.';
  if (total >= 700) return '훌륭한 타자 실력!<br>거의 완벽에 가깝습니다.';
  if (total >= 500) return '좋은 타자 실력!<br>조금만 더 연습하면 마스터가 됩니다.';
  if (total >= 300) return '괜찮은 타자 실력!<br>꾸준히 연습하면 더 좋아질 거예요.';
  return '타자 연습이 필요해요!<br>포기하지 말고 계속 도전하세요.';
});

// 단어 데이터 로딩
const loadWordData = async () => {
  try {
    const response = await fetch('/data/typerWords.json');
    const data = await response.json();
    allWords.value = data.words;
  } catch (error) {
    console.error('단어 데이터 로딩 실패:', error);
    allWords.value = [];
  }
};

// 난이도에 맞는 랜덤 단어 가져오기
const getRandomWord = () => {
  const config = currentConfig.value;

  // unusedWords가 비어있으면 재설정 (모든 단어를 다시 풀에 추가)
  if (unusedWords.value.length === 0) {
    const filteredWords = allWords.value.filter(
      word => word.length >= config.wordLengthMin && word.length <= config.wordLengthMax
    );
    unusedWords.value = [...filteredWords];
  }

  if (unusedWords.value.length === 0) return '단어';

  // unusedWords에서 랜덤으로 하나 선택하고 제거
  const randomIndex = Math.floor(Math.random() * unusedWords.value.length);
  const word = unusedWords.value[randomIndex];
  unusedWords.value.splice(randomIndex, 1);

  return word;
};

// 새 떨어지는 단어 생성
const spawnFallingWord = () => {
  const gameArea = document.querySelector('.game-area');
  if (!gameArea) return;

  const maxX = gameArea.clientWidth - 120;
  const word = getRandomWord();

  // 단어 카운터 증가
  wordCounter++;

  // 10~15번째 단어마다 아이템 생성
  let isItem = false;
  if (wordCounter >= nextItemWordCount) {
    isItem = true;
    // 다음 아이템은 10~15번 후
    nextItemWordCount = wordCounter + 10 + Math.floor(Math.random() * 6); // 10~15
  }

  const wordData = {
    id: ++wordIdCounter,
    word: word,
    x: Math.random() * Math.max(maxX, 100),
    y: 0,
    speed: currentConfig.value.speed,
    matched: '',
    isItem: isItem
  };

  fallingWords.value.push(wordData);
};

// 애니메이션 루프
const animate = () => {
  if (gameState.value !== 'playing') return;

  fallingWords.value.forEach((word, index) => {
    // 아이템 효과에 따라 속도 조정
    let speedMultiplier = 1;
    if (activeEffects.value.slowDown) speedMultiplier = 0.5;
    if (activeEffects.value.speedUp) speedMultiplier = 1.5;

    word.y += word.speed * speedMultiplier;

    // 화면 하단 도달 시
    const gameArea = document.querySelector('.game-area');
    if (gameArea && word.y > gameArea.clientHeight - 50) {
      life.value--;
      comboCount.value = 0;
      fallingWords.value.splice(index, 1);

      // 게임 오버 체크
      if (life.value <= 0) {
        endGame();
        return;
      }
    }
  });

  animationFrame = requestAnimationFrame(animate);
};

// 아이템 효과 함수들
const activateItemEffect = () => {
  // 랜덤하게 아이템 효과 선택
  const randomEffect = itemEffects[Math.floor(Math.random() * itemEffects.length)];

  switch (randomEffect.type) {
    case 'slowDown':
      activateSlowDown();
      break;
    case 'clearAll':
      activateClearAll();
      break;
    case 'hideWords':
      activateHideWords();
      break;
    case 'speedUp':
      activateSpeedUp();
      break;
    case 'lifeAdd':
      activateLifeAdd();
      break;
  }
};

// 시간 느리기
const activateSlowDown = () => {
  activeEffects.value.slowDown = true;
  activeEffectName.value = '⏱️ 시간 느리기';

  if (effectTimeouts.slowDown) clearTimeout(effectTimeouts.slowDown);
  effectTimeouts.slowDown = setTimeout(() => {
    activeEffects.value.slowDown = false;
    if (activeEffectName.value === '⏱️ 시간 느리기') {
      activeEffectName.value = '';
    }
  }, 5000);
};

// 전체 클리어
const activateClearAll = () => {
  // 모든 단어에 대해 점수 부여
  fallingWords.value.forEach(word => {
    if (!word.isItem) {
      score.value += word.word.length * 10;
    }
  });
  // 모든 단어 제거
  fallingWords.value = [];

  // 일시적으로 효과 표시
  activeEffectName.value = '💥 전체 클리어!';
  setTimeout(() => {
    if (activeEffectName.value === '💥 전체 클리어!') {
      activeEffectName.value = '';
    }
  }, 2000);
};

// 단어 숨기기
const activateHideWords = () => {
  activeEffects.value.hideWords = true;
  activeEffectName.value = '🙈 단어 숨기기';

  if (effectTimeouts.hideWords) clearTimeout(effectTimeouts.hideWords);
  effectTimeouts.hideWords = setTimeout(() => {
    activeEffects.value.hideWords = false;
    if (activeEffectName.value === '🙈 단어 숨기기') {
      activeEffectName.value = '';
    }
  }, 3000);
};

// 시간 빠르기 (디버프)
const activateSpeedUp = () => {
  activeEffects.value.speedUp = true;
  activeEffectName.value = '⚡ 시간 빠르기';

  if (effectTimeouts.speedUp) clearTimeout(effectTimeouts.speedUp);
  effectTimeouts.speedUp = setTimeout(() => {
    activeEffects.value.speedUp = false;
    if (activeEffectName.value === '⚡ 시간 빠르기') {
      activeEffectName.value = '';
    }
  }, 5000);
};

// 생명 추가
const activateLifeAdd = () => {
  life.value++;

  // 일시적으로 효과 표시
  activeEffectName.value = '❤️ 생명 추가!';
  setTimeout(() => {
    if (activeEffectName.value === '❤️ 생명 추가!') {
      activeEffectName.value = '';
    }
  }, 2000);
};

// 사용자 입력 처리 (부분 일치 표시)
const handleInput = (event) => {
  const input = event.target.value;
  userInput.value = input;

  if (!input) {
    // 입력이 비어있으면 모든 매칭 초기화
    fallingWords.value.forEach(word => {
      word.matched = '';
    });
    return;
  }

  // 현재 입력과 일치하는 단어 찾기
  let matched = false;

  for (let i = 0; i < fallingWords.value.length; i++) {
    const word = fallingWords.value[i];

    // 부분 일치
    if (word.word.startsWith(input)) {
      word.matched = input;
      matched = true;
    } else {
      word.matched = '';
    }
  }
};

// 엔터 키로 단어 제출
const handleSubmit = async () => {
  const input = userInput.value.trim();

  if (!input) return;

  // 현재 입력과 완전히 일치하는 단어 찾기
  for (let i = 0; i < fallingWords.value.length; i++) {
    const word = fallingWords.value[i];

    // 완전히 일치
    if (word.word === input) {
      // 아이템 처리
      if (word.isItem) {
        activateItemEffect(); // 랜덤 효과 발동
        fallingWords.value.splice(i, 1);
      } else {
        // 일반 단어 처리
        score.value += word.word.length * 10;
        comboCount.value++;
        maxCombo.value = Math.max(maxCombo.value, comboCount.value);

        // 콤보 보너스
        if (comboCount.value >= 5) {
          score.value += comboCount.value * 2;
        }

        fallingWords.value.splice(i, 1);
      }

      userInput.value = '';

      // 모든 단어의 매칭 초기화
      fallingWords.value.forEach(w => {
        w.matched = '';
      });

      // 입력창 포커스 유지
      await nextTick();
      if (gameInputRef.value) {
        gameInputRef.value.focus();
      }

      return;
    }
  }

  // 일치하는 단어가 없으면 콤보 초기화
  comboCount.value = 0;
  userInput.value = '';

  // 모든 단어의 매칭 초기화
  fallingWords.value.forEach(word => {
    word.matched = '';
  });

  // 입력창 포커스 유지
  await nextTick();
  if (gameInputRef.value) {
    gameInputRef.value.focus();
  }
};

// 게임 시작 (난이도 선택 후)
const startGameWithDifficulty = (difficulty) => {
  selectedDifficulty.value = difficulty;
  gameState.value = 'countdown';
  countdownValue.value = 3;
  startCountdown();

  // 게임 플레이 로그 기록 (인기 게임 통계용)
  logGamePlay('typer');
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
const beginGame = async () => {
  gameState.value = 'playing';
  score.value = 0;
  life.value = 3;
  survivalTime.value = 0;
  comboCount.value = 0;
  maxCombo.value = 0;
  fallingWords.value = [];
  userInput.value = '';
  unusedWords.value = []; // 게임 시작 시 단어 풀 초기화

  // 아이템 카운터 초기화
  wordCounter = 0;
  nextItemWordCount = 10 + Math.floor(Math.random() * 6); // 첫 아이템은 10~15번째

  // 아이템 효과 초기화
  activeEffects.value = {
    slowDown: false,
    speedUp: false,
    hideWords: false
  };
  activeEffectName.value = '';
  // 기존 타임아웃 클리어
  Object.keys(effectTimeouts).forEach(key => {
    if (effectTimeouts[key]) clearTimeout(effectTimeouts[key]);
  });
  effectTimeouts = {};

  playMusic();

  // 타이머 시작
  timerInterval = setInterval(() => {
    survivalTime.value++;
  }, 1000);

  // 단어 생성 시작
  spawnInterval = setInterval(() => {
    spawnFallingWord();
  }, currentConfig.value.spawnInterval);

  // 첫 단어 즉시 생성
  spawnFallingWord();

  // 입력창 포커스
  await nextTick();
  if (gameInputRef.value) {
    gameInputRef.value.focus();
  }

  // 애니메이션 시작
  animate();

  // 입력 필드에 포커스
  setTimeout(() => {
    const inputField = document.querySelector('.game-input');
    if (inputField) inputField.focus();
  }, 100);
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
      gameType: 'typer_game',
      difficulty: selectedDifficulty.value,
      score: score.value,
      survivalTime: survivalTime.value,
      maxCombo: maxCombo.value
    });

    const response = await axios.post(
      `${API_URL}/api/game-scores`,
      {
        gameType: 'typer_game',
        difficulty: selectedDifficulty.value,
        score: score.value,
        additionalData: {
          survivalTime: survivalTime.value,
          maxCombo: maxCombo.value
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
      `${API_URL}/api/game-scores/rankings/typer_game?limit=3&difficulty=${selectedDifficulty.value}`
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
  gameState.value = 'result';
  pauseMusic();

  // 모든 인터벌 정리
  if (timerInterval) clearInterval(timerInterval);
  if (spawnInterval) clearInterval(spawnInterval);
  if (animationFrame) cancelAnimationFrame(animationFrame);

  console.log('🎮 게임 종료 - 현재 사용자 ID:', currentUserId.value);

  // 점수 저장 및 랭킹 조회
  await saveScore();
  await fetchRankings();

  console.log('📊 최종 상태 - myRankInfo:', myRankInfo.value);
  console.log('📊 최종 상태 - topRankings:', topRankings.value);
};

// 게임 재시작
const restartGame = () => {
  gameState.value = 'difficulty-select';
};

// 홈으로 가기
const goHome = () => {
  pauseMusic();
  if (timerInterval) clearInterval(timerInterval);
  if (spawnInterval) clearInterval(spawnInterval);
  if (animationFrame) cancelAnimationFrame(animationFrame);
  router.push('/game');
};

// 튜토리얼 다음 단계
const nextTutorialStep = () => {
  if (currentTutorialStep.value < tutorialSteps.value.length - 1) {
    currentTutorialStep.value++;
  } else {
    gameState.value = 'difficulty-select';
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
  gameState.value = 'difficulty-select';
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
  localStorage.setItem('typerGameMusicMuted', isMusicMuted.value);

  if (isMusicMuted.value) {
    pauseMusic();
  } else if (gameState.value === 'playing') {
    playMusic();
  }
};

// 컴포넌트 마운트
onMounted(async () => {
  await loadWordData();

  // 현재 로그인한 사용자 ID 가져오기
  currentUserId.value = getCurrentUserId();

  // 배경음악 초기화
  bgMusic.value = new Audio('/audio/TetrisTheme.mp3');
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

  if (timerInterval) clearInterval(timerInterval);
  if (spawnInterval) clearInterval(spawnInterval);
  if (animationFrame) cancelAnimationFrame(animationFrame);

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
  <div class="typer-game">
    <AppHeader v-if="gameState !== 'playing'" />

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
              <h2 class="common-title2">{{ t('games.tutorials.typer.gameExplanation') }}</h2>
              <p class="common-caption text-secondary">{{ t('games.tutorials.typer.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
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
                {{ t('games.tutorials.typer.previous') }}
              </CommonButton>
              <CommonButton
                v-else
                @click="skipTutorial"
                variant="secondary"
                size="large"
              >
                {{ t('games.tutorials.typer.startDirectly') }}
              </CommonButton>
              <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.typer.next') : t('games.tutorials.typer.startGame') }}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 난이도 선택 화면 -->
      <div v-if="gameState === 'difficulty-select'" class="difficulty-section">
        <div class="game-header">
          <button class="back-button" @click="goHome">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">📊</div>
            <div class="header-text">
              <h2 class="common-title2">난이도 선택</h2>
              <p class="common-caption text-secondary">자신의 실력에 맞는 난이도를 선택하세요.</p>
            </div>
          </div>
        </div>

        <div class="difficulty-cards">
          <div
            v-for="(config, key) in difficultyConfig"
            :key="key"
            class="difficulty-card"
            @click="startGameWithDifficulty(key)"
          >
            <div class="difficulty-icon" :style="{ color: config.color }">{{ config.icon }}</div>
            <h3 class="difficulty-label">{{ config.label }}</h3>
            <div class="difficulty-info">
              <p>단어 길이: {{ config.wordLengthMin }}-{{ config.wordLengthMax }}글자</p>
              <p>속도: {{ config.speed === 0.8 ? '느림' : config.speed === 1.3 ? '보통' : '빠름' }}</p>
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
            <h3 class="common-title4">한글 타자 게임</h3>
            <p class="common-caption text-secondary">{{ currentConfig.label }}</p>
          </div>
          <div class="header-right">
            <button class="music-toggle-button" @click="toggleMusic" :title="isMusicMuted ? '음악 켜기' : '음악 끄기'">
              {{ isMusicMuted ? '🔇' : '🔊' }}
            </button>
          </div>
        </div>

        <!-- 게임 정보 -->
        <div class="game-info">
          <div class="info-item">
            <span class="info-icon">⏱</span>
            <span class="info-value">{{ formattedTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-value">{{ lifeIcons }}</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🏆</span>
            <span class="info-value">{{ score }}점</span>
          </div>
          <div class="info-item" v-if="comboCount >= 2">
            <span class="info-icon">🔥</span>
            <span class="info-value combo">{{ comboCount }} 콤보!</span>
          </div>

          <!-- 활성 아이템 효과 표시 (상단바 중앙) -->
          <div class="effect-text-center" v-if="activeEffectName">
            {{ activeEffectName }}
          </div>
        </div>

        <!-- 게임 영역 -->
        <div class="game-area">
          <!-- 떨어지는 단어들 -->
          <div
            v-for="word in fallingWords"
            :key="word.id"
            class="falling-word"
            :class="{
              'item-word': word.isItem,
              'hidden-word': activeEffects.hideWords
            }"
            :style="{ left: word.x + 'px', top: word.y + 'px' }"
          >
            <span class="word-matched">{{ word.matched }}</span><span class="word-remaining">{{ word.word.slice(word.matched.length) }}</span>
          </div>
        </div>

        <!-- 입력 영역 -->
        <div class="input-area">
          <div class="input-container">
            <input
              ref="gameInputRef"
              type="text"
              class="game-input"
              v-model="userInput"
              @input="handleInput"
              @keyup.enter="handleSubmit"
              placeholder="여기에 단어를 입력하세요."
              autocomplete="off"
              spellcheck="false"
              autofocus
            />
          </div>
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
            <p class="result-title">한글 타자 게임</p>
            <div class="score-display">
              <span class="score-number">{{ finalScore }}</span>
              <span class="score-unit">점</span>
            </div>
            <p class="score-message-text">{{ scoreMessage }}</p>
            <p class="score-sub-message" v-html="scoreSubMessage"></p>
          </div>

          <!-- 상세 정보 -->
          <div class="result-stats animate-stats">
            <div class="result-stat-item" style="animation-delay: 0.1s">
              <span class="result-stat-label">난이도</span>
              <span class="result-stat-value">{{ currentConfig.label }}</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.2s">
              <span class="result-stat-label">생존 시간</span>
              <span class="result-stat-value">{{ formattedTime }}</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.3s">
              <span class="result-stat-label">획득 점수</span>
              <span class="result-stat-value">{{ score }}점</span>
            </div>
            <div class="result-stat-item" style="animation-delay: 0.4s">
              <span class="result-stat-label">최대 콤보</span>
              <span class="result-stat-value">{{ maxCombo }}연속</span>
            </div>
          </div>

          <!-- 랭킹 섹션 -->
          <div v-if="topRankings.length > 0" class="ranking-section animate-ranking">
            <h3 class="ranking-title">🏆 한글 타자 게임 <span :style="{ color: currentConfig.color }">{{ currentConfig.label }}</span> TOP 3 랭킹</h3>
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
                <span class="ranking-time">{{ Math.floor(ranking.additionalData?.survivalTime / 60) }}:{{ String(ranking.additionalData?.survivalTime % 60).padStart(2, '0') }}</span>
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
                <span class="ranking-time">{{ Math.floor(survivalTime / 60) }}:{{ String(survivalTime % 60).padStart(2, '0') }}</span>
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
.typer-game {
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

/* 튜토리얼 화면 - 기존 게임과 동일 */
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

/* 난이도 선택 화면 */
.difficulty-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.difficulty-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.difficulty-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px 32px;
  box-shadow: var(--shadow-sm);
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.difficulty-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--common-blue);
}

.difficulty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.difficulty-label {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 16px;
}

.difficulty-info p {
  color: var(--gray-600);
  font-size: 15px;
  margin: 8px 0;
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

/* 게임 플레이 화면 */
.playing-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, #e3f2fd 0%, #f5f5f5 100%);
  display: flex;
  flex-direction: column;
  z-index: 999;
}

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

/* 게임 정보 */
.game-info {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  flex-shrink: 0;
  position: relative;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  font-size: 20px;
}

.info-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.info-value.combo {
  color: #FF6B6B;
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

/* 활성 아이템 효과 표시 (상단바 중앙) */
.effect-text-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
  animation: effectBounceRotate 1s ease-in-out infinite;
  text-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
  z-index: 10;
}

@keyframes effectBounceRotate {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
  25% {
    transform: translate(-50%, -50%) scale(1.15) rotate(-3deg);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.3) rotate(0deg);
  }
  75% {
    transform: translate(-50%, -50%) scale(1.15) rotate(3deg);
  }
}

/* 게임 영역 */
.game-area {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%);
}

.falling-word {
  position: absolute;
  font-size: 24px;
  font-weight: 700;
  padding: 12px 20px;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
  transition: transform 0.1s;
}

/* 아이템 단어 스타일 */
.falling-word.item-word .word-matched,
.falling-word.item-word .word-remaining {
  color: #ff4757;
  font-weight: 700;
}

/* 단어 숨기기 효과 */
.falling-word.hidden-word .word-matched,
.falling-word.hidden-word .word-remaining {
  color: transparent;
  background: #000;
  border-radius: 2px;
  padding: 2px 1px;
}

.falling-word.hidden-word.item-word .word-matched,
.falling-word.hidden-word.item-word .word-remaining {
  color: transparent;
  background: #000;
  border-radius: 2px;
  padding: 2px 1px;
}

.word-matched {
  color: var(--common-blue);
}

.word-remaining {
  color: var(--gray-900);
}

/* 입력 영역 */
.input-area {
  padding: 20px;
  background: white;
  border-top: 2px solid var(--gray-200);
  flex-shrink: 0;
}

.input-container {
  max-width: 600px;
  margin: 0 auto;
}

.game-input {
  width: 100%;
  padding: 16px 20px;
  font-size: 20px;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-lg);
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
}

.game-input:focus {
  border-color: var(--common-blue);
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
  filter: drop-shadow(0 1px 2px rgba(255, 71, 87, 0.5));
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
  filter: drop-shadow(0 1px 2px rgba(255, 71, 87, 0.4));
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

/* 결과 상세 정보 */
.result-stats {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  margin-bottom: 32px;
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

.animate-stats .result-stat-item {
  animation: statSlideIn 0.5s ease-out both;
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

  .difficulty-cards {
    grid-template-columns: 1fr;
  }

  .result-card {
    padding: 32px 24px;
  }

  .score-number {
    font-size: 64px;
  }

  .countdown-number,
  .countdown-text {
    font-size: 80px;
  }

  .falling-word {
    font-size: 20px;
    padding: 10px 16px;
  }
}

@media (max-width: 480px) {
  .game-content {
    padding: 12px;
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
    font-size: 20px;
  }

  .score-sub-message {
    font-size: 14px;
  }

  .result-stats {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px;
  }

  .result-stat-value {
    font-size: 22px;
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

  .ranking-time {
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

.ranking-time {
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
