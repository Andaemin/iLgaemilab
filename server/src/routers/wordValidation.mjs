import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * 한국어 단어 검증 API (기존 버전 - 하위 호환성)
 * CSV → 국립국어원 표준국어대사전 검증 순서로 진행
 */
router.post('/api/validate-word', async (req, res) => {
  try {
    console.log('📝 /api/validate-word 요청 받음:', req.body);
    const { word, csvWords = [], expectedInitials } = req.body;

    if (!word || !word.trim()) {
      console.log('❌ word 파라미터 누락');
      return res.status(400).json({
        error: 'Missing word parameter'
      });
    }

    const cleanWord = word.trim();
    console.log(`🔍 검증할 단어: "${cleanWord}", 초성: "${expectedInitials}"`);

    // 새로운 초성 기반 검증이 요청된 경우
    if (expectedInitials) {
      console.log('✅ 초성 기반 검증 시작');
      await handleInitialBasedValidation(cleanWord, expectedInitials, res);
      console.log('✅ 초성 기반 검증 완료');
      return; // 응답 전송 완료
    }

    // 기존 CSV 기반 검증 로직 (하위 호환성)
    const csvResult = validateInCSV(cleanWord, csvWords);
    if (csvResult.found) {
      return res.json({
        word: cleanWord,
        isValid: true,
        source: 'csv',
        message: 'CSV 데이터에서 확인된 단어입니다.',
        ...csvResult
      });
    }

    // 국립국어원 표준국어대사전 검증
    const koreanDictResult = await validateInKoreanDictionary(cleanWord);
    if (koreanDictResult.found) {
      return res.json({
        word: cleanWord,
        isValid: true,
        source: 'korean_dictionary',
        message: '국립국어원 표준국어대사전에서 확인된 단어입니다.',
        meaning: koreanDictResult.meaning,
        ...koreanDictResult
      });
    }

    // 국립국어원 검증 실패
    return res.json({
      word: cleanWord,
      isValid: false,
      source: 'korean_dictionary_only',
      message: '국립국어원 표준국어대사전에 등재되지 않은 단어입니다.',
      suggestion: '표준국어대사전에 등재된 정확한 한국어 단어를 입력해주세요.'
    });

  } catch (error) {
    console.error('Word validation error:', error);
    res.status(500).json({
      error: 'Word validation failed',
      message: error.message
    });
  }
});

/**
 * 초성 기반 단어 검증 API (국립국어원 표준국어대사전 전용)
 */
router.post('/api/verify-word', async (req, res) => {
  try {
    const { word, expectedInitials } = req.body;

    if (!word || !expectedInitials) {
      return res.status(400).json({
        error: 'Missing required parameters'
      });
    }

    await handleInitialBasedValidation(word.trim(), expectedInitials, res);
    return; // 응답 전송 완료

  } catch (error) {
    console.error('Word verification error:', error);
    res.status(500).json({
      error: 'Word verification failed',
      message: error.message
    });
  }
});

/**
 * 초성 기반 검증 로직
 */
