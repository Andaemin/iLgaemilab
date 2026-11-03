import express from 'express';
import AntGrowth, { LEVEL_REQUIREMENTS, XP_REWARDS } from '../models/AntGrowth.js';
import LearningProgress from '../models/LearningProgress.js';
import authMiddleware from '../middlewares/auth.mjs';
import { Op } from 'sequelize';

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

/**
 * GET /api/ant/status
 * 개미 상태 조회
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.user.id;

    // 개미 데이터 조회 또는 생성
    let ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      // 첫 방문 시 개미 생성
      ant = await AntGrowth.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        stage: 'egg',
        antName: `${req.user.name || '사용자'}의 개미`,
        lastHappinessUpdate: new Date(),
      });
    } else {
      // 행복도 감소 적용
      const decayResult = ant.applyHappinessDecay();
      if (decayResult.decayed) {
        await ant.save();
      }
    }

    // 레벨 진행도 계산
    const progress = ant.getLevelProgress();

    // 레벨 정보 추가
    const levelInfo = LEVEL_REQUIREMENTS[ant.level];

    res.json({
      success: true,
      data: {
        ...ant.toJSON(),
        progress,
        levelInfo,
        xpRewards: XP_REWARDS,
      },
    });
  } catch (error) {
    console.error('개미 상태 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미 상태를 불러오는데 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * POST /api/ant/feed
 * 학습 활동 완료 시 개미에게 먹이 주기 (경험치 부여)
 */
