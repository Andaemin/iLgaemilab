import express from "express";
import { QuickStartCard, User } from "../models/index.js";
import { OpenAI } from "openai";

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 직무별 Quick Start 카드 가져오기
router.get("/api/quickstart-cards/:occupation", async (req, res) => {
  try {
    const { occupation } = req.params;
    const { userId } = req.query;

    // 직무별 카드 조회
    const cards = await QuickStartCard.findAll({
      where: {
        occupationCategory: occupation,
        isActive: true,
      },
      order: [["cardOrder", "ASC"]],
      limit: 5, // 5문장 카드
    });

    // 사용자 정보가 있으면 사용 통계 업데이트
    if (userId) {
      const user = await User.findByPk(userId);
      if (user && !user.levelTestCompleted) {
        // 레벨테스트 전 Quick Start 카드 표시 기록
        console.log(`User ${userId} accessed quickstart cards for ${occupation}`);
      }
    }

    res.json({
      success: true,
      occupation,
      cards: cards.map(card => ({
        id: card.id,
        order: card.cardOrder,
        korean: card.koreanText,
        vietnamese: card.vietnameseText,
        chinese: card.chineseText,
        english: card.englishText,
        phonetic: card.phoneticText,
        audioUrl: card.audioUrl,
        icon: card.icon,
        situation: card.situationDescription,
        tags: card.tags,
      })),
      totalCards: cards.length,
    });
  } catch (error) {
    console.error("Quickstart cards error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch quickstart cards",
    });
  }
});

// Quick Start 카드 연습 결과 제출
router.post("/api/quickstart-cards/practice", async (req, res) => {
  try {
    const {
      userId,
      cardId,
      sttResult,
      targetText,
      audioUrl,
      timeTaken
    } = req.body;

    // GPT로 발음 평가
    const evaluation = await evaluatePronunciation(targetText, sttResult);

    // 카드 사용 횟수 업데이트
    const card = await QuickStartCard.findByPk(cardId);
    if (card) {
      await card.increment("usageCount");
    }

    res.json({
      success: true,
      cardId,
      score: evaluation.score,
      feedback: evaluation.feedback,
      corrections: evaluation.corrections,
      shouldRepeat: evaluation.score < 80,
      vietnameseFeedback: evaluation.vietnameseFeedback,
    });
  } catch (error) {
    console.error("Practice submission error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process practice submission",
    });
  }
});

// 모든 직무 카테고리 목록
router.get("/api/quickstart-cards/categories", async (req, res) => {
  try {
    const categories = [
      {
        id: "manufacturing",
        name: "제조업",
        nameVi: "Sản xuất",
        icon: "⚙️",
        description: "공장 및 제조 현장에서 사용하는 표현",
      },
      {
        id: "construction",
        name: "건설업",
        nameVi: "Xây dựng",
        icon: "🏗️",
        description: "건설 현장에서 필요한 안전 및 작업 표현",
      },
      {
        id: "service",
        name: "서비스직",
        nameVi: "Dịch vụ",
        icon: "🛍️",
        description: "마트, 카페 등 서비스업 고객 응대",
      },
      {
        id: "hospital",
        name: "병원/생활",
        nameVi: "Bệnh viện",
        icon: "🏥",
        description: "병원 방문 및 일상생활 표현",
      },
      {
        id: "market",
        name: "마트/매장",
        nameVi: "Siêu thị",
        icon: "🛒",
        description: "마트 및 매장 업무 관련 표현",
      },
    ];

    res.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Categories error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch categories",
    });
  }
});

// TTS 음성 생성
router.post("/api/quickstart-cards/tts", async (req, res) => {
  try {
    const { text, speed = 1.0 } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    // OpenAI TTS 사용 (또는 Naver CLOVA 등 다른 서비스 사용 가능)
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer", // 여성 목소리
      input: text,
      speed: speed, // 0.25 ~ 4.0 (느리게 ~ 빠르게)
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate TTS",
    });
  }
});

// 발음 평가 함수
async function evaluatePronunciation(target, recognized) {
  try {
    const prompt = `한국어 발음 평가를 수행합니다.
목표 문장: "${target}"
인식 결과: "${recognized}"

평가 기준:
1. 정확도 (0-100점)
2. 잘못 발음된 부분
3. 개선 제안

JSON 형식으로 응답:
{
  "score": 점수(0-100),
  "feedback": "전체 피드백",
  "corrections": ["교정사항1", "교정사항2"],
  "vietnameseFeedback": "베트남어 피드백",
  "errors": [
    {
      "word": "잘못된 단어",
      "expected": "예상 발음",
      "actual": "실제 발음",
      "suggestion": "개선 방법"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "당신은 한국어 발음 교정 전문가입니다. 베트남 이주 노동자의 한국어 학습을 돕고 있습니다.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0,
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

export default router;