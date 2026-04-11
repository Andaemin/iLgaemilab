# Client Context - Vue.js Frontend

> **최종 업데이트**: 2025-09-20
> **주요 변경사항**:
> - [초기] Tailwind CSS 추가 (tw- prefix), GSAP 애니메이션 유틸리티 추가, RtzrTest 페이지 분리
> - [MVP] Quick Start 카드 JSON 데이터 구조 추가, 유틸리티 함수 구현
> - [디자인] 토스(Toss) 디자인 시스템 전체 적용, Tailwind CSS 제거
> - [스타일] 공통 CSS 클래스 체계 구축, 스타일 통일 작업 완료

## 🎨 디자인 시스템 규칙

### 핵심 원칙
1. **토스(Toss) 디자인 시스템** 전체 적용
2. **공통 CSS 우선 사용** - main.css의 클래스 활용하여 중복 방지
3. **Vue 3.5 Composition API** 사용 (`<script setup>` 문법 필수)
4. **컴포넌트 재사용성** 극대화

### 스타일 작성 규칙
- 공통 스타일은 `/src/assets/styles/main.css`에 정의
- View별 특수 스타일만 컴포넌트 `<style scoped>`에 작성
- CSS 변수 활용 (--spacing-*, --gray-*, --toss-blue 등)
- TossFaceFont로 이모지/아이콘 표현
- Pretendard 폰트 사용 (토스 프로덕트 산스 유사)

## 기술 스택
- **Framework**: Vue 3.5.13 (Composition API)
- **State Management**: Pinia 3.0.3 with persistence
- **Design System**: 토스 디자인 시스템 (커스텀)
- **UI Framework**: ~~Vuetify~~ → 토스 컴포넌트 시스템
- **Styling**: CSS Variables + 공통 클래스 체계
- **Font**: Pretendard, TossFaceFont
- **Build Tool**: Vite 6.2.1
- **Router**: Vue Router 4.5.1
- **HTTP Client**: Axios 1.9.0
- **Development Port**: 5173

## 프로젝트 구조

```
client/src/
├── components/
│   ├── home/              # 홈페이지 전용 컴포넌트
│   │   ├── HeroSection.vue
│   │   ├── FeaturesSection.vue
│   │   ├── FeatureCard.vue
│   │   └── CTASection.vue
│   ├── about/             # About 페이지 전용 컴포넌트
│   │   ├── AboutHeader.vue
│   │   ├── MissionVision.vue
│   │   ├── InfoCard.vue
│   │   ├── Timeline.vue
│   │   ├── TeamSection.vue
│   │   └── TeamMemberCard.vue
│   ├── RtzrMic.vue        # RTZR STT 마이크 컴포넌트
│   ├── RecordButton.vue   # 녹음 버튼 컴포넌트
│   ├── SttResults.vue     # STT 결과 표시 컴포넌트
│   ├── EvaluationSection.vue  # 평가 섹션 컴포넌트
│   └── HelloWorld.vue     # 예제 컴포넌트
├── data/
│   └── quickStartCards.json  # Quick Start 카드 로컬 데이터 (NEW)
├── layouts/
│   └── DefaultLayout.vue  # 기본 레이아웃
├── views/
│   ├── HomeView.vue       # 홈 페이지
│   ├── AboutView.vue      # About 페이지
│   └── RtzrTest.vue       # STT 테스트 페이지
├── stores/
│   ├── index.js          # Pinia 스토어 설정
│   └── useMainStore.js   # 메인 스토어
├── router/
│   └── index.js          # Vue Router 설정
├── utils/
│   ├── animations.js      # GSAP 애니메이션 유틸리티
│   └── quickStartCards.js # Quick Start 카드 유틸리티 (NEW)
├── plugins/
│   └── vuetify.js        # Vuetify 설정
└── main.js               # 앱 진입점
```

## 핵심 기능 및 컴포넌트

