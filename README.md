# 🐜 일개미랩 (iLgaemiLab)

**- 외국인 한국어 학습자를 위한 인터랙티브 학습 플랫폼입니다. ( 💡 iLagemiLab은 팀 이름 입니다)**

<!-- 프로젝트 대표 이미지 (누군가 추가 예정 - 아 난 추가 안할거임 ㅋㅋ) -->

---

## 개발 환경 설정

### 실행 방법

```bash
# 서버
cd server
npm install
npm start

# 클라이언트
cd client
npm install
npm run dev
```

## 환경 변수 설정

`.env` 파일은 보안상 저장소에 포함되지 않습니다.  
`server/.env.sample`을 복사해 `server/.env`로 만든 뒤 값을 채워주세요.

| 변수                                                          | 설명                             |
| ------------------------------------------------------------- | -------------------------------- |
| `PORT`                                                        | 서버 포트 (기본값: 3031)         |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` / `DB_NAME` | MySQL 데이터베이스 연결 정보     |
| `RTZR_CLIENT_ID` / `RTZR_SECRET_KEY`                          | RTZR 음성인식(STT) API 키        |
| `OPENAI_API_KEY`                                              | OpenAI API 키                    |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET`                     | 네이버 사전 API (현재 미사용)    |
| `KOREAN_DICT_API_KEY`                                         | 국립국어원 표준국어대사전 API 키 |
| `UNSPLASH_ACCESS_KEY`                                         | Unsplash 이미지 검색 API 키      |

---

## 주요 기능

| 기능        | 설명                                           | 담당자 |
| ----------- | ---------------------------------------------- | ------ |
| 말하기 연습 | RTZR API 기반 실시간 음성인식(STT) 말하기 연습 | 안대민 |
| 레벨 테스트 | 학습자 수준 진단 테스트                        |        |
| 단어 게임   | 끝말잇기, 빙고, 초성게임, 타이핑 등            |        |
| 학습 노트   | 오답 및 학습 이력 관리                         |        |
| 개미 캐릭터 | 학습 진행에 따라 성장하는 캐릭터 시스템        |        |
| 프로필      | 사용자 정보 및 학습 통계                       |        |

---

## 말하기 연습 시스템

> 담당자: 안대민

RTZR(ReturnZero) STT API와 OpenAI API를 활용한 실시간 한국어 말하기 연습 기능입니다.  
외국인 학습자가 상황별 시나리오를 선택해 실제 대화를 연습하고, 발음 피드백을 받을 수 있습니다.

<details>
<summary>시스템 플로우</summary>

```
사용자
  │
  ├─ 1. 카테고리 선택
  │       건설현장 / 제조업 / 서비스업 / 일상 / 응급상황
  │       (난이도는 현재 beginner 고정)
  │
  ├─ 2. 대화 시작
  │       OpenAI가 카테고리별 역할극 첫 대사 생성
  │       예시 응답 3개 함께 제공
  │
  ├─ 3. 사용자 응답
  │       텍스트 직접 입력 또는 마이크 녹음
  │       MediaRecorder + Web Speech API(SpeechRecognition) 병행
  │
  ├─ 4. 음성 → 텍스트 변환
  │       오디오 청크 → 서버 → RTZR API (openapi.vito.ai)
  │       └─ 서버에서 토큰 캐싱 (만료 1분 전 자동 갱신)
  │       partial: 중간 인식 결과 / final: 단어별·음소별 발음 점수
  │
  ├─ 5. AI 다음 대사 + 예시 응답 생성 (OpenAI)
  │       이전 대화 이력 유지 (서버 메모리 Map)
  │       매 턴마다 예시 응답 3개 별도 생성
  │
  └─ 6. 10턴 완료 → 종합 평가 (OpenAI)
          전체 대화 GPT 분석 → 점수·등급·교정 반환
```

</details>

<details>
<summary>핵심 구현</summary>

#### 음성 녹음 (클라이언트)
브라우저 `MediaRecorder API`와 `Web Speech API`(SpeechRecognition)를 함께 사용합니다.  
오디오는 `audio/webm` 포맷으로 청크 수집 후 Blob으로 묶어 서버에 `multipart/form-data`로 전송하고, SpeechRecognition으로 실시간 텍스트 변환을 병행합니다.

```js
// SpeakingTest.vue
const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
mediaRecorder.value = new MediaRecorder(stream)

mediaRecorder.value.ondataavailable = (event) => {
  audioChunks.value.push(event.data)
}
```

> 모바일 iOS Safari 대응: 버튼에 `touch-action: manipulation`, `pointer-events` 명시 처리  
> **현재 난이도는 `beginner`로 고정**되어 있습니다. 사용자가 선택하는 UI는 구현되지 않았습니다.

