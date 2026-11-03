<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import AppHeader from '@/components/common/AppHeader.vue';
import CommonButton from '@/components/common/CommonButton.vue';
import { logGamePlay } from '@/utils/gameStats';

const router = useRouter();
const { t } = useI18n();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';

// 퍼즐 데이터테
const puzzleData = ref(null);

// 음원 관련
const bgMusic = ref(null);
const isMusicMuted = ref(localStorage.getItem("crosswordGameMusicMuted") === "true");

// 랭킹 관련
const topRankings = ref([]);
const isLoadingRankings = ref(false);
const isSavingScore = ref(false);
const myRankInfo = ref(null);
const currentUserId = ref(null);

// 현재 사용자 이름
const currentUserName = computed(() => {
  if (myRankInfo.value && myRankInfo.value.userName) {
    return myRankInfo.value.userName;
  }
  const userRanking = topRankings.value.find(r => r.userId === currentUserId.value);
  return userRanking ? userRanking.userName : '사용자';
});

// 게임 상태
const gameState = ref("tutorial"); // tutorial, theme-select, difficulty-select, countdown, playing, result
const currentTutorialStep = ref(0);
const countdownValue = ref(3);
const selectedTheme = ref("proverb"); // proverb, idiom
const selectedDifficulty = ref("beginner"); // beginner, intermediate, advanced

// 게임 데이터
const currentPuzzle = ref(null);
const userAnswers = ref({});
const selectedCell = ref(null);
const selectedWord = ref(null);
const completedWords = ref([]);
const learnedWords = ref([]);
const hintsUsed = ref(0);

// 가로/세로 단어 분리
const acrossWords = computed(() => {
    const words = currentPuzzle.value?.words.filter(w => w.direction === 'across') || [];
    return words.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));
});

const downWords = computed(() => {
    const words = currentPuzzle.value?.words.filter(w => w.direction === 'down') || [];
    return words.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));
});
const hintMode = ref(false); // 힌트 선택 모드
const startTime = ref(null);
const endTime = ref(null);
const currentInputValue = ref(""); // 현재 입력 중인 값
const toast = ref({
    show: false,
    message: "",
    type: "success",
});
const tempInputs = ref({}); // 각 단어에 대한 임시 입력값
const hintedCells = ref([]); // 힌트로 알려준 칸들 (고정)
const wordInputs = reactive({}); // 각 단어별 입력값 저장
const explodingCells = ref([]); // 폭탄 애니메이션 중인 셀들
const revealedCells = ref([]); // 포기 시 공개된 셀들
const isGivenUp = ref(false); // 포기 여부
const revealCountdown = ref(0); // 정답 공개 카운트다운 (3, 2, 1)
const showRevealCountdown = ref(false); // 카운트다운 표시 여부
const showCompletionAnimation = ref(false); // 완성 축하 애니메이션 표시 여부

// 난이도 설정 - 사자성어용
const idiomDifficultyConfig = {
    beginner: {
        label: "초급",
        gridSize: 9,  // 8 → 9로 증가 (약간의 여유 공간 확보)
        wordCount: "6개",
        targetWords: 6,
        maxHints: 3,
        icon: "🌱",
        color: "#4CAF50",
        description: "짧고 쉬운 사자성어",
    },
    intermediate: {
        label: "중급",
        gridSize: 10,  // 최적 크기 유지
        wordCount: "8개",
        targetWords: 8,
        maxHints: 5,
        icon: "🔥",
        color: "#FF9800",
        description: "적당한 난이도의 사자성어",
    },
    advanced: {
        label: "고급",
        gridSize: 13,  // 12 → 13으로 증가 (10개 배치 공간 확보)
        wordCount: "10개",
        targetWords: 10,
        maxHints: 7,
        icon: "⚡",
        color: "#F44336",
        description: "어려운 사자성어",
    },
};

// 난이도 설정 - 속담용
const proverbDifficultyConfig = {
    beginner: {
        label: "초급",
        gridSize: 16,  // UI 깨짐 방지, 적당한 크기
        wordCount: "6개",
        targetWords: 6,
        maxHints: 3,
        icon: "🌱",
        color: "#4CAF50",
        description: "짧고 쉬운 속담",
    },
    intermediate: {
        label: "중급",
        gridSize: 18,  // UI 깨짐 방지, 적당한 크기
        wordCount: "8개",
        targetWords: 8,
        maxHints: 5,
        icon: "🔥",
        color: "#FF9800",
        description: "적당한 길이의 속담",
    },
    advanced: {
        label: "고급",
        gridSize: 20,  // UI 깨짐 방지, 적당한 크기
        wordCount: "10개",
        targetWords: 10,
        maxHints: 7,
        icon: "⚡",
        color: "#F44336",
        description: "긴 속담",
    },
};

// 주제 설정 (순서: 사자성어 -> 속담)
const themeConfig = {
    idiom: {
        label: "사자성어",
        icon: "📚",
        color: "#8B5CF6",
        description: "네 글자로 이루어진 한자 성어",
    },
    proverb: {
        label: "속담",
        icon: "💡",
        color: "#3B82F6",
        description: "우리 조상들의 지혜를 담은 속담",
    },
};

// 현재 설정
const difficultyConfig = computed(() => {
    return selectedTheme.value === "idiom" ? idiomDifficultyConfig : proverbDifficultyConfig;
});
const currentDifficultyConfig = computed(() => difficultyConfig.value[selectedDifficulty.value]);
const currentThemeConfig = computed(() => themeConfig[selectedTheme.value]);

// 난이도별 최대 힌트 개수
const maxHints = computed(() => {
    return currentDifficultyConfig.value?.maxHints || 3;
});

// 진행률 계산
const progressPercentage = computed(() => {
    if (!currentPuzzle.value?.words) return 0;
    return Math.round((completedWords.value.length / currentPuzzle.value.words.length) * 100);
});

// 소요 시간 계산 (초 단위)
const completionTime = computed(() => {
    if (!startTime.value || !endTime.value) return 0;
    return Math.floor((endTime.value - startTime.value) / 1000);
});

// 소요 시간 포맷 (MM:SS)
const formattedTime = computed(() => {
    const minutes = Math.floor(completionTime.value / 60);
    const seconds = completionTime.value % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
});

// 난이도별 색깔 반환
const getDifficultyColor = () => {
    if (selectedDifficulty.value === 'beginner') return '#4CAF50';
    if (selectedDifficulty.value === 'intermediate') return '#f44336';
    if (selectedDifficulty.value === 'advanced') return '#FFC107';
    return '#4CAF50';
};

// 난이도 라벨 반환
const getDifficultyLabel = () => {
    if (selectedDifficulty.value === 'beginner') return '초급';
    if (selectedDifficulty.value === 'intermediate') return '중급';
    if (selectedDifficulty.value === 'advanced') return '고급';
    return '초급';
};

// 랭킹 시간 포맷 (score는 1000 - 소요시간(초)이므로 역계산)
const formatRankingTime = (score) => {
    const timeInSeconds = 1000 - score;
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// 튜토리얼 단계
const tutorialSteps = computed(() => [
    {
        title: t('games.tutorials.crossword.steps.0.title'),
        description: t('games.tutorials.crossword.steps.0.description'),
        icon: t('games.tutorials.crossword.steps.0.icon'),
        details: [
            t('games.tutorials.crossword.steps.0.details.0'),
            t('games.tutorials.crossword.steps.0.details.1'),
            t('games.tutorials.crossword.steps.0.details.2'),
            t('games.tutorials.crossword.steps.0.details.3')
        ],
    },
    {
        title: t('games.tutorials.crossword.steps.1.title'),
        description: t('games.tutorials.crossword.steps.1.description'),
        icon: t('games.tutorials.crossword.steps.1.icon'),
        details: [
            t('games.tutorials.crossword.steps.1.details.0'),
            t('games.tutorials.crossword.steps.1.details.1'),
            t('games.tutorials.crossword.steps.1.details.2'),
            t('games.tutorials.crossword.steps.1.details.3'),
            t('games.tutorials.crossword.steps.1.details.4')
        ],
    },
    {
        title: t('games.tutorials.crossword.steps.2.title'),
        description: t('games.tutorials.crossword.steps.2.description'),
        icon: t('games.tutorials.crossword.steps.2.icon'),
        details: [
            t('games.tutorials.crossword.steps.2.details.0'),
            t('games.tutorials.crossword.steps.2.details.1'),
            t('games.tutorials.crossword.steps.2.details.2'),
            t('games.tutorials.crossword.steps.2.details.3'),
            t('games.tutorials.crossword.steps.2.details.4')
        ],
    },
    {
        title: t('games.tutorials.crossword.steps.3.title'),
        description: t('games.tutorials.crossword.steps.3.description'),
        icon: t('games.tutorials.crossword.steps.3.icon'),
        details: [
            t('games.tutorials.crossword.steps.3.details.0'),
            t('games.tutorials.crossword.steps.3.details.1'),
            t('games.tutorials.crossword.steps.3.details.2'),
            t('games.tutorials.crossword.steps.3.details.3'),
            t('games.tutorials.crossword.steps.3.details.4')
        ],
    },
]);

// 퍼즐 데이터 로드
const loadPuzzleData = async () => {
    try {
        // 사자성어와 속담 데이터 로드
        const [idiomsResponse, proverbsResponse] = await Promise.all([fetch("/data/idioms.json"), fetch("/data/proverbs.json")]);

        const idiomsData = await idiomsResponse.json();
        const proverbsData = await proverbsResponse.json();

        puzzleData.value = {
            idiom: idiomsData,
            proverb: proverbsData,
        };
    } catch (error) {
        console.error("퍼즐 데이터 로드 실패:", error);
    }
};

// 배경음악 초기화
onMounted(async () => {
    // 현재 로그인한 사용자 ID 가져오기
    currentUserId.value = getCurrentUserId();

    bgMusic.value = new Audio("/audio/WayToSchool.mp3");
    bgMusic.value.loop = true;
    bgMusic.value.volume = 0.3;

    // 퍼즐 데이터 로드
    await loadPuzzleData();
});

// 정리
onUnmounted(() => {
    if (bgMusic.value) {
        bgMusic.value.pause();
        bgMusic.value = null;
    }
});

// 게임 상태 변경 시 스크롤 맨 위로
watch(gameState, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 음악 토글
const toggleMusic = () => {
    isMusicMuted.value = !isMusicMuted.value;
    localStorage.setItem("crosswordGameMusicMuted", isMusicMuted.value);

    if (isMusicMuted.value) {
        bgMusic.value?.pause();
    } else {
        bgMusic.value?.play().catch((err) => {
            console.log("재생 실패:", err);
        });
    }
};

// 튜토리얼 네비게이션
const nextTutorialStep = () => {
    if (currentTutorialStep.value < tutorialSteps.value.length - 1) {
        currentTutorialStep.value++;
    } else {
        gameState.value = "theme-select";
    }
};

const prevTutorialStep = () => {
    if (currentTutorialStep.value > 0) {
        currentTutorialStep.value--;
    }
};

const skipTutorial = () => {
    gameState.value = "theme-select";
};

// 주제 선택
const selectTheme = (theme) => {
    selectedTheme.value = theme;
    gameState.value = "difficulty-select";
};

// 난이도 선택 및 게임 시작
const selectDifficulty = (difficulty) => {
    selectedDifficulty.value = difficulty;
    startCountdown();
};

// 카운트다운 시작
const startCountdown = () => {
    gameState.value = "countdown";
    countdownValue.value = 3;

    const countdownInterval = setInterval(() => {
        countdownValue.value--;
        if (countdownValue.value < 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
                startGame();
            }, 600);
        }
    }, 1000);
};

