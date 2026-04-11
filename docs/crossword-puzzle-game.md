# 크로스워드 퍼즐

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
크로스워드 퍼즐은 사자성어와 속담을 배우면서 즐기는 교육용 퍼즐 게임입니다. 왼쪽 격자판에 가로/세로로 교차하는 단어들이 숨겨져 있고, 오른쪽 힌트 목록을 보고 정답을 맞추는 방식입니다. 사자성어는 4글자 고정이며, 속담은 다양한 길이의 문제로 구성됩니다. 교차하는 칸의 글자는 두 단어가 공유하므로, 한 단어를 맞추면 다른 단어를 푸는 데 도움이 됩니다.

### 1-2. 핵심 특징

#### 두 가지 주제
- 📚 **사자성어**: 네 글자로 이루어진 한자 성어
  - 격자 크기: 9×9(초급), 10×10(중급), 13×13(고급)
  - 모든 단어가 4글자로 고정
  - 97개의 사자성어 데이터 (초급 30개, 중급 33개, 고급 34개)
- 💡 **속담**: 우리 조상들의 지혜를 담은 속담
  - 격자 크기: 16×16(초급), 18×18(중급), 20×20(고급)
  - 다양한 길이의 단어 (6-20글자)
  - 90개의 속담 데이터 (각 난이도별 30개)

#### 난이도 시스템
- 🌱 **초급**: 짧고 쉬운 단어 (6개)
  - 사자성어: 9×9 격자
  - 속담: 16×16 격자
- 🔥 **중급**: 적당한 난이도/길이 (8개)
  - 사자성어: 10×10 격자
  - 속담: 18×18 격자
- ⚡ **고급**: 어려운/긴 단어 (10개)
  - 사자성어: 13×13 격자
  - 속담: 20×20 격자

#### 그룹 기반 단어 선택 시스템
- 📦 **미리 검증된 그룹**: 각 난이도별로 100% 교차가 보장되는 단어 그룹을 미리 생성
  - 사자성어: 초급 20개 그룹, 중급 16개 그룹, 고급 14개 그룹
  - 속담: 초급 20개 그룹, 중급 16개 그룹, 고급 14개 그룹
- 🎯 **랜덤 그룹 선택**: 게임 시작 시 해당 난이도의 그룹 중 하나를 랜덤으로 선택
- ✅ **100% 교차 보장**: 모든 단어가 최소 1개 이상의 다른 단어와 교차하도록 보장
- 🔄 **일관된 게임 경험**: 항상 안정적인 크로스워드 퍼즐 제공

#### 동적 격자 시스템
- 🎯 **주제별 설정**: 선택한 주제에 따라 자동으로 적절한 격자 크기 적용
- 📐 **동적 생성**: 선택된 그룹의 단어들을 크로스워드 알고리즘으로 격자에 배치
- 🔄 **교차점 공유**: 가로/세로 단어가 교차하는 칸을 공유하여 힌트 제공

#### 입력 및 검증 시스템
- ✏️ **오른쪽 입력창**: 격자 직접 클릭이 아닌 문제 목록의 입력창 사용
- 🖱️ **격자 칸 클릭**: 격자의 칸을 직접 클릭하여 해당 단어의 입력창으로 포커스 이동
- ⌨️ **한글만 입력**: 한글만 입력 가능하며 띄어쓰기 없이 입력
- ✅ **Enter 제출**: Enter 키를 눌러 정답 제출
- 🎯 **즉시 피드백**:
  - 정답: 격자에 표시되고 단어의 의미 표시
  - 오답: 입력이 지워지고 오답 토스트 메시지
- 🔢 **글자 수 표시**: 각 입력창에 "N / M" 형식으로 글자 수 표시

#### 힌트 시스템
- 💡 **난이도별 제공**: 초급 3회, 중급 5회, 고급 7회 힌트 사용 가능
- 🖱️ **직접 선택 방식**: 힌트 버튼 클릭 후 공개할 칸을 직접 클릭하여 선택
- 🔄 **교차점 우선 권장**: 교차하는 칸을 선택하면 다른 단어에도 도움
- 🔒 **고정 표시**: 힌트로 공개된 글자는 초록색으로 표시되어 구분
- ⚠️ **유효성 검증**: 선택한 단어의 칸이 아니거나 이미 공개된 칸은 선택 불가

#### 게임 진행
- 📊 **진행률 표시**: 상단에 "N / M 완료 (NN%)" 형식으로 진행 상황 표시
- 🎨 **색상 구분**:
  - 빈 칸: 흰색
  - 선택한 단어: 노란색 하이라이트
  - 완료한 단어: 초록색
  - 힌트 칸: 연한 초록색
- 📝 **가로/세로 분류**: 힌트 목록을 가로 단어와 세로 단어로 구분 표시
- ⏰ **무제한 시간**: 시간 제한 없이 천천히 생각하며 풀이 가능
- 🚪 **포기 기능**: 게임 진행 중 "포기하기" 버튼으로 언제든지 결과 화면으로 이동 가능

#### 결과 및 학습
- 🎉 **완성 축하 애니메이션**: 모든 단어를 맞추면 confetti 애니메이션과 함께 축하 메시지 표시
- 🎊 **confetti 효과**: canvas-confetti 라이브러리를 사용한 화려한 축하 효과
- 📚 **학습한 단어**: 맞춘 모든 단어와 의미를 가로/세로 구분하여 목록으로 표시
- 📊 **통계 정보**: 완료 시간, 힌트 사용 횟수, 총 단어 수 등 표시
- 🔄 **재도전**: 같은 난이도로 다시 시작하거나 다른 주제/난이도 선택 가능

