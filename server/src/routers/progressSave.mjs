import express from "express";
import { ProgressSave } from "../models/index.js";
import authMiddleware from "../middlewares/auth.mjs";

const router = express.Router();

/**
 * POST /api/progress-save/save
 * 학습 진행 상황 저장
 */
router.post("/save", authMiddleware, async (req, res) => {
  try {
    const { category, level, type, currentPage, totalPages, savedData } = req.body;
    const userId = req.user.id;

    // 필수 필드 검증
    if (!category || level === undefined || !type || currentPage === undefined || !totalPages) {
      return res.status(400).json({
        success: false,
        message: "필수 필드가 누락되었습니다.",
      });
    }

    // 기존 저장 내역이 있으면 업데이트, 없으면 생성
    const [progressSave, created] = await ProgressSave.upsert(
      {
        userId,
        category,
        level,
        type,
        currentPage,
        totalPages,
        savedData: savedData || null,
        lastSavedAt: new Date(),
      },
      {
        returning: true,
      }
    );

    res.json({
      success: true,
      message: created ? "학습 진행 상황이 저장되었습니다." : "학습 진행 상황이 업데이트되었습니다.",
      data: progressSave,
    });
  } catch (error) {
    console.error("학습 진행 상황 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "학습 진행 상황 저장에 실패했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/progress-save/get/:category/:level/:type
 * 특정 학습의 저장된 진행 상황 조회
 */
router.get("/get/:category/:level/:type", authMiddleware, async (req, res) => {
  try {
    const { category, level, type } = req.params;
    const userId = req.user.id;

    const progressSave = await ProgressSave.findOne({
      where: {
        userId,
        category,
        level: parseInt(level),
        type,
      },
    });

    if (!progressSave) {
      return res.json({
        success: true,
        hasSave: false,
        data: null,
      });
    }

    res.json({
      success: true,
      hasSave: true,
      data: progressSave,
    });
  } catch (error) {
    console.error("학습 진행 상황 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "학습 진행 상황 조회에 실패했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/progress-save/list
 * 사용자의 모든 저장된 진행 상황 조회
 */
router.get("/list", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const progressSaves = await ProgressSave.findAll({
      where: { userId },
      order: [["lastSavedAt", "DESC"]],
    });

    res.json({
      success: true,
      data: progressSaves,
    });
  } catch (error) {
    console.error("학습 진행 상황 목록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "학습 진행 상황 목록 조회에 실패했습니다.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/progress-save/delete/:category/:level/:type
 * 특정 학습의 저장된 진행 상황 삭제 (학습 완료 시)
 */
router.delete("/delete/:category/:level/:type", authMiddleware, async (req, res) => {
  try {
    const { category, level, type } = req.params;
    const userId = req.user.id;

    const deleted = await ProgressSave.destroy({
      where: {
        userId,
        category,
        level: parseInt(level),
        type,
      },
    });

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        message: "삭제할 저장 내역이 없습니다.",
      });
    }

    res.json({
      success: true,
      message: "저장된 진행 상황이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("학습 진행 상황 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "학습 진행 상황 삭제에 실패했습니다.",
      error: error.message,
    });
  }
});

/**
 * DELETE /api/progress-save/clear
 * 사용자의 모든 저장된 진행 상황 삭제
 */
router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await ProgressSave.destroy({
      where: { userId },
    });

    res.json({
      success: true,
      message: `${deleted}개의 저장된 진행 상황이 삭제되었습니다.`,
    });
  } catch (error) {
    console.error("전체 학습 진행 상황 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "전체 학습 진행 상황 삭제에 실패했습니다.",
      error: error.message,
    });
  }
});

export default router;
