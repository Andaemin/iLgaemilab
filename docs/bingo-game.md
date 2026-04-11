# 빙고 게임

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
빙고 게임은 GPT 기반 전략 AI와 대전하는 5×5 한국어 빙고 게임입니다. 과일, 동물, 음식, 직업 4가지 주제 중 하나를 선택하고, 36개 단어 중 25개를 골라 빙고판을 만들어 AI와 번갈아가며 단어를 선택합니다. 단어를 선택할 때마다 뜻이 표시되어 자연스럽게 한국어 어휘를 학습하며, 먼저 1줄을 완성하는 사람이 승리합니다.

### 1-2. 핵심 특징

#### AI 전략 시스템
- 🤖 **하이브리드 AI**: 순수 로직 기반 전략 + GPT 설명 생성
- 🎯 **점수 기반 전략**:
  - 4개 체크된 줄: 10,000점 (빙고 완성 최우선!)
  - 3개 체크된 줄: 100점
  - 대각선 가중치: 1.5배 (가로/세로보다 중요)
  - 여러 줄 교차점: 보너스 점수
  - 사용자 방어: 4개 완성한 줄 방해 (+500점)
- 🔄 **다양성**: 상위 3개 후보 중 랜덤 선택
- 💬 **GPT 설명**: 선택 이유를 자연어로 설명 (선택사항)

#### 한국어 학습 기능
- 📚 **144개 단어 데이터베이스**: 과일/동물/음식/직업 각 36개씩
- 📸 **단어 이미지 표시**: 단어 선택 시 1.5초간 해당 단어의 이미지 모달 표시
- 🎓 **학습 단어 추적**: 게임 중 선택된 모든 단어 자동 저장 (이미지 포함)
- 📖 **복습 기능**: 게임 종료 후 학습한 단어 목록과 이미지 표시
- 🎨 **시각적 학습**: 이미지 기반 학습으로 단어 기억 강화

#### 게임 시스템
- 🎲 **5×5 빙고판**: 25개 단어로 구성된 빙고판
- 🔀 **자유 배치**: 드래그앤드롭으로 단어 위치 자유 변경
- ⏱️ **턴 타이머**: 각 턴마다 20초 제한 시간
- ⏰ **게임 총 시간**: 2분 30초 (150초)
- 🏆 **승리 조건**: 2분 30초 후 더 많은 빙고를 완성한 사람이 승리
- 🎯 **실시간 빙고 카운트**: 현재 완성된 빙고 줄 수 표시
- 📸 **이미지 학습**: 단어 선택 시 해당 단어의 이미지가 표시되어 시각적 학습 지원
- 🔴 **빙고 라인 표시**: 완성된 빙고 라인이 빨간색으로 표시됨

#### 4가지 주제
- 🍎 **과일**: 사과, 바나나, 수박, 포도, 딸기, 키위 등 36개
- 🐶 **동물**: 강아지, 고양이, 토끼, 햄스터, 펭귄, 돌고래 등 36개
- 🍜 **음식**: 김치, 불고기, 갈비, 삼겹살, 비빔밥, 떡볶이 등 36개
- 💼 **직업**: 의사, 간호사, 선생님, 개발자, 디자이너, 가수 등 36개

