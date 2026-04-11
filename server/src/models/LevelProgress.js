import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const LevelProgress = sequelize.define('LevelProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  category: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 5,
    },
  },
  isCompleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  quizScore: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  timeSpent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Time spent in seconds',
  },
  lastAccessedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'level_progress',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'category', 'level'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['category'],
    },
  ],
});

export default LevelProgress;