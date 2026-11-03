import express from "express";
import { LevelTest, LevelTestResult, User } from "../models/index.js";
import { OpenAI } from "openai";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 레벨테스트 문제 가져오기
router.get("/api/level-test/questions", async (req, res) => {
  try {
    const questions = await LevelTest.findAll({
      where: { isActive: true },
      order: [["questionType", "ASC"], ["questionNumber", "ASC"]],
    });

    res.json({
      success: true,
      questions,
      totalQuestions: questions.length,
      estimatedTime: "3-5분",
    });
  } catch (error) {
    console.error("Level test questions error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch level test questions"
    });
  }
});

// 레벨테스트 답변 제출 및 채점
router.post("/api/level-test/submit", async (req, res) => {
  try {
    const { userId, answers, sessionId } = req.body;

    if (!userId || !answers || !sessionId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    let totalScore = 0;
    const results = [];

    // 각 답변 채점
    for (const answer of answers) {
      const question = await LevelTest.findByPk(answer.questionId);
      if (!question) continue;

      let score = 0;
      let feedback = {};
      let isCorrect = false;

      // 문제 유형별 채점
      if (question.questionType === "speaking") {
        // GPT를 사용한 말하기 평가
        const evaluation = await evaluateSpeaking(
          answer.sttResult || answer.userAnswer,
          question.correctAnswer,
          question.scoringCriteria
        );
        score = evaluation.score;
        feedback = evaluation.feedback;
        isCorrect = score >= question.maxScore * 0.6;
      } else if (question.questionType === "short_answer") {
        // 단답형 평가
        const acceptableAnswers = question.acceptableAnswers || [question.correctAnswer];
        isCorrect = acceptableAnswers.some(acceptable =>
          answer.userAnswer && answer.userAnswer.includes(acceptable)
        );
        score = isCorrect ? question.maxScore : 0;
      } else {
        // 객관식 평가
        isCorrect = answer.userAnswer === question.correctAnswer;
        score = isCorrect ? question.maxScore : 0;
      }

      // 결과 저장
      const result = await LevelTestResult.create({
        userId,
        testSessionId: sessionId,
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        userAudioUrl: answer.audioUrl,
        sttResult: answer.sttResult,
        score,
        feedback,
        isCorrect,
        timeTaken: answer.timeTaken,
      });

      results.push(result);
      totalScore += score;
    }

    // 레벨 결정 (0-4점: 레벨0, 5-9점: 레벨1, 10-14점: 레벨2, 15-17점: 레벨3, 18-20점: 레벨4)
    let userLevel = 0;
    if (totalScore >= 18) userLevel = 4;
    else if (totalScore >= 15) userLevel = 3;
    else if (totalScore >= 10) userLevel = 2;
    else if (totalScore >= 5) userLevel = 1;

    // 사용자 정보 업데이트
    const user = await User.findByPk(userId);
    if (user) {
      await user.update({
        currentLevel: userLevel,
        levelTestCompleted: true,
        levelTestScore: totalScore,
        levelTestDate: new Date(),
      });
    }

    res.json({
      success: true,
      totalScore,
      maxScore: 20,
      userLevel,
      levelDescription: getLevelDescription(userLevel),
      results: results.map(r => ({
        questionId: r.questionId,
        score: r.score,
        isCorrect: r.isCorrect,
        feedback: r.feedback,
      })),
    });
  } catch (error) {
    console.error("Level test submission error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process level test submission"
    });
  }
});

// 사용자의 레벨테스트 결과 조회
router.get("/api/level-test/result/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ["currentLevel", "levelTestCompleted", "levelTestScore", "levelTestDate"],
    });

    if (!user || !user.levelTestCompleted) {
      return res.status(404).json({
        success: false,
        error: "Level test not completed",
      });
    }

    const latestResults = await LevelTestResult.findAll({
      where: { userId },
      include: [
        {
          model: LevelTest,
          as: "question",
          attributes: ["questionType", "questionText", "maxScore"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      currentLevel: user.currentLevel,
      totalScore: user.levelTestScore,
      testDate: user.levelTestDate,
      levelDescription: getLevelDescription(user.currentLevel),
      detailedResults: latestResults,
    });
  } catch (error) {
    console.error("Level test result error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch level test result"
    });
  }
});

// GPT를 사용한 말하기 평가 함수
async function evaluateSpeaking(userAnswer, expectedAnswer, criteria) {
  try {
    const prompt = `한국어 말하기 평가를 수행합니다.

예상 답변: "${expectedAnswer}"
사용자 답변: "${userAnswer}"

다음 기준으로 0-5점 사이로 평가하세요:
- 발음 정확도 (0-2점)
- 문법 정확도 (0-2점)
- 의사 전달력 (0-1점)

JSON 형식으로 응답:
{
  "score": 총점(0-5),
  "pronunciation": 발음점수(0-2),
  "grammar": 문법점수(0-2),
  "communication": 의사전달점수(0-1),
  "feedback": "구체적인 피드백",
  "corrections": ["수정사항1", "수정사항2"]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 한국어 교육 전문가입니다. 이주 노동자의 한국어 학습을 돕고 있습니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      score: result.score || 0,
      feedback: result,
    };
  } catch (error) {
    console.error("GPT evaluation error:", error);
    return {
      score: 0,
      feedback: { error: "Evaluation failed" },
    };
  }
}

// 레벨 설명 반환 함수
function getLevelDescription(level) {
  const descriptions = {
    0: "생존어 & 문자 단계 - 한글 자모 이해, 숫자, 간단한 인사",
    1: "초급 단계 - 기본 생활 표현, 직장 내 지시 듣기",
    2: "초중급 단계 - 시간, 장소, 간단한 지시 이해 및 대답",
    3: "중급 단계 - 이유 설명, 간단한 문제 상황 보고",
    4: "고급 단계 - 절차 설명, 계약 대화, 공식 표현",
  };
  return descriptions[level] || "레벨 미정";
}

export default router;