'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: '휴대전화 번호',
    });

    await queryInterface.addColumn('users', 'birthDate', {
      type: Sequelize.DATEONLY,
      allowNull: true,
      comment: '생년월일 (YYYY-MM-DD)',
    });

    await queryInterface.addColumn('users', 'gender', {
      type: Sequelize.ENUM('male', 'female'),
      allowNull: true,
      comment: '성별',
    });

    await queryInterface.addColumn('users', 'avatarUrl', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: '아바타 프리셋 URL 또는 preset:id:emoji',
    });

    await queryInterface.addColumn('users', 'learningGoal', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: '학습 목적 (배열): ["daily_conversation", "business_communication", ...]',
    });

    await queryInterface.addColumn('users', 'profileBorder', {
      type: Sequelize.STRING(50),
      allowNull: true,
      defaultValue: 'default',
      comment: '프로필 테두리 스타일',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'birthDate');
    await queryInterface.removeColumn('users', 'gender');
    await queryInterface.removeColumn('users', 'avatarUrl');
    await queryInterface.removeColumn('users', 'learningGoal');
    await queryInterface.removeColumn('users', 'profileBorder');
  }
};
