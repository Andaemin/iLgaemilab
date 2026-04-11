# Server Context - Node.js Express Backend

> **최종 업데이트**: 2025-09-20
> **주요 변경사항**:
> - [초기] Sequelize ORM 통합, MySQL 데이터베이스 연동, ES Module 전면 사용
> - [MVP] 레벨테스트, Quick Start, 직무 시나리오 API 추가, 5개 새 모델 추가
> - [인증] JWT 토큰 기반 인증 시스템 구현
> - [보안] bcrypt 암호화, CORS 설정

## 기술 스택
- **Framework**: Express.js 4.16.1
- **Runtime**: Node.js with ES Modules
- **Database**: MySQL 8.0 + Sequelize 6.37.7
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **WebSocket**: ws 8.18.3
- **AI Integration**: OpenAI 4.104.0
- **STT API**: RTZR (Vito AI)
- **HTTP Client**: node-fetch 2.7.0
- **CORS**: cors middleware
- **Environment**: dotenv 16.3.1
- **Development**: nodemon 3.0.1
- **Port**: 3031 (기본값, 환경변수로 변경 가능)

## 프로젝트 구조

```
server/
├── src/
│   ├── config/
│   │   └── database.js        # 데이터베이스 설정
│   ├── routes/
│   │   ├── auth.routes.js     # 인증 라우트 (login, register)
│   │   ├── levelTest.routes.js # 레벨테스트 라우트
│   │   ├── users.js           # 사용자 관련 API
│   │   ├── rtzr.mjs           # RTZR STT 토큰 관리
│   │   ├── eval.mjs           # OpenAI 발음 평가 API
│   │   ├── quickstart.mjs     # Quick Start 카드 API
│   │   └── jobScenarios.mjs   # 직무 시나리오 API
│   ├── middleware/
│   │   └── auth.js            # JWT 인증 미들웨어
│   ├── models/
│   │   ├── index.js            # Sequelize 초기화 및 연결
│   │   ├── User.js             # 사용자 모델 (JWT 인증 통합)
│   │   ├── LevelTestQuestion.js # 레벨테스트 문제
│   │   ├── LevelTestResult.js   # 레벨테스트 결과
│   │   ├── JobScenario.js      # 직무 시나리오
│   │   └── ScenarioDialogue.js  # 시나리오 대화
│   ├── seeders/
│   │   └── seed.js             # 레벨테스트 문제 시딩
│   ├── app.js               # Express 앱 설정 및 미들웨어
│   └── ws-proxy.mjs         # WebSocket 프록시 (RTZR 연동)
├── server.js                # 서버 진입점 (ES Modules)
├── .env                    # 환경변수 (공개금지)
├── .env.example            # 환경변수 예시
└── package.json            # 의존성 및 스크립트
```

## 핵심 기능

### 1. RTZR STT 토큰 관리
**파일**: `src/routers/rtzr.mjs`

주요 기능:
- RTZR API 인증 토큰 획득 및 캐싱
- 토큰 만료 1분 전 자동 갱신
- 에러 핸들링 및 재시도 로직

```javascript
let tokenCache = {
  token: null,
  expireAt: null
}

// 토큰 캐싱 및 만료 체크
if (tokenCache.token && tokenCache.expireAt && now < tokenCache.expireAt - 60000) {
  return res.json({ token: tokenCache.token, expireAt: tokenCache.expireAt })
}

// RTZR API 인증
const response = await fetch('https://openapi.vito.ai/v1/authenticate', {
  method: 'POST',
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    'client_id': process.env.RTZR_CLIENT_ID,
    'client_secret': process.env.RTZR_SECRET_KEY
  })
})
```

### 2. WebSocket 프록시 (실시간 STT)
**파일**: `src/ws-proxy.mjs`

핵심 기능:
- 클라이언트와 RTZR WebSocket 간 중계
- 실시간 오디오 스트리밍
- 연결 상태 관리 및 에러 처리
- 토큰 자동 갱신

WebSocket 연결 플로우:
```javascript
// 1. 클라이언트 WebSocket 연결 수신
server.on('upgrade', (request, socket, head) => {
  if (request.url && request.url.startsWith('/ws/rtzr')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  }
})

// 2. RTZR API 연결
const token = await getToken()
const rtzrUrl = `wss://openapi.vito.ai/v1/transcribe:streaming?${params}`
rtzrWs = new WebSocket(rtzrUrl, {
  headers: { 'Authorization': `Bearer ${token}` }
})

// 3. 양방향 데이터 중계
clientWs.on('message', (data) => {
  if (rtzrWs && rtzrWs.readyState === WebSocket.OPEN) {
    rtzrWs.send(data)  // 클라이언트 → RTZR
  }
})

rtzrWs.on('message', (data) => {
  if (clientWs.readyState === WebSocket.OPEN) {
    clientWs.send(data)  // RTZR → 클라이언트
  }
})
```

### 3. OpenAI 발음 평가 시스템
**파일**: `src/routers/eval.mjs`

기능:
- 목표 문장과 STT 결과 비교 분석
- GPT-4o-mini 모델 활용
- JSON 구조화된 평가 결과 제공
- 발음 교정 피드백 생성

평가 프롬프트:
```javascript
const prompt = `한국어 발음 평가를 수행합니다.
목표 문장: "${target}"
실제 발음 인식 결과: "${asrText}"

다음 기준으로 평가하세요:
1. 전체 정확도 (0-100점)
2. 잘못 발음된 부분 지적  
3. 개선 방법 제안

JSON 형식으로 응답:
{
  "score": 점수(0-100),
  "feedback": "전체 피드백",
  "errors": [
    {
      "word": "잘못된 단어",
      "expected": "예상 발음", 
      "actual": "실제 발음",
      "suggestion": "개선 방법"
    }
  ]
}`

