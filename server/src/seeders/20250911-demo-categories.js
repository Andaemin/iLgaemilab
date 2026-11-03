const { QueryInterface, Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 카테고리 데이터
    await queryInterface.bulkInsert('categories', [
      {
        name: 'construction',
        name_ko: '건설업',
        name_en: 'Construction',
        name_vi: 'Xây dựng',
        description: '건설 현장에서 사용하는 한국어',
        icon: 'mdi-hammer',
        color: '#FF5722',
        sort_order: 1,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'manufacturing',
        name_ko: '제조업',
        name_en: 'Manufacturing',
        name_vi: 'Sản xuất',
        description: '공장에서 사용하는 한국어',
        icon: 'mdi-factory',
        color: '#2196F3',
        sort_order: 2,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'service',
        name_ko: '서비스업',
        name_en: 'Service',
        name_vi: 'Dịch vụ',
        description: '서비스업에서 사용하는 한국어',
        icon: 'mdi-account-group',
        color: '#4CAF50',
        sort_order: 3,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'daily_life',
        name_ko: '일상생활',
        name_en: 'Daily Life',
        name_vi: 'Cuộc sống hàng ngày',
        description: '일상생활에서 사용하는 한국어',
        icon: 'mdi-home',
        color: '#9C27B0',
        sort_order: 4,
        is_active: true,
        created_at: new Date()
      },
      {
        name: 'emergency',
        name_ko: '응급상황',
        name_en: 'Emergency',
        name_vi: 'Khẩn cấp',
        description: '응급상황에서 사용하는 한국어',
        icon: 'mdi-alert',
        color: '#F44336',
        sort_order: 5,
        is_active: true,
        created_at: new Date()
      }
    ]);

    // 세부 카테고리 데이터
    await queryInterface.bulkInsert('subcategories', [
      // 건설업
      { category_id: 1, name: 'safety', name_ko: '안전', name_en: 'Safety', name_vi: 'An toàn', sort_order: 1, is_active: true, created_at: new Date() },
      { category_id: 1, name: 'work_instruction', name_ko: '작업 지시', name_en: 'Work Instruction', name_vi: 'Hướng dẫn công việc', sort_order: 2, is_active: true, created_at: new Date() },
      { category_id: 1, name: 'tools', name_ko: '도구', name_en: 'Tools', name_vi: 'Công cụ', sort_order: 3, is_active: true, created_at: new Date() },
      { category_id: 1, name: 'materials', name_ko: '자재', name_en: 'Materials', name_vi: 'Vật liệu', sort_order: 4, is_active: true, created_at: new Date() },

      // 제조업
      { category_id: 2, name: 'quality_control', name_ko: '품질 관리', name_en: 'Quality Control', name_vi: 'Kiểm soát chất lượng', sort_order: 1, is_active: true, created_at: new Date() },
      { category_id: 2, name: 'machine_operation', name_ko: '기계 조작', name_en: 'Machine Operation', name_vi: 'Vận hành máy móc', sort_order: 2, is_active: true, created_at: new Date() },
      { category_id: 2, name: 'production_line', name_ko: '생산라인', name_en: 'Production Line', name_vi: 'Dây chuyền sản xuất', sort_order: 3, is_active: true, created_at: new Date() },
      { category_id: 2, name: 'inspection', name_ko: '검사', name_en: 'Inspection', name_vi: 'Kiểm tra', sort_order: 4, is_active: true, created_at: new Date() },

      // 서비스업
      { category_id: 3, name: 'customer_service', name_ko: '고객 응대', name_en: 'Customer Service', name_vi: 'Phục vụ khách hàng', sort_order: 1, is_active: true, created_at: new Date() },
      { category_id: 3, name: 'order_taking', name_ko: '주문 받기', name_en: 'Order Taking', name_vi: 'Nhận đơn hàng', sort_order: 2, is_active: true, created_at: new Date() },
      { category_id: 3, name: 'payment', name_ko: '결제', name_en: 'Payment', name_vi: 'Thanh toán', sort_order: 3, is_active: true, created_at: new Date() },
      { category_id: 3, name: 'cleaning', name_ko: '청소', name_en: 'Cleaning', name_vi: 'Vệ sinh', sort_order: 4, is_active: true, created_at: new Date() },

      // 일상생활
      { category_id: 4, name: 'greetings', name_ko: '인사', name_en: 'Greetings', name_vi: 'Chào hỏi', sort_order: 1, is_active: true, created_at: new Date() },
      { category_id: 4, name: 'shopping', name_ko: '쇼핑', name_en: 'Shopping', name_vi: 'Mua sắm', sort_order: 2, is_active: true, created_at: new Date() },
      { category_id: 4, name: 'transportation', name_ko: '교통', name_en: 'Transportation', name_vi: 'Giao thông', sort_order: 3, is_active: true, created_at: new Date() },
      { category_id: 4, name: 'hospital', name_ko: '병원', name_en: 'Hospital', name_vi: 'Bệnh viện', sort_order: 4, is_active: true, created_at: new Date() },
      { category_id: 4, name: 'bank', name_ko: '은행', name_en: 'Bank', name_vi: 'Ngân hàng', sort_order: 5, is_active: true, created_at: new Date() },

      // 응급상황
      { category_id: 5, name: 'accident', name_ko: '사고', name_en: 'Accident', name_vi: 'Tai nạn', sort_order: 1, is_active: true, created_at: new Date() },
      { category_id: 5, name: 'medical', name_ko: '의료', name_en: 'Medical', name_vi: 'Y tế', sort_order: 2, is_active: true, created_at: new Date() },
      { category_id: 5, name: 'help', name_ko: '도움 요청', name_en: 'Help Request', name_vi: 'Yêu cầu giúp đỡ', sort_order: 3, is_active: true, created_at: new Date() }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('subcategories', null, {});
    await queryInterface.bulkDelete('categories', null, {});
  }
};