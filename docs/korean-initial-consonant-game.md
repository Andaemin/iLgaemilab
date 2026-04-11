# 초성게임

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
초성게임은 주어진 초성(ㅅㅂ, ㄱㅇㅇ 등)을 보고 2글자 한국어 단어를 맞추는 한국어 어휘 학습 게임입니다. 60초의 제한 시간 내에 최대한 많은 단어를 맞춰 점수를 획득하며, 모든 답변은 국립국어원 표준국어대사전 API를 통해 공식적으로 검증됩니다.

### 1-2. 핵심 특징

#### 타임어택 시스템
- ⏱️ **60초 제한시간**: 게임 시작 시 60초가 주어지며, 시간이 다 되면 자동으로 게임 종료
- 🎯 **정답 시 일시정지**: 정답을 맞추면 타이머가 2초간 정지되어 사용자가 단어의 뜻을 확인할 수 있는 시간 제공
- 🔴 **시간 경고**: 시간이 10초 이하로 남으면 빨간색 경고 + 깜빡임 애니메이션
- 🔄 **재개 시스템**: 다음 문제로 넘어가면 타이머가 다시 작동

#### 검증 시스템
- 🏛️ **국립국어원 표준국어대사전**: 모든 사용자 답변은 국립국어원 공식 API를 통해 검증
- ✅ **정확한 매치만 인정**: XML 응답에서 CDATA 섹션을 파싱하여 정확히 일치하는 단어만 정답 처리
- 📚 **단어 뜻 제공**: 정답 시 국립국어원 API에서 받은 단어의 뜻을 실시간으로 표시
- 🔤 **초성 매칭**: Unicode 기반 초성 추출 알고리즘으로 입력 단어의 초성이 문제와 일치하는지 확인

#### 다답 허용 시스템
- 🎯 **같은 초성의 모든 단어 정답**: CSV 데이터에 같은 초성을 가진 단어들이 미리 제시되어 있어 다양한 답변 가능
- 📊 **CSV 데이터 활용**: 5,966개의 한국어 단어 데이터베이스에서 2글자 단어를 랜덤 선택
- 🔄 **예시 제공**: 같은 초성을 가진 단어들(최대 10개)을 `possibleAnswers`에 저장하여 게임 로직에 활용

#### 점수 및 피드백
- 🏆 **점수 시스템**: 정답 1개당 10점 획득
- 🔥 **콤보 시스템**:
  - 연속으로 정답을 맞추면 콤보가 누적됩니다
  - 콤보가 5 이상일 때 콤보 × 2점의 보너스를 받습니다
  - 오답이나 문제를 건너뛰면 콤보가 초기화됩니다
  - 최대 콤보는 결과 화면에서 확인 가능합니다
- 💬 **즉시 피드백**:
  - 정답: "정답입니다 😊" + 단어 뜻 표시
  - 오답: "오답입니다 😢" + 오류 메시지
  - 초성 불일치: "초성이 맞지 않습니다. (입력: ㅅㅂ, 정답: ㄱㄱ)"
  - 사전 미등재: "국립국어원 표준국어대사전에 등재되지 않은 단어입니다."
- 📊 **최근 답변 기록**: 최근 5개 답변을 화면에 표시하여 게임 진행 상황 확인 가능
- 🎨 **점수 애니메이션**: 정답 시 점수가 튀어오르는 애니메이션 효과 (`scorePop`)

