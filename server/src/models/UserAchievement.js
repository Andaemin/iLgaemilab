import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const UserAchievement = sequelize.define(
  "UserAchievement",
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
    achievementId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    earnedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    progressData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "user_achievements",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["userId", "achievementId"],
      },
    ],
  }
);

export default UserAchievement;