#### 튜토리얼 및 UX
- 📚 **5단계 튜토리얼**: 게임 규칙, 주제 선택, 게임 모드 선택, 단어 선택, 게임 진행 방법 안내
- 🎵 **배경음악**: NintendoWii.mp3 자동 재생, 음소거 버튼(🔊/🔇)으로 ON/OFF 가능
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장하여 새로고침 시에도 유지
- 🎨 **Toss 디자인**: 깔끔하고 직관적인 UI/UX
- 📜 **자동 스크롤**: 게임 화면 전환 시 페이지 상단으로 자동 스크롤

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "빙고 게임" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 빙고 게임 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/bingo`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 게임 시작 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/5, 2/5, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, 📝, 🎯, 🎲, ⛳)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "게임 시작" 버튼

**튜토리얼 단계**:

**1단계 - 빙고 게임이란?** (🎮)
- AI와 함께하는 전략적인 빙고 대결!
- 상세 안내:
  - 5×5 빙고판에 25개의 한국어 단어를 배치합니다.
  - AI와 번갈아 가며 단어를 부르는 턴제 게임입니다.
  - 상대가 부른 단어가 내 빙고판에 있으면 자동으로 체크됩니다.
  - 가로, 세로, 대각선 중 한 줄을 완성하면 "빙고!" 빨간 라인으로 표시됩니다.
  - 제한 시간 2분 30초 동안 더 많은 빙고를 완성한 사람이 승리합니다.
  - 단어를 선택하면 해당 단어의 이미지가 표시되어 학습에 도움을 줍니다.

**2단계 - 주제 선택하기** (📝)
- 과일, 동물, 음식, 직업 중 선택
- 상세 안내:
  - 4가지 주제(과일, 동물, 음식, 직업) 중 하나를 선택합니다.
  - 선택한 주제의 단어들로만 게임이 진행됩니다.
  - 각 주제마다 36개 이상의 다양한 단어가 준비되어 있습니다.
  - 학습하고 싶은 어휘 분야를 선택하세요!
  - AI도 같은 주제의 단어로 빙고판을 만듭니다.

**3단계 - 게임 모드 선택하기** (🎯)
- 3빙고 또는 5빙고 모드 선택
- 상세 안내:
  - **3빙고 모드**: 빠른 게임을 원한다면! 3줄을 먼저 완성하는 사람이 승리합니다.
  - **5빙고 모드**: 전략적인 게임을 원한다면! 5줄을 먼저 완성하는 사람이 승리합니다.
  - 게임 모드에 따라 AI의 전략도 달라집니다.
  - 원하는 난이도와 플레이 스타일에 맞춰 선택하세요!
  - 선택한 모드는 게임 내내 유지됩니다.

**4단계 - 단어 선택 및 배치** (🎲)
- 25개를 골라 빙고판 만들기
- 상세 안내:
  - 주제에 맞는 단어들이 화면에 나타납니다.
  - 마음에 드는 단어 25개를 선택하세요.
  - 선택한 단어들은 파란색으로 표시됩니다.
  - "자동 선택" 버튼으로 빠르게 25개를 선택할 수 있습니다.
  - 선택 완료 후 5×5 빙고판에 자동으로 배치됩니다.
  - "재배치" 버튼으로 단어 위치를 바꿀 수 있습니다.

**5단계 - 게임 진행 방법** (⛳)
- 2분 30초 안에 더 많은 빙고를 완성하세요!
- 상세 안내:
  - 제한 시간은 총 2분 30초입니다. 시간 내에 더 많은 빙고를 완성하세요!
  - 자신의 턴에 내 빙고판에서 단어를 하나 선택합니다.
  - 선택한 단어의 이미지가 표시되어 학습할 수 있습니다.
  - 선택한 단어가 상대 빙고판에도 있다면 동시에 체크됩니다.
  - 각 턴마다 20초의 제한 시간이 있습니다.
  - 빙고 라인이 완성되면 빨간색으로 표시되고 게임은 계속 진행됩니다.
  - 2분 30초 후 더 많은 빙고를 완성한 사람이 승리합니다!

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 바로 게임 시작
- "게임 시작" 버튼 (5단계): 주제 선택 화면으로 이동

---

### 3-2. 주제 선택 (Category Selection)

**화면 구성**:
- 상단 헤더: 뒤로가기 버튼, 📝 아이콘, "주제 선택" 제목
- 부제목: "학습할 단어 주제를 선택하세요."

**주제 카드** (4개, 2×2 그리드):
- 🍎 **과일**: 사과, 바나나, 포도 등
- 🐶 **동물**: 강아지, 고양이, 사자 등
- 🍜 **음식**: 김치, 불고기, 피자 등
- 💼 **직업**: 의사, 선생님, 요리사 등

**카드 스타일**:
- 배경: 흰색
- 테두리: 3px solid var(--gray-200)
- 호버: 파란색 테두리 + 위로 4px 이동 + 그림자
- 아이콘: 64px, 중앙 정렬
- 제목: 20px, font-weight: 700
- 설명: 14px, 회색

**인터랙션**:
- 카드 클릭 시 해당 주제의 단어 데이터 로딩
- 게임 모드 선택 화면으로 자동 전환

---

### 3-3. 게임 모드 선택 (Game Mode Selection)

**화면 구성**:
- 상단 헤더: 뒤로가기 버튼, 🎯 아이콘, "게임 모드 선택" 제목
- 부제목: "빙고 목표를 선택하세요."

**모드 카드** (2개, 1×2 그리드):
- 🎯 **3빙고 모드**: 빠른 게임 (3줄 먼저 완성)
- 🏆 **5빙고 모드**: 전략 게임 (5줄 먼저 완성)

**카드 스타일**:
- 배경: 흰색
- 테두리: 3px solid var(--gray-200)
- 호버: 파란색 테두리 + 위로 4px 이동 + 그림자
- 아이콘: 64px, 중앙 정렬
- 제목: 20px, font-weight: 700
- 설명: 14px, 회색

**인터랙션**:
- 카드 클릭 시 선택한 게임 모드 저장
- 단어 선택 화면으로 자동 전환
- 페이지 상단으로 자동 스크롤

---

### 3-4. 단어 선택 (Word Selection)

**화면 구성**:
- 상단 헤더: 뒤로가기 버튼, 📝 아이콘, "단어 선택" 제목
- 선택 카운터: "N / 25 선택"
- 페이지 상단으로 자동 스크롤

**단어 선택 영역**:
1. **헤더**:
   - 제목: "N개 중 25개를 선택하세요."
   - "자동 선택" 버튼: 랜덤으로 25개 선택

2. **단어 그리드** (6열, 자동 줄바꿈):
   - 각 단어: 버튼 형태
   - 배경: 흰색 (미선택), 파란색 (선택)
   - 테두리: 2px solid var(--gray-300)
   - 최소 높이: 64px
   - 호버: 파란색 테두리 + 위로 2px 이동
   - 툴팁: 단어에 마우스 올리면 뜻 표시 (title 속성)

3. **액션 버튼**:
   - "선택 완료 (N/25)" 버튼: 25개 선택 시 활성화
   - 비활성화 시 회색 처리

**로직**:
```javascript
// 단어 선택 토글
const toggleWordSelection = (wordObj) => {
  const index = selectedWords.value.findIndex(w => w.word === wordObj.word);
  if (index > -1) {
    selectedWords.value.splice(index, 1);  // 선택 해제
  } else {
    if (selectedWords.value.length < 25) {
      selectedWords.value.push(wordObj);   // 선택 추가
    }
  }
};

