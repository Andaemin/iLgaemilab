import express from "express";
import authMiddleware from "../middlewares/auth.mjs";
import db from "../models/index.js";
import { Op } from "sequelize";
import OpenAI from "openai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// ES modules에서 __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// OpenAI 초기화
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 오늘의 학습 목표 조회
router.get("/daily-goal", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // 오늘의 학습 진도 찾기 또는 생성
        let [progress, created] = await db.LearningProgress.findOrCreate({
            where: {
                userId,
                date: today,
            },
            defaults: {
                targetMinutes: 30,
                completedMinutes: 0,
                tasks: [
                    { id: 1, titleKey: "home.dailyGoal.completeLesson", completed: false, points: 10, completionCount: 0 },
                    { id: 2, titleKey: "home.dailyGoal.learnWords", completed: false, points: 5, completionCount: 0 },
                    { id: 3, titleKey: "home.dailyGoal.speakingPractice", completed: false, points: 5, completionCount: 0 },
                    { id: 4, titleKey: "home.dailyGoal.reviewQuiz", completed: false, points: 5, completionCount: 0 },
                ],
                streak: 0,
                totalTaskCompletions: 0,
            },
        });

        // 연속 학습일 계산
        if (created || progress.streak === 0) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            const yesterdayProgress = await db.LearningProgress.findOne({
                where: {
                    userId,
                    date: yesterdayStr,
                },
            });

            if (yesterdayProgress && yesterdayProgress.completedMinutes > 0) {
                // 어제 학습했으면 streak 증가
                progress.streak = (yesterdayProgress.streak || 0) + 1;
            } else {
                // 최근 학습 기록에서 streak 계산
                const recentProgress = await db.LearningProgress.findAll({
                    where: {
                        userId,
                        date: { [Op.lt]: today },
                        completedMinutes: { [Op.gt]: 0 },
                    },
                    order: [["date", "DESC"]],
                    limit: 30,
                });

                let streak = 0;
                let currentDate = new Date();
                currentDate.setDate(currentDate.getDate() - 1);

                for (const record of recentProgress) {
                    const recordDate = new Date(record.date);
                    const diffDays = Math.floor((currentDate - recordDate) / (1000 * 60 * 60 * 24));

                    if (diffDays === 0) {
                        streak++;
                        currentDate.setDate(currentDate.getDate() - 1);
                    } else {
                        break;
                    }
                }

                progress.streak = streak;
            }

            await progress.save();
        }

        // 오늘의 통계
        const stats = {
            lessonsCompleted: progress.lessonsCompleted || 0,
            wordsLearned: progress.wordsLearned || 0,
            pronunciationScore: progress.pronunciationScore || 0,
            quizScore: progress.quizScore || 0,
        };

        res.json({
            goal: {
                targetMinutes: progress.targetMinutes,
                completedMinutes: progress.completedMinutes,
                tasks: progress.tasks,
                streak: progress.streak,
                lastStudyDate: progress.date,
                totalTaskCompletions: progress.totalTaskCompletions || 0,
            },
            stats,
        });
    } catch (error) {
        console.error("Daily goal fetch error:", error);
        res.status(500).json({
            message: "학습 목표를 불러오는 중 오류가 발생했습니다",
            error: error.message,
        });
    }
});

