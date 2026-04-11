import sequelize from './src/database/connection.js';

async function addColumnIfNotExists(columnName, columnDef) {
  try {
    await sequelize.query(`ALTER TABLE users ADD COLUMN ${columnName} ${columnDef}`);
    console.log(`✅ ${columnName} 컬럼 추가 완료`);
  } catch (error) {
    if (error.original?.code === 'ER_DUP_FIELDNAME') {
      console.log(`⚠️  ${columnName} 컬럼이 이미 존재합니다`);
    } else {
      throw error;
    }
  }
}

async function migrateUsers() {
  try {
    console.log('🔧 데이터베이스 마이그레이션 시작...');

    await addColumnIfNotExists('phone', "VARCHAR(20) NULL COMMENT '휴대전화 번호'");
    await addColumnIfNotExists('birthDate', "DATE NULL COMMENT '생년월일 (YYYY-MM-DD)'");
    await addColumnIfNotExists('gender', "ENUM('male', 'female') NULL COMMENT '성별'");
    await addColumnIfNotExists('avatarUrl', "VARCHAR(255) NULL COMMENT '아바타 프리셋 URL'");
    await addColumnIfNotExists('learningGoal', "JSON NULL COMMENT '학습 목적'");

    console.log('🎉 모든 마이그레이션 완료!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error.message);
    process.exit(1);
  }
}

migrateUsers();
