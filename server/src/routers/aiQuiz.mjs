import express from "express";
import { OpenAI } from "openai";
import authMiddleware from "../middlewares/auth.mjs";
import fs from "fs/promises";
import path from "path";
import { dirname } from "dirname-filename-esm";

const router = express.Router();
const __dirname = dirname(import.meta);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/ai-quiz/generate
 * 학습 JSON 파일을 기반으로 AI 퀴즈 생성
 */
router.post("/generate", authMiddleware, async (req, res) => {
  try {
    const { category, level } = req.body;

    // 필수 필드 검증
    if (!category || !level) {
      return res.status(400).json({
        success: false,
        message: "category와 level이 필요합니다.",
      });
    }

    // JSON 파일 경로 구성
    const fileName = `${category}_${level}.json`;
    // __dirname은 server/src를 가리킴, 두 단계 위로 가서 client로
    const filePath = path.join(__dirname, "../../../client/src/data", fileName);

    // JSON 파일 읽기
    let lessonData;
    try {
      const fileContent = await fs.readFile(filePath, "utf-8");
      lessonData = JSON.parse(fileContent);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: `학습 파일을 찾을 수 없습니다: ${fileName}`,
      });
    }

    // 학습 내용 추출 (표현식만)
    const expressions = lessonData.lessons
      .filter((lesson) => lesson.type === "single_expression")
      .map((lesson) => ({
        korean: lesson.expression.korean,
        meaning: lesson.expression.meaning,
        meaningVi: lesson.expression.meaningVi,
        examples: lesson.expression.examples,
      }));

    if (expressions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "학습 내용에 표현식이 없습니다.",
      });
    }

    // 무작위 시드 생성 (매번 다른 문제 보장)
    const randomSeed = Math.floor(Math.random() * 1000000);
    const timestamp = new Date().toISOString();

    // 학습한 표현 목록 생성 (정답과 선택지로 사용할 수 있는 표현들)
    const expressionList = expressions.map(exp => exp.korean).join(", ");

    // OpenAI 프롬프트 생성
    const prompt = `당신은 한국어 학습 교재 제작자입니다. 다음 한국어 표현들을 학습한 베트남 학생들을 위한 복습 퀴즈를 만들어주세요.

**📚 학습한 표현 목록 (이 목록의 표현만 사용 가능!):**
${expressions
  .map(
    (exp, idx) =>
      `${idx + 1}. "${exp.korean}" = ${exp.meaning} (${exp.meaningVi})
   예문: ${exp.examples?.map(ex => `"${ex.korean}"`).join(", ") || "없음"}`
  )
  .join("\n")}

**🚨 가장 중요한 규칙: 학습한 표현만 사용!**

정답과 선택지는 반드시 다음 목록에서만 선택하세요:
[${expressionList}]

❌ 절대 금지 (학습 목록에 없는 표현):
- "속상해요", "기뻐요", "떨려요", "긴장돼요" 등 목록에 없는 표현
- 학습한 표현을 변형한 것 (예: "행복해요" → "행복합니다")

✅ 반드시 사용해야 하는 표현:
- 위 학습한 표현 목록의 정확한 형태만 사용
- 예: "행복해요", "슬퍼요", "화나요" 등 목록에 있는 그대로

**📝 문제 유형 (아래 2가지 유형만 사용):**

1. **의미 → 한국어 문제** (가장 권장):
   - 질문: "다음 중 'I'm happy / Tôi vui'의 의미를 가진 한국어 표현은 무엇인가요?"
   - 선택지: 학습한 한국어 표현 4개
   - 정답: 해당 의미의 한국어 표현

2. **한국어 → 의미 문제**:
   - 질문: "'행복해요'는 영어로 무슨 뜻인가요?"
   - 선택지: 영어 의미 4개 (예: "I'm happy", "I'm sad", "I'm angry", "I'm tired")
   - 정답: 해당 표현의 영어 의미

**🚨 문제 형식 필수 규칙:**
- 질문에 반드시 "무엇인가요?", "무슨 뜻인가요?" 등 **질문 형식**을 사용하세요
- 질문만 보고도 **무엇을 선택해야 하는지 명확**해야 합니다

**🚫 절대 만들지 말아야 할 문제:**

❌ 나쁜 예 1 (질문이 불명확):
- 문제: "Where are you going?"
- 선택지: ["어디", "여기", "저기", "거기"]
- 이유: 무엇을 물어보는지 불명확!

❌ 나쁜 예 2 (질문이 불명확):
- 문제: "The restroom is over there."
- 선택지: ["여기", "저기", "거기", "위"]
- 이유: 문장만 제시하면 무엇을 찾아야 하는지 모름

✅ 좋은 예:
- 문제: "다음 중 'I'm sad / Tôi buồn'를 의미하는 한국어 표현은 무엇인가요?"
- 선택지: ["행복해요", "슬퍼요", "화나요", "피곤해요"]
- 정답: 1 (슬퍼요)

요구사항:
1. 총 5개의 4지선다 문제
2. 모든 선택지는 반드시 학습한 표현 목록에서만 선택
3. 정답이 100% 명확해야 함
4. 모든 문제는 명확한 질문 형식이어야 함
5. **중요: 정답 위치(correctAnswer)를 0, 1, 2, 3 중에서 골고루 분산시키세요!** 예: 문제1은 정답 0번, 문제2는 정답 2번, 문제3은 정답 1번... 이렇게 다양하게

[생성 ID: ${randomSeed} / 시간: ${timestamp}]

JSON 형식:
{
  "questions": [
    {
      "question": "영어로 된 질문",
      "questionKo": "한국어 질문",
      "questionVi": "베트남어 질문",
      "options": ["학습한표현1", "학습한표현2", "학습한표현3", "학습한표현4"],
      "correctAnswer": 정답인덱스(0-3),
      "explanation": "영어 설명",
      "explanationVi": "베트남어 설명"
    }
  ]
}

JSON만 응답하세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국어 교육 전문가입니다. 반드시 다음 규칙을 지켜주세요:

**🚨 핵심 규칙:**

1. **학습한 표현만 사용**: 정답과 선택지는 반드시 제공된 목록에서만
2. **명확한 질문 형식**: 모든 문제는 "~무엇인가요?", "~무슨 뜻인가요?" 형태로 작성
3. **질문이 불명확하면 안 됨**: 단순히 영어/베트남어 문장만 제시하고 선택지 나열 금지!

**❌ 절대 하면 안 되는 것:**
- "Where are you going?" + 선택지 → 무엇을 물어보는지 불명확!
- "The restroom is over there." + 선택지 → 질문이 아님!

**✅ 올바른 형식:**
- "다음 중 'where'의 의미를 가진 한국어 표현은 무엇인가요?" + 선택지
- "'어디'는 영어로 무슨 뜻인가요?" + 선택지

JSON 형식으로만 응답하세요.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2, // 더 낮춰서 규칙 준수 강화
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();

    if (!responseContent) {
      return res.status(500).json({
        success: false,
        message: "AI 응답을 받지 못했습니다.",
      });
    }

    // JSON 파싱
    let quizData;
    try {
      quizData = JSON.parse(responseContent);
    } catch (error) {
      console.error("JSON 파싱 실패:", responseContent);
      return res.status(500).json({
        success: false,
        message: "AI 응답을 파싱하는데 실패했습니다.",
      });
    }

    // 퀴즈 데이터 검증
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return res.status(500).json({
        success: false,
        message: "생성된 퀴즈 형식이 올바르지 않습니다.",
      });
    }

    // correctAnswer 인덱스 검증 및 수정
    quizData.questions = quizData.questions.map((q, qIdx) => {
      // correctAnswer가 숫자가 아니거나 범위를 벗어난 경우
      if (typeof q.correctAnswer !== 'number' ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= (q.options?.length || 4)) {
        console.warn(`⚠️ 복습퀴즈 문제 ${qIdx + 1}의 correctAnswer 값이 유효하지 않음: ${q.correctAnswer}, 0으로 설정`);
        q.correctAnswer = 0;
      }
      // correctAnswer를 정수로 변환 (소수점 방지)
      q.correctAnswer = Math.floor(q.correctAnswer);
      return q;
    });

    res.json({
      success: true,
      quiz: {
        title: "AI 생성 복습 퀴즈",
        titleVi: "Bài kiểm tra ôn tập do AI tạo",
        description: "배운 내용을 확인해볼까요?",
        descriptionVi: "Hãy kiểm tra những gì đã học nhé?",
        questions: quizData.questions,
      },
      metadata: {
        category,
        level,
        generatedAt: new Date().toISOString(),
        expressionCount: expressions.length,
      },
    });
  } catch (error) {
    console.error("AI 퀴즈 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "퀴즈 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

/**
 * POST /api/ai-quiz/generate-final-test
 * 전체 레벨(초급/중급/고급)의 마무리 테스트 생성
 */
router.post("/generate-final-test", authMiddleware, async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "category가 필요합니다.",
      });
    }

    // 해당 카테고리의 모든 레벨(1-5) 학습 내용 수집
    const allExpressions = [];

    for (let level = 1; level <= 5; level++) {
      const fileName = `${category}_${level}.json`;
      const filePath = path.join(__dirname, "../../../client/src/data", fileName);

      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const lessonData = JSON.parse(fileContent);

        const expressions = lessonData.lessons
          .filter((lesson) => lesson.type === "single_expression")
          .map((lesson) => ({
            level,
            korean: lesson.expression.korean,
            meaning: lesson.expression.meaning,
            meaningVi: lesson.expression.meaningVi,
          }));

        allExpressions.push(...expressions);
      } catch (error) {
        console.warn(`레벨 ${level} 파일 읽기 실패:`, error.message);
      }
    }

    if (allExpressions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "학습 내용을 찾을 수 없습니다.",
      });
    }

    const categoryNames = {
      beginner: "초급",
      intermediate: "중급",
      advanced: "고급",
    };

    // 무작위 시드 생성 (매번 다른 문제 보장)
    const randomSeed = Math.floor(Math.random() * 1000000);
    const timestamp = new Date().toISOString();

    // 학습한 표현 목록 생성
    const expressionList = allExpressions.map(exp => exp.korean).join(", ");

    // 정답 분포를 위한 미리 지정된 패턴 (15문제: 0,1,2,3이 각각 3-4개씩)
    const answerDistribution = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    // 셔플해서 순서를 무작위로
    const shuffledDistribution = answerDistribution.sort(() => Math.random() - 0.5);

    const prompt = `당신은 한국어 학습 교재 제작자입니다. ${categoryNames[category]} 과정 전체를 완료한 베트남 학생들을 위한 마무리 테스트를 만들어주세요.

