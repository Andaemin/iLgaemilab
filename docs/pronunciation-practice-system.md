# Pronunciation Practice System (발음 교정 연습 시스템)

## ⚠️ 시스템 리팩토링 필요
**Note**: Speaking Practice System으로 통합 예정. 현재 문서는 레거시 참조용.

## 시스템 개요
RTZR API와 OpenAI API를 활용한 실시간 상황별 한국어 발음 교정 시스템
(현재 Speaking Practice System과 통합 진행 중)

## 핵심 기능

### 1. 음성 인식 및 평가 (RTZR API)
- **실시간 음성 스트리밍**: WebSocket을 통한 실시간 오디오 전송
- **발음 정확도 평가**: 음소 단위 발음 점수 제공
- **피드백 제공**: 개선이 필요한 발음 포인트 상세 분석

### 2. 대화 시나리오 생성 (OpenAI API)
- **동적 시나리오 생성**: 상황에 맞는 대화 스크립트 자동 생성
- **난이도 조절**: 사용자 레벨에 맞는 문장 복잡도 조정
- **피드백 생성**: 발음 개선을 위한 맞춤형 조언 제공

## 상황별 시나리오 구조

### 시나리오 카테고리

#### 1. 건설 현장 (Construction Site)
```javascript
{
  category: "construction",
  scenarios: [
    {
      id: "safety_check",
      title: "안전 점검",
      difficulty: "beginner",
      context: "작업 시작 전 안전 장비 확인",
      dialogues: [
        {
          role: "worker",
          text: "안전모를 착용하셨나요?",
          pronunciation_focus: ["안전모", "착용"],
          expected_response_types: ["확인", "질문"]
        }
      ]
    },
    {
      id: "work_instruction",
      title: "작업 지시",
      difficulty: "intermediate",
      context: "반장님이 작업 지시를 내리는 상황",
      dialogues: [
        {
          role: "foreman",
          text: "오늘은 2층 철근 작업을 진행합니다",
          pronunciation_focus: ["철근", "진행"],
          expected_response_types: ["이해", "질문"]
        }
      ]
    }
  ]
}
```

#### 2. 제조업 현장 (Manufacturing)
```javascript
{
  category: "manufacturing",
  scenarios: [
    {
      id: "machine_operation",
      title: "기계 조작",
      difficulty: "intermediate",
      context: "공장에서 기계 작동 방법 설명",
      dialogues: [
        {
          role: "supervisor",
          text: "빨간 버튼을 누르면 기계가 멈춥니다",
          pronunciation_focus: ["빨간", "버튼", "멈춥니다"],
          expected_response_types: ["확인", "반복요청"]
        }
      ]
    }
  ]
}
```

#### 3. 서비스업 (Service Industry)
```javascript
{
  category: "service",
  scenarios: [
    {
      id: "customer_greeting",
      title: "고객 인사",
      difficulty: "beginner",
      context: "식당/카페에서 고객 맞이",
      dialogues: [
        {
          role: "staff",
          text: "어서오세요. 몇 분이세요?",
          pronunciation_focus: ["어서오세요", "몇 분"],
          expected_response_types: ["인원수", "질문"]
        }
      ]
    }
  ]
}
```

#### 4. 일상 대화 (Daily Conversation)
```javascript
{
  category: "daily",
  scenarios: [
    {
      id: "greeting",
      title: "일상 인사",
      difficulty: "beginner",
      context: "아침/저녁 인사",
      dialogues: [
        {
          role: "neighbor",
          text: "안녕하세요. 오늘 날씨가 좋네요",
          pronunciation_focus: ["안녕하세요", "날씨"],
          expected_response_types: ["인사", "동의"]
        }
      ]
    }
  ]
}
```

#### 5. 응급 상황 (Emergency)
```javascript
{
  category: "emergency",
  scenarios: [
    {
      id: "injury_report",
      title: "부상 신고",
      difficulty: "intermediate",
      context: "작업 중 부상 발생 신고",
      dialogues: [
        {
          role: "worker",
          text: "다쳤어요! 도와주세요!",
          pronunciation_focus: ["다쳤어요", "도와주세요"],
          expected_response_types: ["위치확인", "상태확인"]
        }
      ]
    }
  ]
}
```

## API 통합 구조

### RTZR API 연동
```javascript
// 음성 스트리밍 및 평가
class RTZRPronunciationService {
  constructor() {
    this.apiKey = process.env.RTZR_API_KEY;
    this.websocket = null;
  }

  async startSession(scenario) {
    // WebSocket 연결 초기화
    this.websocket = new WebSocket('wss://api.rtzr.ai/v1/stream');

    // 세션 설정
    const config = {
      language: 'ko-KR',
      reference_text: scenario.current_dialogue.text,
      return_phone_score: true,
      return_word_score: true
    };

    this.websocket.send(JSON.stringify({
      type: 'start',
      config: config
    }));
  }

  sendAudioChunk(audioData) {
    this.websocket.send(audioData);
  }

  async getEvaluation() {
    return new Promise((resolve) => {
      this.websocket.on('message', (data) => {
        const result = JSON.parse(data);
        if (result.type === 'final') {
          resolve({
            overall_score: result.pronunciation_score,
            word_scores: result.word_scores,
            phone_scores: result.phone_scores,
            suggestions: result.improvement_suggestions
          });
        }
      });
    });
  }
}
```

