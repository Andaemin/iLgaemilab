# 오답 노트 시스템 문서

## 1. 시스템 개요

### 1-1. 설명
오답 노트는 사용자가 학습 중 틀린 문제를 자동으로 수집하고, 이를 체계적으로 복습할 수 있도록 돕는 학습 관리 시스템입니다. 레벨별 퀴즈와 마무리 테스트에서 틀린 문제들이 자동으로 저장되며, 사용자는 난이도별로 분류된 오답을 교과서 형태로 복습하거나 복습 테스트를 통해 완벽하게 이해할 수 있습니다.

### 1-2. 핵심 특징

#### 자동 오답 수집
- 레벨별 퀴즈 및 마무리 테스트에서 틀린 문제 자동 저장
- 문제, 정답, 사용자 답안, 선택지, 해설을 모두 포함
- 중복 문제 자동 감지 및 업데이트

#### 난이도별 분류 (교과서 시스템)
- **초급(Beginner)** 🌱: 기본 인사와 자기소개, 숫자와 시간, 위치 표현
- **중급(Intermediate)** 🌿: 일상 대화, 날씨, 취미, 의견 표현
- **고급(Advanced)** 🌳: 길 안내, 업무 표현, 문화, 문제 해결

#### 교과서 스타일 학습 모드
- 2페이지씩 펼쳐진 책 형태의 UI
- 왼쪽/오른쪽 페이지에 각각 하나의 오답 문제 표시
- 내 답변(오답)과 정답을 비교하여 표시
- 상세한 해설 제공

#### 복습 테스트 모드
- 난이도별 오답 문제로 구성된 복습 테스트
- 정답률 80% 이상 시 통과
- 맞춘 문제는 오답 노트에서 자동 삭제
- 실시간 진행률 및 점수 표시

#### 진행 상황 추적
- 각 난이도별 오답 개수 실시간 표시
- 복습 완료 여부 추적
- 카테고리별 통계 제공

---

## 2. 파일 구조

### 2-1. 클라이언트

#### Vue 컴포넌트
```
client/src/views/
├── WrongAnswersView.vue        # 오답 노트 메인 페이지 (교과서 선택 및 학습)
└── ReviewTestView.vue          # 복습 테스트 페이지
```

#### 스토어
```
client/src/stores/
└── useMainStore.js             # BottomNav 숨김 상태 관리 (hideBottomNav)
```

#### 라우팅
```javascript
// client/src/router/index.js
{
  path: '/wrong-answers',
  name: 'wrong-answers',
  component: WrongAnswersView
},
{
  path: '/review-test/:category',
  name: 'review-test',
  component: ReviewTestView,
  props: true
}
```

### 2-2. 서버

#### 데이터베이스 모델
```
server/src/models/
└── WrongAnswer.js              # 오답 데이터 모델
```

#### API 라우터
```
server/src/routers/
├── wrongAnswers.mjs            # 오답 CRUD API
└── learning.mjs                # 학습 진행 및 오답 저장 로직
```

---

## 3. 주요 컴포넌트

### 3-1. WrongAnswersView.vue
**역할**: 오답 노트 시스템의 메인 컴포넌트

**주요 기능**:
- 오답 문제 목록 조회 및 난이도별 분류
- 교과서 선택 화면 (초급/중급/고급)
- 2페이지 교과서 스타일 학습 모드
- 복습 테스트 시작 (ReviewTestView로 라우팅)

**UI 특징**:
- **메인 화면**:
  - 3개의 교과서 카드 (초급,중급, 고급)
  - 각 카드에 오답 개수 표시
  - 오답이 없는 카테고리는 비활성화
  - 빈 상태(Empty State): 모든 오답이 없을 때 축하 메시지

- **교과서 읽기 모드**:
  - 상단: 뒤로가기 버튼, 카테고리 배지, 진행률, "복습 테스트" 버튼
  - 중앙: 2페이지 펼친 책 형태
    - 왼쪽 페이지: 홀수 번째 문제
    - 오른쪽 페이지: 짝수 번째 문제
  - 각 페이지 구성:
    - Question 번호 라벨
    - 문제 내용
    - 내 답변 (빨간색 배경, ❌ 아이콘)
    - 정답 (초록색 배경, ✅ 아이콘)
    - 해설 박스 (노란색 배경, 💡 아이콘)
  - 하단: 이전/다음 버튼 (하단 고정)
  - 페이지 넘김: 2페이지씩 이동