// 태스크 업데이트
router.patch("/tasks/:taskId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId } = req.params;
        const { completed } = req.body;
        const today = new Date().toISOString().split("T")[0];

        const progress = await db.LearningProgress.findOne({
            where: {
                userId,
                date: today,
            },
        });

        if (!progress) {
            return res.status(404).json({ message: "오늘의 학습 기록을 찾을 수 없습니다" });
        }

        // 태스크 업데이트
        const tasks = progress.tasks || [];
        const taskIndex = tasks.findIndex((t) => t.id === parseInt(taskId));

        if (taskIndex === -1) {
            return res.status(404).json({ message: "태스크를 찾을 수 없습니다" });
        }

        // 완료 횟수 추적
        if (completed && !tasks[taskIndex].completed) {
            // 체크할 때만 카운트 증가
            tasks[taskIndex].completionCount = (tasks[taskIndex].completionCount || 0) + 1;
            progress.totalTaskCompletions = (progress.totalTaskCompletions || 0) + 1;
        }

        tasks[taskIndex].completed = completed;

        // 학습 시간은 태스크 체크와 별개로 관리 (제거)
        // completedMinutes는 addLearningTime API로만 업데이트

        progress.tasks = tasks;
        await progress.save();

        res.json({
            message: "태스크가 업데이트되었습니다",
            task: tasks[taskIndex],
            completedMinutes: progress.completedMinutes,
            totalTaskCompletions: progress.totalTaskCompletions || 0,
        });
    } catch (error) {
        console.error("Task update error:", error);
        res.status(500).json({
            message: "태스크 업데이트 중 오류가 발생했습니다",
            error: error.message,
        });
    }
});

// 레슨 완료 (오늘의 목표 태스크 자동 체크)
router.post("/complete-lesson", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date().toISOString().split("T")[0];

        console.log(`📚 레슨 완료 요청 - userId: ${userId}`);

        const [progress] = await db.LearningProgress.findOrCreate({
            where: {
                userId,
                date: today,
            },
            defaults: {
                targetMinutes: 30,
                completedMinutes: 0,
                tasks: [
                    { id: 1, titleKey: "home.dailyGoal.completeLesson", completed: false, points: 10, completionCount: 0 },
                    { id: 2, titleKey: "home.dailyGoal.learnWords", completed: false, points: 5, completionCount: 0 },
                    { id: 3, titleKey: "home.dailyGoal.speakingPractice", completed: false, points: 5, completionCount: 0 },
                    { id: 4, titleKey: "home.dailyGoal.reviewQuiz", completed: false, points: 5, completionCount: 0 },
                ],
            },
        });

        // lessonsCompleted 증가
        progress.lessonsCompleted = (progress.lessonsCompleted || 0) + 1;

        // 태스크 1번 (오늘의 레슨 완료하기) 자동 완료
        let tasks = progress.tasks || [];
        const lessonTaskIndex = tasks.findIndex(t => t.id === 1);

        if (lessonTaskIndex !== -1 && !tasks[lessonTaskIndex].completed) {
            tasks[lessonTaskIndex].completed = true;
            tasks[lessonTaskIndex].completionCount = (tasks[lessonTaskIndex].completionCount || 0) + 1;
            progress.totalTaskCompletions = (progress.totalTaskCompletions || 0) + 1;
            console.log(`✅ "오늘의 레슨 완료하기" 태스크 자동 체크`);
        }

        // Sequelize JSON 필드 업데이트를 위해 명시적으로 설정
        progress.set('tasks', tasks);
        progress.changed('tasks', true);

        console.log('📝 저장 전 tasks 상태:', JSON.stringify(tasks));

        await progress.save();

        // 저장 후 DB에서 다시 읽어서 확인
        await progress.reload();
        console.log('💾 저장 후 DB tasks 상태:', JSON.stringify(progress.tasks));

        console.log(`✅ 레슨 완료 처리 성공 - lessonsCompleted: ${progress.lessonsCompleted}`);

        res.json({
            message: "레슨이 완료되었습니다",
            lessonsCompleted: progress.lessonsCompleted,
            tasks: progress.tasks,
        });
    } catch (error) {
        console.error("Complete lesson error:", error);
        res.status(500).json({
            message: "레슨 완료 처리 중 오류가 발생했습니다",
            error: error.message,
        });
    }
});