#### 튜토리얼 및 UX
- 📚 **4단계 튜토리얼**: 게임 규칙, 타이머 시스템, 점수 보상, 단어 인정 기준을 상세하게 안내
- 🎵 **배경음악**: IcecreamSong.mp3 자동 재생, 음소거 버튼(🔊/🔇)으로 ON/OFF 가능
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장하여 새로고침 시에도 유지
- 📜 **자동 스크롤**: 게임 상태가 변경될 때마다 화면이 자동으로 맨 위로 스크롤되어 사용자가 항상 중요한 정보를 놓치지 않음
  - 구현: `watch(gameState, () => { window.scrollTo({ top: 0, behavior: 'smooth' }); })`

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "초성게임" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 초성게임 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/initial-consonant`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 게임 시작 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/4, 2/4, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, ⏰, 🏆, ✅)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (4개 bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "게임 시작" 버튼

**튜토리얼 단계**:

**1단계 - 초성게임이란?** (🎮)
- 제시되는 초성을 보고 2글자 한국어 단어를 맞추는 게임입니다.
- 상세 안내:
  - 화면에 표시되는 초성(자음)을 확인하세요.
  - 예시: ㅎㄱ → 한국 / ㅅㄱ → 사과
  - 반드시 2글자 단어만 입력해주세요.
  - 제한 시간 내에 최대한 많은 단어를 맞춰보세요.

**2단계 - 타이머 시스템** (⏰)
- 60초 안에 최대한 많은 단어를 맞춰보세요!
- 상세 안내:
  - 게임 시작 시 60초의 제한 시간이 주어집니다.
  - 정답을 맞추면 타이머가 2초간 일시정지됩니다.
  - 다음 문제로 넘어가면 타이머가 다시 작동합니다.
  - 시간이 10초 이하로 남으면 빨간색 경고가 나타납니다.

**3단계 - 점수 및 보상** (🏆)
- 정답을 맞출 때마다 점수를 획득합니다.
- 상세 안내:
  - 정답 1개당 10점을 획득합니다.
  - 연속으로 정답을 맞추면 콤보가 누적됩니다.
  - 콤보가 5 이상일 때 콤보 × 2점의 보너스를 받습니다.
  - 오답이나 문제를 건너뛰면 콤보가 초기화됩니다.
  - 최종 점수와 정답률, 최대 콤보를 결과 화면에서 확인하세요.

**4단계 - 단어 인정 기준** (✅)
- 국립국어원 표준국어대사전 기준으로 정답을 판정합니다.
- 상세 안내:
  - 국립국어원 표준국어대사전에 등재된 단어만 인정됩니다.
  - 초성이 일치해도 사전에 없는 단어는 오답 처리됩니다.
  - 한글만 입력 가능하며, 띄어쓰기 없이 입력해주세요.
  - 오답을 입력해도 재도전 가능하나 타이머는 계속 흐릅니다.

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 바로 게임 시작
- "게임 시작" 버튼 (4단계): 카운트다운 시작

---

### 3-2. 카운트다운 (Countdown)

튜토리얼이 끝나면 3초 카운트다운이 시작됩니다.

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

### 3-3. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙 좌측: 🎯 아이콘, "초성게임" 제목, "N개 답변" 부제목
- 중앙: ⏸️ 일시정지 배지 (정답 시에만 표시, 깜빡임 애니메이션)
- 우측:
  - 🔊/🔇 음악 토글 버튼
  - 점수 표시 (정답 시 `scorePop` 애니메이션)
  - 시간 표시 (10초 이하 시 빨간색 + `pulse-warning` 애니메이션)
  - 콤보 표시 (콤보 2 이상일 때만 표시, 🔥 아이콘)

**문제 영역** (question-section):
- 레이블: "초성" (작은 회색 텍스트)
- 초성 표시: 큰 글씨로 중앙 정렬 (예: "ㅅ ㅂ" - 글자 사이 간격 8px)
- 힌트: "국립국어원 표준국어대사전에 등재된 2글자 단어를 입력하세요."

**답변 입력 영역** (answer-input-area):
- 입력창: 플레이스홀더 "정답을 입력하세요.", Enter 키로 제출 가능
- "제출" 버튼: 답변이 없으면 비활성화
- "넘어가기" 버튼: 현재 문제를 건너뛰고 다음 문제로

**최근 답변 기록** (history-section):
- 제목: "최근 답변"
- 최근 5개 답변을 역순으로 표시
- 각 항목:
  - 초성 → 사용자 답변 → 아이콘 (✅/❌/⏭️)
  - 정답: 녹색 배경 + 단어 뜻 표시
  - 오답: 빨간색 배경 + 오류 메시지
  - 건너뜀: 회색 배경

**게임 로직**:

**1. 문제 생성** (`generateNewQuestion`)
- CSV 데이터에서 2글자 단어 필터링
- 랜덤하게 하나 선택하여 초성 추출
- 같은 초성을 가진 단어들을 `possibleAnswers`에 저장 (최대 10개)
- 초성을 "ㅅ ㅂ" 형식으로 포맷팅 (`formattedInitials`)

**2. 답변 제출** (`submitAnswer`)
```javascript
// 1. 빈 답변 체크
if (!userAnswer.value.trim() || isLoading.value) return;

