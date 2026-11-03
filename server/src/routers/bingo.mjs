import express from 'express';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * AI가 50개 단어 중 25개를 전략적으로 선택
 * POST /api/bingo/ai-select-words
 * Body: { words: string[] } - 50개 단어 배열
 * Response: { selectedWords: string[] } - AI가 선택한 25개 단어
 */
router.post('/ai-select-words', async (req, res) => {
  try {
    const { words } = req.body;

    if (!words || !Array.isArray(words) || words.length < 25) {
      return res.status(400).json({ error: '최소 25개 이상의 단어가 필요합니다.' });
    }

    const prompt = `당신은 빙고 게임의 전략적인 AI입니다.
다음 ${words.length}개의 한국어 단어 중에서 25개를 선택해야 합니다.

단어 목록:
${words.join(', ')}

선택 기준:
1. 다양한 카테고리의 단어를 골고루 선택하세요 (과일, 음식, 동물, 사물 등)
2. 자주 사용되는 일반적인 단어를 우선 선택하세요
3. 길이가 다양한 단어를 선택하세요 (2글자, 3글자, 4글자 등)
4. 서로 연관성이 있는 단어들을 함께 선택하면 좋습니다

JSON 형식으로만 응답하세요:
{
  "selectedWords": ["단어1", "단어2", ..., "단어25"]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '당신은 빙고 게임의 전략적인 AI입니다. 항상 JSON 형식으로만 응답합니다.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8
    });

    const responseText = completion.choices[0].message.content;
    const aiResponse = JSON.parse(responseText);

    // 25개가 맞는지 검증
    if (!aiResponse.selectedWords || aiResponse.selectedWords.length !== 25) {
      // 백업: 랜덤 선택
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      return res.json({ selectedWords: shuffled.slice(0, 25) });
    }

    res.json({ selectedWords: aiResponse.selectedWords });
  } catch (error) {
    console.error('AI 단어 선택 오류:', error);

    // 오류 시 랜덤 선택으로 폴백
    const shuffled = [...req.body.words].sort(() => Math.random() - 0.5);
    res.json({ selectedWords: shuffled.slice(0, 25) });
  }
});

/**
 * AI가 전략적으로 다음 단어를 선택 (하이브리드 방식)
 * POST /api/bingo/ai-turn
 * Body: {
 *   bingoBoard: Array<Array<{word: string, checked: boolean}>>, // AI의 5x5 빙고판
 *   userBoard: Array<Array<{word: string, checked: boolean}>>, // 사용자의 5x5 빙고판
 *   userLastWord: string // 사용자가 마지막으로 선택한 단어 (선택사항)
 * }
 * Response: { selectedWord: string, reasoning: string }
 */
router.post('/ai-turn', async (req, res) => {
  try {
    const { bingoBoard, userBoard, userLastWord } = req.body;

    if (!bingoBoard || !Array.isArray(bingoBoard) || bingoBoard.length !== 5) {
      return res.status(400).json({ error: '5x5 빙고판이 필요합니다.' });
    }

    // ===== 하이브리드 전략: 로직으로 최적 단어 선택 =====
    const bestWord = selectBestWordLogic(bingoBoard, userBoard);

    if (!bestWord) {
      return res.status(400).json({ error: '선택 가능한 단어가 없습니다.' });
    }

    // ===== GPT는 선택 이유만 생성 (선택사항) =====
    let reasoning = '전략적 선택';

    try {
      const aiBoardAnalysis = analyzeBingoBoard(bingoBoard);
      const wordInfo = getWordStrategicInfo(bingoBoard, bestWord);

      const prompt = `빙고 게임에서 AI가 "${bestWord}" 단어를 선택했습니다.

선택 이유:
- 이 단어는 ${wordInfo.lines.length}개 줄에 속해있습니다.
${wordInfo.lines.map(line => `  - ${line.type} ${line.index + 1}번줄: ${line.checkedCount}/5 완성`).join('\n')}

위 정보를 바탕으로 왜 이 단어를 선택했는지 짧고 명확하게 설명하세요.
예시: "가로 3번줄(4/5)과 세로 2번줄(3/5)의 교차점, 2줄 동시 공략"

JSON 형식으로만 응답:
{
  "reasoning": "선택 이유"
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '빙고 전략을 명확하고 간결하게 설명합니다. JSON 형식으로만 응답합니다.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 100
      });

      const responseText = completion.choices[0].message.content;
      const aiResponse = JSON.parse(responseText);
      reasoning = aiResponse.reasoning || reasoning;
    } catch (gptError) {
      console.log('GPT 설명 생성 실패, 기본 설명 사용:', gptError.message);
      // GPT 실패해도 로직으로 선택한 단어는 사용
    }

    res.json({
      selectedWord: bestWord,
      reasoning: reasoning
    });
  } catch (error) {
    console.error('AI 턴 오류:', error);

    // 오류 시 폴백 로직
    const bestWord = selectBestWordLogic(req.body.bingoBoard, req.body.userBoard);

    res.json({
      selectedWord: bestWord || '단어없음',
      reasoning: '전략적 선택'
    });
  }
});

