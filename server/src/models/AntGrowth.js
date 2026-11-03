import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const AntGrowth = sequelize.define(
  'AntGrowth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    // 개미 기본 정보
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: '개미 레벨 (1:알, 2:애벌레, 3:번데기, 4:일개미, 5:병정개미, 6:여왕개미)',
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '현재 경험치',
    },
    totalExperience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '누적 총 경험치',
    },
    stage: {
      type: DataTypes.ENUM('egg', 'larva', 'pupa', 'worker', 'soldier', 'queen'),
      allowNull: false,
      defaultValue: 'egg',
      comment: '개미 성장 단계',
    },

    // 학습 활동 통계
    totalTasksCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '총 완료한 학습 활동 수',
    },
    lessonsCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '완료한 레슨 수',
    },
    wordsLearned: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '학습한 단어 수',
    },
    speakingMinutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '발음 연습 누적 시간(분)',
    },
    quizzesCompleted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '완료한 퀴즈 수',
    },

    // 학습 일수 및 연속성
    totalStudyDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '총 학습 일수',
    },
    currentStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '현재 연속 학습일',
    },
    longestStreak: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '최장 연속 학습일',
    },

    // 먹이 및 상호작용
    lastFeedTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '마지막 먹이 제공 시간',
    },
    feedCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: '총 먹이 제공 횟수',
    },
    happiness: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: '행복도 (0-100)',
    },
    lastHappinessUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '마지막 행복도 업데이트 시간',
    },

    // 일일 활동 추적
    dailyActivities: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {
        date: null,
        speaking: 0,
        wrongAnswer: 0,
        game: 0,
        levelTest: 0,
      },
      comment: '일일 활동 횟수 (자정 초기화)',
    },
    lastActivityReset: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '마지막 활동 초기화 날짜',
    },

    // 업적 및 특별 이벤트
    achievements: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '획득한 업적 목록',
    },
    specialEvents: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '특별 이벤트 기록',
    },

    // 개미 커스터마이징
    antName: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '개미 이름',
    },
    antColor: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'brown',
      comment: '개미 색상',
    },
    hat: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '개미 모자',
    },
    clothes: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '개미 옷',
    },
    background: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'garden',
      comment: '정원 배경',
    },

    // 게임 완료 기록
    gamesCompleted: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      comment: '완료한 게임 목록 (날짜별)',
    },
  },
  {
    tableName: 'ant_growth',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId'],
      },
    ],
  }
);

// 레벨별 필요 경험치 상수
export const LEVEL_REQUIREMENTS = {
  1: { minXp: 0, maxXp: 299, stage: 'egg', name: '알', description: '작고 소중한 개미 알이에요' },
  2: { minXp: 300, maxXp: 799, stage: 'larva', name: '애벌레', description: '꿈틀꿈틀 귀여운 애벌레예요' },
  3: { minXp: 800, maxXp: 1499, stage: 'pupa', name: '번데기', description: '곧 성체가 될 번데기예요' },
  4: { minXp: 1500, maxXp: 2499, stage: 'worker', name: '일개미', description: '열심히 일하는 일개미예요' },
  5: { minXp: 2500, maxXp: 3999, stage: 'soldier', name: '병정개미', description: '강력한 병정개미예요' },
  6: { minXp: 4000, maxXp: Infinity, stage: 'queen', name: '여왕개미', description: '위엄있는 여왕개미예요!' },
};

// 활동별 경험치 보상
export const XP_REWARDS = {
  LESSON_COMPLETE: 100,    // 레슨 첫 완료
  LESSON_REVIEW: 30,       // 레슨 복습
  WORDS_10: 50,            // 단어 10개 학습
  SPEAKING_FIRST: 50,      // 발음 연습 하루 첫 완료
  SPEAKING_REPEAT: 10,     // 발음 연습 반복 완료
  QUIZ_COMPLETE: 50,       // 퀴즈 완료
  WRONG_ANSWER_FIRST: 50,  // 오답노트 하루 첫 완료
  WRONG_ANSWER_REPEAT: 10, // 오답노트 반복 완료
  GAME_FIRST: 50,          // 게임 하루 첫 완료
  GAME_REPEAT: 10,         // 게임 반복 완료
  LEVEL_TEST: 50,          // 레벨 테스트 하루 첫 완료
  ALL_TASKS_BONUS: 100,    // 4가지 모두 완료 보너스
  STREAK_BONUS: 20,        // 연속 학습일 보너스 (일당)
  ANT_CLICK: 100,          // 개미 클릭 (행복도 1% + 100xp)
};

// 헬퍼 메서드
AntGrowth.prototype.addExperience = function(amount) {
  this.experience += amount;
  this.totalExperience += amount;

  // 레벨 업 체크
  for (let level = 6; level >= 1; level--) {
    const req = LEVEL_REQUIREMENTS[level];
    if (this.totalExperience >= req.minXp) {
      if (this.level !== level) {
        this.level = level;
        this.stage = req.stage;
        return { leveledUp: true, newLevel: level, newStage: req.stage };
      }
      break;
    }
  }

  return { leveledUp: false };
};

AntGrowth.prototype.getLevelProgress = function() {
  const currentReq = LEVEL_REQUIREMENTS[this.level];
  const nextReq = LEVEL_REQUIREMENTS[this.level + 1];

  if (!nextReq) {
    return {
      level: this.level,
      stage: this.stage,
      currentXp: this.totalExperience,
      requiredXp: currentReq.maxXp,
      percentage: 100,
      isMaxLevel: true,
    };
  }

  const xpInCurrentLevel = this.totalExperience - currentReq.minXp;
  const xpNeededForNextLevel = nextReq.minXp - currentReq.minXp;
  const percentage = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level: this.level,
    stage: this.stage,
    currentXp: this.totalExperience,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    requiredXp: nextReq.minXp,
    percentage,
    isMaxLevel: false,
  };
};

// 행복도 감소 계산 및 적용 (20분당 10%)
AntGrowth.prototype.applyHappinessDecay = function() {
  const now = new Date();
  const lastUpdate = this.lastHappinessUpdate ? new Date(this.lastHappinessUpdate) : now;

  // 시간 경과 계산 (밀리초 -> 분)
  const minutesElapsed = (now - lastUpdate) / (1000 * 60);

  if (minutesElapsed >= 20) {
    // 20분 이상 경과한 경우에만 감소
    const cycles = Math.floor(minutesElapsed / 20); // 20분 단위 계산
    const decayAmount = cycles * 10; // 20분마다 10%씩 감소
    const newHappiness = Math.max(0, this.happiness - decayAmount);

    this.happiness = newHappiness;
    this.lastHappinessUpdate = now;

    return {
      decayed: true,
      minutesElapsed: Math.floor(minutesElapsed),
      cycles,
      decayAmount,
      newHappiness,
    };
  }

  return {
    decayed: false,
    minutesElapsed: Math.floor(minutesElapsed),
  };
};

export default AntGrowth;