// 게임 시작
const startGame = () => {
    gameState.value = "playing";
    startTime.value = Date.now();

    // 게임 플레이 로그 기록 (인기 게임 통계용)
    logGamePlay('crossword_puzzle');

    // 음악 재생 (Game Start 이후)
    if (!isMusicMuted.value && bgMusic.value) {
        bgMusic.value.play().catch((err) => {
            console.log("음악 재생 실패:", err);
        });
    }

    loadPuzzle();
};

// 퍼즐 로드 (JSON에서 로드)
const loadPuzzle = () => {
    if (!puzzleData.value) {
        console.error("퍼즐 데이터가 로드되지 않았습니다.");
        return;
    }

    // 난이도 설정 가져오기
    const config = difficultyConfig.value[selectedDifficulty.value];

    let selectedWords;

    // 사자성어와 속담 모두 그룹 기반 선택 (100% 교차 보장)
    selectedWords = selectWordsFromGroup(config.targetWords);

    if (!selectedWords || selectedWords.length === 0) {
        console.error("단어 선택 실패");
        return;
    }

    // 간단한 크로스워드 격자 생성
    const puzzle = createSimpleCrossword(selectedWords, config.gridSize);

    if (puzzle) {
        currentPuzzle.value = puzzle;

        // 사용자 답안 초기화
        initializeUserAnswers();
    } else {
        console.error("퍼즐 생성 실패");
        // 재시도
        loadPuzzle();
    }
};

// 그룹에서 단어 선택 (사자성어/속담 - 100% 교차 보장)
const selectWordsFromGroup = (targetCount) => {
    const theme = selectedTheme.value;
    const difficulty = selectedDifficulty.value;

    // 테마별 데이터 체크
    if (!puzzleData.value || !puzzleData.value[theme] || !puzzleData.value[theme].groups) {
        console.error(`${theme} 그룹 데이터가 없습니다.`);
        return null;
    }

    // 난이도에 맞는 그룹 선택
    const groupKey = `size${targetCount}`;
    const groups = puzzleData.value[theme].groups[groupKey];

    if (!groups || groups.length === 0) {
        console.error(`${groupKey} 그룹이 없습니다.`);
        return null;
    }

    // 랜덤으로 그룹 하나 선택
    const randomGroup = groups[Math.floor(Math.random() * groups.length)];

    // 테마별 단어 ID 키 이름이 다름 (idiomIds vs proverbIds)
    const idKey = theme === 'idiom' ? 'idiomIds' : 'proverbIds';
    const wordKey = theme === 'idiom' ? 'idioms' : 'proverbs';

    console.log(`선택된 그룹: ${randomGroup.id} - ${randomGroup[wordKey].join(', ')}`);

    // 그룹의 단어 ID로 실제 데이터 가져오기
    // 모든 난이도에서 검색 (id는 전체 데이터에서 고유)
    const allWords = [
        ...puzzleData.value[theme].beginner,
        ...puzzleData.value[theme].intermediate,
        ...puzzleData.value[theme].advanced
    ];

    const selectedWords = randomGroup[idKey].map(id => {
        return allWords.find(word => word.id === id);
    }).filter(word => word !== undefined);

    console.log(`선택된 ${theme === 'idiom' ? '사자성어' : '속담'} ${selectedWords.length}개 (교차 보장됨)`);
    return selectedWords;
};

// 랜덤하게 단어 선택 (속담용)
const selectRandomWords = (wordList, count, gridSize) => {
    // 속담인 경우 격자 크기 이하의 단어만 필터링
    let filteredList = wordList;
    if (selectedTheme.value === 'proverb') {
        filteredList = wordList.filter(word => word.word.length <= gridSize);
    }

    const shuffled = [...filteredList].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
};

