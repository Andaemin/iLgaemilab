import { DataTypes } from "sequelize";
import sequelize from "../database/connection.js";

const GamePlayLog = sequelize.define(
  "GamePlayLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true, // 비로그인 사용자도 집계 가능
      comment: "사용자 ID (로그인한 경우)",
    },
    gameType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: "게임 종류 (initial_consonant, word_chain, spelling_quiz, typer, bingo, crossword_puzzle)",
    },
    playedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: "플레이 시작 시간",
    },
    sessionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: "세션 ID (중복 카운트 방지용)",
    },
  },
  {
    tableName: "game_play_logs",
    timestamps: false,
    indexes: [
      {
        fields: ["gameType", "playedAt"],
        name: "idx_game_type_played_at",
      },
      {
        fields: ["playedAt"],
        name: "idx_played_at",
      },
    ],
  }
);

export default GamePlayLog;
