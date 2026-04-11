import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const SpeakingScenario = sequelize.define("SpeakingScenario", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.ENUM('construction', 'manufacturing', 'service', 'daily', 'emergency'),
    allowNull: false,
  },
  scenarioId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  titleKo: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  titleVi: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  difficulty: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
  },
  dialogues: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  pronunciationFocus: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  tableName: "speaking_scenarios",
});

export default SpeakingScenario;