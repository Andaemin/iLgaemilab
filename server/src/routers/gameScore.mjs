import express from "express";
import {
  saveGameScore,
  getTopRankings,
  getUserBestScore,
  getUserScoreHistory,
  getUserRank,
} from "../services/gameScoreService.js";
import authMiddleware from "../middlewares/auth.mjs";

const router = express.Router();

/**
 * POST /api/game-scores
 * 게임 점수 저장
 */
router.post("/api/game-scores", authMiddleware, async (req, res) => {
  try {
    const { gameType, score, difficulty, gameMode, additionalData } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    // 필수 필드 검증
    if (!gameType || score === undefined) {
      return res.status(400).json({
        success: false,
        message: "게임 종류와 점수는 필수입니다.",
      });
    }

    // 게임 점수 저장
    const gameScore = await saveGameScore({
      userId,
      gameType,
      score,
      difficulty,
      gameMode,
      additionalData,
    });

    // 사용자 순위 조회
    const userRank = await getUserRank(userId, gameType, score, difficulty, gameMode);

    res.status(201).json({
      success: true,
      message: "게임 점수가 저장되었습니다.",
      data: {
        gameScore,
        rank: userRank,
        userName: userName,
      },
    });
  } catch (error) {
    console.error("게임 점수 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "게임 점수 저장 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-scores/rankings/:gameType
 * 게임별 TOP 랭킹 조회
 * Query params: limit (기본 3), difficulty, gameMode
 */
router.get("/api/game-scores/rankings/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 3, difficulty, gameMode } = req.query;

    const rankings = await getTopRankings(
      gameType,
      parseInt(limit),
      difficulty,
      gameMode
    );

    res.status(200).json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    console.error("랭킹 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "랭킹 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-scores/best/:gameType
 * 사용자의 최고 점수 조회
 * Query params: difficulty, gameMode
 */
router.get("/api/game-scores/best/:gameType", authMiddleware, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { difficulty, gameMode } = req.query;
    const userId = req.user.id;

    const bestScore = await getUserBestScore(userId, gameType, difficulty, gameMode);

    res.status(200).json({
      success: true,
      data: bestScore,
    });
  } catch (error) {
    console.error("최고 점수 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "최고 점수 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-scores/history/:gameType
 * 사용자의 게임 점수 히스토리 조회
 * Query params: limit (기본 10)
 */
router.get("/api/game-scores/history/:gameType", authMiddleware, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const history = await getUserScoreHistory(userId, gameType, parseInt(limit));

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("점수 히스토리 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "점수 히스토리 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-scores/my-rank/:gameType
 * 사용자의 현재 순위 조회
 * Query params: score (필수), difficulty, gameMode
 */
router.get("/api/game-scores/my-rank/:gameType", authMiddleware, async (req, res) => {
  try {
    const { gameType } = req.params;
    const { score, difficulty, gameMode } = req.query;
    const userId = req.user.id;

    if (!score) {
      return res.status(400).json({
        success: false,
        message: "점수는 필수입니다.",
      });
    }

    const rank = await getUserRank(userId, gameType, parseInt(score), difficulty, gameMode);

    res.status(200).json({
      success: true,
      data: { rank },
    });
  } catch (error) {
    console.error("순위 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "순위 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

export default router;