// 2. 서버에 검증 요청
const result = await validateAnswerWithNaver(
  userAnswer.value.trim(),
  currentQuestion.value.initials
);

// 3. 정답 처리
if (result.isValid) {
  pauseTimer();           // 타이머 일시정지
  score.value += 10;      // 점수 추가
  comboCount.value++;     // 콤보 증가
  maxCombo.value = Math.max(maxCombo.value, comboCount.value);

  // 콤보 보너스 (5 이상일 때)
  if (comboCount.value >= 5) {
    score.value += comboCount.value * 2;
  }

  showToast('정답입니다 😊', 'success');

  // 2초 후 다음 문제
  setTimeout(async () => {
    await generateNewQuestion();
    resumeTimer();        // 타이머 재개
  }, 2000);
}

// 4. 오답 처리
else {
  comboCount.value = 0;   // 콤보 초기화
  showToast('오답입니다 😢', 'error');
  // 타이머는 계속 흐름
  userAnswer.value = '';  // 입력창 초기화
}
```

**3. 타이머 관리**
- `startTimer()`: 1초마다 `timeLeft` 감소
- `pauseTimer()`: `isTimerPaused = true` 설정
- `resumeTimer()`: `isTimerPaused = false` 설정
- 시간이 0이 되면 `endGame()` 호출

**4. 문제 넘어가기** (`skipQuestion`)
- 현재 문제를 "건너뜀"으로 기록
- 콤보 초기화
- 타이머 일시정지 후 500ms 후 다음 문제
- 타이머 재개

---

### 3-4. 결과 화면 (Result)

**화면 구성**:

**상단 헤더**:
- 🏆 아이콘, "게임 종료" 제목, "결과 확인" 부제목

**최종 점수 영역** (final-score):
- 점수 원형 배지: 파란색 테두리, 중앙에 점수 표시 (예: "150점")
- 평가 메시지:
  - 정답률 80% 이상: "🎉 훌륭해요!"
  - 정답률 60-80%: "👍 잘했어요!"
  - 정답률 40-60%: "💪 괜찮아요!"
  - 정답률 40% 미만: "😊 다시 도전!"
- 애니메이션: `scoreAppear` (원형 배지가 튀어나옴)

**통계 영역** (result-stats):
- 4개 통계 항목을 가로로 배치:
  - 정답 수: 정답 개수
  - 오답 수: 오답 개수
  - 정답률: 백분율 표시
  - 최대 콤보: "N연속" 형식으로 표시
- 각 항목마다 순차적 애니메이션 (`statSlideIn`, delay: 0.1s, 0.2s, 0.3s, 0.4s)

**액션 버튼** (result-actions):
- "게임 목록으로" 버튼: 게임 센터로 복귀
- "다시 도전" 버튼: 게임 재시작 (카운트다운부터)
- 애니메이션: `fadeInUp` (아래에서 위로 나타남, delay: 0.4s)

**정답률 계산**:
```javascript
const accuracy = computed(() => {
  if (answeredQuestions.value.length === 0) return 0;
  const correct = answeredQuestions.value.filter(q => q.isCorrect).length;
  return Math.round((correct / answeredQuestions.value.length) * 100);
});
```

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/InitialConsonantGame.vue`** (1,394 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'countdown', 'playing', 'result')
- 타이머 시스템: `timeLeft`, `isTimerPaused`, `gameTimer`
- 점수 및 답변 기록: `score`, `answeredQuestions`
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (4단계), `currentTutorialStep`
- Toast 알림: `showToast()` 함수
- 주요 함수:
  - `startGame()`: CSV 로딩 후 카운트다운 시작
  - `beginGame()`: 실제 게임 시작
  - `generateNewQuestion()`: 새 문제 생성
  - `submitAnswer()`: 답변 제출 및 검증
  - `skipQuestion()`: 문제 건너뛰기
  - `endGame()`: 게임 종료