### 1. STT (Speech-to-Text) 시스템
**파일**: `components/RtzrMic.vue`

핵심 기능:
- RTZR API 기반 실시간 STT
- WebSocket을 통한 실시간 오디오 스트리밍
- 마이크 디바이스 선택 및 관리
- 오디오 레벨 시각화
- 다국어 지원 (한국어/영어)

주요 상태:
```javascript
const targetText = ref("")        // 목표 문장
const partialText = ref("")       // 실시간 부분 텍스트
const finalText = ref("")         // 최종 확정 텍스트
const isRecording = ref(false)    // 녹음 상태
const audioLevel = ref(0)         // 오디오 레벨
const language = ref("ko")        // 언어 설정
```

WebSocket 연결:
```javascript
const wsUrl = 
  `${protocol}//${window.location.host}/ws/rtzr?` +
  `encoding=OGG_OPUS&` +
  `model_name=${language.value === "ko" ? "sommers_ko" : "sommers_en"}&` +
  `use_punctuation=true&` +
  `domain=CALL&` +
  `sample_rate=16000`
```

### 2. 녹음 버튼 컴포넌트
**파일**: `components/RecordButton.vue`

특징:
- 상태에 따른 시각적 피드백
- 녹음 중 애니메이션 효과 (pulse)
- Vuetify 기반 스타일링

### 3. 상태 관리 (Pinia)
**파일**: `stores/useMainStore.js`

기본 구조:
```javascript
export const useMainStore = defineStore('main', () => {
  const user = ref(null)
  const loading = ref(false)
  
  const isAuthenticated = computed(() => !!user.value)
  
  const setUser = (userData) => { user.value = userData }
  const clearUser = () => { user.value = null }
  const setLoading = (state) => { loading.value = state }
  
  return { user, loading, isAuthenticated, setUser, clearUser, setLoading }
})
```

### 4. 라우터 설정
**파일**: `router/index.js`

현재 라우트:
- `/` - 홈페이지 (HomeView)
- `/about` - About 페이지 (AboutView, lazy loading)

## 개발 설정

### Vite 설정 (`vite.config.js`)
```javascript
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3031', changeOrigin: true },
      '/ws': { target: 'ws://localhost:3031', ws: true, changeOrigin: true }
    }
  }
})
```

### 스크립트 명령어
```json
{
  "dev": "vite --host",        // 개발 서버 (호스트 바인딩)
  "build": "vite build",       // 빌드
  "lint": "eslint . --fix",    // 린트 + 자동 수정
  "format": "prettier --write src/"  // 코드 포맷팅
}
```

## 토스 컴포넌트 작성 규칙

### 1. Composition API 필수 사용
```javascript
<script setup>
import { ref, computed, onMounted } from 'vue'

// 상태 정의
const count = ref(0)
const doubled = computed(() => count.value * 2)

// 메서드 정의
const increment = () => count.value++

// 라이프사이클
onMounted(() => {
  console.log('컴포넌트 마운트됨')
})
</script>
```

### 2. Props 및 Emits 정의
```javascript
const props = defineProps({
  isRecording: Boolean,
  disabled: Boolean
})

const emit = defineEmits(['toggle'])
```

### 3. 토스 컴포넌트 활용
- `TossButton`: 버튼 컴포넌트 (variant: primary/secondary/ghost)
- `TossCard`: 카드 컴포넌트 (clickable 옵션)
- `TossInput`: 인풋 필드 (error, multiline 지원)
- `TossSelect`: 셀렉트 박스
- `TossStepper`: 단계별 프로세스 표시

### 4. 공통 CSS 클래스 우선 사용
```vue
<div class="toss-page">
  <div class="toss-container-md">
    <div class="toss-grid toss-grid-auto">
      <!-- 내용 -->
    </div>
  </div>
</div>
```

## WebSocket 및 실시간 통신

### WebSocket 연결 관리
```javascript
// WebSocket 연결
ws = new WebSocket(wsUrl)

