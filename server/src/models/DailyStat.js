import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const DailyStat = sequelize.define(
  "DailyStat",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    successfulSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalDurationSeconds: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    averageScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    categoriesStudied: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    newCompletions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    lessonsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '완료한 레슨 수',
    },
    wordsLearned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '학습한 단어 수',
    },
    speakingMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '말하기 연습 시간 (분)',
    },
    quizzesCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '완료한 퀴즈 수',
    },
    activeLearningMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '실제 학습 활동 시간 (분)',
    },
  },
  {
    tableName: "daily_stats",
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "date"],
      },
    ],
  }
);

export default DailyStat;