#### 유틸리티
**`client/src/utils/wordGame.js`** (207 줄)
- 한글 초성 관련 핵심 로직
- 주요 함수:
  - `getInitialConsonant(char)`: 한글 문자에서 초성 추출 (Unicode 기반)
  - `extractInitials(word)`: 단어의 모든 초성 추출
  - `parseKoreanWords(csvText)`: CSV 데이터 파싱
  - `generateSmartQuestion(words)`: CSV 데이터 기반 문제 생성
  - `validateAnswerWithNaver(answer, initials)`: 서버 API 호출하여 검증

#### 데이터
**`client/public/data/koreanWords.csv`** (5,966 줄)
- 한국어 단어 데이터베이스
- 형식: `번호,단어,초성,길이,등급`
- 예시:
  ```
  1,가게,ㄱㄱ,2,A
  2,가격,ㄱㄱ,2,A
  3,가능,ㄱㄴ,2,A
  ```
- 게임 시작 시 `loadCSVWords()` 함수로 로딩
- 2글자 단어를 필터링하여 문제 생성에 활용

#### 오디오
**`client/public/audio/IcecreamSong.mp3`** (4,326 줄 - 바이너리)
- 배경음악 파일
- 게임 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.5 설정

---

### 4-2. 서버 (Server)

#### API 라우터
**`server/src/routers/wordValidation.mjs`** (483 줄)
- 단어 검증 API 엔드포인트
- 주요 엔드포인트:

  **POST `/api/validate-word`** (기존 버전, 하위 호환성)
  - Request Body: `{ word, csvWords, expectedInitials }`
  - 초성 기반 검증 또는 CSV 기반 검증 지원
  - 국립국어원 API 검증

  **POST `/api/verify-word`** (초성 전용 버전)
  - Request Body: `{ word, expectedInitials }`
  - 초성 기반 검증만 수행

  **POST `/api/suggest-word`** (유사 단어 제안)
  - Request Body: `{ word, csvWords }`
  - 레벤슈타인 거리 알고리즘으로 유사 단어 찾기

- 주요 함수:
  - `handleInitialBasedValidation()`: 초성 검증 + 국립국어원 API 검증
  - `validateInKoreanDictionary()`: 국립국어원 API 호출
  - `checkKoreanDictionary()`: XML 파싱 및 정확한 매치 확인
  - `extractInitials()`: 서버측 초성 추출 (클라이언트와 동일한 로직)
  - `levenshteinDistance()`: 편집 거리 계산 (오타 체크)
  - `findSimilarWords()`: 유사 단어 찾기 (50% 이상 유사도)

---

## 5. API 및 검증

### 5-1. 클라이언트 → 서버 API 호출

**엔드포인트**: `POST /api/validate-word`

**요청 예시**:
```javascript
const response = await fetch('http://localhost:3031/api/validate-word', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    word: '수박',
    expectedInitials: 'ㅅㅂ',
    csvWords: []
  })
});
```

**응답 예시 (정답)**:
```json
{
  "isValid": true,
  "isCorrectInitials": true,
  "message": "정답입니다! 🎉",
  "word": "수박",
  "source": "korean_dictionary",
  "sourceLabel": "🏛️ 국립국어원",
  "sourceMessage": "국립국어원 표준국어대사전에서 확인된 공식 한국어 단어입니다.",
  "meaning": "박과의 한해살이 덩굴풀. 줄기는 길게 뻗으며...",
  "pos": "명사",
  "example": "",
  "confidence": 1.0
}
```

