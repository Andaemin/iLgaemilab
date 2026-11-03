-- MySQL 인덱스 중복 문제 해결 스크립트
-- MySQL Workbench 또는 phpMyAdmin에서 실행하세요

USE ilgaemin;

-- 1. users 테이블의 현재 인덱스 확인
SHOW INDEX FROM users;

-- 2. users 테이블 백업 (옵션)
-- CREATE TABLE users_backup AS SELECT * FROM users;

-- 3. users 테이블 드롭 후 재생성 (가장 확실한 방법)
DROP TABLE IF EXISTS users;

-- 4. 서버 재시작하면 Sequelize가 자동으로 테이블 생성
-- 또는 아래 SQL로 수동 생성:

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `nationality` varchar(50) DEFAULT NULL,
  `nativeLanguage` varchar(20) DEFAULT NULL,
  `occupationCategory` varchar(50) DEFAULT NULL COMMENT 'construction, manufacturing, service, etc.',
  `koreanLevel` enum('beginner','elementary','intermediate','advanced') DEFAULT 'beginner',
  `currentLevel` int DEFAULT NULL COMMENT '현재 레벨 (0-4), 레벨테스트 후 설정',
  `levelTestCompleted` tinyint(1) DEFAULT '0' COMMENT '레벨테스트 완료 여부',
  `levelTestScore` decimal(5,2) DEFAULT NULL COMMENT '레벨테스트 총점',
  `levelTestDate` datetime DEFAULT NULL COMMENT '레벨테스트 수행 날짜',
  `profileImage` varchar(255) DEFAULT NULL,
  `lastLogin` datetime DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `phone` varchar(20) DEFAULT NULL COMMENT '휴대전화 번호',
  `birthDate` date DEFAULT NULL COMMENT '생년월일 (YYYY-MM-DD)',
  `gender` enum('male','female') DEFAULT NULL COMMENT '성별',
  `avatarUrl` varchar(255) DEFAULT NULL COMMENT '아바타 프리셋 URL 또는 preset:id:emoji',
  `learningGoal` json DEFAULT NULL COMMENT '학습 목적 (배열)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 완료 메시지
SELECT 'users 테이블이 재생성되었습니다!' AS status;
