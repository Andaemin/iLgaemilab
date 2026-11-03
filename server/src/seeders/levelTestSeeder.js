import { LevelTest } from "../models/index.js";

const levelTestQuestions = [
  // ========== 듣기 문제 (1-4번, 각 1점) ==========
  {
    questionType: "listening",
    questionNumber: 1,
    difficulty: 0,
    questionText: "오디오를 듣고 알맞은 답을 고르세요.",
    questionTextVi: "Nghe và chọn câu trả lời đúng.",
    audioUrl: "/audio/level-test/q1.mp3", // "이쪽으로 오세요"
    choices: [
      { id: "1", text: "오세요" },
      { id: "2", text: "가세요" },
      { id: "3", text: "기다리세요" },
      { id: "4", text: "드세요" }
    ],
    correctAnswer: "1",
    maxScore: 1,
    explanation: "'오세요'는 사람을 부를 때 쓰는 표현입니다.",
  },
  {
    questionType: "listening",
    questionNumber: 2,
    difficulty: 0,
    questionText: "오디오를 듣고 알맞은 답을 고르세요.",
    questionTextVi: "Nghe và chọn câu trả lời đúng.",
    audioUrl: "/audio/level-test/q2.mp3", // "지금 점심시간이에요"
    choices: [
      { id: "1", text: "아침이에요" },
      { id: "2", text: "점심이에요" },
      { id: "3", text: "저녁이에요" },
      { id: "4", text: "회의해요" }
    ],
    correctAnswer: "2",
    maxScore: 1,
    explanation: "점심시간을 정확히 들어야 합니다.",
  },
  {
    questionType: "listening",
    questionNumber: 3,
    difficulty: 1,
    questionText: "오디오를 듣고 알맞은 답을 고르세요.",
    questionTextVi: "Nghe và chọn câu trả lời đúng.",
    audioUrl: "/audio/level-test/q3.mp3", // "여기 위험해요. 조심하세요"
    choices: [
      { id: "1", text: "위험해요" },
      { id: "2", text: "늦었어요" },
      { id: "3", text: "시끄러워요" },
      { id: "4", text: "예뻐요" }
    ],
    correctAnswer: "1",
    maxScore: 1,
    explanation: "'위험'이라는 중요한 안전 관련 단어를 듣고 이해해야 합니다.",
  },
  {
    questionType: "listening",
    questionNumber: 4,
    difficulty: 1,
    questionText: "오디오를 듣고 알맞은 답을 고르세요.",
    questionTextVi: "Nghe và chọn câu trả lời đúng.",
    audioUrl: "/audio/level-test/q4.mp3", // "화장실이 어디에 있어요?"
    choices: [
      { id: "1", text: "언제 가요?" },
      { id: "2", text: "어디 있어요?" },
      { id: "3", text: "누구 만나요?" },
      { id: "4", text: "왜 가요?" }
    ],
    correctAnswer: "2",
    maxScore: 1,
    explanation: "위치를 묻는 '어디'를 정확히 들어야 합니다.",
  },

  // ========== 읽기 문제 (5-6번, 각 1점) ==========
  {
    questionType: "reading",
    questionNumber: 5,
    difficulty: 1,
    questionText: "다음 문장을 읽고 무엇을 묻는 질문인지 고르세요.\n\n\"사장님이 오늘 몇 시에 오십니까?\"",
    questionTextVi: "Đọc câu sau và chọn câu hỏi về điều gì.",
    choices: [
      { id: "1", text: "사람" },
      { id: "2", text: "시간" },
      { id: "3", text: "장소" },
      { id: "4", text: "이유" }
    ],
    correctAnswer: "2",
    maxScore: 1,
    explanation: "'몇 시에'는 시간을 묻는 표현입니다.",
  },
  {
    questionType: "reading",
    questionNumber: 6,
    difficulty: 2,
    questionText: "다음 문장을 읽고 가장 중요한 내용을 고르세요.\n\n\"이 기계를 끄고 자리를 정리하세요.\"",
    questionTextVi: "Đọc câu sau và chọn nội dung quan trọng nhất.",
    choices: [
      { id: "1", text: "기계 사용" },
      { id: "2", text: "정리 정돈" },
      { id: "3", text: "불 끄기" },
      { id: "4", text: "안전 수칙" }
    ],
    correctAnswer: "2",
    maxScore: 1,
    explanation: "두 가지 지시사항 중 '자리를 정리하세요'가 최종 행동입니다.",
  },

  // ========== 단답형 문제 (7-8번, 각 2점) ==========
  {
    questionType: "short_answer",
    questionNumber: 7,
    difficulty: 2,
    questionText: "빈칸에 알맞은 말을 쓰세요.\n\n\"이것을 ______ 주세요.\"",
    questionTextVi: "Điền vào chỗ trống.",
    correctAnswer: "옮겨",
    acceptableAnswers: ["옮겨", "가져", "들어", "놓아", "치워"],
    maxScore: 2,
    explanation: "자연스러운 동작 동사를 사용해야 합니다.",
  },
  {
    questionType: "short_answer",
    questionNumber: 8,
    difficulty: 2,
    questionText: "빈칸에 알맞은 말을 쓰세요.\n\n\"오늘 날씨가 좋아서 저는 _____ 갔어요.\"",
    questionTextVi: "Điền vào chỗ trống.",
    correctAnswer: "공원에",
    acceptableAnswers: ["공원에", "밖에", "산책하러", "운동하러", "놀러"],
    maxScore: 2,
    explanation: "날씨가 좋을 때 할 수 있는 활동과 연결되는 표현입니다.",
  },

  // ========== 말하기 문제 (9-10번, 각 5점) ==========
  {
    questionType: "speaking",
    questionNumber: 9,
    difficulty: 1,
    questionText: "자기소개를 해보세요. (이름, 나라, 일하는 곳)",
    questionTextVi: "Hãy tự giới thiệu (tên, quốc gia, nơi làm việc).",
    correctAnswer: "안녕하세요. 저는 [이름]입니다. [나라]에서 왔습니다. [직장]에서 일합니다.",
    acceptableAnswers: [
      "안녕하세요. 제 이름은 [이름]입니다.",
      "저는 [이름]이고 [나라] 사람입니다.",
      "[직장]에서 일해요."
    ],
    scoringCriteria: {
      pronunciation: { max: 2, description: "발음 정확도" },
      grammar: { max: 2, description: "문법 정확도" },
      communication: { max: 1, description: "의사 전달력" }
    },
    maxScore: 5,
    explanation: "기본적인 자기소개 표현을 할 수 있어야 합니다.",
  },
  {
    questionType: "speaking",
    questionNumber: 10,
    difficulty: 2,
    questionText: "\"기계가 고장 났어요. 어떻게 해야 해요?\"라는 질문에 대답하세요.",
    questionTextVi: "Trả lời câu hỏi: 'Máy bị hỏng. Phải làm sao?'",
    correctAnswer: "먼저 전원을 끄세요. 그리고 관리자에게 알려주세요.",
    acceptableAnswers: [
      "전원을 끄고 신고하세요",
      "관리자를 부르세요",
      "수리 기사를 불러야 해요",
      "먼저 안전하게 멈추세요"
    ],
    scoringCriteria: {
      pronunciation: { max: 2, description: "발음 정확도" },
      grammar: { max: 2, description: "문법 정확도" },
      communication: { max: 1, description: "적절한 대응 제시" }
    },
    maxScore: 5,
    explanation: "문제 상황에 대한 적절한 대응을 제시할 수 있어야 합니다.",
  },
];

export const seedLevelTestQuestions = async () => {
  try {
    console.log("🌱 Seeding level test questions...");

    // 기존 데이터 삭제
    await LevelTest.destroy({ where: {} });

    // 새 데이터 삽입
    for (const question of levelTestQuestions) {
      await LevelTest.create(question);
      console.log(`✅ Created question ${question.questionNumber}: ${question.questionType}`);
    }

    console.log("✅ Level test questions seeded successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error seeding level test questions:", error);
    return false;
  }
};

// 직접 실행 시
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedLevelTestQuestions().then(() => process.exit(0));
}