**코드 위치**: [client/src/views/WrongAnswersView.vue](../client/src/views/WrongAnswersView.vue)

**주요 상태 변수**:
```javascript
const wrongAnswers = ref([])              // 전체 오답 목록
const selectedBook = ref(null)            // 선택된 교과서 (beginner/intermediate/advanced)
const currentPageIndex = ref(0)           // 현재 페이지 인덱스
const isReviewTestMode = ref(false)       // 복습 테스트 모드 여부
```

**주요 함수**:
- `fetchWrongAnswers()`: 복습 안 한 오답 목록 가져오기 (isReviewed: false)
- `selectBook(category)`: 교과서 선택 및 BottomNav 숨김
- `closeBook()`: 교과서 닫기 및 BottomNav 표시
- `nextPage()` / `prevPage()`: 2페이지씩 이동 (교과서 모드)
- `startReviewTest()`: 복습 테스트 페이지로 라우팅

---

### 3-2. ReviewTestView.vue
**역할**: 오답 복습 테스트 전용 페이지

**주요 기능**:
- 선택한 난이도의 오답 문제를 테스트 형태로 제공
- 4지선다 형식
- 정답 즉시 피드백
- 맞춘 문제는 오답 노트에서 자동 삭제
- 모든 문제 완료 시 오답 노트 메인으로 복귀

**UI 특징**:
- **헤더**:
  - 나가기 버튼
  - 카테고리 배지 (난이도 아이콘 + 이름)
  - 진행률 바 (예: 3 / 10)
  - 현재 점수 표시

- **문제 카드**:
  - 문제 제목
  - 4개의 선택지 버튼
    - 각 버튼: 알파벳 번호(A, B, C, D) + 텍스트
    - 선택 시 정답/오답 색상 변경
    - 정답: 초록색 배경, ✓ 아이콘
    - 오답: 빨간색 배경, ✗ 아이콘

- **피드백 섹션** (답변 후 표시):
  - 정답 시: 🎉 "정답입니다!"
  - 오답 시: 😅 "정답: [정답 내용]"
  - 해설 박스 (💡 아이콘 + 설명)

**코드 위치**: [client/src/views/ReviewTestView.vue](../client/src/views/ReviewTestView.vue)

**주요 상태 변수**:
```javascript
const questions = ref([])                 // 복습 테스트 문제 목록
const currentQuestionIndex = ref(0)       // 현재 문제 인덱스
const answers = ref({})                   // 사용자 답변 { questionIndex: optionIndex }
const score = ref(0)                      // 정답 개수
```

**주요 함수**:
- `fetchWrongAnswers()`: 해당 카테고리의 복습 안 한 오답 가져오기
- `selectAnswer(optionIndex)`: 답안 선택 및 정답 체크
  - 정답인 경우: 점수 증가, 오답 노트에서 삭제 (DELETE API 호출)
  - 1.5초 후 다음 문제로 자동 이동
- `completeTest()`: 모든 문제 완료 시 오답 노트로 복귀

---

## 4. 데이터 구조

### 4-1. 데이터베이스 모델 (WrongAnswer)

**테이블명**: `wrong_answers`

**필드 정의**:
```javascript
{
  id: INTEGER (Primary Key, Auto Increment),
  userId: INTEGER (Not Null) - 사용자 ID,
  category: STRING(50) (Not Null) - 카테고리 (beginner/intermediate/advanced),
  level: INTEGER (Not Null) - 레벨 (1-5),
  questionType: ENUM('quiz', 'level_test') (Not Null) - 문제 유형,
  question: TEXT (Not Null) - 문제 내용,
  questionVi: TEXT - 문제 내용 (베트남어),
  correctAnswer: STRING(255) (Not Null) - 정답,
  userAnswer: STRING(255) (Not Null) - 사용자가 선택한 오답,
  options: JSON - 선택지 목록 배열,
  explanation: TEXT - 해설,
  explanationVi: TEXT - 해설 (베트남어),
  isReviewed: BOOLEAN (Default: false) - 복습 완료 여부,
  reviewedAt: DATE - 복습한 날짜,
  createdAt: TIMESTAMP - 생성 날짜,
  updatedAt: TIMESTAMP - 수정 날짜
}
```

**인덱스**:
- `userId` - 사용자별 오답 조회 최적화
- `userId, category` - 사용자+카테고리별 조회 최적화
- `userId, isReviewed` - 복습 여부 필터링 최적화

