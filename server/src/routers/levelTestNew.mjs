import express from "express";
import { OpenAI } from "openai";
import authMiddleware from "../middlewares/auth.mjs";
import fetch from "node-fetch";
import FormData from "form-data";
import multer from "multer";

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// 메모리에 임시 저장할 세션
const testSessions = new Map();

// 세션 정리 (1시간 이상 지난 세션 삭제)
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of testSessions.entries()) {
        if (now - session.timestamp > 3600000) {
            // 1시간
            testSessions.delete(sessionId);
        }
    }
}, 600000); // 10분마다 체크

// 레벨테스트 문제 가져오기 (하드코딩)
const levelTestQuestions = [
    {
        questionNumber: 1,
        questionType: "listening",
        questionText: "다음을 듣고 알맞은 답을 고르세요.",
        audioText: "손님, 어서 오세요. 뭘 도와드릴까요?",
        choices: [
            { id: "a", text: "오세요" },
            { id: "b", text: "가세요" },
            { id: "c", text: "기다리세요" },
            { id: "d", text: "드세요" },
        ],
        correctAnswer: "a",
    },
    {
        questionNumber: 2,
        questionType: "reading",
        questionText: "다음 문장을 읽고 빈 칸에 알맞은 말을 고르세요.\n\n저는 매일 아침 7시에 _____.",
        choices: [
            { id: "a", text: "일어나요" },
            { id: "b", text: "일어나" },
            { id: "c", text: "일어났어요" },
            { id: "d", text: "일어날 거예요" },
        ],
        correctAnswer: "a",
    },
    {
        questionNumber: 3,
        questionType: "listening",
        questionText: "대화를 듣고 장소를 고르세요.",
        audioText: "A: 어디에서 만날까요? B: 회사 앞 카페에서 만나요. 거기가 조용해서 얘기하기 좋아요.",
        choices: [
            { id: "a", text: "회사" },
            { id: "b", text: "카페" },
            { id: "c", text: "집" },
            { id: "d", text: "식당" },
        ],
        correctAnswer: "b",
    },
    {
        questionNumber: 4,
        questionType: "reading",
        questionText: "다음 글을 읽고 맞는 내용을 고르세요.\n\n'한국의 겨울은 매우 춥습니다. 눈이 자주 내리고 기온이 영하로 떨어집니다.'",
        choices: [
            { id: "a", text: "한국의 겨울은 따뜻합니다" },
            { id: "b", text: "한국의 겨울은 비가 많이 옵니다" },
            { id: "c", text: "한국의 겨울은 춥고 눈이 옵니다" },
            { id: "d", text: "한국의 겨울은 시원합니다" },
        ],
        correctAnswer: "c",
    },
    {
        questionNumber: 5,
        questionType: "short_answer",
        questionText: "자기소개를 간단히 해보세요. (이름, 나라, 직업)",
        expectedAnswer: "제 이름은 [이름]입니다. [나라]에서 왔습니다. [직업]입니다.",
    },
    {
        questionNumber: 6,
        questionType: "speaking",
        questionText: "다음 상황에서 어떻게 말하시겠습니까?\n\n상황: 직장에서 상사에게 오늘 몸이 아파서 일찍 퇴근하고 싶다고 말하기",
        expectedAnswer: "죄송합니다. 오늘 몸이 좋지 않아서 일찍 퇴근해도 될까요?",
    },
    {
        questionNumber: 7,
        questionType: "listening",
        questionText: "대화를 듣고 회의 시간을 고르세요.",
        audioText: "김과장: 내일 회의가 몇 시예요? 이부장: 오후 2시에 시작합니다. 3층 회의실에서 만나요.",
        choices: [
            { id: "a", text: "오전 2시" },
            { id: "b", text: "오후 2시" },
            { id: "c", text: "오전 12시" },
            { id: "d", text: "오후 12시" },
        ],
        correctAnswer: "b",
    },
    {
        questionNumber: 8,
        questionType: "reading",
        questionText: "다음 중 높임말로 바르게 표현된 것을 고르세요.",
        choices: [
            { id: "a", text: "할머니, 밥 먹어" },
            { id: "b", text: "할머니, 진지 드세요" },
            { id: "c", text: "할머니, 밥 먹어라" },
            { id: "d", text: "할머니, 식사해" },
        ],
        correctAnswer: "b",
    },
    {
        questionNumber: 9,
        questionType: "short_answer",
        questionText: "오늘 날씨를 한국어로 설명해보세요. (3문장 이상)",
        expectedAnswer: "오늘 날씨에 대한 설명",
    },
    {
        questionNumber: 10,
        questionType: "speaking",
        questionText: "전화로 식당 예약하는 상황을 연기해보세요.\n\n상황: 이번 주 토요일 저녁 6시, 4명",
        expectedAnswer: "안녕하세요. 이번 주 토요일 저녁 6시에 4명 예약하고 싶은데요.",
    },
];

