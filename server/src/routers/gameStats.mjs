import express from "express";
import {
  logGamePlay,
  getTopGames,
  getGameStats,
} from "../services/gameStatsService.js";
import authMiddleware from "../middlewares/auth.mjs";

const router = express.Router();

/**
 * POST /api/game-stats/log
 * 게임 플레이 로그 기록
 */
router.post("/api/game-stats/log", async (req, res) => {
  try {
    const { gameType, sessionId } = req.body;

    // gameType 필수 검증
    if (!gameType) {
      return res.status(400).json({
        success: false,
        message: "게임 종류(gameType)는 필수입니다.",
      });
    }

    // 유효한 게임 타입 검증
    const validGameTypes = [
      "initial_consonant",
      "word_chain",
      "spelling_quiz",
      "typer",
      "bingo",
      "crossword_puzzle",
    ];

    if (!validGameTypes.includes(gameType)) {
      return res.status(400).json({
        success: false,
        message: "유효하지 않은 게임 종류입니다.",
      });
    }

    // 로그인한 경우 userId 사용, 아니면 null
    const userId = req.user ? req.user.id : null;

    const log = await logGamePlay(userId, gameType, sessionId);

    res.status(201).json({
      success: true,
      message: "게임 플레이가 기록되었습니다.",
      data: log,
    });
  } catch (error) {
    console.error("게임 플레이 로그 기록 오류:", error);
    res.status(500).json({
      success: false,
      message: "게임 플레이 로그 기록 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-stats/top-games
 * 주간 TOP 게임 조회
 * Query params: limit (기본 3)
 */
router.get("/api/game-stats/top-games", async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const topGames = await getTopGames(parseInt(limit));

    res.status(200).json({
      success: true,
      data: topGames,
    });
  } catch (error) {
    console.error("TOP 게임 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "TOP 게임 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * GET /api/game-stats/:gameType
 * 특정 게임의 주간 통계 조회
 */
router.get("/api/game-stats/:gameType", async (req, res) => {
  try {
    const { gameType } = req.params;

    const stats = await getGameStats(gameType);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("게임 통계 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "게임 통계 조회 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

export default router;