**📚 학습한 표현 목록 (이 목록의 표현만 사용 가능!):**
${allExpressions
  .slice(0, 50)
  .map(
    (exp, idx) =>
      `${idx + 1}. "${exp.korean}" = ${exp.meaning} (${exp.meaningVi})`
  )
  .join("\n")}

**🔑 사용 가능한 표현 (정답과 선택지는 반드시 이 중에서만!):**
[${expressionList.slice(0, 500)}...]

**🚨 가장 중요한 규칙들:**

**규칙 1: 학습한 표현만 사용!**
❌ 절대 금지:
- "속상해요", "기뻐요", "떨려요", "긴장돼요" 등 목록에 없는 표현
- 학습한 표현을 변형한 것 (예: "행복해요" → "행복합니다")

**규칙 2: 각 선택지는 반드시 하나의 단일 표현만!**
❌ 절대 금지 - 복합 선택지:
- "덥다/춥다" ← 두 개의 표현이 합쳐짐!
- "행복해요/기뻐요" ← 두 개의 표현이 합쳐짐!
- "여기/저기" ← 두 개의 표현이 합쳐짐!

✅ 올바른 선택지:
- "추워요" ← 하나의 단일 표현
- "행복해요" ← 하나의 단일 표현
- "여기" ← 하나의 단일 표현

