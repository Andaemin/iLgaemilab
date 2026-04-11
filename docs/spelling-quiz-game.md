# 맞춤법 퀴즈

**최종 업데이트**: 2025-11-26

---

## 1. 게임 개요

### 1-1. 게임 설명
맞춤법 퀴즈는 자주 틀리는 한국어 맞춤법 문제를 객관식으로 풀어보는 학습 게임입니다. 60개의 문제 중 사용자가 선택한 개수(10문제 또는 20문제)만큼 랜덤으로 선택하여 풀고, 빈칸 채우기 형식으로 올바른 맞춤법을 선택합니다. 즉시 피드백과 함께 틀린 문제는 자세한 해설을 제공하여 실전 맞춤법 실력을 향상시킬 수 있습니다.

### 1-2. 핵심 특징

#### 문제 시스템
- 🔢 **문제 수 선택**: 10문제 또는 20문제 중 선택 가능
- 📝 **객관식 형식**: 60개 문제 중 선택한 개수만큼 랜덤으로 출제
- 🎯 **빈칸 채우기**: 문장의 빈칸({blank})에 맞는 단어 선택
- ✅ **즉시 피드백**: 선택 즉시 정답/오답 확인 (300ms 후 자동 넘김)
- 📊 **한 번에 채점**: 모든 문제를 푼 후 결과 화면에서 일괄 채점
- 🔄 **답변 고정**: 한 번 선택한 답은 변경 불가 (신중하게 선택)

#### 문제 카테고리
- 🔤 **축약형**: 되요/돼요, 어떻해/어떡해, 되/돼 등
- 📏 **띄어쓰기**: 할 수 있다/할수있다, 할게요/할께요 등
- ✏️ **맞춤법**: 금새/금세, 왠지/웬지, 안 되다/안되다 등
- 🔍 **의미구별**: 다르다/틀리다, 맞히다/맞추다, -든지/-던지 등
- 📌 **조사**: 와/과, 로서/로써, -의/-에 등
- 📚 **어휘**: 이뻐/예뻐, 괸찮/괜찮, 낫다/낳다 등

#### 점수 시스템
- 🏆 **정답당 점수**:
  - 10문제 모드: 정답 1개당 10점, 최대 100점
  - 20문제 모드: 정답 1개당 5점, 최대 100점
- ⭐ **점수별 평가**:
  - 100점: "혹시 세종대왕님이세요?" (완벽한 한글 맞춤법 실력!)
  - 80-90점: "맞춤법 마스터!" (훌륭한 맞춤법 실력!)
  - 60-70점: "맞춤법 2% 부족할 때" (조금만 더 연습하면 완벽!)
  - 40-50점: "맞춤법 오류, 멈춰!" (아직 맞춤법이 부족하군요.)
  - 0-30점: "오늘부터 키보드 압수!" (맞춤법 자동 교정이 필요해요!)
- 📝 **서브 메시지**: 점수별로 상세한 피드백 메시지 제공

#### 결과 분석
- 📊 **점수 표시**: 100점 만점 점수와 평가 문구
- 📝 **전체 문제 표시**: 정답과 오답을 모두 보여주는 색연필 채점 스타일
- ✅ **정답 문제**: 초록색 O 표시 및 정답 강조
- ❌ **오답 문제**: 빨간색 X 표시, 선택한 답과 정답 비교, 자세한 해설 제공
- 🔄 **다시 도전**: 새로운 문제로 재도전 가능
- 🏠 **게임 센터로**: 게임 센터 메인으로 복귀