// 학습 시간 추가
router.post("/add-time", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { minutes, source = "manual" } = req.body;
        const today = new Date().toISOString().split("T")[0];

        console.log(`Adding ${minutes} minutes from ${source} for user ${userId}`);

        const [progress] = await db.LearningProgress.findOrCreate({
            where: {
                userId,
                date: today,
            },
            defaults: {
                targetMinutes: 30,
                completedMinutes: 0,
                tasks: [],
            },
        });

        progress.completedMinutes = Math.min(
            300, // 최대 5시간
            progress.completedMinutes + minutes
        );

        await progress.save();

        res.json({
            message: "학습 시간이 추가되었습니다",
            completedMinutes: progress.completedMinutes,
            targetMinutes: progress.targetMinutes,
        });
    } catch (error) {
        console.error("Add time error:", error);
        res.status(500).json({
            message: "학습 시간 추가 중 오류가 발생했습니다",
            error: error.message,
        });
    }
});

// 학습 통계 업데이트
router.patch("/stats", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { lessonsCompleted, wordsLearned, pronunciationScore, quizScore } = req.body;
        const today = new Date().toISOString().split("T")[0];

        const [progress] = await db.LearningProgress.findOrCreate({
            where: {
                userId,
                date: today,
            },
            defaults: {
                targetMinutes: 30,
                completedMinutes: 0,
                tasks: [],
            },
        });

        if (lessonsCompleted !== undefined) progress.lessonsCompleted = lessonsCompleted;
        if (wordsLearned !== undefined) progress.wordsLearned = wordsLearned;
        if (pronunciationScore !== undefined) progress.pronunciationScore = pronunciationScore;
        if (quizScore !== undefined) progress.quizScore = quizScore;

        await progress.save();

        res.json({
            message: "학습 통계가 업데이트되었습니다",
            stats: {
                lessonsCompleted: progress.lessonsCompleted,
                wordsLearned: progress.wordsLearned,
                pronunciationScore: progress.pronunciationScore,
                quizScore: progress.quizScore,
            },
        });
    } catch (error) {
        console.error("Stats update error:", error);
        res.status(500).json({
            message: "통계 업데이트 중 오류가 발생했습니다",
            error: error.message,
        });
    }
});