// 레벨테스트 문제 가져오기
router.get("/api/level-test/questions", async (req, res) => {
    try {
        res.json({
            success: true,
            questions: levelTestQuestions.map((q) => ({
                ...q,
                audioText: undefined, // 클라이언트에는 음성 텍스트 숨기기
                correctAnswer: undefined, // 정답 숨기기
                expectedAnswer: undefined, // 예상 답변 숨기기
            })),
            totalQuestions: levelTestQuestions.length,
            estimatedTime: "10-15분",
        });
    } catch (error) {
        console.error("Level test questions error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch level test questions",
        });
    }
});

// TTS API - 텍스트를 음성으로 변환
router.post("/api/level-test/tts", authMiddleware, async (req, res) => {
    try {
        const { questionNumber } = req.body;

        console.log("TTS request for question:", questionNumber);

        // 실제 문제의 audioText 가져오기
        const question = levelTestQuestions.find((q) => q.questionNumber === questionNumber);
        if (!question) {
            console.log("Question not found:", questionNumber);
            return res.status(400).json({
                success: false,
                error: `Question ${questionNumber} not found`,
            });
        }

        if (!question.audioText) {
            console.log("No audio text for question:", questionNumber, "Type:", question.questionType);
            return res.status(400).json({
                success: false,
                error: `No audio available for question ${questionNumber} (${question.questionType})`,
            });
        }

        // OpenAI TTS 사용
        const mp3Response = await openai.audio.speech.create({
            model: "tts-1",
            voice: "nova",
            input: question.audioText,
            speed: 0.9,
        });

        const buffer = Buffer.from(await mp3Response.arrayBuffer());

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": buffer.length,
        });

        res.send(buffer);
    } catch (error) {
        console.error("TTS error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to generate speech",
        });
    }
});

// 음성 파일을 RTZR API로 전송하여 텍스트로 변환
router.post("/api/level-test/transcribe-voice", authMiddleware, upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "No audio file provided",
            });
        }

        // RTZR 토큰 가져오기
        const token = await getRTZRToken();
        if (!token) {
            return res.status(500).json({
                success: false,
                error: "Failed to get RTZR token",
            });
        }

        // RTZR API로 음성 파일 전송 및 STT 변환
        const transcript = await transcribeAudioWithRTZR(req.file.buffer, token);

        res.json({
            success: true,
            transcript,
        });
    } catch (error) {
        console.error("Voice transcription error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to transcribe voice",
        });
    }
});

// 레벨테스트 답변 제출 및 채점 (DB 저장 포함)
router.post("/api/level-test/submit", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { answers } = req.body;

        if (!answers || Object.keys(answers).length === 0) {
            return res.status(400).json({
                success: false,
                error: "Missing answers",
            });
        }

        let totalScore = 0;
        const maxScore = 100; // 총 100점 만점 (문제당 10점)
        const results = [];

        // 각 문제 채점 (10문제, 각 10점 만점)
        for (const question of levelTestQuestions) {
            const userAnswer = answers[question.questionNumber];
            let score = 0;
            let feedback = {};
            let isCorrect = false;

            if (!userAnswer || userAnswer === "") {
                // 답변 없음
                score = 0;
                feedback = { message: "답변하지 않았습니다" };
            } else if (question.questionType === "speaking" || question.questionType === "short_answer") {
                // GPT를 사용한 평가
                const evaluation = await evaluateWithGPT(question.questionType, question.questionText, userAnswer, question.expectedAnswer);
                score = evaluation.score * 2; // 5점 만점을 10점으로 환산
                feedback = evaluation.feedback;
                isCorrect = score >= 6; // 60% 이상이면 정답
            } else {
                // 객관식 평가
                isCorrect = userAnswer === question.correctAnswer;
                score = isCorrect ? 10 : 0; // 각 문제 10점
                feedback = {
                    message: isCorrect ? "정답입니다!" : "오답입니다",
                    correctAnswer: isCorrect ? null : question.correctAnswer,
                };
            }

            results.push({
                questionNumber: question.questionNumber,
                questionType: question.questionType,
                userAnswer,
                score,
                maxScore: 10,
                isCorrect,
                feedback,
            });

            totalScore += score;
        }

        // 레벨 결정
        let userLevel = 0;
        if (totalScore >= 90) userLevel = 4; // 90점 이상: 고급
        else if (totalScore >= 75) userLevel = 3; // 75점 이상: 중상급
        else if (totalScore >= 60) userLevel = 2; // 60점 이상: 중급
        else if (totalScore >= 40) userLevel = 1; // 40점 이상: 초중급
        else userLevel = 0; // 40점 미만: 초급

        // DB에 사용자 레벨 정보 저장
        try {
            const { User } = await import("../models/index.js");
            await User.update(
                {
                    currentLevel: userLevel,
                    levelTestCompleted: true,
                    levelTestScore: totalScore,
                    levelTestDate: new Date()
                },
                {
                    where: { id: userId }
                }
            );
        } catch (dbError) {
            console.error("DB update error:", dbError);
            // DB 업데이트 실패해도 결과는 반환
        }

        // 세션에 결과 저장 (결과 페이지에서 조회용)
        const sessionId = `${userId}_${Date.now()}`;
        testSessions.set(sessionId, {
            userId,
            totalScore,
            userLevel,
            results,
            timestamp: Date.now(),
        });

        res.json({
            success: true,
            sessionId,
            totalScore,
            maxScore,
            userLevel,
            levelName: getLevelName(userLevel),
            levelDescription: getLevelDescription(userLevel),
            results,
            feedback: generateOverallFeedback(totalScore, userLevel, results),
        });
    } catch (error) {
        console.error("Level test submission error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to process level test submission",
        });
    }
});

