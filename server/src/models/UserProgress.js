import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const UserProgress = sequelize.define(
  "UserProgress",
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
    bestScore: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    totalAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completedAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    firstAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastAttemptAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "user_progress",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "contentId"],
      },
    ],
  }
);

// Instance methods
UserProgress.prototype.updateProgress = async function (score, isSuccessful) {
  const now = new Date();

  if (!this.firstAttemptAt) {
    this.firstAttemptAt = now;
  }

  if (score > this.bestScore) {
    this.bestScore = score;
  }

  this.totalAttempts += 1;

  if (isSuccessful) {
    this.completedAttempts += 1;
  }

  const wasCompleted = this.isCompleted;
  this.isCompleted = this.bestScore >= 80;

  if (!wasCompleted && this.isCompleted) {
    this.completedAt = now;
  }

  this.lastAttemptAt = now;

  await this.save();
};

export default UserProgress;