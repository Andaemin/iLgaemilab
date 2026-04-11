import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const LearningContent = sequelize.define(
  "LearningContent",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    subcategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    koreanText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phoneticText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    romanization: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    translationEn: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    translationVi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    translationZh: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.TINYINT,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 5,
      },
    },
    audioUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    imageUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    context: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "learning_content",
    timestamps: true,
  }
);

// Instance methods
LearningContent.prototype.incrementUsage = async function () {
  this.usageCount += 1;
  await this.save();
};

export default LearningContent;