**규칙 3: 정답이 100% 명확해야 함!**
❌ 나쁜 예:
- 질문: "It's cold의 뜻은?"
- 선택지: ["덥다/춥다", "놀라다/슬프다", ...]
- 문제점: "덥다/춥다" 중 "춥다"만 맞는데 선택지가 모호함!

✅ 좋은 예:
- 질문: "'추워요'는 영어로 무슨 뜻인가요?"
- 선택지: ["It's cold", "It's hot", "It's warm", "It's cool"]
- 정답: 0 (It's cold) - 100% 명확!

**📝 문제 유형 (아래 2가지만 사용):**

1. **의미 → 한국어** (권장):
   - "다음 중 'I'm happy'의 의미를 가진 한국어 표현은?"
   - 선택지: 단일 한국어 표현 4개 (각각 다른 뜻)

2. **한국어 → 의미**:
   - "'행복해요'는 영어로 무슨 뜻인가요?"
   - 선택지: 단일 영어 의미 4개

**🎯 정답 위치 분포 (반드시 따르세요!):**
문제별로 정답 위치를 다음과 같이 지정합니다:
${shuffledDistribution.map((pos, idx) => `문제${idx + 1}: 정답 위치 = ${pos}번`).join(", ")}

요구사항:
1. 총 15개의 4지선다 문제
2. **각 선택지는 반드시 하나의 단일 표현만!** (슬래시로 연결된 복합 표현 절대 금지)
3. 정답이 100% 명확해야 함 (모호한 선택지 금지)
4. 위에 지정된 정답 위치 분포를 반드시 따르세요

[생성 ID: ${randomSeed} / 시간: ${timestamp}]

JSON 형식:
{
  "questions": [
    {
      "question": "영어 질문",
      "questionKo": "한국어 질문",
      "questionVi": "베트남어 질문",
      "options": ["단일표현1", "단일표현2", "단일표현3", "단일표현4"],
      "correctAnswer": 0-3,
      "explanation": "설명",
      "explanationVi": "베트남어 설명"
    }
  ]
}

JSON만 응답하세요.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `당신은 한국어 교육 전문가입니다. 반드시 다음 규칙을 지켜주세요:

**🚨 핵심 규칙:**

1. **학습한 표현만 사용**: 정답과 선택지는 반드시 제공된 목록에서만
2. **각 선택지는 단일 표현만**: 슬래시(/)로 연결된 복합 표현 절대 금지!
3. **정답은 100% 명확해야 함**: 선택지 중 하나만 정답이어야 함
4. **정답 위치 분포**: 프롬프트에서 지정한 정답 위치를 정확히 따르세요

**❌ 절대 하면 안 되는 것:**
- 복합 선택지: "덥다/춥다", "행복해요/슬퍼요", "It's hot/cold" ← 절대 금지!
- 모호한 정답: 선택지에 부분적으로만 맞는 답 포함 금지!
- 정답 위치 편중: 모든 정답이 0번이나 1번에만 몰리면 안 됨!

**✅ 올바른 형식:**
- 선택지: ["추워요", "더워요", "시원해요", "따뜻해요"] ← 각각 단일 표현
- 선택지: ["It's cold", "It's hot", "It's cool", "It's warm"] ← 각각 단일 의미
- 정답이 하나만 100% 맞는 문제
- 정답 위치가 0, 1, 2, 3에 골고루 분산

JSON 형식으로만 응답하세요.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.9, // 높여서 매번 다양한 문제 생성
      max_tokens: 4000,
      response_format: { type: "json_object" },
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();

    if (!responseContent) {
      return res.status(500).json({
        success: false,
        message: "AI 응답을 받지 못했습니다.",
      });
    }

    let quizData;
    try {
      quizData = JSON.parse(responseContent);
    } catch (error) {
      console.error("JSON 파싱 실패:", responseContent);
      return res.status(500).json({
        success: false,
        message: "AI 응답을 파싱하는데 실패했습니다.",
      });
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return res.status(500).json({
        success: false,
        message: "생성된 퀴즈 형식이 올바르지 않습니다.",
      });
    }

    // 1. correctAnswer 인덱스 검증 및 수정
    quizData.questions = quizData.questions.map((q, qIdx) => {
      // correctAnswer가 숫자가 아니거나 범위를 벗어난 경우
      if (typeof q.correctAnswer !== 'number' ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= (q.options?.length || 4)) {
        console.warn(`⚠️ 마무리테스트 문제 ${qIdx + 1}의 correctAnswer 값이 유효하지 않음: ${q.correctAnswer}, 0으로 설정`);
        q.correctAnswer = 0;
      }
      // correctAnswer를 정수로 변환 (소수점 방지)
      q.correctAnswer = Math.floor(q.correctAnswer);
      return q;
    });

    // 2. 복합 선택지 검증 및 경고 로그
    quizData.questions.forEach((q, qIdx) => {
      if (q.options) {
        q.options.forEach((opt, optIdx) => {
          if (opt && opt.includes('/')) {
            console.warn(`⚠️ 마무리테스트 문제 ${qIdx + 1} 선택지 ${optIdx}에 복합 표현 발견: "${opt}"`);
          }
        });
      }
    });

    // 3. 정답 분포 확인
    const answerCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    quizData.questions.forEach(q => {
      answerCounts[q.correctAnswer] = (answerCounts[q.correctAnswer] || 0) + 1;
    });

    console.log(`📊 마무리테스트 원본 정답 분포: 0번=${answerCounts[0]}, 1번=${answerCounts[1]}, 2번=${answerCounts[2]}, 3번=${answerCounts[3]}`);

    // 4. 항상 정답 위치를 강제로 균등 분배 (선택지 위치 교환)
    // 15문제: 0,1,2,3이 각각 3-4개씩 되도록 무작위로 배정
    const targetPositions = [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2];
    // Fisher-Yates 셔플로 무작위 순서 생성
    for (let i = targetPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [targetPositions[i], targetPositions[j]] = [targetPositions[j], targetPositions[i]];
    }

    quizData.questions = quizData.questions.map((q, qIdx) => {
      const targetPosition = targetPositions[qIdx];
      const currentCorrectAnswer = q.correctAnswer;

      if (currentCorrectAnswer !== targetPosition && q.options && q.options.length === 4) {
        // 현재 정답과 목표 위치의 선택지를 교환
        const temp = q.options[targetPosition];
        q.options[targetPosition] = q.options[currentCorrectAnswer];
        q.options[currentCorrectAnswer] = temp;
        q.correctAnswer = targetPosition;
      }

      return q;
    });

    // 재분배 후 로그
    const newCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
    quizData.questions.forEach(q => {
      newCounts[q.correctAnswer] = (newCounts[q.correctAnswer] || 0) + 1;
    });
    console.log(`📊 재분배 후 정답 분포: 0번=${newCounts[0]}, 1번=${newCounts[1]}, 2번=${newCounts[2]}, 3번=${newCounts[3]}`);

    res.json({
      success: true,
      test: {
        title: `${categoryNames[category]} 마무리 테스트`,
        titleVi: `Bài kiểm tra kết thúc ${categoryNames[category]}`,
        subtitle: "전체 과정을 얼마나 잘 이해했는지 확인해보세요",
        subtitleVi:
          "Kiểm tra xem bạn đã hiểu toàn bộ khóa học như thế nào",
        totalQuestions: quizData.questions.length,
        passingScore: Math.ceil(quizData.questions.length * 0.8), // 80% 이상 합격
        questions: quizData.questions,
      },
      metadata: {
        category,
        generatedAt: new Date().toISOString(),
        totalExpressions: allExpressions.length,
      },
    });
  } catch (error) {
    console.error("AI 마무리 테스트 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "마무리 테스트 생성 중 오류가 발생했습니다.",
      error: error.message,
    });
  }
});

export default router;
