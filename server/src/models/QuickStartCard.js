import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const QuickStartCard = sequelize.define(
  "QuickStartCard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    occupationCategory: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "직무 카테고리 (manufacturing, construction, service, etc.)",
    },
    cardOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "카드 순서 (1-5)",
    },
    koreanText: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "한국어 문장",
    },
    vietnameseText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "베트남어 번역",
    },
    chineseText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "중국어 번역",
    },
    englishText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "영어 번역",
    },
    phoneticText: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "발음 표기",
    },
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "TTS 오디오 파일 URL",
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "아이콘 이모지 또는 클래스명",
    },
    situationDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "상황 설명",
    },
    difficulty: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "난이도 (0: 가장 기초)",
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: "사용 횟수 통계",
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "검색용 태그 ['안전', '인사', '지시' 등]",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "quickstart_cards",
    timestamps: true,
    indexes: [
      {
        fields: ["occupationCategory", "cardOrder"],
        unique: true,
      },
    ],
  }
);

export default QuickStartCard;