// 자동 선택
const autoSelectWords = () => {
  const shuffled = [...allWords.value].sort(() => Math.random() - 0.5);
  selectedWords.value = shuffled.slice(0, 25);
};
```

---

### 3-5. 빙고판 배치 (Board Arrangement)

**화면 구성**:
- 상단 헤더: 뒤로가기 버튼, 🎲 아이콘, "빙고판 배치" 제목
- 부제목: "드래그해서 위치를 바꿀 수 있습니다."
- 페이지 상단으로 자동 스크롤

**빙고판 미리보기**:
- 5×5 그리드 (25개 셀)
- 각 셀:
  - 크기: 80px × 80px
  - 배경: 흰색
  - 테두리: 2px solid var(--gray-300)
  - 텍스트: 14px, font-weight: 600
  - 드래그 가능: `draggable="true"`
  - 호버: 배경 회색, 파란색 테두리, 확대

**드래그앤드롭**:
```javascript
// 드래그 시작
const onDragStart = (rowIndex, colIndex) => {
  draggedIndex.value = { row: rowIndex, col: colIndex };
};

// 드롭
const onDrop = (targetRow, targetCol) => {
  const sourceRow = draggedIndex.value.row;
  const sourceCol = draggedIndex.value.col;

  // 두 셀의 단어 교환
  const temp = userBingoBoard.value[sourceRow][sourceCol].word;
  userBingoBoard.value[sourceRow][sourceCol].word =
    userBingoBoard.value[targetRow][targetCol].word;
  userBingoBoard.value[targetRow][targetCol].word = temp;

  draggedIndex.value = null;
};
```

**액션 버튼**:
- "랜덤 재배치" 버튼: 단어 위치를 랜덤하게 섞기
- "배치 완료" 버튼: 카운트다운 시작

---

### 3-6. 카운트다운 (Countdown)

배치 완료 후 3초 카운트다운이 시작됩니다.

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

**AI 단어 선택**:
- 카운트다운 중 백그라운드에서 AI가 단어 25개 선택
- API 엔드포인트: `POST /api/bingo/ai-select-words`
- AI가 선택한 단어로 빙고판 생성

---

### 3-7. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-playing-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙: "빙고 게임" 제목
- 우측: 🔊/🔇 음악 토글 버튼

**빙고 정보** (bingo-info):
- 3개 항목을 가로로 배치:
  - **내 빙고**: 현재 완성한 빙고 줄 수
  - **타이머**: 게임 시간 (2분 30초) + 턴 타이머 (20초), 5초 이하 시 빨간색 + 깜빡임
  - **AI 빙고**: AI가 완성한 빙고 줄 수

**빙고판 영역** (2열 그리드):

**1. 사용자 빙고판 (왼쪽)**:
- 헤더: "내 빙고판", "N 빙고" 배지
- 5×5 빙고판:
  - 각 셀: 80px × 80px
  - 배경: 흰색 (미체크), 파란색 (체크)
  - 텍스트: 14px, font-weight: 600
  - 클릭 가능: 현재 턴이고 미체크된 셀만
  - 호버: 배경 회색, 확대
- 턴 표시: 현재 턴이면 "🟢 당신의 차례" 배지 표시 (깜빡임)
- **빙고 라인 표시**: 완성된 빙고 라인이 빨간색으로 표시됨 (SVG 오버레이)

**2. AI 빙고판 (오른쪽)**:
- 헤더: "AI 빙고판", "N 빙고" 배지
- 5×5 빙고판 (가려진 상태):
  - 미체크: "?" 표시, 회색 배경
  - 체크: 단어 표시, 파란색 배경
- 턴 표시: AI 턴이면 "🔴 AI의 차례" 배지 표시 (깜빡임)
- **빙고 라인 표시**: 완성된 빙고 라인이 빨간색으로 표시됨 (SVG 오버레이)

**게임 히스토리**:
- 제목: "최근 선택"
- 최근 5개 선택을 역순으로 표시
- 각 항목:
  - 플레이어 배지: "나" (파란색) / "AI" (회색)
  - 선택한 단어

**단어 이미지 표시 모달**:
- 단어 선택 시 1.5초간 표시
- 배경: 반투명 검은색 + 블러 효과
- 모달 카드:
  - 배경: 흰색
  - 테두리: 1px solid var(--gray-200)
  - 단어 제목: 42px, font-weight: 700, 회색
  - 이미지: 320px 높이, 자동 크기 조정
  - 플레이어 라벨: "나의 선택" / "AI의 선택", 회색 배지
- 이미지는 백엔드 API (`/api/bingo/search-image`)를 통해 가져오며 캐시됨

**게임 로직**:

**1. 사용자 턴**:
```javascript
const selectBingoWord = async (word) => {
  // 타이머 정지
  stopTurnTimer();

  // 이미지 가져오기 및 표시
  await showWordImageModal(word, 'user');

  // 양쪽 빙고판에서 단어 체크
  checkWordInBoard(userBingoBoard.value, word);
  checkWordInBoard(aiBingoBoard.value, word);

  // 학습한 단어에 추가 (이미지 URL 포함)
  learnedWords.value.push({ word, imageUrl: imageCache[word]?.imageUrl });

  // 히스토리 추가
  gameHistory.value.push({ player: 'user', word });

  // 빙고 개수 체크 및 빙고 라인 업데이트
  const userResult = getBingoLinesAndCount(userBingoBoard.value);
  const aiResult = getBingoLinesAndCount(aiBingoBoard.value);
  userBingoCount.value = userResult.count;
  aiBingoCount.value = aiResult.count;
  userBingoLines.value = userResult.lines;
  aiBingoLines.value = aiResult.lines;

  // 새로운 빙고 달성 시 애니메이션
  if (userBingoCount.value > prevUserBingoCount) {
    showBingoAnimation.value = true;
  }

  // AI 턴으로 변경
  setTimeout(() => {
    currentTurn.value = 'ai';
    aiTurn();
  }, hasBingo ? 2100 : 100);
};
```

**2. AI 턴**:
```javascript
const aiTurn = async () => {
  // 백엔드 API 호출
  const response = await fetch('http://localhost:3031/api/bingo/ai-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bingoBoard: aiBingoBoard.value,
      userBoard: userBingoBoard.value,
      userLastWord: gameHistory.value[gameHistory.value.length - 1]?.word
    })
  });

  const data = await response.json();
  const selectedWord = data.selectedWord;

  // 이미지 가져오기 및 표시
  await showWordImageModal(selectedWord, 'ai');

  // 양쪽 빙고판에서 단어 체크
  checkWordInBoard(aiBingoBoard.value, selectedWord);
  checkWordInBoard(userBingoBoard.value, selectedWord);

  // 학습한 단어에 추가 (이미지 URL 포함)
  learnedWords.value.push({ word: selectedWord, imageUrl: imageCache[selectedWord]?.imageUrl });

  // 히스토리 추가
  gameHistory.value.push({ player: 'ai', word: selectedWord });

  // 빙고 개수 체크 및 빙고 라인 업데이트
  const userResult = getBingoLinesAndCount(userBingoBoard.value);
  const aiResult = getBingoLinesAndCount(aiBingoBoard.value);
  userBingoCount.value = userResult.count;
  aiBingoCount.value = aiResult.count;
  userBingoLines.value = userResult.lines;
  aiBingoLines.value = aiResult.lines;

  // 새로운 빙고 달성 시 애니메이션
  if (aiBingoCount.value > prevAiBingoCount) {
    showBingoAnimation.value = true;
  }

  // 사용자 턴으로 변경
  setTimeout(() => {
    currentTurn.value = 'user';
    startTurnTimer();
  }, hasBingo ? 2100 : 100);
};
```

**3. 빙고 라인 체크 및 개수 세기**:
```javascript
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
```

---

### 3-8. 결과 화면 (Result)

**화면 구성**:

**상단 헤더**:
- 🏆 아이콘, "게임 종료" 제목, "결과 확인" 부제목

**결과 카드**:
1. **결과 이모지**: 🎉 (승리) / 😢 (패배) / 🤝 (무승부)
2. **결과 메시지**: "승리!" / "패배..." / "무승부"
3. **서브 메시지**:
   - 승리: "축하합니다! AI를 이겼어요!"
   - 패배: "아쉽네요. 다시 도전해보세요!"
   - 무승부: "비겼습니다. 다시 한 번!"

**통계 정보**:
- 내 빙고: N개
- AI 빙고: N개
- 총 턴 수: N턴

**학습한 단어** (오늘 학습한 단어):
- 제목: "🎓 오늘 학습한 단어"
- 설명: "게임 중 선택된 N개 단어를 복습하세요!"
- 단어 그리드 (자동 채움, 최소 너비 200px):
  - 각 단어 카드:
    - 배경: 흰색
    - 테두리: 2px solid var(--gray-200)
    - 단어 제목: 18px, font-weight: 700, 파란색
    - 이미지: 140px 높이, 자동 크기 조정
    - 호버: 파란색 테두리 + 위로 2px 이동
- 최대 높이: 300px, 스크롤 가능

**액션 버튼**:
- "다시 도전" 버튼: 게임 재시작 (주제 선택부터)
- "게임 센터로" 버튼: 게임 센터 메인으로 복귀

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/BingoGame.vue`** (약 2,066 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'category-select', 'word-select', 'board-arrange', 'countdown', 'playing', 'result')
- 주요 데이터:
  - `allWords`: 현재 카테고리의 전체 단어 (객체 배열)
  - `selectedWords`: 사용자가 선택한 25개 단어 객체
  - `userBingoBoard`: 사용자 5×5 빙고판
  - `aiBingoBoard`: AI 5×5 빙고판
  - `currentTurn`: 현재 턴 ('user' or 'ai')
  - `userBingoLines`: 사용자의 완성된 빙고 라인 배열
  - `aiBingoLines`: AI의 완성된 빙고 라인 배열
  - `learnedWords`: 게임 중 학습한 단어 (이미지 URL 포함)
  - `showWordImage`: 단어 이미지 모달 표시 여부
  - `imageCache`: 단어별 이미지 캐시
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (5단계), `currentTutorialStep`
- 게임 모드: `gameMode` ('3빙고' or '5빙고')
- 주요 함수:
  - `loadWordsData(category)`: 카테고리별 단어 데이터 로딩
  - `toggleWordSelection(wordObj)`: 단어 선택/해제
  - `autoSelectWords()`: 랜덤 25개 자동 선택
  - `createBingoBoard(wordObjs)`: 단어 객체 배열로 빙고판 생성
  - `shuffleBingoBoard()`: 빙고판 랜덤 재배치
  - `selectBingoWord(word)`: 사용자 단어 선택
  - `aiTurn()`: AI 턴 처리
  - `fetchWordImage(word)`: 단어 이미지 가져오기 (캐시 사용)
  - `showWordImageModal(word, player)`: 단어 이미지 모달 표시
  - `getBingoLinesAndCount(board)`: 빙고 라인과 개수 반환
  - `getLineCoords(line)`: 빙고 라인의 SVG 좌표 계산
  - `startTurnTimer()`: 턴 타이머 시작 (20초)
  - `startGameTimer()`: 게임 타이머 시작 (2분 30초)
  - `endGameByTime()`: 시간 종료로 게임 종료
  - `endGame(result)`: 게임 종료

