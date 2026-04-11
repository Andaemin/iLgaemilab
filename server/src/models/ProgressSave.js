import { DataTypes } from 'sequelize';
import sequelize from '../database/connection.js';

const ProgressSave = sequelize.define('ProgressSave', {
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
    comment: '0 = final test, 1-5 = regular levels',
  },
  type: {
    type: DataTypes.ENUM('lesson', 'test'),
    allowNull: false,
    comment: 'lesson = regular learning, test = final test',
  },
  currentPage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Current page/question index',
  },
  totalPages: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Total pages/questions',
  },
  savedData: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional saved state (quiz answers, etc.)',
  },
  lastSavedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'progress_saves',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'category', 'level', 'type'],
    },
    {
      fields: ['userId'],
    },
  ],
});

export default ProgressSave;
