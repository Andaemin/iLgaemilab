# 끝말잇기

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
끝말잇기는 AI와 번갈아가며 이전 단어의 마지막 글자로 시작하는 단어를 말하는 실시간 대결 게임입니다. GPT-4o-mini 기반 AI와 30초의 제한시간 내에 경쟁하며, 두음법칙을 자동으로 감지하여 다양한 답변이 가능합니다. 사용자의 단어는 국립국어원 표준국어대사전 API로 엄격히 검증되며, AI의 단어는 GPT 응답을 신뢰하여 즉시 인정됩니다.

### 1-2. 핵심 특징

#### AI 대결 시스템
- 🤖 **GPT-4o-mini 기반**: OpenAI의 GPT-4o-mini 모델을 사용하여 자연스럽고 적절한 단어 생성
- 🎭 **선공/후공 선택**: 게임 시작 전 "내가 먼저" 또는 "AI가 먼저" 선택 가능
- 🧠 **AI 전략**: AI는 일반적이고 널리 알려진 단어를 우선 선택
- 📝 **JSON 모드**: GPT API의 JSON 모드로 구조화된 응답 (단어 + 의미)
- 🔄 **AI 신뢰 시스템**: AI 단어는 국립국어원 검증 없이 GPT 응답을 신뢰하여 게임 속도 향상

#### 타이머 시스템
- ⏱️ **30초 제한시간**: 내 차례가 되면 30초 카운트다운 시작
- 🎨 **시간별 색상 변화**:
  - 20초 이상: 초록색 (안전)
  - 10-20초: 노란색 (주의)
  - 10초 미만: 빨간색 (위험)
- ⏰ **시간 초과 즉시 패배**: 타이머가 0이 되면 자동으로 AI 승리 처리
- 🔄 **턴 전환 시 리셋**: AI 턴에서는 타이머가 정지되고, 사용자 턴이 되면 30초로 리셋

#### 두음법칙 지원
- 📖 **자동 감지**: 마지막 글자가 두음법칙 적용 대상일 때 자동으로 감지
- 🔄 **가능한 변형 안내**: 화면에 "또는 X로 시작 가능" 메시지 표시
- ✅ **양방향 매칭**: 리→이, 녀→여 등 양방향으로 매칭
- 🎯 **규칙**:
  - ㄴ → ㅇ: 녀→여, 뇨→요, 뉴→유, 냐→야, 녜→예
  - ㄹ → ㅇ: 리→이, 량→양, 려→여, 련→연, 령→영, 례→예, 룡→용, 륙→육, 률→율, 륜→윤, 류→유
- 💡 **예시**:
  - "승리" → "리" 또는 "이"로 시작 가능
  - "도리" → "리본" 또는 "이본" 가능
  - "역사" → "사과" 또는 "력사" 가능

#### 검증 시스템
- 🏛️ **사용자 단어**: 국립국어원 표준국어대사전 API로 엄격 검증
- 🤖 **AI 단어**: GPT-4o-mini 응답 신뢰 (국립국어원 검증 없음)
- 📚 **단어 뜻 표시**: 정답 시 국립국어원 API 또는 GPT에서 받은 단어의 뜻을 실시간으로 표시
- 🔄 **중복 방지**: 이미 사용한 단어 목록을 관리하여 중복 사용 차단
- ✅ **검증 순서** (사용자):
  1. 한글 검증 (`/^[가-힣]+$/`)
  2. 2글자 이상 확인
  3. 중복 단어 체크
  4. 끝말잇기 규칙 (두음법칙 포함)
  5. 국립국어원 API 검증

#### 채팅 UI
- 💬 **카카오톡 스타일**: 대화형 인터페이스로 자연스러운 게임 진행
- 👤 **사용자 메시지**: 오른쪽, 파란색 버블 (`#007AFF`)
- 🤖 **AI 메시지**: 왼쪽, 흰색 버블 (`#FFFFFF`)
- 📝 **단어 + 의미**: 각 메시지에 단어와 뜻을 함께 표시
- ⏰ **타임스탬프**: 각 메시지에 전송 시간 표시
- 📜 **자동 스크롤**: 새 메시지 추가 시 자동으로 최하단으로 스크롤

#### 게임 종료 조건
- ⏰ **시간 초과**: 30초 내에 단어를 입력하지 못하면 AI 승리
- 🤖 **AI 실패**: AI가 단어를 생성하지 못하거나 규칙 위반 시 사용자 승리
- 🏳️ **포기**: "포기하기" 버튼 클릭 시 AI 승리

