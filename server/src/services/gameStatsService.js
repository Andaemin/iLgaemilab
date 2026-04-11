import { Op } from "sequelize";
import sequelize from "../database/connection.js";
import GamePlayLog from "../models/GamePlayLog.js";

/**
 * 게임 플레이 로그 기록
 * @param {Number} userId - 사용자 ID (선택)
 * @param {String} gameType - 게임 종류
 * @param {String} sessionId - 세션 ID (선택)
 * @returns {Object} 생성된 로그
 */
export const logGamePlay = async (userId, gameType, sessionId = null) => {
  try {
    // 같은 세션에서 5분 이내 중복 로그 방지
    if (sessionId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentLog = await GamePlayLog.findOne({
        where: {
          sessionId,
          gameType,
          playedAt: {
            [Op.gte]: fiveMinutesAgo,
          },
        },
      });

      if (recentLog) {
        console.log("중복 로그 방지:", sessionId, gameType);
        return recentLog;
      }
    }

    const log = await GamePlayLog.create({
      userId,
      gameType,
      sessionId,
      playedAt: new Date(),
    });

    return log;
  } catch (error) {
    console.error("게임 플레이 로그 기록 오류:", error);
    throw error;
  }
};

/**
 * 이번 주 시작일 계산 (월요일 00:00)
 * @returns {Date} 이번 주 월요일 00:00
 */
const getThisWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (일요일) ~ 6 (토요일)
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일 기준으로 조정
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

/**
 * 지난 주 시작일과 종료일 계산
 * @returns {Object} { start, end }
 */
const getLastWeekRange = () => {
  const thisWeekStart = getThisWeekStart();
  const lastWeekEnd = new Date(thisWeekStart.getTime() - 1); // 이번 주 시작 -1ms
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  return { start: lastWeekStart, end: lastWeekEnd };
};

/**
 * 주간 TOP 게임 조회 (순위 변화 포함)
 * @param {Number} limit - 조회할 게임 수 (기본 3)
 * @returns {Array} TOP 게임 목록
 */
export const getTopGames = async (limit = 3) => {
  try {
    const thisWeekStart = getThisWeekStart();
    const lastWeekRange = getLastWeekRange();

    // 이번 주 게임별 플레이 횟수
    const thisWeekStats = await GamePlayLog.findAll({
      attributes: [
        "gameType",
        [sequelize.fn("COUNT", sequelize.col("id")), "playCount"],
      ],
      where: {
        playedAt: {
          [Op.gte]: thisWeekStart,
        },
      },
      group: ["gameType"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: limit,
      raw: true,
    });

    // 지난 주 게임별 플레이 횟수 (TOP 3만)
    const lastWeekStats = await GamePlayLog.findAll({
      attributes: [
        "gameType",
        [sequelize.fn("COUNT", sequelize.col("id")), "playCount"],
      ],
      where: {
        playedAt: {
          [Op.between]: [lastWeekRange.start, lastWeekRange.end],
        },
      },
      group: ["gameType"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
      limit: 3, // TOP 3만 가져오기
      raw: true,
    });

    // 지난 주 TOP 3 순위 맵 생성
    const lastWeekTop3Map = {};
    lastWeekStats.forEach((stat, index) => {
      lastWeekTop3Map[stat.gameType] = index + 1;
    });

    // 순위 변화 계산
    const topGames = thisWeekStats.map((stat, index) => {
      const currentRank = index + 1;
      const lastWeekRank = lastWeekTop3Map[stat.gameType];

      let rankChange = "new"; // 기본값: 신규 진입 (지난 주 TOP 3에 없었음)
      if (lastWeekRank) {
        // 지난 주 TOP 3에 있었던 경우
        const diff = lastWeekRank - currentRank;
        if (diff > 0) {
          rankChange = "up"; // 순위 상승
        } else if (diff < 0) {
          rankChange = "down"; // 순위 하락
        } else {
          rankChange = "same"; // 순위 유지
        }
      }

      return {
        gameType: stat.gameType,
        playCount: parseInt(stat.playCount),
        rank: currentRank,
        rankChange: rankChange,
        lastWeekRank: lastWeekRank || null,
      };
    });

    return topGames;
  } catch (error) {
    console.error("TOP 게임 조회 오류:", error);
    throw error;
  }
};

/**
 * 특정 게임의 주간 통계 조회
 * @param {String} gameType - 게임 종류
 * @returns {Object} 게임 통계
 */
export const getGameStats = async (gameType) => {
  try {
    const thisWeekStart = getThisWeekStart();

    const playCount = await GamePlayLog.count({
      where: {
        gameType,
        playedAt: {
          [Op.gte]: thisWeekStart,
        },
      },
    });

    return {
      gameType,
      playCount,
      weekStart: thisWeekStart,
    };
  } catch (error) {
    console.error("게임 통계 조회 오류:", error);
    throw error;
  }
};
