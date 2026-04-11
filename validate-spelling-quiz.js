const fs = require('fs');
const path = require('path');

// JSON 파일 읽기
const jsonPath = path.join(__dirname, 'client', 'public', 'data', 'spellingQuiz.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const issues = [];
const warnings = [];

// 1. 중복 문제 검사
const questionMap = new Map();
const optionCombos = new Map();

data.quizzes.forEach((quiz, index) => {
  // 질문 중복 검사
  const normalizedQuestion = quiz.question.replace(/\s+/g, ' ').trim();
  if (questionMap.has(normalizedQuestion)) {
    const duplicateIds = questionMap.get(normalizedQuestion);
    duplicateIds.push(quiz.id);
    questionMap.set(normalizedQuestion, duplicateIds);
  } else {
    questionMap.set(normalizedQuestion, [quiz.id]);
  }

  // 선택지 조합 중복 검사
  const optionKey = [...quiz.options].sort().join('|');
  if (optionCombos.has(optionKey)) {
    const existing = optionCombos.get(optionKey);
    warnings.push({
      type: 'SIMILAR_OPTIONS',
      message: `ID ${quiz.id}와 ID ${existing.id}의 선택지가 동일함`,
      quizId: quiz.id,
      details: { options: quiz.options, otherQuizId: existing.id }
    });
  } else {
    optionCombos.set(optionKey, quiz);
  }

  // 2. 정답 인덱스 유효성 검사
  if (quiz.correctAnswer < 0 || quiz.correctAnswer >= quiz.options.length) {
    issues.push({
      type: 'INVALID_ANSWER_INDEX',
      message: `ID ${quiz.id}: 정답 인덱스(${quiz.correctAnswer})가 유효하지 않음`,
      quizId: quiz.id
    });
  }

  // 3. 필수 필드 검사
  const requiredFields = ['id', 'question', 'options', 'correctAnswer', 'highlightWord', 'explanation', 'category', 'difficulty'];
  requiredFields.forEach(field => {
    if (!quiz[field] && quiz[field] !== 0) {
      issues.push({
        type: 'MISSING_FIELD',
        message: `ID ${quiz.id}: 필수 필드 '${field}'가 누락됨`,
        quizId: quiz.id
      });
    }
  });

  // 4. 선택지와 highlightWord 일치 여부
  if (JSON.stringify(quiz.options) !== JSON.stringify(quiz.highlightWord)) {
    warnings.push({
      type: 'OPTIONS_HIGHLIGHT_MISMATCH',
      message: `ID ${quiz.id}: options와 highlightWord가 일치하지 않음`,
      quizId: quiz.id,
      details: { options: quiz.options, highlightWord: quiz.highlightWord }
    });
  }

  // 5. question에 {blank} 포함 여부
  if (!quiz.question.includes('{blank}')) {
    warnings.push({
      type: 'NO_BLANK',
      message: `ID ${quiz.id}: 질문에 {blank}가 없음`,
      quizId: quiz.id
    });
  }
});

// 중복 질문 보고
questionMap.forEach((ids, question) => {
  if (ids.length > 1) {
    issues.push({
      type: 'DUPLICATE_QUESTION',
      message: `질문이 중복됨: "${question}"`,
      quizIds: ids,
      details: { question, duplicateIds: ids }
    });
  }
});

// 6. ID 연속성 및 중복 검사
const ids = data.quizzes.map(q => q.id).sort((a, b) => a - b);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicateIds.length > 0) {
  issues.push({
    type: 'DUPLICATE_IDS',
    message: `중복된 ID가 존재함: ${duplicateIds.join(', ')}`,
    details: { duplicateIds }
  });
}

// 7. 카테고리별 분포 확인
const categoryCount = {};
data.quizzes.forEach(quiz => {
  categoryCount[quiz.category] = (categoryCount[quiz.category] || 0) + 1;
});

// 8. 난이도별 분포 확인
const difficultyCount = {};
data.quizzes.forEach(quiz => {
  difficultyCount[quiz.difficulty] = (difficultyCount[quiz.difficulty] || 0) + 1;
});

// 보고서 출력
console.log('=' .repeat(60));
console.log('맞춤법 퀴즈 검증 보고서');
console.log('=' .repeat(60));
console.log(`\n총 문제 수: ${data.quizzes.length}개\n`);

if (issues.length > 0) {
  console.log(`\n🚨 심각한 문제 (${issues.length}개):`);
  console.log('-' .repeat(60));
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. [${issue.type}] ${issue.message}`);
    if (issue.details) {
      console.log(`   상세: ${JSON.stringify(issue.details, null, 2)}`);
    }
  });
} else {
  console.log('\n✅ 심각한 문제가 발견되지 않았습니다.');
}

if (warnings.length > 0) {
  console.log(`\n⚠️  경고 (${warnings.length}개):`);
  console.log('-' .repeat(60));
  warnings.forEach((warning, index) => {
    console.log(`${index + 1}. [${warning.type}] ${warning.message}`);
    if (warning.details) {
      console.log(`   상세: ${JSON.stringify(warning.details, null, 2)}`);
    }
  });
} else {
  console.log('\n✅ 경고 사항이 없습니다.');
}

console.log('\n📊 카테고리별 분포:');
console.log('-' .repeat(60));
Object.entries(categoryCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([category, count]) => {
    const percentage = ((count / data.quizzes.length) * 100).toFixed(1);
    console.log(`  ${category}: ${count}개 (${percentage}%)`);
  });

console.log('\n📊 난이도별 분포:');
console.log('-' .repeat(60));
Object.entries(difficultyCount)
  .sort((a, b) => {
    const order = { easy: 1, medium: 2, hard: 3 };
    return order[a[0]] - order[b[0]];
  })
  .forEach(([difficulty, count]) => {
    const percentage = ((count / data.quizzes.length) * 100).toFixed(1);
    console.log(`  ${difficulty}: ${count}개 (${percentage}%)`);
  });

console.log('\n' + '=' .repeat(60));

// 문제가 있으면 종료 코드 1 반환
if (issues.length > 0) {
  process.exit(1);
}
