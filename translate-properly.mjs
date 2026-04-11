import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { OpenAI } = require('./server/node_modules/openai/index.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: 'sk-YePwyBffxtrsu6qWtEC_KE67qJ4hDFHTE1niUB47CfT3BlbkFJk4ut_aI2bxq1HLREhkKM9hQpYHnmH778_9r63--csA'
});

// 한국어를 영어로 번역
async function translateToEnglish(koreanText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in Korean language learning materials. Translate Korean to natural, educational English that helps learners understand Korean language and culture.'
        },
        {
          role: 'user',
          content: `Translate this Korean text to English:\n\n${koreanText}`
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error(`  ❌ Translation error: ${error.message}`);
    return '';
  }
}

// JSON 파일 처리
async function processJsonFile(filePath) {
  console.log(`\n📄 Processing: ${path.basename(filePath)}`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    let translationCount = 0;

    if (data.lessons && Array.isArray(data.lessons)) {
      for (const lesson of data.lessons) {
        if ((lesson.type === 'expression' || lesson.type === 'single_expression') && lesson.expression) {
          const expr = lesson.expression;

          // explanation 번역
          if (expr.explanation) {
            console.log(`  📝 Translating explanation for: ${expr.korean}`);
            expr.explanationEn = await translateToEnglish(expr.explanation);
            translationCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // whenToUse 번역
          if (expr.whenToUse) {
            console.log(`  📝 Translating whenToUse for: ${expr.korean}`);
            expr.whenToUseEn = await translateToEnglish(expr.whenToUse);
            translationCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }

          // culturalTip 번역
          if (expr.culturalTip) {
            console.log(`  📝 Translating culturalTip for: ${expr.korean}`);
            expr.culturalTipEn = await translateToEnglish(expr.culturalTip);
            translationCount++;
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    }

    // 파일 저장
    if (translationCount > 0) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`  ✅ Translated ${translationCount} fields`);
    }

    return translationCount;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    return 0;
  }
}

// 메인 함수
async function main() {
  console.log('🚀 Starting proper translation with OpenAI...\n');

  const dataDir = path.join(__dirname, 'client', 'src', 'data');

  const files = [
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

  let total = 0;

  for (const file of files) {
    const filePath = path.join(dataDir, file);
    const count = await processJsonFile(filePath);
    total += count;
  }

  console.log(`\n✨ Complete! Total translations: ${total}`);
}

main().catch(console.error);