// 이벤트 핸들러
ws.onopen = () => { /* 연결 성공 */ }
ws.onmessage = async (event) => { /* 메시지 수신 */ }
ws.onerror = (error) => { /* 에러 처리 */ }
ws.onclose = () => { /* 연결 종료 */ }
```

### MediaRecorder API 활용
```javascript
const mediaRecorder = new MediaRecorder(audioStream, {
  mimeType: "audio/webm;codecs=opus",
  audioBitsPerSecond: 16000
})

mediaRecorder.ondataavailable = (event) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(event.data)  // 실시간 오디오 데이터 전송
  }
}
```

## 스타일링 가이드

### 1. CSS 변수 시스템
```css
:root {
  --toss-blue: #3182F6;
  --toss-blue-light: #EBF4FF;
  --gray-900: #191F28;
  --spacing-md: 16px;
  --radius-lg: 16px;
  /* ... */
}
```

### 2. 공통 클래스 활용
- 레이아웃: `toss-page`, `toss-container-*`
- 그리드: `toss-grid`, `toss-grid-2/3/4/auto`
- 컴포넌트: `toss-stat-card`, `toss-banner-*`, `toss-loading`
- 타이포그래피: `toss-headline*`, `toss-title*`, `toss-body*`

### 3. 최소한의 Scoped 스타일
```vue
<style scoped>
/* View별 특수 스타일만 작성 */
/* 공통 클래스로 해결 가능한 경우 main.css 활용 */
</style>
```

## 코딩 가이드라인

### 필수 규칙
1. **Vue 3.5 Composition API (`<script setup>`)** 필수
2. **토스 디자인 시스템** 준수
3. **공통 CSS 클래스** 우선 사용
4. **컴포넌트 재사용성** 극대화
5. **스타일 중복 방지**

### 금지 사항
- ❌ Vuetify 컴포넌트 사용 금지
- ❌ Tailwind CSS 사용 금지
- ❌ 인라인 스타일 과도한 사용 금지
- ❌ Options API 사용 금지

### 작성 순서
1. imports (토스 컴포넌트, composables)
2. reactive state 정의
3. computed properties
4. methods
5. lifecycle hooks

## 새로운 데이터 구조 (MVP)

### Quick Start 카드 데이터
**위치**: `/src/data/quickStartCards.json`

```javascript
{
  "manufacturing": {
    "id": "manufacturing",
    "name": "제조업",
    "nameVi": "Sản xuất",
    "icon": "⚙️",
    "cards": [
      {
        "id": "mfg-1",
        "order": 1,
        "korean": "안전모를 쓰세요.",
        "vietnamese": "Hãy đội mũ bảo hộ.",
        // ... 번역 및 태그
      }
    ]
  }
  // ... 5개 직무 카테고리
}
```

### 유틸리티 함수
**위치**: `/src/utils/quickStartCards.js`

- `getQuickStartCards(occupation)`: 직무별 카드 조회
- `getCardByOrder(occupation, order)`: 순서별 카드 조회
- `getRandomCard(occupation)`: 랜덤 카드 (복습용)
- `searchCardsByTag(tag)`: 태그 검색
- `getAllCards()`: 모든 카드 배열
- `normalizeTTSText(text)`: TTS 텍스트 정규화

## 현재 라우트 구조
- `/` - 홈 페이지 (HomeView) - 인증 필요
- `/login` - 로그인
- `/register` - 회원가입
- `/level-test-intro` - 레벨테스트 안내
- `/level-test` - 레벨테스트 진행
- `/about` - 소개 페이지
- `/rtzrtest` - RTZR 테스트

## 중요 사용자 요구사항
1. **"토스 앱 같은 느낌"** 유지
2. **"스타일이 격치는건 공용 css 파일에서 통일"**
3. **"컴포넌트 만들었으면 그걸 적용 시켜야지"**
4. **Vue 3.5 최신 문법 사용**
5. **TossFaceFont로 이모지 표현**