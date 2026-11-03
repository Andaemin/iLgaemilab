import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const GameScore = sequelize.define(
  "GameScore",
  {
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
      onDelete: "CASCADE",
      comment: "사용자 ID",
    },
    gameType: {
      type: DataTypes.ENUM(
        "initial_consonant",  // 초성게임
        "spelling_quiz",      // 맞춤법 퀴즈
        "typer_game",         // 한글 타자 게임
        "crossword_puzzle",   // 크로스워드 퍼즐
        "word_chain",         // 끝말잇기
        "bingo_game"          // 빙고 게임
      ),
      allowNull: false,
      comment: "게임 종류",
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: "게임 점수",
    },
    difficulty: {
      type: DataTypes.ENUM("beginner", "intermediate", "advanced"),
      allowNull: true,
      comment: "난이도 (타자게임, 크로스워드 퍼즐 등)",
    },
    gameMode: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: "게임 모드 (예: 10문제/20문제, 3빙고/5빙고 등)",
    },
    additionalData: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "게임별 추가 데이터 (정답률, 콤보, 생존시간 등)",
      /*
        초성게임 예시: { accuracy: 80, maxCombo: 10, correctCount: 8, totalQuestions: 10 }
        타자게임 예시: { survivalTime: 120, maxCombo: 15, difficulty: 'intermediate' }
        맞춤법 퀴즈 예시: { accuracy: 90, correctCount: 18, totalQuestions: 20, mode: '20questions' }
        크로스워드: { completionTime: 180, hintsUsed: 2, theme: 'proverb' }
      */
    },
    playedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "게임 플레이 날짜",
    },
  },
  {
    tableName: "game_scores",
    timestamps: true,
    indexes: [
      {
        name: "idx_game_scores_user_game",
        fields: ["userId", "gameType"],
      },
      {
        name: "idx_game_scores_game_score",
        fields: ["gameType", "score"],
      },
      {
        name: "idx_game_scores_played_at",
        fields: ["playedAt"],
      },
    ],
  }
);

export default GameScore;
