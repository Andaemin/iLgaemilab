# 일개미랩 - Code Conventions & Rules

> **최종 업데이트**: 2024-09-19
> **주요 변경사항**: Tailwind CSS 통합, Vuetify 우선순위 규칙 추가, 동적 import 필수화

## 프로젝트 구조
```
ILgaemiLab/
├── client/          # Vue.js 프론트엔드
├── server/          # Node.js Express 백엔드
└── docs/           # 문서화
```

## 📌 필수 준수 사항

### 1. UI 프레임워크 우선순위
- **1순위**: Vuetify 컴포넌트 (v-btn, v-card 등)
- **2순위**: Tailwind CSS (`tw-` prefix 필수) - 세밀한 커스터마이징 시에만 사용
- ⚠️ Tailwind 사용 시 반드시 `tw-` prefix 사용 (Vuetify와 충돌 방지)

### 2. 라우터 동적 임포트 (성능 최적화)
```javascript
// ✅ 올바른 사용
const routes = [
  { path: "/", component: HomeView },  // 메인 페이지만 직접 import
  { path: "/about", component: () => import("../views/AboutView.vue") }  // 나머지는 동적
]
```

### 3. Vue 3.5+ 문법 사용
- Composition API (`<script setup>`) 필수
- Options API 사용 금지

### 4. 상태관리
- Pinia 사용 (Vuex 사용 금지)
- Composition API 스타일로 작성

### 5. 컴포넌트 분할
- 재사용성 극대화를 위해 작은 단위로 분할
- App.vue는 라우팅과 렌더링만 담당

## 기본 규칙

### 파일 명명 규칙
- Vue 컴포넌트: PascalCase (예: `HelloWorld.vue`, `HeroSection.vue`)
- JavaScript/TypeScript 파일: camelCase (예: `useMainStore.js`, `index.js`)
- 디렉토리: kebab-case 또는 camelCase
- 라우터 파일: kebab-case (예: `eval.mjs`, `rtzr.mjs`)

### 코드 스타일

#### Client (Vue.js)
- **Framework**: Vue 3 Composition API
- **State Management**: Pinia (Composition API 스타일)
- **UI Framework**: Vuetify 3
- **Build Tool**: Vite
- **스타일**: ESLint + Prettier 사용
- **포트**: 5288 (개발 서버)

```javascript
// Pinia Store 예시 - Composition API 스타일
export const useMainStore = defineStore('main', () => {
  const user = ref(null)
  const loading = ref(false)
  
  const isAuthenticated = computed(() => !!user.value)
  
  const setUser = (userData) => {
    user.value = userData
  }
  
  return { user, loading, isAuthenticated, setUser }
})
```

#### Server (Node.js)
- **Framework**: Express.js
- **Module System**: ES Modules (type: "module")
- **템플릿 엔진**: EJS
- **포트**: 3031
- **환경변수**: .env 파일 사용 (dotenv)
- **프록시**: WebSocket 지원 (ws-proxy.mjs)

```javascript
// Express 앱 구조
import express from 'express'
import { dirname } from "dirname-filename-esm"

const app = express()
const __dirname = dirname(import.meta)

// CORS 설정
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  if (req.method === "OPTIONS") {
    res.sendStatus(200)
  } else {
    next()
  }
})
```

### 디렉토리 구조

#### Client Structure
```
client/src/
├── components/      # 재사용 컴포넌트
│   ├── home/       # 홈페이지 전용 컴포넌트
│   └── about/      # About 페이지 전용 컴포넌트
├── layouts/        # 레이아웃 컴포넌트
├── views/          # 페이지 뷰 컴포넌트
├── stores/         # Pinia 스토어
├── router/         # Vue Router 설정
└── plugins/        # Vue 플러그인 (Vuetify 등)
```

#### Server Structure
```
server/src/
├── routers/        # Express 라우터
│   ├── index.js    # 메인 라우터
│   ├── users.js    # 사용자 관련 API
│   ├── rtzr.mjs    # RTZR STT 관련 API
│   └── eval.mjs    # 평가 관련 API
├── app.js          # Express 앱 설정
└── ws-proxy.mjs    # WebSocket 프록시
```

### API 및 통신

#### API Endpoints
- `/api/users` - 사용자 관련 API
- `/ws` - WebSocket 연결
- RTZR STT API 통합
- OpenAI API 통합

#### CORS 설정
- 모든 Origin 허용 (`*`)
- GET, POST, PUT, DELETE, OPTIONS 메소드 지원
- Authorization 헤더 허용

### 개발 환경

#### Client 스크립트
```json
{
  "dev": "vite --host",
  "build": "vite build", 
  "lint": "eslint . --fix",
  "format": "prettier --write src/"
}
```

#### Server 스크립트
```json
{
  "dev": "nodemon server.mjs",
  "start": "node server.mjs"
}
```

### 의존성

#### Client 주요 의존성
- Vue 3.5.13
- Vue Router 4.5.1
- Pinia 3.0.3
- Vuetify 3.7.16
- Axios 1.9.0
- GSAP 3.13.0

#### Server 주요 의존성
- Express 4.16.1
- WebSocket (ws) 8.18.3
- OpenAI 4.104.0
- CORS 2.8.5
- dotenv 16.3.1

### 특별 규칙

1. **환경 파일**: `.env` 파일은 별도 공유 (레포지토리에 포함 안됨)
2. **WebSocket**: RTZR API와의 실시간 STT 통신
3. **프록시 설정**: 클라이언트에서 `/api`와 `/ws` 경로를 서버로 프록시
4. **정적 파일**: 서버의 public 디렉토리와 루트 디렉토리 정적 서빙

### 코딩 규칙

1. **ES Modules 사용**: import/export 문법
2. **Async/Await 선호**: Promise 체이닝보다 async/await 사용
3. **에러 처리**: try-catch 블록으로 적절한 에러 처리
4. **컴포넌트 분리**: 재사용 가능한 작은 컴포넌트로 분리
5. **상태 관리**: Pinia를 통한 중앙 집중식 상태 관리
6. **타입 안정성**: 가능한 경우 타입 검증 및 validation 추가