#### 튜토리얼 및 UX
- 📚 **5단계 튜토리얼**: 게임 규칙, 타이머 시스템, 두음법칙, 단어 인정 기준, 게임 결과 및 편의 기능을 상세하게 안내
- 🎵 **배경음악**: SuperMarioSong.mp3 자동 재생, 음소거 버튼(🔊/🔇)으로 ON/OFF 가능
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장하여 새로고침 시에도 유지
- 📜 **자동 스크롤**: 게임 상태 변경 시 화면이 자동으로 맨 위로 스크롤

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "끝말잇기" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 끝말잇기 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/word-chain`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 선공/후공 선택으로 이동 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/5, 2/5, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, ⏰, 📖, ✅, 🕹)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (4개 bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "시작" 버튼

**튜토리얼 단계**:

**1단계 - 끝말잇기란?** (🎮)
- 이전 단어의 마지막 글자로 시작하는 단어를 이어가는 게임입니다.
- 상세 안내:
  - AI와 번갈아가며 단어를 입력합니다.
  - 예시: 사과 → 과일 → 일곱 → 곱하기
  - 먼저 단어를 말하지 못하거나 시간이 초과되면 패배합니다.
  - 게임 시작 전 선공/후공을 선택할 수 있습니다.

**2단계 - 타이머 시스템** (⏰)
- 30초 안에 단어를 입력해야 합니다!
- 상세 안내:
  - 내 차례가 되면 30초의 제한시간이 주어집니다.
  - 20초 이상: 초록색 (안전) / 10~20초: 노란색 (주의)
  - 10초 미만: 빨간색 (위험) - 서두르세요!
  - 시간 초과 시 즉시 패배 처리됩니다.

**3단계 - 두음법칙 규칙** (📖)
- 단어 첫소리가 바뀌는 현상을 인정합니다.
- 상세 안내:
  - 두음법칙: 특정 자음이 단어 첫머리에서 다른 소리로 바뀌는 규칙
  - 예시: "여자(녀자)", "노동(로동)", "역사(력사)"
  - 승리 → 이발소 가능 (리→이) / 도리 → 이본 가능 (리→이)
  - 두음법칙 적용 가능할 때 화면에 안내가 표시됩니다.

**4단계 - 단어 인정 기준** (✅)
- 국립국어원 표준국어대사전 기준으로 정답을 판정합니다.
- 상세 안내:
  - 국립국어원 표준국어대사전에 등재된 단어만 인정됩니다.
  - 한글 2글자 이상의 단어만 가능합니다.
  - 이미 사용한 단어는 다시 사용할 수 없습니다.
  - 오답을 입력해도 재도전 가능하나 타이머는 계속 흐릅니다.

**5단계 - 게임 결과 및 편의 기능** (🕹)
- 게임 종료 후 다양한 통계와 편의 기능을 제공합니다.
- 상세 안내:
  - 게임 종료 시 전체 단어 수와 평균 응답 시간을 확인할 수 있습니다.
  - 사용한 단어를 클릭하면 국립국어원 사전의 뜻을 볼 수 있습니다.
  - 포기 버튼을 눌러 언제든 게임을 종료할 수 있습니다.
  - 배경음악을 끄고 켤 수 있습니다. (우측 상단 스피커 아이콘)
  - 화면 하단에 다음에 입력해야 할 글자와 두음법칙이 표시됩니다.

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 바로 선공/후공 선택으로
- "시작" 버튼 (5단계): 선공/후공 선택 화면으로

---

### 3-2. 선공/후공 선택 (Turn Selection)

**화면 구성**:
- 상단: 뒤로가기 버튼, 🔄 아이콘, "끝말잇기" 제목, "누가 먼저 시작할까요?" 부제목
- 중앙: 선택 카드
  - 2개의 선택 버튼 (카드 형태):
    - "내가 먼저" (👤 아이콘): 사용자 선공
    - "AI가 먼저" (🤖 아이콘): AI 선공

**선택 후 동작**:
- "내가 먼저" 선택: 사용자가 첫 단어 입력 → 타이머 시작
- "AI가 먼저" 선택: AI가 랜덤 단어로 시작 → 사용자 턴

선택 즉시 카운트다운 시작.

---

### 3-3. 카운트다운 (Countdown)

선공/후공 선택 후 3초 카운트다운이 시작됩니다.

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

### 3-4. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-playing-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙: "끝말잇기" 제목, 선공/후공 정보 (예: "내가 선공" 또는 "AI가 선공")
- 우측:
  - 🔊/🔇 음악 토글 버튼
  - 타이머 표시 (30초 카운트다운, 색상 변화)

**대화 영역** (conversation-area):
- 카카오톡 스타일 채팅 UI
- 사용자 메시지 (오른쪽, 파란색 버블):
  - 👤 아바타
  - 단어 (큰 글씨)
  - 의미 (작은 글씨)
  - 타임스탬프
- AI 메시지 (왼쪽, 흰색 버블):
  - 🤖 아바타
  - 단어 (큰 글씨)
  - 의미 (작은 글씨)
  - 타임스탬프
- 자동 스크롤: 새 메시지 추가 시 자동으로 하단으로 스크롤

**힌트 영역** (hint-section):
- 마지막 글자 안내:
  - 기본: "X(으)로 시작하는 단어를 입력하세요"
  - 두음법칙: "🔤 두음법칙: X(으)로도 시작 가능합니다" (파란색 배경)

**입력 영역** (input-section):
- 입력창: 플레이스홀더 "단어를 입력하세요.", Enter 키로 제출 가능
- 전송 버튼 (✈️ 아이콘): 입력이 없거나 로딩 중이면 비활성화
- "포기" 버튼: 게임 포기 및 AI 승리 처리

**게임 로직**:

**1. 사용자 턴**
```javascript
// 1. 타이머 시작
startTurnTimer(); // 30초 카운트다운

