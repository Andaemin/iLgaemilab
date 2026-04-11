import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON 파일 처리
async function processJsonFile(filePath) {
  console.log(`\n📄 Processing: ${filePath}`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let removalCount = 0;

    if (data.lessons && Array.isArray(data.lessons)) {
      for (const lesson of data.lessons) {
        if (lesson.type === 'quiz' && lesson.quiz) {
          const quiz = lesson.quiz;

          // 퀴즈 타이틀 베트남어 삭제
          if (quiz.titleVi) {
            delete quiz.titleVi;
            removalCount++;
          }

          // 퀴즈 설명 베트남어 삭제
          if (quiz.descriptionVi) {
            delete quiz.descriptionVi;
            removalCount++;
          }

          // 퀴즈 문제들의 베트남어 삭제
          if (quiz.questions && Array.isArray(quiz.questions)) {
            for (const question of quiz.questions) {
              if (question.questionVi) {
                delete question.questionVi;
                removalCount++;
              }
              if (question.explanationVi) {
                delete question.explanationVi;
                removalCount++;
              }
            }
          }
        }
      }
    }

    // 파일 저장
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`  ✅ Removed ${removalCount} Vietnamese fields`);

    return { removalCount };
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return { removalCount: 0 };
  }
}

// 메인 함수
async function main() {
  console.log('🚀 Starting Vietnamese removal from quiz data...\n');

  const files = [
    'beginner_1.json',
    'beginner_2.json',
    'beginner_3.json',
    'beginner_4.json',
    'beginner_5.json',
    'intermediate_1.json',
    'intermediate_2.json',
    'intermediate_3.json',
    'intermediate_4.json',
    'intermediate_5.json',
    'advanced_1.json',
    'advanced_2.json',
    'advanced_3.json',
    'advanced_4.json',
    'advanced_5.json'
  ];

  const folders = [
    path.join(__dirname, 'client', 'src', 'data'),
    path.join(__dirname, 'server', 'src', 'data')
  ];

  let totalRemovals = 0;

  for (const folder of folders) {
    console.log(`\n📁 Processing folder: ${folder}`);
    for (const file of files) {
      const filePath = path.join(folder, file);
      const result = await processJsonFile(filePath);
      totalRemovals += result.removalCount;
    }
  }

  console.log(`\n✨ Complete!`);
  console.log(`   Vietnamese fields removed: ${totalRemovals}`);
}

main().catch(console.error);
