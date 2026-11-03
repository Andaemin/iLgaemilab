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
const isMusicMuted = ref(localStorage.getItem('bingoGameMusicMuted') === 'true');

// 랭킹 관련
const topRankings = ref([]);
const isLoadingRankings = ref(false);
const isSavingScore = ref(false);
const myRankInfo = ref(null);
const currentUserId = ref(null);
const currentUserNameValue = ref(''); // 사용자 이름 저장용

// 현재 사용자 이름
const currentUserName = computed(() => {
  // 1순위: 저장된 사용자 이름 사용
  if (currentUserNameValue.value) {
    return currentUserNameValue.value;
  }
  // 2순위: myRankInfo에 userName이 있으면 사용
  if (myRankInfo.value && myRankInfo.value.userName) {
    return myRankInfo.value.userName;
  }
  // 3순위: TOP 3 랭킹에서 찾기
  const userRanking = topRankings.value.find(r => r.userId === currentUserId.value);
  return userRanking ? userRanking.userName : '사용자';
});

// 게임 상태
const gameState = ref('tutorial'); // tutorial, category-select, word-select, board-arrange, mode-select, countdown, playing, result
const currentTutorialStep = ref(0);
const countdownValue = ref(3);
const selectedCategory = ref(''); // 선택된 카테고리
const selectedMode = ref(''); // 선택된 모드 ('3-bingo' or '5-bingo')

// 게임 데이터
const allWords = ref([]); // 현재 카테고리의 전체 단어 (객체 배열)
const selectedWords = ref([]); // 사용자가 선택한 25개 단어 객체
const userBingoBoard = ref([]); // 사용자 5x5 빙고판
const aiBingoBoard = ref([]); // AI 5x5 빙고판
const currentTurn = ref('user'); // 'user' or 'ai'
const userBingoCount = ref(0);
const aiBingoCount = ref(0);
const userBingoLines = ref([]); // 사용자 완성된 빙고 라인
const aiBingoLines = ref([]); // AI 완성된 빙고 라인
const gameHistory = ref([]); // 게임 히스토리 (누가 어떤 단어를 불렀는지)
const learnedWords = ref([]); // 게임 중 학습한 단어 (이미지 포함)
const showWordImage = ref(false); // 단어 이미지 표시 여부
const currentWordInfo = ref(null); // 현재 표시할 단어 정보 (word, imageUrl, player)
const imageCache = ref({}); // 단어별 이미지 캐시
const isProcessingTurn = ref(false); // 턴 처리 중 여부 (중복 클릭 방지)
const score = ref(0); // 게임 점수
const playedTime = ref(0); // 실제 플레이한 시간 (150 - 남은시간)

// 타이머
const turnTimeLeft = ref(20); // 턴 타이머 20초
const gameTimeLeft = ref(150); // 게임 전체 타이머 2분 30초 (150초)
const turnTimerInterval = ref(null);
const gameTimerInterval = ref(null);
const showBingoAnimation = ref(false); // 빙고 달성 애니메이션
const currentBingoPlayer = ref(null); // 현재 빙고 달성한 플레이어 ('user' or 'ai')
const currentBingoNumber = ref(0); // 현재 몇 번째 빙고인지
const showVictoryAnimation = ref(false); // 승리 확정 애니메이션
const victoryPlayer = ref(null); // 승리한 플레이어 ('user' or 'ai')
const victoryMode = ref(''); // 승리한 모드 ('3-bingo' or '5-bingo')

// 드래그앤드랍
const draggedIndex = ref(null);

// 튜토리얼 단계
const tutorialSteps = computed(() => [
  {
    title: t('games.tutorials.bingo.steps.0.title'),
    description: t('games.tutorials.bingo.steps.0.description'),
    icon: t('games.tutorials.bingo.steps.0.icon'),
    details: [
      t('games.tutorials.bingo.steps.0.details.0'),
      t('games.tutorials.bingo.steps.0.details.1'),
      t('games.tutorials.bingo.steps.0.details.2'),
      t('games.tutorials.bingo.steps.0.details.3'),
      t('games.tutorials.bingo.steps.0.details.4')
    ]
  },
  {
    title: t('games.tutorials.bingo.steps.1.title'),
    description: t('games.tutorials.bingo.steps.1.description'),
    icon: t('games.tutorials.bingo.steps.1.icon'),
    details: [
      t('games.tutorials.bingo.steps.1.details.0'),
      t('games.tutorials.bingo.steps.1.details.1'),
      t('games.tutorials.bingo.steps.1.details.2'),
      t('games.tutorials.bingo.steps.1.details.3'),
      t('games.tutorials.bingo.steps.1.details.4')
    ]
  },
  {
    title: t('games.tutorials.bingo.steps.2.title'),
    description: t('games.tutorials.bingo.steps.2.description'),
    icon: t('games.tutorials.bingo.steps.2.icon'),
    details: [
      t('games.tutorials.bingo.steps.2.details.0'),
      t('games.tutorials.bingo.steps.2.details.1'),
      t('games.tutorials.bingo.steps.2.details.2'),
      t('games.tutorials.bingo.steps.2.details.3')
    ]
  },
  {
    title: t('games.tutorials.bingo.steps.3.title'),
    description: t('games.tutorials.bingo.steps.3.description'),
    icon: t('games.tutorials.bingo.steps.3.icon'),
    details: [
      t('games.tutorials.bingo.steps.3.details.0'),
      t('games.tutorials.bingo.steps.3.details.1'),
      t('games.tutorials.bingo.steps.3.details.2'),
      t('games.tutorials.bingo.steps.3.details.3'),
      t('games.tutorials.bingo.steps.3.details.4')
    ]
  },
  {
    title: t('games.tutorials.bingo.steps.4.title'),
    description: t('games.tutorials.bingo.steps.4.description'),
    icon: t('games.tutorials.bingo.steps.4.icon'),
    details: [
      t('games.tutorials.bingo.steps.4.details.0'),
      t('games.tutorials.bingo.steps.4.details.1'),
      t('games.tutorials.bingo.steps.4.details.2'),
      t('games.tutorials.bingo.steps.4.details.3'),
      t('games.tutorials.bingo.steps.4.details.4')
    ]
  }
]);

// 카테고리 정보
const categories = [
  { id: '과일', name: '과일', icon: '🍎', description: '사과, 바나나, 포도 등' },
  { id: '동물', name: '동물', icon: '🐶', description: '강아지, 고양이, 사자 등' },
  { id: '음식', name: '음식', icon: '🍜', description: '김치, 불고기, 피자 등' },
  { id: '직업', name: '직업', icon: '💼', description: '의사, 선생님, 요리사 등' }
];

// 모드 정보
const modes = [
  {
    id: '3-bingo',
    name: '3빙고 모드',
    icon: '🎯',
    description: '3빙고를 먼저 완성하면 승리!',
    detail: '빠른 전략과 집중력이 필요한 모드입니다.'
  },
  {
    id: '5-bingo',
    name: '5빙고 모드',
    icon: '🏆',
    description: '5빙고를 먼저 완성하면 승리!',
    detail: '더욱 치열한 두뇌 싸움이 펼쳐집니다.'
  }
];

// 단어 데이터 로딩 (카테고리별)
const loadWordsData = async (category) => {
  try {
    const response = await fetch('/data/bingoWords.json');
    const data = await response.json();
    allWords.value = data.categories[category] || [];
  } catch (error) {
    console.error('단어 데이터 로딩 실패:', error);
    allWords.value = [];
  }
};

