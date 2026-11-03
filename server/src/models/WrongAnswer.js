import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const WrongAnswer = sequelize.define(
  "WrongAnswer",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "사용자 ID",
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "학습 카테고리 (vocabulary, grammar, conversation 등)",
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "레벨 (1-5)",
    },
    questionType: {
      type: DataTypes.ENUM("quiz", "level_test"),
      allowNull: false,
      comment: "문제 유형 (레벨별 퀴즈 or 단계별 마무리 테스트)",
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "문제 내용",
    },
    questionEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "문제 내용 (영어)",
    },
    correctAnswer: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "정답",
    },
    userAnswer: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "사용자가 선택한 오답",
    },
    options: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "선택지 목록",
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "해설",
    },
    explanationEn: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "해설 (영어)",
    },
    isReviewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "복습 완료 여부",
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "복습한 날짜",
    },
  },
  {
    tableName: "wrong_answers",
    timestamps: true,
    indexes: [
      {
        fields: ["userId"],
      },
      {
        fields: ["userId", "category"],
      },
      {
        fields: ["userId", "isReviewed"],
      },
    ],
  }
);

export default WrongAnswer;
