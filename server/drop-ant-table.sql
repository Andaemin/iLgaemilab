-- 개미 키우기 테이블 삭제 스크립트
-- 이 스크립트를 실행하여 ant_growth 테이블을 데이터베이스에서 제거하세요

DROP TABLE IF EXISTS `ant_growth`;

-- 실행 후 확인
SELECT TABLE_NAME
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'ant_growth';