// 레벨별 학습 진행도 조회
router.get("/level-progress", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        // 모든 레벨 진행도 조회
        const levelProgress = await db.LevelProgress.findAll({
            where: { userId },
            order: [['category', 'ASC'], ['level', 'ASC']]
        });

        // 카테고리별로 정리
        const progressMap = {
            beginner: [false, false, false, false, false],
            intermediate: [false, false, false, false, false],
            advanced: [false, false, false, false, false]
        };

        levelProgress.forEach(progress => {
            if (progress.isCompleted) {
                progressMap[progress.category][progress.level - 1] = true;
            }
        });

        res.json({
            success: true,
            progress: progressMap,
            details: levelProgress
        });
    } catch (error) {
        console.error("Level progress fetch error:", error);
        res.status(500).json({
            success: false,
            message: "레벨 진행도 조회 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 레벨 완료 처리
router.post("/complete-level", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, level, quizScore, timeSpent } = req.body;

        console.log(`📝 레벨 완료 요청 - userId: ${userId}, category: ${category}, level: ${level}`);

        // 유효성 검사
        if (!category || !level) {
            return res.status(400).json({
                success: false,
                message: "카테고리와 레벨 정보가 필요합니다"
            });
        }

        // 사용자 존재 여부 확인
        const user = await db.User.findByPk(userId);
        if (!user) {
            console.error(`❌ 사용자를 찾을 수 없음: userId=${userId}`);
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다. 다시 로그인해주세요."
            });
        }

        console.log(`✅ 사용자 확인 완료: ${user.username || user.email}`);

        // 레벨 진행도 생성 또는 업데이트
        const [progress, created] = await db.LevelProgress.findOrCreate({
            where: {
                userId,
                category,
                level
            },
            defaults: {
                isCompleted: true,
                completedAt: new Date(),
                quizScore: quizScore || 0,
                timeSpent: timeSpent || 0,
                lastAccessedAt: new Date()
            }
        });

        if (!created && !progress.isCompleted) {
            // 기존 레코드가 있고 완료되지 않은 경우 업데이트
            progress.isCompleted = true;
            progress.completedAt = new Date();
            progress.quizScore = quizScore || progress.quizScore;
            progress.timeSpent = (progress.timeSpent || 0) + (timeSpent || 0);
            progress.lastAccessedAt = new Date();
            await progress.save();
        }

        // 오늘의 학습 진도도 업데이트
        const today = new Date().toISOString().split("T")[0];
        const [dailyProgress] = await db.LearningProgress.findOrCreate({
            where: {
                userId,
                date: today
            },
            defaults: {
                targetMinutes: 30,
                completedMinutes: 0,
                lessonsCompleted: 0,
                tasks: []
            }
        });

        dailyProgress.lessonsCompleted = (dailyProgress.lessonsCompleted || 0) + 1;
        dailyProgress.completedMinutes = Math.min(
            300,
            dailyProgress.completedMinutes + Math.floor((timeSpent || 0) / 60)
        );
        await dailyProgress.save();

        res.json({
            success: true,
            message: "레벨을 완료했습니다",
            progress,
            dailyProgress: {
                lessonsCompleted: dailyProgress.lessonsCompleted,
                completedMinutes: dailyProgress.completedMinutes
            }
        });
    } catch (error) {
        console.error("Complete level error:", error);
        res.status(500).json({
            success: false,
            message: "레벨 완료 처리 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 특정 레벨 학습 시작/재개
router.post("/start-level", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, level } = req.body;

        console.log(`📖 레벨 시작 요청 - userId: ${userId}, category: ${category}, level: ${level}`);

        // 사용자 존재 여부 확인
        const user = await db.User.findByPk(userId);
        if (!user) {
            console.error(`❌ 사용자를 찾을 수 없음: userId=${userId}`);
            return res.status(404).json({
                success: false,
                message: "사용자를 찾을 수 없습니다. 다시 로그인해주세요."
            });
        }

        console.log(`✅ 사용자 확인 완료: ${user.name || user.email}`);

        // 레벨 진행도 생성 또는 업데이트
        const [progress, created] = await db.LevelProgress.findOrCreate({
            where: {
                userId,
                category,
                level
            },
            defaults: {
                isCompleted: false,
                lastAccessedAt: new Date()
            }
        });

        if (!created) {
            progress.lastAccessedAt = new Date();
            await progress.save();
        }

        res.json({
            success: true,
            message: created ? "레벨 학습을 시작합니다" : "레벨 학습을 재개합니다",
            progress
        });
    } catch (error) {
        console.error("Start level error:", error);
        res.status(500).json({
            success: false,
            message: "레벨 시작 처리 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 마무리 테스트 완료 처리
router.post("/final-test-complete", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, score, totalQuestions } = req.body;

        if (!category || score === undefined || !totalQuestions) {
            return res.status(400).json({
                success: false,
                message: "필수 파라미터가 누락되었습니다"
            });
        }

        const percentage = Math.round((score / totalQuestions) * 100);
        const passed = percentage >= 80;

        console.log(`📝 Final test completion: User ${userId}, Category ${category}, Score: ${score}/${totalQuestions} (${percentage}%), Passed: ${passed}`);

        // Level 0 is used to store final test completion status for each category
        const [progress, created] = await db.LevelProgress.findOrCreate({
            where: {
                userId,
                category,
                level: 0  // Special level for final test
            },
            defaults: {
                isCompleted: passed,
                quizScore: score,
                completedAt: passed ? new Date() : null
            }
        });

        if (!created) {
            // 이미 통과한 경우에는 실패해도 통과 상태 유지
            const alreadyPassed = progress.isCompleted;

            if (alreadyPassed && !passed) {
                // 이미 통과했는데 이번에 실패한 경우 - 통과 상태 유지
                console.log(`🔒 이미 통과한 테스트 - 실패해도 통과 상태 유지 (category: ${category})`);
                // isCompleted와 completedAt은 유지, 점수만 업데이트 안함
            } else {
                progress.isCompleted = passed;
                progress.quizScore = score;
                progress.completedAt = passed ? new Date() : progress.completedAt;
            }
            await progress.save();
        }

        res.json({
            success: true,
            message: passed ? "마무리 테스트를 통과했습니다!" : "마무리 테스트를 완료했습니다",
            passed,
            score,
            totalQuestions,
            percentage
        });
    } catch (error) {
        console.error("Final test completion error:", error);
        res.status(500).json({
            success: false,
            message: "마무리 테스트 완료 처리 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 마무리 테스트 통과 여부 확인
router.get("/final-test-status/:category", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;

        const progress = await db.LevelProgress.findOne({
            where: {
                userId,
                category,
                level: 0  // Special level for final test
            }
        });

        res.json({
            success: true,
            passed: progress ? progress.isCompleted : false,
            score: progress ? progress.quizScore : null
        });
    } catch (error) {
        console.error("Final test status check error:", error);
        res.status(500).json({
            success: false,
            message: "마무리 테스트 상태 확인 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 마무리 테스트 문제 생성 (AI - 개인화)
router.get("/final-test/:category", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.params;

        console.log(`🎯 마무리 테스트 문제 생성 시작 - userId: ${userId}, category: ${category}`);

        // 카테고리 정보
        const categoryInfo = {
            beginner: {
                title: "초급",
                description: "자기소개, 인사, 생활 필수 표현",
                topics: [
                    "기본 인사와 자기소개",
                    "숫자와 시간 표현",
                    "장소와 위치",
                    "일상 생활 회화",
                    "감정·기분 표현"
                ]
            },
            intermediate: {
                title: "중급",
                description: "일상 대화 확장, 간단한 의견 표현",
                topics: [
                    "가족·친구 소개",
                    "날씨와 계절",
                    "취미와 여가 활동",
                    "병원·건강 표현",
                    "간단한 의견·감정 표현"
                ]
            },
            advanced: {
                title: "상급",
                description: "간단한 사회적 대화, 의견 교환",
                topics: [
                    "길 묻기와 안내하기",
                    "직장·업무 관련 표현",
                    "문화·명절·사회생활",
                    "문제 상황 대처",
                    "자기 생각·희망 표현"
                ]
            }
        };

        const currentCategory = categoryInfo[category];
        if (!currentCategory) {
            return res.status(400).json({
                success: false,
                message: "유효하지 않은 카테고리입니다"
            });
        }

        // ===== 사용자의 이전 학습 데이터 수집 =====
        console.log('📚 사용자 학습 데이터 수집 중...');

        // 1. 해당 카테고리의 완료된 레벨 정보
        const completedLevels = await db.LevelProgress.findAll({
            where: {
                userId,
                category,
                level: { [Op.between]: [1, 5] },
                isCompleted: true
            },
            order: [['level', 'ASC']]
        });

        // 2. 오답 노트 (해당 카테고리)
        const wrongAnswers = await db.WrongAnswer.findAll({
            where: {
                userId,
                category,
                isReviewed: false
            },
            order: [['createdAt', 'DESC']],
            limit: 10
        });

        // 3. 최근 학습 세션 정보 (발음 점수 등)
        const recentSessions = await db.LearningSession.findAll({
            where: {
                userId
            },
            order: [['createdAt', 'DESC']],
            limit: 20
        });

        // 학습 데이터 요약 생성
        const learningDataSummary = {
            completedLevels: completedLevels.map(level => ({
                level: level.level,
                topic: currentCategory.topics[level.level - 1],
                quizScore: level.quizScore,
                timeSpent: level.timeSpent
            })),
            weakTopics: wrongAnswers.map(wa => ({
                question: wa.question,
                correctAnswer: wa.correctAnswer,
                userAnswer: wa.userAnswer,
                topic: currentCategory.topics[wa.level - 1]
            })),
            averagePronunciationScore: recentSessions.length > 0
                ? Math.round(recentSessions.reduce((sum, s) => sum + (s.pronunciationScore || 0), 0) / recentSessions.length)
                : 0,
            totalLevelsCompleted: completedLevels.length
        };

        console.log(`  ✓ 완료 레벨: ${learningDataSummary.totalLevelsCompleted}개`);
        console.log(`  ✓ 오답 항목: ${wrongAnswers.length}개`);
        console.log(`  ✓ 평균 발음 점수: ${learningDataSummary.averagePronunciationScore}점`);

        // ===== 학습 데이터 로드 (해당 카테고리만) =====
        console.log('📖 학습 데이터 JSON 파일 로드 중...');
        const learningContent = [];

        // 성능 최적화: 해당 카테고리의 JSON만 로드
        for (let level = 1; level <= 5; level++) {
            try {
                const jsonPath = path.join(__dirname, '../data', `${category}_${level}.json`);
                const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
                learningContent.push({
                    level,
                    title: jsonData.title,
                    lessons: jsonData.lessons || []
                });
            } catch (error) {
                console.error(`  ✗ ${category}_${level}.json 로드 실패:`, error.message);
            }
        }

        console.log(`  ✓ 학습 데이터 ${learningContent.length}개 레벨 로드 완료 (${category} 카테고리만)`);

        // ===== AI로 개인화된 문제 생성 (병렬 처리로 속도 개선) =====
        console.log('🎲 개인화된 문제 생성 시작 (병렬 처리)...');

        // 각 주제별로 4문제씩 생성 (총 20문제) - 병렬 처리
        const questionGenerationPromises = currentCategory.topics.map(async (topic, i) => {
            const levelContent = learningContent[i];

            // 해당 주제의 오답 항목 찾기
            const topicWrongAnswers = wrongAnswers.filter(wa => wa.level === i + 1);

            // 해당 주제 레벨 정보
            const topicLevelInfo = completedLevels.find(level => level.level === i + 1);

            // 학습 데이터에서 모든 표현과 예문 추출
            const keyExpressions = [];
            const examples = [];

            if (levelContent && levelContent.lessons) {
                levelContent.lessons.forEach(lesson => {
                    if (lesson.expression) {
                        keyExpressions.push({
                            korean: lesson.expression.korean,
                            meaning: lesson.expression.meaning,
                            romanization: lesson.expression.romanization,
                            meaningVi: lesson.expression.meaningVi
                        });

                        // 예문도 수집
                        if (lesson.expression.examples && lesson.expression.examples.length > 0) {
                            lesson.expression.examples.forEach(ex => {
                                examples.push({
                                    korean: ex.korean,
                                    meaning: ex.meaning,
                                    meaningVi: ex.meaningVi
                                });
                            });
                        }
                    }
                });
            }

            // 학습한 표현 목록 생성
            const expressionList = keyExpressions.map(expr => expr.korean).join(", ");

            // AI 프롬프트 생성
            let prompt = `"${topic}" 주제로 ${currentCategory.title} 학습자를 위한 4지선다 문제 4개를 생성하세요.

**📚 학습한 표현 목록 (이 목록의 표현만 사용 가능!):**
${keyExpressions.map((expr, idx) => `${idx + 1}. "${expr.korean}" = ${expr.meaning} (${expr.meaningVi || ''})`).join("\n")}

**🔑 사용 가능한 표현 (정답과 선택지는 반드시 이 중에서만!):**
[${expressionList}]

${examples.length > 0 ? `**학습한 예문:**
${examples.slice(0, 5).map((ex, idx) => `${idx + 1}. "${ex.korean}" = ${ex.meaning}`).join("\n")}` : ''}

**🚨 가장 중요한 규칙: 학습한 표현만 사용!**

❌ 절대 금지 (학습 목록에 없는 표현):
- "속상해요", "기뻐요", "떨려요", "긴장돼요" 등 목록에 없는 표현
- 학습한 표현을 변형한 것 (예: "행복해요" → "행복합니다")
- 문제에 학습하지 않은 새로운 한국어 표현 사용

✅ 반드시 지켜야 할 규칙:
- 정답: 반드시 위 목록의 표현 중 하나
- 선택지 4개: 모두 위 목록의 표현에서만 선택
- 문제에 새로운 한국어 표현 사용 금지

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
- 단순히 문장만 제시하고 선택지를 나열하면 안 됩니다

**🚫 절대 만들지 말아야 할 문제:**

❌ 나쁜 예 1 (질문이 불명확):
- 문제: "Where are you going?"
- 선택지: ["어디", "여기", "저기", "거기"]
- 이유: 무엇을 물어보는지 불명확! "어디"가 왜 정답인지 알 수 없음

❌ 나쁜 예 2 (질문이 불명확):
- 문제: "The restroom is over there."
- 선택지: ["여기", "저기", "거기", "위"]
- 이유: 문장만 제시하면 무엇을 찾아야 하는지 모름

❌ 나쁜 예 3:
- 문제: "기분이 어때요? → ___"
- 이유: 여러 감정이 정답이 될 수 있음

❌ 나쁜 예 4:
- 선택지에 학습 목록에 없는 표현 포함

✅ 좋은 예 1:
- 문제: "다음 중 'I'm sad / Tôi buồn'를 의미하는 한국어 표현은 무엇인가요?"
- 선택지: ["행복해요", "슬퍼요", "화나요", "피곤해요"]
- 정답: 1 (슬퍼요)

✅ 좋은 예 2:
- 문제: "'여기'는 영어로 무슨 뜻인가요?"
- 선택지: ["here", "there", "over there", "where"]
- 정답: 0 (here)

JSON 형식:
{
  "questions": [
    {
      "question": "한국어 질문",
      "questionEn": "영어 질문",
      "options": ["학습한표현1", "학습한표현2", "학습한표현3", "학습한표현4"],
      "correctAnswer": 0-3,
      "explanation": "한국어 설명",
      "explanationEn": "영어 설명"
    }
  ]
}

**핵심: 정답과 선택지는 반드시 학습한 표현 목록에서만 선택하세요!**`;

            try {
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

JSON 형식으로만 응답하세요.`
                        },
                        { role: "user", content: prompt }
                    ],
                    temperature: 0.2,  // 더 낮춰서 규칙 준수 강화
                    max_tokens: 3000,
                    response_format: { type: "json_object" }
                });

                const data = JSON.parse(completion.choices[0].message.content);
                let topicQuestions = (data.questions || []).slice(0, 4);

                // correctAnswer 인덱스 검증 및 수정
                topicQuestions = topicQuestions.map((q, qIdx) => {
                    // correctAnswer가 숫자가 아니거나 범위를 벗어난 경우
                    if (typeof q.correctAnswer !== 'number' ||
                        q.correctAnswer < 0 ||
                        q.correctAnswer >= (q.options?.length || 4)) {
                        console.warn(`  ⚠️ 문제 ${qIdx + 1}의 correctAnswer 값이 유효하지 않음: ${q.correctAnswer}, 0으로 설정`);
                        q.correctAnswer = 0;
                    }

                    // correctAnswer를 정수로 변환 (소수점 방지)
                    q.correctAnswer = Math.floor(q.correctAnswer);

                    return q;
                });

                console.log(`  ✓ 주제 ${i+1}/5 "${topic}": ${topicQuestions.length}개 생성`);

                return topicQuestions;
            } catch (error) {
                console.error(`  ✗ 주제 ${i+1} 생성 오류:`, error.message);
                return [];
            }
        });

        // 모든 주제의 문제를 병렬로 생성 (Promise.all 사용)
        const questionResults = await Promise.all(questionGenerationPromises);

        // 결과 병합
        const allQuestions = questionResults.flat();

        console.log(`📊 총 ${allQuestions.length}개 문제 생성 완료 (병렬 처리로 ${questionResults.length}개 주제 동시 생성)`);

        // 정확히 20문제 확보
        if (allQuestions.length < 20) {
            console.error(`❌ 20문제 미만 생성됨: ${allQuestions.length}개`);
            return res.status(500).json({
                success: false,
                message: `문제 생성 실패 (${allQuestions.length}/20). 다시 시도해주세요.`
            });
        }

        const questions = allQuestions.slice(0, 20);
        console.log(`✅ 최종 20문제 전달 (개인화된 문제)`);

        res.json({
            success: true,
            questions: questions,
            category: currentCategory.title,
            personalized: true,
            learningStats: {
                completedLevels: learningDataSummary.totalLevelsCompleted,
                weakTopicsCount: wrongAnswers.length
            }
        });

    } catch (error) {
        console.error("Final test generation error:", error);
        res.status(500).json({
            success: false,
            message: "마무리 테스트 생성 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

// 마무리 테스트 결과 저장
router.post("/final-test-result", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const { category, score, totalQuestions, passed, wrongAnswers } = req.body;

        console.log(`📊 마무리 테스트 결과 저장 - userId: ${userId}, category: ${category}, score: ${score}/${totalQuestions}, passed: ${passed}`);

        // Level 0으로 마무리 테스트 결과 저장
        const [progress, created] = await db.LevelProgress.findOrCreate({
            where: {
                userId,
                category,
                level: 0  // 마무리 테스트용 특수 레벨
            },
            defaults: {
                isCompleted: passed,
                quizScore: score,
                completedAt: passed ? new Date() : null,
                lastAccessedAt: new Date()
            }
        });

        if (!created) {
            // 이미 통과한 경우에는 실패해도 통과 상태 유지
            // (재시도에서 실패해도 기존 통과 기록 보존)
            const alreadyPassed = progress.isCompleted;

            if (alreadyPassed && !passed) {
                // 이미 통과했는데 이번에 실패한 경우 - 통과 상태 유지
                console.log(`🔒 이미 통과한 테스트 - 실패해도 통과 상태 유지 (userId: ${userId}, category: ${category})`);
                progress.lastAccessedAt = new Date();
                // isCompleted와 completedAt은 유지
            } else {
                // 처음 시도이거나, 이번에 통과한 경우
                progress.isCompleted = passed;
                progress.quizScore = score;
                progress.completedAt = passed ? new Date() : progress.completedAt;
                progress.lastAccessedAt = new Date();
            }
            await progress.save();
        }

        // 오답 저장 (오답 노트에 기록)
        if (wrongAnswers && wrongAnswers.length > 0) {
            console.log(`❌ 오답 ${wrongAnswers.length}개 저장 중...`);

            for (const wrongAnswer of wrongAnswers) {
                try {
                    await db.WrongAnswer.create({
                        userId,
                        category,
                        level: wrongAnswer.level || 0,
                        questionType: 'level_test',
                        question: wrongAnswer.question,
                        questionEn: wrongAnswer.questionEn,
                        correctAnswer: wrongAnswer.correctAnswer,
                        userAnswer: wrongAnswer.userAnswer,
                        options: wrongAnswer.options,
                        explanation: wrongAnswer.explanation,
                        explanationEn: wrongAnswer.explanationEn,
                        isReviewed: false
                    });
                } catch (error) {
                    console.error('오답 저장 실패:', error.message);
                }
            }

            console.log(`✅ 오답 ${wrongAnswers.length}개 저장 완료`);
        }

        res.json({
            success: true,
            message: passed ? "축하합니다! 마무리 테스트를 통과했습니다!" : "마무리 테스트를 완료했습니다. 다시 도전해보세요!",
            passed,
            score,
            totalQuestions,
            wrongAnswersSaved: wrongAnswers ? wrongAnswers.length : 0
        });

    } catch (error) {
        console.error("Final test result save error:", error);
        res.status(500).json({
            success: false,
            message: "결과 저장 중 오류가 발생했습니다",
            error: error.message
        });
    }
});

export default router;