#### 튜토리얼 및 UX
- 📚 **4단계 튜토리얼**: 게임 규칙, 입력 방법, 주제/난이도, 힌트 시스템을 상세하게 안내
- 🎵 **배경음악**: WayToSchool.mp3 자동 재생, 음소거 버튼(🔊/🔇)으로 ON/OFF 가능
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장하여 새로고침 시에도 유지
- 📜 **자동 스크롤**: 게임 화면 전환 시 자동으로 페이지 최상단으로 스크롤

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "크로스워드 퍼즐" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 크로스워드 퍼즐 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/crossword`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 주제 선택으로 이동 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/4, 2/4, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, ✏️, 📚, 💡)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (4개 bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "게임 시작" 버튼

**튜토리얼 단계**:

**1단계 - 크로스워드 퍼즐이란?** (🎮)
- 사자성어와 속담을 배우며 즐기는 퍼즐 게임입니다.
- 상세 안내:
  - 왼쪽 격자판에 가로/세로로 교차하는 단어들이 숨겨져 있습니다.
  - 오른쪽 문제 목록에서 힌트를 보고 정답을 맞춰보세요.
  - 교차하는 칸의 글자는 두 단어가 공유합니다.
  - 한 단어를 맞추면 다른 단어를 푸는 데 도움이 됩니다!

**2단계 - 게임 방법** (✏️)
- 오른쪽 입력창에 정답을 입력하고 Enter를 누르세요.
- 상세 안내:
  - 오른쪽 문제 목록에서 번호를 클릭하면 해당 단어가 하이라이트됩니다.
  - 입력창에 한글로 정답을 입력하세요 (띄어쓰기 없이).
  - Enter 키를 누르면 정답이 제출됩니다.
  - 정답이면 격자에 표시되고, 오답이면 입력이 지워집니다.

**3단계 - 주제와 난이도** (📚)
- 사자성어는 4글자, 속담은 다양한 길이의 문제가 나옵니다.
- 상세 안내:
  - 사자성어: 9×9(초급), 10×10(중급), 13×13(고급) 격자
  - 속담: 16×16(초급), 18×18(중급), 20×20(고급) 격자
  - 모든 난이도는 초급 6개, 중급 8개, 고급 10개 단어로 구성됩니다.
  - 난이도가 높을수록 격자가 크고 단어가 많아집니다.

**4단계 - 힌트와 포기 기능** (💡)
- 막힐 때는 힌트를 활용하거나 포기할 수도 있어요!
- 상세 안내:
  - 힌트 버튼을 누른 후 공개할 칸을 직접 클릭하세요.
  - 난이도별 힌트 제공: 초급 3회, 중급 5회, 고급 7회
  - 교차하는 칸을 선택하면 여러 단어에 도움이 됩니다.
  - 너무 어려우면 "포기하기" 버튼으로 결과를 확인할 수 있습니다.
  - 시간 제한이 없으니 천천히 생각하며 즐겨보세요!

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 바로 주제 선택으로
- "게임 시작" 버튼 (4단계): 주제 선택 화면으로

---

### 3-2. 주제 선택 (Theme Selection)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📝 아이콘, "주제 선택" 제목
- 중앙: 주제 카드
  - 제목: "어떤 주제로 퍼즐을 풀까요?"
  - 2개의 선택 카드:
    - "사자성어" (📚 아이콘, 보라색): 네 글자로 이루어진 한자 성어
    - "속담" (💡 아이콘, 파란색): 우리 조상들의 지혜를 담은 속담

**선택 후 동작**:
- 주제를 클릭하면 난이도 선택 화면으로 이동
- 선택한 주제에 따라 격자 크기와 데이터가 자동으로 결정됨

---

### 3-3. 난이도 선택 (Difficulty Selection)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📊 아이콘, "난이도 선택" 제목, "주제명으로 도전합니다!" 부제목
- 중앙: 난이도 카드
  - 3개의 선택 카드 (초급, 중급, 고급):
    - 아이콘 (🌱, 🔥, ⚡)
    - 난이도 라벨
    - 격자 크기 (예: 7×7)
    - 단어 개수 (예: 6개)

**사자성어 난이도**:
- 초급 (🌱): 9×9 격자, 6개 단어, 짧고 쉬운 사자성어
- 중급 (🔥): 10×10 격자, 8개 단어, 적당한 난이도의 사자성어
- 고급 (⚡): 13×13 격자, 10개 단어, 어려운 사자성어

**속담 난이도**:
- 초급 (🌱): 16×16 격자, 6개 단어, 짧고 쉬운 속담
- 중급 (🔥): 18×18 격자, 8개 단어, 적당한 길이의 속담
- 고급 (⚡): 20×20 격자, 10개 단어, 긴 속담

**선택 후 동작**:
- 난이도를 클릭하면 카운트다운 시작
- 퍼즐 데이터 로드 및 격자 생성

---

### 3-4. 카운트다운 (Countdown)

난이도 선택 후 3초 카운트다운이 시작됩니다.

**화면 구성**:
- 화면 중앙에 큰 숫자 표시: "3" → "2" → "1" → "Game Start!"
- 각 숫자는 1초 간격으로 표시
- 숫자가 나타날 때마다 애니메이션 효과 (`countdown-pulse`)
- "Game Start!" 텍스트는 확대되며 사라지는 애니메이션 (`gameStartExpand`)

**애니메이션**:
```css
@keyframes countdown-pulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes gameStartExpand {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(15); opacity: 0; }
}
```

카운트다운이 끝나면 600ms 후 실제 게임이 시작됩니다.

---

### 3-5. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-playing-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙: "크로스워드 퍼즐" 제목, "주제 · 난이도" 부제목
- 우측: 🔊/🔇 음악 토글 버튼

**메인 레이아웃** (playing-content):

**왼쪽 - 퍼즐 격자** (puzzle-section):
- 상단: 진행률 표시 (예: "3 / 6 완료 (50%)")
- 중앙: 크로스워드 격자
  - Grid 레이아웃으로 동적 크기 (9×9 ~ 20×20)
  - 각 칸의 색상:
    - 빈 칸: 흰색 배경
    - 선택한 단어: 노란색 하이라이트 (`#FFF9C4`)
    - 완료한 단어: 초록색 (`#C8E6C9`)
    - 힌트 칸: 연한 초록색 (`#E8F5E9`)
  - 단어 번호: 왼쪽 상단에 작은 숫자 표시
  - 칸 클릭: 격자의 칸을 클릭하면 해당 단어의 입력창으로 포커스 이동
