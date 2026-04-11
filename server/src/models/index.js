import User from "./User.js";
import Category from "./Category.js";
import Subcategory from "./Subcategory.js";
import LearningContent from "./LearningContent.js";
import UserProgress from "./UserProgress.js";
import LearningSession from "./LearningSession.js";
import Achievement from "./Achievement.js";
import UserAchievement from "./UserAchievement.js";
import DailyStat from "./DailyStat.js";
import LevelTest from "./LevelTest.js";
import LevelTestResult from "./LevelTestResult.js";
import QuickStartCard from "./QuickStartCard.js";
import JobScenario from "./JobScenario.js";
import ScenarioDialogue from "./ScenarioDialogue.js";
import LearningProgress from "./LearningProgress.js";
import SpeakingScenario from "./SpeakingScenario.js";
import PracticeSession from "./PracticeSession.js";
import SpeakingHistory from "./SpeakingHistory.js";
import LevelProgress from "./LevelProgress.js";
import WrongAnswer from "./WrongAnswer.js";
import ProgressSave from "./ProgressSave.js";
import GameScore from "./GameScore.js";
import GamePlayLog from "./GamePlayLog.js";
import AntGrowth from "./AntGrowth.js";

// Define associations

// User associations
User.hasMany(UserProgress, {
  foreignKey: "userId",
  as: "progress",
});

User.hasMany(LearningSession, {
  foreignKey: "userId",
  as: "sessions",
});

User.hasMany(UserAchievement, {
  foreignKey: "userId",
  as: "achievements",
});

User.hasMany(DailyStat, {
  foreignKey: "userId",
  as: "dailyStats",
});

User.hasMany(LearningProgress, {
  foreignKey: "userId",
  as: "learningProgress",
});

User.hasMany(LevelProgress, {
  foreignKey: "userId",
  as: "levelProgress",
});

// Category associations
Category.hasMany(Subcategory, {
  foreignKey: "categoryId",
  as: "subcategories",
});

Category.hasMany(LearningContent, {
  foreignKey: "categoryId",
  as: "contents",
});

// Subcategory associations
Subcategory.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Subcategory.hasMany(LearningContent, {
  foreignKey: "subcategoryId",
  as: "contents",
});

// LearningContent associations
LearningContent.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

LearningContent.belongsTo(Subcategory, {
  foreignKey: "subcategoryId",
  as: "subcategory",
});

LearningContent.hasMany(UserProgress, {
  foreignKey: "contentId",
  as: "userProgress",
});

LearningContent.hasMany(LearningSession, {
  foreignKey: "contentId",
  as: "sessions",
});

// UserProgress associations
UserProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

UserProgress.belongsTo(LearningContent, {
  foreignKey: "contentId",
  as: "content",
});

// LearningSession associations
LearningSession.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

LearningSession.belongsTo(LearningContent, {
  foreignKey: "contentId",
  as: "content",
});

// Achievement associations
Achievement.hasMany(UserAchievement, {
  foreignKey: "achievementId",
  as: "userAchievements",
});

// UserAchievement associations
UserAchievement.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

UserAchievement.belongsTo(Achievement, {
  foreignKey: "achievementId",
  as: "achievement",
});

// DailyStat associations
DailyStat.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// LevelTest associations
LevelTest.hasMany(LevelTestResult, {
  foreignKey: "questionId",
  as: "results",
});

// LevelTestResult associations
LevelTestResult.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

LevelTestResult.belongsTo(LevelTest, {
  foreignKey: "questionId",
  as: "question",
});

User.hasMany(LevelTestResult, {
  foreignKey: "userId",
  as: "levelTestResults",
});

// JobScenario associations
JobScenario.hasMany(ScenarioDialogue, {
  foreignKey: "scenarioId",
  as: "dialogues",
});

// ScenarioDialogue associations
ScenarioDialogue.belongsTo(JobScenario, {
  foreignKey: "scenarioId",
  as: "scenario",
});

// LearningProgress associations
LearningProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// LevelProgress associations
LevelProgress.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// Speaking Practice associations
User.hasMany(PracticeSession, {
  foreignKey: "userId",
  as: "practiceSessions",
});

PracticeSession.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

PracticeSession.belongsTo(SpeakingScenario, {
  foreignKey: "scenarioId",
  as: "scenario",
});

SpeakingScenario.hasMany(PracticeSession, {
  foreignKey: "scenarioId",
  as: "sessions",
});

PracticeSession.hasMany(SpeakingHistory, {
  foreignKey: "sessionId",
  as: "history",
});

SpeakingHistory.belongsTo(PracticeSession, {
  foreignKey: "sessionId",
  as: "session",
});

SpeakingHistory.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(SpeakingHistory, {
  foreignKey: "userId",
  as: "speakingHistory",
});

// WrongAnswer associations
User.hasMany(WrongAnswer, {
  foreignKey: "userId",
  as: "wrongAnswers",
});

WrongAnswer.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// ProgressSave associations
User.hasMany(ProgressSave, {
  foreignKey: "userId",
  as: "progressSaves",
});

ProgressSave.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// GameScore associations
User.hasMany(GameScore, {
  foreignKey: "userId",
  as: "gameScores",
});

GameScore.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// AntGrowth associations
User.hasOne(AntGrowth, {
  foreignKey: "userId",
  as: "antGrowth",
});

AntGrowth.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export {
  User,
  Category,
  Subcategory,
  LearningContent,
  UserProgress,
  LearningSession,
  Achievement,
  UserAchievement,
  DailyStat,
  LevelTest,
  LevelTestResult,
  QuickStartCard,
  JobScenario,
  ScenarioDialogue,
  LearningProgress,
  SpeakingScenario,
  PracticeSession,
  SpeakingHistory,
  LevelProgress,
  WrongAnswer,
  ProgressSave,
  GameScore,
  GamePlayLog,
  AntGrowth,
};

export default {
  User,
  Category,
  Subcategory,
  LearningContent,
  UserProgress,
  LearningSession,
  Achievement,
  UserAchievement,
  DailyStat,
  LevelTest,
  LevelTestResult,
  QuickStartCard,
  JobScenario,
  ScenarioDialogue,
  LearningProgress,
  SpeakingScenario,
  PracticeSession,
  SpeakingHistory,
  LevelProgress,
  WrongAnswer,
  ProgressSave,
  GameScore,
  GamePlayLog,
  AntGrowth,
};