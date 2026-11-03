import express from 'express';
import { OpenAI } from 'openai';

const router = express.Router();

let openai;

router.post('/api/evaluate', async (req, res) => {
  try {
    if (!openai) {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
    
    const { target, asrText } = req.body;

    if (!target || !asrText) {
      return res.status(400).json({ error: 'Missing target or asrText' });
    }

    const prompt = `한국어 발음 평가를 수행합니다.
목표 문장: "${target}"
실제 발음 인식 결과: "${asrText}"

다음 기준으로 평가하세요:
1. 전체 정확도 (0-100점)
2. 잘못 발음된 부분 지적
3. 개선 방법 제안

JSON 형식으로 응답:
{
  "score": 점수(0-100),
  "feedback": "전체 피드백",
  "errors": [
    {
      "word": "잘못된 단어",
      "expected": "예상 발음",
      "actual": "실제 발음",
      "suggestion": "개선 방법"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 한국어 발음 교정 전문가입니다. 이주 노동자들의 한국어 학습을 돕고 있습니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ 
      error: 'Evaluation failed',
      message: error.message 
    });
  }
});

export default router;