**코드 위치**: [server/src/models/WrongAnswer.js](../server/src/models/WrongAnswer.js)

---

### 4-2. API 엔드포인트

#### 오답 저장
```
POST /api/wrong-answers/save
Authorization: Bearer <token>

Request Body:
{
  category: "beginner",
  level: 1,
  questionType: "quiz",
  question: "다음 중 'Hello'의 한국어 표현은?",
  questionVi: "Biểu hiện tiếng Hàn của 'Hello' là gì?",
  correctAnswer: "안녕하세요",
  userAnswer: "안녕",
  options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
  explanation: "'안녕하세요'는 가장 기본적인 인사말입니다.",
  explanationVi: "'안녕하세요' là lời chào cơ bản nhất."
}

Response:
{
  success: true,
  message: "오답이 저장되었습니다.",
  wrongAnswer: { ... }
}
```

#### 오답 목록 조회
```
GET /api/wrong-answers/list
Authorization: Bearer <token>

Query Parameters:
- category (optional): 카테고리 필터링 (beginner/intermediate/advanced)
- level (optional): 레벨 필터링 (1-5)
- questionType (optional): 문제 유형 필터링 (quiz/level_test)
- isReviewed (optional): 복습 여부 필터링 (true/false)

Response:
{
  success: true,
  wrongAnswers: [ ... ],
  stats: [ ... ],
  total: 15
}
```

#### 오답 삭제
```
DELETE /api/wrong-answers/:id
Authorization: Bearer <token>

Response:
{
  success: true,
  message: "오답이 삭제되었습니다."
}
```

#### 오답 통계
```
GET /api/wrong-answers/stats
Authorization: Bearer <token>

Response:
{
  success: true,
  stats: {
    total: 25,
    reviewed: 10,
    notReviewed: 15,
    byCategory: [
      { category: "beginner", count: 10 },
      { category: "intermediate", count: 8 },
      { category: "advanced", count: 7 }
    ],
    byLevel: [
      { level: 1, count: 5 },
      { level: 2, count: 4 },
      ...
    ]
  }
}
```

**코드 위치**: [server/src/routers/wrongAnswers.mjs](../server/src/routers/wrongAnswers.mjs)

---

## 5. 페이지 플로우

### 5-1. 오답 노트 진입 및 학습

```
1. 사용자가 하단 네비게이션에서 "오답 노트" 클릭
   ↓
2. WrongAnswersView 진입
   ↓
3. fetchWrongAnswers() 호출
   - GET /api/wrong-answers/list?isReviewed=false
   - 복습 안 한 오답만 가져오기
   ↓
4. 난이도별 그룹화 (groupedByCategory)
   - beginner, intermediate, advanced
   ↓
5-a. 오답이 있는 경우:
   - 3개의 교과서 카드 표시 (각 카드에 오답 개수)
   - 사용자가 교과서 선택
   ↓
6. selectBook(category) 호출
   - selectedBook 설정
   - BottomNav 숨김 (hideBottomNav = true)
   ↓
7. 교과서 읽기 모드 진입
   - 2페이지씩 펼쳐진 책 형태
   - 각 페이지에 오답 1개씩 표시
   - 내 답변 vs 정답 비교
   - 해설 표시
   ↓
8-a. 사용자가 "이전/다음" 버튼 클릭
   - prevPage() / nextPage() 호출
   - 2페이지씩 이동
   - 스크롤 최상단으로 이동
   ↓ (또는)
8-b. 사용자가 "복습 테스트" 버튼 클릭
   - startReviewTest() 호출
   - router.push({ name: 'review-test', params: { category } })
   - ReviewTestView로 이동
   ↓
9. closeBook() 호출 (뒤로가기 버튼 클릭 시)
   - selectedBook = null
   - BottomNav 다시 표시 (hideBottomNav = false)
   - 오답 목록 다시 조회 (fetchWrongAnswers)
```

**빈 상태 (Empty State)**:
```
5-b. 오답이 없는 경우:
   - 축하 메시지 표시
   - "모든 문제를 완벽하게 이해했어요!"
   - "학습하러 가기" 버튼 → Learn 페이지로 이동
```

---

### 5-2. 복습 테스트 플로우

