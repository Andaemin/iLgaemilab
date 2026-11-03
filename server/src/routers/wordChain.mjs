import express from 'express';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const router = express.Router();

// OpenAI 설정
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * 한글 초성 추출 함수
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
 * 두음법칙 적용 함수
 * 단어의 첫 글자가 두음법칙에 해당하면 가능한 변형들을 반환
 */
function getDoubleConsonantVariants(char) {
    // 두음법칙 매핑: 표준어 -> 가능한 변형들
    const doubleConsonantMap = {
        // ㄴ -> ㅇ (여, 요, 유, 야, 예 등)
        '여': ['녀'], '요': ['뇨'], '유': ['뉴'], '야': ['냐'], '예': ['녜'],
        '역': ['녁'], '연': ['년'], '열': ['렬'], '영': ['녕'], '예': ['녜'],
        '용': ['뇽'], '욕': ['뇨욕'], '원': ['원'], '위': ['뉘'], '유': ['뉴'],

        // ㄹ -> ㅇ (이, 야, 여, 요, 유 등)
        '이': ['리'], '일': ['릴'], '익': ['릭'], '인': ['린'], '입': ['립'],
        '양': ['량'], '여': ['려'], '연': ['련'], '영': ['령'], '예': ['례'],
        '용': ['룡'], '육': ['륙'], '율': ['률'], '윤': ['륜'], '유': ['류'],

        // 반대 방향 (구어 -> 표준어)
        '녀': ['여'], '뇨': ['요'], '뉴': ['유'], '냐': ['야'], '녜': ['예'],
        '녁': ['역'], '년': ['연'], '렬': ['열'], '녕': ['영'],

        '리': ['이'], '릴': ['일'], '릭': ['익'], '린': ['인'], '립': ['입'],
        '량': ['양'], '려': ['여'], '련': ['연'], '령': ['영'], '례': ['예'],
        '룡': ['용'], '륙': ['육'], '률': ['율'], '륜': ['윤'], '류': ['유']
    };

    return doubleConsonantMap[char] || [];
}

/**
 * 두음법칙을 고려한 끝말잇기 검증
 */