#### RTZR WebSocket 연동 (서버)
서버에서 RTZR에 WebSocket으로 직접 연결하고, 오디오 청크를 실시간으로 전달합니다.  
`partial` 메시지로 중간 인식 결과를, `final` 메시지로 단어별/음소별 발음 점수를 받습니다.

```js
// rtzrService.js
this.websocket = new WebSocket('wss://api.rtzr.ai/v1/stream', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const config = {
  language: 'ko-KR',
  reference_text: referenceText,
  return_phone_score: true,   // 음소 단위 점수
  return_word_score: true,    // 단어 단위 점수
  speech_complete_timeout_ms: 3000,
  no_speech_timeout_ms: 10000
}
```

발음 점수 기반 자동 피드백:
- 85점 이상: 우수
- 70~84점: 양호
- 50~69점: 연습 필요
- 50점 미만: 점수 낮은 단어 목록 제공

#### OpenAI 대화 생성 (서버)
모델: **`gpt-4o-mini`**  
세션별 전체 대화 이력을 서버 메모리(`Map`)에 유지해 DB 부하를 줄입니다.  
OpenAI는 아래 세 가지 역할로 사용됩니다.

**① 카테고리별 역할극 첫 대사 생성**  
카테고리에 맞는 상세 시스템 프롬프트(역할·상황·전문용어·열린 질문 강제)로 자연스러운 첫 메시지를 생성합니다.

```
건설현장 → 현장 반장 역할, 철근/거푸집 등 전문 용어 포함
제조업   → 라인 반장 역할, 생산량/온도/사이클타임 수치 포함
서비스업 → 편의점/카페 매니저 역할, 가격·재고 계산 유도
일상     → 룸메이트/친구 역할, 자연스러운 반말 대화
응급상황 → 병원·경찰·시민 역할, 침착한 상황 대응
```

열린 질문 원칙 — "네/아니오"로만 끝나는 질문 금지, 이미 답한 내용 재질문 금지

**② 매 턴마다 예시 응답 3개 자동 생성**  
AI 대사가 출력될 때마다 학습자가 선택할 수 있는 예시 응답 3개를 별도 API 호출로 생성합니다.  
JSON 배열로 응답받아 파싱 실패 시 빈 배열로 graceful fallback 처리합니다.

```js
// 매 턴 실행 (첫 메시지 + 이후 모든 AI 응답)
const suggestionResponse = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [{ role: 'system', content: suggestionPrompt }],
  temperature: 0.7,
  max_tokens: 200,
})
// → ["응답1", "응답2", "응답3"] 형태로 파싱
```

**③ 대화 종료 후 종합 평가 (JSON 강제 출력)**  
10턴 완료 후 전체 대화 내용을 GPT에 전달해 구조화된 평가를 받습니다.  
`response_format: { type: "json_object" }`로 JSON 파싱 안정성을 확보합니다.

</details>

<details>
<summary>종합 평가 기준</summary>

대화 최대 10턴 완료 후 GPT-4o-mini가 자동 분석하며 등급(A~F)을 부여합니다.

| 평가 항목 | 배점 |
|----------|------|
| 문법 정확성 | 25점 |
| 어휘 사용 | 20점 |
| 의사소통 효과 | 20점 |
| 상황 적절성 | 20점 |
| 유창성 | 15점 |
| **합계** | **100점** |

| 점수 | 등급 |
|------|------|
| 90점 이상 | A |
| 80점 이상 | B |
| 70점 이상 | C |
| 60점 이상 | D |
| 60점 미만 | F |

발화별 오류·교정 예시(`틀린 표현 → 올바른 표현 + 설명`), 잘한 점/개선할 점, 다음 단계 추천도 함께 반환됩니다.

</details>

<details>
<summary>사용 API</summary>

#### RTZR (ReturnZero) STT API
| 항목 | 내용 |
|------|------|
| 역할 | 실시간 한국어 음성 인식 (Speech-to-Text) |
| 인증 | `client_id` + `client_secret` → Access Token 발급 |
| 엔드포인트 | `https://openapi.vito.ai/v1/authenticate` |
| 토큰 관리 | 서버에서 토큰 캐싱, 만료 1분 전 자동 갱신 |
| 환경 변수 | `RTZR_CLIENT_ID`, `RTZR_SECRET_KEY` |
| 주의사항 | 마이크 접근은 HTTPS 또는 localhost 환경에서만 동작 |

#### OpenAI API
| 항목 | 내용 |
|------|------|
| 역할 | 대화 생성, 매 턴 예시 응답 3개 생성, 종합 평가 |
| 모델 | gpt-4o-mini |
| 환경 변수 | `OPENAI_API_KEY` |

</details>

---

## 팀원 소개

| 이름   | 역할 | 소개 |
| ------ | ---- | ---- |
| 한승현 |      |      |
| 안대민 |      |      |
| 정유선 |      |      |
| 주지호 |      |      |

---