- 하단: 힌트 버튼 및 포기 버튼
  - 힌트 버튼: "💡 힌트 사용 (N/3 또는 N/5 또는 N/7)" 형식
  - 포기 버튼: "🚪 포기하기" - 클릭 시 확인 대화상자 후 결과 화면으로 이동

**오른쪽 - 힌트 목록** (hints-section):
- 가로 단어 목록 (across-hints):
  - 제목: "가로 단어 ➡️"
  - 각 단어 카드:
    - 단어 번호
    - 힌트 텍스트
    - 입력창 (N글자 입력)
    - 글자 수 표시 (N / M)
- 세로 단어 목록 (down-hints):
  - 제목: "세로 단어 ⬇️"
  - 가로 단어와 동일한 카드 구조

**게임 로직**:

**1. 단어 선택**
```javascript
// 단어 번호 클릭 시
const selectWordFromHint = (word) => {
  selectedWord.value = word;

  // 첫 번째 칸으로 스크롤
  const firstCell = word.cells[0];
  selectedCell.value = { row: firstCell[0], col: firstCell[1] };

  // 격자에 하이라이트 표시
  highlightWord(word);
};
```

**2. 정답 입력**
```javascript
// Enter 키 입력 시
const handleWordInputKeydown = (word, event) => {
  if (event.key === "Enter") {
    const wordKey = `word-${word.number}`;
    const fullWord = userEmptyInputs.value[wordKey] || '';

    // 글자 수 확인
    if (fullWord.length === word.word.length) {
      // 정답 확인
      if (fullWord === word.word) {
        // 정답 처리
        word.cells.forEach(([row, col], index) => {
          const key = `${row}-${col}`;
          userAnswers.value[key] = fullWord[index];
        });
        checkWordCompletion(word);
      } else {
        // 오답 처리
        userEmptyInputs.value[wordKey] = '';
        showToast("오답입니다 😢", "error");
      }
    }
  }
};
```

**3. 한글 필터링**
```javascript
// 입력 중 한글만 허용
const handleWordInputFilter = (word, event) => {
  const wordKey = `word-${word.number}`;
  const currentValue = userEmptyInputs.value[wordKey] || '';

  // 한글만 필터링
  const chars = currentValue.split('').filter(c => /[가-힣]/.test(c));
  const wordLength = word.word.length;

  // 글자 수 제한
  const limitedString = chars.slice(0, wordLength).join('');

  if (currentValue !== limitedString) {
    userEmptyInputs.value[wordKey] = limitedString;
  }
};
```

**4. 단어 완료 확인**
```javascript
const checkWordCompletion = (word) => {
  const isComplete = word.cells.every(([row, col]) => {
    const key = `${row}-${col}`;
    return userAnswers.value[key] === word.word[word.cells.findIndex(([r, c]) => r === row && c === col)];
  });

  if (isComplete) {
    completedWords.value.push(word);
    learnedWords.value.push(word);
    showToast(`정답입니다! 🎉\n${word.meaning}`, "success");

    // 모든 단어 완료 확인
    if (completedWords.value.length === currentPuzzle.value.words.length) {
      endTime.value = Date.now();
      gameState.value = "result";
    }
  }
};
```

**5. 힌트 모드 활성화**
```javascript
const activateHintMode = () => {
  const maxHints = selectedDifficulty.value === 'beginner' ? 3
    : selectedDifficulty.value === 'intermediate' ? 5
    : 7;

  if (hintsUsed.value >= maxHints) {
    showToast("힌트를 모두 사용했습니다", "warning");
    return;
  }

  if (!selectedWord.value) {
    showToast("단어를 먼저 선택해주세요", "warning");
    return;
  }

  hintMode.value = true;
  showToast("공개할 칸을 클릭하세요", "info");
};
```

