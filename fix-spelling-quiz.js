const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, 'client', 'public', 'data', 'spellingQuiz.json');
const originalData = fs.readFileSync(jsonPath, 'utf-8');
const data = JSON.parse(originalData);

console.log('수정 전 문제 수:', data.quizzes.length);

// 백업 생성 (수정 전)
const backupPath = path.join(__dirname, 'client', 'public', 'data', 'spellingQuiz.backup.json');
if (!fs.existsSync(backupPath)) {
  fs.writeFileSync(backupPath, originalData);
  console.log(`백업 파일 생성: ${backupPath}\n`);
} else {
  console.log(`백업 파일이 이미 존재합니다: ${backupPath}\n`);
}

// 1. ID 27 삭제 (중복)
console.log('1. 중복 문제 삭제 (ID 27)');
const beforeDelete = data.quizzes.length;
data.quizzes = data.quizzes.filter(q => q.id !== 27);
console.log(`   삭제된 문제: ${beforeDelete - data.quizzes.length}개`);

// 2. options와 highlightWord 순서 통일
console.log('\n2. options와 highlightWord 순서 통일');
let fixedCount = 0;
data.quizzes.forEach(quiz => {
  const before = JSON.stringify(quiz.highlightWord);
  quiz.highlightWord = [...quiz.options];
  if (before !== JSON.stringify(quiz.highlightWord)) {
    fixedCount++;
  }
});
console.log(`   수정된 문제: ${fixedCount}개`);

// 3. ID 재정렬
console.log('\n3. ID 재정렬');
data.quizzes.sort((a, b) => a.id - b.id);
data.quizzes.forEach((quiz, index) => {
  quiz.id = index + 1;
});

console.log('\n수정 후 문제 수:', data.quizzes.length);

// 수정된 데이터 저장
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log(`\n수정된 파일 저장: ${jsonPath}`);
console.log('✅ 수정 완료!');
