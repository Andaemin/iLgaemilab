import express from 'express';
import authMiddleware from '../middlewares/auth.mjs';
import { SpeakingScenario, PracticeSession, SpeakingHistory, User } from '../models/index.js';
import IntegratedSpeakingService from '../services/integratedSpeakingService.js';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// 오디오 파일 업로드 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}.webm`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB 제한
  }
});

// 통합 서비스 인스턴스
const integratedService = new IntegratedSpeakingService();

// OpenAI 인스턴스 (TTS용)
import OpenAI from 'openai';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 시나리오 목록 조회 (개발 중 인증 선택적)
router.get('/scenarios', async (req, res) => {
  try {
    const { category, difficulty } = req.query;

    const where = { isActive: true };
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const scenarios = await SpeakingScenario.findAll({
      where,
      order: [['sortOrder', 'ASC']],
    });

    res.json({
      success: true,
      scenarios
    });
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    res.status(500).json({
      success: false,
      message: '시나리오 목록을 불러오는데 실패했습니다.'
    });
  }
});

// 시나리오 상세 조회 (개발 중 인증 선택적)
router.get('/scenarios/:id', async (req, res) => {
  try {
    const scenario = await SpeakingScenario.findByPk(req.params.id);

    if (!scenario) {
      return res.status(404).json({
        success: false,
        message: '시나리오를 찾을 수 없습니다.'
      });
    }

    res.json({
      success: true,
      scenario
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    res.status(500).json({
      success: false,
      message: '시나리오를 불러오는데 실패했습니다.'
    });
  }
});

// 대화형 연습 세션 시작 (카테고리 기반)
router.post('/sessions/start', async (req, res) => {
  try {
    const { category, difficulty = 'beginner' } = req.body;
    const userId = req.user?.id || 1; // 개발 중 기본값

    // 통합 서비스로 대화 시작 (카테고리 기반)
    const conversationResult = await integratedService.startConversation(category, userId, difficulty);

    res.json({
      success: true,
      sessionId: conversationResult.sessionId,
      message: conversationResult.message,
      turnCount: conversationResult.turnCount,
      category: conversationResult.category,
      difficulty: conversationResult.difficulty
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: '세션을 시작하는데 실패했습니다.'
    });
  }
});

// 사용자 응답 처리 (텍스트만 - 음성은 클라이언트에서 STT 처리)
router.post('/sessions/:sessionId/respond', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userMessage } = req.body;

    // 통합 서비스로 응답 처리 (텍스트만)
    const response = await integratedService.processUserResponse(
      sessionId,
      userMessage
    );

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

// 전체 대화 분석 (간소화 버전)
router.post('/sessions/:sessionId/analyze', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // 통합 서비스로 전체 대화 분석
    const analysis = await integratedService.analyzeFullConversation(sessionId);

    // 세션 정리
    integratedService.clearSession(sessionId);

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

// 세션 종료
router.post('/sessions/:sessionId/end', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.id || 1; // 개발 중 기본값

    const session = await PracticeSession.findOne({
      where: { sessionId, status: 'in_progress' }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: '진행 중인 세션을 찾을 수 없습니다.'
      });
    }

    await session.update({
      status: 'completed',
      endTime: new Date()
    });

    // 세션 통계 계산
    const history = await SpeakingHistory.findAll({
      where: { sessionId: session.id }
    });

    const stats = {
      totalAttempts: history.length,
      averageScore: session.averageScore || 0,
      completedDialogues: session.dialoguesCompleted?.length || 0,
      duration: Math.floor((new Date() - new Date(session.startTime)) / 1000)
    };

    res.json({
      success: true,
      message: '세션이 종료되었습니다.',
      stats
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      success: false,
      message: '세션 종료에 실패했습니다.'
    });
  }
});

// 학습 기록 조회
router.get('/history', async (req, res) => {
  try {
    const userId = req.user?.id || 1;
    const { limit = 10, offset = 0 } = req.query;

    const sessions = await PracticeSession.findAll({
      where: { userId, status: 'completed' },
      include: [{
        model: SpeakingScenario,
        as: 'scenario',
        attributes: ['id', 'titleKo', 'category', 'difficulty']
      }],
      order: [['endTime', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await PracticeSession.count({
      where: { userId, status: 'completed' }
    });

    res.json({
      success: true,
      sessions,
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: '학습 기록을 불러오는데 실패했습니다.'
    });
  }
});

// 통계 조회
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id || 1;

    const totalSessions = await PracticeSession.count({
      where: { userId, status: 'completed' }
    });

    const sessions = await PracticeSession.findAll({
      where: { userId, status: 'completed' },
      attributes: ['averageScore', 'totalAttempts']
    });

    const averageScore = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.averageScore || 0), 0) / sessions.length
      : 0;

    const totalAttempts = sessions.reduce((sum, s) => sum + s.totalAttempts, 0);

    // 카테고리별 통계
    const categoryStats = await SpeakingScenario.findAll({
      attributes: ['category'],
      include: [{
        model: PracticeSession,
        as: 'sessions',
        where: { userId, status: 'completed' },
        attributes: ['averageScore'],
        required: false
      }],
      group: ['category']
    });

    res.json({
      success: true,
      stats: {
        totalSessions,
        averageScore: Math.round(averageScore),
        totalAttempts,
        categoryStats: categoryStats.map(cat => ({
          category: cat.category,
          sessions: cat.sessions?.length || 0,
          averageScore: cat.sessions?.length > 0
            ? Math.round(cat.sessions.reduce((sum, s) => sum + s.averageScore, 0) / cat.sessions.length)
            : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: '통계를 불러오는데 실패했습니다.'
    });
  }
});

// TTS 음성 생성
router.post('/tts', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: '텍스트가 필요합니다.'
      });
    }

    // OpenAI TTS API 호출
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy", // alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 0.9 // 약간 천천히
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // 오디오 응답 전송
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.length,
    });
    res.send(buffer);
  } catch (error) {
    console.error('Error generating TTS:', error);
    res.status(500).json({
      success: false,
      message: 'TTS 생성에 실패했습니다.'
    });
  }
});

export default router;