// 사용자의 레벨테스트 결과 조회 (세션에서)
router.get("/api/level-test/result/:sessionId", authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const result = testSessions.get(sessionId);

        if (!result) {
            return res.status(404).json({
                success: false,
                error: "Result not found or expired",
            });
        }

        // 사용자 확인
        if (result.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: "Unauthorized access",
            });
        }

        res.json({
            success: true,
            currentLevel: result.userLevel,
            totalScore: result.totalScore,
            levelName: getLevelName(result.userLevel),
            levelDescription: getLevelDescription(result.userLevel),
            detailedResults: result.results,
            testDate: new Date(result.timestamp),
        });
    } catch (error) {
        console.error("Level test result error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch level test result",
        });
    }
});

// GPT를 사용한 평가 함수
async function evaluateWithGPT(questionType, questionText, userAnswer, expectedAnswer) {
    try {
        const prompt =
            questionType === "speaking"
                ? `한국어 말하기 평가를 수행합니다.

        문제: ${questionText}
        예상 답변: "${expectedAnswer}"
        사용자 답변: "${userAnswer}"

        다음 기준으로 0-5점 사이로 평가하세요:
        - 문법 정확도 (40%)
        - 의미 전달 (40%)
        - 상황 적절성 (20%)

        JSON 형식으로 응답:
        {
          "score": 총점(0-5),
          "feedback": "구체적인 피드백",
          "strengths": ["잘한 점1", "잘한 점2"],
          "improvements": ["개선점1", "개선점2"],
          "correctedAnswer": "수정된 답변 (있다면)"
        }`
                : `한국어 단답형 평가를 수행합니다.

        문제: ${questionText}
        예상 답변: "${expectedAnswer}"
        사용자 답변: "${userAnswer}"

        다음 기준으로 0-5점 사이로 평가하세요:
        - 문법 정확도 (30%)
        - 어휘 사용 (30%)
        - 내용 완성도 (40%)

        JSON 형식으로 응답:
        {
          "score": 총점(0-5),
          "feedback": "구체적인 피드백",
          "strengths": ["잘한 점1"],
          "improvements": ["개선점1"],
          "correctedAnswer": "수정된 답변"
        }`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "당신은 친절한 한국어 교육 전문가입니다. 이주 노동자의 실용적인 한국어 능력을 평가합니다.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.3,
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("GPT evaluation error:", error);
        return {
            score: 0,
            feedback: {
                message: "평가 중 오류가 발생했습니다",
                error: error.message,
            },
        };
    }
}

// 전체 피드백 생성
function generateOverallFeedback(totalScore, level, results) {
    const strengths = [];
    const weaknesses = [];

    // 영역별 점수 계산
    const typeScores = {};
    for (const result of results) {
        if (!typeScores[result.questionType]) {
            typeScores[result.questionType] = { total: 0, count: 0 };
        }
        typeScores[result.questionType].total += result.score;
        typeScores[result.questionType].count++;
    }

    // 강점과 약점 분석
    for (const [type, scores] of Object.entries(typeScores)) {
        const average = scores.total / scores.count;
        const typeName = getQuestionTypeName(type);

        if (average >= 15) {
            strengths.push(`${typeName} 능력이 우수합니다`);
        } else if (average < 10) {
            weaknesses.push(`${typeName} 능력을 더 연습하세요`);
        }
    }

    return {
        strengths,
        weaknesses,
        recommendation: getRecommendation(level),
        encouragement: getEncouragement(totalScore),
    };
}

