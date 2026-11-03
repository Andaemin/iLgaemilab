import express from 'express';
import { SpeakingScenario, PracticeSession, SpeakingHistory } from '../models/index.js';
import OpenAIConversationService from '../services/openaiConversationService.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// OpenAI 서비스 인스턴스
const conversationService = new OpenAIConversationService();

// 오디오 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/conversation');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `conversation-${uniqueSuffix}.webm`);
  }
});

const upload = multer({ storage: storage });

// 대화 시작
router.post('/start', async (req, res) => {
  try {
    const { scenarioId } = req.body;
    const userId = req.user?.id || 1;

    // 시나리오 조회
    const scenario = await SpeakingScenario.findByPk(scenarioId);
    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: '시나리오를 찾을 수 없습니다.'
      });
    }

    // OpenAI 대화 세션 시작
    const conversationResult = await conversationService.startConversation(scenario);

    // DB 세션 생성
    const session = await PracticeSession.create({
      userId,
      scenarioId,
      sessionId: conversationResult.sessionId,
      startTime: new Date(),
      status: 'in_progress',
      dialoguesCompleted: [],
      scores: []
    });

    res.json({
      success: true,
      sessionId: conversationResult.sessionId,
      message: conversationResult.message,
      turnCount: conversationResult.turnCount,
      scenario: {
        title: scenario.titleKo,
        context: scenario.context,
        difficulty: scenario.difficulty
      }
    });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({
      success: false,
      message: '대화를 시작하는데 실패했습니다.'
    });
  }
});

// 사용자 응답 처리
router.post('/respond', upload.single('audio'), async (req, res) => {
  try {
    const { sessionId, userMessage, audioTranscript } = req.body;
    const audioFile = req.file;
    const userId = req.user?.id || 1;

    // 세션 확인
    const session = await PracticeSession.findOne({
      where: { sessionId, status: 'in_progress' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '진행 중인 대화를 찾을 수 없습니다.'
      });
    }

    // OpenAI 응답 생성
    const response = await conversationService.processUserResponse(
      sessionId,
      userMessage || audioTranscript,
      audioTranscript
    );

    // 대화 기록 저장
    await SpeakingHistory.create({
      userId,
      sessionId: session.id,
      dialogueIndex: response.turnCount - 1,
      originalText: userMessage || audioTranscript,
      userTranscript: audioTranscript,
      audioUrl: audioFile ? `/uploads/conversation/${audioFile.filename}` : null
    });

    // 대화 완료 확인
    if (response.isComplete) {
      await session.update({
        status: 'completed',
        endTime: new Date(),
        totalAttempts: response.turnCount
      });
    }

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('Error processing response:', error);
    res.status(500).json({
      success: false,
      message: '응답 처리에 실패했습니다.'
    });
  }
});

// 대화 분석 및 평가
router.get('/analyze/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || 1;

    // 세션 확인
    const session = await PracticeSession.findOne({
      where: { sessionId },
      include: [{
        model: SpeakingScenario,
        as: 'scenario'
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.'
      });
    }

    // 대화 분석
    const analysis = await conversationService.analyzeConversation(sessionId);

    // 평가 결과 저장
    await session.update({
      averageScore: analysis.totalScore,
      feedback: JSON.stringify(analysis)
    });

    // 세션 정리
    conversationService.clearSession(sessionId);

    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    res.status(500).json({
      success: false,
      message: '대화 분석에 실패했습니다.'
    });
  }
});

// 진행 중인 대화 조회
router.get('/current/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await PracticeSession.findOne({
      where: { sessionId },
      include: [{
        model: SpeakingScenario,
        as: 'scenario'
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '세션을 찾을 수 없습니다.'
      });
    }

    // 대화 이력 조회
    const history = await SpeakingHistory.findAll({
      where: { sessionId: session.id },
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      session: {
        sessionId: session.sessionId,
        status: session.status,
        scenario: session.scenario,
        history: history.map(h => ({
          text: h.originalText,
          transcript: h.userTranscript,
          timestamp: h.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching current conversation:', error);
    res.status(500).json({
      success: false,
      message: '대화 조회에 실패했습니다.'
    });
  }
});

export default router;