**응답 예시 (초성 불일치)**:
```json
{
  "isValid": false,
  "isCorrectInitials": false,
  "message": "초성이 맞지 않습니다. (입력: ㅅㅂ, 정답: ㄱㄱ)",
  "expectedInitials": "ㄱㄱ",
  "userInitials": "ㅅㅂ",
  "word": "수박"
}
```

**응답 예시 (사전 미등재)**:
```json
{
  "isValid": false,
  "isCorrectInitials": true,
  "message": "국립국어원 표준국어대사전에 등재되지 않은 단어입니다.",
  "word": "뇌절",
  "reason": "표준국어대사전에서 찾을 수 없는 단어",
  "sourceMessage": "🏛️ 국립국어원 표준국어대사전 기준으로만 정답을 인정합니다."
}
```

---

### 5-2. 서버 → 국립국어원 API 호출

**API URL**: `https://stdict.korean.go.kr/api/search.do`

**요청 파라미터**:
- `key`: API 키 (환경변수 `KOREAN_DICT_API_KEY`)
- `q`: 검색어 (예: "수박")
- `req_type`: 응답 형식 ("xml")
- `advanced`: 고급 검색 여부 ("n")
- `pos`: 시작 위치 (1)
- `sort`: 정렬 방식 ("dict" - 사전순)

**응답 형식**: XML (CDATA 섹션 포함)

**응답 예시**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<channel>
  <total>1</total>
  <item>
    <word><![CDATA[수박]]></word>
    <definition><![CDATA[박과의 한해살이 덩굴풀...]]></definition>
    <pos><![CDATA[명사]]></pos>
    <example><![CDATA[]]></example>
  </item>
</channel>
```

**파싱 로직**:
```javascript
// 1. total 값 확인 (검색 결과 개수)
const totalMatch = xmlText.match(/<total>(\d+)<\/total>/);
const total = totalMatch ? parseInt(totalMatch[1]) : 0;

// 2. item 태그 추출
const itemMatches = xmlText.match(/<item>(.*?)<\/item>/gs);

// 3. CDATA 섹션에서 단어명 추출
const wordPatterns = [
  /<word><!\[CDATA\[(.*?)\]\]><\/word>/,
  /<word>(.*?)<\/word>/,
  // ... 기타 패턴들
];

// 4. 정확한 매치 확인
if (wordName === word) {
  exactMatch = itemContent;
}

// 5. 의미 정보 추출
const definitionMatch = exactMatch.match(/<definition><!\[CDATA\[(.*?)\]\]><\/definition>/);
const meaning = definitionMatch ? definitionMatch[1] : '...';
```

---

### 5-3. 검증 프로세스

**전체 검증 흐름**:

```
사용자 입력 "수박"
    ↓
[클라이언트] validateAnswerWithNaver() 호출
    ↓
[서버] POST /api/validate-word 수신
    ↓
1. 한글 검증: /^[가-힣]+$/.test('수박') → ✅ 통과
    ↓
2. 초성 추출: extractInitials('수박') → 'ㅅㅂ'
    ↓
3. 초성 매칭: 'ㅅㅂ' === 'ㅅㅂ' → ✅ 통과
    ↓
4. 국립국어원 API 호출
    ↓
   - URL: https://stdict.korean.go.kr/api/search.do?key=...&q=수박&...
   - XML 응답 수신
   - CDATA 파싱
   - 정확한 매치 확인: "수박" === "수박" → ✅ 통과
    ↓
5. 응답 생성:
   {
     isValid: true,
     meaning: "박과의 한해살이 덩굴풀...",
     ...
   }
    ↓
[클라이언트] 응답 수신
    ↓
6. 정답 처리:
   - pauseTimer()
   - score += 10
   - showToast('정답입니다 😊')
   - answeredQuestions에 기록
   - 2초 후 다음 문제
