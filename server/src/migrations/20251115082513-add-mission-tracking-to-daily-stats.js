'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('daily_stats', 'lessonsCompleted', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: '완료한 레슨 수',
    });

    await queryInterface.addColumn('daily_stats', 'wordsLearned', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: '학습한 단어 수',
    });

    await queryInterface.addColumn('daily_stats', 'speakingMinutes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: '말하기 연습 시간 (분)',
    });

    await queryInterface.addColumn('daily_stats', 'quizzesCompleted', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: '완료한 퀴즈 수',
    });

    await queryInterface.addColumn('daily_stats', 'activeLearningMinutes', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      comment: '실제 학습 활동 시간 (분)',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('daily_stats', 'lessonsCompleted');
    await queryInterface.removeColumn('daily_stats', 'wordsLearned');
    await queryInterface.removeColumn('daily_stats', 'speakingMinutes');
    await queryInterface.removeColumn('daily_stats', 'quizzesCompleted');
    await queryInterface.removeColumn('daily_stats', 'activeLearningMinutes');
  }
};
