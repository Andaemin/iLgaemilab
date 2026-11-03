'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("game_scores", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        comment: "사용자 ID",
      },
      gameType: {
        type: Sequelize.ENUM(
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
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "게임 점수",
      },
      difficulty: {
        type: Sequelize.ENUM("beginner", "intermediate", "advanced"),
        allowNull: true,
        comment: "난이도 (타자게임, 크로스워드 퍼즐 등)",
      },
      gameMode: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: "게임 모드 (예: 10문제/20문제, 3빙고/5빙고 등)",
      },
      additionalData: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "게임별 추가 데이터 (정답률, 콤보, 생존시간 등)",
      },
      playedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: "게임 플레이 날짜",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 인덱스 추가
    await queryInterface.addIndex("game_scores", ["userId", "gameType"], {
      name: "idx_game_scores_user_game",
    });

    await queryInterface.addIndex("game_scores", ["gameType", "score"], {
      name: "idx_game_scores_game_score",
    });

    await queryInterface.addIndex("game_scores", ["playedAt"], {
      name: "idx_game_scores_played_at",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("game_scores");
  }
};