// 2. 사용자 입력 및 제출
const userWord = userInput.value.trim();

// 3. 서버에 검증 요청
const response = await axios.post('/api/word-chain/validate', {
  word: userWord,
  previousWord: lastMessage.word,
  usedWords: usedWords.value
});

// 4-1. 정답 처리
if (response.data.isValid) {
  stopTurnTimer();                    // 타이머 정지
  messages.value.push({               // 메시지 추가
    role: 'user',
    word: userWord,
    meaning: response.data.meaning
  });
  usedWords.value.push(userWord);     // 사용한 단어 기록

  // AI 턴 시작 (300ms 지연)
  setTimeout(() => startAITurn(userWord), 300);
}

// 4-2. 오답 처리
else {
  showToast(response.data.message, 'error');
  // 타이머는 계속 흐름
  userInput.value = '';
}
```

**2. AI 턴**
```javascript
// 1. 타이머 정지
stopTurnTimer();

// 2. GPT API 호출 (JSON 모드)
const response = await axios.post('/api/word-chain/ai-turn', {
  previousWord: previousWord,
  usedWords: usedWords.value
});

// 3-1. AI 성공
if (response.data.isValid && response.data.word) {
  messages.value.push({
    role: 'ai',
    word: response.data.word,
    meaning: response.data.meaning
  });
  usedWords.value.push(response.data.word);

  // 사용자 턴 시작
  startTurnTimer();
}

// 3-2. AI 실패 (사용자 승리)
else {
  gameOver.value = true;
  winner.value = 'user';
  showToast('AI가 단어를 찾지 못했습니다! 승리! 😊');
}
```

**3. 타이머 관리**
```javascript
// 타이머 시작
const startTurnTimer = () => {
  turnTimeLeft.value = 30;
  timerInterval.value = setInterval(() => {
    turnTimeLeft.value--;

    if (turnTimeLeft.value <= 0) {
      stopTurnTimer();
      handleTimeUp(); // AI 승리 처리
    }
  }, 1000);
};

// 시간 초과 처리
const handleTimeUp = () => {
  gameOver.value = true;
  winner.value = 'ai';
  gameState.value = 'result';
  showToast('시간 초과! AI 승리! 😢', 'error');
};
```

**4. 두음법칙 안내**
```javascript
// 마지막 글자
const lastChar = lastMessage.word.charAt(lastMessage.word.length - 1);

// 두음법칙 변형 확인
const variants = getDoubleConsonantVariants(lastChar);