```

---

## 6. 기술 원리

### 6-1. 한글 초성 추출 알고리즘

한글은 Unicode에서 `0xAC00` (가) ~ `0xD7A3` (힣) 범위에 배치되어 있으며, 각 글자는 초성, 중성, 종성의 조합으로 이루어집니다.

**Unicode 구조**:
```
한글 음절 = 초성 × 588 + 중성 × 28 + 종성 + 0xAC00
```

- 초성: 19개 (ㄱ, ㄲ, ㄴ, ㄷ, ㄸ, ㄹ, ㅁ, ㅂ, ㅃ, ㅅ, ㅆ, ㅇ, ㅈ, ㅉ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ)
- 중성: 21개 (ㅏ, ㅐ, ㅑ, ㅒ, ㅓ, ㅔ, ㅕ, ㅖ, ㅗ, ㅘ, ㅙ, ㅚ, ㅛ, ㅜ, ㅝ, ㅞ, ㅟ, ㅠ, ㅡ, ㅢ, ㅣ)
- 종성: 28개 (없음, ㄱ, ㄲ, ㄳ, ㄴ, ㄵ, ㄶ, ㄷ, ㄹ, ㄺ, ㄻ, ㄼ, ㄽ, ㄾ, ㄿ, ㅀ, ㅁ, ㅂ, ㅄ, ㅅ, ㅆ, ㅇ, ㅈ, ㅊ, ㅋ, ㅌ, ㅍ, ㅎ)

**초성 추출 공식**:
```javascript
const getInitialConsonant = (char) => {
  const charCode = char.charCodeAt(0);

  // 한글 범위 체크
  if (charCode < 0xAC00 || charCode > 0xD7A3) {
    return char; // 한글이 아니면 그대로 반환
  }

  // 초성 인덱스 계산: (문자코드 - 0xAC00) / 588
  const initialIndex = Math.floor((charCode - 0xAC00) / 588);

  // 초성 배열에서 해당 인덱스의 초성 반환
  const ALL_KOREAN_INITIALS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  return ALL_KOREAN_INITIALS[initialIndex];
};
```

**예시**:
```
"수박" → ['ㅅ', 'ㅂ'] → 'ㅅㅂ'

1. '수': charCode = 0xC218
   - (0xC218 - 0xAC00) = 0x1818 = 6168
   - 6168 / 588 = 10.48... → floor = 10
   - ALL_KOREAN_INITIALS[10] = 'ㅅ'

2. '박': charCode = 0xBC15
   - (0xBC15 - 0xAC00) = 0x1015 = 4117
   - 4117 / 588 = 7.00... → floor = 7
   - ALL_KOREAN_INITIALS[7] = 'ㅂ'

