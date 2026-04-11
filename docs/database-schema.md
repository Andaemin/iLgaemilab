# 일개미랩 DB 스키마 설계 - `ilgaemi`

> **최종 업데이트**: 2024-09-19 (MVP 테이블 추가)
> **변경사항**: 레벨테스트, 직무 시나리오 관련 5개 테이블 추가, User 테이블 확장

## 🗄️ 데이터베이스 개요
- **DB명**: `ilgaemi`
- **용도**: 이주 노동자 한국어 교육 플랫폼
- **권장 DBMS**: MySQL 8.0+ 또는 PostgreSQL 14+
- **총 테이블 수**: 14개 (기존 9개 + 신규 5개)

## 📋 테이블 구조

### 1. 사용자 관리

#### `users` - 사용자 정보 (확장됨)
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50),           -- 국적 (베트남, 중국, 필리핀 등)
    native_language VARCHAR(20),       -- 모국어 (vi, zh, en 등)
    occupation_category VARCHAR(50),    -- 직업군 (construction, manufacturing, service)
    korean_level ENUM('beginner', 'elementary', 'intermediate', 'advanced') DEFAULT 'beginner',
    current_level INT,                 -- 레벨테스트 결과 (0-4) [NEW]
    level_test_completed BOOLEAN DEFAULT FALSE,  -- 레벨테스트 완료 여부 [NEW]
    level_test_score DECIMAL(5,2),     -- 레벨테스트 점수 [NEW]
    level_test_date TIMESTAMP,         -- 레벨테스트 수행 날짜 [NEW]
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
```

### 2. 학습 콘텐츠

#### `categories` - 학습 카테고리
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,        -- 카테고리명 (건설업, 제조업, 일상생활 등)
    name_ko VARCHAR(100) NOT NULL,     -- 한국어 카테고리명
    name_en VARCHAR(100),              -- 영어 카테고리명
    name_vi VARCHAR(100),              -- 베트남어 카테고리명
    description TEXT,
    icon VARCHAR(50),                  -- 아이콘 클래스명
    color VARCHAR(20),                 -- UI 테마 컬러
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `subcategories` - 세부 카테고리
```sql
CREATE TABLE subcategories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,        -- 세부 카테고리 (안전, 작업지시, 고객응대 등)
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    name_vi VARCHAR(100),
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);
```

#### `learning_content` - 학습 콘텐츠
```sql
CREATE TABLE learning_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    subcategory_id INT,
    title VARCHAR(200) NOT NULL,       -- 콘텐츠 제목
    korean_text TEXT NOT NULL,         -- 한국어 목표 문장
    phonetic_text TEXT,               -- 발음 표기 (한글)
    romanization TEXT,                -- 로마자 표기
    translation_en TEXT,              -- 영어 번역
    translation_vi TEXT,              -- 베트남어 번역
    translation_zh TEXT,              -- 중국어 번역
    difficulty TINYINT DEFAULT 1,     -- 난이도 (1-5)
    audio_url VARCHAR(255),           -- TTS 오디오 파일 URL
    image_url VARCHAR(255),           -- 관련 이미지 URL
    context TEXT,                     -- 사용 상황 설명
    tags JSON,                        -- 검색용 태그 ['안전', '작업', '인사']
    usage_count INT DEFAULT 0,        -- 사용 횟수
    is_featured BOOLEAN DEFAULT FALSE, -- 추천 콘텐츠 여부
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id) ON DELETE SET NULL
);
```

### 3. 학습 기록

#### `user_progress` - 사용자 학습 진도
```sql
CREATE TABLE user_progress (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    best_score INT DEFAULT 0,          -- 최고 점수 (0-100)
    total_attempts INT DEFAULT 0,      -- 총 시도 횟수
    completed_attempts INT DEFAULT 0,  -- 완료 횟수 (80점 이상)
    first_attempt_at TIMESTAMP,       -- 첫 시도 시간
    last_attempt_at TIMESTAMP,        -- 마지막 시도 시간
    is_completed BOOLEAN DEFAULT FALSE, -- 완료 여부 (80점 이상 달성)
    completed_at TIMESTAMP,           -- 완료 시간
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES learning_content(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_content (user_id, content_id)
);
```

#### `learning_sessions` - 개별 학습 세션
```sql
CREATE TABLE learning_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    content_id INT NOT NULL,
    session_id VARCHAR(50) NOT NULL,   -- 세션 식별자
    target_text TEXT NOT NULL,         -- 목표 문장
    recognized_text TEXT,              -- STT 인식 결과
    pronunciation_score INT,           -- 발음 점수 (0-100)
    ai_feedback TEXT,                  -- AI 평가 피드백
    feedback_json JSON,                -- 상세 피드백 (에러, 제안사항 등)
    audio_file_url VARCHAR(255),       -- 사용자 음성 파일
    duration_seconds INT,              -- 학습 소요 시간 (초)
    attempts_count INT DEFAULT 1,      -- 해당 세션 내 시도 횟수
    is_successful BOOLEAN DEFAULT FALSE, -- 성공 여부 (80점 이상)
    device_info JSON,                  -- 디바이스 정보 (브라우저, OS 등)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (content_id) REFERENCES learning_content(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at),
    INDEX idx_content_score (content_id, pronunciation_score)
);
```

### 4. 성취 시스템

#### `achievements` - 성취 정의
```sql
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,        -- 성취명
    name_ko VARCHAR(100) NOT NULL,     -- 한국어 성취명
    name_en VARCHAR(100),              -- 영어 성취명
    description TEXT,                  -- 성취 설명
    description_ko TEXT,               -- 한국어 설명
    icon VARCHAR(50),                  -- 아이콘
    badge_image VARCHAR(255),          -- 뱃지 이미지
    condition_type ENUM('score', 'streak', 'completion', 'category', 'custom') NOT NULL,
    condition_value JSON,              -- 조건 값 {"min_score": 95, "count": 1}
    reward_type ENUM('badge', 'points', 'certificate') DEFAULT 'badge',
    reward_value INT DEFAULT 0,        -- 보상 점수
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### `user_achievements` - 사용자 성취 기록
```sql
CREATE TABLE user_achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress_data JSON,                -- 진행 상황 데이터
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);
```