// 게임 시작 (튜토리얼 완료 후 카테고리 선택으로)
const startGame = async () => {
  gameState.value = 'category-select';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 카테고리 선택
const selectCategory = async (category) => {
  selectedCategory.value = category;
  await loadWordsData(category);
  gameState.value = 'word-select';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 단어 선택 완료
const completeWordSelection = () => {
  if (selectedWords.value.length === 25) {
    userBingoBoard.value = createBingoBoard(selectedWords.value);
    gameState.value = 'board-arrange';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// 빙고판 배치 완료 (모드 선택으로 이동)
const completeBoardArrangement = () => {
  gameState.value = 'mode-select';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// 모드 선택
const selectMode = (mode) => {
  selectedMode.value = mode;
  gameState.value = 'countdown';
  countdownValue.value = 3;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // 게임 플레이 로그 기록 (인기 게임 통계용)
  logGamePlay('bingo');
  startCountdown();
};

// 카운트다운
const startCountdown = () => {
  const countdownInterval = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value === 0) {
      clearInterval(countdownInterval);
      // countdownValue === 0일 때 "..." 표시됨
      // beginGame() 호출 및 완료 대기
      beginGame().then(() => {
        // 준비 완료, "Game Start!" 표시
        countdownValue.value = -1;
        setTimeout(() => {
          gameState.value = 'playing';
          startTime.value = Date.now();
        }, 2100); // 1.5초 delay + 0.6초 애니메이션 = 2.1초
      });
    }
  }, 1000);
};

// 단어 선택 토글
const toggleWordSelection = (wordObj) => {
  const index = selectedWords.value.findIndex(w => w.word === wordObj.word);
  if (index > -1) {
    selectedWords.value.splice(index, 1);
  } else {
    if (selectedWords.value.length < 25) {
      selectedWords.value.push(wordObj);
    }
  }
};

// 자동 단어 선택
const autoSelectWords = () => {
  const shuffled = [...allWords.value].sort(() => Math.random() - 0.5);
  selectedWords.value = shuffled.slice(0, 25);
};

// 빙고판 생성
const createBingoBoard = (wordObjs) => {
  const shuffled = [...wordObjs].sort(() => Math.random() - 0.5);
  const board = [];
  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      row.push({
        word: shuffled[i * 5 + j].word,
        meaning: shuffled[i * 5 + j].meaning,
        checked: false
      });
    }
    board.push(row);
  }
  return board;
};

// 빙고판 재배치 (랜덤)
const shuffleBingoBoard = () => {
  userBingoBoard.value = createBingoBoard(selectedWords.value);
};

// 드래그 시작
const onDragStart = (rowIndex, colIndex) => {
  draggedIndex.value = { row: rowIndex, col: colIndex };
};

// 드래그 오버
const onDragOver = (event) => {
  event.preventDefault();
};

// 드롭
const onDrop = (targetRow, targetCol) => {
  if (draggedIndex.value === null) return;

  const sourceRow = draggedIndex.value.row;
  const sourceCol = draggedIndex.value.col;

  // 두 셀의 단어 교환
  const temp = userBingoBoard.value[sourceRow][sourceCol].word;
  userBingoBoard.value[sourceRow][sourceCol].word = userBingoBoard.value[targetRow][targetCol].word;
  userBingoBoard.value[targetRow][targetCol].word = temp;

  draggedIndex.value = null;
};

// 드래그 종료
const onDragEnd = () => {
  draggedIndex.value = null;
};

// 게임 플레이 시작
const beginGame = async () => {
  // 사용자 빙고판은 이미 board-arrange에서 생성됨

  // AI 단어 선택 (백엔드 API 호출)
  try {
    const response = await fetch('http://localhost:3031/api/bingo/ai-select-words', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        words: allWords.value.map(w => w.word) // 단어 문자열만 전송
      })
    });

    const data = await response.json();
    const aiWordStrings = data.selectedWords || [];

    // AI가 선택한 단어 문자열을 객체로 변환
    const aiWords = aiWordStrings.map(wordStr => {
      return allWords.value.find(w => w.word === wordStr) || { word: wordStr, meaning: '' };
    });

    // AI 빙고판 생성
    aiBingoBoard.value = createBingoBoard(aiWords);
  } catch (error) {
    console.error('AI 단어 선택 오류:', error);
    // 폴백: 랜덤 선택
    const aiWords = [...allWords.value].sort(() => Math.random() - 0.5).slice(0, 25);
    aiBingoBoard.value = createBingoBoard(aiWords);
  }

  // gameState는 startCountdown()에서 설정됨
  currentTurn.value = 'user';
  userBingoCount.value = 0;
  aiBingoCount.value = 0;
  userBingoLines.value = [];
  aiBingoLines.value = [];
  gameHistory.value = [];
  learnedWords.value = []; // 학습한 단어 초기화
  imageCache.value = {}; // 이미지 캐시 초기화

  playMusic();
  startTurnTimer(); // 첫 턴 타이머 시작
  startGameTimer(); // 게임 전체 타이머 시작
};

// 단어 체크 (빙고판에서 단어 찾아서 체크)
const checkWordInBoard = (board, word) => {
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (board[i][j].word === word) {
        board[i][j].checked = true;
        return true;
      }
    }
  }
  return false;
};

// 턴 타이머 시작
const startTurnTimer = () => {
  stopTurnTimer();
  turnTimeLeft.value = 20;

  turnTimerInterval.value = setInterval(() => {
    turnTimeLeft.value--;

    if (turnTimeLeft.value <= 0) {
      stopTurnTimer();
      // 시간 초과 - 턴 넘김
      if (currentTurn.value === 'user') {
        // 사용자 턴 시간 초과 -> AI 턴으로 변경
        currentTurn.value = 'ai';
        setTimeout(() => {
          aiTurn();
        }, 1500);
      }
    }
  }, 1000);
};

// 턴 타이머 정지
const stopTurnTimer = () => {
  if (turnTimerInterval.value) {
    clearInterval(turnTimerInterval.value);
    turnTimerInterval.value = null;
  }
};

// 게임 전체 타이머 시작
const startGameTimer = () => {
  stopGameTimer();
  gameTimeLeft.value = 150; // 2분 30초

  gameTimerInterval.value = setInterval(() => {
    gameTimeLeft.value--;

    if (gameTimeLeft.value <= 0) {
      stopGameTimer();
      stopTurnTimer();
      // 시간 종료 - 게임 종료
      endGameByTime();
    }
  }, 1000);
};

// 게임 타이머 정지
const stopGameTimer = () => {
  if (gameTimerInterval.value) {
    clearInterval(gameTimerInterval.value);
    gameTimerInterval.value = null;
  }
};

// 게임 타이머 일시정지 (저장)
const pausedGameTime = ref(null);
const pauseGameTimer = () => {
  if (gameTimerInterval.value) {
    pausedGameTime.value = gameTimeLeft.value;
    clearInterval(gameTimerInterval.value);
    gameTimerInterval.value = null;
  }
};

// 게임 타이머 재개
const resumeGameTimer = () => {
  if (pausedGameTime.value !== null && !gameTimerInterval.value) {
    gameTimeLeft.value = pausedGameTime.value;
    pausedGameTime.value = null;

    gameTimerInterval.value = setInterval(() => {
      gameTimeLeft.value--;

      if (gameTimeLeft.value <= 0) {
        stopGameTimer();
        stopTurnTimer();
        // 시간 종료 - 게임 종료
        endGameByTime();
      }
    }, 1000);
  }
};

// 모든 단어가 선택되었는지 확인
const checkAllWordsSelected = () => {
  const allUserChecked = userBingoBoard.value.every(row => row.every(cell => cell.checked));
  const allAiChecked = aiBingoBoard.value.every(row => row.every(cell => cell.checked));
  return allUserChecked || allAiChecked;
};

// 시간 종료로 게임 종료
const endGameByTime = () => {
  if (userBingoCount.value > aiBingoCount.value) {
    endGame('win');
  } else if (userBingoCount.value < aiBingoCount.value) {
    endGame('lose');
  } else {
    endGame('draw');
  }
};

