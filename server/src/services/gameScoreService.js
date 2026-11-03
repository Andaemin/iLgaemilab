import { GameScore, User } from "../models/index.js";
import { Op } from "sequelize";

/**
 * 게임 점수 저장
 * @param {Object} scoreData - 점수 데이터
 * @returns {Object} 저장된 점수 데이터
 */
export const saveGameScore = async (scoreData) => {
  const { userId, gameType, score, difficulty, gameMode, additionalData } = scoreData;

  const gameScore = await GameScore.create({
    userId,
    gameType,
    score,
    difficulty,
    gameMode,
    additionalData,
    playedAt: new Date(),
  });

  return gameScore;
};

/**
 * 게임별 TOP N 랭킹 조회
 * @param {String} gameType - 게임 종류
 * @param {Number} limit - 조회할 랭킹 수 (기본 3위)
 * @param {String} difficulty - 난이도 필터 (선택)
 * @param {String} gameMode - 게임 모드 필터 (선택)
 * @returns {Array} 랭킹 데이터
 */
export const getTopRankings = async (gameType, limit = 3, difficulty = null, gameMode = null) => {
  const whereClause = { gameType };

  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

  if (gameMode) {
    whereClause.gameMode = gameMode;
  }

  const rankings = await GameScore.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "avatarUrl"],
      },
    ],
    order: [
      ["score", "DESC"],
      ["playedAt", "ASC"], // 동점일 경우 먼저 달성한 사람이 상위
    ],
    limit: limit,
  });

  return rankings.map((ranking, index) => ({
    rank: index + 1,
    id: ranking.id,  // 게임 점수 기록 고유 ID
    userId: ranking.user.id,
    userName: ranking.user.name,
    avatarUrl: ranking.user.avatarUrl,
    score: ranking.score,
    additionalData: ranking.additionalData,
    playedAt: ranking.playedAt,
  }));
};

/**
 * 사용자의 특정 게임 최고 점수 조회
 * @param {Number} userId - 사용자 ID
 * @param {String} gameType - 게임 종류
 * @param {String} difficulty - 난이도 (선택)
 * @param {String} gameMode - 게임 모드 (선택)
 * @returns {Object} 최고 점수 데이터
 */
export const getUserBestScore = async (userId, gameType, difficulty = null, gameMode = null) => {
  const whereClause = { userId, gameType };

  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

  if (gameMode) {
    whereClause.gameMode = gameMode;
  }

  const bestScore = await GameScore.findOne({
    where: whereClause,
    order: [["score", "DESC"]],
  });

  return bestScore;
};

/**
 * 사용자의 게임 점수 히스토리 조회
 * @param {Number} userId - 사용자 ID
 * @param {String} gameType - 게임 종류
 * @param {Number} limit - 조회할 개수
 * @returns {Array} 점수 히스토리
 */
export const getUserScoreHistory = async (userId, gameType, limit = 10) => {
  const history = await GameScore.findAll({
    where: { userId, gameType },
    order: [["playedAt", "DESC"]],
    limit: limit,
  });

  return history;
};

/**
 * 사용자의 현재 랭킹 순위 조회
 * @param {Number} userId - 사용자 ID
 * @param {String} gameType - 게임 종류
 * @param {Number} score - 사용자 점수
 * @param {String} difficulty - 난이도 (선택)
 * @param {String} gameMode - 게임 모드 (선택)
 * @returns {Number} 순위
 */
export const getUserRank = async (userId, gameType, score, difficulty = null, gameMode = null) => {
  const whereClause = {
    gameType,
    score: { [Op.gt]: score }, // 자신보다 높은 점수
  };

  if (difficulty) {
    whereClause.difficulty = difficulty;
  }

  if (gameMode) {
    whereClause.gameMode = gameMode;
  }

  const higherScoresCount = await GameScore.count({
    where: whereClause,
  });

  return higherScoresCount + 1; // 자신의 순위
};

export default {
  saveGameScore,
  getTopRankings,
  getUserBestScore,
  getUserScoreHistory,
  getUserRank,
};