#### 데이터
**`client/public/data/bingoWords.json`** (156 줄)
- 4가지 카테고리별 단어 데이터 (각 36개씩, 총 144개)
- JSON 구조:
  ```json
  {
    "categories": {
      "과일": [
        { "word": "사과", "meaning": "빨갛거나 초록색인 둥근 과일로..." },
        ...
      ],
      "동물": [...],
      "음식": [...],
      "직업": [...]
    }
  }
  ```
- 각 단어 객체:
  - `word`: 단어 (예: "사과")
  - `meaning`: 한국어 뜻 (예: "빨갛거나 초록색인...")

#### 오디오
**`client/public/audio/NintendoWii.mp3`** (바이너리)
- 배경음악 파일
- 게임 플레이 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.5 설정
- 게임 종료 시 자동 정지

---

### 4-2. 서버 (Server)

#### API 라우터
**`server/src/routers/bingo.mjs`** (517 줄)
- 빙고 게임 API 엔드포인트
- 주요 엔드포인트:

  **POST `/api/bingo/ai-select-words`**
  - AI가 50개 단어 중 25개를 전략적으로 선택
  - Request Body: `{ words: string[] }` (50개 단어 배열)
  - Response: `{ selectedWords: string[] }` (AI가 선택한 25개 단어)
  - GPT-4o-mini 사용, temperature: 0.8 (다양성)
  - 선택 기준:
    - 다양한 카테고리의 단어를 골고루 선택
    - 자주 사용되는 일반적인 단어 우선 선택
    - 다양한 길이의 단어 선택
    - 서로 연관성 있는 단어들 함께 선택

  **POST `/api/bingo/ai-turn`**
  - AI가 전략적으로 다음 단어를 선택 (하이브리드 방식)
  - Request Body:
    ```json
    {
      "bingoBoard": Array<Array<{word, meaning, checked}>>,
      "userBoard": Array<Array<{word, meaning, checked}>>,
      "userLastWord": string
    }
    ```
  - Response: `{ selectedWord: string, reasoning: string }`

  **POST `/api/bingo/search-image`**
  - 단어에 해당하는 이미지 검색
  - Request Body: `{ word: string, category: string }`
  - Response: `{ imageUrl: string, fallback: boolean }`
  - 하이브리드 전략:
    1. 순수 로직 (`selectBestWordLogic`)으로 최적 단어 선택
    2. GPT는 선택 이유만 생성 (선택사항)
  - 점수 시스템:
    - 4개 체크된 줄: 10,000점 (빙고 완성 최우선)
    - 3개 체크된 줄: 100점
    - 대각선 가중치: 1.5배
    - 여러 줄 교차점: 보너스 점수
    - 사용자 방어: 4개 완성한 줄 방해 (+500점)
  - 상위 3개 후보 중 랜덤 선택 (다양성)