// 사용자가 단어 선택
const selectBingoWord = async (word) => {
  // 턴 체크 및 중복 클릭 방지
  if (currentTurn.value !== 'user' || isProcessingTurn.value) return;
  const cell = userBingoBoard.value.flat().find(c => c.word === word);
  if (!cell || cell.checked) return;

  // 턴 처리 시작
  isProcessingTurn.value = true;

  // 타이머 정지
  stopTurnTimer();

  // 이미지 가져오기 및 표시
  await showWordImageModal(word, 'user');

  // 단어 체크
  checkWordInBoard(userBingoBoard.value, word);
  checkWordInBoard(aiBingoBoard.value, word);

  // 학습한 단어에 추가 (이미지 URL 포함)
  if (!learnedWords.value.find(w => w.word === word)) {
    learnedWords.value.push({
      word: word,
      imageUrl: imageCache.value[word]?.imageUrl || ''
    });
  }

  // 히스토리 추가
  gameHistory.value.push({
    player: 'user',
    word: word
  });

  // 이전 빙고 개수 저장
  const prevUserBingoCount = userBingoCount.value;
  const prevAiBingoCount = aiBingoCount.value;

  // 빙고 개수 체크 및 빙고 라인 업데이트
  const userResult = getBingoLinesAndCount(userBingoBoard.value);
  const aiResult = getBingoLinesAndCount(aiBingoBoard.value);

  userBingoCount.value = userResult.count;
  aiBingoCount.value = aiResult.count;
  userBingoLines.value = userResult.lines;
  aiBingoLines.value = aiResult.lines;

  // 모든 단어가 선택되었는지 확인
  if (checkAllWordsSelected()) {
    isProcessingTurn.value = false;
    endGameByTime();
    return;
  }

  // 새로운 빙고 달성 시 애니메이션 (사용자)
  const hasUserBingo = userBingoCount.value > prevUserBingoCount;
  if (hasUserBingo) {
    currentBingoPlayer.value = 'user';
    currentBingoNumber.value = userBingoCount.value;
    showBingoAnimation.value = true;

    // 애니메이션 완료 대기
    await new Promise(resolve => {
      setTimeout(() => {
        showBingoAnimation.value = false;
        currentBingoPlayer.value = null;
        resolve();
      }, 2000);
    });
  }

  // AI 빙고도 체크 (사용자가 선택한 단어로 AI 빙고가 완성될 수 있음)
  const hasAiBingo = aiBingoCount.value > prevAiBingoCount;
  if (hasAiBingo) {
    currentBingoPlayer.value = 'ai';
    currentBingoNumber.value = aiBingoCount.value;
    showBingoAnimation.value = true;

    // 애니메이션 완료 대기
    await new Promise(resolve => {
      setTimeout(() => {
        showBingoAnimation.value = false;
        currentBingoPlayer.value = null;
        resolve();
      }, 2000);
    });
  }

  // 모드별 승리 조건 체크
  if (selectedMode.value === '3-bingo') {
    if (userBingoCount.value >= 3) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'user';
      victoryMode.value = '3-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('win');
      return;
    } else if (aiBingoCount.value >= 3) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'ai';
      victoryMode.value = '3-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('lose');
      return;
    }
  } else if (selectedMode.value === '5-bingo') {
    if (userBingoCount.value >= 5) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'user';
      victoryMode.value = '5-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('win');
      return;
    } else if (aiBingoCount.value >= 5) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'ai';
      victoryMode.value = '5-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('lose');
      return;
    }
  }

  // 턴 처리 완료
  isProcessingTurn.value = false;

  // 다음 턴으로 전환 (약간의 딜레이)
  setTimeout(() => {
    currentTurn.value = 'ai';
    setTimeout(() => {
      aiTurn();
    }, 1000);
  }, 100);
};

// AI 턴
const aiTurn = async () => {
  // 턴 처리 시작
  isProcessingTurn.value = true;

  // AI가 아직 체크하지 않은 단어 중 전략적으로 선택 (백엔드 API 호출)
  const availableWords = aiBingoBoard.value
    .flat()
    .filter(cell => !cell.checked);

  if (availableWords.length === 0) {
    isProcessingTurn.value = false;
    endGameByTime();
    return;
  }

  let selectedWord;

  try {
    // 사용자가 마지막으로 선택한 단어
    const userLastWord = gameHistory.value.length > 0
      ? gameHistory.value[gameHistory.value.length - 1].word
      : null;

    const response = await fetch('http://localhost:3031/api/bingo/ai-turn', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bingoBoard: aiBingoBoard.value,
        userBoard: userBingoBoard.value,
        userLastWord: userLastWord
      })
    });

    const data = await response.json();
    selectedWord = data.selectedWord;

    console.log('AI 선택:', selectedWord, '|', data.reasoning);
  } catch (error) {
    console.error('AI 턴 오류:', error);
    // 폴백: 랜덤 선택
    selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)].word;
  }

  // 이미지 가져오기 및 표시
  await showWordImageModal(selectedWord, 'ai');

  // 단어 체크
  checkWordInBoard(aiBingoBoard.value, selectedWord);
  checkWordInBoard(userBingoBoard.value, selectedWord);

  // 학습한 단어에 추가 (이미지 URL 포함)
  if (!learnedWords.value.find(w => w.word === selectedWord)) {
    learnedWords.value.push({
      word: selectedWord,
      imageUrl: imageCache.value[selectedWord]?.imageUrl || ''
    });
  }

  // 히스토리 추가
  gameHistory.value.push({
    player: 'ai',
    word: selectedWord
  });

  // 이전 빙고 개수 저장
  const prevUserBingoCount = userBingoCount.value;
  const prevAiBingoCount = aiBingoCount.value;

  // 빙고 개수 체크 및 빙고 라인 업데이트
  const userResult = getBingoLinesAndCount(userBingoBoard.value);
  const aiResult = getBingoLinesAndCount(aiBingoBoard.value);

  userBingoCount.value = userResult.count;
  aiBingoCount.value = aiResult.count;
  userBingoLines.value = userResult.lines;
  aiBingoLines.value = aiResult.lines;

  // 모든 단어가 선택되었는지 확인
  if (checkAllWordsSelected()) {
    isProcessingTurn.value = false;
    endGameByTime();
    return;
  }

  // 새로운 빙고 달성 시 애니메이션 (AI)
  const hasAiBingo = aiBingoCount.value > prevAiBingoCount;
  if (hasAiBingo) {
    currentBingoPlayer.value = 'ai';
    currentBingoNumber.value = aiBingoCount.value;
    showBingoAnimation.value = true;

    // 애니메이션 완료 대기
    await new Promise(resolve => {
      setTimeout(() => {
        showBingoAnimation.value = false;
        currentBingoPlayer.value = null;
        resolve();
      }, 2000);
    });
  }

  // 사용자 빙고도 체크 (AI가 선택한 단어로 사용자 빙고가 완성될 수 있음)
  const hasUserBingo = userBingoCount.value > prevUserBingoCount;
  if (hasUserBingo) {
    currentBingoPlayer.value = 'user';
    currentBingoNumber.value = userBingoCount.value;
    showBingoAnimation.value = true;

    // 애니메이션 완료 대기
    await new Promise(resolve => {
      setTimeout(() => {
        showBingoAnimation.value = false;
        currentBingoPlayer.value = null;
        resolve();
      }, 2000);
    });
  }

  // 모드별 승리 조건 체크
  if (selectedMode.value === '3-bingo') {
    if (aiBingoCount.value >= 3) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'ai';
      victoryMode.value = '3-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('lose');
      return;
    } else if (userBingoCount.value >= 3) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'user';
      victoryMode.value = '3-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('win');
      return;
    }
  } else if (selectedMode.value === '5-bingo') {
    if (aiBingoCount.value >= 5) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'ai';
      victoryMode.value = '5-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('lose');
      return;
    } else if (userBingoCount.value >= 5) {
      // 승리 애니메이션 표시
      victoryPlayer.value = 'user';
      victoryMode.value = '5-bingo';
      showVictoryAnimation.value = true;

      await new Promise(resolve => {
        setTimeout(() => {
          showVictoryAnimation.value = false;
          resolve();
        }, 2500);
      });

      isProcessingTurn.value = false;
      endGame('win');
      return;
    }
  }

  // 턴 처리 완료
  isProcessingTurn.value = false;

  // 다음 턴으로 전환 (약간의 딜레이)
  setTimeout(() => {
    currentTurn.value = 'user';
    startTurnTimer(); // 사용자 턴 타이머 시작
  }, 100);
};

// 빙고 라인과 개수 계산 (라인 정보 포함)
const getBingoLinesAndCount = (board) => {
  const lines = [];

  // 가로 체크
  for (let i = 0; i < 5; i++) {
    if (board[i].every(cell => cell.checked)) {
      lines.push({ type: 'row', index: i });
    }
  }

  // 세로 체크
  for (let j = 0; j < 5; j++) {
    if (board.every(row => row[j].checked)) {
      lines.push({ type: 'col', index: j });
    }
  }

  // 대각선 체크 (왼쪽 위 → 오른쪽 아래)
  if (board.every((row, i) => row[i].checked)) {
    lines.push({ type: 'diag1', index: 0 });
  }

  // 대각선 체크 (오른쪽 위 → 왼쪽 아래)
  if (board.every((row, i) => row[4 - i].checked)) {
    lines.push({ type: 'diag2', index: 0 });
  }

  return {
    count: lines.length,
    lines: lines
  };
};