#### 튜토리얼 및 UX
- 📚 **4단계 튜토리얼**: 게임 규칙, 문제 형식, 채점 방식, 점수 계산을 상세하게 안내
- 🎵 **배경음악**: NyanCat.mp3 자동 재생, 음소거 버튼(🔊/🔇)으로 ON/OFF 가능
- 💾 **음악 설정 저장**: localStorage에 음악 설정 저장하여 새로고침 시에도 유지
- 🎨 **미니멀 디자인**: 연한 회색 배경(#F9F9F9), 깔끔한 UI/UX
- 📜 **자동 스크롤**: 게임 화면 전환 시 페이지 최상단으로 자동 스크롤

---

## 2. 게임 접근 방법

### 2-1. 게임 센터 진입
1. 메인 페이지에서 "게임 센터" 버튼 클릭
2. 게임 목록에서 "맞춤법 퀴즈" 카드 선택
3. 자동으로 튜토리얼 화면 시작

**URL**: `http://localhost:5288/game` → 맞춤법 퀴즈 카드 클릭

### 2-2. 직접 접근
브라우저 주소창에 직접 URL 입력:

**URL**: `http://localhost:5288/game/spelling-quiz`

직접 접근 시에도 튜토리얼부터 시작하며, "건너뛰기" 버튼으로 바로 게임 시작 가능.

---

## 3. 게임 진행 단계

### 3-1. 튜토리얼 (Tutorial)

**화면 구성**:
- 상단: 뒤로가기 버튼, 📚 아이콘, "게임 설명" 제목, 단계 표시 (1/4, 2/4, ...)
- 중앙: 튜토리얼 카드
  - 이모지 아이콘 (🎮, 📝, ✅, 💯)
  - 단계별 제목
  - 설명 텍스트
  - 상세 안내 박스 (4개 bullet points)
  - 진행 상황 표시 점 (Progress dots)
- 하단: "건너뛰기" / "이전" 버튼, "다음" / "게임 시작" 버튼

**튜토리얼 단계**:

**1단계 - 맞춤법 퀴즈란?** (🎮)
- 올바른 맞춤법을 골라내는 게임입니다.
- 상세 안내:
  - 10문제 또는 20문제 중 원하는 개수를 선택할 수 있습니다.
  - 각 문제마다 2개의 선택지 중 올바른 것을 고르세요.
  - 실전에서 자주 틀리는 맞춤법들을 배울 수 있습니다.
  - 모든 문제를 풀면 결과와 해설을 확인할 수 있습니다.

**2단계 - 문제 형식** (📝)
- 다양한 맞춤법 유형이 출제됩니다.
- 상세 안내:
  - 축약형: 되요/돼요, 되/돼 등
  - 띄어쓰기: 할 수 있다 / 할수있다 등
  - 맞춤법: 금새/금세, 왠지/웬지 등
  - 의미구별: 다르다/틀리다, 맞히다/맞추다 등

**3단계 - 채점 방식** (✅)
- 모든 문제를 푼 후 한 번에 채점됩니다.
- 상세 안내:
  - 답을 선택하면 다음 문제로 자동 넘어갑니다.
  - 한 번 선택한 답은 변경할 수 없습니다.
  - 모든 문제를 완료하면 점수와 정답이 표시됩니다.
  - 결과 화면에서 모든 문제를 색연필 채점 스타일로 확인할 수 있습니다.

**4단계 - 점수 계산** (💯)
- 정답 개수에 따라 점수가 부여됩니다.
- 상세 안내:
  - 10문제 모드: 정답 1개당 10점 (최대 100점)
  - 20문제 모드: 정답 1개당 5점 (최대 100점)
  - 점수에 따라 다른 평가 문구가 표시됩니다.
  - 결과 화면에서 모든 문제의 정답과 해설을 확인하세요.

**인터랙션**:
- "이전" 버튼: 이전 단계로 돌아가기
- "다음" 버튼: 다음 단계로 진행
- "건너뛰기" 버튼: 튜토리얼 스킵하고 문제 수 선택 화면으로
- "게임 시작" 버튼 (4단계): 문제 수 선택 화면으로 이동

---

### 3-2. 문제 수 선택 (Question Count Select)

튜토리얼 완료 후 문제 수를 선택하는 화면입니다.

**화면 구성**:
- **상단 헤더**:
  - 뒤로가기 버튼 (튜토리얼로 복귀)
  - 🎯 아이콘, "문제 수 선택" 제목
- **선택 카드**:
  - 제목: "원하는 문제 수를 선택하세요"
  - 설명: "빠르게 풀어보고 싶다면 10문제, 충분히 연습하고 싶다면 20문제를 선택하세요."
- **선택 버튼 (2개)**:
  - **10문제 버튼**:
    - 아이콘: ⚡
    - 제목: "10문제"
    - 부제: "빠른 도전"
    - 스타일: 파란색 테두리, 호버 시 배경색 변경
  - **20문제 버튼**:
    - 아이콘: 🎓
    - 제목: "20문제"
    - 부제: "완벽한 학습"
    - 스타일: 파란색 테두리, 호버 시 배경색 변경

**인터랙션**:
- 버튼 클릭 시:
  - 선택한 문제 수(`questionCount`) 저장 (10 또는 20)
  - 자동으로 스크롤을 최상단으로 이동
  - 카운트다운 화면으로 전환

---

### 3-3. 카운트다운 (Countdown)

문제 수 선택 후 3초 카운트다운이 시작됩니다.

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

카운트다운이 끝나면 600ms 후 실제 게임이 시작되며, 자동으로 페이지 최상단으로 스크롤됩니다.

---

### 3-4. 게임 플레이 (Playing)

**화면 구성**:

**상단 헤더** (game-playing-header):
- 좌측: 뒤로가기 버튼 (게임 센터로 복귀)
- 중앙: "맞춤법 퀴즈" 제목
- 우측: 🔊/🔇 음악 토글 버튼

**진행률 표시** (progress-indicator):
- 진행 바: 시각적으로 진행 상태 표시 (파란색 바)
- 진행률 텍스트: "N / 10" 또는 "N / 20" 형식 (선택한 문제 수에 따라)

**퀴즈 컨테이너** (minimal-quiz-container):
- 배경: 흰색 (#FFFFFF)
- 최대 너비: 900px
- 중앙 정렬, 큰 패딩

**문제 영역**:
1. **문제 번호 (quiz-number-pill)**:
   - 형태: 작은 둥근 버튼 (pill 스타일)
   - 내용: "하나", "둘", "셋", ... (한글 숫자)
   - 스타일: 파란색 배경, 흰색 텍스트

2. **문제 제목 (quiz-title)**:
   - "다음 중 <span class="highlight-underline">맞는 것</span>을 고르세요."
   - "맞는 것" 부분: 파란색 밑줄 (5px solid #C6E0F9)

3. **질문 문장 (quiz-sentence)**:
   - {blank} → `<span class="blank-underline">___________</span>` (밑줄)
   - 중앙 정렬, 큰 글씨 (26px)
   - 예: "오늘 일찍 퇴근해도 ___________?"

4. **선택지 버튼 (answer-buttons)**:
   - 2개 버튼, 세로 배치 (한 줄에 하나)
   - 배경: #F3F3F3 (연한 회색)
   - Border radius: 40px (둥근 모서리)
   - 호버: 파란색 테두리 (#007AFF)
   - 클릭: 즉시 다음 문제로 (300ms 후)

5. **페이지 표시 (page-indicator)**:
   - 하단에 "1/10", "2/10", ... 형식으로 표시
   - 회색 텍스트

**게임 로직**:

**1. 퀴즈 데이터 로딩**
```javascript
const loadQuizData = async () => {
  // JSON 파일에서 60개 문제 로딩
  const response = await fetch('/data/spellingQuiz.json');
  const data = await response.json();
  allQuizData.value = data.quizzes;

  // 선택한 문제 수만큼 랜덤 선택 (10개 또는 20개)
  const shuffled = [...allQuizData.value].sort(() => Math.random() - 0.5);
  selectedQuizzes.value = shuffled.slice(0, questionCount.value);
};
```

**2. 답안 선택**
```javascript
const selectAnswer = (answerIndex) => {
  const isCorrect = answerIndex === currentQuiz.value.correctAnswer;

  // 답안 저장
  userAnswers.value.push({
    quizId: currentQuiz.value.id,
    quiz: currentQuiz.value,
    selectedAnswer: answerIndex,
    isCorrect: isCorrect
  });

  // 다음 문제로 또는 결과 화면으로
  if (currentQuizIndex.value < questionCount.value - 1) {
    setTimeout(() => {
      currentQuizIndex.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' }); // 자동 스크롤
    }, 300);
  } else {
    setTimeout(() => {
      endGame(); // 결과 화면으로
    }, 300);
  }
};
```

**3. {blank} → 밑줄 변환**
```javascript
const formatQuestion = (question) => {
  return question.replace(
    /{blank}/g,
    '<span class="blank-underline">___________</span>'
  );
};
```

**예시 문제**:
```
[문제 번호] 하나

다음 중 맞는 것을 고르세요.

오늘 일찍 퇴근해도 ___________?

[되요]
[돼요]
```

---

### 3-5. 결과 화면 (Result)

게임 종료 시 자동으로 페이지 최상단으로 스크롤되며 결과 화면이 표시됩니다.

**화면 구성**:

**상단 헤더**:
- 📊 아이콘, "결과 확인" 제목

**점수 카드** (score-card):
- 최종 점수 표시: "N점" (큰 글씨, 파란색)
- 평가 문구: 점수별 메시지 (예: "맞춤법 마스터!")
- 서브 메시지: 상세 피드백 (HTML 형식, `<br>` 지원)

**점수별 메시지**:
```javascript
// 100점
메인: "혹시 세종대왕님이세요?"
서브: "완벽한 한글 맞춤법 실력!<br>당신을 인간 맞춤법 사전으로 명명합니다."

// 80-90점
메인: "맞춤법 마스터!"
서브: "훌륭한 맞춤법 실력!<br>자주 헷갈리는 몇 가지만 기억하면 완벽합니다."

// 60-70점
메인: "맞춤법 2% 부족할 때"
서브: "한글을 사랑하지만 아쉬운 느낌,<br>조금만 더 연습하면 완벽해질 수 있어요!"

// 40-50점
메인: "맞춤법 오류, 멈춰!"
서브: "아직 맞춤법이 부족하군요.<br>틀린 문제들을 다시 한번 확인해보세요."

// 0-30점
메인: "오늘부터 키보드 압수!"
서브: "맞춤법 자동 교정이 필요해요!<br>아래 오답 노트를 꼭 확인하세요."
```

**전체 문제 리뷰** (all-answers):
- **모든 문제를 순서대로 표시** (정답/오답 구분 없이)
- 색연필 채점 스타일의 직관적인 UI
- 각 문제마다:
  - **문제 번호**: 한글 숫자 (하나, 둘, 셋, ...)
  - **정답 표시**:
    - ✅ **정답인 경우**: 큰 초록색 O 표시 (grading-mark-correct)
    - ❌ **오답인 경우**: 큰 빨간색 X 표시 (grading-mark-wrong)
  - **질문**: {blank}를 밑줄로 변환하여 표시
  - **답안 표시**:
    - **정답**: 초록색 배경 (#e8f5e9), 체크 아이콘
    - **오답 시 선택한 답**: 빨간색 배경 (#ffebee), X 아이콘
  - **해설**: 오답인 경우만 자세한 설명 표시

**색연필 채점 효과**:
```css
.grading-mark-correct {
  color: #4caf50;
  font-size: 48px;
  font-weight: bold;
}

.grading-mark-wrong {
  color: #f44336;
  font-size: 48px;
  font-weight: bold;
}
```

**액션 버튼** (result-actions):
- "게임 센터로" 버튼: 게임 센터 메인으로 복귀
- "다시 도전" 버튼: 문제 수 선택 화면으로 이동하여 새 게임 시작

---

## 4. 파일 구조

### 4-1. 클라이언트 (Client)

#### 컴포넌트
**`client/src/components/game/SpellingQuizGame.vue`** (1,379 줄)
- 게임의 메인 컴포넌트
- Vue 3.5 Composition API (`<script setup>`) 사용
- 게임 상태 관리: `gameState` ('tutorial', 'question-count-select', 'countdown', 'playing', 'result')
- 퀴즈 데이터:
  - `allQuizData`: 전체 60개 문제
  - `questionCount`: 선택한 문제 수 (10 또는 20)
  - `selectedQuizzes`: 랜덤 선택된 문제 (questionCount 개수만큼)
  - `currentQuizIndex`: 현재 문제 인덱스 (0 ~ questionCount-1)
  - `userAnswers`: 사용자의 답안 배열 [{quizId, quiz, selectedAnswer, isCorrect}]
- 음악 재생: `bgMusic`, `isMusicMuted`
- 튜토리얼 관리: `tutorialSteps` (4단계), `currentTutorialStep`
- 주요 함수:
  - `selectQuestionCount(count)`: 문제 수 선택 및 카운트다운 시작
  - `loadQuizData()`: JSON 파일에서 60개 문제 로딩 및 선택한 개수만큼 랜덤 선택
  - `formatQuestion(question)`: {blank}를 밑줄(<span>)로 변환
  - `selectAnswer(answerIndex)`: 답안 선택, 자동 스크롤, 다음 문제/결과 화면 이동
  - `numberToKorean(num)`: 숫자를 한글로 변환 (1→하나, 2→둘, ...)
  - `endGame()`: 게임 종료, 자동 스크롤, 결과 화면 전환
  - `restartGame()`: 문제 수 선택 화면으로 돌아가 게임 재시작

#### 데이터
**`client/public/data/spellingQuiz.json`** (963 줄)
- 60개의 맞춤법 문제 데이터
- JSON 구조:
  ```json
  {
    "quizzes": [
      {
        "id": 1,
        "question": "오늘 일찍 퇴근해도 {blank}?",
        "options": ["되요", "돼요"],
        "correctAnswer": 1,
        "highlightWord": ["되요", "돼요"],
        "explanation": "'되어요'의 줄임말이므로 '돼요'가 맞습니다.",
        "category": "축약형",
        "difficulty": "easy"
      },
      ...
    ]
  }
  ```
- 카테고리 분포:
  - 축약형: 되요/돼요, 어떻해/어떡해 등
  - 띄어쓰기: 할 수 있다/할수있다 등
  - 맞춤법: 금새/금세, 왠지/웬지 등
  - 의미구별: 다르다/틀리다, 맞히다/맞추다 등
  - 조사: 와/과, 로서/로써 등
  - 어휘: 이뻐/예뻐, 괸찮/괜찮 등

#### 오디오
**`client/public/audio/NyanCat.mp3`** (바이너리)
- 배경음악 파일
- 게임 플레이 시작 시 자동 재생 (음소거 설정이 아닌 경우)
- loop: true, volume: 0.5 설정
- 게임 종료 시 자동 정지

---

### 4-2. 서버 (Server)

맞춤법 퀴즈는 서버 API를 사용하지 않습니다. 모든 데이터는 클라이언트의 JSON 파일에서 로딩하며, 정답 검증도 클라이언트에서 처리합니다.

**이유**:
- 간단한 객관식 형식으로 서버 검증 불필요
- 빠른 피드백을 위해 클라이언트에서 즉시 처리
- 네트워크 지연 없이 부드러운 게임 진행

---

## 5. 데이터 구조

### 5-1. 문제 데이터 (Quiz Object)

```javascript
{
  "id": 1,                              // 문제 고유 ID
  "question": "오늘 일찍 퇴근해도 {blank}?",  // 질문 (빈칸 포함)
  "options": ["되요", "돼요"],          // 선택지 배열 (2개)
  "correctAnswer": 1,                   // 정답 인덱스 (0 또는 1)
  "highlightWord": ["되요", "돼요"],    // 강조 단어 (현재 미사용)
  "explanation": "'되어요'의 줄임말이므로 '돼요'가 맞습니다.",  // 해설
  "category": "축약형",                 // 카테고리
  "difficulty": "easy"                  // 난이도
}
```

**필드 설명**:
- `id`: 문제 고유 번호 (1~60)
- `question`: 질문 문장, {blank} 위치에 빈칸 표시
- `options`: 2개의 선택지 배열
- `correctAnswer`: 정답의 인덱스 (0: 첫 번째 선택지, 1: 두 번째 선택지)
- `highlightWord`: 선택지에서 강조할 단어 (현재 사용하지 않음)
- `explanation`: 정답에 대한 자세한 해설
- `category`: 문제 유형 (축약형, 띄어쓰기, 맞춤법, 의미구별, 조사, 어휘)
- `difficulty`: 난이도 (easy, medium, hard)

---

### 5-2. 답안 데이터 (User Answer Object)

```javascript
{
  quizId: 1,                            // 문제 ID
  quiz: { /* 문제 객체 */ },           // 문제 전체 데이터
  selectedAnswer: 1,                    // 선택한 답의 인덱스
  isCorrect: true                       // 정답 여부
}
```

**사용**:
- 게임 진행 중 답안 선택 시 `userAnswers` 배열에 추가
- 결과 화면에서 점수 계산 및 오답 노트 표시에 사용

---

### 5-3. 점수 계산

```javascript
// 최종 점수 계산
const finalScore = computed(() => {
  const correctCount = userAnswers.value.filter(a => a.isCorrect).length;
  const pointsPerQuestion = questionCount.value === 10 ? 10 : 5;
  return correctCount * pointsPerQuestion;
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
```

**점수 계산 방식**:
- **10문제 모드**: 정답 1개당 10점 (최대 100점)
- **20문제 모드**: 정답 1개당 5점 (최대 100점)
- 두 모드 모두 최종 점수는 100점 만점으로 통일

---

## 6. 기술 원리

### 6-1. 랜덤 문제 선택 알고리즘

Fisher-Yates 셔플 알고리즘을 사용하여 60개 문제 중 선택한 개수(10개 또는 20개)만큼 랜덤하게 선택합니다.

**알고리즘**:
```javascript
const loadQuizData = async () => {
  const response = await fetch('/data/spellingQuiz.json');
  const data = await response.json();
  allQuizData.value = data.quizzes; // 60개 문제

  // Fisher-Yates 셔플 (Array.prototype.sort 활용)
  const shuffled = [...allQuizData.value].sort(() => Math.random() - 0.5);

  // 선택한 개수만큼 추출 (10개 또는 20개)
  selectedQuizzes.value = shuffled.slice(0, questionCount.value);
};
```

**원리**:
1. 전체 배열을 복사 (`[...allQuizData.value]`)
2. `Array.prototype.sort()`에 랜덤 비교 함수 전달
3. `Math.random() - 0.5`는 -0.5 ~ 0.5 범위의 난수 생성
4. 음수면 순서 유지, 양수면 순서 교체
5. 결과적으로 배열이 랜덤하게 섞임
6. `slice(0, questionCount.value)`로 선택한 개수만큼 추출

**장점**:
- 간단하고 직관적
- 매 게임마다 다른 문제 조합
- 60개 중 10개/20개를 선택하므로 조합의 수가 많음
- 사용자가 원하는 난이도와 학습 시간에 맞춰 선택 가능

---

### 6-2. {blank} → 밑줄 변환

문제 문장의 `{blank}` 플레이스홀더를 시각적 밑줄로 변환합니다.

**변환 함수**:
```javascript
const formatQuestion = (question) => {
  return question.replace(
    /{blank}/g,
    '<span class="blank-underline">___________</span>'
  );
};
```

**CSS 스타일**:
```css
.blank-underline {
  display: inline-block;
  border-bottom: 2px solid #333;
  min-width: 100px;
  text-align: center;
  margin: 0 4px;
}
```

**사용 예시**:
```vue
<!-- Vue 템플릿 -->
<p class="quiz-sentence" v-html="formatQuestion(currentQuiz.question)"></p>

<!-- 원본 데이터 -->
"오늘 일찍 퇴근해도 {blank}?"

<!-- 변환 후 HTML -->
<p class="quiz-sentence">
  오늘 일찍 퇴근해도 <span class="blank-underline">___________</span>?
</p>
```

**주의사항**:
- `v-html` 사용 시 XSS 공격 위험이 있으나, 신뢰할 수 있는 JSON 데이터만 사용하므로 안전
- {blank}는 문제 데이터에서 일관되게 사용되어야 함

---

### 6-3. 한글 숫자 변환

문제 번호를 한글로 표시하기 위한 변환 함수입니다.

**변환 함수**:
```javascript
const numberToKorean = (num) => {
  const koreanNumbers = [
    '', '하나', '둘', '셋', '넷',
    '다섯', '여섯', '일곱', '여덟', '아홉', '열'
  ];
  return koreanNumbers[num] || num.toString();
};
```

**사용 예시**:
```vue
<!-- Vue 템플릿 -->
<div class="quiz-number-pill">{{ numberToKorean(currentQuizIndex + 1) }}</div>

<!-- 결과 -->
currentQuizIndex = 0 → "하나"
currentQuizIndex = 1 → "둘"
currentQuizIndex = 9 → "열"
```

**이유**:
- 사용자 친화적인 UI
- 한글 게임의 정체성 강화
- 시각적으로 부드러운 느낌

---

### 6-4. 즉시 피드백 및 자동 넘김

사용자가 답을 선택하면 300ms 후 자동으로 다음 문제로 넘어가며, 페이지 최상단으로 스크롤됩니다.

**로직**:
```javascript
const selectAnswer = (answerIndex) => {
  // 정답 여부 확인
  const isCorrect = answerIndex === currentQuiz.value.correctAnswer;

  // 답안 저장
  userAnswers.value.push({
    quizId: currentQuiz.value.id,
    quiz: currentQuiz.value,
    selectedAnswer: answerIndex,
    isCorrect: isCorrect
  });

  // 다음 문제로 또는 결과 화면으로
  if (currentQuizIndex.value < questionCount.value - 1) {
    // 300ms 후 다음 문제로 이동 및 자동 스크롤
    setTimeout(() => {
      currentQuizIndex.value++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  } else {
    // 300ms 후 결과 화면
    setTimeout(() => {
      endGame();
    }, 300);
  }
};

const endGame = () => {
  gameState.value = 'result';
  window.scrollTo({ top: 0, behavior: 'smooth' }); // 결과 화면 자동 스크롤
  if (bgMusic.value) {
    bgMusic.value.pause();
  }
};
```

**타이밍**:
- 즉시 답안 저장 (0ms)
- 300ms 후 화면 전환 및 자동 스크롤

**이유**:
- 사용자가 선택한 답을 잠깐 확인할 시간 제공
- 너무 빠르면 선택한 답을 보지 못함
- 너무 느리면 게임 흐름이 끊김
- 자동 스크롤로 항상 새로운 문제를 화면 상단에서 확인 가능

---

## 7. 디자인 시스템

### 7-1. 미니멀 디자인

맞춤법 퀴즈는 미니멀한 디자인을 추구하여 사용자가 문제에 집중할 수 있도록 합니다.

**컬러 팔레트**:
- `#F9F9F9`: 페이지 배경색 (연한 회색)
- `#FFFFFF`: 퀴즈 컨테이너 배경 (흰색)
- `#007AFF`: 메인 강조색 (파란색) - 버튼, 진행 바
- `#C6E0F9`: 하이라이트 밑줄 색상 (연한 파란색)
- `#F3F3F3`: 선택지 버튼 배경 (연한 회색)
- `#333333`: 텍스트 색상 (진한 회색)
- `#e8f5e9`: 정답 배경색 (연한 초록색)
- `#ffebee`: 오답 배경색 (연한 빨간색)

**타이포그래피**:
- 문제 제목: 32px, font-weight: 700
- 질문 문장: 26px, font-weight: 500
- 선택지 버튼: 22px, font-weight: 600
- 페이지 표시: 18px, font-weight: 500

**Border Radius**:
- 퀴즈 컨테이너: 24px (부드러운 모서리)
- 문제 번호 pill: 30px (완전히 둥글게)
- 선택지 버튼: 40px (둥근 모서리)

**간격 및 패딩**:
- 퀴즈 컨테이너 패딩: 60px
- 요소 간 간격: 32px (일관된 간격)
- 선택지 버튼 패딩: 20px 40px

---

### 7-2. 애니메이션

**버튼 호버** (`answer-btn:hover`):
```css
.answer-btn {
  transition: all 0.2s ease;
}

.answer-btn:hover {
  border: 3px solid #007AFF;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
```
- 파란색 테두리 표시
- 위로 2px 이동
- 그림자 강화
- 지속 시간: 0.2초

**진행 바 애니메이션** (`progress-bar-fill`):
```css
.progress-bar-fill {
  transition: width 0.3s ease;
  background: linear-gradient(90deg, #007AFF, #00C6FF);
}
```
- 문제가 바뀔 때마다 진행 바 너비가 부드럽게 증가
- 그라데이션 효과로 시각적 흥미 제공

**결과 화면 나타나기** (`fadeInUp`):
```css
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

.score-card {
  animation: fadeInUp 0.5s ease-out;
}
```
- 결과 카드가 아래에서 위로 슬라이드하며 나타남
- 지속 시간: 0.5초

---

### 7-3. 반응형 디자인

**브레이크포인트**:
- Desktop: 900px 이상 (기본)
- Tablet: 768px 이하
- Mobile: 480px 이하

**Tablet (768px 이하)**:
```css
@media (max-width: 768px) {
  .minimal-quiz-container {
    max-width: 700px;
    padding: 40px;
  }

  .quiz-sentence {
    font-size: 22px;
  }

  .answer-btn {
    font-size: 20px;
    padding: 16px 32px;
  }
}
```

**Mobile (480px 이하)**:
```css
@media (max-width: 480px) {
  .minimal-quiz-container {
    padding: 30px 20px;
  }

  .quiz-title {
    font-size: 24px;
  }

  .quiz-sentence {
    font-size: 18px;
  }

  .answer-btn {
    font-size: 18px;
    padding: 14px 24px;
  }

  .page-indicator {
    font-size: 16px;
  }
}
```

---

## 8. 환경 설정

### 8-1. 환경 변수

맞춤법 퀴즈는 서버 API를 사용하지 않으므로 환경 변수가 필요하지 않습니다.

**클라이언트만 필요**:
```bash
# .env 파일 불필요
# JSON 파일과 오디오 파일만 public 폴더에 위치
```

---

### 8-2. 실행 방법

**클라이언트 실행** (포트 5288):
```bash
cd client
npm install
npm run dev
```

**전체 실행** (루트 디렉토리):
```bash
npm run dev  # 클라이언트만 실행 (서버 불필요)
```

---

### 8-3. 접속 URL

- **게임 센터**: `http://localhost:5288/game`
- **직접 접속**: `http://localhost:5288/game/spelling-quiz`

---

## 9. 주요 기능 요약

| 기능 | 설명 | 기술 |
|------|------|------|
| 문제 수 선택 | 10문제/20문제 선택 가능 | Vue Reactive State |
| 랜덤 문제 선택 | 60개 중 선택한 개수만큼 랜덤 선택 | Fisher-Yates 셔플 |
| 빈칸 변환 | {blank} → 시각적 밑줄 | `String.replace()`, `v-html` |
| 즉시 피드백 | 선택 후 300ms 대기, 자동 스크롤 | `setTimeout()`, `window.scrollTo()` |
| 점수 계산 | 10문제(10점/개), 20문제(5점/개) | Vue Computed |
| 점수별 평가 | 5단계 평가 문구 | Computed Property |
| 한글 숫자 | 1→하나, 2→둘, ... | `numberToKorean()` |
| 색연필 채점 | 모든 문제 O/X 표시 | CSS Styling, Vue Conditional |
| 전체 문제 리뷰 | 정답/오답 모두 표시 및 해설 | `userAnswers` 배열 |
| 자동 스크롤 | 화면 전환 시 최상단 이동 | `window.scrollTo()` |
| 튜토리얼 | 4단계 인터랙티브 가이드 | Vue Composition API |
| 배경음악 | NyanCat.mp3 자동 재생 | Audio API, localStorage |
| 미니멀 디자인 | 깔끔한 UI/UX | Toss Design System |

---

## 10. 문제 예시

### 10-1. 축약형

**문제 1**:
```
오늘 일찍 퇴근해도 {blank}?
선택지: [되요] [돼요]
정답: 돼요
해설: '되어요'의 줄임말이므로 '돼요'가 맞습니다.
```

**문제 2**:
```
이 일은 내가 {blank}.
선택지: [해도 되] [해도 돼]
정답: 해도 돼
해설: '하여도 되어'의 줄임말이므로 '해도 돼'가 맞습니다.
```

---

### 10-2. 띄어쓰기

**문제 1**:
```
나는 영어를 {blank}.
선택지: [할 수 있어] [할수있어]
정답: 할 수 있어
해설: '할 수 있어'는 '할 수 있다'의 활용형으로 띄어 써야 합니다.
```

**문제 2**:
```
내일 시간 {blank}?
선택지: [될까요] [될 까요]
정답: 될까요
해설: 보조동사 '-ㄹ까요'는 붙여 씁니다.
```

---

### 10-3. 맞춤법

**문제 1**:
```
{blank} 부자가 되었다.
선택지: [금새] [금세]
정답: 금세
해설: '금시에'의 준말인 '금세'가 맞습니다.
```

**문제 2**:
```
{blank} 이런 일이 생겼을까?
선택지: [왠지] [웬지]
정답: 웬지
해설: '무슨' '어떤'의 뜻을 가진 '웬'이 맞습니다.
```

---

### 10-4. 의미구별

**문제 1**:
```
정답을 {blank}.
선택지: [맞추다] [맞히다]
정답: 맞히다
해설: 정답을 '맞히다'가 올바른 표현입니다.
```

**문제 2**:
```
이 문제는 저 문제와 {blank}.
선택지: [다르다] [틀리다]
정답: 다르다
해설: '다르다'는 차이를 나타내고, '틀리다'는 오답을 의미합니다.
```

---

## 11. 개선 가능한 부분

- **난이도 선택**: 쉬움/보통/어려움 난이도 선택 기능
- **카테고리별 학습**: 특정 카테고리만 선택하여 집중 학습
- **타이머 모드**: 제한 시간 내에 문제 풀기 (타임어택)
- **리더보드**: 최고 점수 기록 및 랭킹 시스템
- **소셜 공유**: 결과 화면에서 SNS 공유 기능
- **문제 추가**: 더 많은 문제 데이터베이스 확장
- **복습 모드**: 틀린 문제만 다시 풀기
- **진행 상황 저장**: 중간에 나가도 이어서 풀 수 있도록