- 주요 함수:
  - `analyzeBingoBoard(board)`: 빙고판 분석 (가로/세로/대각선 완성도)
  - `selectBestWordLogic(bingoBoard, userBoard)`: 순수 로직 기반 최적 단어 선택
  - `getWordStrategicInfo(bingoBoard, word)`: 특정 단어의 전략적 정보 반환
  - `formatBingoBoardForGPT(board)`: GPT를 위한 빙고판 포맷팅 (사용하지 않음)

---

## 5. API 및 검증

### 5-1. 클라이언트 → 서버 API 호출

#### AI 단어 선택 API

**엔드포인트**: `POST /api/bingo/ai-select-words`

**요청 예시**:
```javascript
const response = await fetch('http://localhost:3031/api/bingo/ai-select-words', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    words: allWords.value.map(w => w.word)  // 단어 문자열 배열만 전송
  })
});
```

**응답 예시**:
```json
{
  "selectedWords": [
    "사과", "바나나", "수박", "포도", "딸기",
    "키위", "망고", "복숭아", "체리", "자두",
    "배", "감", "귤", "오렌지", "레몬",
    "메론", "참외", "살구", "석류", "무화과",
    "용과", "두리안", "파인애플", "코코넛", "아보카도"
  ]
}
```

---

#### AI 턴 API