// 빙고 개수 세기 (기존 함수 호환성 유지)
const countBingo = (board) => {
  return getBingoLinesAndCount(board).count;
};

// 점수 계산
const calculateScore = () => {
  let totalScore = 0;

  // 1. 빙고 개수 점수 (1개당 20점)
  totalScore += userBingoCount.value * 20;

  // 2. 모드 보너스
  if (selectedMode.value === '5-bingo') {
    totalScore += 50;
  } else if (selectedMode.value === '3-bingo') {
    totalScore += 30;
  }

  // 3. 승리 보너스
  if (gameResult.value === 'win') {
    totalScore += 100;
  } else if (gameResult.value === 'draw') {
    totalScore += 50;
  }

  // 4. 시간 보너스 (남은 시간 × 1점, 최대 150점)
  const timeBonus = Math.max(0, gameTimeLeft.value);
  totalScore += timeBonus;

  score.value = totalScore;
  playedTime.value = 150 - gameTimeLeft.value;
};

// 게임 종료
const gameResult = ref(''); // 'win', 'lose', 'draw'
const endGame = async (result) => {
  stopTurnTimer(); // 타이머 정지
  stopGameTimer(); // 게임 타이머 정지
  pauseMusic();
  gameResult.value = result;
  calculateScore(); // 점수 계산
  gameState.value = 'result';
};

// 게임 재시작
const restartGame = async () => {
  selectedWords.value = [];
  userBingoBoard.value = [];
  aiBingoBoard.value = [];
  gameHistory.value = [];
  selectedCategory.value = '';
  selectedMode.value = '';
  allWords.value = [];
  score.value = 0;
  playedTime.value = 0;
  userBingoCount.value = 0;
  aiBingoCount.value = 0;
  gameState.value = 'category-select';
};

// 홈으로 가기
const goHome = () => {
  stopTurnTimer(); // 타이머 정지
  stopGameTimer(); // 게임 타이머 정지
  pauseMusic();
  router.push('/game');
};

// 이전 단계로 돌아가기
const goBack = () => {
  if (gameState.value === 'word-select') {
    // 단어 선택 → 주제 선택
    gameState.value = 'category-select';
  } else if (gameState.value === 'board-arrange') {
    // 빙고판 배치 → 단어 선택
    gameState.value = 'word-select';
  } else if (gameState.value === 'mode-select') {
    // 모드 선택 → 빙고판 배치
    gameState.value = 'board-arrange';
  } else {
    // 그 외의 경우 홈으로
    goHome();
  }
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

// JWT 토큰에서 사용자 이름 가져오기 (한글 지원)
const getCurrentUserName = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return '사용자';

    // JWT payload 디코딩 (한글 문자 지원)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    );

    const payload = JSON.parse(jsonPayload);
    return payload.name || '사용자';
  } catch (error) {
    console.error('토큰 파싱 오류:', error);
    return '사용자';
  }
};

// 게임 점수 저장
const saveScore = async () => {
  console.log('🎮 빙고 게임 점수 저장 시작');
  console.log('📊 점수:', score.value);
  console.log('🎯 모드:', selectedMode.value);
  console.log('🏆 승패:', gameResult.value);

  const token = localStorage.getItem('token');
  if (!token) {
    console.warn('⚠️ 로그인하지 않은 사용자 - 점수 저장 생략');
    return;
  }

  const userId = getCurrentUserId();
  if (!userId) {
    console.warn('⚠️ 유효하지 않은 토큰 - 점수 저장 생략');
    return;
  }

  currentUserId.value = userId;
  console.log('👤 사용자 ID:', userId);

  const requestData = {
    gameType: 'bingo_game',
    score: score.value,
    gameMode: selectedMode.value,
    additionalData: {
      bingoCount: userBingoCount.value,
      playedTime: playedTime.value,
      isWin: gameResult.value === 'win',
      mode: selectedMode.value,
      category: selectedCategory.value
    }
  };

  console.log('📤 요청 데이터:', requestData);

  isSavingScore.value = true;
  try {
    const response = await axios.post(
      `${API_URL}/api/game-scores`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('✅ 빙고 게임 점수 저장 성공:', response.data);
    if (response.data.success && response.data.data && response.data.data.rank) {
      myRankInfo.value = {
        rank: response.data.data.rank,
        score: score.value,
        userId: currentUserId.value,
        gameScoreId: response.data.data.gameScore.id,
        userName: response.data.data.userName
      };
      // 사용자 이름을 별도로 저장 (게임 플레이 중에도 사용)
      currentUserNameValue.value = response.data.data.userName;
      console.log('✅ 내 순위 정보 저장:', myRankInfo.value);
    } else {
      console.warn('⚠️ 순위 정보 없음:', response.data);
    }
  } catch (error) {
    console.error('❌ 점수 저장 오류:', error);
    console.error('❌ 오류 상세:', error.response?.data);
  } finally {
    isSavingScore.value = false;
  }
};

// 랭킹 조회
const fetchRankings = async () => {
  console.log('🏆 빙고 게임 랭킹 조회 시작');
  console.log('🎯 조회 모드:', selectedMode.value);

  isLoadingRankings.value = true;
  try {
    const url = `${API_URL}/api/game-scores/rankings/bingo_game?limit=3&gameMode=${selectedMode.value}`;
    console.log('📤 요청 URL:', url);

    const response = await axios.get(url);
    console.log('📥 응답 데이터:', response.data);

    topRankings.value = response.data.data || [];
    console.log('✅ 빙고 게임 랭킹 조회 성공:', topRankings.value);
    console.log('📊 랭킹 개수:', topRankings.value.length);
  } catch (error) {
    console.error('❌ 랭킹 조회 오류:', error);
    console.error('❌ 오류 상세:', error.response?.data);
    topRankings.value = [];
  } finally {
    isLoadingRankings.value = false;
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

// 튜토리얼 이전 단계
const prevTutorialStep = () => {
  if (currentTutorialStep.value > 0) {
    currentTutorialStep.value--;
  }
};

// 튜토리얼 건너뛰기
const skipTutorial = () => {
  startGame();
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
  localStorage.setItem('bingoGameMusicMuted', isMusicMuted.value);

  if (isMusicMuted.value) {
    pauseMusic();
  } else if (gameState.value === 'playing') {
    playMusic();
  }
};

// 이미지 가져오기 함수
const fetchWordImage = async (word) => {
  // 캐시에 있으면 캐시 사용
  if (imageCache.value[word]) {
    return imageCache.value[word];
  }

  try {
    // allWords에서 단어 객체 찾기
    const wordObj = allWords.value.find(w => w.word === word);
    const englishWord = wordObj?.english || word;

    console.log(`🔍 이미지 검색: ${word} (${englishWord})`);

    const response = await fetch('http://localhost:3031/api/bingo/search-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: word,
        english: englishWord,
        category: selectedCategory.value
      })
    });

    const data = await response.json();

    // 캐시에 저장
    imageCache.value[word] = data;

    return data;
  } catch (error) {
    console.error('이미지 검색 오류:', error);
    // 오류 시 플레이스홀더 반환
    const fallbackData = {
      imageUrl: `https://via.placeholder.com/600x400/4299E1/FFFFFF?text=${encodeURIComponent(word)}`,
      fallback: true
    };
    imageCache.value[word] = fallbackData;
    return fallbackData;
  }
};

// 단어 이미지 표시 모달 (Promise 반환)
const showWordImageModal = async (word, player) => {
  // 게임 타이머 일시정지 (이미지 로딩 시간 동안)
  pauseGameTimer();

  // 이미지 가져오기
  const imageData = await fetchWordImage(word);

  // 단어 의미 가져오기
  const wordObj = allWords.value.find(w => w.word === word);

  currentWordInfo.value = {
    word: word,
    imageUrl: imageData.imageUrl,
    player: player,
    meaning: wordObj?.meaning || ''
  };
  showWordImage.value = true;

  // Promise로 모달이 닫힐 때까지 대기
  return new Promise((resolve) => {
    // 1.5초 후 자동으로 닫기
    setTimeout(() => {
      showWordImage.value = false;
      currentWordInfo.value = null;

      // 게임 타이머 재개
      resumeGameTimer();

      // 모달이 완전히 닫힌 후 resolve
      resolve();
    }, 1500);
  });
};

