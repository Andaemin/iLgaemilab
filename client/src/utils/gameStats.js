import axios from 'axios';

/**
 * 게임 플레이 로그 기록
 * @param {String} gameType - 게임 종류
 * @returns {Promise} API 응답
 */
export const logGamePlay = async (gameType) => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';

    // 세션 ID 생성 (중복 카운트 방지용)
    // 브라우저 세션 스토리지에 저장하여 같은 세션에서는 같은 ID 사용
    let sessionId = sessionStorage.getItem('game_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      sessionStorage.setItem('game_session_id', sessionId);
    }

    const response = await axios.post(`${API_URL}/api/game-stats/log`, {
      gameType,
      sessionId,
    });

    if (response.data.success) {
      console.log(`✅ 게임 플레이 로그 기록: ${gameType}`);
    }

    return response.data;
  } catch (error) {
    // 로그 기록 실패는 조용히 처리 (게임 플레이에 영향 없도록)
    console.warn('게임 플레이 로그 기록 실패:', error.message);
    return null;
  }
};

/**
 * 게임 타입 매핑 (라우트명 -> API 게임 타입)
 */
export const GAME_TYPE_MAP = {
  'initial-consonant': 'initial_consonant',
  'word-chain': 'word_chain',
  'spelling-quiz': 'spelling_quiz',
  'typer': 'typer',
  'bingo': 'bingo',
  'crossword': 'crossword_puzzle',
};