**엔드포인트**: `POST /api/bingo/ai-turn`

**요청 예시**:
```javascript
const response = await fetch('http://localhost:3031/api/bingo/ai-turn', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bingoBoard: aiBingoBoard.value,  // AI의 5×5 빙고판
    userBoard: userBingoBoard.value,  // 사용자의 5×5 빙고판
    userLastWord: gameHistory.value[gameHistory.value.length - 1]?.word
  })
});
```

**응답 예시**:
```json
{
  "selectedWord": "사과",
  "reasoning": "가로 3번줄(4/5)과 세로 2번줄(3/5)의 교차점, 2줄 동시 공략"
}
```

---

### 5-2. AI 전략 알고리즘

#### 점수 계산 시스템

```javascript
function selectBestWordLogic(bingoBoard, userBoard) {
  const wordScores = {};

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = bingoBoard[i][j];
      if (cell.checked) continue;

      let score = 0;
      let lineCount = 0;

      // 가로줄 점수
      const rowChecked = bingoBoard[i].filter(c => c.checked).length;
      if (rowChecked === 4) score += 10000;      // 빙고 완성 가능!
      else if (rowChecked === 3) score += 100;
      else if (rowChecked === 2) score += 20;
      else if (rowChecked === 1) score += 5;
      lineCount++;

      // 세로줄 점수
      const colChecked = bingoBoard.filter(row => row[j].checked).length;
      if (colChecked === 4) score += 10000;
      else if (colChecked === 3) score += 100;
      else if (colChecked === 2) score += 20;
      else if (colChecked === 1) score += 5;
      lineCount++;

      // 주 대각선 (i === j)
      if (i === j) {
        const diag1Checked = bingoBoard.filter((row, idx) => row[idx].checked).length;
        if (diag1Checked === 4) score += 15000;  // 대각선은 1.5배
        else if (diag1Checked === 3) score += 150;
        else if (diag1Checked === 2) score += 30;
        else if (diag1Checked === 1) score += 10;
        lineCount++;
      }

      // 반 대각선 (i + j === 4)
      if (i + j === 4) {
        const diag2Checked = bingoBoard.filter((row, idx) => row[4 - idx].checked).length;
        if (diag2Checked === 4) score += 15000;
        else if (diag2Checked === 3) score += 150;
        else if (diag2Checked === 2) score += 30;
        else if (diag2Checked === 1) score += 10;
        lineCount++;
      }

      // 여러 줄 교차점 보너스
      if (lineCount >= 3) score += 50;
      else if (lineCount >= 2) score += 20;

      // 방어 점수 (사용자가 4개 완성한 줄 방해)
      if (userBoard) {
        const userCell = userBoard[i][j];
        if (userCell && !userCell.checked) {
          const userRowChecked = userBoard[i].filter(c => c.checked).length;
          const userColChecked = userBoard.filter(row => row[j].checked).length;
          if (userRowChecked === 4 || userColChecked === 4) {
            score += 500;  // 사용자 빙고 방어
          }
        }
      }

      wordScores[cell.word] = score;
    }
  }

  // 점수가 가장 높은 단어 선택
  const sortedWords = Object.entries(wordScores).sort(([, a], [, b]) => b - a);

  // 상위 3개 중 랜덤 선택 (다양성)
  const topWords = sortedWords.slice(0, Math.min(3, sortedWords.length));
  const randomIndex = Math.floor(Math.random() * topWords.length);

  return topWords[randomIndex][0];
}
```

---

## 6. 기술 원리

### 6-1. Fisher-Yates 셔플 알고리즘

빙고판 생성 시 단어를 랜덤하게 섞기 위해 사용합니다.

