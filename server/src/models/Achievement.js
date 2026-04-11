import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const Achievement = sequelize.define(
  "Achievement",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    nameKo: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nameEn: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descriptionKo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    badgeImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    conditionType: {
      type: DataTypes.ENUM("score", "streak", "completion", "category", "custom"),
      allowNull: false,
    },
    conditionValue: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rewardType: {
      type: DataTypes.ENUM("badge", "points", "certificate"),
      defaultValue: "badge",
    },
    rewardValue: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "achievements",
    timestamps: true,
    updatedAt: false,
  }
);

export default Achievement;