**6. 칸 클릭 시 힌트 적용**
```javascript
const handleCellClick = (row, col) => {
  // 힌트 모드일 때
  if (hintMode.value) {
    const key = `${row}-${col}`;

    // 이미 공개된 칸인지 확인
    if (userAnswers.value[key] || hintedCells.value.some(h => h[0] === row && h[1] === col)) {
      showToast("이미 공개된 칸입니다", "warning");
      return;
    }

    // 선택한 단어의 칸인지 확인
    const isInSelectedWord = selectedWord.value?.cells.some(([r, c]) => r === row && c === col);

    if (!isInSelectedWord) {
      showToast("선택한 단어의 칸을 클릭하세요", "warning");
      return;
    }

    // 힌트 적용
    const charIndex = selectedWord.value.cells.findIndex(([r, c]) => r === row && c === col);
    userAnswers.value[key] = selectedWord.value.word[charIndex];
    hintedCells.value.push([row, col]);
    hintsUsed.value++;

    hintMode.value = false;

    const maxHints = selectedDifficulty.value === 'beginner' ? 3
      : selectedDifficulty.value === 'intermediate' ? 5
      : 7;
    showToast(`힌트를 사용했습니다! (${hintsUsed.value}/${maxHints})`, "info");
  }
  // 일반 모드일 때
  else {
    // 해당 칸이 속한 단어 찾기 및 선택
    const word = findWordByCell(row, col);
    if (word) {
      selectWordFromHint(word);
      // 해당 단어의 입력창으로 포커스 이동
      nextTick(() => {
        const input = document.querySelector(`#word-input-${word.number}`);
        if (input) input.focus();
      });
    }
  }
};
```

**7. 포기 기능**
```javascript
const giveUp = () => {
  if (confirm("정말 포기하시겠습니까? 현재까지의 진행 상황을 결과 화면에서 확인할 수 있습니다.")) {
    endTime.value = Date.now();
    gameState.value = "result";

    // 화면 최상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
```

---

### 3-6. 결과 화면 (Result)

**화면 구성**:

**완성 축하 애니메이션**:
- confetti 효과: 모든 단어를 맞춘 경우에만 표시
- canvas-confetti 라이브러리를 사용한 화려한 축하 애니메이션
- 결과 화면 진입 시 자동으로 실행

**상단 헤더**:
- 🏆 아이콘
- "게임 완료!" 제목 (모든 단어를 맞춘 경우)
- "게임 종료" 제목 (포기한 경우)
- "모든 단어를 맞추셨습니다!" 부제목 (완성 시)
- "일부 단어를 맞추셨습니다" 부제목 (포기 시)

**결과 카드**:
- 축하 메시지: "🎉 축하합니다!" (완성 시) / "😊 수고하셨습니다" (포기 시)
- 게임 통계:
  - 주제: 사자성어 / 속담
  - 난이도: 초급 (3회 힌트) / 중급 (5회 힌트) / 고급 (7회 힌트)
  - 완료 시간: MM:SS (1분 이하는 초 단위, 그 이상은 분:초 형식)
  - 힌트 사용: N / 3 (또는 5, 7)
  - 완료 단어: N / M (전체 단어 수 대비 맞춘 단어 수)

**학습한 단어 목록** (learned-words):
- 제목: "학습한 단어들"
- 가로 단어 섹션:
  - 부제목: "가로 단어 ➡️"
  - 각 단어 카드:
    - 단어 번호
    - 단어
    - 힌트
    - 의미
- 세로 단어 섹션:
  - 부제목: "세로 단어 ⬇️"
  - 각 단어 카드 (가로 단어와 동일 구조)

**액션 버튼** (result-actions):
- "게임 목록으로" 버튼: 게임 센터로 복귀 (화면 전환 시 자동 스크롤)
- "다시 도전" 버튼: 주제 선택으로 돌아가기 (화면 전환 시 자동 스크롤)

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/CrosswordPuzzleGame.vue`** (약 2,000 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'theme-select', 'difficulty-select', 'countdown', 'playing', 'result')
- 주제 선택: `selectedTheme` ('idiom' 또는 'proverb')
- 난이도 선택: `selectedDifficulty` ('beginner', 'intermediate', 'advanced')
- 퍼즐 데이터: `currentPuzzle`, `puzzleData`
- 사용자 입력: `userAnswers`, `userEmptyInputs`
- 게임 진행: `completedWords`, `learnedWords`, `hintsUsed`
- 선택 상태: `selectedCell`, `selectedWord`
- 힌트 관리: `hintedCells`, `hintMode`
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (4단계), `currentTutorialStep`
- Toast 알림: `showToast()` 함수
- 주요 함수:
  - `loadPuzzleData()`: JSON 파일에서 데이터 로드
  - `selectTheme(theme)`: 주제 선택
  - `selectDifficulty(difficulty)`: 난이도 선택 및 카운트다운 시작
  - `loadPuzzle()`: 퍼즐 생성
  - `createSimpleCrossword(words, gridSize)`: 크로스워드 격자 생성 알고리즘
  - `handleWordInputFilter(word, event)`: 한글 입력 필터링
  - `handleWordInputKeydown(word, event)`: Enter 키 정답 제출
  - `checkWordCompletion(word)`: 단어 완료 확인
  - `useHint()`: 힌트 사용
  - `selectWordFromHint(word)`: 단어 선택 및 하이라이트

#### 데이터 파일
**`client/public/data/idioms.json`** (97개 항목)
- 사자성어 데이터
- 구조: `{ beginner: [...], intermediate: [...], advanced: [...] }`
- 각 난이도별 데이터:
  - beginner: 30개 항목 (20개 그룹, 각 6개 단어)
  - intermediate: 33개 항목 (16개 그룹, 각 8개 단어)
  - advanced: 34개 항목 (14개 그룹, 각 10개 단어)
- 각 항목: `{ id, word, hint, meaning, groups: [...] }`
- groups 배열: 해당 단어가 속한 그룹 번호들 (예: [1, 2, 5])
- 예시:
```json
{
  "id": 1,
  "word": "다익선",
  "hint": "다음이 더 나아지도록 선택한다",
  "meaning": "더 나은 것을 선택한다는 뜻",
  "groups": [1, 3, 7]
}
```

**`client/public/data/proverbs.json`** (90개 항목)
- 속담 데이터
- 구조: `{ beginner: [...], intermediate: [...], advanced: [...] }`
- 각 난이도별 데이터:
  - beginner: 30개 항목 (20개 그룹, 각 6개 단어)
  - intermediate: 30개 항목 (16개 그룹, 각 8개 단어)
  - advanced: 30개 항목 (14개 그룹, 각 10개 단어)
- 각 항목: `{ id, word, hint, meaning, groups: [...] }`
- groups 배열: 해당 단어가 속한 그룹 번호들
- 예시:
```json
{
  "id": 1,
  "word": "가는말이곱다",
  "hint": "남에게 좋은 말을 하면 나도 좋은 말을 듣는다",
  "meaning": "남에게 좋은 말을 해야 자신도 좋은 말을 듣게 된다는 속담",
  "groups": [1, 2, 4]
}
```

#### 오디오
**`client/public/audio/WayToSchool.mp3`** (바이너리)
- 배경음악 파일
- 게임 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.3 설정

---

### 4-2. 서버 (Server)

크로스워드 퍼즐은 순수 클라이언트 게임으로 별도의 서버 API가 필요하지 않습니다.
모든 데이터는 JSON 파일로 관리되며, 퍼즐 생성 알고리즘은 클라이언트에서 실행됩니다.

---

## 5. 퍼즐 생성 알고리즘

### 5-1. 그룹 기반 단어 선택

**그룹 시스템 개요**:
크로스워드 퍼즐은 100% 교차가 보장되는 단어 그룹을 미리 생성하여 사용합니다. 이를 통해 항상 안정적이고 품질 높은 퍼즐을 제공합니다.

**그룹 선택 프로세스**:
```javascript
const loadPuzzle = () => {
  // 주제와 난이도에 맞는 단어 목록 가져오기
  const wordList = puzzleData.value[selectedTheme.value][selectedDifficulty.value];

  // 난이도 설정 가져오기
  const config = difficultyConfig.value[selectedDifficulty.value];

  // 그룹 개수 계산
  const maxGroup = selectedDifficulty.value === 'beginner' ? 20
    : selectedDifficulty.value === 'intermediate' ? 16
    : 14;

  // 랜덤 그룹 선택 (1 ~ maxGroup)
  const selectedGroup = Math.floor(Math.random() * maxGroup) + 1;

  // 해당 그룹에 속한 단어들만 필터링
  const selectedWords = wordList.filter(word => word.groups.includes(selectedGroup));

  // 크로스워드 격자 생성
  const puzzle = createSimpleCrossword(selectedWords, config.gridSize);

  currentPuzzle.value = puzzle;
  initializeUserAnswers();
};
```

**그룹 구성**:
- 각 그룹은 해당 난이도의 목표 단어 수를 포함
- 모든 단어가 최소 1개 이상의 다른 단어와 교차
- 그룹 내 단어들은 서로 잘 어울리도록 선정

### 5-2. 크로스워드 생성 로직

**알고리즘 개요**:
1. 선택된 그룹의 단어들을 가져옴
2. 첫 번째 단어를 격자 중앙에 가로로 배치
3. 나머지 단어들을 순서대로 배치 시도
4. 각 단어마다 기존 단어와 교차할 수 있는 위치 찾기
5. 교차 가능한 위치가 없으면 랜덤 위치에 배치
6. 배치 실패 시 전체 재시도

**첫 번째 단어 배치**:
```javascript
// 첫 번째 단어를 가로로 중앙에 배치
const firstWord = words[0];
const row = Math.floor(gridSize / 2);
const startCol = Math.floor((gridSize - firstWord.word.length) / 2);

for (let i = 0; i < firstWord.word.length; i++) {
  grid[row][startCol + i] = firstWord.word[i];
  cells.push([row, startCol + i]);
}

placedWords.push({
  ...firstWord,
  number: 1,
  direction: "across",
  cells,
  row,
  col: startCol
});
```

**단어 배치 시도**:
```javascript
const tryPlaceWord = (word, grid, placedWords, gridSize) => {
  // 1. 교차 배치 시도
  const intersections = findIntersections(word, placedWords);

  for (const intersection of intersections) {
    const { row, col, direction } = intersection;

    if (canPlaceWord(word, row, col, direction, grid, gridSize)) {
      placeWordOnGrid(word, row, col, direction, grid);
      return { success: true, row, col, direction };
    }
  }

  // 2. 랜덤 배치 시도
  for (let attempt = 0; attempt < 100; attempt++) {
    const direction = Math.random() < 0.5 ? 'across' : 'down';
    const row = Math.floor(Math.random() * gridSize);
    const col = Math.floor(Math.random() * gridSize);

    if (canPlaceWord(word, row, col, direction, grid, gridSize)) {
      placeWordOnGrid(word, row, col, direction, grid);
      return { success: true, row, col, direction };
    }
  }

  return { success: false };
};
```

**교차점 찾기**:
```javascript
const findIntersections = (newWord, placedWords) => {
  const intersections = [];

  for (const placedWord of placedWords) {
    for (let i = 0; i < newWord.word.length; i++) {
      for (let j = 0; j < placedWord.word.length; j++) {
        // 같은 글자가 있으면 교차 가능
        if (newWord.word[i] === placedWord.word[j]) {
          const [placedRow, placedCol] = placedWord.cells[j];

          if (placedWord.direction === 'across') {
            // 기존 단어가 가로면 새 단어는 세로
            intersections.push({
              row: placedRow - i,
              col: placedCol,
              direction: 'down'
            });
          } else {
            // 기존 단어가 세로면 새 단어는 가로
            intersections.push({
              row: placedRow,
              col: placedCol - i,
              direction: 'across'
            });
          }
        }
      }
    }
  }

  return intersections;
};
```

**배치 가능 확인**:
```javascript
const canPlaceWord = (word, row, col, direction, grid, gridSize) => {
  const length = word.word.length;

  // 격자 범위 확인
  if (direction === 'across') {
    if (col + length > gridSize) return false;
  } else {
    if (row + length > gridSize) return false;
  }

  // 각 칸 확인
  for (let i = 0; i < length; i++) {
    const r = direction === 'across' ? row : row + i;
    const c = direction === 'across' ? col + i : col;

    const cellValue = grid[r][c];

    // 빈 칸이거나 같은 글자여야 함
    if (cellValue !== '' && cellValue !== word.word[i]) {
      return false;
    }
  }

  return true;
};
```

---

### 5-3. 난이도별 설정

**난이도 구성**:
```javascript
const difficultyConfig = computed(() => {
  const configs = {
    beginner: {
      targetWords: 6,
      maxHints: 3,
      gridSize: selectedTheme.value === 'idiom' ? 9 : 16,
      maxGroups: 20
    },
    intermediate: {
      targetWords: 8,
      maxHints: 5,
      gridSize: selectedTheme.value === 'idiom' ? 10 : 18,
      maxGroups: 16
    },
    advanced: {
      targetWords: 10,
      maxHints: 7,
      gridSize: selectedTheme.value === 'idiom' ? 13 : 20,
      maxGroups: 14
    }
  };

  return configs;
});
```

**격자 크기 결정**:
- 사자성어: 9×9(초급), 10×10(중급), 13×13(고급)
- 속담: 16×16(초급), 18×18(중급), 20×20(고급)

**힌트 개수 결정**:
- 초급: 3회
- 중급: 5회
- 고급: 7회

---

## 6. 입력 시스템

### 6-1. v-model 기반 양방향 바인딩

크로스워드 퍼즐은 Vue의 `v-model`을 사용하여 입력창과 데이터를 동기화합니다.

**템플릿 바인딩**:
```vue
<input
  type="text"
  v-model="userEmptyInputs[`word-${word.number}`]"
  @input="(e) => handleWordInputFilter(word, e)"
  @keydown="(e) => handleWordInputKeydown(word, e)"
  @focus="selectWordFromHint(word)"
  :maxlength="word.word.length"
  :placeholder="`${word.word.length}글자 입력`"
  class="problem-input"
  autocomplete="off"
  :disabled="completedWords.some(w => w.number === word.number)"
/>
```

**주요 특징**:
- `v-model`: 양방향 데이터 바인딩으로 자동 동기화
- `@input`: 입력 중 한글 필터링 및 글자 수 제한
- `@keydown`: Enter 키 감지하여 정답 제출
- `@focus`: 입력창 포커스 시 해당 단어 자동 선택
- `:maxlength`: 최대 글자 수 제한
- `:disabled`: 완료한 단어는 입력 비활성화

---

### 6-2. 한글 필터링

**정규식 기반 필터링**:
```javascript
const handleWordInputFilter = (word, event) => {
  const wordKey = `word-${word.number}`;
  const currentValue = userEmptyInputs.value[wordKey] || '';

  // 한글만 필터링 (/[가-힣]/)
  const chars = currentValue.split('').filter(c => /[가-힣]/.test(c));
  const wordLength = word.word.length;

  // 글자 수 제한
  const limitedString = chars.slice(0, wordLength).join('');

  // 값 업데이트
  if (currentValue !== limitedString) {
    userEmptyInputs.value[wordKey] = limitedString;
  }
};
```

**필터링 규칙**:
- 한글 완성형 문자만 허용 (`가-힣`)
- 영어, 숫자, 특수문자, 공백 자동 제거
- 설정된 글자 수를 초과하면 자동 자르기

---

### 6-3. Enter 키 제출

**정답 검증 로직**:
```javascript
const handleWordInputKeydown = (word, event) => {
  if (event.key === "Enter") {
    const wordKey = `word-${word.number}`;
    const fullWord = userEmptyInputs.value[wordKey] || '';

    // 글자 수 확인
    if (fullWord.length === word.word.length) {
      // 정답 확인
      if (fullWord === word.word) {
        // 정답 처리: 격자에 표시
        word.cells.forEach(([row, col], index) => {
          const key = `${row}-${col}`;
          userAnswers.value[key] = fullWord[index];
        });

        checkWordCompletion(word);
      } else {
        // 오답 처리: 입력 초기화
        userEmptyInputs.value[wordKey] = '';
        showToast("오답입니다 😢", "error");
      }
    }
  }
};
```

**동작 흐름**:
1. Enter 키 감지
2. 입력된 글자 수가 정답 길이와 일치하는지 확인
3. 정답이면 격자에 글자 채우고 완료 체크
4. 오답이면 입력창 비우고 오답 토스트 표시

---

## 7. 힌트 시스템

### 7-1. 힌트 모드 (직접 선택 방식)

크로스워드 퍼즐은 사용자가 직접 공개할 칸을 선택하는 힌트 시스템을 사용합니다.

**힌트 모드 활성화**:
```javascript
const activateHintMode = () => {
  const maxHints = selectedDifficulty.value === 'beginner' ? 3
    : selectedDifficulty.value === 'intermediate' ? 5
    : 7;

  if (hintsUsed.value >= maxHints) {
    showToast("힌트를 모두 사용했습니다", "warning");
    return;
  }

  if (!selectedWord.value) {
    showToast("단어를 먼저 선택해주세요", "warning");
    return;
  }

  hintMode.value = true;
  showToast("공개할 칸을 클릭하세요", "info");
};
```

**칸 클릭 시 힌트 적용**:
```javascript
const handleCellClick = (row, col) => {
  // 힌트 모드일 때
  if (hintMode.value) {
    const key = `${row}-${col}`;

    // 이미 공개된 칸인지 확인
    if (userAnswers.value[key] || hintedCells.value.some(h => h[0] === row && h[1] === col)) {
      showToast("이미 공개된 칸입니다", "warning");
      return;
    }

    // 선택한 단어의 칸인지 확인
    const isInSelectedWord = selectedWord.value?.cells.some(([r, c]) => r === row && c === col);

    if (!isInSelectedWord) {
      showToast("선택한 단어의 칸을 클릭하세요", "warning");
      return;
    }

    // 힌트 적용
    const charIndex = selectedWord.value.cells.findIndex(([r, c]) => r === row && c === col);
    userAnswers.value[key] = selectedWord.value.word[charIndex];
    hintedCells.value.push([row, col]);
    hintsUsed.value++;

    hintMode.value = false;

    const maxHints = selectedDifficulty.value === 'beginner' ? 3
      : selectedDifficulty.value === 'intermediate' ? 5
      : 7;
    showToast(`힌트를 사용했습니다! (${hintsUsed.value}/${maxHints})`, "info");
  }
  // 일반 모드일 때 - 칸 클릭으로 단어 선택
  else {
    const word = findWordByCell(row, col);
    if (word) {
      selectWordFromHint(word);
      // 해당 단어의 입력창으로 포커스 이동
      nextTick(() => {
        const input = document.querySelector(`#word-input-${word.number}`);
        if (input) input.focus();
      });
    }
  }
};
```

**힌트 시스템 특징**:
- 난이도별 힌트 횟수: 초급 3회, 중급 5회, 고급 7회
- 사용자가 직접 공개할 칸을 선택하는 방식
- 교차하는 칸을 선택하면 여러 단어에 도움
- 이미 공개된 칸이나 선택한 단어가 아닌 칸은 선택 불가

---

### 7-2. 격자 칸 클릭 기능

일반 모드에서 격자의 칸을 클릭하면 해당 칸이 속한 단어를 자동으로 선택하고 입력창으로 포커스를 이동합니다.

**단어 찾기**:
```javascript
const findWordByCell = (row, col) => {
  // 해당 칸이 속한 단어 찾기
  return currentPuzzle.value.words.find(word =>
    word.cells.some(([r, c]) => r === row && c === col)
  );
};
```

**사용자 경험 개선**:
- 격자를 직접 클릭하여 빠르게 단어 선택 가능
- 클릭 시 자동으로 해당 단어의 입력창으로 포커스 이동
- 직관적이고 편리한 인터페이스 제공

---

## 8. 디자인 시스템

### 8-1. Toss 디자인 시스템

크로스워드 퍼즐은 Toss Design System을 기반으로 한 깔끔하고 직관적인 UI를 제공합니다.

**컬러 팔레트**:
- `--toss-blue`: 메인 강조색 (#007AFF) - 버튼, 선택 강조
- `--gray-50`: 페이지 배경색 (#F9F9F9)
- `--gray-100`: 카드 배경색 (#F5F5F5)
- `--gray-200`: 테두리 색상
- `--gray-600`: 부제목 및 보조 텍스트
- `--gray-900`: 주요 텍스트
- 격자 색상:
  - 빈 칸: `#FFFFFF` (흰색)
  - 선택한 단어: `#FFF9C4` (노란색)
  - 완료한 단어: `#C8E6C9` (초록색)
  - 힌트 칸: `#E8F5E9` (연한 초록색)

