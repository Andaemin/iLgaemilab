const { QueryInterface, Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 성취 데이터
    await queryInterface.bulkInsert('achievements', [
      {
        name: 'first_perfect',
        name_ko: '첫 완벽한 발음',
        name_en: 'First Perfect',
        description: 'Achieve 95+ score for the first time',
        description_ko: '첫 번째 95점 이상 달성',
        icon: 'mdi-star',
        condition_type: 'score',
        condition_value: JSON.stringify({ min_score: 95, count: 1 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'daily_learner',
        name_ko: '매일 학습자',
        name_en: 'Daily Learner',
        description: 'Study for 7 consecutive days',
        description_ko: '7일 연속 학습 완료',
        icon: 'mdi-calendar-check',
        condition_type: 'streak',
        condition_value: JSON.stringify({ consecutive_days: 7 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'construction_master',
        name_ko: '건설업 마스터',
        name_en: 'Construction Master',
        description: 'Complete 80% of construction category',
        description_ko: '건설업 카테고리 80% 완료',
        icon: 'mdi-hammer',
        condition_type: 'category',
        condition_value: JSON.stringify({ category: 'construction', completion_rate: 0.8 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'manufacturing_master',
        name_ko: '제조업 마스터',
        name_en: 'Manufacturing Master',
        description: 'Complete 80% of manufacturing category',
        description_ko: '제조업 카테고리 80% 완료',
        icon: 'mdi-factory',
        condition_type: 'category',
        condition_value: JSON.stringify({ category: 'manufacturing', completion_rate: 0.8 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'service_master',
        name_ko: '서비스업 마스터',
        name_en: 'Service Master',
        description: 'Complete 80% of service category',
        description_ko: '서비스업 카테고리 80% 완료',
        icon: 'mdi-account-group',
        condition_type: 'category',
        condition_value: JSON.stringify({ category: 'service', completion_rate: 0.8 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'beginner_graduate',
        name_ko: '초급자 졸업',
        name_en: 'Beginner Graduate',
        description: 'Complete 50 lessons',
        description_ko: '50개 레슨 완료',
        icon: 'mdi-school',
        condition_type: 'completion',
        condition_value: JSON.stringify({ total_completions: 50 }),
        reward_type: 'certificate',
        reward_value: 100,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'pronunciation_expert',
        name_ko: '발음 전문가',
        name_en: 'Pronunciation Expert',
        description: 'Achieve 90+ average score in 20 sessions',
        description_ko: '20회 세션에서 90점 이상 평균 달성',
        icon: 'mdi-microphone',
        condition_type: 'custom',
        condition_value: JSON.stringify({ min_average: 90, min_sessions: 20 }),
        reward_type: 'badge',
        reward_value: 50,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'emergency_ready',
        name_ko: '응급상황 대비',
        name_en: 'Emergency Ready',
        description: 'Complete emergency category',
        description_ko: '응급상황 카테고리 완료',
        icon: 'mdi-alert-circle',
        condition_type: 'category',
        condition_value: JSON.stringify({ category: 'emergency', completion_rate: 1.0 }),
        reward_type: 'badge',
        reward_value: 0,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'week_warrior',
        name_ko: '일주일 전사',
        name_en: 'Week Warrior',
        description: 'Study every day for a week',
        description_ko: '일주일 동안 매일 학습',
        icon: 'mdi-trophy',
        condition_type: 'streak',
        condition_value: JSON.stringify({ consecutive_days: 7 }),
        reward_type: 'badge',
        reward_value: 25,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'month_champion',
        name_ko: '한달 챔피언',
        name_en: 'Month Champion',
        description: 'Study every day for a month',
        description_ko: '한달 동안 매일 학습',
        icon: 'mdi-crown',
        condition_type: 'streak',
        condition_value: JSON.stringify({ consecutive_days: 30 }),
        reward_type: 'certificate',
        reward_value: 200,
        is_active: true,
        created_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('achievements', null, {});
  }
};