import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const JobScenario = sequelize.define(
  "JobScenario",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    occupationCategory: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "직무 카테고리 (manufacturing, construction, service, hospital, market)",
    },
    scenarioTitle: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: "시나리오 제목",
    },
    scenarioTitleVi: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: "베트남어 시나리오 제목",
    },
    situation: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "상황 설명",
    },
    situationVi: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "베트남어 상황 설명",
    },
    objective: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "학습 목표",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: "난이도 (0-4)",
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      comment: "예상 소요 시간 (분)",
    },
    keywords: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "핵심 단어/표현 리스트",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "검색용 태그 ['안전', '지시', '고객응대' 등]",
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "시나리오 대표 이미지",
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "사용 횟수 통계",
    },
    completionRate: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: "평균 완료율 (%)",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "job_scenarios",
    timestamps: true,
    indexes: [
      {
        fields: ["occupationCategory", "difficulty"],
      },
    ],
  }
);

export default JobScenario;