### OpenAI API 연동
```javascript
// 대화 시나리오 및 피드백 생성
class OpenAIPracticeService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateScenario(category, difficulty, userLevel) {
    const prompt = `
      Generate a Korean conversation scenario for:
      - Category: ${category}
      - Difficulty: ${difficulty}
      - User Korean Level: ${userLevel}

      Include:
      1. Realistic dialogue for the situation
      2. Key pronunciation points
      3. Expected response patterns
      4. Cultural context if relevant
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a Korean language teacher specializing in pronunciation for foreign workers." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return this.parseScenario(response.choices[0].message.content);
  }

  async generateFeedback(pronunciationScore, scenario, userResponse) {
    const prompt = `
      Based on the pronunciation assessment:
      - Overall Score: ${pronunciationScore.overall_score}
      - Problem areas: ${JSON.stringify(pronunciationScore.word_scores)}
      - Scenario: ${scenario.title}
      - User said: ${userResponse}

      Provide:
      1. Specific pronunciation tips in Korean and user's native language
      2. Practice suggestions for problem sounds
      3. Encouragement and next steps
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an encouraging Korean pronunciation coach." },
        { role: "user", content: prompt }
      ]
    });

    return response.choices[0].message.content;
  }

  async generateNextDialogue(scenario, previousResponse, userLevel) {
    // 대화의 자연스러운 흐름을 위한 다음 대사 생성
    const prompt = `
      Continue the conversation naturally:
      - Scenario: ${scenario.context}
      - Previous: ${scenario.current_dialogue.text}
      - User responded: ${previousResponse}
      - User level: ${userLevel}

      Generate appropriate next line for the conversation partner.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Generate natural Korean conversation continuations." },
        { role: "user", content: prompt }
      ]
    });

    return response.choices[0].message.content;
  }
}
```

## 연습 플로우

### 1. 시나리오 선택
```javascript
// 사용자가 상황 선택
const practiceFlow = {
  step1_selectCategory: async (userId) => {
    // 사용자 프로필 기반 추천 카테고리
    const user = await User.findById(userId);
    const recommendations = await getRecommendedScenarios(user.occupationCategory, user.koreanLevel);

    return {
      recommended: recommendations,
      all_categories: ['construction', 'manufacturing', 'service', 'daily', 'emergency']
    };
  }
};
```

### 2. 대화 연습
```javascript
const practiceFlow = {
  step2_startPractice: async (scenarioId, userId) => {
    const scenario = await Scenario.findById(scenarioId);
    const session = await PracticeSession.create({
      userId,
      scenarioId,
      startTime: new Date()
    });

    // 첫 대사 표시 및 음성 재생
    await playAudioTTS(scenario.dialogues[0].text);

    // 사용자 응답 녹음 시작
    const recorder = await startRecording();

    return {
      sessionId: session.id,
      currentDialogue: scenario.dialogues[0],
      isRecording: true
    };
  }
};
```

### 3. 실시간 평가
```javascript
const practiceFlow = {
  step3_evaluate: async (sessionId, audioData) => {
    const session = await PracticeSession.findById(sessionId);
    const scenario = await Scenario.findById(session.scenarioId);

    // RTZR로 발음 평가
    const pronunciationScore = await rtzrService.evaluate(
      audioData,
      scenario.currentDialogue.text
    );

    // OpenAI로 피드백 생성
    const feedback = await openaiService.generateFeedback(
      pronunciationScore,
      scenario,
      session.userTranscript
    );

    // 다음 대화 생성 (자연스러운 대화 흐름)
    const nextDialogue = await openaiService.generateNextDialogue(
      scenario,
      session.userTranscript,
      session.userLevel
    );

    return {
      score: pronunciationScore,
      feedback: feedback,
      nextDialogue: nextDialogue,
      shouldContinue: pronunciationScore.overall_score > 60
    };
  }
};
```

### 4. 피드백 제공
```javascript
const practiceFlow = {
  step4_feedback: async (sessionId) => {
    const session = await PracticeSession.findById(sessionId);

    // 세션 전체 요약
    const summary = {
      totalScore: session.averageScore,
      problemAreas: session.commonErrors,
      improvements: session.improvements,
      nextRecommendations: await getNextScenarios(session)
    };

    // 학습 기록 저장
    await LearningHistory.create({
      userId: session.userId,
      scenarioId: session.scenarioId,
      score: summary.totalScore,
      completedAt: new Date()
    });

    return summary;
  }
};
```

## 데이터베이스 스키마

### Scenario 테이블
```sql
CREATE TABLE scenarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category VARCHAR(50),
  title VARCHAR(100),
  title_ko VARCHAR(100),
  title_vi VARCHAR(100),
  context TEXT,
  difficulty ENUM('beginner', 'intermediate', 'advanced'),
  dialogues JSON,
  pronunciation_focus JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### PracticeSession 테이블
