import express from "express";
import { JobScenario, ScenarioDialogue, User, LearningSession } from "../models/index.js";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 직무별 시나리오 목록 조회
router.get("/api/job-scenarios", async (req, res) => {
  try {
    const { occupation, difficulty, userId } = req.query;

    const where = { isActive: true };
    if (occupation) where.occupationCategory = occupation;
    if (difficulty) where.difficulty = parseInt(difficulty);

    const scenarios = await JobScenario.findAll({
      where,
      order: [["difficulty", "ASC"], ["usageCount", "DESC"]],
    });

    // 사용자별 추천 시나리오 필터링
    let recommendedScenarios = scenarios;
    if (userId) {
      const user = await User.findByPk(userId);
      if (user && user.currentLevel !== null) {
        // 사용자 레벨에 맞는 시나리오 우선 추천
        recommendedScenarios = scenarios.filter(s =>
          Math.abs(s.difficulty - user.currentLevel) <= 1
        );
      }
    }

    res.json({
      success: true,
      scenarios: recommendedScenarios.slice(0, 10),
      totalCount: scenarios.length,
    });
  } catch (error) {
    console.error("Job scenarios error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch job scenarios",
    });
  }
});

// 특정 시나리오 상세 정보 및 대화 조회
router.get("/api/job-scenarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const scenario = await JobScenario.findByPk(id, {
      include: [
        {
          model: ScenarioDialogue,
          as: "dialogues",
          order: [["turnNumber", "ASC"]],
        },
      ],
    });

    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: "Scenario not found",
      });
    }

    // 사용 횟수 증가
    await scenario.increment("usageCount");

    res.json({
      success: true,
      scenario: {
        id: scenario.id,
        title: scenario.scenarioTitle,
        titleVi: scenario.scenarioTitleVi,
        situation: scenario.situation,
        situationVi: scenario.situationVi,
        objective: scenario.objective,
        difficulty: scenario.difficulty,
        estimatedTime: scenario.estimatedTime,
        keywords: scenario.keywords,
        dialogues: scenario.dialogues.map(d => ({
          turn: d.turnNumber,
          speaker: d.speaker,
          text: d.koreanText,
          expectedResponse: d.expectedResponse,
          alternatives: d.alternativeResponses,
          hint: d.vietnameseHint,
          audioUrl: d.audioUrl,
          keyPoints: d.keyPoints,
        })),
      },
    });
  } catch (error) {
    console.error("Scenario detail error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch scenario details",
    });
  }
});

// 시나리오 대화 연습 - 역할극 진행
router.post("/api/job-scenarios/practice", async (req, res) => {
  try {
    const {
      userId,
      scenarioId,
      turnNumber,
      userResponse,
      sttResult,
      audioUrl,
      sessionId,
    } = req.body;

    // 현재 대화 턴 가져오기
    const dialogue = await ScenarioDialogue.findOne({
      where: {
        scenarioId,
        turnNumber,
      },
    });

    if (!dialogue) {
      return res.status(404).json({
        success: false,
        error: "Dialogue turn not found",
      });
    }

    // GPT로 사용자 응답 평가
    const evaluation = await evaluateDialogueResponse(
      dialogue.expectedResponse,
      sttResult || userResponse,
      dialogue.alternativeResponses,
      dialogue.keyPoints
    );

    // 학습 세션 기록
    if (userId) {
      await LearningSession.create({
        userId,
        contentId: null, // 시나리오는 별도 관리
        sessionId: sessionId || uuidv4(),
        targetText: dialogue.expectedResponse,
        recognizedText: sttResult || userResponse,
        pronunciationScore: evaluation.score,
        aiF,
        feedbackJson: evaluation,
        audioFileUrl: audioUrl,
        attemptsCount: 1,
        isSuccessful: evaluation.score >= 70,
      });
    }

    // 다음 턴 정보 가져오기
    const nextTurn = await ScenarioDialogue.findOne({
      where: {
        scenarioId,
        turnNumber: turnNumber + 1,
      },
    });

    res.json({
      success: true,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        corrections: evaluation.corrections,
        vietnameseFeedback: evaluation.vietnameseFeedback,
      },
      nextTurn: nextTurn ? {
        turnNumber: nextTurn.turnNumber,
        speaker: nextTurn.speaker,
        text: nextTurn.koreanText,
        hint: nextTurn.vietnameseHint,
        audioUrl: nextTurn.audioUrl,
      } : null,
      isScenarioComplete: !nextTurn,
    });
  } catch (error) {
    console.error("Practice error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process practice",
    });
  }
});