// 빙고 라인 좌표 계산
const getLineCoords = (line) => {
  const cellSize = 100;
  const padding = 50;

  if (line.type === 'row') {
    // 가로줄
    const y = line.index * cellSize + padding;
    return {
      x1: padding,
      y1: y,
      x2: 500 - padding,
      y2: y
    };
  } else if (line.type === 'col') {
    // 세로줄
    const x = line.index * cellSize + padding;
    return {
      x1: x,
      y1: padding,
      x2: x,
      y2: 500 - padding
    };
  } else if (line.type === 'diag1') {
    // 대각선 (왼쪽 위 → 오른쪽 아래)
    return {
      x1: padding,
      y1: padding,
      x2: 500 - padding,
      y2: 500 - padding
    };
  } else if (line.type === 'diag2') {
    // 대각선 (오른쪽 위 → 왼쪽 아래)
    return {
      x1: 500 - padding,
      y1: padding,
      x2: padding,
      y2: 500 - padding
    };
  }

  return { x1: 0, y1: 0, x2: 0, y2: 0 };
};

// 선택 완료 가능 여부
const canProceed = computed(() => selectedWords.value.length === 25);

// 컴포넌트 마운트
onMounted(() => {
  // 현재 로그인한 사용자 ID 및 이름 가져오기
  currentUserId.value = getCurrentUserId();
  currentUserNameValue.value = getCurrentUserName();

  // 배경음악 초기화
  bgMusic.value = new Audio('/audio/NintendoWii.mp3');
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
  stopTurnTimer(); // 타이머 정지
  stopGameTimer(); // 게임 타이머 정지

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

// 게임 상태 변경 시 점수 저장 및 랭킹 조회
watch(gameState, async (newState) => {
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (newState === 'result') {
    await saveScore();
    await fetchRankings();
  }
});
</script>

<template>
  <div class="bingo-game">
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
              <h2 class="common-title2">{{ t('games.tutorials.bingo.gameExplanation') }}</h2>
              <p class="common-caption text-secondary">{{ t('games.tutorials.bingo.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
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
                {{ t('games.tutorials.bingo.previous') }}
              </CommonButton>
              <CommonButton
                v-else
                @click="skipTutorial"
                variant="secondary"
                size="large"
              >
                {{ t('games.tutorials.bingo.startDirectly') }}
              </CommonButton>
              <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.bingo.next') : t('games.tutorials.bingo.startGame') }}
              </CommonButton>
            </div>
          </div>
        </div>
      </div>

      <!-- 카운트다운 화면 -->
      <div v-if="gameState === 'countdown'" class="countdown-screen">
        <div v-if="countdownValue > 0" class="countdown-number">{{ countdownValue }}</div>
        <div v-else-if="countdownValue === 0" class="countdown-text">
          <div class="loading-text">
            <span>L</span>
            <span>o</span>
            <span>a</span>
            <span>d</span>
            <span>i</span>
            <span>n</span>
            <span>g</span>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </div>
        </div>
        <div v-else class="countdown-text">
          <span class="game-start-text">Game Start!</span>
        </div>
      </div>

      <!-- 카테고리 선택 화면 -->
      <div v-if="gameState === 'category-select'" class="category-select-section">
        <div class="game-header">
          <button class="back-button" @click="goHome">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">📝</div>
            <div class="header-text">
              <h2 class="common-title2">주제 선택</h2>
              <p class="common-caption text-secondary">학습할 단어 주제를 선택하세요.</p>
            </div>
          </div>
        </div>

        <div class="category-grid">
          <button
            v-for="category in categories"
            :key="category.id"
            class="category-card"
            @click="selectCategory(category.id)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <h3 class="common-title3">{{ category.name }}</h3>
            <p class="common-body3 text-secondary">{{ category.description }}</p>
          </button>
        </div>
      </div>

      <!-- 단어 선택 화면 -->
      <div v-if="gameState === 'word-select'" class="word-select-section">
        <div class="game-header">
          <button class="back-button" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">📝</div>
            <div class="header-text">
              <h2 class="common-title2">단어 선택</h2>
              <p class="common-caption text-secondary">{{ selectedWords.length }} / 25 선택</p>
            </div>
          </div>
        </div>

        <div class="word-selection-area">
          <div class="selection-header">
            <h3 class="common-title3">{{ allWords.length }}개 중 25개를 선택하세요.</h3>
            <CommonButton @click="autoSelectWords" variant="secondary" size="medium">
              자동 선택
            </CommonButton>
          </div>

          <div class="words-grid-5x10">
            <button
              v-for="wordObj in allWords"
              :key="wordObj.word"
              class="word-card-large"
              :class="{ selected: selectedWords.some(w => w.word === wordObj.word) }"
              @click="toggleWordSelection(wordObj)"
              :title="wordObj.meaning"
            >
              {{ wordObj.word }}
            </button>
          </div>

          <div class="word-select-actions">
            <CommonButton
              @click="completeWordSelection"
              variant="primary"
              size="large"
              :disabled="selectedWords.length !== 25"
            >
              선택 완료 ({{ selectedWords.length }}/25)
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- 빙고판 배치 화면 -->
      <div v-if="gameState === 'board-arrange'" class="board-arrange-section">
        <div class="game-header">
          <button class="back-button" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">🎲</div>
            <div class="header-text">
              <h2 class="common-title2">빙고판 배치</h2>
              <p class="common-caption text-secondary">드래그해서 위치를 바꿀 수 있습니다.</p>
            </div>
          </div>
        </div>

        <div class="bingo-board-preview">
          <h3 class="common-title3">빙고판 배치하기</h3>
          <p class="common-body2 text-secondary">단어를 드래그해서 원하는 위치로 이동하세요.</p>

          <div class="preview-board">
            <div
              v-for="(row, i) in userBingoBoard"
              :key="i"
              class="bingo-row"
            >
              <div
                v-for="(cell, j) in row"
                :key="j"
                class="bingo-cell draggable"
                draggable="true"
                @dragstart="onDragStart(i, j)"
                @dragover="onDragOver"
                @drop="onDrop(i, j)"
                @dragend="onDragEnd"
              >
                {{ cell.word }}
              </div>
            </div>
          </div>

          <div class="setup-actions">
            <CommonButton @click="shuffleBingoBoard" variant="secondary" size="large">
              랜덤 재배치
            </CommonButton>
            <CommonButton @click="completeBoardArrangement" variant="primary" size="large">
              배치 완료
            </CommonButton>
          </div>
        </div>
      </div>

      <!-- 모드 선택 화면 -->
      <div v-if="gameState === 'mode-select'" class="mode-select-section">
        <div class="game-header">
          <button class="back-button" @click="goBack">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="header-info">
            <div class="header-icon">⚙️</div>
            <div class="header-text">
              <h2 class="common-title2">게임 모드 선택</h2>
              <p class="common-caption text-secondary">빙고 목표를 선택하세요.</p>
            </div>
          </div>
        </div>

        <div class="mode-grid">
          <button
            v-for="mode in modes"
            :key="mode.id"
            class="mode-card"
            @click="selectMode(mode.id)"
          >
            <div class="mode-icon">{{ mode.icon }}</div>
            <h3 class="common-title3">{{ mode.name }}</h3>
            <p class="common-body3 mode-description">{{ mode.description }}</p>
            <p class="common-body3 text-secondary mode-detail">{{ mode.detail }}</p>
          </button>
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
            <h3 class="common-title4">빙고 게임</h3>
          </div>
          <div class="header-right">
            <button class="music-toggle-button" @click="toggleMusic" :title="isMusicMuted ? '음악 켜기' : '음악 끄기'">
              {{ isMusicMuted ? '🔇' : '🔊' }}
            </button>
          </div>
        </div>

        <!-- 빙고 정보 -->
        <div class="bingo-info">
          <div class="bingo-score-section">
            <div class="score-item">
              <span class="score-label">내 빙고</span>
              <span class="score-value">{{ userBingoCount }}</span>
            </div>
          </div>

          <div class="timer-section-center">
            <div class="timer-container">
              <div class="timer-item">
                <span class="timer-icon">⏱️</span>
                <div class="timer-content">
                  <span class="timer-label">게임 시간</span>
                  <span class="timer-value" :class="{ warning: gameTimeLeft <= 20 }">
                    {{ Math.floor(gameTimeLeft / 60) }}:{{ String(gameTimeLeft % 60).padStart(2, '0') }}
                  </span>
                </div>
              </div>
              <div class="timer-divider"></div>
              <div class="timer-item">
                <span class="timer-icon">⏳</span>
                <div class="timer-content">
                  <span class="timer-label">턴 시간</span>
                  <span class="timer-value" :class="{ warning: turnTimeLeft <= 5 }">{{ turnTimeLeft }}초</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bingo-score-section">
            <div class="score-item">
              <span class="score-label">AI 빙고</span>
              <span class="score-value">{{ aiBingoCount }}</span>
            </div>
          </div>
        </div>

        <!-- 빙고판 영역 (좌우 분할) -->
        <div class="bingo-boards-container">
          <!-- 사용자 빙고판 (왼쪽) -->
          <div class="bingo-board-section user" :class="{ dimmed: currentTurn !== 'user', active: currentTurn === 'user' }">
            <span v-if="currentTurn === 'user'" class="turn-indicator user-turn">🟢 당신의 차례</span>
            <div class="board-header">
              <h4 class="common-title4">내 빙고판</h4>
              <span class="bingo-badge">{{ userBingoCount }} 빙고</span>
            </div>
            <div class="bingo-board-wrapper">
              <div class="bingo-board">
                <div
                  v-for="(row, i) in userBingoBoard"
                  :key="i"
                  class="bingo-row"
                >
                  <button
                    v-for="(cell, j) in row"
                    :key="j"
                    class="bingo-cell"
                    :class="{
                      checked: cell.checked,
                      clickable: currentTurn === 'user' && !cell.checked
                    }"
                    @click="currentTurn === 'user' && !cell.checked && selectBingoWord(cell.word)"
                    :disabled="currentTurn !== 'user' || cell.checked"
                  >
                    {{ cell.word }}
                  </button>
                </div>
              </div>
              <!-- 빙고 라인 오버레이 -->
              <svg class="bingo-lines-overlay" viewBox="0 0 500 500">
                <line
                  v-for="(line, idx) in userBingoLines"
                  :key="idx"
                  :x1="getLineCoords(line).x1"
                  :y1="getLineCoords(line).y1"
                  :x2="getLineCoords(line).x2"
                  :y2="getLineCoords(line).y2"
                  stroke="#ff6b7a"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-opacity="0.5"
                  stroke-dasharray="10 5"
                  class="bingo-line"
                />
              </svg>
            </div>
          </div>

          <!-- AI 빙고판 (오른쪽) - 가려진 상태 -->
          <div class="bingo-board-section ai" :class="{ dimmed: currentTurn !== 'ai', active: currentTurn === 'ai' }">
            <span v-if="currentTurn === 'ai'" class="turn-indicator ai-turn">🔴 AI의 차례</span>
            <div class="board-header">
              <h4 class="common-title4">AI 빙고판</h4>
              <span class="bingo-badge">{{ aiBingoCount }} 빙고</span>
            </div>
            <div class="bingo-board-wrapper">
              <div class="bingo-board hidden">
                <div
                  v-for="(row, i) in aiBingoBoard"
                  :key="i"
                  class="bingo-row"
                >
                  <div
                    v-for="(cell, j) in row"
                    :key="j"
                    class="bingo-cell"
                    :class="{ checked: cell.checked }"
                  >
                    {{ cell.checked ? cell.word : '?' }}
                  </div>
                </div>
              </div>
              <!-- AI 빙고 라인 오버레이 -->
              <svg class="bingo-lines-overlay" viewBox="0 0 500 500">
                <line
                  v-for="(line, idx) in aiBingoLines"
                  :key="idx"
                  :x1="getLineCoords(line).x1"
                  :y1="getLineCoords(line).y1"
                  :x2="getLineCoords(line).x2"
                  :y2="getLineCoords(line).y2"
                  stroke="#ff6b7a"
                  stroke-width="6"
                  stroke-linecap="round"
                  stroke-opacity="0.5"
                  stroke-dasharray="10 5"
                  class="bingo-line"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- 게임 히스토리 -->
        <div class="game-history">
          <h4 class="common-title5">최근 선택</h4>
          <div class="history-items">
            <div
              v-for="(item, idx) in gameHistory.slice(-5).reverse()"
              :key="idx"
              class="history-item"
              :class="item.player"
            >
              <span class="player-badge">{{ item.player === 'user' ? '나' : 'AI' }}</span>
              <span class="word">{{ item.word }}</span>
            </div>
          </div>
        </div>

        <!-- 단어 이미지 표시 모달 -->
        <div v-if="showWordImage && currentWordInfo" class="word-image-modal">
          <div class="word-image-card" :class="currentWordInfo.player">
            <div class="word-title">{{ currentWordInfo.word }}</div>
            <div class="word-image-container">
              <img :src="currentWordInfo.imageUrl" :alt="currentWordInfo.word" class="word-image" />
            </div>
            <div v-if="currentWordInfo.meaning" class="word-meaning">{{ currentWordInfo.meaning }}</div>
            <div class="player-label">{{ currentWordInfo.player === 'user' ? '나의 선택' : 'AI의 선택' }}</div>
          </div>
        </div>

        <!-- 빙고 달성 애니메이션 -->
        <div v-if="showBingoAnimation" class="bingo-achievement-animation">
          <div class="bingo-text">BINGO!</div>
          <div class="bingo-count-text">
            {{ currentBingoPlayer === 'user' ? currentUserName + '님' : 'AI' }}, {{ currentBingoNumber }}번째 빙고!
          </div>
        </div>

        <!-- 승리 확정 애니메이션 -->
        <div v-if="showVictoryAnimation" class="victory-animation">
          <div class="victory-content">
            <div class="victory-icon">{{ victoryPlayer === 'user' ? '😊' : '🤖' }}</div>
            <div class="victory-title">
              {{ victoryMode === '3-bingo' ? '3빙고' : '5빙고' }} 달성!
            </div>
            <div class="victory-message">
              {{ victoryPlayer === 'user' ? currentUserName + '님 승리! 🎉' : 'AI 승리! 🎉' }}
            </div>
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
            <p class="result-title">빙고 게임</p>
            <div class="result-emoji">
              {{ gameResult === 'win' ? '😊' : gameResult === 'lose' ? '🤖' : '🤝' }}
            </div>
            <p class="result-message">
              {{ gameResult === 'win' ? currentUserName + '님 승리! 🎉' : gameResult === 'lose' ? 'AI 승리! 🎉' : '무승부' }}
            </p>
            <p class="result-sub-message">
              {{
                gameResult === 'win'
                  ? '축하합니다! AI를 이겼어요!'
                  : gameResult === 'lose'
                  ? '아쉽네요. 다시 도전해보세요!'
                  : '비겼습니다. 다시 한 번!'
              }}
            </p>
          </div>

          <div class="result-stats animate-stats">
            <div class="result-stat-item">
              <span class="result-stat-label">최종 점수</span>
              <span class="result-stat-value score-highlight">{{ score }}점</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-label">플레이 시간</span>
              <span class="result-stat-value">{{ Math.floor(playedTime / 60) }}:{{ String(playedTime % 60).padStart(2, '0') }}</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-label">내 빙고</span>
              <span class="result-stat-value">{{ userBingoCount }}개</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-label">AI 빙고</span>
              <span class="result-stat-value">{{ aiBingoCount }}개</span>
            </div>
            <div class="result-stat-item">
              <span class="result-stat-label">총 턴 수</span>
              <span class="result-stat-value">{{ gameHistory.length }}턴</span>
            </div>
          </div>

          <!-- 학습한 단어 복습 -->
          <div v-if="learnedWords.length > 0" class="learned-words-section">
            <h3 class="common-title4">🎓 오늘 학습한 단어</h3>
            <p class="common-body3 text-secondary">게임 중 선택된 {{ learnedWords.length }}개 단어를 복습하세요!</p>
            <div class="learned-words-grid">
              <div
                v-for="(wordObj, idx) in learnedWords"
                :key="idx"
                class="learned-word-card"
              >
                <div class="learned-word-title">{{ wordObj.word }}</div>
                <div v-if="wordObj.imageUrl" class="learned-word-image-container">
                  <img :src="wordObj.imageUrl" :alt="wordObj.word" class="learned-word-image" />
                </div>
              </div>
            </div>
          </div>

          <!-- 랭킹 섹션 -->
          <div class="ranking-section animate-ranking">
            <h3 class="ranking-title">
              🏆 빙고 게임 <span :style="{ color: selectedMode === '3-bingo' ? '#4CAF50' : '#f44336' }">{{ selectedMode === '3-bingo' ? '3빙고' : '5빙고' }} 모드</span> TOP 3 랭킹
            </h3>
            <div v-if="isLoadingRankings" class="ranking-loading">
              <div class="spinner"></div>
              <p>랭킹을 불러오는 중...</p>
            </div>
            <div v-else-if="topRankings.length === 0" class="ranking-empty">
              <p>아직 랭킹이 없습니다. 첫 번째 랭커가 되어보세요!</p>
            </div>
            <div v-else class="ranking-list">
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
                <span class="ranking-time">{{ Math.floor(ranking.additionalData?.playedTime / 60) }}:{{ String(ranking.additionalData?.playedTime % 60).padStart(2, '0') }}</span>
                <span class="ranking-score">{{ ranking.score }}점</span>
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
                <span class="ranking-time">{{ Math.floor(playedTime / 60) }}:{{ String(playedTime % 60).padStart(2, '0') }}</span>
                <span class="ranking-score">{{ myRankInfo.score }}점</span>
                <span class="ranking-result" :class="gameResult === 'win' ? 'win' : 'lose'">
                  {{ gameResult === 'win' ? '승리' : '패배' }}
                </span>
              </div>
            </div>
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
.bingo-game {
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
  animation: gameStartExpand 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1.5s both;
}

/* 로딩 텍스트 애니메이션 */
.loading-text {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  font-size: 72px;
  font-weight: 700;
  color: var(--common-blue);
}

.loading-text span {
  display: inline-block;
  animation: wave 1.2s ease-in-out infinite;
}

.loading-text span:nth-child(1) { animation-delay: 0s; }
.loading-text span:nth-child(2) { animation-delay: 0.1s; }
.loading-text span:nth-child(3) { animation-delay: 0.2s; }
.loading-text span:nth-child(4) { animation-delay: 0.3s; }
.loading-text span:nth-child(5) { animation-delay: 0.4s; }
.loading-text span:nth-child(6) { animation-delay: 0.5s; }
.loading-text span:nth-child(7) { animation-delay: 0.6s; }
.loading-text span:nth-child(8) { animation-delay: 0.7s; }
.loading-text span:nth-child(9) { animation-delay: 0.8s; }
.loading-text span:nth-child(10) { animation-delay: 0.9s; }

@keyframes wave {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
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

/* 카테고리 선택 화면 */
.category-select-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
}

.category-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  border: 3px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.category-card:hover {
  border-color: var(--common-blue);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
}

.category-card:active {
  transform: translateY(-2px);
}

.category-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.category-card h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}

.category-card p {
  margin: 0;
  font-size: 14px;
  color: var(--gray-600);
}

/* 모드 선택 화면 */
.mode-select-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 20px;
}

.mode-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 40px 24px;
  border: 3px solid var(--gray-200);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.mode-card:hover {
  border-color: var(--common-blue);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 123, 255, 0.15);
}

.mode-card:active {
  transform: translateY(-2px);
}

.mode-icon {
  font-size: 64px;
  margin-bottom: 8px;
}

.mode-card h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--gray-900);
}

