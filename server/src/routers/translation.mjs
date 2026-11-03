import express from "express";
import { OpenAI } from "openai";
import authMiddleware from "../middlewares/auth.mjs";

const router = express.Router();
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 번역 API
router.post("/translate", authMiddleware, async (req, res) => {
    try {
        const { text, targetLanguage } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "번역할 텍스트가 필요합니다.",
            });
        }

        const prompt = `다음 한국어 텍스트를 ${targetLanguage || "Vietnamese"}로 자연스럽게 번역해주세요.
원문의 뜻과 톤을 최대한 유지하면서 번역해주세요.

한국어 원문:
${text}

번역:`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `당신은 전문 번역가입니다. 한국어를 ${targetLanguage || "Vietnamese"}로 정확하고 자연스럽게 번역합니다.`,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
            max_tokens: 500,
        });

        const translation = completion.choices[0]?.message?.content?.trim();

        res.json({
            success: true,
            translation: translation,
            originalText: text,
            targetLanguage: targetLanguage || "Vietnamese",
        });
    } catch (error) {
        console.error("Translation error:", error);
        res.status(500).json({
            success: false,
            message: "번역 중 오류가 발생했습니다.",
            error: error.message,
        });
    }
});

// 발음 평가와 함께 번역 제공 (음성 인식 후 번역)
router.post("/translate-with-evaluation", authMiddleware, async (req, res) => {
    try {
        const { originalText, userText } = req.body;

        // 사용자 발음 텍스트를 베트남어로 번역
        const userTranslation = await translateText(userText, "Vietnamese");

        // 원본 텍스트도 베트남어로 번역
        const originalTranslation = await translateText(originalText, "Vietnamese");

        res.json({
            success: true,
            userTranslation,
            originalTranslation,
            comparison: {
                korean: {
                    original: originalText,
                    user: userText,
                },
                vietnamese: {
                    original: originalTranslation,
                    user: userTranslation,
                },
            },
        });
    } catch (error) {
        console.error("Translation with evaluation error:", error);
        res.status(500).json({
            success: false,
            message: "번역 및 평가 중 오류가 발생했습니다.",
        });
    }
});

// 번역 헬퍼 함수
async function translateText(text, targetLanguage) {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `You are a professional translator. Translate Korean to ${targetLanguage} accurately and naturally.`,
                },
                {
                    role: "user",
                    content: `Translate this Korean text to ${targetLanguage}: ${text}`,
                },
            ],
            temperature: 0.3,
            max_tokens: 200,
        });

        return completion.choices[0]?.message?.content?.trim();
    } catch (error) {
        console.error("Translation helper error:", error);
        return null;
    }
}

export default router;