결과: 'ㅅㅂ'
```

---

### 6-2. 국립국어원 API XML 파싱

국립국어원 표준국어대사전 API는 XML 형식으로 응답하며, CDATA 섹션을 사용하여 특수문자를 보호합니다.

**CDATA 섹션이란?**
- `<![CDATA[ ... ]]>` 형식으로 감싸진 데이터
- XML 파서가 태그로 해석하지 않고 순수 텍스트로 처리
- 한글, 특수문자, HTML 태그 등을 안전하게 전달

**파싱 전략**:

1. **정규표현식 패턴 배열**: 다양한 태그명과 CDATA 여부를 모두 고려
   ```javascript
   const wordPatterns = [
     /<word><!\[CDATA\[(.*?)\]\]><\/word>/,        // CDATA 포함
     /<word>(.*?)<\/word>/,                        // CDATA 없음
     /<target_code><!\[CDATA\[(.*?)\]\]><\/target_code>/,
     /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
     // ... 기타 패턴들
   ];
   ```

2. **순차적 매칭**: 패턴을 하나씩 시도하여 첫 번째 매치 사용
   ```javascript
   let wordName = '';
   for (const pattern of wordPatterns) {
     const match = itemContent.match(pattern);
     if (match && match[1] && match[1].trim()) {
       wordName = match[1].trim();
       break;
     }
   }
   ```

3. **정확한 매치 확인**: 추출된 단어명과 검색어가 정확히 일치하는지 확인
   ```javascript
   if (wordName === word) {
     exactMatch = itemContent;
     break;
   }
   ```

4. **의미 정보 추출**: 정확한 매치가 있으면 definition, pos, example 추출
   ```javascript
   const definitionMatch = exactMatch.match(/<definition><!\[CDATA\[(.*?)\]\]><\/definition>/) ||
                          exactMatch.match(/<definition>(.*?)<\/definition>/);
   const meaning = definitionMatch ? definitionMatch[1] : '...';
   ```

---

### 6-3. 레벤슈타인 거리 (Levenshtein Distance)

오타 체크 및 유사 단어 제안에 사용되는 알고리즘으로, 두 문자열 간의 편집 거리를 계산합니다.

**편집 거리란?**
- 문자열 A를 문자열 B로 변환하는 데 필요한 최소 편집 연산 횟수
- 편집 연산: 삽입, 삭제, 치환

**알고리즘 원리**:
```javascript
function levenshteinDistance(str1, str2) {
  const matrix = [];

  // 초기화
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // 동적 프로그래밍
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]; // 같으면 비용 0
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // 치환
          matrix[i][j - 1] + 1,     // 삽입
          matrix[i - 1][j] + 1      // 삭제
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}
```

**유사도 계산**:
```javascript
const similarity = 1 - (distance / Math.max(str1.length, str2.length));
// 예: "사과" vs "사관" → distance = 1, similarity = 1 - (1/2) = 0.5 (50%)
```

**적용**:
- 유사도 50% 이상인 단어들을 제안
- 유사도가 높은 순으로 정렬하여 상위 5개 반환

---

## 7. 디자인 시스템

### 7-1. Toss 디자인 시스템

초성게임은 Toss Design System을 기반으로 한 깔끔하고 직관적인 UI를 제공합니다.

**컬러 팔레트**:
- `--toss-blue`: 메인 강조색 (버튼, 링크, 진행 상태)
- `--toss-blue-light`: 배지 배경색
- `--gray-50`: 페이지 배경색
- `--gray-200`: 테두리 색상
- `--gray-600`: 부제목 및 보조 텍스트
- `--gray-900`: 주요 텍스트
- `--success`: 정답 배경색 (#e8f5e9)
- `--danger`: 오답 배경색 및 시간 경고 (#ffebee, 빨간색)

**타이포그래피**:
- `.toss-title2`: 24px, font-weight: 700 (헤더 제목)
- `.toss-title3`: 20px, font-weight: 700 (섹션 제목)
- `.toss-title4`: 18px, font-weight: 600 (카드 제목)
- `.toss-body1`: 16px, font-weight: 500 (본문)
- `.toss-caption`: 14px, font-weight: 400 (보조 텍스트)

**Border Radius**:
- `--radius-lg`: 12px (카드, 버튼)
- `--radius-md`: 8px (입력창, 작은 카드)
- `--radius-full`: 50% (Toast 알림)

**Shadow**:
- `--shadow-sm`: 작은 그림자 (카드)
- `--shadow-md`: 중간 그림자 (점수 원형 배지)
- `--shadow-lg`: 큰 그림자 (Toast 알림)

---

### 7-2. 애니메이션

**점수 튀어오르기** (`scorePop`):
```css
@keyframes scorePop {
  0% { transform: scale(1); }
  30% { transform: scale(1.4); color: var(--toss-blue); }
  50% { transform: scale(1.3) rotate(-5deg); }
  70% { transform: scale(1.3) rotate(5deg); }
  100% { transform: scale(1) rotate(0deg); }
}
```
- 정답 시 점수가 1.4배 확대되며 파란색으로 변경
- 좌우로 흔들리며 원래 크기로 복귀
- 지속 시간: 0.6초

**시간 경고 깜빡임** (`pulse-warning`):
```css
@keyframes pulse-warning {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
- 시간이 10초 이하일 때 시간 표시가 깜빡임
- 빨간색 + 굵은 글씨 + 깜빡임 효과

**콤보 펄스** (`comboPulse`):
```css
@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```
- 콤보가 증가할 때마다 콤보 표시가 튀어오름
- 🔥 아이콘과 함께 빨간색으로 표시
- 지속 시간: 0.3초

**일시정지 배지** (`badgePulse`):
```css
@keyframes badgePulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
}
```
- 정답 시 화면 중앙에 "⏸️ 일시정지" 배지 표시
- 부드럽게 커졌다 작아지며 깜빡임
- 지속 시간: 1.5초, 무한 반복

**결과 화면 애니메이션**:
- `scoreAppear`: 점수 원형 배지가 0.5배에서 1배로 확대되며 나타남
- `statSlideIn`: 통계 항목이 왼쪽에서 오른쪽으로 슬라이드
- `fadeInUp`: 버튼이 아래에서 위로 나타남

---

### 7-3. 반응형 디자인

**브레이크포인트**:
- Desktop: 1200px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Tablet (768px 이하)**:
```css
@media (max-width: 768px) {
  .game-header {
    flex-direction: column;  // 헤더 요소 세로 배치
    gap: 16px;
  }

  .header-center {
    position: static;        // 중앙 정렬 해제
    transform: none;
  }

  .header-stats {
    width: 100%;
    justify-content: space-around;
  }

  .initials-display {
    font-size: 48px;         // 초성 크기 축소
  }
}
```

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .initials-display {
    font-size: 40px;
    letter-spacing: 4px;     // 글자 간격 축소
  }

  .answer-input-area {
    flex-direction: column;  // 입력창과 버튼 세로 배치
  }

  .tutorial-actions,
  .result-actions {
    flex-direction: column;  // 버튼 세로 배치
    width: 100%;
  }

  .header-stats {
    flex-wrap: wrap;         // 통계 항목 줄바꿈
  }
}
```

---

## 8. 환경 설정

### 8-1. 환경 변수

**서버 (.env)**:
```bash
# 국립국어원 API 키
KOREAN_DICT_API_KEY=3DA74579AA6FD550AAE736600C1C2FBF