**격자 셀 스타일**:
```css
.puzzle-cell {
  background: white;
  border: 1px solid #ddd;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.puzzle-cell.highlighted {
  background: #FFF9C4;
}

.puzzle-cell.completed {
  background: #C8E6C9;
}

.puzzle-cell.hinted {
  background: #E8F5E9;
  color: #2E7D32;
}
```

**타이포그래피**:
- `.toss-title2`: 24px, font-weight: 700 (헤더 제목)
- `.toss-title3`: 20px, font-weight: 700 (섹션 제목)
- `.toss-title4`: 18px, font-weight: 700 (서브 헤더)
- `.toss-body1`: 16px, font-weight: 500 (본문)
- `.toss-caption`: 14px, font-weight: 400 (보조 텍스트)
- 격자 글자: 18px, font-weight: 600
- 단어 번호: 10px, font-weight: 700

---

### 8-2. 애니메이션

**셀 하이라이트** (`cellHighlight`):
```css
@keyframes cellHighlight {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.puzzle-cell.selected {
  animation: cellHighlight 0.3s ease-out;
}
```
- 단어 선택 시 해당 칸들이 살짝 확대되는 효과

**카운트다운** (`countdown-pulse`):
```css
@keyframes countdown-pulse {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.countdown-number {
  animation: countdown-pulse 1s ease-out;
}
```
- 3, 2, 1 카운트다운 숫자 애니메이션

