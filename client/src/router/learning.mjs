import express from "express";
import authMiddleware from "../middlewares/auth.mjs";
import db from "../models/index.js";
import { Op } from "sequelize";

const router = express.Router();

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
                    { id: 1, title: "오늘의 레슨 완료하기", completed: false, points: 10, completionCount: 0 },
                    { id: 2, title: "단어 10개 학습하기", completed: false, points: 5, completionCount: 0 },
                    { id: 3, title: "발음 연습 5분", completed: false, points: 5, completionCount: 0 },
                    { id: 4, title: "복습 퀴즈 풀기", completed: false, points: 5, completionCount: 0 },
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

        // 완료된 태스크 수에 따라 학습 시간 업데이트
        if (completed) {
            progress.completedMinutes = Math.min(progress.targetMinutes, progress.completedMinutes + 5);
        } else {
            progress.completedMinutes = Math.max(0, progress.completedMinutes - 5);
        }

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

export default router;