/**
 * 빙고판 분석 함수
 */
function analyzeBingoBoard(board) {
  const rows = [];
  const cols = [];
  const uncheckedWords = [];

  // 가로줄 분석
  for (let i = 0; i < 5; i++) {
    const checkedCount = board[i].filter(cell => cell.checked).length;
    const unchecked = board[i].filter(cell => !cell.checked).map(cell => cell.word);
    rows.push({
      index: i,
      checkedCount,
      unchecked,
      completeness: checkedCount / 5
    });
    uncheckedWords.push(...unchecked);
  }

  // 세로줄 분석
  for (let j = 0; j < 5; j++) {
    const column = board.map(row => row[j]);
    const checkedCount = column.filter(cell => cell.checked).length;
    const unchecked = column.filter(cell => !cell.checked).map(cell => cell.word);
    cols.push({
      index: j,
      checkedCount,
      unchecked,
      completeness: checkedCount / 5
    });
  }

  // 대각선 분석 (왼쪽 위 → 오른쪽 아래)
  const diagonal1 = board.map((row, i) => row[i]);
  const diagonal1Checked = diagonal1.filter(cell => cell.checked).length;
  const diagonal1Unchecked = diagonal1.filter(cell => !cell.checked).map(cell => cell.word);

  // 대각선 분석 (오른쪽 위 → 왼쪽 아래)
  const diagonal2 = board.map((row, i) => row[4 - i]);
  const diagonal2Checked = diagonal2.filter(cell => cell.checked).length;
  const diagonal2Unchecked = diagonal2.filter(cell => !cell.checked).map(cell => cell.word);

  return {
    rows: rows.sort((a, b) => b.completeness - a.completeness),
    cols: cols.sort((a, b) => b.completeness - a.completeness),
    diagonals: [
      {
        type: 'main',
        checkedCount: diagonal1Checked,
        unchecked: diagonal1Unchecked,
        completeness: diagonal1Checked / 5
      },
      {
        type: 'anti',
        checkedCount: diagonal2Checked,
        unchecked: diagonal2Unchecked,
        completeness: diagonal2Checked / 5
      }
    ].sort((a, b) => b.completeness - a.completeness),
    uncheckedWords: [...new Set(uncheckedWords)] // 중복 제거
  };
}

/**
 * GPT를 위한 빙고판 포맷팅
 */
function formatBingoBoardForGPT(board) {
  return board.map((row, i) => {
    const rowStr = row.map(cell =>
      cell.checked ? `[${cell.word}]` : cell.word
    ).join(' | ');
    return `${i + 1}행: ${rowStr}`;
  }).join('\n');
}

/**
 * 각 단어의 전략적 가치 계산
 */
function calculateWordValues(board, analysis) {
  const wordValues = {};

  // 모든 체크 안 된 단어에 대해 가치 계산
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = board[i][j];
      if (!cell.checked) {
        let value = 0;

        // 가로줄 기여도
        const rowCompletion = analysis.rows.find(r => r.index === i);
        if (rowCompletion) {
          value += rowCompletion.checkedCount * 10; // 완성도가 높을수록 가치 증가
          if (rowCompletion.checkedCount === 4) value += 100; // 빙고 완성 가능하면 최고 가치
        }

        // 세로줄 기여도
        const colCompletion = analysis.cols.find(c => c.index === j);
        if (colCompletion) {
          value += colCompletion.checkedCount * 10;
          if (colCompletion.checkedCount === 4) value += 100;
        }

        // 대각선 기여도 (왼쪽 위 → 오른쪽 아래)
        if (i === j) {
          const diag = analysis.diagonals.find(d => d.type === 'main');
          if (diag) {
            value += diag.checkedCount * 15; // 대각선은 더 중요
            if (diag.checkedCount === 4) value += 100;
          }
        }

        // 대각선 기여도 (오른쪽 위 → 왼쪽 아래)
        if (i + j === 4) {
          const diag = analysis.diagonals.find(d => d.type === 'anti');
          if (diag) {
            value += diag.checkedCount * 15;
            if (diag.checkedCount === 4) value += 100;
          }
        }

        wordValues[cell.word] = value;
      }
    }
  }

  return wordValues;
}

