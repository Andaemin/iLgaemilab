import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const SpeakingHistory = sequelize.define("SpeakingHistory", {
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
  sessionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "practice_sessions",
      key: "id",
    },
  },
  dialogueIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  originalText: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userTranscript: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pronunciationScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  wordScores: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  phoneScores: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  audioUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  attemptNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  timestamps: true,
  tableName: "speaking_history",
});

export default SpeakingHistory;