// 개선된 크로스워드 생성 (교차 보장)
const createSimpleCrossword = (words, gridSize) => {
    const targetWordCount = words.length;
    let attempts = 0;
    // 사자성어와 속담 모두 충분한 재시도 (그룹 기반이므로 반드시 성공해야 함)
    const maxAttempts = 3000;
    let bestResult = null; // 가장 많은 단어를 배치한 결과

    // 단어 배치 가능 여부를 검사하는 함수 (유연한 충돌 검사)
    const canPlaceWord = (grid, word, startRow, startCol, direction) => {
        const wordLength = word.word.length;

        // 경계 검사
        if (direction === "across") {
            if (startCol < 0 || startCol + wordLength > gridSize) return false;
        } else {
            if (startRow < 0 || startRow + wordLength > gridSize) return false;
        }

        // 각 글자 위치 검사
        for (let i = 0; i < wordLength; i++) {
            const row = direction === "across" ? startRow : startRow + i;
            const col = direction === "across" ? startCol + i : startCol;

            // 현재 위치에 다른 글자가 있으면 일치하는지 확인
            if (grid[row][col] && grid[row][col] !== word.word[i]) {
                return false;
            }

            // 교차점이 아닌 곳에서 인접 칸 검사 (완화된 버전)
            if (!grid[row][col]) {
                // 가로 배치일 때
                if (direction === "across") {
                    // 위/아래에 다른 단어가 있는지만 확인 (교차 방지)
                    if (row > 0 && grid[row - 1][col]) return false;
                    if (row < gridSize - 1 && grid[row + 1][col]) return false;
                } else {
                    // 왼/오른쪽에 다른 단어가 있는지만 확인 (교차 방지)
                    if (col > 0 && grid[row][col - 1]) return false;
                    if (col < gridSize - 1 && grid[row][col + 1]) return false;
                }
            }
        }

        // 단어 시작/끝 부분만 확인
        if (direction === "across") {
            if (startCol > 0 && grid[startRow][startCol - 1]) return false;
            if (startCol + wordLength < gridSize && grid[startRow][startCol + wordLength]) return false;
        } else {
            if (startRow > 0 && grid[startRow - 1][startCol]) return false;
            if (startRow + wordLength < gridSize && grid[startRow + wordLength][startCol]) return false;
        }

        return true;
    };

    // 가능한 모든 교차 위치 찾기
    const findAllCrossingPositions = (grid, placedWords, word) => {
        const positions = [];

        for (const placedWord of placedWords) {
            for (let j = 0; j < word.word.length; j++) {
                for (let k = 0; k < placedWord.word.length; k++) {
                    if (word.word[j] === placedWord.word[k]) {
                        const [crossRow, crossCol] = placedWord.cells[k];
                        const direction = placedWord.direction === "across" ? "down" : "across";

                        let startRow, startCol;
                        if (direction === "across") {
                            startRow = crossRow;
                            startCol = crossCol - j;
                        } else {
                            startRow = crossRow - j;
                            startCol = crossCol;
                        }

                        if (canPlaceWord(grid, word, startRow, startCol, direction)) {
                            positions.push({ startRow, startCol, direction, matchIndex: j });
                        }
                    }
                }
            }
        }

        return positions;
    };

    // 단어 배치 함수
    const placeWord = (grid, word, startRow, startCol, direction) => {
        const cells = [];
        const wordLength = word.word.length;

        for (let i = 0; i < wordLength; i++) {
            const row = direction === "across" ? startRow : startRow + i;
            const col = direction === "across" ? startCol + i : startCol;
            grid[row][col] = word.word[i];
            cells.push([row, col]);
        }

        return {
            ...word,
            direction,
            startRow,
            startCol,
            cells,
        };
    };

    while (attempts < maxAttempts) {
        attempts++;

        // 단어 순서: 길이 순 정렬 (긴 단어부터) + 약간의 랜덤성
        const shuffledWords = [...words].sort((a, b) => {
            // 80% 확률로 길이 순, 20% 확률로 랜덤
            if (Math.random() < 0.8) {
                return b.word.length - a.word.length; // 긴 단어부터
            } else {
                return Math.random() - 0.5; // 랜덤
            }
        });

        // 빈 격자 생성
        const grid = Array(gridSize)
            .fill(null)
            .map(() => Array(gridSize).fill(""));
        const placedWords = [];

        // 첫 번째 단어를 가로로 중앙에 배치
        if (shuffledWords.length > 0) {
            const firstWord = shuffledWords[0];
            const row = Math.floor(gridSize / 2);
            const startCol = Math.floor((gridSize - firstWord.word.length) / 2);

            if (startCol >= 0 && startCol + firstWord.word.length <= gridSize) {
                const placed = placeWord(grid, firstWord, row, startCol, "across");
                placed.number = 1;
                placedWords.push(placed);
            }
        }

        // 나머지 단어들을 교차시키며 배치 (멀티 클러스터 허용)
        for (let i = 1; i < shuffledWords.length; i++) {
            const word = shuffledWords[i];
            let placed = false;

            // 1. 먼저 기존 단어들과 교차하는 위치 찾기
            const positions = findAllCrossingPositions(grid, placedWords, word);

            if (positions.length > 0) {
                // 랜덤하게 하나 선택 (다양성 확보)
                const randomPos = positions[Math.floor(Math.random() * positions.length)];
                const placedWord = placeWord(grid, word, randomPos.startRow, randomPos.startCol, randomPos.direction);
                placedWord.number = placedWords.length + 1;
                placedWords.push(placedWord);
                placed = true;
            }

            // 2. 교차 위치가 없으면 독립적으로 배치 (새로운 클러스터 생성)
            //    하지만 나중에 다른 단어와 교차 가능한 위치를 선호
            if (!placed && placedWords.length < 3) {
                // 처음 몇 개 단어는 독립 배치 허용 (나중에 교차할 수 있도록)
                for (let attempts = 0; attempts < 50; attempts++) {
                    const direction = Math.random() > 0.5 ? "across" : "down";
                    let startRow, startCol;

                    if (direction === "across") {
                        startRow = Math.floor(Math.random() * gridSize);
                        startCol = Math.floor(Math.random() * (gridSize - word.word.length + 1));
                    } else {
                        startRow = Math.floor(Math.random() * (gridSize - word.word.length + 1));
                        startCol = Math.floor(Math.random() * gridSize);
                    }

                    if (canPlaceWord(grid, word, startRow, startCol, direction)) {
                        const placedWord = placeWord(grid, word, startRow, startCol, direction);
                        placedWord.number = placedWords.length + 1;
                        placedWords.push(placedWord);
                        placed = true;
                        break;
                    }
                }
            }
        }

        // 각 단어가 최소 1개 이상 교차하는지 검증
        const validateCrossing = (words) => {
            for (const word of words) {
                let hasCrossing = false;
                for (const other of words) {
                    if (word.number === other.number) continue;

                    // 교차점 확인
                    for (const [r1, c1] of word.cells) {
                        for (const [r2, c2] of other.cells) {
                            if (r1 === r2 && c1 === c2) {
                                hasCrossing = true;
                                break;
                            }
                        }
                        if (hasCrossing) break;
                    }
                    if (hasCrossing) break;
                }

                // 교차하지 않는 단어가 있으면 실패
                if (!hasCrossing) {
                    return false;
                }
            }
            return true;
        };

        // 가장 좋은 결과 추적
        if (!bestResult || placedWords.length > bestResult.words.length) {
            bestResult = {
                gridSize: gridSize,
                grid: grid.map(row => [...row]), // 깊은 복사
                words: placedWords.map(w => ({...w, cells: [...w.cells]})),
            };
        }

        // 충분한 단어가 배치되었는지 확인 (사자성어와 속담 모두 100% 배치 요구)
        const requiredCount = targetWordCount;

        if (placedWords.length >= requiredCount) {
            // 모든 단어가 교차하는지 검증
            if (!validateCrossing(placedWords)) {
                continue; // 교차하지 않는 단어가 있으면 다시 시도
            }

            // 번호 재정렬 (표준 크로스워드 규칙)
            const assignDisplayNumbers = (words) => {
                // 1. 모든 단어의 시작 위치 수집
                const startPositions = [];
                words.forEach(word => {
                    const key = `${word.startRow},${word.startCol}`;
                    // 중복 체크 (같은 칸에서 가로/세로 모두 시작하는 경우)
                    if (!startPositions.find(pos => pos.key === key)) {
                        startPositions.push({
                            key: key,
                            row: word.startRow,
                            col: word.startCol
                        });
                    }
                });

                // 2. 위→아래, 왼→오 순서로 정렬
                startPositions.sort((a, b) => {
                    if (a.row !== b.row) return a.row - b.row;
                    return a.col - b.col;
                });

                // 3. 각 시작 위치에 번호 할당
                const cellNumbers = new Map();
                startPositions.forEach((pos, index) => {
                    cellNumbers.set(pos.key, index + 1);
                });

                // 4. 각 단어에 번호 할당
                words.forEach(word => {
                    const key = `${word.startRow},${word.startCol}`;
                    word.displayNumber = String(cellNumbers.get(key));
                });

                // 5. 가로 단어와 세로 단어로 분리
                const acrossWords = words.filter(w => w.direction === 'across');
                const downWords = words.filter(w => w.direction === 'down');

                // displayNumber 순서대로 정렬
                acrossWords.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));
                downWords.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));

                // 6. 최종 정렬: Across(가로) 먼저, 그 다음 Down(세로)
                const sortedWords = [...acrossWords, ...downWords];

                // 7. 내부 number는 순서대로 재할당
                sortedWords.forEach((word, index) => {
                    const originalIndex = words.indexOf(word);
                    words[originalIndex].number = index + 1;
                });
            };

            assignDisplayNumbers(placedWords);

            console.log(`크로스워드 생성 성공! (시도 횟수: ${attempts}, 배치된 단어: ${placedWords.length}/${targetWordCount}, 모든 단어 교차됨)`);

            return {
                gridSize: gridSize,
                grid: grid,
                words: placedWords,
            };
        }
    }

    // 최대 재시도 횟수 초과 시 경고
    console.warn(`크로스워드 생성 실패 - 재시도 횟수 초과 (최대 배치: ${bestResult?.words?.length || 0}/${targetWordCount})`);

    // 가장 좋은 결과라도 반환 (일부 단어만 배치됨)
    if (bestResult && bestResult.words.length > 0) {
        const placedWords = bestResult.words;

        // 번호 재정렬 (표준 크로스워드 규칙)
        const assignDisplayNumbers = (words) => {
            // 1. 모든 단어의 시작 위치 수집
            const startPositions = [];
            words.forEach(word => {
                const key = `${word.startRow},${word.startCol}`;
                // 중복 체크 (같은 칸에서 가로/세로 모두 시작하는 경우)
                if (!startPositions.find(pos => pos.key === key)) {
                    startPositions.push({
                        key: key,
                        row: word.startRow,
                        col: word.startCol
                    });
                }
            });

            // 2. 위→아래, 왼→오 순서로 정렬
            startPositions.sort((a, b) => {
                if (a.row !== b.row) return a.row - b.row;
                return a.col - b.col;
            });

            // 3. 각 시작 위치에 번호 할당
            const cellNumbers = new Map();
            startPositions.forEach((pos, index) => {
                cellNumbers.set(pos.key, index + 1);
            });

            // 4. 각 단어에 번호 할당
            words.forEach(word => {
                const key = `${word.startRow},${word.startCol}`;
                word.displayNumber = String(cellNumbers.get(key));
            });

            // 5. 가로 단어와 세로 단어로 분리
            const acrossWords = words.filter(w => w.direction === 'across');
            const downWords = words.filter(w => w.direction === 'down');

            // displayNumber 순서대로 정렬
            acrossWords.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));
            downWords.sort((a, b) => parseInt(a.displayNumber) - parseInt(b.displayNumber));

            // 6. 최종 정렬: Across(가로) 먼저, 그 다음 Down(세로)
            const sortedWords = [...acrossWords, ...downWords];

            // 7. 내부 number는 순서대로 재할당
            sortedWords.forEach((word, index) => {
                const originalIndex = words.indexOf(word);
                words[originalIndex].number = index + 1;
            });
        };

        assignDisplayNumbers(placedWords);

        console.log(`가장 좋은 결과 반환: ${placedWords.length}/${targetWordCount}개 배치`);
        return bestResult;
    }

    return null;
};

// 사용자 답안 초기화
const initializeUserAnswers = () => {
    userAnswers.value = {};
    tempInputs.value = {}; // 임시 입력값도 초기화
    hintedCells.value = []; // 힌트 칸도 초기화

    if (!currentPuzzle.value) return;

    currentPuzzle.value.words.forEach((word) => {
        word.cells.forEach(([row, col]) => {
            const key = `${row}-${col}`;
            if (!userAnswers.value[key]) {
                userAnswers.value[key] = "";
            }
        });

        // 각 단어의 입력값 초기화
        wordInputs[word.number] = '';
    });

    // 첫 번째 단어 자동 선택
    if (currentPuzzle.value.words.length > 0) {
        selectedWord.value = currentPuzzle.value.words[0];
        const [row, col] = currentPuzzle.value.words[0].cells[0];
        selectedCell.value = { row, col };
    }
};

// 셀 클릭 핸들러
const handleCellClick = (row, col) => {
    const key = `${row}-${col}`;

    // 힌트 모드일 때는 힌트 처리
    if (hintMode.value) {
        if (!userAnswers.value.hasOwnProperty(key)) {
            alert("이 칸은 사용할 수 없습니다.");
            return;
        }
        handleHintCellClick(row, col);
        return;
    }

    // 빈 칸이면 무시
    if (!userAnswers.value.hasOwnProperty(key)) return;

    selectedCell.value = { row, col };

    // 해당 셀이 속한 단어 찾기
    const wordsAtCell = currentPuzzle.value.words.filter((word) => word.cells.some(([r, c]) => r === row && c === col));

    if (wordsAtCell.length > 0) {
        // 이미 선택된 단어가 있고, 같은 셀을 클릭하면 방향 전환
        if (selectedWord.value && wordsAtCell.length > 1 && wordsAtCell.some((w) => w.number === selectedWord.value.number)) {
            const currentIndex = wordsAtCell.findIndex((w) => w.number === selectedWord.value.number);
            const nextIndex = (currentIndex + 1) % wordsAtCell.length;
            selectedWord.value = wordsAtCell[nextIndex];
        } else {
            selectedWord.value = wordsAtCell[0];
        }
    } else if (!selectedWord.value && currentPuzzle.value?.words?.length > 0) {
        // 단어가 없는 칸이지만 selectedWord가 없으면 첫 번째 단어 선택
        selectedWord.value = currentPuzzle.value.words[0];
    }

    // 현재 입력값 업데이트
    updateCurrentInputValue();

    // 문제 목록 스크롤 포커스
    scrollToProblem(selectedWord.value);
};

// 예시 문장에서 정답 사자성어를 ___로 마스킹
const maskAnswerInExample = (example, word) => {
    if (!example || !word) return example;
    // 정답 단어를 ___로 치환 (전역 치환)
    return example.replace(new RegExp(word, 'g'), '___');
};

// 힌트에서 단어 선택
const selectWordFromHint = (word) => {
    selectedWord.value = word;

    // 첫 번째 셀로 포커스
    const [row, col] = word.cells[0];
    selectedCell.value = { row, col };

    // 현재 입력값 업데이트
    updateCurrentInputValue();

    // 문제 목록 스크롤 포커스
    scrollToProblem(word);
};