/**
 * 폴백: 가장 완성에 가까운 줄의 단어 선택
 */
function selectBestWordFallback(board, analysis) {
  // 계산된 단어 가치를 기반으로 선택
  const wordValues = calculateWordValues(board, analysis);
  const sortedWords = Object.entries(wordValues)
    .sort(([, a], [, b]) => b - a);

  if (sortedWords.length > 0) {
    return sortedWords[0][0]; // 가장 높은 가치의 단어 반환
  }

  // 1순위: 가장 완성에 가까운 가로줄
  if (analysis.rows[0].unchecked.length > 0) {
    return analysis.rows[0].unchecked[0];
  }

  // 2순위: 가장 완성에 가까운 세로줄
  if (analysis.cols[0].unchecked.length > 0) {
    return analysis.cols[0].unchecked[0];
  }

  // 3순위: 가장 완성에 가까운 대각선
  if (analysis.diagonals[0].unchecked.length > 0) {
    return analysis.diagonals[0].unchecked[0];
  }

  // 마지막: 체크 안 된 단어 중 랜덤
  if (analysis.uncheckedWords.length > 0) {
    return analysis.uncheckedWords[Math.floor(Math.random() * analysis.uncheckedWords.length)];
  }

  // 모든 단어가 체크된 경우
  return null;
}

/**
 * 순수 로직으로 최적의 단어 선택 (하이브리드 전략의 핵심)
 */
function selectBestWordLogic(bingoBoard, userBoard) {
  const analysis = analyzeBingoBoard(bingoBoard);
  const userAnalysis = userBoard ? analyzeBingoBoard(userBoard) : null;

  // 체크 안 된 단어가 없으면 null 반환
  if (analysis.uncheckedWords.length === 0) {
    return null;
  }

  // 모든 단어의 전략적 가치 계산
  const wordScores = {};

  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const cell = bingoBoard[i][j];
      if (cell.checked) continue;

      let score = 0;
      let lineCount = 0;

      // 가로줄 점수
      const rowChecked = bingoBoard[i].filter(c => c.checked).length;
      if (rowChecked === 4) {
        score += 10000; // 빙고 완성 가능 - 최우선!
      } else if (rowChecked === 3) {
        score += 100; // 3개 체크된 줄
      } else if (rowChecked === 2) {
        score += 20;
      } else if (rowChecked === 1) {
        score += 5;
      }
      lineCount++;

      // 세로줄 점수
      const colChecked = bingoBoard.filter(row => row[j].checked).length;
      if (colChecked === 4) {
        score += 10000;
      } else if (colChecked === 3) {
        score += 100;
      } else if (colChecked === 2) {
        score += 20;
      } else if (colChecked === 1) {
        score += 5;
      }
      lineCount++;

      // 주 대각선 (왼쪽 위 → 오른쪽 아래)
      if (i === j) {
        const diag1Checked = bingoBoard.filter((row, idx) => row[idx].checked).length;
        if (diag1Checked === 4) {
          score += 15000; // 대각선은 더 중요
        } else if (diag1Checked === 3) {
          score += 150;
        } else if (diag1Checked === 2) {
          score += 30;
        } else if (diag1Checked === 1) {
          score += 10;
        }
        lineCount++;
      }

      // 반 대각선 (오른쪽 위 → 왼쪽 아래)
      if (i + j === 4) {
        const diag2Checked = bingoBoard.filter((row, idx) => row[4 - idx].checked).length;
        if (diag2Checked === 4) {
          score += 15000;
        } else if (diag2Checked === 3) {
          score += 150;
        } else if (diag2Checked === 2) {
          score += 30;
        } else if (diag2Checked === 1) {
          score += 10;
        }
        lineCount++;
      }

      // 여러 줄에 걸쳐있으면 보너스
      if (lineCount >= 3) {
        score += 50; // 3줄 이상 교차점
      } else if (lineCount >= 2) {
        score += 20; // 2줄 교차점
      }

      // 방어 점수 (사용자가 4개 완성한 줄을 방해)
      if (userAnalysis && userBoard) {
        const userCell = userBoard[i][j];
        if (userCell && !userCell.checked) {
          const userRowChecked = userBoard[i].filter(c => c.checked).length;
          const userColChecked = userBoard.filter(row => row[j].checked).length;

          if (userRowChecked === 4 || userColChecked === 4) {
            score += 500; // 사용자의 빙고를 방해 (공격보다는 낮은 우선순위)
          }
        }
      }

      wordScores[cell.word] = score;
    }
  }

  // 점수가 가장 높은 단어 선택
  const sortedWords = Object.entries(wordScores).sort(([, a], [, b]) => b - a);

  if (sortedWords.length === 0) {
    return null;
  }

  // 최고 점수 단어만 선택 (최상 난이도 - 실수 없음)
  return sortedWords[0][0];
}

