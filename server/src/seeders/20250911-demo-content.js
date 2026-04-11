const { QueryInterface, Sequelize } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 학습 콘텐츠 데이터
    await queryInterface.bulkInsert('learning_content', [
      // 건설업 안전
      {
        category_id: 1, subcategory_id: 1, title: '안전모 착용',
        korean_text: '안전모를 써주세요',
        phonetic_text: '안전모를 써주세요',
        romanization: 'anjeommo-reul sseojuseyo',
        translation_en: 'Please wear your safety helmet',
        translation_vi: 'Xin hãy đeo mũ an toàn',
        difficulty: 1,
        context: '건설 현장에서 안전모 착용을 요청할 때',
        tags: JSON.stringify(['안전', '안전모', '요청']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, subcategory_id: 1, title: '위험 경고',
        korean_text: '위험해요! 조심하세요!',
        phonetic_text: '위험해요! 조심하세요!',
        romanization: 'wiheomhaeyo! josimhaseyo!',
        translation_en: 'Dangerous! Be careful!',
        translation_vi: 'Nguy hiểm! Hãy cẩn thận!',
        difficulty: 1,
        context: '위험한 상황을 알릴 때',
        tags: JSON.stringify(['위험', '경고', '조심']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, subcategory_id: 1, title: '안전 규칙',
        korean_text: '안전 규칙을 지켜주세요',
        phonetic_text: '안전 규칙을 지켜주세요',
        romanization: 'anjeon gyuchig-eul jikyeojuseyo',
        translation_en: 'Please follow the safety rules',
        translation_vi: 'Xin hãy tuân thủ các quy tắc an toàn',
        difficulty: 2,
        context: '안전 규칙 준수를 요청할 때',
        tags: JSON.stringify(['안전', '규칙', '준수']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 건설업 작업 지시
      {
        category_id: 1, subcategory_id: 2, title: '시작 지시',
        korean_text: '이제 시작하세요',
        phonetic_text: '이제 시작하세요',
        romanization: 'ije sijakhaseyo',
        translation_en: 'Start now',
        translation_vi: 'Bắt đầu ngay bây giờ',
        difficulty: 1,
        context: '작업 시작을 지시할 때',
        tags: JSON.stringify(['시작', '작업', '지시']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 1, subcategory_id: 2, title: '정지 지시',
        korean_text: '작업을 멈추세요',
        phonetic_text: '작업을 멈추세요',
        romanization: 'jageob-eul meomchuseyo',
        translation_en: 'Stop working',
        translation_vi: 'Dừng công việc lại',
        difficulty: 1,
        context: '작업 중단을 지시할 때',
        tags: JSON.stringify(['정지', '중단', '지시']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 제조업 품질 관리
      {
        category_id: 2, subcategory_id: 5, title: '품질 확인',
        korean_text: '품질을 확인해 주세요',
        phonetic_text: '품질을 확인해 주세요',
        romanization: 'pumjil-eul hwag-inhae juseyo',
        translation_en: 'Please check the quality',
        translation_vi: 'Hãy kiểm tra chất lượng',
        difficulty: 2,
        context: '제품 품질 확인을 요청할 때',
        tags: JSON.stringify(['품질', '확인', '검사']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 2, subcategory_id: 5, title: '불량품 발견',
        korean_text: '불량품이 있어요',
        phonetic_text: '불량품이 있어요',
        romanization: 'bullyangpum-i isseoyo',
        translation_en: 'There are defective products',
        translation_vi: 'Có sản phẩm lỗi',
        difficulty: 2,
        context: '불량품을 발견했을 때',
        tags: JSON.stringify(['불량품', '결함', '발견']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 서비스업 고객 응대
      {
        category_id: 3, subcategory_id: 9, title: '고객 인사',
        korean_text: '어서 오세요',
        phonetic_text: '어서 오세요',
        romanization: 'eoseo oseyo',
        translation_en: 'Welcome',
        translation_vi: 'Chào mừng bạn',
        difficulty: 1,
        context: '고객을 맞이할 때',
        tags: JSON.stringify(['인사', '환영', '고객']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 3, subcategory_id: 9, title: '도움 제안',
        korean_text: '도와드릴까요?',
        phonetic_text: '도와드릴까요?',
        romanization: 'dowadeurilkkayo?',
        translation_en: 'Can I help you?',
        translation_vi: 'Tôi có thể giúp gì cho bạn?',
        difficulty: 1,
        context: '고객에게 도움을 제안할 때',
        tags: JSON.stringify(['도움', '서비스', '제안']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 3, subcategory_id: 9, title: '감사 인사',
        korean_text: '감사합니다',
        phonetic_text: '감사합니다',
        romanization: 'gamsahamnida',
        translation_en: 'Thank you',
        translation_vi: 'Cám ơn bạn',
        difficulty: 1,
        context: '고객에게 감사 인사를 할 때',
        tags: JSON.stringify(['감사', '인사', '예의']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 일상생활 인사
      {
        category_id: 4, subcategory_id: 13, title: '아침 인사',
        korean_text: '안녕하세요',
        phonetic_text: '안녕하세요',
        romanization: 'annyeonghaseyo',
        translation_en: 'Hello',
        translation_vi: 'Xin chào',
        difficulty: 1,
        context: '처음 만나거나 아침에 인사할 때',
        tags: JSON.stringify(['인사', '아침', '만남']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 4, subcategory_id: 13, title: '저녁 인사',
        korean_text: '안녕히 가세요',
        phonetic_text: '안녕히 가세요',
        romanization: 'annyeonghi gaseyo',
        translation_en: 'Goodbye',
        translation_vi: 'Chào tạm biệt',
        difficulty: 1,
        context: '헤어질 때 인사',
        tags: JSON.stringify(['인사', '작별', '저녁']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 일상생활 병원
      {
        category_id: 4, subcategory_id: 16, title: '증상 설명',
        korean_text: '배가 아파요',
        phonetic_text: '배가 아파요',
        romanization: 'baega apayo',
        translation_en: 'My stomach hurts',
        translation_vi: 'Tôi đau bụng',
        difficulty: 1,
        context: '병원에서 증상을 설명할 때',
        tags: JSON.stringify(['증상', '병원', '아픔']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 4, subcategory_id: 16, title: '진료 예약',
        korean_text: '진료 예약하고 싶어요',
        phonetic_text: '진료 예약하고 싶어요',
        romanization: 'jinryo yeyakago sipeoyo',
        translation_en: 'I want to make an appointment',
        translation_vi: 'Tôi muốn đặt lịch khám',
        difficulty: 2,
        context: '병원에서 진료 예약을 할 때',
        tags: JSON.stringify(['예약', '진료', '병원']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },

      // 응급상황 도움 요청
      {
        category_id: 5, subcategory_id: 20, title: '도움 요청',
        korean_text: '도와주세요!',
        phonetic_text: '도와주세요!',
        romanization: 'dowajuseyo!',
        translation_en: 'Help me!',
        translation_vi: 'Xin hãy giúp tôi!',
        difficulty: 1,
        context: '긴급하게 도움이 필요할 때',
        tags: JSON.stringify(['도움', '긴급', '요청']),
        is_featured: true, is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 5, subcategory_id: 20, title: '신고 요청',
        korean_text: '119에 신고해 주세요',
        phonetic_text: '119에 신고해 주세요',
        romanization: '119-e singohae juseyo',
        translation_en: 'Please call 119',
        translation_vi: 'Xin hãy gọi 119',
        difficulty: 2,
        context: '응급상황 신고를 요청할 때',
        tags: JSON.stringify(['신고', '119', '응급']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      },
      {
        category_id: 5, subcategory_id: 18, title: '사고 신고',
        korean_text: '사고가 났어요',
        phonetic_text: '사고가 났어요',
        romanization: 'sagoga nasseoyo',
        translation_en: 'There was an accident',
        translation_vi: 'Có tai nạn xảy ra',
        difficulty: 1,
        context: '사고를 신고할 때',
        tags: JSON.stringify(['사고', '신고', '응급']),
        is_active: true,
        created_at: new Date(), updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('learning_content', null, {});
  }
};