### 5. 통계 및 분석

#### `daily_stats` - 일별 학습 통계
```sql
CREATE TABLE daily_stats (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    total_sessions INT DEFAULT 0,      -- 총 학습 세션 수
    successful_sessions INT DEFAULT 0,  -- 성공 세션 수 (80점 이상)
    total_duration_seconds INT DEFAULT 0, -- 총 학습 시간 (초)
    average_score DECIMAL(5,2),        -- 평균 점수
    categories_studied JSON,            -- 학습한 카테고리 목록
    new_completions INT DEFAULT 0,     -- 새로 완료한 콘텐츠 수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, date)
);
```

### 6. 관리자 기능

#### `admin_users` - 관리자 계정
```sql
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'content_manager', 'data_analyst') DEFAULT 'content_manager',
    permissions JSON,                  -- 세부 권한 설정
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 📊 초기 데이터 세팅

### 카테고리 데이터
```sql
INSERT INTO categories (name, name_ko, name_en, name_vi, icon, color, sort_order) VALUES
('construction', '건설업', 'Construction', 'Xây dựng', 'mdi-hammer', '#FF5722', 1),
('manufacturing', '제조업', 'Manufacturing', 'Sản xuất', 'mdi-factory', '#2196F3', 2),
('service', '서비스업', 'Service', 'Dịch vụ', 'mdi-account-group', '#4CAF50', 3),
('daily_life', '일상생활', 'Daily Life', 'Cuộc sống hàng ngày', 'mdi-home', '#9C27B0', 4),
('emergency', '응급상황', 'Emergency', 'Khẩn cấp', 'mdi-alert', '#F44336', 5);
```

### 세부 카테고리 데이터
```sql
INSERT INTO subcategories (category_id, name, name_ko, name_en, name_vi, sort_order) VALUES
(1, 'safety', '안전', 'Safety', 'An toàn', 1),
(1, 'work_instruction', '작업 지시', 'Work Instruction', 'Hướng dẫn công việc', 2),
(1, 'tools', '도구', 'Tools', 'Công cụ', 3),
(2, 'quality_control', '품질 관리', 'Quality Control', 'Kiểm soát chất lượng', 1),
(2, 'machine_operation', '기계 조작', 'Machine Operation', 'Vận hành máy móc', 2),
(3, 'customer_service', '고객 응대', 'Customer Service', 'Phục vụ khách hàng', 1),
(3, 'order_taking', '주문 받기', 'Order Taking', 'Nhận đơn hàng', 2);
```

### 기본 성취 데이터
```sql
INSERT INTO achievements (name, name_ko, name_en, description_ko, condition_type, condition_value, icon) VALUES
('first_perfect', '첫 완벽한 발음', 'First Perfect', '첫 번째 95점 이상 달성', 'score', '{"min_score": 95, "count": 1}', 'mdi-star'),
('daily_learner', '매일 학습자', 'Daily Learner', '7일 연속 학습', 'streak', '{"consecutive_days": 7}', 'mdi-calendar-check'),
('construction_master', '건설업 마스터', 'Construction Master', '건설업 카테고리 80% 완료', 'category', '{"category": "construction", "completion_rate": 0.8}', 'mdi-hammer');
```

### 7. MVP 신규 테이블

#### `level_tests` - 레벨테스트 문제 [NEW]
```sql
CREATE TABLE level_tests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_type ENUM('listening', 'reading', 'short_answer', 'speaking') NOT NULL,
    question_number INT NOT NULL,      -- 문제 번호 (1-10)
    difficulty INT DEFAULT 1,           -- 난이도 (0-4)
    question_text TEXT NOT NULL,        -- 문제 내용
    question_text_vi TEXT,              -- 베트남어 설명
    audio_url VARCHAR(255),             -- 듣기 문제 오디오
    choices JSON,                       -- 객관식 선택지
    correct_answer VARCHAR(255),        -- 정답
    acceptable_answers JSON,            -- 허용 답변들
    scoring_criteria JSON,              -- 채점 기준
    max_score INT DEFAULT 1,            -- 배점
    explanation TEXT,                   -- 정답 설명
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_question (question_type, question_number)
);
```

#### `level_test_results` - 레벨테스트 결과 [NEW]
```sql
CREATE TABLE level_test_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    test_session_id VARCHAR(50) NOT NULL, -- 테스트 세션 ID
    question_id INT NOT NULL,
    user_answer TEXT,                   -- 사용자 답변
    user_audio_url VARCHAR(255),        -- 말하기 녹음 파일
    stt_result TEXT,                    -- STT 인식 결과
    score DECIMAL(3,1) DEFAULT 0,       -- 획득 점수
    feedback JSON,                      -- GPT 피드백
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INT,                     -- 답변 소요 시간(초)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES level_tests(id),
    INDEX idx_user_session (user_id, test_session_id)
);
```

#### `job_scenarios` - 직무별 시나리오 [NEW]
```sql
CREATE TABLE job_scenarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    occupation_category VARCHAR(50) NOT NULL,
    scenario_title VARCHAR(200) NOT NULL,
    scenario_title_vi VARCHAR(200),     -- 베트남어 제목
    situation TEXT NOT NULL,            -- 상황 설명
    situation_vi TEXT,                  -- 베트남어 설명
    objective TEXT NOT NULL,            -- 학습 목표
    difficulty INT DEFAULT 1,           -- 난이도 (0-4)
    estimated_time INT DEFAULT 5,       -- 예상 소요시간(분)
    keywords JSON,                      -- 핵심 단어/표현
    tags JSON,                          -- 검색 태그
    image_url VARCHAR(255),
    usage_count INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_occupation_difficulty (occupation_category, difficulty)
);
```

#### `scenario_dialogues` - 시나리오 대화 [NEW]
```sql
CREATE TABLE scenario_dialogues (
    id INT PRIMARY KEY AUTO_INCREMENT,
    scenario_id INT NOT NULL,
    turn_number INT NOT NULL,           -- 대화 턴 번호
    speaker ENUM('system', 'user') NOT NULL,
    korean_text TEXT NOT NULL,          -- 한국어 대사
    expected_response TEXT,              -- 예상 응답
    alternative_responses JSON,         -- 대체 가능 응답
    vietnamese_hint TEXT,                -- 베트남어 힌트
    audio_url VARCHAR(255),             -- TTS 오디오
    feedback_template JSON,              -- 피드백 템플릿
    key_points JSON,                    -- 핵심 체크포인트
    next_turn_condition JSON,           -- 다음 턴 진행 조건
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (scenario_id) REFERENCES job_scenarios(id) ON DELETE CASCADE,
    UNIQUE KEY unique_turn (scenario_id, turn_number)
);
```

#### `quickstart_cards` - Quick Start 카드 (참고용, 실제는 JSON) [DEPRECATED]
```sql
-- 실제로는 client/src/data/quickStartCards.json 파일로 관리
-- 빠른 로딩과 간단한 구조를 위해 로컬 JSON 사용
-- DB 테이블은 향후 확장 시 사용 가능
```

## 🔧 인덱스 최적화

```sql
-- 성능 최적화를 위한 추가 인덱스
CREATE INDEX idx_learning_content_category_difficulty ON learning_content(category_id, difficulty, is_active);
CREATE INDEX idx_learning_sessions_user_date ON learning_sessions(user_id, created_at DESC);
CREATE INDEX idx_user_progress_completion ON user_progress(user_id, is_completed, best_score DESC);
CREATE INDEX idx_content_usage ON learning_content(usage_count DESC, is_featured DESC);

-- MVP 신규 인덱스
CREATE INDEX idx_level_test_type ON level_tests(question_type, question_number);
CREATE INDEX idx_test_results_user ON level_test_results(user_id, created_at DESC);
CREATE INDEX idx_scenarios_occupation ON job_scenarios(occupation_category, is_active);
```

## 🔒 데이터 보안

```sql
-- 사용자 데이터 암호화 (필요시)
-- password_hash: bcrypt 해시 사용
-- 개인정보는 별도 암호화 고려

-- 데이터 보존 정책
-- learning_sessions: 1년 보관 후 익명화
-- 음성 파일: 30일 후 자동 삭제
```

이 스키마는 이주 노동자 한국어 교육에 최적화되어 있으며, 확장 가능한 구조로 설계되었습니다.