# OpenAI API 키 (힌트 생성에 필요, 선택사항)
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
npm run dev  # 클라이언트와 서버 동시 실행 (concurrently)
```

---

### 8-3. 접속 URL

- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/initial-consonant`

---

## 9. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| 초성 추출 | Unicode 기반 한글 초성 자동 추출 | `Math.floor((charCode - 0xAC00) / 588)` |
| 국립국어원 검증 | 표준국어대사전 API로 공식 검증 | XML 파싱, CDATA 처리 |
| 타이머 시스템 | 60초 제한, 정답 시 일시정지 | `setInterval`, `isTimerPaused` |
| 다답 허용 | 같은 초성의 모든 단어 정답 인정 | CSV 데이터 필터링 |
| 콤보 시스템 | 연속 정답 시 보너스 점수 | `comboCount`, `maxCombo` |
| 점수 애니메이션 | 정답 시 점수 튀어오르기 | CSS `@keyframes scorePop` |
| 튜토리얼 | 4단계 인터랙티브 가이드 | Vue Composition API |
| Toast 알림 | 정답/오답 즉시 피드백 | `showToast()` 함수 |
| 배경음악 | IcecreamSong.mp3 자동 재생 | Audio API, localStorage |
| 레벤슈타인 거리 | 유사 단어 제안 | 동적 프로그래밍 |
| 반응형 디자인 | Desktop/Tablet/Mobile 지원 | CSS Media Queries |

---

## 10. 개선 가능한 부분

- **힌트 시스템**: OpenAI GPT를 활용한 동적 힌트 생성 (현재 미구현)
- **난이도 조절**: 2글자 이상의 단어도 포함하여 난이도 선택 가능
- **리더보드**: 최고 점수 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **오프라인 모드**: 국립국어원 API 실패 시 CSV 데이터로 대체 검증