// 문제 목록 스크롤 포커스 (문제 번호 기준 중앙 정렬)
const scrollToProblem = (word) => {
    if (!word) return;

    nextTick(() => {
        const problemElement = document.querySelector(`.problem-item[data-word-number="${word.number}"]`);
        const problemsContainer = document.querySelector('.problems-container');

        if (problemElement && problemsContainer) {
            // 문제 헤더 (번호 포함) 찾기
            const problemHeader = problemElement.querySelector('.problem-header');

            if (problemHeader) {
                // 문제 헤더의 위치를 기준으로 계산 (문제 번호가 잘 보이도록)
                const headerTop = problemElement.offsetTop;

                // 문제 번호가 완전히 보이도록 문제 카드 상단을 기준으로 스크롤
                // (약간의 패딩만 추가)
                const scrollPosition = headerTop - 250;

                // 컨테이너의 scrollTop을 조정
                problemsContainer.scrollTo({
                    top: Math.max(0, scrollPosition), // 음수 방지
                    behavior: 'smooth'
                });
            }
        }
    });
};

// 현재 입력값 업데이트 (선택된 단어의 현재 답안 가져오기)
const updateCurrentInputValue = () => {
    if (!selectedWord.value) {
        currentInputValue.value = "";
        return;
    }

    const currentAnswer = selectedWord.value.cells.map(([r, c]) => userAnswers.value[`${r}-${c}`] || "").join("");

    currentInputValue.value = currentAnswer;
};

// 입력 중 실시간 처리 (한글만 허용)
const handleWordInput = (word, event) => {
    const input = event.target.value;

    // 한글만 추출
    const koreanOnly = input.split('').filter(c => /[가-힣]/.test(c)).join('');

    // 최대 길이 제한 (사자성어는 무조건 4글자)
    const maxLength = selectedTheme.value === 'idiom' ? 4 : word.word.length;
    const limited = koreanOnly.slice(0, maxLength);

    // 업데이트
    wordInputs[word.number] = limited;

    // 한글 조합 완료 후 길이 초과 시 input 요소도 강제 업데이트
    setTimeout(() => {
        if (event.target && wordInputs[word.number] && wordInputs[word.number].length > maxLength) {
            wordInputs[word.number] = wordInputs[word.number].slice(0, maxLength);
            event.target.value = wordInputs[word.number];
        }
    }, 0);
};

// 엔터 키 입력 처리 (문제 입력창에서)
const handleWordInputKeydown = (word, event) => {
    if (event.key === "Enter") {
        event.preventDefault();

        // 사용자 입력 가져오기
        const userInput = wordInputs[word.number] || '';

        // 필요한 글자가 모두 입력되었는지 확인
        if (userInput.length !== word.word.length) {
            showToast(`${word.word.length}글자를 모두 입력해주세요`, "error");
            return;
        }

        // 정답 체크
        if (userInput === word.word) {
            // 정답! 격자에 반영
            word.cells.forEach(([row, col], index) => {
                const key = `${row}-${col}`;
                userAnswers.value[key] = userInput[index];
            });

            // 정답 처리
            checkWordCompletion(word);

            // 입력값 유지 (정답을 입력칸에 고정)
            wordInputs[word.number] = userInput;

            // 다음 미완성 문제로 포커스 이동
            moveToNextIncompleteWord(word.number);
        } else {
            // 오답! 입력값 초기화
            wordInputs[word.number] = '';

            // input 요소도 직접 초기화
            const inputElement = event.target;
            if (inputElement) {
                inputElement.value = '';
            }

            // 오답 알림
            showToast("오답입니다 😢", "error");
        }
    }
};

// 다음 미완성 문제로 이동
const moveToNextIncompleteWord = (currentWordNumber) => {
    if (!currentPuzzle.value?.words) return;

    // 현재 단어 다음부터 찾기
    const nextWord = currentPuzzle.value.words.find(
        w => w.number > currentWordNumber && !completedWords.value.some(cw => cw.number === w.number)
    );

    if (nextWord) {
        selectWordFromHint(nextWord);
        // 다음 입력창으로 포커스
        setTimeout(() => {
            const input = document.querySelector(`input[data-word-number="${nextWord.number}"]`);
            if (input) input.focus();
        }, 100);
    }
};

// 키보드 입력 처리 (격자 클릭 시만 사용, 입력창 포커스 시에는 비활성화)
const handleKeyDown = (event) => {
    // 입력창에 포커스가 있으면 이 핸들러를 무시
    if (document.activeElement && document.activeElement.classList.contains('problem-input')) {
        return;
    }

    if (gameState.value !== "playing" || !selectedCell.value || !selectedWord.value) return;

    const { row, col } = selectedCell.value;
    const key = `${row}-${col}`;

    if (event.key === "Backspace") {
        event.preventDefault();

        // 현재 셀 지우기
        userAnswers.value[key] = "";

        // 이전 셀로 이동
        const currentIndex = selectedWord.value.cells.findIndex(([r, c]) => r === row && c === col);
        if (currentIndex > 0) {
            const [prevRow, prevCol] = selectedWord.value.cells[currentIndex - 1];
            selectedCell.value = { row: prevRow, col: prevCol };
        }
    } else if (event.key.length === 1 && /[가-힣]/.test(event.key)) {
        event.preventDefault();

        // 한글 입력
        userAnswers.value[key] = event.key;

        // 다음 셀로 이동
        const currentIndex = selectedWord.value.cells.findIndex(([r, c]) => r === row && c === col);
        if (currentIndex < selectedWord.value.cells.length - 1) {
            const [nextRow, nextCol] = selectedWord.value.cells[currentIndex + 1];
            selectedCell.value = { row: nextRow, col: nextCol };
        }

        // 단어 완성 체크
        checkWordCompletion(selectedWord.value);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        moveSelection(event.key);
    }
};

// 방향키로 셀 이동
const moveSelection = (key) => {
    if (!selectedCell.value) return;

    let { row, col } = selectedCell.value;

    if (key === "ArrowLeft") col--;
    else if (key === "ArrowRight") col++;
    else if (key === "ArrowUp") row--;
    else if (key === "ArrowDown") row++;

    // 유효한 셀인지 확인
    const newKey = `${row}-${col}`;
    if (userAnswers.value.hasOwnProperty(newKey)) {
        handleCellClick(row, col);
    }
};

// Toast 알림 표시
const showToast = (message, type = "success") => {
    toast.value.message = message;
    toast.value.type = type;
    toast.value.show = true;

    setTimeout(
        () => {
            toast.value.show = false;
        },
        type === "success" ? 2000 : 1000
    );
};

// 단어 완성 체크 (이미 정답인 것이 확인된 경우만 호출됨)
const checkWordCompletion = (word) => {
    // 중복 완성 방지
    if (completedWords.value.some((w) => w.number === word.number)) {
        return;
    }

    completedWords.value.push(word);

    // 학습 단어에 추가
    if (!learnedWords.value.some((w) => w.word === word.word)) {
        learnedWords.value.push({
            word: word.word,
            meaning: word.meaning,
        });
    }

    // 정답 알림
    showToast("정답입니다 😊", "success");

    // 단어 뜻 모달 표시
    showWordMeaningNotification(word);

    // 모든 단어 완성 체크
    if (completedWords.value.length === currentPuzzle.value.words.length) {
        setTimeout(() => {
            celebrateCompletion();
        }, 2000);
    }
};

// 단어 뜻 알림 (모달 제거)
const showWordMeaningNotification = (word) => {
    // 모달 표시 없이 학습 단어에만 추가
    // 오른쪽 패널에 뜻이 항상 표시되므로 별도 알림 불필요
};

// 힌트 사용 - 힌트 모드 활성화
const useHint = () => {
    if (hintsUsed.value >= maxHints.value) return;

    // 힌트 모드 활성화
    hintMode.value = true;
};

// 힌트 모드에서 셀 클릭 처리
const handleHintCellClick = (row, col) => {
    const key = `${row}-${col}`;

    // 이미 채워진 칸이면 무시
    if (userAnswers.value[key]) {
        alert("이미 입력된 칸입니다. 빈 칸을 선택해주세요.");
        return;
    }

    // 해당 칸이 속한 단어 찾기
    const wordAtCell = currentPuzzle.value.words.find((word) => word.cells.some(([r, c]) => r === row && c === col));

    if (!wordAtCell) return;

    // 해당 칸의 정답 표시
    const cellIndex = wordAtCell.cells.findIndex(([r, c]) => r === row && c === col);
    const correctChar = wordAtCell.word[cellIndex];

    userAnswers.value[key] = correctChar;
    hintsUsed.value++;

    // 힌트로 알려준 칸 저장 (고정)
    hintedCells.value.push([row, col]);

    // 힌트 모드 해제
    hintMode.value = false;

    // 정답 체크는 하지 않음 (한 글자만 알려줬을 뿐)
};

// 현재 사용자 ID 가져오기
const getCurrentUserId = () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.id;
    } catch (error) {
        console.error('사용자 ID 가져오기 실패:', error);
        return null;
    }
};

