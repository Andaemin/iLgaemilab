import sequelize from './src/database/connection.js';

async function checkSchema() {
  try {
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'ilgaemin' AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📊 users 테이블 스키마:');
    console.table(results);

    process.exit(0);
  } catch (error) {
    console.error('❌ 스키마 조회 실패:', error.message);
    process.exit(1);
  }
}

checkSchema();
