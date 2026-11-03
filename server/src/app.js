import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { dirname } from "dirname-filename-esm";
import sequelize from "./database/connection.js";

// Import models to ensure associations are set up
import "./models/index.js";

import indexRouter from "./routers/index.js";
import usersRouter from "./routers/users.js";
import rtzrRouter from "./routers/rtzr.mjs";
import evalRouter from "./routers/eval.mjs";
import levelTestRouter from "./routers/levelTest.mjs";
import levelTestNewRouter from "./routers/levelTestNew.mjs";
import quickstartRouter from "./routers/quickstart.mjs";
import jobScenariosRouter from "./routers/jobScenarios.mjs";
import authRouter from "./routers/auth.mjs";
import learningRouter from "./routers/learning.mjs";
import wordValidationRouter from "./routers/wordValidation.mjs";
import speakingPracticeRouter from "./routers/speakingPractice.mjs";
import conversationPracticeRouter from "./routers/conversationPractice.mjs";
import translationRouter from "./routers/translation.mjs";
import wordChainRouter from "./routers/wordChain.mjs";

import wrongAnswersRouter from "./routers/wrongAnswers.mjs";
import bingoRouter from "./routers/bingo.mjs";
import progressSaveRouter from "./routers/progressSave.mjs";
import aiQuizRouter from "./routers/aiQuiz.mjs";
import gameScoreRouter from "./routers/gameScore.mjs";
import gameStatsRouter from "./routers/gameStats.mjs";
import antGrowthRouter from "./routers/antGrowth.mjs";
import profileRouter from "./routers/profile.mjs";

// App instance
const app = express();
const __dirname = dirname(import.meta);

// Database connection and sync
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully");

        // Fix foreign key constraints (only in production on first run)
        if (process.env.NODE_ENV === "production") {
            try {
                console.log("🔧 외래 키 제약 조건 확인 중...");

                // Try to drop existing foreign keys (ignore errors if they don't exist)
                try {
                    await sequelize.query(`ALTER TABLE level_progress DROP FOREIGN KEY level_progress_ibfk_1;`);
                    console.log("✅ level_progress 기존 외래 키 삭제");
                } catch (e) {
                    console.log("⚠️ level_progress 외래 키 삭제 스킵 (없거나 이미 삭제됨)");
                }

                try {
                    await sequelize.query(`ALTER TABLE learning_progress DROP FOREIGN KEY learning_progress_ibfk_1;`);
                    console.log("✅ learning_progress 기존 외래 키 삭제");
                } catch (e) {
                    console.log("⚠️ learning_progress 외래 키 삭제 스킵 (없거나 이미 삭제됨)");
                }

                try {
                    await sequelize.query(`
            ALTER TABLE level_progress
            ADD CONSTRAINT level_progress_ibfk_1
            FOREIGN KEY (userId) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
          `);
                    console.log("✅ level_progress 새 외래 키 생성 완료");
                } catch (e) {
                    console.log("⚠️ level_progress 외래 키 생성 스킵:", e.message);
                }

                try {
                    await sequelize.query(`
            ALTER TABLE learning_progress
            ADD CONSTRAINT learning_progress_ibfk_1
            FOREIGN KEY (userId) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
          `);
                    console.log("✅ learning_progress 새 외래 키 생성 완료");
                } catch (e) {
                    console.log("⚠️ learning_progress 외래 키 생성 스킵:", e.message);
                }

                console.log("✅ 외래 키 수정 프로세스 완료");
            } catch (fkError) {
                console.log("⚠️ 외래 키 수정 전체 스킵:", fkError.message);
            }
        }

        // Sync database in development
        if (process.env.NODE_ENV !== "production") {
            // 이거 주석 절대 풀지마. (대민)
            // await sequelize.sync({ force: true });
            //   console.log("📊 Database synchronized (force: true - 모든 테이블 재생성됨)");
            //   console.log("⚠️ 데이터가 모두 삭제되었습니다. 시드 데이터를 다시 넣으세요.");

            await sequelize.sync({ alter: false });
            console.log("📊 Database connection ready");
        }
    } catch (error) {
        console.error("❌ Database connection failed:", error);
    }
};

initDatabase();

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger(process.env.NODE_ENV === "production" ? "common" : "dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "..")));

// CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }
    next();
});

// Routes
app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/", rtzrRouter);
app.use("/", evalRouter);
// app.use("/", levelTestRouter); // Using new router instead
app.use("/", levelTestNewRouter);
app.use("/", quickstartRouter);
app.use("/", jobScenariosRouter);
app.use("/", authRouter);
app.use("/api/learning", learningRouter);
app.use("/", wordValidationRouter);
app.use("/api/speaking-practice", speakingPracticeRouter);
app.use("/api/conversation", conversationPracticeRouter);
app.use("/api", translationRouter);
app.use("/", wordChainRouter);
app.use("/api/wrong-answers", wrongAnswersRouter);
app.use("/api/bingo", bingoRouter);
app.use("/api/progress-save", progressSaveRouter);
app.use("/api/ai-quiz", aiQuizRouter);
app.use("/", gameScoreRouter);
app.use("/", gameStatsRouter);
app.use("/api/ant", antGrowthRouter);
app.use("/api/profile", profileRouter);

// 404 handler
app.use((req, res, next) => {
    const error = new Error("Not Found");
    error.status = 404;
    next(error);
});

// Error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    res.status(err.status || 500);
    res.render("error");
});

export default app;
