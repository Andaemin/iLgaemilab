// 한국어 초성게임을 위한 핵심 유틸리티 함수들

// 한글 초성 배열 (게임용 기본 초성)
const KOREAN_INITIALS = [
  'ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

// 전체 한글 초성 배열 (초성 추출용)
const ALL_KOREAN_INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
]

/**
 * 한글 문자에서 초성을 추출하는 함수
 * @param {string} char - 한글 문자 하나
 * @returns {string} - 초성 문자
 */
export const getInitialConsonant = (char) => {
  const charCode = char.charCodeAt(0)
  if (charCode < 0xAC00 || charCode > 0xD7A3) {
    return char // 한글이 아니면 그대로 반환
  }

  // 초성 추출 공식: (문자코드 - 0xAC00) / 588
  const initialIndex = Math.floor((charCode - 0xAC00) / 588)
  return ALL_KOREAN_INITIALS[initialIndex]
}

/**
 * 단어에서 초성만 추출하는 함수
 * @param {string} word - 한국어 단어
 * @returns {string} - 초성 문자열
 */
export const extractInitials = (word) => {
  return word.split('').map(char => getInitialConsonant(char)).join('')
}

/**
 * CSV 데이터를 파싱하는 함수 (문제 생성 참조용)
 * @param {string} csvText - CSV 문자열
 * @returns {Array} - 단어 객체 배열
 */
export const parseKoreanWords = (csvText) => {
  const cleanCsvText = csvText.replace(/^\uFEFF/, '')
  const lines = cleanCsvText.split('\n')
  const words = []

  // 첫 번째 줄(헤더)는 건너뛰고 시작
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const columns = line.split(',')
    if (columns.length >= 2) {
      const word = columns[1].trim() // 단어 컬럼
      const level = columns[4]?.trim() || 'A' // 등급 컬럼

      if (word && word.length > 0 && /^[가-힣]+$/.test(word)) {
        words.push({
          word: word,
          initials: extractInitials(word),
          level: level,
          length: word.length
        })
      }
    }
  }

  return words
}

/**
 * 랜덤 초성 조합 생성 (2글자 고정)
 * @returns {string} - 랜덤 초성 문자열
 */
const generateRandomInitials = () => {
  let initials = ''
  for (let i = 0; i < 2; i++) { // 2글자 고정
    const randomIndex = Math.floor(Math.random() * KOREAN_INITIALS.length)
    initials += KOREAN_INITIALS[randomIndex]
  }
  return initials
}

/**
 * 스마트 게임 문제 생성 (CSV 데이터 기반 또는 랜덤)
 * @param {Array} words - CSV 단어 데이터
 * @param {object} options - 옵션
 * @returns {object} - 게임 문제 객체
 */
export const generateSmartQuestion = (words = [], options = {}) => {
  // CSV 데이터가 있으면 참조용으로 사용, 없으면 랜덤 생성
  if (words.length > 0) {
    // CSV 데이터에서 2글자 단어들의 초성 패턴 분석
    const twoCharWords = words.filter(w => w.length === 2)

    if (twoCharWords.length > 0) {
      // 랜덤하게 선택된 단어의 초성을 사용
      const randomWord = twoCharWords[Math.floor(Math.random() * twoCharWords.length)]
      const initials = randomWord.initials

      // 같은 초성을 가진 단어들을 예시로 수집
      const sameInitialWords = twoCharWords
        .filter(w => w.initials === initials)
        .map(w => w.word)
        .slice(0, 10)

      return {
        id: Date.now(),
        initials: initials,
        formattedInitials: initials.split('').join(' '),
        type: 'smart',
        possibleAnswers: sameInitialWords,
        answerCount: sameInitialWords.length
      }
    }
  }

  // CSV 데이터가 없거나 2글자 단어가 없으면 랜덤 생성
  const initials = generateRandomInitials()
  return {
    id: Date.now(),
    initials: initials,
    formattedInitials: initials.split('').join(' '),
    type: 'random'
  }
}

/**
 * 국립국어원 API 기반 단어 검증
 * @param {string} userAnswer - 사용자 입력
 * @param {string} expectedInitials - 예상 초성
 * @returns {Promise<object>} - 검증 결과
 */
export const validateAnswerWithNaver = async (userAnswer, expectedInitials) => {
  const cleanAnswer = userAnswer.trim()

  if (!cleanAnswer) {
    return {
      isValid: false,
      isCorrectInitials: false,
      message: '답을 입력해주세요.'
    }
  }

  try {
    // 서버의 단어 검증 API 호출 (환경변수에서 API URL 가져오기)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    const response = await fetch(`${apiUrl}/api/validate-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        word: cleanAnswer,
        expectedInitials: expectedInitials,
        csvWords: [] // CSV 검증은 스킵
      })
    })

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // 응답 본문이 비어있는지 확인
    const text = await response.text()
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server')
    }

    // JSON 파싱
    const result = JSON.parse(text)
    console.log('서버 응답:', result)
    return result

  } catch (error) {
    console.error('단어 검증 API 오류:', error)

    // API 실패시 기본 검증
    const userInitials = extractInitials(cleanAnswer)

    if (!/^[가-힣]+$/.test(cleanAnswer)) {
      return {
        isValid: false,
        isCorrectInitials: false,
        message: '한글 단어만 입력 가능합니다.'
      }
    }

    if (userInitials !== expectedInitials) {
      return {
        isValid: false,
        isCorrectInitials: false,
        message: `초성이 맞지 않습니다. (입력: ${userInitials}, 정답: ${expectedInitials})`
      }
    }

    return {
      isValid: false,
      isCorrectInitials: true,
      message: '네트워크 오류가 발생했습니다. 다시 시도해주세요.'
    }
  }
}