router.post('/feed', async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityType, amount, isReview } = req.body;

    // 개미 조회 또는 생성
    let ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      ant = await AntGrowth.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        stage: 'egg',
        antName: `${req.user.name || '사용자'}의 개미`,
        lastHappinessUpdate: new Date(),
      });
    }

    // 일일 활동 초기화 (날짜가 바뀌면 초기화)
    const today = new Date().toISOString().split('T')[0];
    if (!ant.lastActivityReset || ant.lastActivityReset !== today) {
      ant.dailyActivities = {
        date: today,
        speaking: 0,
        wrongAnswer: 0,
        game: 0,
        levelTest: 0,
      };
      ant.lastActivityReset = today;
    }

    let xpGained = 0;
    let activityName = '';
    let updatedFields = {};
    let isFirstDaily = false;

    // 활동 타입에 따라 경험치 및 통계 업데이트
    switch (activityType) {
      case 'lesson':
        // 레슨: 첫 완료 100xp, 복습 30xp
        if (isReview) {
          xpGained = XP_REWARDS.LESSON_REVIEW;
          activityName = '레슨 복습';
        } else {
          xpGained = XP_REWARDS.LESSON_COMPLETE;
          activityName = '레슨 완료';
        }
        ant.lessonsCompleted += 1;
        ant.totalTasksCompleted += 1;
        updatedFields = { lessonsCompleted: ant.lessonsCompleted };
        break;

      case 'words':
        xpGained = XP_REWARDS.WORDS_10;
        activityName = '단어 10개 학습';
        ant.wordsLearned += amount || 10;
        ant.totalTasksCompleted += 1;
        updatedFields = { wordsLearned: ant.wordsLearned };
        break;

      case 'speaking':
        // 발음 연습: 하루 첫 완료 50xp, 반복 10xp
        isFirstDaily = ant.dailyActivities.speaking === 0;
        xpGained = isFirstDaily ? XP_REWARDS.SPEAKING_FIRST : XP_REWARDS.SPEAKING_REPEAT;
        activityName = isFirstDaily ? '발음 연습 (오늘 첫 완료)' : '발음 연습';
        ant.dailyActivities.speaking += 1;
        ant.speakingMinutes += amount || 5;
        ant.totalTasksCompleted += 1;
        updatedFields = { speakingMinutes: ant.speakingMinutes };
        break;

      case 'wrongAnswer':
        // 오답노트: 하루 첫 완료 50xp, 반복 10xp
        isFirstDaily = ant.dailyActivities.wrongAnswer === 0;
        xpGained = isFirstDaily ? XP_REWARDS.WRONG_ANSWER_FIRST : XP_REWARDS.WRONG_ANSWER_REPEAT;
        activityName = isFirstDaily ? '오답노트 (오늘 첫 완료)' : '오답노트';
        ant.dailyActivities.wrongAnswer += 1;
        ant.totalTasksCompleted += 1;
        break;

      case 'game':
        // 게임: 하루 첫 완료 50xp, 반복 10xp
        isFirstDaily = ant.dailyActivities.game === 0;
        xpGained = isFirstDaily ? XP_REWARDS.GAME_FIRST : XP_REWARDS.GAME_REPEAT;
        activityName = isFirstDaily ? '게임 도전 (오늘 첫 완료)' : '게임 도전';
        ant.dailyActivities.game += 1;
        ant.totalTasksCompleted += 1;
        break;

      case 'levelTest':
        // 레벨 테스트: 하루 첫 완료 50xp
        isFirstDaily = ant.dailyActivities.levelTest === 0;
        xpGained = isFirstDaily ? XP_REWARDS.LEVEL_TEST : 0;
        activityName = isFirstDaily ? '레벨 테스트 (오늘 첫 완료)' : '레벨 테스트 (이미 완료)';
        ant.dailyActivities.levelTest += 1;
        ant.totalTasksCompleted += 1;
        break;

      case 'quiz':
        xpGained = XP_REWARDS.QUIZ_COMPLETE;
        activityName = '퀴즈 완료';
        ant.quizzesCompleted += 1;
        ant.totalTasksCompleted += 1;
        updatedFields = { quizzesCompleted: ant.quizzesCompleted };
        break;

      case 'all_tasks':
        xpGained = XP_REWARDS.ALL_TASKS_BONUS;
        activityName = '모든 학습 완료 보너스';
        break;

      case 'streak':
        xpGained = XP_REWARDS.STREAK_BONUS * (amount || 1);
        activityName = `연속 학습 ${amount}일 보너스`;
        ant.currentStreak = amount || ant.currentStreak;
        if (ant.currentStreak > ant.longestStreak) {
          ant.longestStreak = ant.currentStreak;
        }
        updatedFields = { currentStreak: ant.currentStreak, longestStreak: ant.longestStreak };
        break;

      default:
        return res.status(400).json({
          success: false,
          message: '잘못된 활동 타입입니다.',
        });
    }

    // XP가 0인 경우 메시지만 반환 (레벨 테스트 하루 1번 제한)
    if (xpGained === 0) {
      return res.json({
        success: true,
        message: `${activityName} - 이미 오늘 경험치를 획득하셨습니다.`,
        data: {
          ant: {
            ...ant.toJSON(),
            progress: ant.getLevelProgress(),
            levelInfo: LEVEL_REQUIREMENTS[ant.level],
          },
          reward: {
            xpGained: 0,
            activityName,
            activityType,
          },
          levelUp: null,
        },
      });
    }

    // 경험치 추가 및 레벨업 체크
    const levelUpResult = ant.addExperience(xpGained);

    // 먹이 관련 정보 업데이트
    ant.lastFeedTime = new Date();
    ant.feedCount += 1;

    // 행복도 증가 (최대 100)
    ant.happiness = Math.min(100, ant.happiness + 5);
    ant.lastHappinessUpdate = new Date();

    // 레벨업 시 특별 이벤트 추가
    if (levelUpResult.leveledUp) {
      const newLevelInfo = LEVEL_REQUIREMENTS[levelUpResult.newLevel];
      ant.specialEvents = [
        ...ant.specialEvents,
        {
          type: 'level_up',
          level: levelUpResult.newLevel,
          stage: levelUpResult.newStage,
          timestamp: new Date(),
          message: `${newLevelInfo.name}(으)로 성장했어요! 🎉`,
        },
      ];

      // 행복도 크게 증가
      ant.happiness = 100;
    }

    await ant.save();

    // 레벨 진행도 재계산
    const progress = ant.getLevelProgress();
    const levelInfo = LEVEL_REQUIREMENTS[ant.level];

    res.json({
      success: true,
      message: `${activityName}으로 ${xpGained} 경험치를 획득했어요!`,
      data: {
        ant: {
          ...ant.toJSON(),
          progress,
          levelInfo,
        },
        reward: {
          xpGained,
          activityName,
          activityType,
        },
        levelUp: levelUpResult.leveledUp ? {
          newLevel: levelUpResult.newLevel,
          newStage: levelUpResult.newStage,
          message: `축하합니다! ${LEVEL_REQUIREMENTS[levelUpResult.newLevel].name}(으)로 성장했어요!`,
        } : null,
      },
    });
  } catch (error) {
    console.error('개미 먹이 주기 실패:', error);
    res.status(500).json({
      success: false,
      message: '먹이를 주는데 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * GET /api/ant/history
 * 개미 성장 이력 조회
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;

    const ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      return res.json({
        success: true,
        data: {
          specialEvents: [],
          achievements: [],
        },
      });
    }

    res.json({
      success: true,
      data: {
        specialEvents: ant.specialEvents || [],
        achievements: ant.achievements || [],
        stats: {
          totalStudyDays: ant.totalStudyDays,
          currentStreak: ant.currentStreak,
          longestStreak: ant.longestStreak,
          totalTasksCompleted: ant.totalTasksCompleted,
          feedCount: ant.feedCount,
        },
      },
    });
  } catch (error) {
    console.error('개미 이력 조회 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미 이력을 불러오는데 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/ant/name
 * 개미 이름 변경
 */
router.patch('/name', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: '개미 이름을 입력해주세요.',
      });
    }

    if (name.length > 50) {
      return res.status(400).json({
        success: false,
        message: '개미 이름은 50자 이하여야 합니다.',
      });
    }

    const ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      return res.status(404).json({
        success: false,
        message: '개미를 찾을 수 없습니다.',
      });
    }

    ant.antName = name.trim();
    await ant.save();

    res.json({
      success: true,
      message: '개미 이름이 변경되었습니다.',
      data: {
        antName: ant.antName,
      },
    });
  } catch (error) {
    console.error('개미 이름 변경 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미 이름을 변경하는데 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/ant/color
 * 개미 색상 변경
 */
router.patch('/color', async (req, res) => {
  try {
    const userId = req.user.id;
    const { color } = req.body;

    const allowedColors = ['brown', 'red', 'black', 'yellow', 'green', 'blue', 'purple'];

    if (!color || !allowedColors.includes(color)) {
      return res.status(400).json({
        success: false,
        message: '유효한 색상을 선택해주세요.',
        allowedColors,
      });
    }

    const ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      return res.status(404).json({
        success: false,
        message: '개미를 찾을 수 없습니다.',
      });
    }

    ant.antColor = color;
    await ant.save();

    res.json({
      success: true,
      message: '개미 색상이 변경되었습니다.',
      data: {
        antColor: ant.antColor,
      },
    });
  } catch (error) {
    console.error('개미 색상 변경 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미 색상을 변경하는데 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * POST /api/ant/game-complete
 * 게임 완료 시 경험치 부여
 */
router.post('/game-complete', async (req, res) => {
  try {
    const userId = req.user.id;
    const { gameType } = req.body;

    // 유효한 게임 타입 체크
    const validGames = ['typing', 'wordchain', 'spelling', 'bingo', 'crossword', 'hangman'];
    if (!gameType || !validGames.includes(gameType)) {
      return res.status(400).json({
        success: false,
        message: '유효한 게임 타입이 아닙니다.',
        validGames,
      });
    }

    // 개미 조회 또는 생성
    let ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      ant = await AntGrowth.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        stage: 'egg',
        antName: `${req.user.name || '사용자'}의 개미`,
      });
    }

    // 오늘 날짜
    const today = new Date().toISOString().split('T')[0];

    // 오늘 이미 완료한 게임인지 체크
    const todayGames = ant.gamesCompleted.filter(g => g.date === today);
    const alreadyCompleted = todayGames.some(g => g.gameType === gameType);

    if (alreadyCompleted) {
      return res.json({
        success: true,
        message: '이미 오늘 완료한 게임입니다.',
        data: {
          ant: {
            ...ant.toJSON(),
            progress: ant.getLevelProgress(),
            levelInfo: LEVEL_REQUIREMENTS[ant.level],
          },
          reward: null,
          alreadyCompleted: true,
        },
      });
    }

    // 경험치 추가
    const xpGained = XP_REWARDS.GAME_COMPLETE;
    const levelUpResult = ant.addExperience(xpGained);

    // 게임 완료 기록 추가
    ant.gamesCompleted = [
      ...ant.gamesCompleted,
      {
        gameType,
        date: today,
        timestamp: new Date(),
      },
    ];

    // 행복도 증가
    ant.happiness = Math.min(100, ant.happiness + 3);
    ant.lastHappinessUpdate = new Date();

    await ant.save();

    const progress = ant.getLevelProgress();
    const levelInfo = LEVEL_REQUIREMENTS[ant.level];

    res.json({
      success: true,
      message: `${gameType} 게임 완료로 ${xpGained} 경험치를 획득했어요!`,
      data: {
        ant: {
          ...ant.toJSON(),
          progress,
          levelInfo,
        },
        reward: {
          xpGained,
          gameType,
        },
        levelUp: levelUpResult.leveledUp ? {
          newLevel: levelUpResult.newLevel,
          newStage: levelUpResult.newStage,
          message: `축하합니다! ${LEVEL_REQUIREMENTS[levelUpResult.newLevel].name}(으)로 성장했어요!`,
        } : null,
      },
    });
  } catch (error) {
    console.error('게임 완료 처리 실패:', error);
    res.status(500).json({
      success: false,
      message: '게임 완료 처리에 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * PATCH /api/ant/customize
 * 개미 커스터마이징 (모자, 옷, 배경)
 */
router.patch('/customize', async (req, res) => {
  try {
    const userId = req.user.id;
    const { hat, clothes, background } = req.body;

    const ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      return res.status(404).json({
        success: false,
        message: '개미를 찾을 수 없습니다.',
      });
    }

    // 업데이트할 필드만 변경
    if (hat !== undefined) ant.hat = hat;
    if (clothes !== undefined) ant.clothes = clothes;
    if (background !== undefined) ant.background = background;

    await ant.save();

    res.json({
      success: true,
      message: '개미 꾸미기가 완료되었습니다.',
      data: {
        hat: ant.hat,
        clothes: ant.clothes,
        background: ant.background,
      },
    });
  } catch (error) {
    console.error('개미 커스터마이징 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미 꾸미기에 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * GET /api/ant/sync-stats
 * 학습 통계와 개미 성장 동기화
 */
router.get('/sync-stats', async (req, res) => {
  try {
    const userId = req.user.id;

    // 개미 데이터 조회
    let ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      ant = await AntGrowth.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        stage: 'egg',
        antName: `${req.user.name || '사용자'}의 개미`,
      });
    }

    // 학습 진행도 데이터 조회 (최근 30일)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const learningData = await LearningProgress.findAll({
      where: {
        userId,
        date: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      order: [['date', 'DESC']],
    });

    // 총 학습일수 계산
    ant.totalStudyDays = learningData.length;

    // 연속 학습일 계산
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const data of learningData) {
      const dataDate = new Date(data.date);
      dataDate.setHours(0, 0, 0, 0);

      const diffDays = Math.floor((currentDate - dataDate) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    ant.currentStreak = streak;
    if (streak > ant.longestStreak) {
      ant.longestStreak = streak;
    }

    await ant.save();

    const progress = ant.getLevelProgress();
    const levelInfo = LEVEL_REQUIREMENTS[ant.level];

    res.json({
      success: true,
      message: '통계가 동기화되었습니다.',
      data: {
        ant: {
          ...ant.toJSON(),
          progress,
          levelInfo,
        },
        syncedData: {
          totalStudyDays: ant.totalStudyDays,
          currentStreak: ant.currentStreak,
          longestStreak: ant.longestStreak,
        },
      },
    });
  } catch (error) {
    console.error('통계 동기화 실패:', error);
    res.status(500).json({
      success: false,
      message: '통계 동기화에 실패했습니다.',
      error: error.message,
    });
  }
});

/**
 * POST /api/ant/click
 * 개미 클릭 시 행복도 1% 증가 + 경험치 1xp
 */
router.post('/click', async (req, res) => {
  try {
    const userId = req.user.id;

    // 개미 조회 또는 생성
    let ant = await AntGrowth.findOne({ where: { userId } });

    if (!ant) {
      ant = await AntGrowth.create({
        userId,
        level: 1,
        experience: 0,
        totalExperience: 0,
        stage: 'egg',
        antName: `${req.user.name || '사용자'}의 개미`,
        lastHappinessUpdate: new Date(),
      });
    }

    // 행복도 1% 증가 (최대 100)
    const happinessIncrease = 1;
    const oldHappiness = ant.happiness;
    ant.happiness = Math.min(100, ant.happiness + happinessIncrease);
    ant.lastHappinessUpdate = new Date();

    // 경험치 1xp 증가
    const xpGained = XP_REWARDS.ANT_CLICK;
    const levelUpResult = ant.addExperience(xpGained);

    // 레벨업 시 특별 이벤트 추가
    if (levelUpResult.leveledUp) {
      const newLevelInfo = LEVEL_REQUIREMENTS[levelUpResult.newLevel];
      ant.specialEvents = [
        ...ant.specialEvents,
        {
          type: 'level_up',
          level: levelUpResult.newLevel,
          stage: levelUpResult.newStage,
          timestamp: new Date(),
          message: `${newLevelInfo.name}(으)로 성장했어요! 🎉`,
        },
      ];

      // 레벨업 시 행복도 100으로
      ant.happiness = 100;
    }

    await ant.save();

    // 레벨 진행도 재계산
    const progress = ant.getLevelProgress();
    const levelInfo = LEVEL_REQUIREMENTS[ant.level];

    res.json({
      success: true,
      message: `개미를 쓰다듬었어요! 행복도 +${happinessIncrease}%, 경험치 +${xpGained}`,
      data: {
        ant: {
          ...ant.toJSON(),
          progress,
          levelInfo,
        },
        reward: {
          xpGained,
          happinessIncrease,
          oldHappiness,
          newHappiness: ant.happiness,
        },
        levelUp: levelUpResult.leveledUp ? {
          newLevel: levelUpResult.newLevel,
          newStage: levelUpResult.newStage,
          message: `축하합니다! ${LEVEL_REQUIREMENTS[levelUpResult.newLevel].name}(으)로 성장했어요!`,
        } : null,
      },
    });
  } catch (error) {
    console.error('개미 클릭 실패:', error);
    res.status(500).json({
      success: false,
      message: '개미를 쓰다듬는데 실패했습니다.',
      error: error.message,
    });
  }
});

export default router;
