import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const ScenarioDialogue = sequelize.define(
  "ScenarioDialogue",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    scenarioId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "job_scenarios",
        key: "id",
      },
    },
    turnNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "대화 턴 번호 (1, 2, 3...)",
    },
    speaker: {
      type: DataTypes.ENUM("system", "user"),
      allowNull: false,
      comment: "발화자 (시스템 또는 사용자)",
    },
    koreanText: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "한국어 대사",
    },
    expectedResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "사용자가 말해야 할 예상 응답",
    },
    alternativeResponses: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "허용 가능한 대체 응답들",
    },
    vietnameseHint: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "베트남어 힌트/설명",
    },
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "TTS 오디오 URL",
    },
    feedbackTemplate: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "GPT 피드백 템플릿",
    },
    keyPoints: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "핵심 체크 포인트 (조사, 어미, 단어 등)",
    },
    nextTurnCondition: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "다음 턴으로 진행 조건",
    },
  },
  {
    tableName: "scenario_dialogues",
    timestamps: true,
    indexes: [
      {
        fields: ["scenarioId", "turnNumber"],
        unique: true,
      },
    ],
  }
);

export default ScenarioDialogue;