import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

class RTZRPronunciationService {
  constructor() {
    this.apiKey = process.env.RTZR_API_KEY;
    this.websocket = null;
    this.sessionConfig = null;
    this.evaluationResolve = null;
    this.evaluationReject = null;
  }

  async startSession(referenceText, language = 'ko-KR') {
    return new Promise((resolve, reject) => {
      try {
        // WebSocket 연결 초기화
        this.websocket = new WebSocket('wss://api.rtzr.ai/v1/stream', {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        this.websocket.on('open', () => {
          console.log('RTZR WebSocket connected');

          // 세션 설정
          const config = {
            type: 'start',
            config: {
              language: language,
              reference_text: referenceText,
              return_phone_score: true,
              return_word_score: true,
              nbest: 5,
              speech_complete_timeout_ms: 3000,
              no_speech_timeout_ms: 10000
            }
          };

          this.sessionConfig = config.config;
          this.websocket.send(JSON.stringify(config));

          resolve({
            status: 'connected',
            sessionId: Date.now().toString()
          });
        });

        this.websocket.on('error', (error) => {
          console.error('RTZR WebSocket error:', error);
          reject(error);
        });

        this.websocket.on('message', (data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing RTZR message:', error);
          }
        });

        this.websocket.on('close', () => {
          console.log('RTZR WebSocket closed');
          this.websocket = null;
        });

      } catch (error) {
        console.error('Error starting RTZR session:', error);
        reject(error);
      }
    });
  }

  sendAudioChunk(audioData) {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    // 오디오 데이터 전송
    this.websocket.send(audioData);
  }

  async stopRecording() {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    // 녹음 종료 신호 전송
    this.websocket.send(JSON.stringify({
      type: 'stop'
    }));

    // 평가 결과 대기
    return new Promise((resolve, reject) => {
      this.evaluationResolve = resolve;
      this.evaluationReject = reject;

      // 타임아웃 설정 (30초)
      setTimeout(() => {
        if (this.evaluationReject) {
          this.evaluationReject(new Error('Evaluation timeout'));
          this.evaluationResolve = null;
          this.evaluationReject = null;
        }
      }, 30000);
    });
  }

  handleMessage(message) {
    console.log('RTZR message type:', message.type);

    switch (message.type) {
      case 'partial':
        // 부분 결과 처리 (실시간 피드백용)
        console.log('Partial result:', message.transcript);
        break;

      case 'final':
        // 최종 평가 결과 처리
        if (this.evaluationResolve) {
          const evaluation = this.parseEvaluation(message);
          this.evaluationResolve(evaluation);
          this.evaluationResolve = null;
          this.evaluationReject = null;
        }
        break;

      case 'error':
        // 에러 처리
        console.error('RTZR error:', message.error);
        if (this.evaluationReject) {
          this.evaluationReject(new Error(message.error));
          this.evaluationResolve = null;
          this.evaluationReject = null;
        }
        break;

      default:
        console.log('Unknown message type:', message.type);
    }
  }

  parseEvaluation(message) {
    return {
      transcript: message.transcript || '',
      overallScore: message.pronunciation_score || 0,
      wordScores: message.word_scores || [],
      phoneScores: message.phone_scores || [],
      duration: message.duration || 0,
      confidence: message.confidence || 0,
      suggestions: this.generateSuggestions(message),
      rawData: message
    };
  }

  generateSuggestions(evaluation) {
    const suggestions = [];

    // 점수가 낮은 단어 찾기
    if (evaluation.word_scores) {
      const poorWords = evaluation.word_scores
        .filter(word => word.score < 70)
        .map(word => word.word);

      if (poorWords.length > 0) {
        suggestions.push({
          type: 'word',
          message: `다음 단어들의 발음 연습이 필요합니다: ${poorWords.join(', ')}`,
          words: poorWords
        });
      }
    }

    // 전체 점수 기반 피드백
    if (evaluation.pronunciation_score) {
      if (evaluation.pronunciation_score >= 85) {
        suggestions.push({
          type: 'overall',
          message: '아주 좋은 발음입니다! 계속 연습하세요.',
          level: 'excellent'
        });
      } else if (evaluation.pronunciation_score >= 70) {
        suggestions.push({
          type: 'overall',
          message: '좋은 발음입니다. 조금 더 연습하면 완벽해질 거예요.',
          level: 'good'
        });
      } else if (evaluation.pronunciation_score >= 50) {
        suggestions.push({
          type: 'overall',
          message: '발음 연습이 더 필요합니다. 천천히 또박또박 말해보세요.',
          level: 'fair'
        });
      } else {
        suggestions.push({
          type: 'overall',
          message: '발음을 개선할 여지가 많습니다. 각 음절을 천천히 연습해보세요.',
          level: 'needsWork'
        });
      }
    }

    return suggestions;
  }

  closeSession() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}

export default RTZRPronunciationService;