// 게임 점수 저장 (성공한 경우만)
const saveScore = async () => {
    // 포기한 경우 저장하지 않음
    if (isGivenUp.value) {
        console.log('포기한 게임 - 점수 저장 스킵');
        return;
    }

    try {
        isSavingScore.value = true;
        const token = localStorage.getItem('token');

        if (!token) {
            console.log('로그인하지 않은 사용자 - 점수 저장 스킵');
            return;
        }

        // 점수는 소요 시간의 역수 (빨리 풀수록 높은 점수)
        // 최대 1000점에서 소요 시간을 뺀 값
        const score = Math.max(0, 1000 - completionTime.value);

        console.log('📤 점수 저장 요청:', {
            gameType: 'crossword_puzzle',
            difficulty: selectedDifficulty.value,
            gameMode: selectedTheme.value,
            score: score,
            completionTime: completionTime.value
        });

        const response = await axios.post(
            `${API_URL}/api/game-scores`,
            {
                gameType: 'crossword_puzzle',
                difficulty: selectedDifficulty.value,
                gameMode: selectedTheme.value,
                score: score,
                additionalData: {
                    completionTime: completionTime.value,
                    hintsUsed: hintsUsed.value,
                    theme: selectedTheme.value,
                    isSuccess: true
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
                score: score,
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
            `${API_URL}/api/game-scores/rankings/crossword_puzzle?limit=3&difficulty=${selectedDifficulty.value}&gameMode=${selectedTheme.value}`
        );

        console.log('📥 랭킹 API 응답:', response.data);

        if (response.data.success) {
            topRankings.value = response.data.data || [];
            console.log('🏆 TOP 3 랭킹 조회 완료, 데이터:', topRankings.value);
            console.log('🔍 랭킹 개수:', topRankings.value.length);
            console.log('🔍 첫 번째 랭킹:', JSON.stringify(topRankings.value[0]));
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
    endTime.value = Date.now();
    gameState.value = "result";

    console.log('🎮 게임 종료 - 현재 사용자 ID:', currentUserId.value);
    console.log('포기 여부:', isGivenUp.value);

    // 성공한 경우만 점수 저장 및 랭킹 조회
    if (!isGivenUp.value) {
        await saveScore();
        await fetchRankings();
    }

    console.log('📊 최종 상태 - myRankInfo:', myRankInfo.value);
    console.log('📊 최종 상태 - topRankings:', topRankings.value);

    // 음악 중지
    if (bgMusic.value) {
        bgMusic.value.pause();
    }
};

// 소요 시간 계산
const elapsedTime = computed(() => {
    if (!startTime.value || !endTime.value) return "0:00";

    const seconds = Math.floor((endTime.value - startTime.value) / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
});

// 셀이 선택된 단어에 속하는지 체크
const isCellInSelectedWord = (row, col) => {
    if (!selectedWord.value) return false;
    return selectedWord.value.cells.some(([r, c]) => r === row && c === col);
};

// 셀이 완성된 단어에 속하는지 체크
const isCellInCompletedWord = (row, col) => {
    return completedWords.value.some((word) => word.cells.some(([r, c]) => r === row && c === col));
};

// 셀의 번호 가져오기 (시작 셀인 경우 - 여러 단어가 시작할 수 있음)
const getCellNumbers = (row, col) => {
    const words = currentPuzzle.value?.words.filter((w) => w.cells[0][0] === row && w.cells[0][1] === col) || [];
    const numbers = words.map(w => w.displayNumber);
    // 중복 제거: 같은 위치에서 시작하는 가로/세로 단어가 같은 번호를 공유하는 경우
    return [...new Set(numbers)];
};

// 키보드 이벤트 리스너
onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
});

// 홈으로 돌아가기
const goHome = () => {
    router.push("/game");
};

// 터지는 소리 생성 함수
const playExplosionSound = () => {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // 폭발음 생성 (짧고 강한 노이즈)
        const duration = 0.15;
        const sampleRate = audioContext.sampleRate;
        const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);

        // 폭발음 생성 (화이트 노이즈 + 감쇠)
        for (let i = 0; i < buffer.length; i++) {
            const decay = 1 - (i / buffer.length);
            data[i] = (Math.random() * 2 - 1) * decay * 0.3;
        }

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();

        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 빠른 감쇠
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        source.start();
    } catch (error) {
        console.log('오디오 재생 실패:', error);
    }
};

// 완성 축하 애니메이션
const celebrateCompletion = async () => {
    // 음악 중지
    if (bgMusic.value) {
        bgMusic.value.pause();
    }

    // 빙고 스타일의 완성 애니메이션 표시
    showCompletionAnimation.value = true;

    // 2초 후 애니메이션 종료 및 결과 화면으로
    await new Promise(resolve => setTimeout(resolve, 2000));
    showCompletionAnimation.value = false;

    endTime.value = Date.now();
    gameState.value = 'result';

    // 점수 저장 및 랭킹 조회
    console.log('🎮 게임 완료 - 현재 사용자 ID:', currentUserId.value);
    console.log('포기 여부:', isGivenUp.value);

    if (!isGivenUp.value) {
        await saveScore();
        await fetchRankings();
    }

    console.log('📊 최종 상태 - myRankInfo:', myRankInfo.value);
    console.log('📊 최종 상태 - topRankings:', topRankings.value);
};

// 포기하기 - 정답 공개 애니메이션
const giveUp = async () => {
    console.log('포기 버튼 클릭됨');

    // 포기 상태 설정
    isGivenUp.value = true;

    if (!currentPuzzle.value) {
        console.error('currentPuzzle이 없습니다');
        return;
    }

    if (!currentPuzzle.value.words || !currentPuzzle.value.grid) {
        console.error('퍼즐 데이터가 올바르지 않습니다');
        return;
    }

    // 음악 중지
    if (bgMusic.value) {
        bgMusic.value.pause();
    }

    // 1. "포기하셨습니다"
    showToast('포기하셨습니다. 😔', 'error');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 2. "정답을 공개하겠습니다"
    showToast('정답을 공개하겠습니다. 📖', 'info');
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 3. 카운트다운 3, 2, 1 (중앙에 크게 표시)
    showRevealCountdown.value = true;
    for (let i = 3; i > 0; i--) {
        revealCountdown.value = i;
        await new Promise(resolve => setTimeout(resolve, 800));
    }
    showRevealCountdown.value = false;

    // 4. "정답 공개!"
    showToast('정답 공개! 🎉', 'success');
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('풀지 못한 셀 찾기 시작');

    // 풀지 못한 셀들 찾기
    const unsolvedCells = [];
    currentPuzzle.value.words.forEach(word => {
        if (!word.cells) return;

        word.cells.forEach(cell => {
            // cell은 [row, col] 형식의 배열
            const row = cell[0];
            const col = cell[1];
            const cellKey = `${row}-${col}`;
            const correctAnswer = currentPuzzle.value.grid[row][col];
            const userAnswer = userAnswers.value[cellKey];

            if (userAnswer !== correctAnswer) {
                unsolvedCells.push({
                    key: cellKey,
                    row: row,
                    col: col,
                    answer: correctAnswer
                });
            }
        });
    });

    console.log('풀지 못한 셀 개수:', unsolvedCells.length);

    // 중복 제거
    const uniqueCells = Array.from(new Map(unsolvedCells.map(cell => [cell.key, cell])).values());
    console.log('중복 제거 후 셀 개수:', uniqueCells.length);

    // 단어별로 그룹화
    const cellsByWord = new Map();
    currentPuzzle.value.words.forEach(word => {
        if (!word.cells) return;

        const wordCells = [];
        word.cells.forEach(cell => {
            const row = cell[0];
            const col = cell[1];
            const cellKey = `${row}-${col}`;
            const correctAnswer = currentPuzzle.value.grid[row][col];
            const userAnswer = userAnswers.value[cellKey];

            // 풀지 못한 셀만 추가
            if (userAnswer !== correctAnswer) {
                wordCells.push({
                    key: cellKey,
                    row: row,
                    col: col,
                    answer: correctAnswer
                });
            }
        });

        // 풀지 못한 셀이 있는 단어만 추가
        if (wordCells.length > 0) {
            cellsByWord.set(word.number, {
                word: word,
                cells: wordCells
            });
        }
    });

    console.log('풀지 못한 단어 개수:', cellsByWord.size);

    // 모든 셀 수집
    const allCells = [];
    cellsByWord.forEach((wordData) => {
        allCells.push(...wordData.cells);
    });

    console.log(`총 ${allCells.length}개 셀을 동시에 공개합니다`);

    // 모든 셀에 동시에 균열 애니메이션 시작
    const allCellKeys = allCells.map(cell => cell.key);
    explodingCells.value = allCellKeys;

    // 터지는 소리 재생
    playExplosionSound();

    // 균열이 천천히 퍼지는 동안 대기 (3초 - 마지막 균열선까지 완전히 그려질 때까지)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 정답을 한 번에 공개
    allCells.forEach(cell => {
        userAnswers.value[cell.key] = cell.answer;
        revealedCells.value = [...revealedCells.value, cell.key];
    });

    // 균열 애니메이션 제거 (정답이 보이도록)
    explodingCells.value = [];

    console.log('모든 정답 공개 완료, 3초 후 결과 화면으로 이동');

    // 정답을 확인할 시간을 줌 (3초 대기)
    await new Promise(resolve => setTimeout(resolve, 3000));
    endTime.value = Date.now();

    // 포기한 경우에도 랭킹은 조회 (점수는 저장하지 않음)
    await fetchRankings();

    gameState.value = 'result';
};

// 다시 시작
const restartGame = () => {
    gameState.value = "theme-select";
    currentTutorialStep.value = 0;
    userAnswers.value = {};
    tempInputs.value = {}; // 임시 입력값도 초기화
    hintedCells.value = []; // 힌트 칸도 초기화
    selectedCell.value = null;
    selectedWord.value = null;
    completedWords.value = [];
    learnedWords.value = [];
    hintsUsed.value = 0;
    startTime.value = null;
    endTime.value = null;
    currentPuzzle.value = null;
    explodingCells.value = []; // 폭탄 애니메이션 초기화
    revealedCells.value = []; // 공개된 셀 초기화
    isGivenUp.value = false; // 포기 상태 초기화

    // 랭킹 정보 초기화
    topRankings.value = [];
    myRankInfo.value = null;
    isLoadingRankings.value = false;
    isSavingScore.value = false;

    // 단어 입력 초기화
    Object.keys(wordInputs).forEach(key => {
        delete wordInputs[key];
    });
};
</script>

<template>
    <div class="crossword-game-page">
        <AppHeader v-if="gameState !== 'playing'" />

        <div class="game-content">
            <!-- 튜토리얼 화면 -->
            <div v-if="gameState === 'tutorial'" class="tutorial-section">
                <div class="game-header">
                    <button class="back-button" @click="goHome">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">📚</div>
                        <div class="header-text">
                            <h2 class="common-title2">{{ t('games.tutorials.crossword.gameExplanation') }}</h2>
                            <p class="common-caption text-secondary">{{ t('games.tutorials.crossword.stepCount', { current: currentTutorialStep + 1, total: tutorialSteps.length }) }}</p>
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
                            <CommonButton v-if="currentTutorialStep > 0" @click="prevTutorialStep" variant="secondary" size="large">
                                {{ t('games.tutorials.crossword.previous') }}
                            </CommonButton>
                            <CommonButton v-else @click="skipTutorial" variant="secondary" size="large">
                                {{ t('games.tutorials.crossword.startDirectly') }}
                            </CommonButton>
                            <CommonButton @click="nextTutorialStep" variant="primary" size="large">
                                {{ currentTutorialStep < tutorialSteps.length - 1 ? t('games.tutorials.crossword.next') : t('games.tutorials.crossword.startGame') }}
                            </CommonButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 주제 선택 화면 -->
            <div v-else-if="gameState === 'theme-select'" class="difficulty-section">
                <div class="game-header">
                    <button class="back-button" @click="goHome">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">📝</div>
                        <div class="header-text">
                            <h2 class="common-title2">주제 선택</h2>
                            <p class="common-caption text-secondary">어떤 주제로 퍼즐을 풀까요?</p>
                        </div>
                    </div>
                </div>

                <div class="difficulty-cards">
                    <div v-for="(config, theme) in themeConfig" :key="theme" class="difficulty-card" @click="selectTheme(theme)">
                        <div class="difficulty-icon" :style="{ color: config.color }">{{ config.icon }}</div>
                        <h3 class="difficulty-label">{{ config.label }}</h3>
                        <div class="difficulty-info">
                            <p>{{ config.description }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 난이도 선택 화면 -->
            <div v-else-if="gameState === 'difficulty-select'" class="difficulty-section">
                <div class="game-header">
                    <button class="back-button" @click="gameState = 'theme-select'">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">📊</div>
                        <div class="header-text">
                            <h2 class="common-title2">난이도 선택</h2>
                            <p class="common-caption text-secondary">{{ currentThemeConfig.label }}로 도전합니다!</p>
                        </div>
                    </div>
                </div>

                <div class="difficulty-cards">
                    <div
                        v-for="(config, difficulty) in difficultyConfig"
                        :key="difficulty"
                        class="difficulty-card"
                        @click="selectDifficulty(difficulty)"
                    >
                        <div class="difficulty-icon" :style="{ color: config.color }">{{ config.icon }}</div>
                        <h3 class="difficulty-label">{{ config.label }}</h3>
                        <div class="difficulty-info">
                            <p>격자: {{ config.gridSize }}×{{ config.gridSize }}</p>
                            <p>단어: {{ config.wordCount }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 카운트다운 화면 -->
            <div v-else-if="gameState === 'countdown'" class="countdown-screen">
                <div v-if="countdownValue > 0" class="countdown-number">{{ countdownValue }}</div>
                <div v-else class="countdown-text">
                    <span class="game-start-text">Game Start!</span>
                </div>
            </div>

            <!-- 게임 플레이 화면 -->
            <div v-else-if="gameState === 'playing'" class="playing-section">
                <!-- 상단 헤더 -->
                <div class="game-playing-header">
                    <button class="back-button" @click="goHome">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M19 12H5M5 12L12 19M5 12L12 5"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                    <div class="header-info">
                        <h3 class="common-title4">크로스워드 퍼즐</h3>
                        <p class="common-caption text-secondary">{{ currentThemeConfig.label }} · {{ currentDifficultyConfig.label }}</p>
                    </div>
                    <!-- 힌트 모드 안내 (가운데) -->
                    <div v-if="hintMode" class="hint-mode-notice-center">
                        📍 원하는 칸을 클릭하여 정답을 확인하세요!
                    </div>
                    <button class="audio-toggle-button" @click="toggleMusic">
                        <span v-if="isMusicMuted">🔇</span>
                        <span v-else>🔊</span>
                    </button>
                </div>

                <div class="playing-content">
                    <div class="game-layout">
                        <!-- 퍼즐 그리드 (왼쪽) -->
                        <div class="puzzle-section">

                            <div
                                class="puzzle-grid"
                                :style="{
                                    gridTemplateColumns: `repeat(${currentPuzzle?.gridSize || 7}, 1fr)`,
                                    gridTemplateRows: `repeat(${currentPuzzle?.gridSize || 7}, 1fr)`,
                                }"
                            >
                                <template v-for="(row, rowIndex) in currentPuzzle?.grid" :key="`row-${rowIndex}`">
                                    <div
                                        v-for="(cell, colIndex) in row"
                                        :key="`cell-${rowIndex}-${colIndex}`"
                                        class="puzzle-cell"
                                        :class="{
                                            empty: !userAnswers[`${rowIndex}-${colIndex}`] && userAnswers.hasOwnProperty(`${rowIndex}-${colIndex}`),
                                            filled: userAnswers[`${rowIndex}-${colIndex}`],
                                            selected: selectedCell?.row === rowIndex && selectedCell?.col === colIndex,
                                            highlighted: isCellInSelectedWord(rowIndex, colIndex),
                                            completed: isCellInCompletedWord(rowIndex, colIndex),
                                            blocked: !userAnswers.hasOwnProperty(`${rowIndex}-${colIndex}`),
                                            exploding: explodingCells.includes(`${rowIndex}-${colIndex}`),
                                            revealed: revealedCells.includes(`${rowIndex}-${colIndex}`),
                                        }"
                                        @click="handleCellClick(rowIndex, colIndex)"
                                    >
                                        <!-- 알 균열 SVG -->
                                        <svg v-if="explodingCells.includes(`${rowIndex}-${colIndex}`)" class="egg-crack-svg" viewBox="0 0 100 100">
                                            <!-- 균열선 1 - 중앙에서 위쪽 -->
                                            <path d="M 50 50 L 48 35 L 52 25 L 48 15 L 50 5" class="crack-line crack-1" />
                                            <!-- 균열선 2 - 중앙에서 오른쪽 위 -->
                                            <path d="M 50 50 L 60 45 L 70 42 L 80 38 L 90 35" class="crack-line crack-2" />
                                            <!-- 균열선 3 - 중앙에서 오른쪽 -->
                                            <path d="M 50 50 L 62 52 L 75 48 L 88 52 L 98 50" class="crack-line crack-3" />
                                            <!-- 균열선 4 - 중앙에서 오른쪽 아래 -->
                                            <path d="M 50 50 L 58 62 L 68 70 L 78 80 L 85 92" class="crack-line crack-4" />
                                            <!-- 균열선 5 - 중앙에서 아래 -->
                                            <path d="M 50 50 L 52 65 L 48 78 L 52 88 L 50 98" class="crack-line crack-5" />
                                            <!-- 균열선 6 - 중앙에서 왼쪽 아래 -->
                                            <path d="M 50 50 L 42 58 L 32 68 L 22 78 L 12 88" class="crack-line crack-6" />
                                            <!-- 균열선 7 - 중앙에서 왼쪽 -->
                                            <path d="M 50 50 L 38 48 L 25 52 L 12 48 L 2 50" class="crack-line crack-7" />
                                            <!-- 균열선 8 - 중앙에서 왼쪽 위 -->
                                            <path d="M 50 50 L 40 42 L 28 35 L 18 28 L 8 22" class="crack-line crack-8" />
                                        </svg>

                                        <span v-if="getCellNumbers(rowIndex, colIndex).length > 0" class="cell-number">
                                            {{ getCellNumbers(rowIndex, colIndex).join(', ') }}
                                        </span>
                                        <span class="cell-letter">
                                            {{ userAnswers[`${rowIndex}-${colIndex}`] || "" }}
                                        </span>
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- 입력 패널 (오른쪽) - 문제 순서대로 나열 -->
                        <div class="input-section-new">
                            <div class="problems-header">
                                <h3 class="common-title4">문제 목록</h3>
                                <div class="hint-controls">
                                    <CommonButton variant="secondary" size="small" @click="useHint" :disabled="hintsUsed >= maxHints">
                                        💡 힌트 사용 ({{ hintsUsed }}/{{ maxHints }})
                                    </CommonButton>
                                </div>
                            </div>

            <div class="problems-container">
            <!-- 가로 문제 -->
            <div class="problems-section">
              <h4 class="section-title">가로</h4>
              <div class="problems-list">
                <div
                  v-for="word in acrossWords"
                  :key="word.number"
                  class="problem-item"
                  :class="{
                    'active': selectedWord?.number === word.number,
                    'completed': completedWords.some(w => w.number === word.number)
                  }"
                  :data-word-number="word.number"
                >
                  <div class="problem-header" @click="selectWordFromHint(word)">
                    <div class="problem-number">{{ word.displayNumber }}</div>
                    <div class="problem-info">
                      <span v-if="completedWords.some(w => w.number === word.number)" class="completed-badge">✓ 완료</span>
                    </div>
                  </div>

                  <div class="problem-details">
                    <div class="problem-hanja" v-if="selectedTheme === 'idiom'">{{ word.hanja }}</div>
                    <div class="problem-meaning">{{ word.meaning }}</div>
                    <div class="problem-example" v-if="selectedTheme === 'idiom'">{{ maskAnswerInExample(word.example, word.word) }}</div>
                    <div class="problem-example" v-else>{{ word.hint }}</div>
                  </div>

                  <!-- 정답 입력 칸 -->
                  <div class="problem-input-container">
                    <input
                      type="text"
                      :value="wordInputs[word.number] || ''"
                      @input="(e) => handleWordInput(word, e)"
                      @keydown="(e) => handleWordInputKeydown(word, e)"
                      @focus="selectWordFromHint(word)"
                      :data-word-number="word.number"
                      :placeholder="`${word.word.length}글자 입력`"
                      :maxlength="selectedTheme === 'idiom' ? 4 : word.word.length"
                      class="problem-input"
                      autocomplete="off"
                      :disabled="completedWords.some(w => w.number === word.number)"
                    />
                    <div class="input-indicator">
                      {{ (wordInputs[word.number] || '').length }} / {{ word.word.length }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 세로 문제 -->
            <div class="problems-section">
              <h4 class="section-title">세로</h4>
              <div class="problems-list">
                <div
                  v-for="word in downWords"
                  :key="word.number"
                  class="problem-item"
                  :class="{
                    'active': selectedWord?.number === word.number,
                    'completed': completedWords.some(w => w.number === word.number)
                  }"
                  :data-word-number="word.number"
                >
                  <div class="problem-header" @click="selectWordFromHint(word)">
                    <div class="problem-number">{{ word.displayNumber }}</div>
                    <div class="problem-info">
                      <span v-if="completedWords.some(w => w.number === word.number)" class="completed-badge">✓ 완료</span>
                    </div>
                  </div>

                  <div class="problem-details">
                    <div class="problem-hanja" v-if="selectedTheme === 'idiom'">{{ word.hanja }}</div>
                    <div class="problem-meaning">{{ word.meaning }}</div>
                    <div class="problem-example" v-if="selectedTheme === 'idiom'">{{ maskAnswerInExample(word.example, word.word) }}</div>
                    <div class="problem-example" v-else>{{ word.hint }}</div>
                  </div>

                  <!-- 정답 입력 칸 -->
                  <div class="problem-input-container">
                    <input
                      type="text"
                      :value="wordInputs[word.number] || ''"
                      @input="(e) => handleWordInput(word, e)"
                      @keydown="(e) => handleWordInputKeydown(word, e)"
                      @focus="selectWordFromHint(word)"
                      :data-word-number="word.number"
                      :placeholder="`${word.word.length}글자 입력`"
                      :maxlength="selectedTheme === 'idiom' ? 4 : word.word.length"
                      class="problem-input"
                      autocomplete="off"
                      :disabled="completedWords.some(w => w.number === word.number)"
                    />
                    <div class="input-indicator">
                      {{ (wordInputs[word.number] || '').length }} / {{ word.word.length }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>

                            <!-- 하단 액션 -->
                            <div class="bottom-actions">
                                <CommonButton variant="secondary" @click="giveUp" size="medium"> 포기 </CommonButton>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 정답 공개 카운트다운 (3, 2, 1) -->
                <div v-if="showRevealCountdown" class="countdown-overlay">
                    <div class="countdown-number">{{ revealCountdown }}</div>
                </div>

                <!-- 완성 축하 애니메이션 (빙고 스타일) -->
                <div v-if="showCompletionAnimation" class="completion-achievement-animation">
                    <div class="completion-text">COMPLETE!</div>
                    <div class="completion-message-text">모든 퍼즐을 완성했습니다! ✨</div>
                </div>
            </div>

            <!-- 결과 화면 -->
            <div v-else-if="gameState === 'result'" class="result-section">
                <div class="game-header">
                    <button class="back-button" @click="goHome">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div class="header-info">
                        <div class="header-icon">{{ isGivenUp ? '📖' : '🏆' }}</div>
                        <div class="header-text">
                            <h2 class="common-title2">게임 종료</h2>
                            <p class="common-caption text-secondary">결과 확인</p>
                        </div>
                    </div>
                </div>

                <div class="result-card">
                    <div class="result-header">
                        <p class="result-title">크로스워드 퍼즐</p>
                        <p class="result-message">{{ isGivenUp ? '포기하셨습니다. 정답을 확인하세요!' : '축하합니다! 모든 퍼즐을 완성했습니다!' }}</p>
                    </div>

                    <!-- 정답 오답 표 -->
                    <div class="answer-board">
                        <div class="answer-board-header">
                            <strong>[ 정답 ]</strong>
                        </div>
                        <ul class="answer-list">
                            <li v-for="(word, index) in currentPuzzle?.words" :key="index" class="answer-item">
                                <span class="answer-number" :class="{
                                    'correct-mark': completedWords.some(w => w.number === word.number),
                                    'wrong-mark': !completedWords.some(w => w.number === word.number)
                                }">
                                    {{ index + 1 }}
                                </span>
                                <div class="answer-content">
                                    <p class="answer-hanja" v-if="selectedTheme === 'idiom'">{{ word.hanja }}</p>
                                    <p class="answer-meaning">{{ word.meaning }}</p>
                                    <p class="answer-example" v-if="selectedTheme === 'idiom'">{{ word.example }}</p>
                                    <p class="answer-example" v-else>{{ word.hint }}</p>
                                    <div class="answer-words">
                                        <span class="correct-answer" :class="{ 'with-check': completedWords.some(w => w.number === word.number) }">
                                            {{ word.word }}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <!-- 랭킹 섹션 -->
                    <div v-if="topRankings.length > 0" class="ranking-section animate-ranking">
                        <h3 class="ranking-title">
                            🏆 {{ selectedTheme === 'idiom' ? '사자성어' : '속담' }}
                            <span :style="{ color: getDifficultyColor() }">
                                {{ getDifficultyLabel() }}
                            </span>
                            TOP 3 랭킹
                        </h3>
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
                                <span class="ranking-time">{{ formatRankingTime(ranking.score) }}</span>
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
                                <span class="ranking-time">{{ formatRankingTime(myRankInfo.score) }}</span>
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

            <!-- Toast Notification -->
            <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
                {{ toast.message }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.crossword-game-page {
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

/* 단어 뜻 모달 */
.word-meaning-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(3px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
}

.word-meaning-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: 32px;
    max-width: 400px;
    text-align: center;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
}

.word-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 16px;
}