// 안내 메시지
if (variants.length > 0) {
  `"${lastChar}" 또는 "${variants.join('", "')}"(으)로 시작하는 단어를 입력하세요`;
} else {
  `"${lastChar}"(으)로 시작하는 단어를 입력하세요`;
}
```

---

### 3-5. 결과 화면 (Result)

**화면 구성**:

**상단 헤더**:
- 🏆 아이콘 (승리) 또는 😢 아이콘 (패배)
- "게임 종료" 제목
- "결과 확인" 부제목

**결과 카드**:
- 승패 메시지:
  - 사용자 승리: "🎉 승리했습니다!"
  - AI 승리: "😢 패배했습니다."
- 게임 통계:
  - 총 단어 수: N개
  - 내가 말한 단어: N개
  - AI가 말한 단어: N개
  - 평균 응답 시간: 사용자와 AI의 평균 응답 시간(초) 표시

**사용한 단어 목록**:
- 시간 순서대로 모든 단어와 의미 표시
- 사용자 단어: 파란색
- AI 단어: 회색
- 단어 클릭 시 국립국어원 사전의 뜻을 모달로 표시
  - 뜻 조회 중 스피너 표시
  - `/api/word-chain/get-meaning` API 호출
  - 여러 뜻이 있는 경우 번호와 함께 목록으로 표시
- 힌트 텍스트: "단어를 클릭하면 뜻을 확인할 수 있습니다."

**액션 버튼** (result-actions):
- "게임 목록으로" 버튼: 게임 센터로 복귀
- "다시 도전" 버튼: 선공/후공 선택으로 돌아가기

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/WordChainGame.vue`** (1,750 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'turn-selection', 'countdown', 'playing', 'result')
- 선공/후공 선택: `selectedTurn` ('user' 또는 'ai')
- 타이머 시스템: `turnTimeLeft`, `timerInterval`
- 메시지 기록: `messages` (role, word, meaning, timestamp)
- 게임 통계: `totalWords`, `userWordsCount`, `aiWordsCount`, `usedWords`
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (4단계), `currentTutorialStep`
- Toast 알림: `showToast()` 함수
- 주요 함수:
  - `selectTurn(turn)`: 선공/후공 선택
  - `startGame()`: 게임 시작
  - `startTurnTimer()`: 타이머 시작 (30초)
  - `submitWord()`: 사용자 단어 제출
  - `startAITurn(previousWord)`: AI 턴 시작
  - `giveUp()`: 포기하기
  - `getDoubleConsonantVariants(char)`: 두음법칙 변형 확인

#### 오디오
**`client/public/audio/SuperMarioSong.mp3`** (바이너리)
- 배경음악 파일
- 게임 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.5 설정

---

### 4-2. 서버 (Server)

#### API 라우터
**`server/src/routers/wordChain.mjs`** (430 줄)
- 끝말잇기 게임 API 엔드포인트
- 주요 엔드포인트:

  **POST `/api/word-chain/validate`** (사용자 단어 검증)
  - Request Body: `{ word, previousWord, usedWords }`
  - 검증 순서:
    1. 한글 검증 (`/^[가-힣]+$/`)
    2. 2글자 이상 확인
    3. 중복 단어 체크
    4. 끝말잇기 규칙 (두음법칙 포함)
    5. 국립국어원 API 검증
  - Response: `{ isValid, message, word, meaning }`

  **POST `/api/word-chain/ai-turn`** (AI 단어 생성)
  - Request Body: `{ previousWord, usedWords }`
  - GPT-4o-mini API 호출 (JSON 모드)
  - 기본 검증 (한글, 2글자 이상, 중복, 끝말잇기 규칙)
  - 국립국어원 검증 없음 (GPT 응답 신뢰)
  - Response: `{ isValid, word, meaning }`

  **POST `/api/word-chain/get-meaning`** (단어 뜻 조회)
  - Request Body: `{ word: string }`
  - 국립국어원 API로 단어의 모든 뜻을 조회
  - Response: `{ meanings: string[] }`
  - 여러 뜻이 있는 경우 배열로 반환

- 주요 함수:
  - `extractInitials(word)`: 한글 초성 추출
  - `getDoubleConsonantVariants(char)`: 두음법칙 변형 반환
  - `isValidWordChain(lastChar, firstChar)`: 끝말잇기 규칙 검증 (두음법칙 포함)
  - `checkKoreanDictionary(word)`: 국립국어원 API 호출 및 XML 파싱

---

## 5. API 및 검증

### 5-1. 사용자 단어 검증 API

**엔드포인트**: `POST /api/word-chain/validate`

**요청 예시**:
```javascript
const response = await axios.post('http://localhost:3031/api/word-chain/validate', {
  word: '사과',
  previousWord: '과일',
  usedWords: ['과일']
});
```

**응답 예시 (정답)**:
```json
{
  "isValid": true,
  "message": "정답입니다! 🎉",
  "word": "사과",
  "meaning": "장미과의 낙엽 교목. 높이는 5~10미터이며..."
}
```

**응답 예시 (끝말잇기 규칙 위반)**:
```json
{
  "isValid": false,
  "message": "\"일\"(으)로 시작하는 단어를 입력해주세요."
}
```

**응답 예시 (끝말잇기 규칙 위반, 두음법칙 적용)**:
```json
{
  "isValid": false,
  "message": "\"리\" 또는 \"이\"(으)로 시작하는 단어를 입력해주세요."
}
```

**응답 예시 (중복 단어)**:
```json
{
  "isValid": false,
  "message": "이미 사용한 단어입니다."
}
```

**응답 예시 (사전 미등재)**:
```json
{
  "isValid": false,
  "message": "국립국어원 표준국어대사전에 등재되지 않은 단어입니다."
}
```

---

### 5-2. 단어 뜻 조회 API

**엔드포인트**: `POST /api/word-chain/get-meaning`

**요청 예시**:
```javascript
const response = await axios.post('http://localhost:3031/api/word-chain/get-meaning', {
  word: '사과'
});
```

