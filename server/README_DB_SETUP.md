# 데이터베이스 설정 가이드

## 🗄️ MySQL 데이터베이스 설정

### 1. MySQL root 비밀번호 확인
MySQL을 설치할 때 설정한 root 비밀번호가 필요합니다.

### 2. `.env.development` 파일 수정
```bash
# server/.env.development 파일에서 DB_PASSWORD를 본인의 MySQL root 비밀번호로 수정
DB_PASSWORD=여기에_비밀번호_입력
```

### 3. 데이터베이스 생성 (3가지 방법 중 택 1)

#### 방법 1: 자동 스크립트 사용 (추천)
```bash
# .env.development에 비밀번호 설정 후
cd server
npm run setup:db
```

#### 방법 2: MySQL 직접 접속
```bash
# MySQL 접속
mysql -u root -p

# 비밀번호 입력 후 다음 명령 실행
CREATE DATABASE IF NOT EXISTS ilgaemin CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

#### 방법 3: SQL 파일 실행
```bash
cd server
mysql -u root -p < scripts/create-database.sql
```

### 4. 서버 실행
```bash
npm run dev
```

## 🚨 문제 해결

### "Access denied for user 'root'@'localhost'" 에러가 발생하는 경우:

1. **MySQL root 비밀번호 확인**
   - MySQL 설치 시 설정한 비밀번호를 기억해야 합니다
   - 비밀번호를 모르는 경우 MySQL 비밀번호 재설정이 필요합니다

2. **비밀번호 없이 접속 시도**
   ```bash
   mysql -u root
   ```
   - 성공하면 비밀번호가 없는 것입니다
   - `.env.development`에서 `DB_PASSWORD=` 를 비워두세요

3. **비밀번호 재설정 (Mac)**
   ```bash
   # MySQL 서버 중지
   sudo mysql.server stop
   
   # 안전 모드로 시작
   sudo mysqld_safe --skip-grant-tables
   
   # 새 터미널에서
   mysql -u root
   
   # MySQL 내에서
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY '새비밀번호';
   exit;
   
   # MySQL 재시작
   sudo mysql.server restart
   ```

## 📝 테이블 구조
서버를 실행하면 Sequelize가 자동으로 다음 테이블들을 생성합니다:

- users (사용자)
- categories (카테고리)
- subcategories (세부 카테고리)
- learning_content (학습 콘텐츠)
- user_progress (사용자 진도)
- learning_sessions (학습 세션)
- achievements (성취)
- user_achievements (사용자 성취)
- daily_stats (일별 통계)