.word-meaning {
    background: var(--gray-50);
    padding: 16px;
    border-radius: var(--radius-lg);
    color: var(--gray-700);
    line-height: 1.6;
    margin-bottom: 16px;
}

.success-badge {
    display: inline-block;
    padding: 8px 20px;
    background: var(--gray-100);
    color: var(--gray-600);
    border-radius: var(--radius-lg);
    font-weight: 600;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
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
    gap: 12px;
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
    transition: color 0.2s ease;
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
    gap: 12px;
    align-items: center;
    flex: 1;
}

.header-icon {
    font-size: 48px;
}

.header-text h2 {
    margin: 0;
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
    gap: 24px;
}

.tutorial-icon {
    font-size: 72px;
    margin-bottom: 8px;
    animation: iconBounce 0.6s ease-out;
}

@keyframes iconBounce {
    0%,
    100% {
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
    margin-top: auto;
}

/* 난이도 및 주제 선택 화면 */
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
    position: relative;
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

.audio-toggle-button {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s ease;
    border-radius: var(--radius-md);
}

.audio-toggle-button:hover {
    transform: scale(1.1);
    background: var(--gray-100);
}

.audio-toggle-button:active {
    transform: scale(0.95);
}

.playing-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
}

.game-info,
.game-stats {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}

