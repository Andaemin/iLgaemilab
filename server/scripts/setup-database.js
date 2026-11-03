import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.development') });

async function setupDatabase() {
  let connection;
  
  try {
    // 먼저 데이터베이스 없이 연결
    console.log('🔄 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    console.log('✅ Connected to MySQL');
    
    // 데이터베이스 생성
    console.log('🔄 Creating database ilgaemin...');
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ilgaemin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    console.log('✅ Database ilgaemin created or already exists');
    
    // 데이터베이스 사용
    await connection.query('USE ilgaemin');
    
    console.log(`
========================================
✅ Database setup completed successfully!
========================================
Database Name: ilgaemin
Character Set: utf8mb4
Collation: utf8mb4_unicode_ci

You can now run the server with:
  npm run dev
========================================
    `);
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n📌 Please check:');
    console.error('1. MySQL is running');
    console.error('2. Root password is correct in .env.development');
    console.error('3. If you have a password, update DB_PASSWORD in .env.development');
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();