// RTZR 토큰 관리
let tokenCache = {
    token: null,
    expireAt: null,
};

async function getRTZRToken() {
    try {
        const now = Date.now();
        if (tokenCache.token && tokenCache.expireAt && now < tokenCache.expireAt - 60000) {
            return tokenCache.token;
        }

        const response = await fetch("https://openapi.vito.ai/v1/authenticate", {
            method: "POST",
            headers: {
                accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.RTZR_CLIENT_ID,
                client_secret: process.env.RTZR_SECRET_KEY,
            }),
        });

        if (!response.ok) {
            throw new Error(`RTZR auth failed: ${response.status}`);
        }

        const data = await response.json();
        tokenCache.token = data.access_token;
        tokenCache.expireAt = now + data.expire_at * 1000;

        return data.access_token;
    } catch (error) {
        console.error("RTZR token error:", error);
        return null;
    }
}

// RTZR API로 음성 파일 전송 및 STT 변환
async function transcribeAudioWithRTZR(audioBuffer, token) {
    try {
        const formData = new FormData();
        formData.append("file", audioBuffer, {
            filename: "audio.wav",
            contentType: "audio/wav",
        });
        formData.append("config", JSON.stringify({
            use_itn: false,
            use_disfluency_filter: false,
            use_profanity_filter: false,
            use_paragraph_splitter: false,
            use_punctuation: true,
            domain: "CALL"
        }));

        console.log("Sending request to RTZR API...");

        const uploadResponse = await fetch("https://openapi.vito.ai/v1/transcribe", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders(),
            },
            body: formData,
        });

        console.log("RTZR upload response status:", uploadResponse.status);

        if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error("RTZR upload error response:", errorText);
            throw new Error(`RTZR upload failed: ${uploadResponse.status} - ${errorText}`);
        }

        const uploadData = await uploadResponse.json();
        console.log("RTZR upload data:", uploadData);
        const transcribeId = uploadData.id;

        // 전사 상태 확인
        let transcript = "";
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const statusResponse = await fetch(`https://openapi.vito.ai/v1/transcribe/${transcribeId}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                console.log("RTZR status:", statusData.status);

                if (statusData.status === "completed") {
                    if (statusData.results && statusData.results.utterances) {
                        transcript = statusData.results.utterances.map((utterance) => utterance.msg).join(" ");
                    }
                    break;
                } else if (statusData.status === "failed") {
                    console.error("RTZR transcription failed:", statusData);
                    throw new Error("Transcription failed");
                }
            }

            attempts++;
        }

        if (attempts >= maxAttempts) {
            console.error("RTZR transcription timeout");
            return "";
        }

        console.log("RTZR transcript:", transcript);
        return transcript;
    } catch (error) {
        console.error("RTZR transcription error:", error);
        return "";
    }
}

// 헬퍼 함수들
function getLevelName(level) {
    const names = {
        0: "초급",
        1: "초중급",
        2: "중급",
        3: "중상급",
        4: "고급",
    };
    return names[level] || "초급";
}

function getLevelDescription(level) {
    const descriptions = {
        0: "기초 한글과 간단한 인사말을 할 수 있는 단계",
        1: "일상 생활에서 기본적인 의사소통이 가능한 단계",
        2: "직장에서 기본적인 업무 대화가 가능한 단계",
        3: "복잡한 상황 설명과 의견 표현이 가능한 단계",
        4: "전문적인 주제로 유창한 대화가 가능한 단계",
    };
    return descriptions[level] || descriptions[0];
}

function getQuestionTypeName(type) {
    const names = {
        listening: "듣기",
        reading: "읽기",
        short_answer: "쓰기",
        speaking: "말하기",
    };
    return names[type] || type;
}

function getRecommendation(level) {
    const recommendations = {
        0: "한글 자모와 기초 단어 학습을 추천합니다",
        1: "일상 회화 표현과 기초 문법을 학습하세요",
        2: "직장 상황 대화와 중급 문법을 연습하세요",
        3: "비즈니스 한국어와 고급 표현을 익히세요",
        4: "전문 분야 어휘와 토론 연습을 해보세요",
    };
    return recommendations[level] || recommendations[0];
}

function getEncouragement(score) {
    if (score >= 90) return "훌륭합니다! 한국어 실력이 매우 뛰어나십니다! 👏";
    if (score >= 75) return "잘하셨습니다! 조금만 더 노력하면 완벽해질 거예요! 💪";
    if (score >= 60) return "좋습니다! 꾸준히 연습하면 더 발전할 수 있어요! 😊";
    if (score >= 40) return "괜찮아요! 기초를 다지면 금방 실력이 늘 거예요! 🌱";
    return "처음이라 어려우셨죠? 차근차근 함께 공부해요! 🤝";
}

export default router;