.mode-card .mode-description {
  margin: 0;
  font-size: 15px;
  color: var(--common-blue);
  font-weight: 600;
}

.mode-card .mode-detail {
  margin: 0;
  font-size: 13px;
  color: var(--gray-600);
}

/* 단어 선택 화면 */
.word-select-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.word-selection-area {
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.selection-header h3 {
  color: var(--gray-900);
  margin: 0;
}

.words-grid-5x10 {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 24px;
  flex: 1;
  align-content: start;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.word-card-large {
  padding: 18px 16px;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.word-card-large:hover {
  border-color: var(--common-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.word-card-large.selected {
  background: var(--common-blue);
  color: white;
  border-color: var(--common-blue);
}

.word-select-actions {
  display: flex;
  justify-content: center;
  margin-top: auto;
  flex-shrink: 0;
}

/* 빙고판 배치 화면 */
.board-arrange-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.bingo-board-preview {
  background: white;
  border-radius: var(--radius-lg);
  padding: 32px;
  box-shadow: var(--shadow-sm);
  text-align: center;
}

.bingo-board-preview h3 {
  margin-bottom: 8px;
}

.bingo-board-preview p {
  margin-bottom: 24px;
}

.preview-board {
  display: inline-block;
  margin: 0 auto 24px;
}

.bingo-row {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.bingo-row:last-child {
  margin-bottom: 0;
}

.bingo-cell {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
  transition: all 0.2s ease;
}

.bingo-cell.preview {
  cursor: default;
}

.bingo-cell.draggable {
  cursor: move;
  user-select: none;
}

.bingo-cell.draggable:hover {
  background: var(--gray-50);
  border-color: var(--common-blue);
  transform: scale(1.05);
}

.bingo-cell.draggable:active {
  opacity: 0.7;
  cursor: grabbing;
}

.setup-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 게임 플레이 화면 */
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
  overflow-y: auto;
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

.bingo-info {
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 48px;
}

.bingo-score-section {
  flex: 0 0 auto;
  display: flex;
  justify-content: center;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 600;
}

.score-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--common-blue);
  line-height: 1;
}

.timer-section-center {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-container {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-200);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.timer-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.timer-icon {
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timer-label {
  font-size: 11px;
  color: var(--gray-600);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--common-blue);
  transition: all 0.3s ease;
  line-height: 1;
}

.timer-value.warning {
  color: #ff4757;
  animation: pulse 1s infinite;
}

.timer-divider {
  width: 2px;
  height: 40px;
  background: linear-gradient(180deg, transparent 0%, var(--gray-300) 50%, transparent 100%);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.bingo-boards-container {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.bingo-board-section {
  background: white;
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
}

.bingo-board-section.dimmed {
  opacity: 0.5;
  filter: brightness(0.7);
}

.bingo-board-section.active {
  opacity: 1;
  filter: brightness(1);
  box-shadow: 0 0 20px rgba(0, 123, 255, 0.3);
}

.turn-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: var(--radius-lg);
  animation: blink-indicator 1.5s infinite;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.turn-indicator.user-turn {
  background: #dcfce7;
  color: #16a34a;
  border: 2px solid #16a34a;
}

.turn-indicator.ai-turn {
  background: #fee2e2;
  color: #dc2626;
  border: 2px solid #dc2626;
}

@keyframes blink-indicator {
  0%, 100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
  50% {
    opacity: 0.3;
    transform: translateX(-50%) scale(0.95);
  }
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.board-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.bingo-badge {
  padding: 4px 12px;
  background: var(--common-blue);
  color: white;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 600;
}

.bingo-board-wrapper {
  position: relative;
  display: inline-block;
}

.bingo-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

.bingo-board .bingo-cell {
  cursor: default;
}

.bingo-board .bingo-cell.clickable {
  cursor: pointer;
  border-color: var(--common-blue);
}

.bingo-board .bingo-cell.clickable:hover {
  background: var(--gray-50);
  transform: scale(1.05);
}

.bingo-board .bingo-cell.checked {
  background: var(--common-blue);
  color: white;
  border-color: var(--common-blue);
}

.bingo-board.hidden .bingo-cell:not(.checked) {
  background: var(--gray-200);
  color: var(--gray-400);
}

.bingo-lines-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.bingo-line {
  animation: lineDraw 0.5s ease-out;
}

@keyframes lineDraw {
  from {
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dasharray: 1000;
    stroke-dashoffset: 0;
  }
}

.game-history {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid var(--gray-200);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.game-history h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-700);
}

.history-items {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  font-size: 13px;
}

.player-badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
}

.history-item.user .player-badge {
  background: var(--common-blue);
  color: white;
}

.history-item.ai .player-badge {
  background: var(--gray-300);
  color: var(--gray-700);
}

.history-item .word {
  font-weight: 500;
  color: var(--gray-900);
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

.result-emoji {
  font-size: 80px;
  margin-bottom: 16px;
}

.result-message {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 12px;
}

.result-sub-message {
  font-size: 16px;
  color: var(--gray-600);
  line-height: 1.6;
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
  flex-direction: row;
  align-items: center;
  gap: 6px;
}

.result-stat-label {
  font-size: 14px;
  color: var(--gray-600);
  font-weight: 500;
}

.result-stat-value {
  font-size: 16px;
  font-weight: 700;
  color: var(--gray-900);
}

.score-highlight {
  color: var(--common-blue);
  font-size: 18px;
}

.result-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 랭킹 섹션 */
.ranking-section {
  margin-top: 24px;
  margin-bottom: 24px;
  background: white;
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid var(--gray-200);
}

.ranking-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--gray-900);
  text-align: center;
  letter-spacing: -0.3px;
}

.ranking-loading,
.ranking-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--gray-600);
}

.ranking-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.ranking-loading .spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--common-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ranking-item {
  display: grid;
  grid-template-columns: 60px 1fr 100px 100px 80px;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--gray-50);
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  border: 2px solid transparent;
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
  flex-shrink: 0;
}

.medal {
  font-size: 32px;
}

.ranking-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-time {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  white-space: nowrap;
  text-align: center;
}

.ranking-score {
  font-size: 18px;
  font-weight: 700;
  color: var(--common-blue);
  text-align: center;
  white-space: nowrap;
}

.ranking-result {
  font-size: 13px;
  font-weight: 700;
  text-align: center;
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

/* 반응형 */
@media (max-width: 1024px) {
  .bingo-boards-container {
    grid-template-columns: 1fr;
  }

  .bingo-cell {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .game-content {
    padding: 16px;
  }

  .words-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 8px;
  }

  .bingo-cell {
    width: 50px;
    height: 50px;
    font-size: 11px;
  }

  .result-card {
    padding: 32px 24px;
  }

  .result-emoji {
    font-size: 64px;
  }

  .result-message {
    font-size: 24px;
  }

  .result-stats {
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
  }

  .result-stat-label {
    font-size: 12px;
  }

  .result-stat-value {
    font-size: 14px;
  }

  /* 랭킹 반응형 */
  .ranking-item {
    grid-template-columns: 50px 1fr 90px 90px 70px;
    gap: 10px;
    padding: 12px 16px;
  }

  .ranking-medal {
    font-size: 28px;
  }

  .ranking-name {
    font-size: 14px;
  }

  .ranking-time {
    font-size: 12px;
  }

  .ranking-score {
    font-size: 16px;
  }

  .ranking-result {
    font-size: 11px;
  }

  .ranking-title {
    font-size: 16px;
  }

  .ranking-section {
    padding: 16px;
  }
}

@media (max-width: 480px) {
  .game-content {
    padding: 12px;
  }

  .bingo-cell {
    width: 45px;
    height: 45px;
    font-size: 10px;
  }

  .result-card {
    padding: 24px 16px;
  }

  .result-emoji {
    font-size: 56px;
  }

  .result-message {
    font-size: 20px;
  }

  /* 랭킹 반응형 - 모바일 */
  .ranking-item {
    grid-template-columns: 40px 1fr 80px 80px 60px;
    gap: 8px;
    padding: 10px 12px;
  }

  .ranking-medal {
    font-size: 24px;
  }

  .ranking-name {
    font-size: 13px;
  }

  .ranking-time,
  .ranking-score,
  .ranking-result {
    font-size: 11px;
  }

  .countdown-number,
  .countdown-text {
    font-size: 80px;
  }
}

/* 단어 이미지 표시 모달 */
.word-image-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(5px);
}

.word-image-card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid var(--gray-200);
}

.word-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 20px;
  letter-spacing: -0.5px;
}