function isValidWordChain(lastChar, firstChar) {
    // 정확히 일치하면 OK
    if (lastChar === firstChar) {
        return true;
    }

    // 두음법칙 변형 확인
    const variants = getDoubleConsonantVariants(lastChar);
    if (variants.includes(firstChar)) {
        return true;
    }

    // 반대 방향도 확인 (마지막 글자가 변형된 경우)
    const reverseVariants = getDoubleConsonantVariants(firstChar);
    if (reverseVariants.includes(lastChar)) {
        return true;
    }

    return false;
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
        url.searchParams.append('req_type', 'xml');
        url.searchParams.append('advanced', 'n');
        url.searchParams.append('pos', '1');
        url.searchParams.append('sort', 'dict');

        const response = await fetch(url.toString(), {
            method: 'GET',
            timeout: 10000
        });

        if (!response.ok) {
            console.log(`❌ 국립국어원 API 응답 오류: ${response.status}`);
            return {
                found: false,
                isExactMatch: false,
                reason: `API response error: ${response.status}`
            };
        }

        const xmlText = await response.text();

        // total 값 확인
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

        // 디버깅: XML 응답 일부 로그 (처음 500자)
        console.log(`🔍 XML 응답 샘플 (${word}):`, xmlText.substring(0, 500));

        // item 태그에서 단어 정보 추출
        const itemMatches = xmlText.match(/<item>(.*?)<\/item>/gs);
        if (!itemMatches || itemMatches.length === 0) {
            console.log(`⚠️  item 태그를 찾을 수 없음. 전체 XML:`, xmlText.substring(0, 1000));
            return {
                found: false,
                isExactMatch: false,
                reason: '검색 결과는 있지만 상세 정보를 찾을 수 없습니다.'
            };
        }

        // XML에서 단어 정보 추출 및 정확한 매치 확인
        let exactMatch = null;

        for (const itemMatch of itemMatches) {
            const itemContent = itemMatch;

            // 다양한 단어명 태그 시도 (CDATA 섹션 처리 포함)
            const wordPatterns = [
                /<word><!\[CDATA\[(.*?)\]\]><\/word>/,
                /<word>(.*?)<\/word>/,
                /<target_code><!\[CDATA\[(.*?)\]\]><\/target_code>/,
                /<target_code>(.*?)<\/target_code>/,
                /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
                /<title>(.*?)<\/title>/
            ];

            let wordName = '';
            for (const pattern of wordPatterns) {
                const match = itemContent.match(pattern);
                if (match && match[1] && match[1].trim()) {
                    wordName = match[1].trim();
                    break;
                }
            }

            // 디버깅: 추출된 단어명 로그
            if (wordName) {
                console.log(`🔍 추출된 단어명: "${wordName}" (검색어: "${word}")`);
            }

            // 정확한 매치 확인
            if (wordName === word) {
                exactMatch = itemContent;
                console.log(`✅ 국립국어원에서 정확한 매치 발견: "${word}"`);
                break;
            }
        }

        if (!exactMatch) {
            console.log(`⚠️  정확한 매치를 찾지 못함. 검색 결과 ${itemMatches.length}개 중 일치하는 항목 없음`);
        }

        if (exactMatch) {
            // XML에서 의미 정보 추출
            const definitionMatch = exactMatch.match(/<definition><!\[CDATA\[(.*?)\]\]><\/definition>/) ||
                                   exactMatch.match(/<definition>(.*?)<\/definition>/);

            return {
                found: true,
                isExactMatch: true,
                word: word,
                meaning: definitionMatch ? definitionMatch[1] : '국립국어원 표준국어대사전에 등재된 단어'
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
        return {
            found: false,
            isExactMatch: false,
            reason: '국립국어원 API 연결 중 오류 발생',
            error: error.message
        };
    }
}

/**
 * 사용자 단어 검증 API
 * POST /api/word-chain/validate
 */
router.post('/api/word-chain/validate', async (req, res) => {
    try {
        const { word, previousWord, usedWords = [] } = req.body;

        if (!word || !word.trim()) {
            return res.json({
                isValid: false,
                message: '단어를 입력해주세요.'
            });
        }

        const cleanWord = word.trim();

        // 1. 한글 단어인지 확인
        if (!/^[가-힣]+$/.test(cleanWord)) {
            return res.json({
                isValid: false,
                message: '한글 단어만 입력 가능합니다.'
            });
        }

        // 2. 2글자 이상인지 확인
        if (cleanWord.length < 2) {
            return res.json({
                isValid: false,
                message: '2글자 이상의 단어를 입력해주세요.'
            });
        }

        // 3. 이미 사용한 단어인지 확인
        if (usedWords.includes(cleanWord)) {
            return res.json({
                isValid: false,
                message: '이미 사용한 단어입니다.'
            });
        }

        // 4. 끝말잇기 규칙 확인 (이전 단어의 마지막 글자로 시작해야 함 - 두음법칙 고려)
        if (previousWord) {
            const lastChar = previousWord.charAt(previousWord.length - 1);
            const firstChar = cleanWord.charAt(0);

            if (!isValidWordChain(lastChar, firstChar)) {
                const variants = getDoubleConsonantVariants(lastChar);
                const variantsText = variants.length > 0
                    ? ` 또는 "${variants.join('", "')}"`
                    : '';
                return res.json({
                    isValid: false,
                    message: `"${lastChar}"${variantsText}(으)로 시작하는 단어를 입력해주세요.`
                });
            }
        }

        // 5. 국립국어원 표준국어대사전 검증
        const dictionaryResult = await checkKoreanDictionary(cleanWord);

        if (dictionaryResult.found && dictionaryResult.isExactMatch) {
            return res.json({
                isValid: true,
                message: '정답입니다! 🎉',
                word: cleanWord,
                meaning: dictionaryResult.meaning
            });
        } else {
            return res.json({
                isValid: false,
                message: '국립국어원 표준국어대사전에 등재되지 않은 단어입니다.'
            });
        }

    } catch (error) {
        console.error('Word validation error:', error);
        res.status(500).json({
            isValid: false,
            message: '단어 검증 중 오류가 발생했습니다.'
        });
    }
});

/**
 * AI 턴 API (GPT 기반)
 * POST /api/word-chain/ai-turn
 */
router.post('/api/word-chain/ai-turn', async (req, res) => {
    try {
        const { previousWord, usedWords = [] } = req.body;

        console.log('🤖 AI 턴 시작:', { previousWord, usedWordsCount: usedWords.length });

        // GPT에게 10개의 단어 후보를 물어봄 (JSON 형식으로 요청)
        const prompt = previousWord
            ? `당신은 끝말잇기 게임을 하고 있습니다.

이전 단어: "${previousWord}"
이미 사용한 단어 목록: ${usedWords.length > 0 ? usedWords.join(', ') : '없음'}

규칙:
1. 이전 단어의 마지막 글자인 "${previousWord.charAt(previousWord.length - 1)}"(으)로 시작하는 한국어 단어를 10개 찾으세요.
2. 두음법칙 적용: 만약 마지막 글자가 "리/니/녀/뇨/뉴" 등이면, "이/야/여/요/유" 등으로도 시작 가능합니다.
   예: "승리" → "이발" 가능, "도리" → "리본" 또는 "이본" 가능
3. 이미 사용한 단어는 절대 사용하지 마세요.
4. 2글자 이상의 한국어 단어만 가능합니다.
5. 일반적이고 널리 알려진 한국어 단어를 선택하세요.

응답 형식 (JSON):
{
  "candidates": ["단어1", "단어2", "단어3", "단어4", "단어5", "단어6", "단어7", "단어8", "단어9", "단어10"]
}`
            : `당신은 끝말잇기 게임을 시작합니다.

규칙:
1. 일반적이고 널리 알려진 한국어 단어를 10개 선택하세요.
2. 2글자 이상의 한국어 단어만 가능합니다.

응답 형식 (JSON):
{
  "candidates": ["단어1", "단어2", "단어3", "단어4", "단어5", "단어6", "단어7", "단어8", "단어9", "단어10"]
}`;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: '당신은 끝말잇기 게임 전문가입니다. 항상 일반적이고 널리 알려진 한국어 단어를 사용합니다. JSON 형식으로만 응답하세요.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.8,
            max_tokens: 300,
            response_format: { type: 'json_object' }
        });

        const responseText = completion.choices[0].message.content.trim();
        console.log('🤖 GPT 응답:', responseText);

        const aiResponse = JSON.parse(responseText);
        const candidates = aiResponse.candidates || [];

        if (!Array.isArray(candidates) || candidates.length === 0) {
            console.log('❌ AI가 단어 후보를 생성하지 못함');
            return res.json({
                isValid: false,
                message: 'AI가 올바른 단어를 찾지 못했습니다.'
            });
        }

        console.log(`🤖 AI가 생성한 ${candidates.length}개의 단어 후보:`, candidates);

        // 각 후보 단어를 국립국어원 API로 검증하고, 검증된 모든 단어를 수집
        const validWords = [];

        for (const candidate of candidates) {
            const cleanCandidate = candidate.trim();

            // 기본 검증
            if (!/^[가-힣]+$/.test(cleanCandidate)) {
                console.log(`⚠️  후보 "${cleanCandidate}"는 한글이 아님`);
                continue;
            }

            if (cleanCandidate.length < 2) {
                console.log(`⚠️  후보 "${cleanCandidate}"는 2글자 미만`);
                continue;
            }

            if (usedWords.includes(cleanCandidate)) {
                console.log(`⚠️  후보 "${cleanCandidate}"는 이미 사용됨`);
                continue;
            }

            // 끝말잇기 규칙 확인 (두음법칙 고려)
            if (previousWord) {
                const lastChar = previousWord.charAt(previousWord.length - 1);
                const firstChar = cleanCandidate.charAt(0);

                if (!isValidWordChain(lastChar, firstChar)) {
                    console.log(`⚠️  후보 "${cleanCandidate}"는 끝말잇기 규칙 위반:`, { lastChar, firstChar });
                    continue;
                }
            }

            // 국립국어원 API 검증
            console.log(`🔍 후보 "${cleanCandidate}" 국립국어원 검증 중...`);
            const dictionaryResult = await checkKoreanDictionary(cleanCandidate);

            if (dictionaryResult.found && dictionaryResult.isExactMatch) {
                validWords.push({
                    word: cleanCandidate,
                    meaning: dictionaryResult.meaning || `"${cleanCandidate}"에 대한 설명`
                });
                console.log(`✅ 국립국어원에서 등재된 단어 발견: "${cleanCandidate}"`, `/ 의미: ${dictionaryResult.meaning}`);
            } else {
                console.log(`❌ 후보 "${cleanCandidate}"는 국립국어원에 등재되지 않음`);
            }
        }

        // 10개 후보 중 등재된 단어가 하나도 없으면 패배
        if (validWords.length === 0) {
            console.log('❌ 10개의 후보 단어 중 국립국어원에 등재된 단어가 없음. AI 패배');
            return res.json({
                isValid: false,
                message: 'AI가 국립국어원에 등재된 단어를 찾지 못했습니다.'
            });
        }

        // 검증된 단어 중 랜덤하게 선택 (다양성 확보)
        const randomIndex = Math.floor(Math.random() * validWords.length);
        const selectedWord = validWords[randomIndex];

        console.log(`✅ AI 단어 최종 선택 (${validWords.length}개 중 랜덤):`, selectedWord.word, '/ 의미:', selectedWord.meaning);
        return res.json({
            isValid: true,
            word: selectedWord.word,
            meaning: selectedWord.meaning
        });

    } catch (error) {
        console.error('AI turn error:', error);
        res.status(500).json({
            isValid: false,
            message: 'AI 응답 중 오류가 발생했습니다.'
        });
    }
});

