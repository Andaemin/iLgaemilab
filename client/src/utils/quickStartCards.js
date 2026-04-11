import quickStartCardsData from '@/data/quickStartCards.json'

/**
 * 직무별 Quick Start 카드 가져오기
 * @param {string} occupation - 직무 카테고리 (manufacturing, construction, service, hospital, market)
 * @returns {Object} 직무별 카드 데이터
 */
export function getQuickStartCards(occupation) {
  if (!occupation || !quickStartCardsData[occupation]) {
    console.warn(`No Quick Start cards found for occupation: ${occupation}`)
    return null
  }

  return quickStartCardsData[occupation]
}

/**
 * 모든 직무 카테고리 목록 가져오기
 * @returns {Array} 직무 카테고리 목록
 */
export function getOccupationCategories() {
  return Object.keys(quickStartCardsData).map(key => ({
    id: key,
    name: quickStartCardsData[key].name,
    nameVi: quickStartCardsData[key].nameVi,
    icon: quickStartCardsData[key].icon
  }))
}

/**
 * 특정 카드 가져오기
 * @param {string} occupation - 직무 카테고리
 * @param {number} cardOrder - 카드 순서 (1-5)
 * @returns {Object} 카드 데이터
 */
export function getCardByOrder(occupation, cardOrder) {
  const occupationData = getQuickStartCards(occupation)
  if (!occupationData) return null

  return occupationData.cards.find(card => card.order === cardOrder)
}

/**
 * 랜덤 카드 가져오기 (복습용)
 * @param {string} occupation - 직무 카테고리
 * @returns {Object} 랜덤 카드
 */
export function getRandomCard(occupation) {
  const occupationData = getQuickStartCards(occupation)
  if (!occupationData || !occupationData.cards.length) return null

  const randomIndex = Math.floor(Math.random() * occupationData.cards.length)
  return occupationData.cards[randomIndex]
}

/**
 * 모든 카드를 일차원 배열로 가져오기
 * @returns {Array} 모든 카드 배열
 */
export function getAllCards() {
  const allCards = []

  Object.keys(quickStartCardsData).forEach(occupation => {
    const occupationData = quickStartCardsData[occupation]
    occupationData.cards.forEach(card => {
      allCards.push({
        ...card,
        occupation: occupation,
        occupationName: occupationData.name,
        occupationNameVi: occupationData.nameVi
      })
    })
  })

  return allCards
}

/**
 * 태그로 카드 검색
 * @param {string} tag - 검색할 태그
 * @returns {Array} 매칭되는 카드 배열
 */
export function searchCardsByTag(tag) {
  const matchingCards = []

  Object.keys(quickStartCardsData).forEach(occupation => {
    const occupationData = quickStartCardsData[occupation]
    occupationData.cards.forEach(card => {
      if (card.tags && card.tags.includes(tag)) {
        matchingCards.push({
          ...card,
          occupation: occupation,
          occupationName: occupationData.name
        })
      }
    })
  })

  return matchingCards
}

/**
 * TTS용 텍스트 정규화
 * @param {string} text - 한국어 텍스트
 * @returns {string} 정규화된 텍스트
 */
export function normalizeTTSText(text) {
  // 마침표, 쉼표 등을 적절한 휴지(pause)로 변환
  return text
    .replace(/\./g, '.')
    .replace(/,/g, ', ')
    .replace(/\?/g, '?')
    .replace(/!/g, '!')
    .trim()
}