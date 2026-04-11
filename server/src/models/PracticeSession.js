import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const PracticeSession = sequelize.define("PracticeSession", {
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
  scenarioId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "speaking_scenarios",
      key: "id",
    },
  },
  sessionId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    unique: true,
  },
  startTime: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  dialoguesCompleted: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  scores: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  feedback: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  averageScore: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress',
  },
  totalAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: "practice_sessions",
});

export default PracticeSession;