**알고리즘**:
```javascript
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
```

**원리**:
1. 배열 복사 (`[...wordObjs]`)
2. `Array.prototype.sort()`에 랜덤 비교 함수 전달
3. `Math.random() - 0.5`는 -0.5 ~ 0.5 범위의 난수 생성
4. 음수면 순서 유지, 양수면 순서 교체
5. 결과적으로 배열이 랜덤하게 섞임

---

### 6-2. 빙고 판정 알고리즘

가로, 세로, 대각선을 모두 체크하여 빙고 줄 수를 계산합니다.

**알고리즘**:
```javascript
const countBingo = (board) => {
  let count = 0;

  // 가로 체크 (5개 줄)
  for (let i = 0; i < 5; i++) {
    if (board[i].every(cell => cell.checked)) count++;
  }

  // 세로 체크 (5개 줄)
  for (let j = 0; j < 5; j++) {
    if (board.every(row => row[j].checked)) count++;
  }

  // 대각선 체크 (왼쪽 위 → 오른쪽 아래)
  if (board.every((row, i) => row[i].checked)) count++;

  // 대각선 체크 (오른쪽 위 → 왼쪽 아래)
  if (board.every((row, i) => row[4 - i].checked)) count++;

  return count;
};
```

**최대 빙고 줄 수**: 12개
- 가로: 5개
- 세로: 5개
- 대각선: 2개

---

### 6-3. 드래그앤드롭

HTML5 Drag and Drop API를 사용하여 빙고판 단어 위치 변경을 구현합니다.

**구현**:
```javascript
// 드래그 시작
const onDragStart = (rowIndex, colIndex) => {
  draggedIndex.value = { row: rowIndex, col: colIndex };
};

// 드래그 오버 (드롭 허용)
const onDragOver = (event) => {
  event.preventDefault();  // 드롭 허용
};

// 드롭
const onDrop = (targetRow, targetCol) => {
  if (draggedIndex.value === null) return;

  const sourceRow = draggedIndex.value.row;
  const sourceCol = draggedIndex.value.col;

  // 두 셀의 단어 교환
  const temp = userBingoBoard.value[sourceRow][sourceCol].word;
  userBingoBoard.value[sourceRow][sourceCol].word =
    userBingoBoard.value[targetRow][targetCol].word;
  userBingoBoard.value[targetRow][targetCol].word = temp;

  // 뜻도 함께 교환
  const tempMeaning = userBingoBoard.value[sourceRow][sourceCol].meaning;
  userBingoBoard.value[sourceRow][sourceCol].meaning =
    userBingoBoard.value[targetRow][targetCol].meaning;
  userBingoBoard.value[targetRow][targetCol].meaning = tempMeaning;

  draggedIndex.value = null;
};

// 드래그 종료
const onDragEnd = () => {
  draggedIndex.value = null;
};
```

---

## 7. 디자인 시스템

### 7-1. Toss 디자인 시스템

빙고 게임은 Toss Design System을 기반으로 한 깔끔하고 직관적인 UI를 제공합니다.