**응답 예시 (단일 뜻)**:
```json
{
  "meanings": [
    "장미과의 낙엽 교목. 높이는 5~10미터이며, 꽃은 5월에 피고..."
  ]
}
```

**응답 예시 (다중 뜻)**:
```json
{
  "meanings": [
    "잘못이나 실수에 대하여 용서를 빔.",
    "장미과의 낙엽 교목. 높이는 5~10미터이며..."
  ]
}
```

**응답 예시 (뜻 없음)**:
```json
{
  "meanings": []
}
```

---

### 5-3. AI 단어 생성 API

**엔드포인트**: `POST /api/word-chain/ai-turn`

**요청 예시 (이전 단어 있음)**:
```javascript
const response = await axios.post('http://localhost:3031/api/word-chain/ai-turn', {
  previousWord: '사과',
  usedWords: ['과일', '사과']
});
```

**요청 예시 (게임 시작, AI 선공)**:
```javascript
const response = await axios.post('http://localhost:3031/api/word-chain/ai-turn', {
  previousWord: null,
  usedWords: []
});
```

**응답 예시 (성공)**:
```json
{
  "isValid": true,
  "word": "과일",
  "meaning": "식용하는 과실"
}
```

**응답 예시 (AI 실패)**:
```json
{
  "isValid": false,
  "message": "AI가 올바른 단어를 찾지 못했습니다."
}
```

---

### 5-4. GPT-4o-mini 프롬프트

**시스템 프롬프트**:
```
당신은 끝말잇기 게임 전문가입니다. 항상 일반적이고 널리 알려진 한국어 단어를 사용합니다. JSON 형식으로만 응답하세요.
```

**사용자 프롬프트 (이전 단어 있음)**:
```
당신은 끝말잇기 게임을 하고 있습니다.

이전 단어: "사과"
이미 사용한 단어 목록: 과일, 사과

규칙:
1. 이전 단어의 마지막 글자인 "과"(으)로 시작하는 한국어 단어를 찾으세요.
2. 두음법칙 적용: 만약 마지막 글자가 "리/니/녀/뇨/뉴" 등이면, "이/야/여/요/유" 등으로도 시작 가능합니다.
   예: "승리" → "이발" 가능, "도리" → "리본" 또는 "이본" 가능
3. 이미 사용한 단어는 절대 사용하지 마세요.
4. 2글자 이상의 한국어 단어만 가능합니다.
5. 일반적이고 널리 알려진 한국어 단어를 선택하세요.

응답 형식 (JSON):
{
  "word": "선택한 단어",
  "meaning": "단어의 간단한 뜻 (20자 이내)"
}
```

**GPT 응답 예시**:
```json
{
  "word": "과일",
  "meaning": "식용하는 과실"
}
```

**GPT API 호출 설정**:
- 모델: `gpt-4o-mini`
- Temperature: 0.8 (적당한 창의성)
- Max Tokens: 100
- Response Format: `{ type: 'json_object' }` (JSON 모드 강제)

---

### 5-5. 검증 프로세스

**사용자 단어 검증 흐름**:

```
사용자 입력 "과일"
    ↓
[클라이언트] submitWord() 호출
    ↓
[서버] POST /api/word-chain/validate 수신
    ↓
1. 한글 검증: /^[가-힣]+$/.test('과일') → ✅ 통과
    ↓
2. 2글자 이상: '과일'.length >= 2 → ✅ 통과
    ↓
3. 중복 체크: usedWords.includes('과일') → ✅ 통과 (없음)
    ↓
4. 끝말잇기 규칙:
   - 이전 단어: "사과"
   - 마지막 글자: "과"
   - 첫 글자: "과"
   - isValidWordChain('과', '과') → ✅ 통과
    ↓
5. 국립국어원 API 호출
    ↓
   - URL: https://stdict.korean.go.kr/api/search.do?key=...&q=과일&...
   - XML 응답 수신
   - CDATA 파싱
   - 정확한 매치 확인: "과일" === "과일" → ✅ 통과
    ↓
6. 응답 생성:
   {
     isValid: true,
     word: "과일",
     meaning: "식용하는 과실",
     ...
   }
    ↓
[클라이언트] 응답 수신
    ↓
7. 정답 처리:
   - stopTurnTimer()
   - messages.push({ role: 'user', word: '과일', ... })
   - usedWords.push('과일')
   - 300ms 후 AI 턴 시작
```

**AI 단어 생성 흐름**:

```
[클라이언트] startAITurn('과일') 호출
    ↓
[서버] POST /api/word-chain/ai-turn 수신
    ↓
1. GPT 프롬프트 생성:
   - 이전 단어: "과일"
   - 마지막 글자: "일"
   - 두음법칙 변형: "릴" (일 ↔ 릴)
   - 사용한 단어: ['과일']
    ↓
2. GPT-4o-mini API 호출 (JSON 모드)
    ↓
3. GPT 응답:
   {
     "word": "일곱",
     "meaning": "칠의 고유어"
   }
    ↓
4. 기본 검증:
   - 한글 검증: /^[가-힣]+$/.test('일곱') → ✅ 통과
   - 2글자 이상: '일곱'.length >= 2 → ✅ 통과
   - 중복 체크: usedWords.includes('일곱') → ✅ 통과
   - 끝말잇기 규칙: isValidWordChain('일', '일') → ✅ 통과
    ↓
5. 응답 생성 (국립국어원 검증 없음, GPT 신뢰):
   {
     isValid: true,
     word: "일곱",
     meaning: "칠의 고유어"
   }
    ↓
[클라이언트] 응답 수신
    ↓
6. AI 메시지 추가:
   - messages.push({ role: 'ai', word: '일곱', ... })
   - usedWords.push('일곱')
   - startTurnTimer() (사용자 턴 시작)
```

---

## 6. 기술 원리

### 6-1. 두음법칙 알고리즘

한국어에서 특정 자음(ㄴ, ㄹ)이 단어 첫머리에 올 때 다른 소리로 바뀌는 현상을 두음법칙이라고 합니다.

**두음법칙 규칙**:

**1. ㄴ → ㅇ (여, 요, 유, 야, 예 계열)**
```javascript
const nToYMap = {
  '녀': ['여'],  // 녀자 → 여자
  '뇨': ['요'],  // 뇨뇨 → 요요
  '뉴': ['유'],  // 뉴스 → 유스
  '냐': ['야'],  // 냐옹 → 야옹
  '녜': ['예'],  // 녜스 → 예스
  '녁': ['역'],  // 녁사 → 역사
  '년': ['연'],  // 년도 → 연도
  '렬': ['열'],  // 렬차 → 열차
  '녕': ['영'],  // 녕광 → 영광
};
```

**2. ㄹ → ㅇ (이, 양, 여, 연, 영, 예, 용, 육, 율, 윤, 유 계열)**
```javascript
const rToYMap = {
  '리': ['이'],  // 리발 → 이발
  '릴': ['일'],  // 릴곱 → 일곱
  '릭': ['익'],  // 릭명 → 익명
  '린': ['인'],  // 린간 → 인간
  '립': ['입'],  // 립구 → 입구
  '량': ['양'],  // 량심 → 양심
  '려': ['여'],  // 려자 → 여자
  '련': ['연'],  // 련락 → 연락
  '령': ['영'],  // 령역 → 영역
  '례': ['예'],  // 례의 → 예의
  '룡': ['용'],  // 룡왕 → 용왕
  '륙': ['육'],  // 륙지 → 육지
  '률': ['율'],  // 률동 → 율동
  '륜': ['윤'],  // 륜리 → 윤리
  '류': ['유'],  // 류행 → 유행
};
```

**매칭 알고리즘**:
```javascript
function isValidWordChain(lastChar, firstChar) {
  // 1. 정확히 일치하면 OK
  if (lastChar === firstChar) {
    return true;
  }

  // 2. 두음법칙 변형 확인 (정방향)
  const variants = getDoubleConsonantVariants(lastChar);
  if (variants.includes(firstChar)) {
    return true; // 예: 승리(리) → 이발(이) 가능
  }

  // 3. 두음법칙 변형 확인 (역방향)
  const reverseVariants = getDoubleConsonantVariants(firstChar);
  if (reverseVariants.includes(lastChar)) {
    return true; // 예: 승리(리) → 리본(리) 가능
  }

  return false;
}
```

**예시**:
```
1. "승리" (마지막 글자: 리)
   - 변형 가능: ["이"]
   - "이발" (첫 글자: 이) → ✅ 가능
   - "리본" (첫 글자: 리) → ✅ 가능 (역방향 매칭)

2. "도리" (마지막 글자: 리)
   - 변형 가능: ["이"]
   - "이본" (첫 글자: 이) → ✅ 가능
   - "리스" (첫 글자: 리) → ✅ 가능

3. "역사" (마지막 글자: 사)
   - 변형 가능: []
   - "사과" (첫 글자: 사) → ✅ 가능
   - "력사" → 역사이므로 사실상 같은 단어 (중복 체크에서 걸림)
```

---

### 6-2. GPT-4o-mini JSON 모드

OpenAI의 GPT-4o-mini 모델은 JSON 형식으로 응답을 강제할 수 있는 `response_format` 옵션을 제공합니다.