async function handleInitialBasedValidation(cleanWord, expectedInitials, res) {
  console.log(`🎯 handleInitialBasedValidation 시작 - 단어: "${cleanWord}", 초성: "${expectedInitials}"`);

  // 1. 한글 단어인지 확인
  if (!/^[가-힣]+$/.test(cleanWord)) {
    console.log('❌ 한글이 아님');
    res.json({
      isValid: false,
      isCorrectInitials: false,
      message: '한글 단어만 입력 가능합니다.',
      word: cleanWord
    });
    return;
  }

  // 2. 초성 일치 확인
  const userInitials = extractInitials(cleanWord);
  console.log(`🔤 초성 비교 - 사용자: "${userInitials}", 예상: "${expectedInitials}"`);

  if (userInitials !== expectedInitials) {
    console.log('❌ 초성 불일치');
    res.json({
      isValid: false,
      isCorrectInitials: false,
      message: `초성이 맞지 않습니다. (입력: ${userInitials}, 정답: ${expectedInitials})`,
      expectedInitials,
      userInitials,
      word: cleanWord
    });
    return;
  }

  console.log('✅ 초성 일치 - 사전 검증 시작');
  // 3. 국립국어원 표준국어대사전 API로만 검증
  const dictionaryResult = await validateInKoreanDictionary(cleanWord);
  console.log('📖 사전 검증 결과:', dictionaryResult);

  if (dictionaryResult.found) {
    console.log('✅ 사전에서 발견됨 - 성공 응답 전송');
    res.json({
      isValid: true,
      isCorrectInitials: true,
      message: '정답입니다! 🎉',
      word: cleanWord,
      source: 'korean_dictionary',
      sourceLabel: '🏛️ 국립국어원',
      sourceMessage: '국립국어원 표준국어대사전에서 확인된 공식 한국어 단어입니다.',
      meaning: dictionaryResult.meaning || '국립국어원 표준국어대사전에 등재된 단어',
      pos: dictionaryResult.pos || '',
      example: dictionaryResult.example || '',
      confidence: 1.0
    });
    return;
  } else {
    console.log('❌ 사전에서 미발견 - 실패 응답 전송');
    res.json({
      isValid: false,
      isCorrectInitials: true,
      message: '국립국어원 표준국어대사전에 등재되지 않은 단어입니다.',
      word: cleanWord,
      reason: dictionaryResult.reason || '표준국어대사전에서 찾을 수 없는 단어',
      sourceMessage: '🏛️ 국립국어원 표준국어대사전 기준으로만 정답을 인정합니다.'
    });
    return;
  }
}

/**
 * CSV 데이터에서 단어 검증
 */
function validateInCSV(word, csvWords) {
  const found = csvWords.some(wordObj =>
    wordObj.word === word ||
    (typeof wordObj === 'string' && wordObj === word)
  );

  return {
    found,
    method: 'csv_lookup'
  };
}

/**
 * 국립국어원 표준국어대사전 API 단독 검증
 */