**컬러 팔레트**:
- `--toss-blue`: 메인 강조색 (버튼, 선택된 단어)
- `--gray-50`: 페이지 배경색 (#F9F9F9)
- `--gray-100`: 연한 회색 배경
- `--gray-200`: 테두리 색상
- `--gray-600`: 부제목 및 보조 텍스트
- `--gray-700`: 본문 텍스트
- `--gray-800`: 주요 텍스트
- `--gray-900`: 강조 텍스트

**타이포그래피**:
- `.toss-title2`: 24px, font-weight: 700 (헤더 제목)
- `.toss-title3`: 20px, font-weight: 700 (섹션 제목)
- `.toss-title4`: 18px, font-weight: 600 (카드 제목)
- `.toss-body1`: 16px, font-weight: 500 (본문)
- `.toss-caption`: 14px, font-weight: 400 (보조 텍스트)

**Border Radius**:
- `--radius-lg`: 12px (카드, 버튼)
- `--radius-md`: 8px (입력창, 작은 카드)
- `--radius-xl`: 24px (큰 카드)

**Shadow**:
- `--shadow-sm`: 작은 그림자 (카드)
- `--shadow-md`: 중간 그림자 (모달)

---

### 7-2. 애니메이션

**카운트다운 애니메이션**:
```css
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
```

**턴 표시 깜빡임**:
```css
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
```

**단어 뜻 모달 나타나기**:
```css
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
```

---

### 7-3. 반응형 디자인

**브레이크포인트**:
- Desktop: 1200px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Tablet (768px 이하)**:
```css
@media (max-width: 768px) {
  .bingo-boards-container {
    grid-template-columns: 1fr;  /* 빙고판 세로 배치 */
  }

  .bingo-cell {
    width: 60px;
    height: 60px;
    font-size: 12px;
  }
}
```

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .bingo-cell {
    width: 50px;
    height: 50px;
    font-size: 11px;
  }

  .words-grid-5x10 {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
```

---

## 8. 환경 설정

### 8-1. 환경 변수

**서버 (.env)**:
```bash
# OpenAI API 키
OPENAI_API_KEY=your_openai_api_key
```

**클라이언트 (.env)**:
```bash
# 서버 API URL
VITE_API_URL=http://localhost:3031
```

---

### 8-2. 실행 방법

**클라이언트 실행** (포트 5288):
```bash
cd client
npm install
npm run dev
```

**서버 실행** (포트 3031):
```bash
cd server
npm install
npm run dev
```

**전체 실행** (루트 디렉토리):
```bash
npm run dev  # 클라이언트와 서버 동시 실행
```

---

### 8-3. 접속 URL

- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/bingo`

---

## 9. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| AI 전략 | 순수 로직 기반 전략 | 점수 시스템, 상위 3개 중 랜덤 선택 |
| 한국어 학습 | 단어 선택 시 이미지 표시 | 모달, 1.5초 타이머, 이미지 캐시 |
| 학습 단어 추적 | 게임 중 선택된 단어 저장 | Vue Reactive Array (이미지 URL 포함) |
| 복습 기능 | 결과 화면에서 단어 복습 | 그리드 레이아웃, 스크롤 |
| 빙고 판정 | 가로/세로/대각선 체크 | `Array.every()`, 라인 정보 저장 |
| 빙고 라인 표시 | 완성된 빙고 라인 표시 | SVG 오버레이, 빨간색 라인 |
| 드래그앤드롭 | 단어 위치 변경 | HTML5 Drag and Drop API |
| 랜덤 셔플 | 빙고판 랜덤 생성 | Fisher-Yates 셔플 |
| 턴 타이머 | 20초 제한 시간 | `setInterval`, `clearInterval` |
| 게임 타이머 | 2분 30초 총 시간 | `setInterval`, `clearInterval` |
| 시간 종료 승부 | 더 많은 빙고로 승패 결정 | 타이머 종료 시 빙고 개수 비교 |
| 게임 모드 선택 | 3빙고/5빙고 선택 | Vue Reactive Data |
| 튜토리얼 | 5단계 가이드 | Vue Composition API |
| 배경음악 | NintendoWii.mp3 재생 | Audio API, localStorage |
| 자동 스크롤 | 화면 전환 시 상단 이동 | `window.scrollTo(0, 0)` |

---

## 10. 애니메이션 및 UX 개선 사항

### 10-1. 화면 전환 시 자동 스크롤
모든 게임 화면 전환 시 페이지 상단으로 자동 스크롤되어 사용자가 항상 화면의 시작 부분을 볼 수 있습니다.

**구현**:
```javascript
// 화면 전환 시 자동 스크롤
const changeGameState = (newState) => {
  gameState.value = newState;
  window.scrollTo(0, 0);  // 페이지 상단으로 이동
};
```

**적용 화면**:
- 튜토리얼 → 주제 선택
- 주제 선택 → 게임 모드 선택
- 게임 모드 선택 → 단어 선택
- 단어 선택 → 빙고판 배치
- 빙고판 배치 → 카운트다운
- 카운트다운 → 게임 플레이
- 게임 플레이 → 결과 화면

### 10-2. 부드러운 화면 전환
모든 상태 변경 시 부드러운 페이드 인/아웃 효과가 적용됩니다.

**CSS 애니메이션**:
```css
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
```

### 10-3. 호버 효과 개선
모든 인터랙티브 요소에 일관된 호버 효과가 적용됩니다.

**공통 호버 효과**:
- 카드/버튼: 위로 2-4px 이동 + 그림자 강화
- 테두리 색상 변경 (회색 → 파란색)
- 배경 색상 변화 (미세한 밝기 조정)
- 커서 변경 (`cursor: pointer`)

### 10-4. 로딩 상태 표시
API 호출 중 로딩 인디케이터가 표시되어 사용자에게 진행 상황을 알립니다.

**로딩 인디케이터**:
- AI 단어 선택 중
- AI 턴 진행 중
- 이미지 로딩 중

### 10-5. 반응형 레이아웃
모바일, 태블릿, 데스크탑 환경에 최적화된 레이아웃을 제공합니다.

**브레이크포인트**:
- Desktop (1200px+): 기본 레이아웃
- Tablet (768px 이하): 빙고판 세로 배치
- Mobile (480px 이하): 컴팩트한 UI

---

## 11. 개선 가능한 부분

- **난이도 조절**: 3×3, 4×4, 5×5 빙고판 크기 선택
- **멀티플레이**: 온라인 대전 모드 (Socket.io)
- **단어장 저장**: 학습한 단어를 개인 단어장에 저장
- **복습 모드**: 저장된 단어들만으로 빙고 게임
- **리더보드**: 최고 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **추가 주제**: 감정, 색깔, 장소, 날씨 등 더 많은 주제
- **AI 난이도**: 쉬움/보통/어려움 난이도 선택
- **음성 지원**: 단어 발음 듣기 기능
- **애니메이션 개선**: 빙고 완성 시 축하 애니메이션