**JSON 모드 사용**:
```javascript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: '당신은 끝말잇기 게임 전문가입니다. 항상 일반적이고 널리 알려진 한국어 단어를 사용합니다. JSON 형식으로만 응답하세요.'
    },
    {
      role: 'user',
      content: prompt
    }
  ],
  temperature: 0.8,
  max_tokens: 100,
  response_format: { type: 'json_object' } // JSON 모드 강제
});
```

**JSON 모드 장점**:
1. **구조화된 응답**: 항상 유효한 JSON 형식으로 응답
2. **파싱 안정성**: JSON.parse() 실패 가능성 최소화
3. **일관성**: 단어와 의미를 항상 같은 구조로 반환

**응답 파싱**:
```javascript
const responseText = completion.choices[0].message.content.trim();
const aiResponse = JSON.parse(responseText);
const aiWord = aiResponse.word.trim();
const aiMeaning = aiResponse.meaning || '';
```

**예시 응답**:
```json
{
  "word": "과일",
  "meaning": "식용하는 과실"
}
```

---

### 6-3. AI 단어 신뢰 시스템

끝말잇기 게임에서 AI의 단어는 GPT 응답을 신뢰하여 국립국어원 검증을 건너뜁니다.

**이유**:
1. **게임 속도**: 국립국어원 API 호출 시간 (1-2초) 절약
2. **GPT 신뢰성**: GPT-4o-mini는 일반적인 한국어 단어를 잘 생성
3. **사용자 경험**: 사용자는 엄격 검증, AI는 빠른 응답으로 밸런스 유지

**AI 단어 검증 단계**:
```javascript
// 1. 한글 검증
if (!/^[가-힣]+$/.test(aiWord)) {
  return { isValid: false, message: 'AI가 올바른 단어를 찾지 못했습니다.' };
}

// 2. 2글자 이상 확인
if (aiWord.length < 2) {
  return { isValid: false, message: 'AI가 올바른 단어를 찾지 못했습니다.' };
}

// 3. 중복 단어 체크
if (usedWords.includes(aiWord)) {
  return { isValid: false, message: 'AI가 이미 사용한 단어를 제시했습니다.' };
}

// 4. 끝말잇기 규칙 확인 (두음법칙 포함)
if (previousWord) {
  const lastChar = previousWord.charAt(previousWord.length - 1);
  const firstChar = aiWord.charAt(0);

  if (!isValidWordChain(lastChar, firstChar)) {
    return { isValid: false, message: 'AI가 끝말잇기 규칙을 위반했습니다.' };
  }
}

// 5. 국립국어원 검증 없음 - GPT 응답 신뢰
return {
  isValid: true,
  word: aiWord,
  meaning: aiMeaning
};
```

**사용자 vs AI 검증 비교**:

| 검증 단계 | 사용자 | AI |
|----------|--------|-----|
| 한글 검증 | ✅ | ✅ |
| 2글자 이상 | ✅ | ✅ |
| 중복 단어 | ✅ | ✅ |
| 끝말잇기 규칙 | ✅ | ✅ |
| 국립국어원 API | ✅ | ❌ (신뢰) |

---

## 7. 디자인 시스템

### 7-1. Toss 디자인 시스템

끝말잇기는 Toss Design System을 기반으로 한 깔끔하고 직관적인 UI를 제공합니다.

