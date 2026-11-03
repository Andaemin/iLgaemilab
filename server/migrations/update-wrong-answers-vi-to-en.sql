-- 오답 노트 테이블의 베트남어 필드를 영어 필드로 변경
-- 실행 날짜: 2025-12-09

-- 1. questionVi 컬럼을 questionEn으로 변경
ALTER TABLE wrong_answers
CHANGE COLUMN questionVi questionEn TEXT
COMMENT '문제 내용 (영어)';

-- 2. explanationVi 컬럼을 explanationEn으로 변경
ALTER TABLE wrong_answers
CHANGE COLUMN explanationVi explanationEn TEXT
COMMENT '해설 (영어)';

-- 확인
DESCRIBE wrong_answers;
