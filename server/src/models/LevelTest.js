import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const LevelTest = sequelize.define(
  "LevelTest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionType: {
      type: DataTypes.ENUM("listening", "reading", "short_answer", "speaking"),
      allowNull: false,
      comment: "듣기, 읽기, 단답형, 말하기",
    },
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "문제 번호 (1-10)",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: "난이도 레벨 (0-4)",
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "문제 내용",
    },
    questionTextVi: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "베트남어 문제 설명",
    },
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "듣기 문제용 오디오 URL",
    },
    choices: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "객관식 선택지 [{id: 1, text: '오세요'}, ...]",
    },
    correctAnswer: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "정답 (객관식의 경우 선택지 id, 주관식은 키워드)",
    },
    acceptableAnswers: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "허용 가능한 답변들 (주관식/말하기용)",
    },
    scoringCriteria: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "채점 기준 (말하기: 발음, 문법, 의사전달 등)",
    },
    maxScore: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "해당 문제 배점",
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "정답 설명",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "level_tests",
    timestamps: true,
    indexes: [
      {
        fields: ["questionType", "questionNumber"],
        unique: true,
      },
    ],
  }
);

export default LevelTest;