**컬러 팔레트**:
- `--toss-blue`: 메인 강조색 (#007AFF) - 사용자 메시지, 버튼
- `--gray-50`: 페이지 배경색 (#F9F9F9)
- `--gray-100`: AI 메시지 배경색 (#F5F5F5)
- `--gray-200`: 테두리 색상
- `--gray-600`: 부제목 및 보조 텍스트
- `--gray-900`: 주요 텍스트
- `--success`: 타이머 안전 색상 (초록색)
- `--warning`: 타이머 주의 색상 (노란색)
- `--danger`: 타이머 위험 색상 (빨간색)

**메시지 버블 스타일**:
```css
/* 사용자 메시지 */
.user-message {
  background: #007AFF;
  color: white;
  border-radius: 18px 18px 4px 18px;
  padding: 12px 16px;
  max-width: 70%;
  align-self: flex-end;
}

/* AI 메시지 */
.ai-message {
  background: #FFFFFF;
  color: #333;
  border: 1px solid #E0E0E0;
  border-radius: 18px 18px 18px 4px;
  padding: 12px 16px;
  max-width: 70%;
  align-self: flex-start;
}
```

**타이포그래피**:
- `.toss-title2`: 24px, font-weight: 700 (헤더 제목)
- `.toss-title3`: 20px, font-weight: 700 (섹션 제목)
- `.toss-body1`: 16px, font-weight: 500 (본문)
- `.toss-caption`: 14px, font-weight: 400 (보조 텍스트)
- 단어 텍스트: 18px, font-weight: 600
- 의미 텍스트: 14px, font-weight: 400

---

### 7-2. 애니메이션

**메시지 나타나기** (`messageSlideIn`):
```css
@keyframes messageSlideIn {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.message-bubble {
  animation: messageSlideIn 0.3s ease-out;
}
```
- 새 메시지가 추가될 때 아래에서 위로 슬라이드
- 지속 시간: 0.3초

**타이머 깜빡임** (`timerPulse`):
```css
@keyframes timerPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.timer.danger {
  animation: timerPulse 1s infinite;
}
```
- 10초 미만일 때 타이머가 깜빡임
- 빨간색 + 굵은 글씨 + 깜빡임 효과

**선택 카드 호버** (`cardHover`):
```css
.turn-select-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```
- 선공/후공 선택 카드에 마우스 올리면 위로 올라감
- 그림자 강화

---

### 7-4. UX 개선 기능

**게임 상태 변경 시 자동 스크롤**:
```javascript
// 게임 상태가 변경될 때마다 화면 최상단으로 스크롤
watch(gameState, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
```

- 튜토리얼 단계 변경, 게임 시작, 결과 화면 등 게임 상태가 변경될 때 자동으로 스크롤
- 부드러운 애니메이션으로 사용자 경험 향상
- 모바일 환경에서 특히 유용

**단어 뜻 모달**:
- 결과 화면에서 사용한 단어를 클릭하면 모달 표시
- 국립국어원 사전의 정확한 뜻을 확인 가능
- 로딩 중에는 스피너 표시
- 여러 뜻이 있는 경우 번호와 함께 목록으로 표시

---

### 7-5. 반응형 디자인

**브레이크포인트**:
- Desktop: 1200px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .message-bubble {
    max-width: 85%;  // 메시지 버블 너비 증가
  }

  .word-text {
    font-size: 16px;  // 단어 텍스트 크기 축소
  }

  .meaning-text {
    font-size: 12px;  // 의미 텍스트 크기 축소
  }

  .input-area {
    flex-direction: column;  // 입력창과 버튼 세로 배치
  }

  .turn-select-card {
    width: 100%;  // 선택 카드 전체 너비
  }
}
```

---

## 8. 환경 설정

### 8-1. 환경 변수

**서버 (.env)**:
```bash
# OpenAI API 키 (필수)
OPENAI_API_KEY=your_openai_api_key

# 국립국어원 API 키 (필수)
KOREAN_DICT_API_KEY=3DA74579AA6FD550AAE736600C1C2FBF
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
npm run dev  # 클라이언트와 서버 동시 실행 (concurrently)
```

---

### 8-3. 접속 URL

- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/word-chain`

---

## 9. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| GPT-4o-mini AI | 자연스러운 단어 생성 | OpenAI API, JSON 모드 |
| 두음법칙 | 자동 감지 및 양방향 매칭 | `isValidWordChain()` |
| 국립국어원 검증 | 사용자 단어 엄격 검증 | XML 파싱, CDATA 처리 |
| AI 신뢰 시스템 | AI 단어는 GPT 응답 신뢰 | 국립국어원 검증 생략 |
| 타이머 시스템 | 30초 제한, 색상 변화 | `setInterval`, computed 색상 |
| 채팅 UI | 카카오톡 스타일 대화형 | Vue Composition API |
| 중복 방지 | 사용한 단어 목록 관리 | `usedWords` 배열 |
| 선공/후공 선택 | 게임 시작 전 턴 선택 | `selectedTurn` 상태 |
| 튜토리얼 | 5단계 인터랙티브 가이드 | Vue Composition API |
| 배경음악 | SuperMarioSong.mp3 자동 재생 | Audio API, localStorage |
| 자동 스크롤 | 게임 상태 변경 시 최상단 스크롤 | `watch`, `window.scrollTo` |
| 단어 뜻 조회 | 결과 화면에서 단어 클릭 시 뜻 표시 | `/api/word-chain/get-meaning` |
| 평균 응답 시간 | 사용자와 AI 응답 시간 통계 | 결과 화면 표시 |

---

## 10. 개선 가능한 부분

- **난이도 조절**: 제한시간 조절 (쉬움: 60초, 보통: 30초, 어려움: 15초)
- **AI 레벨 선택**: GPT 모델 선택 (gpt-4o-mini, gpt-4o)
- **리더보드**: 최고 연속 단어 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **힌트 시스템**: 사용자가 막혔을 때 GPT 기반 힌트 제공
- **멀티플레이**: 사람과 사람 간의 온라인 대결
- **두음법칙 확장**: 더 많은 두음법칙 규칙 추가