async function validateInKoreanDictionary(word) {
  try {
    console.log(`🏛️ 국립국어원 표준국어대사전 검증: "${word}"`);

    const koreanDictResult = await checkKoreanDictionary(word);

    if (koreanDictResult.found && koreanDictResult.isExactMatch) {
      console.log(`✅ 국립국어원에서 정확한 매치 발견: "${word}"`);
      return koreanDictResult;
    } else {
      console.log(`❌ 국립국어원 검증 실패: "${word}"`);
      return {
        found: false,
        method: 'korean_dictionary',
        reason: '국립국어원 표준국어대사전에 등재되지 않은 단어입니다.'
      };
    }

  } catch (error) {
    console.error('❌ 국립국어원 API 오류:', error);
    return {
      found: false,
      method: 'korean_dictionary',
      error: error.message,
      reason: '국립국어원 API 연결 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 국립국어원 표준국어대사전 API로 단어 검증
 */
async function checkKoreanDictionary(word) {
  try {
    const KOREAN_DICT_API_URL = 'https://stdict.korean.go.kr/api/search.do';
    const KOREAN_DICT_API_KEY = process.env.KOREAN_DICT_API_KEY;

    if (!KOREAN_DICT_API_KEY) {
      console.log('⚠️  국립국어원 API 키가 설정되지 않았습니다.');
      return { found: false, isExactMatch: false, reason: 'API key not configured' };
    }

    console.log(`🏛️  국립국어원 표준국어대사전 검색: "${word}"`);

    const url = new URL(KOREAN_DICT_API_URL);
    url.searchParams.append('key', KOREAN_DICT_API_KEY);
    url.searchParams.append('q', word);
    url.searchParams.append('req_type', 'xml');  // XML 형식으로 변경
    url.searchParams.append('advanced', 'n');
    url.searchParams.append('pos', '1');         // 시작 위치
    url.searchParams.append('sort', 'dict');     // 사전순 정렬
    // part 파라미터 제거하여 테스트

    console.log(`🔗 요청 URL: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      timeout: 10000
    });

    console.log('🏛️  국립국어원 API 응답 상태:', response.status);

    if (!response.ok) {
      console.log(`❌ 국립국어원 API 응답 오류: ${response.status}`);
      return {
        found: false,
        isExactMatch: false,
        reason: `API response error: ${response.status}`
      };
    }

    const xmlText = await response.text();
    console.log('📄 XML 응답 데이터:', xmlText.substring(0, 500) + '...');

    // 간단한 XML 파싱 (total 값 확인)
    const totalMatch = xmlText.match(/<total>(\d+)<\/total>/);
    const total = totalMatch ? parseInt(totalMatch[1]) : 0;

    console.log(`📊 국립국어원 검색 결과: ${total}개`);

    if (total === 0) {
      return {
        found: false,
        isExactMatch: false,
        reason: '국립국어원 표준국어대사전에서 단어를 찾을 수 없습니다.'
      };
    }

    // item 태그에서 단어 정보 추출 시도
    const itemMatches = xmlText.match(/<item>(.*?)<\/item>/gs);
    if (!itemMatches || itemMatches.length === 0) {
      return {
        found: false,
        isExactMatch: false,
        reason: '검색 결과는 있지만 상세 정보를 찾을 수 없습니다.'
      };
    }

    // XML에서 단어 정보 추출 및 정확한 매치 확인
    const exactMatches = [];

    for (const itemMatch of itemMatches) {
      const itemContent = itemMatch;

      // 다양한 단어명 태그 시도 (CDATA 섹션 처리 포함)
      const wordPatterns = [
        /<word><!\[CDATA\[(.*?)\]\]><\/word>/,  // CDATA 섹션 처리
        /<word>(.*?)<\/word>/,
        /<target_code><!\[CDATA\[(.*?)\]\]><\/target_code>/,
        /<target_code>(.*?)<\/target_code>/,
        /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
        /<title>(.*?)<\/title>/,
        /<word_info><!\[CDATA\[(.*?)\]\]><\/word_info>/,
        /<word_info>(.*?)<\/word_info>/,
        /<entry><!\[CDATA\[(.*?)\]\]><\/entry>/,
        /<entry>(.*?)<\/entry>/,
        /<lemma><!\[CDATA\[(.*?)\]\]><\/lemma>/,
        /<lemma>(.*?)<\/lemma>/
      ];

      let wordName = '';
      for (const pattern of wordPatterns) {
        const match = itemContent.match(pattern);
        if (match && match[1] && match[1].trim()) {
          wordName = match[1].trim();
          console.log(`  ✅ 패턴 매치 성공: "${pattern}" -> "${wordName}"`);
          break;
        }
      }

      // 전체 아이템 내용도 로깅 (디버깅용)
      console.log(`  📄 아이템 내용 (첫 100자): "${itemContent.substring(0, 100).replace(/\s+/g, ' ')}..."`);
      console.log(`  📖 검색된 단어: "${wordName}"`);

      // 정확한 매치 확인 - "파란", "파란1", "파란2", "파란3" 모두 매치
      // 검색어와 정확히 일치하거나, 검색어 뒤에 숫자가 붙은 경우 모두 허용
      const isExactMatch = wordName === word ||
                          (wordName.startsWith(word) && /^\d+$/.test(wordName.substring(word.length)));

      if (isExactMatch) {
        exactMatches.push(itemContent);
        console.log(`✅ 국립국어원에서 정확한 매치 발견: "${wordName}"`);

        // 최대 3개까지만 수집
        if (exactMatches.length >= 3) {
          break;
        }
      }
    }

    if (exactMatches.length > 0) {
      // 모든 매치에서 의미 정보 추출 (최대 3개)
      const definitionMatches = [];

      for (const exactMatch of exactMatches) {
        // definition 태그 찾기 (CDATA와 일반 모두 매칭)
        const definitionPattern = /<definition>(?:<!\[CDATA\[(.*?)\]\]>|(.*?))<\/definition>/;
        const defMatch = exactMatch.match(definitionPattern);

        if (defMatch) {
          // match[1]은 CDATA 내용, match[2]는 일반 내용
          const content = (defMatch[1] || defMatch[2] || '').trim();

          if (content && !definitionMatches.includes(content)) {
            definitionMatches.push(content);
          }
        }

        // 최대 3개까지만 수집
        if (definitionMatches.length >= 3) {
          break;
        }
      }

      // 뜻이 없으면 기본값 사용
      const meaning = definitionMatches.length > 0
        ? definitionMatches.join(' / ')
        : '국립국어원 표준국어대사전에 등재된 단어';

      // 첫 번째 매치에서 품사와 예문 추출
      const posMatch = exactMatches[0].match(/<pos><!\[CDATA\[(.*?)\]\]><\/pos>/) ||
                      exactMatches[0].match(/<pos>(.*?)<\/pos>/);
      const exampleMatch = exactMatches[0].match(/<example><!\[CDATA\[(.*?)\]\]><\/example>/) ||
                          exactMatches[0].match(/<example>(.*?)<\/example>/);

      console.log(`📚 총 ${definitionMatches.length}개의 뜻을 찾았습니다: ${meaning}`);

      return {
        found: true,
        isExactMatch: true,
        method: 'korean_dictionary',
        word: word,
        pos: posMatch ? posMatch[1] : '',
        meaning: meaning,
        example: exampleMatch ? exampleMatch[1] : '',
        source: 'korean_dict'
      };
    } else {
      return {
        found: false,
        isExactMatch: false,
        reason: '국립국어원 표준국어대사전에서 정확한 매치를 찾을 수 없습니다.'
      };
    }

  } catch (error) {
    console.error('❌ 국립국어원 API 오류:', error.message);

    if (error.code === 'ECONNABORTED') {
      return {
        found: false,
        isExactMatch: false,
        reason: '국립국어원 API 응답 시간 초과',
        error: 'timeout'
      };
    }

    return {
      found: false,
      isExactMatch: false,
      reason: '국립국어원 API 연결 중 오류 발생',
      error: error.message
    };
  }
}




/**
 * 단어 유사성 검사 (오타 체크)
 */
router.post('/api/suggest-word', async (req, res) => {
  try {
    const { word, csvWords = [] } = req.body;

    if (!word || !word.trim()) {
      return res.status(400).json({ error: 'Missing word parameter' });
    }

    const suggestions = findSimilarWords(word.trim(), csvWords);

    res.json({
      word: word.trim(),
      suggestions: suggestions.slice(0, 5), // 상위 5개만
      message: suggestions.length > 0 ? '혹시 이 단어들 중 하나를 찾고 계신가요?' : '유사한 단어를 찾을 수 없습니다.'
    });

  } catch (error) {
    console.error('Word suggestion error:', error);
    res.status(500).json({
      error: 'Word suggestion failed',
      message: error.message
    });
  }
});

/**
 * 레벤슈타인 거리를 사용한 유사 단어 찾기
 */
function findSimilarWords(inputWord, csvWords) {
  const similarities = csvWords
    .map(wordObj => {
      const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
      if (!word) return null;

      const distance = levenshteinDistance(inputWord, word);
      const similarity = 1 - (distance / Math.max(inputWord.length, word.length));

      return {
        word,
        similarity,
        distance
      };
    })
    .filter(item => item && item.similarity > 0.5) // 50% 이상 유사한 것만
    .sort((a, b) => b.similarity - a.similarity);

  return similarities.map(item => item.word);
}

/**
 * 한글 초성 추출 함수 (서버용)
 */
function extractInitials(word) {
  const KOREAN_INITIALS = [
    'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
    'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
  ];

  return word.split('').map(char => {
    const charCode = char.charCodeAt(0);
    if (charCode < 0xAC00 || charCode > 0xD7A3) {
      return char; // 한글이 아니면 그대로 반환
    }
    const initialIndex = Math.floor((charCode - 0xAC00) / 588);
    return KOREAN_INITIALS[initialIndex];
  }).join('');
}

/**
 * 레벤슈타인 거리 계산 (편집 거리)
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

export default router;