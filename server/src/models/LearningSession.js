import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const LearningSession = sequelize.define(
  "LearningSession",
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
    contentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sessionId: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    targetText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    recognizedText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    pronunciationScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100,
      },
    },
    aiFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedbackJson: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    audioFileUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    durationSeconds: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    attemptsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isSuccessful: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "learning_sessions",
    timestamps: true,
    updatedAt: false,
    indexes: [
      {
        fields: ["userId", "createdAt"],
      },
      {
        fields: ["contentId", "pronunciationScore"],
      },
    ],
  }
);

export default LearningSession;