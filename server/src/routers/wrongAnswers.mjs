import express from "express";
import authMiddleware from "../middlewares/auth.mjs";
import db from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

// 오답 저장
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      category,
      level,
      questionType,
      question,
      questionEn,
      correctAnswer,
      userAnswer,
      options,
      explanation,
      explanationEn,
    } = req.body;

    // 중복 오답 체크 (같은 문제를 또 틀렸을 경우 업데이트)
    const existingWrongAnswer = await db.WrongAnswer.findOne({
      where: {
        userId,
        category,
        level,
        questionType,
        question,
      },
    });

    if (existingWrongAnswer) {
      // 기존 오답 업데이트 (복습 상태 초기화)
      await existingWrongAnswer.update({
        userAnswer,
        isReviewed: false,
        reviewedAt: null,
      });

      return res.status(200).json({
        success: true,
        message: "오답이 업데이트되었습니다.",
        wrongAnswer: existingWrongAnswer,
      });
    }

    // 새 오답 저장
    const wrongAnswer = await db.WrongAnswer.create({
      userId,
      category,
      level,
      questionType,
      question,
      questionEn,
      correctAnswer,
      userAnswer,
      options,
      explanation,
      explanationEn,
    });

    res.status(201).json({
      success: true,
      message: "오답이 저장되었습니다.",
      wrongAnswer,
    });
  } catch (error) {
    console.error("❌ 오답 저장 실패:", error);
    res.status(500).json({
      success: false,
      message: "오답 저장에 실패했습니다.",
      error: error.message,
    });
  }
});

// 오답 목록 조회 (필터링 가능)
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, level, questionType, isReviewed } = req.query;

    // 조회 조건 설정
    const where = { userId };

    if (category) where.category = category;
    if (level) where.level = parseInt(level);
    if (questionType) where.questionType = questionType;
    if (isReviewed !== undefined) {
      where.isReviewed = isReviewed === "true";
    }

    const wrongAnswers = await db.WrongAnswer.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    // 카테고리별 통계
    const stats = await db.WrongAnswer.findAll({
      where: { userId },
      attributes: [
        "category",
        [db.WrongAnswer.sequelize.fn("COUNT", "*"), "count"],
        [
          db.WrongAnswer.sequelize.fn(
            "SUM",
            db.WrongAnswer.sequelize.cast(
              db.WrongAnswer.sequelize.col("isReviewed"),
              "INTEGER"
            )
          ),
          "reviewedCount",
        ],
      ],
      group: ["category"],
      raw: true,
    });

    res.status(200).json({
      success: true,
      wrongAnswers,
      stats,
      total: wrongAnswers.length,
    });
  } catch (error) {
    console.error("❌ 오답 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "오답 목록 조회에 실패했습니다.",
      error: error.message,
    });
  }
});

// 오답 복습 완료 표시
router.patch("/:id/review", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const wrongAnswer = await db.WrongAnswer.findOne({
      where: { id, userId },
    });

    if (!wrongAnswer) {
      return res.status(404).json({
        success: false,
        message: "오답을 찾을 수 없습니다.",
      });
    }

    await wrongAnswer.update({
      isReviewed: true,
      reviewedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "복습 완료로 표시되었습니다.",
      wrongAnswer,
    });
  } catch (error) {
    console.error("❌ 오답 복습 완료 표시 실패:", error);
    res.status(500).json({
      success: false,
      message: "복습 완료 표시에 실패했습니다.",
      error: error.message,
    });
  }
});

// 오답 삭제
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const wrongAnswer = await db.WrongAnswer.findOne({
      where: { id, userId },
    });

    if (!wrongAnswer) {
      return res.status(404).json({
        success: false,
        message: "오답을 찾을 수 없습니다.",
      });
    }

    await wrongAnswer.destroy();

    res.status(200).json({
      success: true,
      message: "오답이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("❌ 오답 삭제 실패:", error);
    res.status(500).json({
      success: false,
      message: "오답 삭제에 실패했습니다.",
      error: error.message,
    });
  }
});

// 오답 전체 통계
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalWrongAnswers = await db.WrongAnswer.count({
      where: { userId },
    });

    const reviewedCount = await db.WrongAnswer.count({
      where: { userId, isReviewed: true },
    });

    const byCategory = await db.WrongAnswer.findAll({
      where: { userId },
      attributes: [
        "category",
        [db.WrongAnswer.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["category"],
      raw: true,
    });

    const byLevel = await db.WrongAnswer.findAll({
      where: { userId },
      attributes: [
        "level",
        [db.WrongAnswer.sequelize.fn("COUNT", "*"), "count"],
      ],
      group: ["level"],
      order: [["level", "ASC"]],
      raw: true,
    });

    res.status(200).json({
      success: true,
      stats: {
        total: totalWrongAnswers,
        reviewed: reviewedCount,
        notReviewed: totalWrongAnswers - reviewedCount,
        byCategory,
        byLevel,
      },
    });
  } catch (error) {
    console.error("❌ 오답 통계 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "오답 통계 조회에 실패했습니다.",
      error: error.message,
    });
  }
});

export default router;