```
1. 사용자가 교과서 읽기 모드에서 "복습 테스트" 버튼 클릭
   ↓
2. ReviewTestView 진입 (category 파라미터 전달)
   ↓
3. fetchWrongAnswers() 호출
   - GET /api/wrong-answers/list?category={category}&isReviewed=false
   ↓
4. 첫 번째 문제 표시
   - 문제 제목
   - 4개 선택지
   - 진행률 바 (1/10)
   - 현재 점수 (0)
   ↓
5. 사용자가 답안 선택
   ↓
6. selectAnswer(optionIndex) 호출
   ↓
7-a. 정답인 경우:
   - score 증가
   - DELETE /api/wrong-answers/:id 호출 (오답 노트에서 삭제)
   - 초록색 배경, ✓ 아이콘 표시
   - 🎉 "정답입니다!" 메시지
   ↓ (또는)
7-b. 오답인 경우:
   - 빨간색 배경, ✗ 아이콘 표시
   - 😅 "정답: [정답 내용]" 메시지
   ↓
8. 해설 표시 (explanation)
   ↓
9. 1.5초 대기 (피드백 확인 시간)
   ↓
10-a. 다음 문제가 있는 경우:
   - currentQuestionIndex 증가
   - 다음 문제 표시
   - 스크롤 최상단으로 이동
   - 5번으로 돌아가기
   ↓ (또는)
10-b. 마지막 문제인 경우:
   - completeTest() 호출
   - "모든 문제를 다 풀었습니다!" 알림
   - router.push({ name: 'wrong-answers' })
   - WrongAnswersView로 복귀
```

**나가기 플로우**:
```
사용자가 "나가기" 버튼 클릭
   ↓
goBack() 호출
   ↓
router.push({ name: 'wrong-answers' })
   ↓
WrongAnswersView로 복귀
```

---

## 6. 주요 기능 설명

### 6-1. 자동 오답 수집

**발생 지점**:
1. **레벨별 퀴즈** (LearnLevelView.vue)
2. **마무리 테스트** (FinalTestView.vue)

**저장 로직**:
```javascript
// 마무리 테스트 결과 저장 예시
POST /api/learning/final-test-result
{
  category: "beginner",
  score: 15,
  totalQuestions: 20,
  passed: false,
  wrongAnswers: [
    {
      level: 0,  // 마무리 테스트는 level 0
      question: "다음 중 'Hello'의 한국어 표현은?",
      questionVi: "...",
      correctAnswer: "안녕하세요",
      userAnswer: "안녕",
      options: ["안녕하세요", "안녕", "반갑습니다", "감사합니다"],
      explanation: "'안녕하세요'는 가장 기본적인 인사말입니다.",
      explanationVi: "..."
    }
  ]
}
```

**중복 처리**:
- 같은 문제를 다시 틀릴 경우 기존 오답 업데이트
- `isReviewed` 초기화 (false)
- `userAnswer` 업데이트

