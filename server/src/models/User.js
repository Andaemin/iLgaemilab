import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";
import bcrypt from "bcrypt";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    nativeLanguage: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    occupationCategory: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "construction, manufacturing, service, etc.",
    },
    koreanLevel: {
      type: DataTypes.ENUM("beginner", "elementary", "intermediate", "advanced"),
      defaultValue: "beginner",
    },
    currentLevel: {
      type: DataTypes.INTEGER,
      defaultValue: null,
      allowNull: true,
      comment: "현재 레벨 (0-4), 레벨테스트 후 설정",
    },
    levelTestCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "레벨테스트 완료 여부",
    },
    levelTestScore: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: "레벨테스트 총점",
    },
    levelTestDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "레벨테스트 수행 날짜",
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    
    // ========== 🆕 프로필 관련 필드 추가 ==========
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: "휴대전화 번호",
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: "생년월일 (YYYY-MM-DD)",
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
      comment: "성별",
    },
    avatarUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "아바타 프리셋 URL 또는 preset:id:emoji",
    },
    learningGoal: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "학습 목적 (배열): ['daily_conversation', 'business_communication', ...]",
    },
    profileBorder: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: 'default',
      comment: "프로필 테두리 스타일",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Instance methods
User.prototype.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save();
};

User.prototype.toSafeObject = function () {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

export default User;