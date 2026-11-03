import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const LevelTestResult = sequelize.define(
  "LevelTestResult",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    testSessionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "테스트 세션 식별자",
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "level_tests",
        key: "id",
      },
    },
    userAnswer: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "사용자 답변",
    },
    userAudioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "말하기 문제 녹음 파일 URL",
    },
    sttResult: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "STT 인식 결과 (말하기용)",
    },
    score: {
      type: DataTypes.DECIMAL(3, 1),
      defaultValue: 0,
      comment: "획득 점수",
    },
    feedback: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "GPT 피드백 (발음, 문법 등)",
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "답변 소요 시간 (초)",
    },
  },
  {
    tableName: "level_test_results",
    timestamps: true,
    indexes: [
      {
        fields: ["userId", "testSessionId"],
      },
    ],
  }
);

export default LevelTestResult;