/**
 * 특정 단어의 전략적 정보 반환
 */
function getWordStrategicInfo(bingoBoard, word) {
  let position = null;

  // 단어 위치 찾기
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      if (bingoBoard[i][j].word === word) {
        position = { row: i, col: j };
        break;
      }
    }
    if (position) break;
  }

  if (!position) {
    return { lines: [] };
  }

  const lines = [];
  const { row, col } = position;

  // 가로줄 정보
  const rowChecked = bingoBoard[row].filter(c => c.checked).length;
  lines.push({
    type: '가로',
    index: row,
    checkedCount: rowChecked,
    total: 5
  });

  // 세로줄 정보
  const colChecked = bingoBoard.filter(r => r[col].checked).length;
  lines.push({
    type: '세로',
    index: col,
    checkedCount: colChecked,
    total: 5
  });

  // 주 대각선
  if (row === col) {
    const diag1Checked = bingoBoard.filter((r, idx) => r[idx].checked).length;
    lines.push({
      type: '대각선↘',
      index: 0,
      checkedCount: diag1Checked,
      total: 5
    });
  }

  // 반 대각선
  if (row + col === 4) {
    const diag2Checked = bingoBoard.filter((r, idx) => r[4 - idx].checked).length;
    lines.push({
      type: '대각선↙',
      index: 1,
      checkedCount: diag2Checked,
      total: 5
    });
  }

  return { lines };
}

/**
 * 단어에 대한 이미지 검색
 * POST /api/bingo/search-image
 * Body: { word: string, english: string, category: string } - 한국어 단어, 영어 단어, 카테고리
 * Response: { imageUrl: string, thumbnailUrl: string, description: string }
 */
router.post('/search-image', async (req, res) => {
  try {
    const { word, english, category } = req.body;

    if (!word) {
      return res.status(400).json({ error: '단어가 필요합니다.' });
    }

    // 카테고리별 영어 검색어 매핑
    const categoryMap = {
      '과일': 'fruit',
      '동물': 'animal',
      '음식': 'food',
      '직업': 'profession'
    };

    // 영어 단어를 직접 사용 (GPT 번역 제거)
    let searchQuery = english || word;

    // 카테고리 추가 (선택사항)
    if (category && categoryMap[category]) {
      searchQuery = `${searchQuery} ${categoryMap[category]}`;
    }

    console.log(`🔍 Unsplash 검색어: "${searchQuery}" (한국어: ${word})`);

    // Unsplash API로 이미지 검색
    const unsplashUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=1&orientation=landscape`;

    const response = await fetch(unsplashUrl, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      console.log(`❌ 이미지 없음: "${searchQuery}"`);
      // 이미지를 찾지 못한 경우 플레이스홀더 반환
      return res.json({
        imageUrl: `https://via.placeholder.com/600x400/4299E1/FFFFFF?text=${encodeURIComponent(word)}`,
        thumbnailUrl: `https://via.placeholder.com/300x200/4299E1/FFFFFF?text=${encodeURIComponent(word)}`,
        description: word,
        fallback: true
      });
    }

    const photo = data.results[0];
    console.log(`✅ 이미지 찾음: "${searchQuery}" (사진작가: ${photo.user.name})`);

    res.json({
      imageUrl: photo.urls.regular,
      thumbnailUrl: photo.urls.small,
      description: photo.description || photo.alt_description || word,
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      fallback: false
    });

  } catch (error) {
    console.error('이미지 검색 오류:', error);

    // 오류 시 플레이스홀더 반환
    res.json({
      imageUrl: `https://via.placeholder.com/600x400/4299E1/FFFFFF?text=${encodeURIComponent(req.body.word || 'Error')}`,
      thumbnailUrl: `https://via.placeholder.com/300x200/4299E1/FFFFFF?text=${encodeURIComponent(req.body.word || 'Error')}`,
      description: req.body.word || 'Error',
      fallback: true
    });
  }
});

export default router;