.info-item,
.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 600;
    color: var(--gray-700);
    font-size: 14px;
}

.info-icon {
    font-size: 20px;
}

.game-layout {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 20px;
    align-items: start;
}

.puzzle-section,
.hints-section,
.input-section {
    background: white;
    border-radius: var(--radius-lg);
    padding: 24px;
    box-shadow: var(--shadow-md);
}

.puzzle-section {
    min-height: 650px;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.input-section {
    display: flex;
    flex-direction: column;
    gap: 20px;
    height: fit-content;
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

/* 퍼즐 그리드 */
.puzzle-grid {
    display: grid;
    gap: 2px;
    background: var(--gray-300);
    padding: 2px;
    border-radius: var(--radius-md);
    max-width: 700px;
    margin: 0 auto;
    aspect-ratio: 1/1;
    width: 100%;
}

.puzzle-cell {
    position: relative;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 30px;
    min-width: 30px;
}

.puzzle-cell.blocked {
    background: var(--gray-200);
    cursor: not-allowed;
}

.puzzle-cell.empty {
    background: white;
}

.puzzle-cell.filled {
    background: var(--gray-50);
}

.puzzle-cell.selected {
    background: #fff4e6;
    box-shadow: inset 0 0 0 2px var(--common-blue);
}

.puzzle-cell.highlighted {
    background: #e3f2fd;
}

.puzzle-cell.completed {
    background: #e8f5e9;
}

.puzzle-cell.exploding {
    position: relative;
    z-index: 100;
    overflow: visible;
    background: white !important;
}

/* 알 균열 SVG */
.egg-crack-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

/* 균열선 스타일 */
.crack-line {
    fill: none;
    stroke: #64748b;
    stroke-width: 1.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
}

/* 각 균열선이 순차적으로 천천히 나타남 */
.crack-1 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0s forwards, crackFade 1.5s ease-out 0s forwards;
}

.crack-2 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.15s forwards, crackFade 1.5s ease-out 0.15s forwards;
}

.crack-3 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.3s forwards, crackFade 1.5s ease-out 0.3s forwards;
}

.crack-4 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.45s forwards, crackFade 1.5s ease-out 0.45s forwards;
}

.crack-5 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.6s forwards, crackFade 1.5s ease-out 0.6s forwards;
}

.crack-6 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.75s forwards, crackFade 1.5s ease-out 0.75s forwards;
}

.crack-7 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 0.9s forwards, crackFade 1.5s ease-out 0.9s forwards;
}

.crack-8 {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: drawCrack 1.5s ease-out 1.05s forwards, crackFade 1.5s ease-out 1.05s forwards;
}

/* exploding 상태일 때 숫자는 숨기기 */
.puzzle-cell.exploding :deep(.cell-number) {
    opacity: 0 !important;
}

/* exploding 상태일 때 글자는 숨김 (나중에 revealed 상태에서 표시) */
.puzzle-cell.exploding :deep(.cell-letter) {
    opacity: 0 !important;
}

.puzzle-cell.revealed {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
    animation: fadeInAnswer 0.3s ease-out;
    border-color: #90caf9;
}

.puzzle-cell:not(.blocked):hover {
    background: var(--gray-100);
}

.cell-number {
    position: absolute;
    top: 1px;
    left: 2px;
    font-size: 8px;
    font-weight: 600;
    color: var(--gray-600);
    line-height: 1;
    z-index: 10;
}

.cell-letter {
    font-size: 18px;
    font-weight: 600;
    color: var(--gray-900);
}

/* 힌트 패널 */
.hints-panel {
    margin-bottom: 20px;
    max-height: 600px;
    overflow-y: auto;
}

.hints-panel h3 {
    margin-bottom: 20px;
    color: var(--gray-900);
}

.hints-group {
    margin-bottom: 24px;
}

.hints-group-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.hints-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.hint-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.hint-item:hover {
    background: var(--gray-100);
}

.hint-item.selected {
    background: #e3f2fd;
    border-color: var(--common-blue);
}

.hint-item.completed {
    background: #e8f5e9;
    opacity: 0.7;
}

.hint-number {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    background: white;
    color: var(--gray-700);
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
}

.hint-text {
    flex: 1;
    color: var(--gray-700);
    line-height: 1.5;
    font-size: 14px;
}

.hint-check {
    color: var(--common-green);
    font-size: 18px;
    flex-shrink: 0;
}

.game-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

/* 결과 화면 */
.result-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
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
    color: var(--gray-700);
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
}

.back-button:hover {
    background: var(--gray-100);
    color: var(--gray-900);
}

.header-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.hint-mode-notice-center {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    font-size: 16px;
    font-weight: 600;
    color: var(--common-blue);
    white-space: nowrap;
}

.header-text {
    text-align: left;
}

.result-card {
    background: white;
    border-radius: var(--radius-xl);
    padding: 48px 40px;
    box-shadow: var(--shadow-lg);
    overflow-y: auto;
}

.result-header {
    text-align: center;
    margin-bottom: 40px;
}

.result-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--gray-600);
    margin-bottom: 16px;
}

.result-message {
    font-size: 24px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 12px;
}

/* 정답 및 해설 표 */
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

/* 정답 - 빨간색 타원형 동그라미 (색연필 느낌) */
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
        inset 1.5px 1px 0 rgba(255, 71, 87, 0.5),
        inset -1px -1.5px 0 rgba(255, 71, 87, 0.5),
        inset 0 2px 0 rgba(255, 71, 87, 0.4),
        0 0 0 1px rgba(255, 71, 87, 0.4),
        1px 1px 3px rgba(255, 71, 87, 0.5),
        -1px -1px 2px rgba(255, 71, 87, 0.4);
}

