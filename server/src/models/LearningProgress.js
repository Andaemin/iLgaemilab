import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const LearningProgress = sequelize.define('LearningProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    targetMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    completedMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    tasks: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    lessonsCompleted: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    wordsLearned: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    pronunciationScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    quizScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    totalTaskCompletions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'learning_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'date']
      }
    ]
  });

export default LearningProgress;