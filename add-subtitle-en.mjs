import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { OpenAI } = require('./server/node_modules/openai/index.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: 'sk-YePwyBffxtrsu6qWtEC_KE67qJ4hDFHTE1niUB47CfT3BlbkFJk4ut_aI2bxq1HLREhkKM9hQpYHnmH778_9r63--csA'
});

async function translateToEnglish(koreanText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Translate Korean to natural English.' },
        { role: 'user', content: `Translate: ${koreanText}` }
      ],
      temperature: 0.3,
      max_tokens: 200
    });
    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error(`Translation error: ${error.message}`);
    return '';
  }
}

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const data = JSON.parse(content);

  if (data.subtitle && !data.subtitleEn) {
    console.log(`📝 Translating subtitle for ${path.basename(filePath)}`);
    data.subtitleEn = await translateToEnglish(data.subtitle);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return 1;
  }
  return 0;
}

async function main() {
  const folders = [
    path.join(__dirname, 'client', 'src', 'data'),
    path.join(__dirname, 'server', 'src', 'data')
  ];

  const files = [
    'beginner_1.json', 'beginner_2.json', 'beginner_3.json', 'beginner_4.json', 'beginner_5.json',
    'intermediate_1.json', 'intermediate_2.json', 'intermediate_3.json', 'intermediate_4.json', 'intermediate_5.json',
    'advanced_1.json', 'advanced_2.json', 'advanced_3.json', 'advanced_4.json', 'advanced_5.json'
  ];

  let total = 0;
  for (const folder of folders) {
    for (const file of files) {
      total += await processFile(path.join(folder, file));
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n✨ Added ${total} subtitle translations`);
}

main().catch(console.error);