// GPT 역할극 자유 대화 모드
router.post("/api/job-scenarios/roleplay", async (req, res) => {
  try {
    const {
      userId,
      scenarioId,
      conversationHistory,
      userMessage,
      sttResult,
    } = req.body;

    const scenario = await JobScenario.findByPk(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        error: "Scenario not found",
      });
    }

    // GPT로 역할극 대화 생성
    const gptResponse = await generateRoleplayResponse(
      scenario,
      conversationHistory,
      sttResult || userMessage
    );

    res.json({
      success: true,
      response: {
        text: gptResponse.text,
        audioUrl: gptResponse.audioUrl,
        feedback: gptResponse.feedback,
        suggestedResponse: gptResponse.suggestedResponse,
        vietnameseHint: gptResponse.vietnameseHint,
      },
      conversationTurn: (conversationHistory?.length || 0) + 1,
    });
  } catch (error) {
    console.error("Roleplay error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate roleplay response",
    });
  }
});

// 대화 응답 평가 함수
async function evaluateDialogueResponse(expected, actual, alternatives, keyPoints) {
  try {
    const prompt = `역할극 대화 평가를 수행합니다.

예상 응답: "${expected}"
대체 가능 응답: ${JSON.stringify(alternatives || [])}
사용자 응답: "${actual}"
핵심 체크 포인트: ${JSON.stringify(keyPoints || [])}

다음 기준으로 평가하세요:
1. 의미 전달 정확도 (0-100점)
2. 핵심 표현 포함 여부
3. 문법 정확도
4. 자연스러움

JSON 형식으로 응답:
{
  "score": 점수(0-100),
  "feedback": "구체적 피드백",
  "corrections": ["수정사항1", "수정사항2"],
  "vietnameseFeedback": "베트남어 피드백",
  "keyPointsCheck": {
    "포함된항목": ["항목1"],
    "누락된항목": ["항목2"]
  }
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 한국어 대화 교육 전문가입니다. 직무 상황에 맞는 실용적인 피드백을 제공합니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("Evaluation error:", error);
    return {
      score: 0,
      feedback: "평가 실패",
      corrections: [],
      vietnameseFeedback: "Đánh giá thất bại",
    };
  }
}

// GPT 역할극 응답 생성 함수
async function generateRoleplayResponse(scenario, history, userMessage) {
  try {
    const prompt = `당신은 ${scenario.occupationCategory} 현장의 한국인 직원입니다.
상황: ${scenario.situation}

대화 기록:
${history?.map(h => `${h.speaker}: ${h.message}`).join("\n") || "대화 시작"}

이주 노동자: "${userMessage}"

위 상황에서 자연스럽게 응답하고, 학습자의 한국어를 평가해주세요.

JSON 형식으로 응답:
{
  "text": "한국인 직원의 응답",
  "feedback": "학습자 한국어에 대한 피드백",
  "suggestedResponse": "더 나은 표현 제안",
  "vietnameseHint": "베트남어 힌트",
  "continueScenario": true/false
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 친절하고 인내심 있는 한국인 직장 동료입니다. 이주 노동자의 한국어 학습을 돕습니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // TTS 생성 (별도 구현 필요)
    // result.audioUrl = await generateTTS(result.text);

    return result;
  } catch (error) {
    console.error("Roleplay generation error:", error);
    return {
      text: "죄송합니다. 다시 말씀해 주세요.",
      feedback: "응답 생성 실패",
      suggestedResponse: "",
      vietnameseHint: "Xin lỗi, vui lòng nói lại.",
    };
  }
}

export default router;