```sql
CREATE TABLE practice_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  scenario_id INT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  dialogues_completed JSON,
  scores JSON,
  feedback JSON,
  average_score FLOAT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);
```

### LearningHistory 테이블
```sql
CREATE TABLE learning_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  scenario_id INT,
  score FLOAT,
  problem_sounds JSON,
  improvement_from_last FLOAT,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scenario_id) REFERENCES scenarios(id)
);
```

## 프론트엔드 구현 가이드

### 연습 화면 컴포넌트
```vue
<template>
  <div class="practice-container">
    <!-- 시나리오 정보 -->
    <div class="scenario-header">
      <h2>{{ scenario.title }}</h2>
      <p class="context">{{ scenario.context }}</p>
    </div>

    <!-- 대화 표시 -->
    <div class="dialogue-display">
      <div class="ai-dialogue">
        <img :src="roleAvatar" />
        <div class="speech-bubble">
          {{ currentDialogue.text }}
          <button @click="playAudio">🔊 다시 듣기</button>
        </div>
      </div>
    </div>

    <!-- 녹음 컨트롤 -->
    <div class="recording-controls">
      <button
        class="record-btn"
        :class="{ recording: isRecording }"
        @click="toggleRecording"
      >
        {{ isRecording ? '녹음 중지' : '녹음 시작' }}
      </button>

      <div v-if="isRecording" class="waveform">
        <!-- 음성 파형 시각화 -->
      </div>
    </div>

    <!-- 실시간 피드백 -->
    <div v-if="feedback" class="feedback-panel">
      <div class="score-display">
        <circular-progress :value="score" />
        <span>{{ score }}점</span>
      </div>

      <div class="pronunciation-feedback">
        <h3>발음 피드백</h3>
        <div v-for="word in wordScores" :key="word.text">
          <span :class="getPronunciationClass(word.score)">
            {{ word.text }}
          </span>
          <span class="score">{{ word.score }}</span>
        </div>
      </div>

      <div class="suggestions">
        <h3>개선 팁</h3>
        <p>{{ feedback.suggestions }}</p>
      </div>
    </div>

    <!-- 다음 단계 -->
    <div class="next-actions">
      <button @click="retry">다시 시도</button>
      <button @click="nextDialogue" :disabled="score < 60">
        다음 대화
      </button>
      <button @click="endSession">연습 종료</button>
    </div>
  </div>
</template>
```

## 성능 최적화

### 1. 오디오 스트리밍 최적화
- **청크 크기**: 100ms 단위로 오디오 전송
- **버퍼링**: 네트워크 지연 대응을 위한 버퍼 구현
- **압축**: Opus 코덱 사용으로 대역폭 절약

### 2. 캐싱 전략
- **시나리오 캐싱**: 자주 사용되는 시나리오 로컬 저장
- **TTS 캐싱**: 생성된 음성 파일 재사용
- **평가 결과 캐싱**: 동일 녹음 재평가 방지

### 3. 동시성 처리
- **WebSocket 풀링**: 다중 사용자 동시 연결 관리
- **큐 시스템**: 평가 요청 순차 처리
- **로드 밸런싱**: API 요청 분산

## 모니터링 및 분석

### 사용자 학습 분석
```javascript
class LearningAnalytics {
  async getUserProgress(userId) {
    const history = await LearningHistory.findAll({
      where: { userId },
      order: [['completed_at', 'DESC']]
    });

    return {
      totalSessions: history.length,
      averageScore: calculateAverage(history.map(h => h.score)),
      improvementRate: calculateImprovement(history),
      problemSounds: identifyCommonErrors(history),
      strongAreas: identifyStrengths(history),
      recommendedFocus: suggestNextFocus(history)
    };
  }
}
```

### 시스템 모니터링
- **API 응답 시간**: RTZR/OpenAI API 레이턴시 추적
- **오류율**: 실패한 평가 세션 모니터링
- **사용자 만족도**: 연습 완료율 및 재시도율 분석

## 향후 개발 계획

### Phase 1: MVP (1-2개월)
- 기본 5개 카테고리 시나리오 구현
- RTZR API 기본 연동
- OpenAI 피드백 생성
- 웹 기반 녹음/재생

### Phase 2: 확장 (3-4개월)
- 시나리오 자동 생성 시스템
- 멀티턴 대화 지원
- 그룹 연습 모드
- 모바일 앱 개발

### Phase 3: 고도화 (5-6개월)
- AI 튜터 아바타 구현
- 감정 인식 피드백
- 방언/억양 대응
- 게이미피케이션 요소 추가