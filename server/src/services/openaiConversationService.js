import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

class OpenAIConversationService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.conversations = new Map(); // 세션별 대화 저장
    }

    // 새로운 대화 세션 시작
    async startConversation(scenario, language = "ko") {
        const sessionId = Date.now().toString();

        // 시스템 프롬프트 설정
        const systemPrompt = `당신은 한국어 학습을 돕는 친절한 대화 파트너입니다.

상황: ${scenario.context}
난이도: ${scenario.difficulty}
학습자의 모국어: 베트남어

규칙:
1. 상황에 맞는 자연스러운 한국어로 대화하세요
2. ${
            scenario.difficulty === "beginner"
                ? "쉬운 단어와 짧은 문장"
                : scenario.difficulty === "intermediate"
                ? "일상적인 표현과 적절한 길이의 문장"
                : "다양한 어휘와 복잡한 문장 구조"
        }를 사용하세요
3. 학습자의 응답에 자연스럽게 반응하면서 대화를 이어가세요
4. 문법 오류가 있어도 대화 흐름을 유지하며 자연스럽게 교정해주세요
5. 한 번의 응답은 1-2문장으로 제한하세요

시작 메시지로 상황에 맞는 첫 인사나 질문을 하세요.`;
        // 추후 모국어는 사용자에 맞춰서 제공하도록 변경 예정
        // 첫 메시지 생성
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `${scenario.titleKo} 상황에서 대화를 시작해주세요.` },
            ],
            temperature: 0.7,
            max_tokens: 150,
        });

        const firstMessage = response.choices[0].message.content;

        // 세션 저장
        this.conversations.set(sessionId, {
            scenario,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "assistant", content: firstMessage, timestamp: new Date() },
            ],
            turnCount: 1,
            startTime: new Date(),
        });

        return {
            sessionId,
            message: firstMessage,
            turnCount: 1,
        };
    }

    // 사용자 응답 처리 및 AI 응답 생성
    async processUserResponse(sessionId, userMessage, audioTranscript = null) {
        const conversation = this.conversations.get(sessionId);
        if (!conversation) {
            throw new Error("대화 세션을 찾을 수 없습니다.");
        }

        // 사용자 메시지 저장
        conversation.messages.push({
            role: "user",
            content: userMessage,
            audioTranscript: audioTranscript,
            timestamp: new Date(),
        });

        // 대화 횟수 확인
        if (conversation.turnCount >= 10) {
            return {
                message: "대화가 완료되었습니다. 평가 결과를 확인해주세요.",
                isComplete: true,
                turnCount: conversation.turnCount,
            };
        }

        // AI 응답 생성
        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: conversation.messages
                .filter((msg) => msg.role !== "user" || !msg.audioTranscript)
                .map((msg) => ({
                    role: msg.role,
                    content: msg.content,
                })),
            temperature: 0.7,
            max_tokens: 150,
        });

        const aiMessage = response.choices[0].message.content;

        // AI 응답 저장
        conversation.messages.push({
            role: "assistant",
            content: aiMessage,
            timestamp: new Date(),
        });

        conversation.turnCount++;

        return {
            message: aiMessage,
            turnCount: conversation.turnCount,
            isComplete: conversation.turnCount >= 10,
        };
    }

    // 대화 분석 및 평가
    async analyzeConversation(sessionId) {
        const conversation = this.conversations.get(sessionId);
        if (!conversation) {
            throw new Error("대화 세션을 찾을 수 없습니다.");
        }

        // 사용자 메시지만 추출
        const userMessages = conversation.messages
            .filter((msg) => msg.role === "user")
            .map((msg) => msg.content)
            .join("\n");

        // 대화 전체 분석 요청
        const analysisPrompt = `다음은 한국어 학습자의 대화 내용입니다. 상황: ${conversation.scenario.context}

학습자의 발화:
${userMessages}

다음 기준으로 평가해주세요:
1. 문법 정확도 (30점)
2. 어휘 적절성 (25점)
3. 상황 적합성 (25점)
4. 의사소통 능력 (20점)

응답 형식:
{
  "totalScore": 0-100,
  "breakdown": {
    "grammar": { "score": 0-30, "comment": "..." },
    "vocabulary": { "score": 0-25, "comment": "..." },
    "context": { "score": 0-25, "comment": "..." },
    "communication": { "score": 0-20, "comment": "..." }
  },
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선할 점 1", "개선할 점 2"],
  "corrections": [
    { "original": "틀린 표현", "corrected": "올바른 표현", "explanation": "설명" }
  ],
  "overallFeedback": "전체적인 피드백"
}`;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: "당신은 한국어 교육 전문가입니다. JSON 형식으로만 응답하세요." },
                { role: "user", content: analysisPrompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        const analysis = JSON.parse(response.choices[0].message.content);

        // 대화 시간 계산
        const duration = Math.floor((new Date() - conversation.startTime) / 1000);

        return {
            ...analysis,
            sessionInfo: {
                scenario: conversation.scenario.titleKo,
                difficulty: conversation.scenario.difficulty,
                turnCount: conversation.turnCount,
                duration: duration,
            },
        };
    }

    // 세션 정리
    clearSession(sessionId) {
        this.conversations.delete(sessionId);
    }
}

export default OpenAIConversationService;
