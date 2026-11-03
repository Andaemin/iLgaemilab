-- 일개미랩 데이터베이스 생성 스크립트
-- 이 파일을 MySQL에서 실행하세요:
-- mysql -u root -p < scripts/create-database.sql

CREATE DATABASE IF NOT EXISTS ilgaemin 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE ilgaemin;

-- 데이터베이스 생성 확인
SELECT 'Database ilgaemin created successfully!' AS message;