.word-image-container {
  width: 100%;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.word-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.word-image:hover {
  transform: scale(1.05);
}

.word-meaning {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--gray-700);
  margin: 12px 0 16px;
  padding: 0 8px;
}

.player-label {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 16px;
  background: var(--gray-100);
  color: var(--gray-600);
  letter-spacing: 0.3px;
}

/* 빙고 달성 애니메이션 - 화면 전체 */
.bingo-achievement-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1100;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  animation: bingoBackdropFade 2s ease-in-out;
  pointer-events: none;
}

.bingo-text {
  font-size: 120px;
  font-weight: 900;
  color: #fff;
  text-shadow:
    0 0 20px rgba(66, 153, 225, 0.8),
    0 0 40px rgba(66, 153, 225, 0.6),
    0 0 60px rgba(66, 153, 225, 0.4),
    0 4px 30px rgba(0, 0, 0, 0.3);
  letter-spacing: 16px;
  animation: bingoTextReveal 2s cubic-bezier(0.34, 1.56, 0.64, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.bingo-count-text {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin-top: 24px;
  text-shadow:
    0 0 10px rgba(255, 255, 255, 0.5),
    0 2px 20px rgba(0, 0, 0, 0.3);
  animation: bingoCountSlide 2s ease-in-out;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

@keyframes bingoBackdropFade {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes bingoTextReveal {
  0% {
    transform: scale(0.3) rotateY(-90deg);
    opacity: 0;
    filter: blur(10px);
  }
  40% {
    transform: scale(1.15) rotateY(0deg);
    opacity: 1;
    filter: blur(0px);
  }
  60% {
    transform: scale(1) rotateY(0deg);
  }
  80% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
    filter: blur(5px);
  }
}

@keyframes bingoCountSlide {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  30% {
    opacity: 0;
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  80% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-30px);
  }
}

/* 승리 확정 애니메이션 */
.victory-animation {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.95) 0%, rgba(66, 153, 225, 0.9) 100%);
  backdrop-filter: blur(10px);
  animation: victoryBackdropFade 2.5s ease-in-out;
  pointer-events: none;
}