/* 틀린 답 - 빨간색 대각선 (색연필 느낌) */
.answer-number.wrong-mark {
    color: #ff4757;
}

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
    margin-bottom: 6px;
    font-weight: 500;
}

.answer-hanja {
    color: var(--common-blue);
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 6px;
    font-weight: 700;
}

.answer-meaning {
    color: var(--gray-800);
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 6px;
    font-weight: 500;
}

.answer-example {
    color: var(--gray-600);
    font-size: 13px;
    line-height: 1.5;
    margin-bottom: 10px;
    font-style: italic;
    font-weight: 400;
}

.answer-words {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
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

.result-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
}

/* 입력 패널 스타일 */
.current-word-panel {
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    padding: 20px;
    border: 2px solid var(--common-blue);
}

.word-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.word-number-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--common-blue);
    color: white;
    border-radius: 50%;
    font-size: 18px;
    font-weight: 700;
}

.word-direction {
    padding: 6px 12px;
    background: white;
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
}

.word-hint {
    font-size: 16px;
    line-height: 1.6;
    color: var(--gray-800);
    margin-bottom: 16px;
    font-weight: 500;
}

.answer-input-container {
    margin-bottom: 16px;
}

.answer-input {
    width: 100%;
    padding: 16px;
    font-size: 20px;
    font-weight: 600;
    border: 2px solid var(--gray-300);
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    font-family: inherit;
    letter-spacing: 4px;
    text-align: center;
}

.answer-input:focus {
    outline: none;
    border-color: var(--common-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.answer-input::placeholder {
    color: var(--gray-400);
    letter-spacing: normal;
}

.input-length-indicator {
    margin-top: 8px;
    text-align: right;
    font-size: 13px;
    color: var(--gray-600);
    font-weight: 500;
}

.hint-button {
    width: 100%;
}

/* 단어 목록 패널 */
.words-list-panel {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.words-list-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 12px;
}

.words-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    max-height: 300px;
}

.word-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--gray-50);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
}

.word-list-item:hover {
    background: var(--gray-100);
}

.word-list-item.active {
    background: #e3f2fd;
    border-color: var(--common-blue);
}

.word-list-item.completed {
    background: #e8f5e9;
    opacity: 0.7;
}

.word-number {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 28px;
    background: white;
    color: var(--gray-700);
    border-radius: 50%;
    font-size: 13px;
    font-weight: 700;
}

.word-list-item.active .word-number {
    background: var(--common-blue);
    color: white;
}

.word-direction-label {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    color: var(--gray-700);
}

.completed-check {
    color: var(--common-green);
    font-size: 18px;
    font-weight: 700;
}

.bottom-actions {
    margin-top: auto;
    padding-top: 16px;
    border-top: 1px solid var(--gray-200);
}

.bottom-actions button {
    width: 100%;
}

/* 새로운 입력 패널 스타일 */
.input-section-new {
    background: white;
    border-radius: var(--radius-lg);
    padding: 20px;
    box-shadow: var(--shadow-md);
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 650px;
    max-height: calc(100vh - 200px);
    overflow: hidden;
}

.problems-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 2px solid var(--gray-200);
}

.problems-header h3 {
    margin: 0;
    color: var(--gray-900);
}

.hint-info {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
    padding: 6px 12px;
    background: var(--gray-100);
    border-radius: var(--radius-md);
}

.hint-controls {
    display: flex;
    gap: 8px;
}

.puzzle-section .hint-mode-notice {
    padding: 12px 16px;
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    border: 2px solid var(--common-blue);
    border-radius: var(--radius-lg);
    text-align: center;
    font-weight: 600;
    color: #1565c0;
    animation: pulse 2s ease-in-out infinite;
    margin-bottom: 20px;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;
}

@keyframes pulse {
    0%,
    100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.02);
    }
}

.problems-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
}

.problems-section {
    margin-bottom: 24px;
}

.problems-section:last-child {
    margin-bottom: 0;
}

.section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--gray-300);
}

.problems-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.problem-item {
    background: var(--gray-50);
    border-radius: var(--radius-lg);
    padding: 16px;
    border: 2px solid transparent;
    transition: all 0.2s ease;
}

.problem-item.active {
    background: #e3f2fd;
    border-color: var(--common-blue);
}

.problem-item.completed {
    background: #e8f5e9;
    opacity: 0.9;
}

.problem-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    cursor: pointer;
}

.problem-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: white;
    color: var(--gray-800);
    border-radius: 50%;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
}

.problem-item.active .problem-number {
    background: var(--common-blue);
    color: white;
}

.problem-item.completed .problem-number {
    background: var(--common-green);
    color: white;
}

.problem-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
}

.problem-direction {
    font-size: 14px;
    font-weight: 600;
    color: var(--gray-700);
    padding: 4px 10px;
    background: white;
    border-radius: var(--radius-md);
}

.completed-badge {
    font-size: 13px;
    font-weight: 600;
    color: var(--common-green);
    padding: 4px 10px;
    background: white;
    border-radius: var(--radius-md);
}

.problem-details {
    margin-bottom: 12px;
}

.problem-hanja {
    font-size: 16px;
    line-height: 1.6;
    color: var(--common-blue);
    margin-bottom: 6px;
    font-weight: 700;
}

.problem-meaning {
    font-size: 15px;
    line-height: 1.6;
    color: var(--gray-800);
    margin-bottom: 6px;
    font-weight: 500;
}

.problem-example {
    font-size: 14px;
    line-height: 1.5;
    color: var(--gray-600);
    font-style: italic;
}

.problem-input-container {
    position: relative;
}

.problem-input {
    width: 100%;
    padding: 14px;
    font-size: 18px;
    font-weight: 600;
    border: 2px solid var(--gray-300);
    border-radius: var(--radius-lg);
    transition: all 0.2s ease;
    font-family: inherit;
    letter-spacing: 3px;
    text-align: center;
    background: white;
}

.problem-input:focus {
    outline: none;
    border-color: var(--common-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.problem-input:disabled {
    background: var(--gray-100);
    cursor: not-allowed;
}

.problem-input::placeholder {
    color: var(--gray-400);
    letter-spacing: normal;
    font-size: 14px;
}

.input-indicator {
    margin-top: 6px;
    text-align: right;
    font-size: 12px;
    color: var(--gray-600);
    font-weight: 500;
}

/* 반응형 */
@media (max-width: 1024px) {
    .game-layout {
        grid-template-columns: 1fr;
    }

    .puzzle-section {
        order: 2;
    }

    .hints-section {
        order: 1;
    }
}

@media (max-width: 768px) {
    .game-content {
        padding: 16px;
    }

    .difficulty-cards {
        grid-template-columns: 1fr;
    }

    .tutorial-card,
    .result-content {
        padding: 16px;
    }

    .result-stats {
        grid-template-columns: 1fr;
    }

    .puzzle-grid {
        max-width: 100%;
    }

    .cell-letter {
        font-size: 16px;
    }

    .countdown-number,
    .countdown-text {
        font-size: 80px;
    }
}

@media (max-width: 480px) {
    .game-content {
        padding: 12px;
    }

    .cell-letter {
        font-size: 14px;
    }

    .cell-number {
        font-size: 8px;
    }
}

/* 정답 공개 카운트다운 오버레이 */
.countdown-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
}

.countdown-overlay .countdown-number {
    font-size: 120px;
    font-weight: 700;
    color: var(--common-blue);
    animation: countdown-pulse 0.8s ease-in-out;
}

/* 완성 축하 애니메이션 (빙고 스타일) */
.completion-achievement-animation {
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
    animation: completionBackdropFade 2s ease-in-out;
    pointer-events: none;
}

.completion-text {
    font-size: 120px;
    font-weight: 900;
    color: #fff;
    text-shadow:
        0 0 20px rgba(66, 153, 225, 0.8),
        0 0 40px rgba(66, 153, 225, 0.6),
        0 0 60px rgba(66, 153, 225, 0.4),
        0 4px 30px rgba(0, 0, 0, 0.3);
    letter-spacing: 16px;
    animation: completionTextReveal 2s cubic-bezier(0.34, 1.56, 0.64, 1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.completion-message-text {
    font-size: 32px;
    font-weight: 700;
    color: #fff;
    margin-top: 24px;
    text-shadow:
        0 0 10px rgba(255, 255, 255, 0.5),
        0 2px 20px rgba(0, 0, 0, 0.3);
    animation: completionMessageSlide 2s ease-in-out;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

@keyframes completionBackdropFade {
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

@keyframes completionTextReveal {
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

@keyframes completionMessageSlide {
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

/* Toast 알림 */
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

.toast-info {
    background: var(--common-blue);
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


@keyframes fadeInAnswer {
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    60% {
        opacity: 1;
        transform: scale(1.08);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

/* 균열선 그리기 - 천천히 선이 그려짐 */
@keyframes drawCrack {
    0% {
        stroke-dashoffset: 100;
    }
    100% {
        stroke-dashoffset: 0;
    }
}

/* 균열선 페이드 인 */
@keyframes crackFade {
    0% {
        opacity: 0;
    }
    20% {
        opacity: 1;
    }
    100% {
        opacity: 1;
    }
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

.ranking-time {
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
    font-size: 32px;
    display: block;
    margin-bottom: 12px;
    animation: spin 1.5s linear infinite;
}

/* 랭킹 애니메이션 */
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

@keyframes medalRotate {
    0% {
        transform: rotateY(0deg) scale(0.5);
        opacity: 0;
    }
    50% {
        transform: rotateY(180deg) scale(1.1);
    }
    100% {
        transform: rotateY(360deg) scale(1);
        opacity: 1;
    }
}

@keyframes glowPulse {
    0%, 100% {
        box-shadow: 0 0 8px rgba(255, 215, 0, 0.25);
    }
    50% {
        box-shadow: 0 0 16px rgba(255, 215, 0, 0.5);
    }
}

.animate-ranking {
    animation: fadeInUp 0.5s ease-out forwards;
    animation-delay: 0.3s;
}

/* 반응형 - 랭킹 섹션 */
@media (max-width: 768px) {
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

    .ranking-time {
        font-size: 17px;
    }
}

@media (max-width: 480px) {
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

    .ranking-time {
        font-size: 16px;
    }
}
</style>