const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: '당신은 한국어 발음 교정 전문가입니다. 이주 노동자들의 한국어 학습을 돕고 있습니다.'
    },
    { role: 'user', content: prompt }
  ],
  temperature: 0,
  response_format: { type: 'json_object' }
})
```

### 4. Express 앱 설정
**파일**: `src/app.js`

주요 설정:
- CORS 허용 (모든 Origin)
- 정적 파일 서빙
- JSON/URL 인코딩 파싱
- 에러 핸들링
- 라우터 연결

```javascript
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

// 라우터 연결
app.use('/', indexRouter)
app.use('/api/users', usersRouter)
app.use('/', rtzrRouter)        // /api/rtzr-token
app.use('/', evalRouter)        // /api/evaluate
```

## API 엔드포인트

### 기존 API

#### 1. RTZR 토큰 API
```http
GET /api/rtzr-token
```

#### 2. 발음 평가 API
```http
POST /api/evaluate
```

#### 3. WebSocket STT
```
ws://localhost:3031/ws/rtzr?encoding=OGG_OPUS&model_name=sommers_ko&use_punctuation=true&domain=CALL&sample_rate=16000
```

### 새로운 API (MVP)

#### 4. 레벨테스트 API
```http
GET /api/level-test/questions         # 문제 조회
POST /api/level-test/submit          # 답변 제출 및 채점
GET /api/level-test/result/:userId   # 결과 조회
```

#### 5. Quick Start 카드 API
```http
GET /api/quickstart-cards/:occupation     # 직무별 카드 (로컬 JSON)
POST /api/quickstart-cards/practice      # 연습 결과 제출
GET /api/quickstart-cards/categories     # 카테고리 목록
POST /api/quickstart-cards/tts          # TTS 음성 생성
```

#### 6. 직무 시나리오 API
```http
GET /api/job-scenarios                   # 시나리오 목록
GET /api/job-scenarios/:id              # 시나리오 상세
POST /api/job-scenarios/practice        # 역할극 연습
POST /api/job-scenarios/roleplay        # GPT 자유 대화
```

## 환경 변수

**.env** 파일:
```bash
# Server
PORT=3031
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ilgaemilab
DB_USER=root
DB_PASSWORD=mhee7173

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# RTZR STT API 설정
RTZR_CLIENT_ID=your_rtzr_client_id_here
RTZR_SECRET_KEY=your_rtzr_secret_key_here

# OpenAI API 설정
OPENAI_API_KEY=your_openai_api_key_here

# Client URL (CORS)
CLIENT_URL=http://localhost:5173
```

## 서버 실행

### 개발 모드
```bash
npm run dev  # nodemon으로 자동 재시작
```

### 프로덕션 모드
```bash
npm start   # 일반 node 실행
```

### 데이터베이스 시딩 (NEW)
```bash
npm run seed           # 전체 시드 데이터 (카테고리, 레벨테스트, 테스트 유저)
npm run seed:leveltest # 레벨테스트 문제만
```

### 테스트 계정 (NEW)
- **일반**: test@example.com / password123 (레벨테스트 미완료)
- **고급**: advanced@example.com / password123 (레벨3)

서버 시작 시 출력:
```
✅ Database connected successfully
📊 Database synchronized
🚀 Server listening on port 3031
```

## 에러 처리

### 1. WebSocket 에러 처리
```javascript
// 연결 종료 감지
clientWs.on('close', (code, reason) => {
  const closeReason = code === 1005 ? 'Normal closure' : `Code: ${code}`
  console.log('Client WebSocket closed:', closeReason)
})

// RTZR 연결 실패 시
rtzrWs.on('error', (error) => {
  console.error('RTZR WebSocket error:', error)
  if (clientWs.readyState === WebSocket.OPEN) {
    clientWs.close(1011, 'RTZR connection error')
  }
})
```

### 2. API 에러 처리
```javascript
// RTZR 토큰 에러
catch (error) {
  console.error('RTZR token error:', error)
  res.status(500).json({ error: 'Failed to get RTZR token' })
}

// OpenAI 평가 에러
catch (error) {
  console.error('Evaluation error:', error)
  res.status(500).json({ 
    error: 'Evaluation failed',
    message: error.message 
  })
}
```

## 보안 및 인증

### 1. API 키 관리
- 환경변수로 민감 정보 관리
- `.env` 파일은 gitignore 처리
- 토큰 캐싱으로 API 호출 최소화

### 2. CORS 정책
- 개발환경: 모든 Origin 허용 (`*`)
- 프로덕션 환경에서는 특정 도메인으로 제한 권장

## 성능 최적화

### 1. 토큰 캐싱
```javascript
// 만료 1분 전까지 캐시된 토큰 사용
if (tokenCache.token && tokenCache.expireAt && now < tokenCache.expireAt - 60000) {
  return tokenCache.token
}
```

### 2. WebSocket 연결 관리
- 연결 상태 체크 후 메시지 전송
- 자동 연결 종료 및 정리
- 메모리 누수 방지

## 개발 가이드라인

1. **ES Modules 사용**: import/export 문법 필수
2. **비동기 처리**: async/await 패턴 사용
3. **에러 로깅**: console.error로 상세 에러 정보 기록
4. **환경변수 검증**: 필수 환경변수 누락 시 에러 처리
5. **WebSocket 상태 관리**: readyState 체크 후 메시지 전송
6. **토큰 만료 처리**: 자동 갱신 로직 구현
7. **JSON 응답**: 일관된 JSON 구조 유지