.victory-content {
  text-align: center;
  animation: victoryContentReveal 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.victory-icon {
  font-size: 120px;
  margin-bottom: 20px;
  animation: victoryIconBounce 2.5s ease-in-out;
}

.victory-title {
  font-size: 56px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 16px;
  text-shadow:
    0 0 20px rgba(255, 255, 255, 0.8),
    0 0 40px rgba(255, 255, 255, 0.6),
    0 4px 30px rgba(0, 0, 0, 0.3);
  letter-spacing: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.victory-message {
  font-size: 72px;
  font-weight: 900;
  color: #fff;
  text-shadow:
    0 0 30px rgba(255, 255, 255, 0.9),
    0 0 60px rgba(255, 255, 255, 0.6),
    0 6px 40px rgba(0, 0, 0, 0.4);
  letter-spacing: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

@keyframes victoryBackdropFade {
  0% {
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes victoryContentReveal {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
  60% {
    transform: scale(1);
  }
  80% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1.1);
    opacity: 0;
  }
}

@keyframes victoryIconBounce {
  0% {
    transform: scale(0) rotate(0deg);
  }
  30% {
    transform: scale(1.3) rotate(360deg);
  }
  50% {
    transform: scale(1) rotate(360deg);
  }
  70% {
    transform: scale(1.1) rotate(360deg);
  }
  80% {
    transform: scale(1) rotate(360deg);
  }
  100% {
    transform: scale(1.2) rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* 학습한 단어 섹션 */
.learned-words-section {
  margin: 32px 0;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: var(--radius-lg);
  border: 2px solid var(--gray-300);
}

.learned-words-section h3 {
  margin: 0 0 8px 0;
  color: var(--gray-900);
  text-align: center;
}

.learned-words-section p {
  margin: 0 0 20px 0;
  text-align: center;
}

.learned-words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.learned-word-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 16px;
  border: 2px solid var(--gray-200);
  transition: all 0.2s ease;
}

.learned-word-card:hover {
  border-color: var(--common-blue);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.learned-word-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--common-blue);
  margin-bottom: 8px;
}

.learned-word-image-container {
  width: 100%;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.learned-word-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.learned-word-meaning {
  font-size: 14px;
  color: var(--gray-700);
  line-height: 1.5;
}
</style>
