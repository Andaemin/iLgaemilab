# 학습 페이지 및 오답 노트 기능 구현 보고서

**담당자**: [이름]
**구현 기간**: [기간]
**기술 스택**: Vue 3, Pinia, Axios, OpenAI API, MySQL, Sequelize

---

## 목차
1. [맡은 역할 및 담당 기능](#맡은-역할-및-담당-기능)
2. [학습 현황 페이지 (LearnView)](#1-학습-현황-페이지-learnview)
3. [학습 내용 페이지 (LearnLevelView)](#2-학습-내용-페이지-learnlevelview)
4. [복습 퀴즈 기능](#3-복습-퀴즈-기능)
5. [AI 생성 마무리 테스트 (FinalTestView)](#4-ai-생성-마무리-테스트-finaltestview)
6. [미니게임: 한글 글자 잡기](#5-미니게임-한글-글자-잡기)
7. [오답노트 메인 화면 (WrongAnswersView)](#6-오답노트-메인-화면-wronganswersview)
8. [오답노트 학습 화면](#7-오답노트-학습-화면)
9. [오답노트 복습 테스트 (ReviewTestView)](#8-오답노트-복습-테스트-reviewtestview)
10. [사용된 API 목록](#사용된-api-목록)
11. [핵심 기술 및 구현 방식](#핵심-기술-및-구현-방식)

---

## 맡은 역할 및 담당 기능

### 전체 학습 시스템 프론트엔드 개발
- **학습 진행도 관리**: 초급, 중급, 고급 3단계 × 각 5레벨 체계
- **학습 콘텐츠 제공**: 한국어 표현 학습 카드 시스템
- **평가 시스템**: 레벨별 퀴즈 + AI 기반 마무리 테스트
- **복습 시스템**: 오답 노트 + 복습 테스트
- **게임화 요소**: 로딩 중 미니게임으로 사용자 경험 향상

### 주요 구현 페이지
1. **학습 현황 페이지** - 전체 학습 진행 상황 시각화
2. **학습 내용 페이지** - 표현 학습 카드 인터페이스
3. **복습 퀴즈** - 즉시 피드백 제공 퀴즈
4. **AI 마무리 테스트** - OpenAI 기반 문제 자동 생성
5. **미니게임** - 문제 생성 대기 시간 활용
6. **오답노트** - 난이도별 오답 관리 및 복습

---

## 1. 학습 현황 페이지 (LearnView)

### 1-1. 페이지 개요
**파일**: `client/src/views/LearnView.vue`

전체 학습 진행도를 시각화하여 보여주는 메인 대시보드입니다.

### 1-2. 주요 기능

#### ✅ 3단계 학습 체계
- **초급 (Beginner)** 🌱: 기본 인사와 자기소개
- **중급 (Intermediate)** 🌿: 일상 대화 확장
- **고급 (Advanced)** 🌳: 사회적 대화 및 의견 교환

각 단계마다 5개 레벨 + 마무리 테스트(왕관 👑)로 구성

#### ✅ 진행도 시각화
```
🌱 [●]━━[○]━━[○]━━[○]━━[○]━━👑
   완료  현재  잠김  잠김  잠김  잠김
```

- **완료된 레벨**: 파란색 원 (●) 채워짐
- **현재 레벨**: 파란색 테두리 + 펄스 애니메이션
- **잠긴 레벨**: 회색 + 자물쇠 아이콘 🔒

#### ✅ 순차적 학습 진행 시스템
- 이전 레벨 완료해야 다음 레벨 접근 가능
- 초급 마무리 테스트 통과 → 중급 잠금 해제
- 중급 마무리 테스트 통과 → 고급 잠금 해제

#### ✅ 반응형 가로 스크롤
- 모바일: 스와이프 가능한 가로 스크롤
- 데스크톱: 전체 진행도 한 눈에 표시

### 1-3. 사용된 API

```javascript
// 1. 레벨 진행도 조회
GET /api/learning/level-progress
Authorization: Bearer <token>

Response:
{
  success: true,
  progress: {
    beginner: [true, false, false, false, false],
    intermediate: [false, false, false, false, false],
    advanced: [false, false, false, false, false]
  }
}

// 2. 마무리 테스트 통과 여부 조회
GET /api/learning/final-test-status/:category
Authorization: Bearer <token>

Response:
{
  success: true,
  passed: true,
  score: 18
}
```

### 1-4. 핵심 로직

```javascript
// 레벨 클릭 시 접근 제어
const handleLevelClick = (categoryId, levelIndex) => {
  // 중급: 초급 마무리 테스트 통과 필요
  if (categoryId === 'intermediate' && !finalTestPassed.value.beginner) {
    alert('초급 마무리 테스트를 먼저 통과해주세요!')
    return
  }

  // 고급: 중급 마무리 테스트 통과 필요
  if (categoryId === 'advanced' && !finalTestPassed.value.intermediate) {
    alert('중급 마무리 테스트를 먼저 통과해주세요!')
    return
  }

  // 이전 레벨 완료 체크
  if (levelIndex > 0 && !completedLevels.value[categoryId][levelIndex - 1]) {
    alert('이전 레벨을 먼저 완료해주세요!')
    return
  }

  // 학습 페이지로 이동
  router.push({ name: 'learn-level', params: { category: categoryId, level: levelIndex + 1 } })
}
```

### 1-5. UI 디자인 특징

**색상 시스템**:
- 초급: 파란색 (`#3182F6`)
- 중급: 파란색 (`#3182F6`)
- 고급: 파란색 (`#3182F6`)

**애니메이션**:
- 원 채우기 애니메이션 (`fillCircle`)
- 연결선 채우기 애니메이션 (`fillLine`)
- 현재 레벨 펄스 효과 (`pulse`)

**반응형 디자인**:
- 데스크톱: 모든 레벨 한 줄에 표시
- 태블릿: 가로 스크롤 활성화
- 모바일: 최소 너비 조정 + 스크롤 힌트

---

## 2. 학습 내용 페이지 (LearnLevelView)

### 2-1. 페이지 개요
**파일**: `client/src/views/LearnLevelView.vue`

한국어 표현을 학습하는 메인 학습 인터페이스입니다.

### 2-2. 주요 기능

#### ✅ 학습 카드 시스템
각 학습 카드는 다음 정보를 포함:
- **한국어 표현**: 예) "안녕하세요"
- **로마자 표기**: 예) "annyeonghaseyo"
- **의미**: 영어/베트남어 번역
- **설명**: 표현의 용도와 뉘앙스 (한영 토글 가능)
- **사용 시기**: 언제 사용하는지 설명 (한영 토글 가능)
- **예문**: 실제 사용 예시 3개
- **문화 팁**: 한국 문화 이해 (한영 토글 가능)
- **발음 듣기**: TTS 음성 재생 버튼

#### ✅ 학습 모드
1. **레슨 소개 화면**
   - 레벨 제목 및 부제목 (한영 토글)
   - 총 학습 내용 수
   - 예상 소요 시간
   - 복습 퀴즈 포함 안내

2. **학습 카드 모드**
   - 카드 형식으로 표현 학습
   - 좌우 버튼으로 카드 넘기기
   - 진행률 바 표시

3. **복습 퀴즈 모드**
   - 학습한 표현을 4지선다 퀴즈로 복습
   - 즉시 정답/오답 피드백
   - 오답은 자동으로 오답 노트에 저장

#### ✅ 한영 토글 기능
- 네비게이션 바의 언어 토글 버튼으로 전환
- `vue-i18n`의 `locale` 상태 활용
- 실시간 언어 전환 (한국어 ↔ 영어)

```javascript
// 언어에 따른 표시 텍스트 computed
const currentExplanation = computed(() => {
  return locale.value === 'en'
    ? expr.explanationEn || expr.explanation
    : expr.explanation
})
```

#### ✅ 학습 완료 처리
- 퀴즈 정답률 80% 이상 시 레벨 완료
- 서버에 진행도 자동 저장
- 학습 현황 페이지에 완료 상태 반영

### 2-3. 사용된 API

```javascript
// 1. 레벨 학습 시작
POST /api/learning/start-level
Authorization: Bearer <token>
Body: { category: "beginner", level: 1 }

Response:
{
  success: true,
  message: "레벨 학습을 시작합니다",
  progress: { ... }
}

// 2. 레슨 완료 (오늘의 목표 자동 체크)
POST /api/learning/complete-lesson
Authorization: Bearer <token>

Response:
{
  message: "레슨이 완료되었습니다",
  lessonsCompleted: 5,
  tasks: [ ... ]
}

// 3. 레벨 완료
POST /api/learning/complete-level
Authorization: Bearer <token>
Body: {
  category: "beginner",
  level: 1,
  quizScore: 9,
  timeSpent: 600
}

Response:
{
  success: true,
  message: "레벨을 완료했습니다",
  progress: { ... }
}

// 4. 오답 저장
POST /api/wrong-answers/save
Authorization: Bearer <token>
Body: {
  category: "beginner",
  level: 1,
  questionType: "quiz",
  question: "다음 중 'Hello'의 한국어 표현은?",
  correctAnswer: "안녕하세요",
  userAnswer: "안녕",
  options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
  explanation: "'안녕하세요'는 공식적인 인사입니다."
}
```

### 2-4. 핵심 로직

**학습 진행 관리**:
```javascript
const currentStep = ref(0) // 현재 단계 (0: 소개, 1~N: 학습 카드, N+1: 퀴즈)
const totalSteps = computed(() => lessons.value.length + 2) // 소개 + 학습 + 퀴즈

// 다음 단계로 이동
const nextStep = () => {
  if (currentStep.value === 0) {
    // 소개 → 첫 학습 카드
    currentStep.value = 1
  } else if (currentStep.value < lessons.value.length + 1) {
    // 학습 카드 진행
    currentStep.value++
  } else {
    // 퀴즈 시작
    startQuiz()
  }
}
```

**퀴즈 정답 체크 및 오답 저장**:
```javascript
const checkAnswer = async (questionIndex, selectedOption) => {
  const question = quizQuestions.value[questionIndex]
  const isCorrect = selectedOption === question.correctAnswer

  if (isCorrect) {
    score.value++
  } else {
    // 오답 서버에 저장
    await axios.post('/api/wrong-answers/save', {
      category: route.params.category,
      level: route.params.level,
      questionType: 'quiz',
      question: question.question,
      correctAnswer: question.correctAnswer,
      userAnswer: selectedOption,
      options: question.options,
      explanation: question.explanation
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
  }
}
```

### 2-5. UI 디자인 특징

**카드 레이아웃**:
- Toss 디자인 시스템 기반
- 부드러운 그림자 효과
- 카드 슬라이드 애니메이션

**진행률 표시**:
- 상단 고정 진행률 바
- 현재 단계 / 전체 단계 숫자 표시

**반응형**:
- 모바일: 카드 전체 너비, 버튼 하단 고정
- 데스크톱: 카드 최대 너비 제한, 중앙 정렬

---

## 3. 복습 퀴즈 기능

### 3-1. 기능 개요
학습한 표현을 4지선다 문제로 복습하는 퀴즈 시스템입니다.

### 3-2. 퀴즈 생성 로직

**문제 타입**:
1. **의미 → 한국어**: "다음 중 'Hello'의 한국어 표현은?"
2. **한국어 → 의미**: "'안녕하세요'의 영어 의미는?"

**선택지 생성**:
```javascript
const generateQuizQuestions = () => {
  const questions = []

  lessons.value.forEach(lesson => {
    const expr = lesson.expression

    // 타입 1: 의미 → 한국어
    questions.push({
      question: `다음 중 '${expr.meaning}'의 한국어 표현은?`,
      options: [
        expr.korean,
        randomExpression1.korean,
        randomExpression2.korean,
        randomExpression3.korean
      ].shuffle(),
      correctAnswer: expr.korean,
      explanation: expr.explanation
    })
  })

  return questions.shuffle().slice(0, 10) // 10문제 랜덤 선택
}
```

### 3-3. 즉시 피드백 시스템

**정답 시**:
- 초록색 배경으로 변경
- ✓ 체크 아이콘 표시
- "정답입니다!" 메시지

**오답 시**:
- 빨간색 배경으로 변경
- ✗ 아이콘 표시
- "정답: [정답]" 메시지 표시
- 해설 자동 표시
- 오답 노트에 자동 저장

**애니메이션**:
```css
.option-button.correct {
  border-color: #10b981;
  background: #d1fae5;
  animation: correctPulse 0.5s ease;
}

@keyframes correctPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

### 3-4. 통과 기준
- 정답률 80% 이상 (10문제 중 8문제 이상)
- 통과 시 레벨 완료 처리
- 불통과 시 재시도 가능

---

## 4. AI 생성 마무리 테스트 (FinalTestView)

### 4-1. 페이지 개요
**파일**: `client/src/views/FinalTestView.vue`

각 단계(초급/중급/고급)의 5개 레벨을 모두 완료한 후 치르는 종합 평가 테스트입니다.

### 4-2. 주요 기능

#### ✅ AI 기반 문제 자동 생성
- **OpenAI GPT-4o-mini** 모델 활용
- 사용자의 학습 데이터 기반 개인화된 문제 생성
- 총 20문제 (각 레벨당 4문제씩)

#### ✅ 개인화 문제 생성 알고리즘

**입력 데이터**:
1. **완료한 레벨 정보**: 어떤 레벨을 완료했는지
2. **오답 노트 데이터**: 자주 틀린 주제
3. **학습 표현 목록**: 실제 학습한 한국어 표현
4. **평균 발음 점수**: 발음 학습 수준

**AI 프롬프트 구조**:
```javascript
const prompt = `
"${topic}" 주제로 ${category} 학습자를 위한 4지선다 문제 4개를 생성하세요.

**학습한 표현 목록 (이 목록의 표현만 사용 가능!):**
1. "안녕하세요" = Hello (Xin chào)
2. "감사합니다" = Thank you (Cảm ơn)
...

**사용자 약점 주제:**
- ${weakTopics}

**핵심 규칙:**
1. 정답과 선택지는 반드시 학습한 표현 목록에서만 선택
2. 질문은 "~무엇인가요?", "~무슨 뜻인가요?" 형태로 명확하게
3. 학습하지 않은 새로운 표현 사용 금지

JSON 형식으로 응답하세요.
`
```

**병렬 처리로 속도 개선**:
```javascript
// 5개 주제의 문제를 동시에 생성
const questionGenerationPromises = topics.map(async (topic, i) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" }
  })
  return JSON.parse(completion.choices[0].message.content).questions
})

const questionResults = await Promise.all(questionGenerationPromises)
```

### 4-3. 사용된 API

```javascript
// 1. 마무리 테스트 문제 생성 (AI)
GET /api/learning/final-test/:category
Authorization: Bearer <token>

Response:
{
  success: true,
  questions: [
    {
      question: "다음 중 'Hello'의 한국어 표현은?",
      questionVi: "Biểu hiện tiếng Hàn của 'Hello' là gì?",
      options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
      correctAnswer: 0,
      explanation: "'안녕하세요'는 공식적인 인사입니다."
    },
    // ... 19개 더
  ],
  personalized: true,
  learningStats: {
    completedLevels: 5,
    weakTopicsCount: 3
  }
}

// 2. 마무리 테스트 결과 저장
POST /api/learning/final-test-result
Authorization: Bearer <token>
Body: {
  category: "beginner",
  score: 18,
  totalQuestions: 20,
  passed: true,
  wrongAnswers: [
    {
      level: 1,
      question: "...",
      correctAnswer: "...",
      userAnswer: "...",
      options: [...],
      explanation: "..."
    }
  ]
}

Response:
{
  success: true,
  passed: true,
  score: 18,
  totalQuestions: 20,
  wrongAnswersSaved: 2
}
```

### 4-4. 테스트 진행 플로우

```
1. 시작 화면
   ↓
2. AI 문제 생성 중 (미니게임 플레이)
   ↓
3. 문제 준비 완료 → "문제 풀러가기" 버튼
   ↓
4. 20문제 풀이 (한 페이지에 모든 문제 표시)
   ↓
5. 제출 (모든 문제 답변 완료 시)
   ↓
6. 결과 화면 (통과/불통과)
   ↓
7-a. 통과 시: 다음 단계 잠금 해제
7-b. 불통과 시: 다시 도전 가능
```

### 4-5. 결과 화면

**통과 시 (80% 이상)**:
- 🎉 아이콘
- "훌륭해요!" 타이틀
- 초록색 강조
- "다음 단계로 진행할 수 있습니다" 메시지

**불통과 시 (80% 미만)**:
- 😢 아이콘
- "조금 더 힘내요!" 타이틀
- 빨간색 강조
- "복습 후 다시 도전해보세요" 메시지
- "다시 도전하기" 버튼

**공통 표시 정보**:
- 정답 수 / 총 문제 수
- 정답률 (%)
- 통과 기준 (80%)
- "문제 해설 보기" 버튼

---

## 5. 미니게임: 한글 글자 잡기

### 5-1. 게임 개요
AI가 문제를 생성하는 대기 시간(약 10~15초) 동안 사용자가 지루하지 않도록 재미있는 미니게임을 제공합니다.

### 5-2. 게임 규칙

#### 기본 규칙
- 하늘에서 떨어지는 한글 글자를 터치/클릭
- 글자를 잡으면 점수 획득
- 글자를 놓치면 라이프 감소

#### 글자 종류
1. **일반 글자** (87% 확률)
   - 파란색 원
   - 기본 점수: 10점
   - 콤보에 따라 점수 증가

2. **황금 글자** ★♥◆ (7% 확률)
   - 노란색 원 + 빛나는 효과
   - 보너스 점수: 30점
   - 콤보 적용 시 최대 90점

3. **폭탄** 💣 (5% 확률)
   - 검은색 원
   - 잡으면 라이프 -1
   - 콤보 리셋

#### 콤보 시스템
```
콤보 수    | 점수 배율 | 이펙트
-----------|-----------|------------------
0~4        | x1        | -
5~9        | x1.5      | 🔥 5 COMBO!
10~19      | x2        | ⚡ 10 COMBO! x2
20~29      | x3        | 💎 20 COMBO! x3
30+        | x3        | 🌟 30 COMBO!
```

#### 라이프 시스템
- 시작: ❤️❤️❤️ (3개)
- 글자 놓침: -1 라이프
- 폭탄 잡음: -1 라이프
- 라이프 0: 게임 오버 (재시작 가능)

#### 난이도 증가
```javascript
// 시간에 따른 속도 증가
const speedMultiplier = 1 + (gameTime * 0.02) // 1초당 2% 증가

// 초기 속도: 1.5~3
// 10초 후: 1.8~3.6
// 20초 후: 2.1~4.2
```

### 5-3. 게임 구현

**핵심 로직**:
```javascript
// 글자 생성 (0.7초마다)
const spawnChar = () => {
  const rand = Math.random()
  let char, type

  if (rand < 0.05) {
    char = '💣'
    type = 'bomb'
  } else if (rand < 0.12) {
    char = ['★', '♥', '◆'][Math.floor(Math.random() * 3)]
    type = 'golden'
  } else {
    char = koreanChars[Math.floor(Math.random() * koreanChars.length)]
    type = 'normal'
  }

  fallingChars.value.push({
    id: Date.now() + Math.random(),
    char,
    x: Math.random() * (areaWidth - 60),
    y: -60,
    speed: (1.5 + Math.random() * 1.5) * speedMultiplier.value,
    type
  })
}

// 글자 클릭
const catchChar = (charId) => {
  const char = fallingChars.value.find(c => c.id === charId)

  if (char.type === 'bomb') {
    lives.value--
    combo.value = 0
    triggerShake()
  } else {
    const basePoints = char.type === 'golden' ? 30 : 10
    const earnedPoints = Math.floor(basePoints * comboMultiplier.value)
    miniGameScore.value += earnedPoints
    combo.value++
  }
}
```

**애니메이션 효과**:
- 글자 등장: 위에서 떨어지는 애니메이션
- 글자 클릭: 확대 후 사라짐
- 콤보 이펙트: 중앙에 텍스트 표시
- 폭탄 터짐: 화면 흔들림 효과
- 황금 글자: 빛나는 펄스 애니메이션

### 5-4. UI 디자인

**게임 화면 구성**:
```
┌─────────────────────────────────────┐
│   한글 글자 잡기!                      │
│   떨어지는 글자를 터치! ★보너스 💣피하기  │
├─────────────────────────────────────┤
│ ❤️❤️🖤  점수: 350  5 COMBO x1.5    │
├─────────────────────────────────────┤
│                                     │
│        [글자 떨어지는 영역]             │
│                                     │
│            콤보 이펙트                │
│          🔥 5 COMBO!               │
│                                     │
├─────────────────────────────────────┤
│  ⏳ AI가 문제를 만들고 있어요...       │
│  ✨ 문제가 준비되었습니다!              │
│     [문제 풀러가기]                   │
└─────────────────────────────────────┘
```

**색상 및 스타일**:
- 배경: 하늘색 그라데이션 (`#f0f9ff` → `#dbeafe`)
- 일반 글자: 파란색 그라데이션 (`#3182F6` → `#2563eb`)
- 황금 글자: 노란색 그라데이션 (`#fbbf24` → `#f59e0b`)
- 폭탄: 검은색 그라데이션 (`#374151` → `#1f2937`)

### 5-5. 게임 종료 처리

**문제 준비 완료 시**:
1. "✨ 문제가 준비되었습니다!" 메시지 표시
2. "문제 풀러가기" 버튼 표시
3. 게임은 계속 진행 (원하는 만큼 더 플레이 가능)

**게임 오버 시**:
```
┌─────────────────────────┐
│       💀                │
│    GAME OVER            │
│   최종 점수: 350         │
│   최대 콤보: 12          │
│   [다시 하기]            │
└─────────────────────────┘
```

---

## 6. 오답노트 메인 화면 (WrongAnswersView)

### 6-1. 페이지 개요
**파일**: `client/src/views/WrongAnswersView.vue`

퀴즈와 마무리 테스트에서 틀린 문제를 모아서 복습할 수 있는 오답 관리 시스템입니다.

### 6-2. 주요 기능

#### ✅ 난이도별 오답 분류
```
┌──────────────┬──────────────┬──────────────┐
│   🌱 초급    │   🌿 중급    │   🌳 고급    │
│  15개의 문제  │  8개의 문제   │  3개의 문제   │
│  [복습 가능]  │  [복습 가능]  │  [복습 가능]  │
└──────────────┴──────────────┴──────────────┘
```

#### ✅ 교과서 스타일 UI
오답을 선택하면 교과서를 펼친 듯한 2페이지 레이아웃으로 표시:

```
┌─────────────────┬─────────────────┐
│  Question 1     │  Question 2     │
│                 │                 │
│  문제 내용       │  문제 내용       │
│                 │                 │
│  ❌ 내 답변      │  ❌ 내 답변      │
│  "안녕"         │  "반가워요"      │
│                 │                 │
│  ✅ 정답         │  ✅ 정답         │
│  "안녕하세요"    │  "반갑습니다"    │
│                 │                 │
│  💡 해설         │  💡 해설         │
│  공식적인 인사   │  처음 만날 때    │
└─────────────────┴─────────────────┘
      [← 이전]           [다음 →]
```

#### ✅ 페이지 네비게이션
- 2페이지씩 넘김 (교과서처럼)
- 진행률 표시: "3 / 10"
- 진행률 바: 시각적 진행 상황

### 6-3. 사용된 API

```javascript
// 1. 오답 목록 조회
GET /api/wrong-answers/list
Authorization: Bearer <token>
Query: isReviewed=false

Response:
{
  success: true,
  wrongAnswers: [
    {
      id: 123,
      category: "beginner",
      level: 1,
      question: "다음 중 'Hello'의 한국어 표현은?",
      correctAnswer: "안녕하세요",
      userAnswer: "안녕",
      options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
      explanation: "'안녕하세요'는 공식적인 인사입니다.",
      createdAt: "2024-01-15T10:00:00Z"
    },
    // ...
  ],
  stats: [
    { category: "beginner", count: 15, reviewedCount: 0 },
    { category: "intermediate", count: 8, reviewedCount: 0 },
    { category: "advanced", count: 3, reviewedCount: 0 }
  ],
  total: 26
}
```

### 6-4. 핵심 로직

**카테고리별 그룹화**:
```javascript
const groupedByCategory = computed(() => {
  const grouped = {
    beginner: [],
    intermediate: [],
    advanced: []
  }

  wrongAnswers.value.forEach(answer => {
    if (grouped[answer.category]) {
      grouped[answer.category].push(answer)
    }
  })

  return grouped
})

const bookStats = computed(() => {
  return {
    beginner: groupedByCategory.value.beginner.length,
    intermediate: groupedByCategory.value.intermediate.length,
    advanced: groupedByCategory.value.advanced.length
  }
})
```

**2페이지 네비게이션**:
```javascript
// 다음 페이지 (2페이지씩)
const nextPage = () => {
  if (currentPageIndex.value < currentBookPages.value.length - 1) {
    currentPageIndex.value += 2
    if (currentPageIndex.value >= currentBookPages.value.length) {
      currentPageIndex.value = currentBookPages.value.length - 1
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 이전 페이지 (2페이지씩)
const prevPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value -= 2
    if (currentPageIndex.value < 0) {
      currentPageIndex.value = 0
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

### 6-5. UI 디자인 특징

**카테고리 카드**:
- 3열 그리드 레이아웃 (모바일에서는 1열)
- 호버 시 위로 올라가는 애니메이션
- 오답이 없는 경우 비활성화 + "완벽!" 배지

**교과서 페이지**:
- 2페이지 나란히 배치 (책을 펼친 모양)
- 카드 스타일: 흰색 배경, 부드러운 그림자
- 슬라이드 업 애니메이션
- 빈 페이지: 오른쪽이 비어있으면 📖 아이콘 표시

**색상 시스템**:
- 오답 영역: 빨간색 계열 (`#fee2e2`, `#fecaca`)
- 정답 영역: 초록색 계열 (`#ecfdf5`, `#d1fae5`)
- 해설 박스: 노란색 계열 (`#fffbeb`, `#fcd34d`)

---

## 7. 오답노트 학습 화면

### 7-1. 화면 개요
교과서를 펼친 듯한 2페이지 레이아웃으로 오답을 복습합니다.

### 7-2. 화면 구성

**헤더 영역**:
```
[← 돌아가기]  🌱 초급  3 / 10  ▓▓▓░░░░░░░  [🎯 복습 테스트]
```
- 뒤로가기 버튼
- 카테고리 배지 (아이콘 + 이름 + 색상)
- 진행률 (현재 페이지 / 전체 페이지)
- 진행률 바 (파란색 채워짐)
- 복습 테스트 버튼

**본문 영역** (2페이지):
```
┌────────────────────────────┬────────────────────────────┐
│ Question 1                 │ Question 2                 │
│ ─────────────────────────  │ ─────────────────────────  │
│                            │                            │
│ 다음 중 'Hello'의 한국어    │ 다음 중 'Thank you'의 한국어 │
│ 표현은 무엇인가요?          │ 표현은 무엇인가요?          │
│                            │                            │
│ ┌────────────────────────┐ │ ┌────────────────────────┐ │
│ │ ❌ 내 답변              │ │ │ ❌ 내 답변              │ │
│ │ 안녕                   │ │ │ 고마워                 │ │
│ └────────────────────────┘ │ └────────────────────────┘ │
│                            │                            │
│ ┌────────────────────────┐ │ ┌────────────────────────┐ │
│ │ ✅ 정답                 │ │ │ ✅ 정답                 │ │
│ │ 안녕하세요              │ │ │ 감사합니다              │ │
│ └────────────────────────┘ │ └────────────────────────┘ │
│                            │                            │
│ ┌────────────────────────┐ │ ┌────────────────────────┐ │
│ │ 💡 해설                 │ │ │ 💡 해설                 │ │
│ │ '안녕하세요'는 공식적인  │ │ │ '감사합니다'는 격식있는 │ │
│ │ 인사말입니다.           │ │ │ 감사 표현입니다.        │ │
│ └────────────────────────┘ │ └────────────────────────┘ │
└────────────────────────────┴────────────────────────────┘
```

**하단 네비게이션** (고정):
```
┌────────────────────────────────────────────────────────┐
│            [← 이전]              [다음 →]               │
└────────────────────────────────────────────────────────┘
```

### 7-3. 페이지 특징

**왼쪽/오른쪽 페이지**:
- 각 페이지에 오답 1개씩 표시
- 독립적인 카드 스타일
- 호버 시 살짝 위로 올라감

**답변 비교 영역**:
- **내 답변** (오답)
  - 배경: `#fef2f2` (연한 빨강)
  - 테두리: `#fecaca` (빨강)
  - 라벨: ❌ 내 답변

- **정답**
  - 배경: `#ecfdf5` (연한 초록)
  - 테두리: `#d1fae5` (초록)
  - 라벨: ✅ 정답

**해설 박스**:
- 배경: `#fffbeb` (연한 노랑)
- 테두리: `#fcd34d` (노랑)
- 아이콘: 💡
- 텍스트: 문제 해설

### 7-4. 반응형 디자인

**데스크톱** (> 768px):
- 2페이지 나란히 표시
- flex-direction: row

**모바일** (≤ 768px):
- 1페이지씩 세로 배치
- 빈 페이지 숨김 (display: none)
- flex-direction: column

---

## 8. 오답노트 복습 테스트 (ReviewTestView)

### 8-1. 페이지 개요
**파일**: `client/src/views/ReviewTestView.vue`

오답노트의 문제들을 다시 풀어보는 복습 테스트 모드입니다.

### 8-2. 주요 기능

#### ✅ 테스트 진행
- 오답 문제를 하나씩 풀이
- 즉시 정답/오답 피드백
- 정답 맞추면 오답 노트에서 자동 삭제

#### ✅ 진행 상황 표시
```
[← 나가기]     🌱 초급     3 / 10     현재 점수: 2

▓▓▓░░░░░░░ 30%
```

### 8-3. 사용된 API

```javascript
// 1. 카테고리별 오답 문제 조회
GET /api/wrong-answers/list
Authorization: Bearer <token>
Query: category=beginner&isReviewed=false

Response:
{
  success: true,
  wrongAnswers: [
    {
      id: 123,
      question: "다음 중 'Hello'의 한국어 표현은?",
      options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
      correctAnswer: "안녕하세요",
      explanation: "..."
    },
    // ...
  ]
}

// 2. 정답 시 오답 삭제
DELETE /api/wrong-answers/:id
Authorization: Bearer <token>

Response:
{
  success: true,
  message: "오답이 삭제되었습니다."
}
```

### 8-4. 핵심 로직

**답안 선택 및 오답 삭제**:
```javascript
const selectAnswer = async (optionIndex) => {
  const question = currentQuestion.value
  answers.value[currentQuestionIndex.value] = optionIndex

  // 정답 체크
  const isCorrect = question.correctAnswer === question.options[optionIndex]

  if (isCorrect) {
    score.value++

    // 맞춘 문제는 오답 노트에서 삭제
    await axios.delete(`/api/wrong-answers/${question.id}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })

    console.log(`✅ 오답 삭제 성공 - Question ID: ${question.id}`)
  }

  // 1.5초 후 다음 문제로 이동
  setTimeout(() => {
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      completeTest()
    }
  }, 1500)
}
```

**테스트 완료**:
```javascript
const completeTest = () => {
  setTimeout(() => {
    alert('모든 문제를 다 풀었습니다! 오답 노트로 돌아갑니다.')
    router.push({ name: 'wrong-answers' })
  }, 500)
}
```

### 8-5. UI 디자인

**문제 카드**:
```
┌──────────────────────────────────────┐
│ 다음 중 'Hello'의 한국어 표현은?        │
│                                      │
│  A  안녕하세요  [선택됨 ✓]            │
│  B  안녕       [비활성화]             │
│  C  반갑습니다  [비활성화]            │
│  D  감사합니다  [비활성화]            │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ 🎉 정답입니다!                  │  │
│ │                                │  │
│ │ 💡 해설                         │  │
│ │ '안녕하세요'는 공식적인 인사말   │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**정답 시**:
- 선택한 버튼: 초록색 배경 + ✓ 아이콘
- 피드백 메시지: "🎉 정답입니다!"
- 해설 표시

**오답 시**:
- 선택한 버튼: 빨간색 배경 + ✗ 아이콘
- 피드백 메시지: "😅 정답: [정답]"
- 해설 표시

---

## 사용된 API 목록

### 학습 진행 관련 API

| API | Method | 경로 | 설명 |
|-----|--------|------|------|
| 레벨 진행도 조회 | GET | `/api/learning/level-progress` | 사용자의 전체 레벨 완료 상태 조회 |
| 레벨 학습 시작 | POST | `/api/learning/start-level` | 특정 레벨 학습 시작 기록 |
| 레슨 완료 | POST | `/api/learning/complete-lesson` | 레슨 완료 + 오늘의 목표 자동 체크 |
| 레벨 완료 | POST | `/api/learning/complete-level` | 레벨 완료 처리 (퀴즈 통과 시) |
| 마무리 테스트 문제 생성 | GET | `/api/learning/final-test/:category` | AI로 개인화된 마무리 테스트 20문제 생성 |
| 마무리 테스트 결과 저장 | POST | `/api/learning/final-test-result` | 테스트 결과 + 오답 저장 |
| 마무리 테스트 통과 여부 | GET | `/api/learning/final-test-status/:category` | 마무리 테스트 통과 여부 확인 |

### 오답 노트 관련 API

| API | Method | 경로 | 설명 |
|-----|--------|------|------|
| 오답 저장 | POST | `/api/wrong-answers/save` | 퀴즈/테스트 오답 저장 |
| 오답 목록 조회 | GET | `/api/wrong-answers/list` | 오답 목록 조회 (필터링 가능) |
| 오답 삭제 | DELETE | `/api/wrong-answers/:id` | 복습 테스트에서 정답 시 삭제 |
| 오답 통계 | GET | `/api/wrong-answers/stats` | 카테고리별, 레벨별 오답 통계 |
| 복습 완료 표시 | PATCH | `/api/wrong-answers/:id/review` | 오답 복습 완료 상태 업데이트 |

---

## 핵심 기술 및 구현 방식

### 1. Vue 3 Composition API
**사용 이유**: 로직 재사용성 및 타입 안정성 향상

```javascript
<script setup>
import { ref, computed, onMounted } from 'vue'

// 반응형 상태
const currentStep = ref(0)
const score = ref(0)

// 계산된 속성
const progress = computed(() => {
  return (currentStep.value / totalSteps.value) * 100
})

// 라이프사이클 훅
onMounted(() => {
  fetchLevelProgress()
})
</script>
```

### 2. Pinia Store (상태 관리)
**사용 사례**: 전역 상태 관리 (인증, 네비게이션 숨김)

```javascript
// stores/useAuthStore.js
export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)

  const isLoggedIn = computed(() => !!token.value)

  return { token, user, isLoggedIn }
})

// stores/useMainStore.js
export const useMainStore = defineStore('main', () => {
  const hideBottomNav = ref(false)

  const setHideBottomNav = (state) => {
    hideBottomNav.value = state
  }

  return { hideBottomNav, setHideBottomNav }
})
```

### 3. Vue Router (SPA 라우팅)
**사용 사례**: 페이지 간 네비게이션 및 파라미터 전달

```javascript
// router/index.js
{
  path: '/learn/level/:category/:level',
  name: 'learn-level',
  component: LearnLevelView,
  props: true
}

// 컴포넌트에서 사용
const router = useRouter()
router.push({
  name: 'learn-level',
  params: { category: 'beginner', level: 1 }
})
```

### 4. Axios (HTTP 클라이언트)
**사용 사례**: RESTful API 통신

```javascript
// API 호출 예시
const fetchLevelProgress = async () => {
  try {
    const response = await axios.get('/api/learning/level-progress', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    completedLevels.value = response.data.progress
  } catch (error) {
    console.error('Failed to fetch progress:', error)
  }
}
```

### 5. OpenAI API (AI 문제 생성)
**사용 사례**: 마무리 테스트 개인화 문제 생성

**특징**:
- GPT-4o-mini 모델 사용 (비용 효율적)
- Temperature 0.2 (일관된 결과)
- JSON 응답 포맷 강제
- 병렬 처리로 생성 속도 향상

```javascript
// 서버 측 (Node.js)
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ],
  temperature: 0.2,
  max_tokens: 3000,
  response_format: { type: "json_object" }
})

const questions = JSON.parse(completion.choices[0].message.content).questions
```

### 6. vue-i18n (다국어 지원)
**사용 사례**: 한국어/영어 토글

```javascript
// 컴포넌트에서 사용
const { t, locale } = useI18n()

// 번역 키 사용
const text = t('learnLevel.intro.start')

// 언어에 따른 표시 텍스트
const currentExplanation = computed(() => {
  return locale.value === 'en'
    ? expr.explanationEn || expr.explanation
    : expr.explanation
})
```

### 7. MySQL + Sequelize (데이터베이스)
**사용 테이블**:

#### LevelProgress (레벨 진행도)
```sql
CREATE TABLE level_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  isCompleted BOOLEAN DEFAULT FALSE,
  completedAt DATETIME,
  quizScore INT,
  timeSpent INT,
  lastAccessedAt DATETIME,
  INDEX idx_user_category (userId, category),
  INDEX idx_user_level (userId, category, level)
);
```

#### WrongAnswer (오답 노트)
```sql
CREATE TABLE wrong_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  level INT NOT NULL,
  questionType ENUM('quiz', 'level_test'),
  question TEXT NOT NULL,
  questionVi TEXT,
  correctAnswer VARCHAR(255) NOT NULL,
  userAnswer VARCHAR(255) NOT NULL,
  options JSON,
  explanation TEXT,
  explanationVi TEXT,
  isReviewed BOOLEAN DEFAULT FALSE,
  reviewedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_category (userId, category),
  INDEX idx_user_reviewed (userId, isReviewed)
);
```

### 8. 게임 루프 구현
**사용 기술**: setInterval + requestAnimationFrame

```javascript
// 글자 생성 (0.7초마다)
charSpawnId.value = setInterval(spawnChar, 700)

// 게임 루프 (30fps)
gameLoopId.value = setInterval(gameLoop, 33)

// 게임 루프 함수
const gameLoop = () => {
  for (let i = fallingChars.value.length - 1; i >= 0; i--) {
    const char = fallingChars.value[i]
    char.y += char.speed  // 아래로 이동

    // 화면 밖으로 나가면 제거
    if (char.y >= areaHeight + 50) {
      fallingChars.value.splice(i, 1)
      lives.value--  // 라이프 감소
    }
  }
}
```

### 9. CSS 애니메이션
**주요 애니메이션**:

```css
/* 슬라이드 업 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 펄스 효과 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(49, 130, 246, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(49, 130, 246, 0);
  }
}

/* 원 채우기 */
@keyframes fillCircle {
  0% { transform: scale(0.8); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### 10. 반응형 디자인
**브레이크포인트**:
- 데스크톱: > 768px
- 태블릿: 481px ~ 768px
- 모바일: ≤ 480px

**미디어 쿼리 예시**:
```css
@media (max-width: 768px) {
  .book-pages-wrapper {
    flex-direction: column;  /* 2페이지 → 1페이지 */
  }

  .book-page.empty-page {
    display: none;  /* 빈 페이지 숨김 */
  }
}
```

---

## 구현 성과 및 개선점

### 성과
1. **학습 경험 향상**: 미니게임으로 대기 시간의 지루함 해소
2. **개인화된 평가**: AI 기반 사용자 맞춤형 문제 생성
3. **효율적인 복습 시스템**: 오답 노트로 취약점 집중 복습
4. **직관적인 진행도 시각화**: 게임처럼 레벨 완료 현황 표시

### 개선 가능한 점
1. **미니게임 다양화**: 여러 종류의 미니게임 추가
2. **학습 분석 대시보드**: 학습 패턴 및 취약점 시각화
3. **음성 인식**: 발음 평가 기능 추가
4. **소셜 기능**: 친구와 학습 진행도 비교

---

**작성일**: 2025-12-09
**작성자**: Claude Code