**코드 위치**:
- [server/src/routers/learning.mjs:1023-1048](../server/src/routers/learning.mjs#L1023-L1048) (오답 저장)
- [server/src/routers/wrongAnswers.mjs:26-49](../server/src/routers/wrongAnswers.mjs#L26-L49) (중복 체크 및 업데이트)

---

### 6-2. 난이도별 분류 시스템

**카테고리 정의**:
```javascript
const categoryMap = {
  beginner: {
    name: '초급',
    color: '#3182F6',      // 파란색
    icon: '🌱',
    bgColor: '#EFF6FF',
    bookColor: '#60a5fa'
  },
  intermediate: {
    name: '중급',
    color: '#10b981',      // 초록색
    icon: '🌿',
    bgColor: '#F0FDF4',
    bookColor: '#34d399'
  },
  advanced: {
    name: '상급',
    color: '#f59e0b',      // 주황색
    icon: '🌳',
    bgColor: '#FFFBEB',
    bookColor: '#fbbf24'
  }
}
```

**그룹화 로직**:
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
```

**통계 표시**:
```javascript
const bookStats = computed(() => {
  return {
    beginner: groupedByCategory.value.beginner.length,
    intermediate: groupedByCategory.value.intermediate.length,
    advanced: groupedByCategory.value.advanced.length
  }
})
```

**UI 표현**:
- 각 난이도별 카드에 오답 개수 표시
- 오답이 없는 경우: 카드 비활성화 (disabled) + "완벽!" 배지
- 오답이 있는 경우: "복습 가능" 배지 + 클릭 가능

**코드 위치**: [client/src/views/WrongAnswersView.vue:31-111](../client/src/views/WrongAnswersView.vue#L31-L111)

---

### 6-3. 교과서 스타일 학습

**2페이지 레이아웃**:
```html
<div class="book-pages-wrapper">
  <!-- 왼쪽 페이지 (홀수) -->
  <TossCard class="book-page" v-if="currentBookPages[currentPageIndex]">
    <div class="page-header">
      <span class="page-label">Question {{ (currentPageIndex) + 1 }}</span>
    </div>
    <h3 class="question-title">{{ currentBookPages[currentPageIndex].question }}</h3>

    <!-- 내 답변 vs 정답 비교 -->
    <div class="answer-comparison">
      <!-- 내 답변 (오답) -->
      <div class="answer-item wrong">
        <div class="answer-badge wrong">❌ 내 답변</div>
        <div class="answer-content">{{ currentBookPages[currentPageIndex].userAnswer }}</div>
      </div>

      <!-- 정답 -->
      <div class="answer-item correct">
        <div class="answer-badge correct">✅ 정답</div>
        <div class="answer-content">{{ currentBookPages[currentPageIndex].correctAnswer }}</div>
      </div>
    </div>

    <!-- 해설 -->
    <div class="explanation-box" v-if="currentBookPages[currentPageIndex].explanation">
      <div class="explanation-header">💡 해설</div>
      <p class="explanation-text">{{ currentBookPages[currentPageIndex].explanation }}</p>
    </div>
  </TossCard>

  <!-- 오른쪽 페이지 (짝수) -->
  <TossCard class="book-page" v-if="currentBookPages[currentPageIndex + 1]">
    <!-- 동일 구조 -->
  </TossCard>

  <!-- 빈 페이지 (마지막이 홀수일 때) -->
  <div class="book-page empty-page" v-else-if="currentPageIndex % 2 === 0">
    <div class="empty-page-text">📖</div>
  </div>
</div>
```

**페이지 네비게이션**:
```javascript
// 다음 페이지 (2페이지씩 이동)
const nextPage = () => {
  if (currentPageIndex.value < currentBookPages.value.length - 1) {
    currentPageIndex.value += 2  // 2페이지씩
    if (currentPageIndex.value >= currentBookPages.value.length) {
      currentPageIndex.value = currentBookPages.value.length - 1
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 이전 페이지 (2페이지씩 이동)
const prevPage = () => {
  if (currentPageIndex.value > 0) {
    currentPageIndex.value -= 2  // 2페이지씩
    if (currentPageIndex.value < 0) {
      currentPageIndex.value = 0
    }
  }
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

**진행률 표시**:
```javascript
// 현재 페이지 / 전체 페이지 (2페이지 단위)
const progressText = `${Math.floor(currentPageIndex / 2) + 1} / ${Math.ceil(currentBookPages.length / 2)}`

// 진행률 바
const progressPercentage = Math.round(((Math.floor(currentPageIndex / 2) + 1) / Math.ceil(currentBookPages.length / 2)) * 100)
```

**디자인 특징**:
- 카드 배경: 흰색, 둥근 모서리 (16px)
- 카드 그림자: `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)`
- 호버 효과: 살짝 위로 올라가는 애니메이션 (translateY(-2px))
- 슬라이드 애니메이션: 페이지 전환 시 fadeIn + slideUp 효과

**코드 위치**: [client/src/views/WrongAnswersView.vue:353-441](../client/src/views/WrongAnswersView.vue#L353-L441)

---

### 6-4. 복습 테스트

**테스트 시작**:
```javascript
const startReviewTest = () => {
  console.log('🎯 복습 테스트 시작:', {
    category: selectedBook.value,
    totalQuestions: currentBookPages.value.length
  })

  router.push({
    name: 'review-test',
    params: {
      category: selectedBook.value
    }
  })
}
```

**정답 체크 및 오답 삭제**:
```javascript
const selectAnswer = async (optionIndex) => {
  // 이미 답변한 문제는 다시 선택 불가
  if (answers.value[currentQuestionIndex.value] !== undefined) return

  const question = currentQuestion.value
  answers.value[currentQuestionIndex.value] = optionIndex

  // 정답 체크
  const isCorrect = question.correctAnswer === question.options[optionIndex]

  if (isCorrect) {
    score.value++

    // 맞춘 문제는 오답 노트에서 삭제
    try {
      await axios.delete(`/api/wrong-answers/${question.id}`, {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      })
      console.log(`✅ 오답 삭제 성공 - Question ID: ${question.id}`)
    } catch (error) {
      console.error('❌ 오답 삭제 실패:', error)
    }
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

**피드백 UI**:
```html
<!-- 정답 피드백 -->
<div v-if="answers[currentQuestionIndex] !== undefined" class="feedback-section">
  <!-- 정답인 경우 -->
  <div v-if="currentQuestion.correctAnswer === currentQuestion.options[answers[currentQuestionIndex]]"
       class="feedback correct">
    <span class="feedback-icon">🎉</span>
    <span class="feedback-text">정답입니다!</span>
  </div>

  <!-- 오답인 경우 -->
  <div v-else class="feedback incorrect">
    <span class="feedback-icon">😅</span>
    <span class="feedback-text">정답: {{ currentQuestion.correctAnswer }}</span>
  </div>

  <!-- 해설 -->
  <div v-if="currentQuestion.explanation" class="explanation">
    <div class="explanation-header">💡 해설</div>
    <p class="explanation-text">{{ currentQuestion.explanation }}</p>
  </div>
</div>
```

**진행률 및 점수 표시**:
```html
<div class="progress-section">
  <div class="progress-text">
    <span class="current">{{ currentQuestionIndex + 1 }}</span>
    <span class="divider">/</span>
    <span class="total">{{ questions.length }}</span>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" :style="{ width: progress + '%' }"></div>
  </div>
</div>

<div class="score-info">
  현재 점수: <strong>{{ score }}</strong>
</div>
```

**완료 플로우**:
```javascript
const completeTest = () => {
  setTimeout(() => {
    alert('모든 문제를 다 풀었습니다! 오답 노트로 돌아갑니다.')
    router.push({ name: 'wrong-answers' })
  }, 500)
}
```

**코드 위치**: [client/src/views/ReviewTestView.vue:98-154](../client/src/views/ReviewTestView.vue#L98-L154)

---

### 6-5. BottomNav 숨김 처리

**목적**: 교과서 읽기 모드와 복습 테스트 모드에서 하단 네비게이션 바를 숨겨 학습에 집중할 수 있도록 함

**상태 관리** (Pinia Store):
```javascript
// client/src/stores/useMainStore.js
export const useMainStore = defineStore('main', () => {
  const hideBottomNav = ref(false)

  const setHideBottomNav = (state) => {
    hideBottomNav.value = state
  }

  return {
    hideBottomNav,
    setHideBottomNav
  }
})
```

**교과서 선택 시 숨김**:
```javascript
// WrongAnswersView.vue
const selectBook = (category) => {
  selectedBook.value = category
  mainStore.setHideBottomNav(true)  // BottomNav 숨김
}

const closeBook = () => {
  selectedBook.value = null
  mainStore.setHideBottomNav(false)  // BottomNav 다시 표시
}
```

**BottomNav 컴포넌트**:
```vue
<template>
  <nav v-if="!mainStore.hideBottomNav" class="toss-bottom-nav">
    <!-- 네비게이션 아이템들 -->
  </nav>
</template>

<script setup>
import { useMainStore } from '@/stores/useMainStore'
const mainStore = useMainStore()
</script>
```

**언마운트 시 복구**:
```javascript
// WrongAnswersView.vue
onUnmounted(() => {
  mainStore.setHideBottomNav(false)
})
```

**코드 위치**:
- [client/src/stores/useMainStore.js:8-27](../client/src/stores/useMainStore.js#L8-L27)
- [client/src/views/WrongAnswersView.vue:134-153](../client/src/views/WrongAnswersView.vue#L134-L153)

---

## 7. 디자인 시스템

### 7-1. 색상 팔레트

**카테고리별 색상**:
- **초급 (Beginner)**:
  - 메인: `#3182F6` (파란색)
  - 배경: `#EFF6FF` (연한 파란색)
  - 아이콘: 🌱

- **중급 (Intermediate)**:
  - 메인: `#10b981` (초록색)
  - 배경: `#F0FDF4` (연한 초록색)
  - 아이콘: 🌿

- **고급 (Advanced)**:
  - 메인: `#f59e0b` (주황색)
  - 배경: `#FFFBEB` (연한 주황색)
  - 아이콘: 🌳

**상태별 색상**:
- **정답**:
  - 테두리: `#10b981` (초록색)
  - 배경: `#d1fae5` (연한 초록색)
  - 텍스트: `#065f46` (진한 초록색)

- **오답**:
  - 테두리: `#ef4444` (빨간색)
  - 배경: `#fee2e2` (연한 빨간색)
  - 텍스트: `#991b1b` (진한 빨간색)

- **해설**:
  - 배경: `#fffbeb` (연한 노란색)
  - 테두리: `#fcd34d` (노란색)
  - 텍스트: `#78350f` (갈색)

### 7-2. 타이포그래피

- **페이지 제목**: `toss-title1` (24px, 700)
- **카드 제목**: `toss-title3` (18px, 600)
- **문제 제목**: `question-title` (18-20px, 600)
- **본문**: `toss-body1` (16px, 400)
- **부가 정보**: `toss-body2` (14px, 400)
- **작은 텍스트**: `toss-body3` (13px, 400)

### 7-3. 간격 (Spacing)

- `--spacing-xs`: 4px
- `--spacing-sm`: 8px
- `--spacing-md`: 16px
- `--spacing-lg`: 24px
- `--spacing-xl`: 32px
- `--spacing-2xl`: 48px

### 7-4. 카드 스타일

```css
.book-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.book-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: #3182F6;
}
```

### 7-5. 애니메이션

**슬라이드 업**:
```css
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

.book-page {
  animation: slideUp 0.4s ease;
}
```

**페이드 인**:
```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**스피너**:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-spinner {
  animation: spin 2s linear infinite;
}
```

---

## 8. 반응형 디자인

### 8-1. 브레이크포인트

**데스크톱**: `> 768px`
- 교과서 2페이지 나란히 표시
- 3열 그리드 카드 레이아웃

**모바일**: `≤ 768px`
- 교과서 1페이지씩 표시 (빈 페이지 숨김)
- 1열 그리드 카드 레이아웃
- 헤더 요소 세로 배치
- 버튼 전체 너비

### 8-2. 모바일 최적화

```css
@media (max-width: 768px) {
  /* 교과서 레이아웃 */
  .book-pages-wrapper {
    flex-direction: column;  /* 세로 배치 */
    gap: 16px;
  }

  .book-page.empty-page {
    display: none;  /* 빈 페이지 숨김 */
  }

  /* 카드 그리드 */
  .books-grid {
    grid-template-columns: 1fr;  /* 1열 */
  }

  /* 헤더 */
  .book-reader-header,
  .test-header {
    flex-direction: column;
    gap: 12px;
  }

  /* 버튼 */
  .result-actions {
    flex-direction: column;
  }

  .result-actions .toss-button {
    width: 100%;
  }
}
```

---

## 9. 사용자 경험 (UX) 특징

### 9-1. 직관적인 시각적 피드백

- **색상 코딩**: 정답(초록), 오답(빨강), 해설(노랑) 즉시 구분 가능
- **아이콘 사용**: ❌ ✅ 💡 🎉 😅 등으로 의미 강화
- **애니메이션**: 부드러운 페이지 전환과 호버 효과

### 9-2. 진행 상황 투명성

- **실시간 진행률 바**: 복습 테스트에서 현재 위치 명확히 표시
- **페이지 번호**: 교과서 모드에서 "3 / 10" 형태로 진행 상황 표시
- **점수 표시**: 복습 테스트에서 현재 점수 실시간 업데이트

### 9-3. 학습 집중 환경

- **BottomNav 자동 숨김**: 학습 모드 진입 시 하단 네비게이션 제거
- **전체 화면 활용**: 교과서 및 테스트 화면 최대 활용
- **자동 스크롤**: 페이지/문제 전환 시 최상단으로 자동 이동

### 9-4. 즉각적인 피드백

- **답안 선택 즉시 피드백**: 정답/오답 색상 변경 + 메시지 표시
- **1.5초 대기 시간**: 피드백 확인 후 자동 다음 문제 이동
- **해설 자동 표시**: 답안 선택 시 해설 즉시 표시

### 9-5. 성취감 부여

- **오답 자동 삭제**: 맞춘 문제는 즉시 오답 노트에서 제거
- **빈 상태 축하 메시지**: 모든 오답 해결 시 "완벽!" 메시지
- **진행 바 완료 애니메이션**: 100% 도달 시 시각적 효과

---

## 10. 기술적 고려사항

### 10-1. 성능 최적화

**컴포넌트 최적화**:
- `computed` 속성 활용으로 불필요한 재계산 방지
- `v-if` / `v-show` 적절히 사용하여 DOM 관리

**API 호출 최적화**:
- 오답 목록은 페이지 진입 시 한 번만 조회
- 복습 완료 후에만 재조회 (불필요한 API 호출 방지)

**애니메이션 성능**:
- `transform`, `opacity` 속성 사용 (GPU 가속)
- `transition` 대신 `animation` 사용으로 부드러운 효과

### 10-2. 상태 관리

**로컬 상태** (Vue ref):
- `wrongAnswers`: 오답 목록
- `selectedBook`: 선택된 교과서
- `currentPageIndex`: 현재 페이지 인덱스
- `answers`: 복습 테스트 답안
- `score`: 복습 테스트 점수

**전역 상태** (Pinia Store):
- `hideBottomNav`: BottomNav 숨김 상태

### 10-3. 라우팅

**라우트 파라미터**:
```javascript
{
  path: '/review-test/:category',
  name: 'review-test',
  component: ReviewTestView,
  props: true  // category 파라미터를 props로 전달
}
```

**네비게이션 가드**:
```javascript
onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login' })
    return
  }
  fetchWrongAnswers()
})
```

### 10-4. 에러 처리

**API 에러 처리**:
```javascript
try {
  const response = await axios.get('/api/wrong-answers/list', {
    headers: { Authorization: `Bearer ${authStore.token}` }
  })
  wrongAnswers.value = response.data.wrongAnswers
} catch (error) {
  console.error('❌ 오답 목록 조회 실패:', error)
  // 사용자에게 에러 메시지 표시
}
```

**빈 데이터 처리**:
```javascript
// 오답이 없을 경우 빈 상태 표시
if (questions.value.length === 0) {
  alert('복습할 문제가 없습니다.')
  router.push({ name: 'wrong-answers' })
}
```

---

## 11. 향후 개선 방향

### 11-1. 기능 확장

- [ ] **복습 일정 알림**: 일정 기간 후 재복습 알림 기능
- [ ] **난이도 조정**: 사용자의 학습 패턴에 따른 문제 난이도 자동 조정
- [ ] **통계 대시보드**: 오답 패턴 분석 및 취약점 시각화
- [ ] **플래시카드 모드**: 빠른 복습을 위한 카드 넘기기 모드
- [ ] **음성 지원**: 문제와 해설 음성 읽기 기능

### 11-2. UX 개선

- [ ] **스와이프 제스처**: 모바일에서 스와이프로 페이지 넘기기
- [ ] **북마크 기능**: 특정 오답 문제 북마크 저장
- [ ] **메모 기능**: 각 오답 문제에 개인 메모 추가
- [ ] **다크 모드**: 야간 학습을 위한 다크 테마
- [ ] **글꼴 크기 조정**: 사용자 맞춤형 글꼴 크기

### 11-3. 성능 개선

- [ ] **가상 스크롤**: 오답이 많을 경우 가상 스크롤 적용
- [ ] **이미지 레이지 로딩**: 문제 이미지 지연 로딩
- [ ] **오프라인 지원**: PWA 기능으로 오프라인 복습 가능
- [ ] **캐싱 전략**: 자주 조회하는 데이터 로컬 캐싱

### 11-4. 분석 기능

- [ ] **학습 시간 추적**: 각 오답 복습 소요 시간 기록
- [ ] **반복 오답 감지**: 여러 번 틀린 문제 하이라이트
- [ ] **복습 효과 측정**: 복습 전후 성취도 비교
- [ ] **학습 패턴 분석**: 시간대별, 요일별 학습 패턴 분석

---

## 12. 참고 자료

### 12-1. 관련 컴포넌트

- [WrongAnswersView.vue](../client/src/views/WrongAnswersView.vue) - 오답 노트 메인
- [ReviewTestView.vue](../client/src/views/ReviewTestView.vue) - 복습 테스트
- [LearnLevelView.vue](../client/src/views/LearnLevelView.vue) - 레벨 학습 (오답 발생 지점)
- [FinalTestView.vue](../client/src/views/FinalTestView.vue) - 마무리 테스트 (오답 발생 지점)

### 12-2. 관련 API

- [wrongAnswers.mjs](../server/src/routers/wrongAnswers.mjs) - 오답 CRUD API
- [learning.mjs](../server/src/routers/learning.mjs) - 학습 진행 및 오답 저장

### 12-3. 데이터 모델

- [WrongAnswer.js](../server/src/models/WrongAnswer.js) - 오답 데이터베이스 모델

### 12-4. i18n 파일

- [ko.json](../client/src/locales/ko.json) - 한국어 번역
- [en.json](../client/src/locales/en.json) - 영어 번역

---

**문서 작성일**: 2025-12-09
**문서 버전**: 1.0
**작성자**: Claude Code