**완료 효과** (`completePulse`):
```css
@keyframes completePulse {
  0% { background: #C8E6C9; }
  50% { background: #A5D6A7; }
  100% { background: #C8E6C9; }
}

.puzzle-cell.just-completed {
  animation: completePulse 0.6s ease-in-out;
}
```
- 단어 완료 시 초록색 깜빡임 효과

**완성 축하 애니메이션** (confetti):
```javascript
import confetti from 'canvas-confetti';

// 모든 단어를 맞춘 경우
if (completedWords.value.length === currentPuzzle.value.words.length) {
  // confetti 효과 실행
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  });

  // 추가 confetti 효과
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
  }, 250);

  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 400);
}
```
- canvas-confetti 라이브러리를 사용한 축하 효과
- 여러 방향에서 동시에 나타나는 confetti
- 모든 단어를 맞춘 경우에만 실행

---

### 8-3. 반응형 디자인

**브레이크포인트**:
- Desktop: 1200px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .playing-content {
    flex-direction: column;  // 세로 배치
  }

  .puzzle-section {
    width: 100%;
  }

  .hints-section {
    width: 100%;
    margin-top: 20px;
  }

  .puzzle-grid {
    font-size: 14px;  // 글자 크기 축소
  }

  .problem-input {
    font-size: 14px;
  }
}
```

**Tablet (768px 이하)**:
```css
@media (max-width: 768px) {
  .puzzle-grid {
    font-size: 16px;
  }

  .difficulty-cards {
    flex-direction: column;  // 난이도 카드 세로 배치
  }
}
```

---

### 8-4. 자동 스크롤 기능

게임 화면이 전환될 때마다 자동으로 페이지 최상단으로 스크롤하여 사용자 경험을 개선합니다.

**화면 전환 시 스크롤**:
```javascript
// gameState가 변경될 때마다 자동 스크롤
watch(gameState, (newState) => {
  nextTick(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
```

**적용 시점**:
- 튜토리얼 → 주제 선택
- 주제 선택 → 난이도 선택
- 난이도 선택 → 카운트다운
- 카운트다운 → 게임 플레이
- 게임 플레이 → 결과 화면
- 결과 화면 → 주제 선택 (다시 도전)
- 결과 화면 → 게임 센터 (게임 목록으로)

**사용자 경험**:
- 화면이 바뀔 때마다 자동으로 최상단 표시
- 부드러운 스크롤 애니메이션 (`behavior: 'smooth'`)
- 모바일/태블릿에서 특히 유용

---

## 9. 환경 설정

### 9-1. 환경 변수

**클라이언트 (.env)**:
```bash
# 개발 서버 포트
VITE_PORT=5288
```

---

### 9-2. 실행 방법

**클라이언트 실행** (포트 5288):
```bash
cd client
npm install
npm run dev
```

**접속 URL**:
- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/crossword`

---

## 10. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| 두 가지 주제 | 사자성어 + 속담 | 동적 격자 크기 설정 |
| 그룹 기반 선택 | 100% 교차 보장 그룹 | 미리 검증된 단어 그룹 |
| 동적 격자 생성 | 그룹 단어 배치 | 크로스워드 알고리즘 |
| 교차점 매칭 | 가로/세로 단어 교차 | 글자 일치 검색 |
| 격자 칸 클릭 | 칸 클릭으로 단어 선택 | 포커스 자동 이동 |
| 한글 입력 필터 | 한글만 입력 허용 | 정규식 `/[가-힣]/` |
| v-model 바인딩 | 양방향 데이터 동기화 | Vue Composition API |
| Enter 제출 | Enter 키로 정답 제출 | `@keydown` 이벤트 |
| 힌트 시스템 | 난이도별 3/5/7회, 직접 선택 | 클릭 기반 인터랙션 |
| 포기 기능 | 게임 중단 및 결과 확인 | 확인 대화상자 |
| 진행률 표시 | 실시간 진행 상황 | `computed` 속성 |
| 완성 축하 애니메이션 | confetti 효과 | canvas-confetti 라이브러리 |
| 자동 스크롤 | 화면 전환 시 최상단 이동 | `window.scrollTo` |
| 튜토리얼 | 4단계 인터랙티브 가이드 | Vue Composition API |
| 배경음악 | WayToSchool.mp3 자동 재생 | Audio API, localStorage |

---

## 11. 개선 가능한 부분

- **타이머 모드**: 시간 제한을 두고 빠르게 푸는 챌린지 모드
- **힌트 세분화**: 단어 뜻 힌트, 첫 글자 힌트 등 다양한 힌트 타입
- **난이도 추가**: 하급, 최고급 등 더 세분화된 난이도
- **리더보드**: 완료 시간 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **데이터 확장**: 더 많은 사자성어와 속담 추가
- **테마 추가**: 한자어, 관용구, 고사성어 등 추가 주제
- **퍼즐 저장**: 진행 중인 퍼즐 저장 및 불러오기
- **멀티플레이**: 친구와 함께 퍼즐 풀기
- **AI 힌트**: GPT 기반 맥락적 힌트 제공