/**
 * 단어 뜻 조회 API (최대 3개)
 * POST /api/word-chain/get-meaning
 */
router.post('/api/word-chain/get-meaning', async (req, res) => {
    try {
        const { word } = req.body;

        if (!word || !word.trim()) {
            return res.json({
                meanings: ['단어를 입력해주세요.']
            });
        }

        const cleanWord = word.trim();

        // 국립국어원 API 호출
        const KOREAN_DICT_API_URL = 'https://stdict.korean.go.kr/api/search.do';
        const KOREAN_DICT_API_KEY = process.env.KOREAN_DICT_API_KEY;

        if (!KOREAN_DICT_API_KEY) {
            return res.json({
                meanings: ['API 키가 설정되지 않았습니다.']
            });
        }

        const url = new URL(KOREAN_DICT_API_URL);
        url.searchParams.append('key', KOREAN_DICT_API_KEY);
        url.searchParams.append('q', cleanWord);
        url.searchParams.append('req_type', 'xml');
        url.searchParams.append('advanced', 'n');
        url.searchParams.append('pos', '1');
        url.searchParams.append('sort', 'dict');

        const response = await fetch(url.toString(), {
            method: 'GET',
            timeout: 10000
        });

        if (!response.ok) {
            return res.json({
                meanings: ['API 응답 오류가 발생했습니다.']
            });
        }

        const xmlText = await response.text();

        // item 태그에서 단어 정보 추출
        const itemMatches = xmlText.match(/<item>(.*?)<\/item>/gs);
        if (!itemMatches || itemMatches.length === 0) {
            return res.json({
                meanings: ['국립국어원 표준국어대사전에서 단어를 찾을 수 없습니다.']
            });
        }

        // 여러 뜻 수집 (최대 3개)
        const exactMatches = [];

        for (const itemMatch of itemMatches) {
            const itemContent = itemMatch;

            // 단어명 추출
            const wordPatterns = [
                /<word><!\[CDATA\[(.*?)\]\]><\/word>/,
                /<word>(.*?)<\/word>/,
                /<target_code><!\[CDATA\[(.*?)\]\]><\/target_code>/,
                /<target_code>(.*?)<\/target_code>/,
                /<title><!\[CDATA\[(.*?)\]\]><\/title>/,
                /<title>(.*?)<\/title>/
            ];

            let wordName = '';
            for (const pattern of wordPatterns) {
                const match = itemContent.match(pattern);
                if (match && match[1] && match[1].trim()) {
                    wordName = match[1].trim();
                    break;
                }
            }

            // 정확한 매치 확인 - "단어", "단어1", "단어2", "단어3" 모두 매치
            const isExactMatch = wordName === cleanWord ||
                                (wordName.startsWith(cleanWord) && /^\d+$/.test(wordName.substring(cleanWord.length)));

            if (isExactMatch) {
                exactMatches.push(itemContent);

                // 최대 3개까지만 수집
                if (exactMatches.length >= 3) {
                    break;
                }
            }
        }

        if (exactMatches.length === 0) {
            return res.json({
                meanings: ['국립국어원 표준국어대사전에서 단어를 찾을 수 없습니다.']
            });
        }

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

        if (definitionMatches.length === 0) {
            return res.json({
                meanings: ['국립국어원 표준국어대사전에 등재된 단어']
            });
        }

        return res.json({
            meanings: definitionMatches
        });

    } catch (error) {
        console.error('단어 뜻 조회 오류:', error);
        res.status(500).json({
            meanings: ['뜻을 조회하는 중 오류가 발생했습니다.']
        });
    }
});

export default router;