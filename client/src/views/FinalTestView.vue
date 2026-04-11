finaltestvies

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useI18n } from 'vue-i18n'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

// URL에서 카테고리 가져오기 (beginner, intermediate, advanced)
const category = ref(route.params.category)

// 카테고리 정보
const categoryInfo = {
  beginner: {
    title: '초급',
    icon: '🌱',
    color: '#3182F6'
  },
  intermediate: {
    title: '중급',
    icon: '🌿',
    color: '#3182F6'
  },
  advanced: {
    title: '상급',
    icon: '🌳',
    color: '#3182F6'
  }
}

// 상태 관리
const isTestStarted = ref(false)
const isTestCompleted = ref(false)
const isLoadingQuestions = ref(false)
const questionsReady = ref(false) // 문제가 준비되었지만 아직 게임 중인 상태
const questions = ref([])
const answers = ref({}) // { questionIndex: selectedOptionIndex }
const score = ref(0)

// ========== 미니게임 상태 ==========
const miniGameScore = ref(0)
const fallingChars = ref([]) // 떨어지는 글자들
const gameLoopId = ref(null)
const charSpawnId = ref(null)
const gameAreaRef = ref(null)

// 추가 게임 상태
const combo = ref(0)
const maxCombo = ref(0)
const lives = ref(3)
const gameTime = ref(0) // 게임 진행 시간 (초)
const showComboEffect = ref(false)
const comboEffectText = ref('')
const screenShake = ref(false)
const missedChar = ref(null) // 놓친 글자 표시

// 한글 글자 목록 (감정/상태 표현에서 사용되는 글자들)
const koreanChars = [
  '행', '복', '슬', '퍼', '화', '나', '무', '서', '피', '곤',
  '심', '기', '분', '좋', '아', '요', '해', '워', '돼', '신',
  '외', '로', '걱', '정', '떨', '려', '싫', '어', '배',
  '고', '파', '목', '말', '라', '졸', '면', '합', '격', '축'
]

// 특별 글자
const goldenChars = ['★', '♥', '◆'] // 보너스 글자 (+30점)
const bombChar = '💣' // 폭탄 (잡으면 라이프 감소)

// 게임 시간 타이머
const gameTimeId = ref(null)

// 속도 배율 (시간이 지날수록 증가)
const speedMultiplier = computed(() => {
  return 1 + (gameTime.value * 0.02) // 1초당 2% 속도 증가 (중간 속도로 조정)
})

// 콤보 배율
const comboMultiplier = computed(() => {
  if (combo.value >= 20) return 3
  if (combo.value >= 10) return 2
  if (combo.value >= 5) return 1.5
  return 1
})

// 글자 생성
const spawnChar = () => {
  if (!gameAreaRef.value) return

  const areaWidth = gameAreaRef.value.offsetWidth || 400
  const id = Date.now() + Math.random()

  // 특별 글자 확률 결정
  const rand = Math.random()
  let char, type

  if (rand < 0.05) {
    // 5% 확률로 폭탄
    char = bombChar
    type = 'bomb'
  } else if (rand < 0.12) {
    // 7% 확률로 보너스 글자
    char = goldenChars[Math.floor(Math.random() * goldenChars.length)]
    type = 'golden'
  } else {
    // 일반 글자
    char = koreanChars[Math.floor(Math.random() * koreanChars.length)]
    type = 'normal'
  }

  const x = Math.random() * (areaWidth - 60) // 글자 크기 56px 고려
  const baseSpeed = 1.5 + Math.random() * 1.5 // 1.5~3 기본 속도 (중간 속도로 조정)
  const speed = baseSpeed * speedMultiplier.value // 시간에 따른 속도 증가

  fallingChars.value.push({
    id,
    char,
    x,
    y: -60,
    speed,
    type,
    caught: false
  })
}

// 콤보 이펙트 표시
const showCombo = (text) => {
  comboEffectText.value = text
  showComboEffect.value = true
  setTimeout(() => {
    showComboEffect.value = false
  }, 800)
}

// 화면 흔들림 효과
const triggerShake = () => {
  screenShake.value = true
  setTimeout(() => {
    screenShake.value = false
  }, 300)
}

// 글자 클릭
const catchChar = (charId, event) => {
  // 이벤트 전파 방지
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  const charIndex = fallingChars.value.findIndex(c => c.id === charId)
  if (charIndex !== -1 && !fallingChars.value[charIndex].caught) {
    const charObj = fallingChars.value[charIndex]
    charObj.caught = true

    // 폭탄 처리
    if (charObj.type === 'bomb') {
      lives.value--
      combo.value = 0
      triggerShake()
      showCombo('💥 BOOM!')

      if (lives.value <= 0) {
        // 게임 오버 상태 (하지만 게임은 계속 - 점수만 기록)
        showCombo('💀 GAME OVER')
      }
    } else {
      // 점수 계산
      let basePoints = charObj.type === 'golden' ? 30 : 10
      let earnedPoints = Math.floor(basePoints * comboMultiplier.value)
      miniGameScore.value += earnedPoints

      // 콤보 증가
      combo.value++
      if (combo.value > maxCombo.value) {
        maxCombo.value = combo.value
      }

      // 콤보 이펙트
      if (combo.value === 5) showCombo('🔥 5 COMBO!')
      else if (combo.value === 10) showCombo('⚡ 10 COMBO! x2')
      else if (combo.value === 20) showCombo('💎 20 COMBO! x3')
      else if (combo.value === 30) showCombo('🌟 30 COMBO!')
      else if (charObj.type === 'golden') showCombo(`✨ +${earnedPoints}`)
    }

    // 잡힌 글자 애니메이션 후 제거
    setTimeout(() => {
      fallingChars.value = fallingChars.value.filter(c => c.id !== charId)
    }, 300)
  }
}

// 게임 루프 - setInterval 사용으로 변경 (더 안정적인 클릭 처리)
const gameLoop = () => {
  if (!gameAreaRef.value) return

  const areaHeight = gameAreaRef.value.offsetHeight || 400

  // 글자 위치 업데이트 (배열을 새로 만들지 않고 직접 수정)
  for (let i = fallingChars.value.length - 1; i >= 0; i--) {
    const char = fallingChars.value[i]
    if (!char.caught) {
      char.y += char.speed
    }
    // 화면 밖으로 나간 글자 처리
    if (char.y >= areaHeight + 50) {
      // 일반/골든 글자를 놓치면 콤보 리셋 및 라이프 감소
      if (!char.caught && char.type !== 'bomb') {
        combo.value = 0
        lives.value--
        missedChar.value = char.char
        triggerShake()

        // 놓친 글자 표시 후 숨김
        setTimeout(() => {
          missedChar.value = null
        }, 500)

        if (lives.value <= 0) {
          showCombo('💀 GAME OVER')
        }
      }
      fallingChars.value.splice(i, 1)
    }
  }
}

// 미니게임 시작
const startMiniGame = () => {
  // 상태 초기화
  miniGameScore.value = 0
  fallingChars.value = []
  combo.value = 0
  maxCombo.value = 0
  lives.value = 3
  gameTime.value = 0
  missedChar.value = null
  showComboEffect.value = false

  // 글자 생성 시작 (0.7초마다 - 중간 속도로 조정)
  charSpawnId.value = setInterval(spawnChar, 700)

  // 게임 루프 시작 (30fps로 충분함 - 클릭 처리에 더 유리)
  gameLoopId.value = setInterval(gameLoop, 33)

  // 게임 시간 타이머 시작
  gameTimeId.value = setInterval(() => {
    gameTime.value++
  }, 1000)
}

// 미니게임 정지
const stopMiniGame = () => {
  if (charSpawnId.value) {
    clearInterval(charSpawnId.value)
    charSpawnId.value = null
  }
  if (gameLoopId.value) {
    clearInterval(gameLoopId.value)
    gameLoopId.value = null
  }
  if (gameTimeId.value) {
    clearInterval(gameTimeId.value)
    gameTimeId.value = null
  }
  fallingChars.value = []
}

// 미니게임 재시작 (게임 오버 후)
const restartMiniGame = () => {
  // 기존 게임 정지
  stopMiniGame()

  // 상태 초기화 후 재시작
  setTimeout(() => {
    startMiniGame()
  }, 100)
}

// 문제 풀러가기 버튼 클릭
const goToQuestions = () => {
  stopMiniGame()
  questionsReady.value = false
  isLoadingQuestions.value = false
  // 스크롤 포커스 상단 이동
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 현재 카테고리 정보
const currentCategoryInfo = computed(() => {
  return categoryInfo[category.value] || categoryInfo.beginner
})

// 진행률
const progress = computed(() => {
  const answeredCount = Object.keys(answers.value).length
  return (answeredCount / questions.value.length) * 100
})

// 정답률
const accuracy = computed(() => {
  if (questions.value.length === 0) return 0
  return Math.round((score.value / questions.value.length) * 100)
})

// 통과 여부 (80% 이상)
const isPassed = computed(() => {
  return accuracy.value >= 80
})

// 모든 문제를 답했는지
const isAllAnswered = computed(() => {
  return Object.keys(answers.value).length === questions.value.length
})

// 문제 가져오기
const fetchQuestions = async () => {
  isLoadingQuestions.value = true
  questionsReady.value = false

  // 미니게임 시작
  setTimeout(() => {
    startMiniGame()
  }, 500) // 로딩 화면이 렌더링된 후 시작

  try {
    const response = await axios.get(`/api/learning/final-test/${category.value}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      questions.value = response.data.questions
      console.log(`✅ ${category.value} 마무리 테스트 문제 ${questions.value.length}개 로드`)
      console.log(`  - 개인화 여부: ${response.data.personalized ? '예' : '아니오'}`)
      if (response.data.learningStats) {
        console.log(`  - 완료 레벨: ${response.data.learningStats.completedLevels}개`)
        console.log(`  - 약점 주제: ${response.data.learningStats.weakTopicsCount}개`)
      }

      // 문제가 준비되었음을 표시 (게임은 계속 진행)
      questionsReady.value = true
    }
  } catch (error) {
    console.error('❌ 마무리 테스트 문제 로드 실패:', error)
    stopMiniGame()
    alert('문제를 불러오는데 실패했습니다.')
    router.push({ name: 'learn' })
  }
  // 주의: isLoadingQuestions는 goToQuestions에서 false로 설정됨
}

// 테스트 시작
const startTest = () => {
  isTestStarted.value = true
  answers.value = {}
  score.value = 0
  // 스크롤 포커스 상단 이동
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)
}

// 답변 선택
const selectAnswer = (questionIndex, optionIndex) => {
  // 이미 제출한 후에는 답변 변경 불가
  if (isTestCompleted.value) return

  answers.value[questionIndex] = optionIndex
}

// 테스트 제출
const submitTest = async () => {
  if (!isAllAnswered.value) {
    alert('모든 문제에 답해주세요!')
    return
  }

  // 정답 체크 및 오답 수집
  let correctCount = 0
  const wrongAnswersList = []

  questions.value.forEach((question, index) => {
    const userAnswerIndex = answers.value[index]
    const isCorrect = userAnswerIndex === question.correctAnswer

    if (isCorrect) {
      correctCount++
    } else {
      // 오답 정보 수집
      wrongAnswersList.push({
        level: Math.floor(index / 4) + 1, // 주제별로 4문제씩이므로
        question: question.question,
        questionEn: question.questionEn,
        correctAnswer: question.options[question.correctAnswer],
        userAnswer: question.options[userAnswerIndex],
        options: question.options,
        explanation: question.explanation,
        explanationEn: question.explanationEn
      })
    }
  })

  score.value = correctCount

  // 결과 화면으로 전환
  isTestCompleted.value = true

  // 스크롤 포커스 상단 이동
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, 100)

  // 서버에 결과 저장 (오답 포함)
  try {
    const response = await axios.post('/api/learning/final-test-result', {
      category: category.value,
      score: score.value,
      totalQuestions: questions.value.length,
      passed: isPassed.value,
      wrongAnswers: wrongAnswersList
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    if (response.data.success) {
      console.log('✅ 마무리 테스트 결과 저장 완료')
      console.log(`  - 통과 여부: ${response.data.passed}`)
      console.log(`  - 오답 ${response.data.wrongAnswersSaved}개 저장됨`)

      // 결과 저장 후 최신 통과 상태 확인 (이미 통과한 경우 유지되었는지 확인)
      try {
        const statusResponse = await axios.get(`/api/learning/final-test-status/${category.value}`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        console.log('📊 최신 마무리 테스트 상태:', statusResponse.data)
        console.log(`  - 서버에 저장된 통과 여부: ${statusResponse.data.passed}`)
        console.log(`  - 서버에 저장된 점수: ${statusResponse.data.score}`)
      } catch (error) {
        console.error('❌ 마무리 테스트 상태 확인 실패:', error)
      }
    }
  } catch (error) {
    console.error('❌ 테스트 결과 저장 실패:', error)
  }
}

// 학습 페이지로 돌아가기
const goBackToLearn = () => {
  router.push({ name: 'learn' })
}

// 다시 시도
const retryTest = () => {
  isTestStarted.value = false
  isTestCompleted.value = false
  answers.value = {}
  score.value = 0
}

// 해설 페이지로 이동
const goToReview = () => {
  // 세션 스토리지에 문제와 답변 데이터 저장
  sessionStorage.setItem('finalTestQuestions', JSON.stringify(questions.value))
  sessionStorage.setItem('finalTestAnswers', JSON.stringify(answers.value))

  // 해설 페이지로 이동
  router.push({
    name: 'final-test-review',
    query: {
      category: category.value,
      score: score.value,
      total: questions.value.length
    }
  })
}

onMounted(() => {
  // query parameter로 결과 화면 바로 표시 요청이 있는지 확인
  if (route.query.showResult === 'true') {
    // 세션 스토리지에서 문제와 답변 복원
    const savedQuestions = sessionStorage.getItem('finalTestQuestions')
    const savedAnswers = sessionStorage.getItem('finalTestAnswers')

    if (savedQuestions && savedAnswers) {
      questions.value = JSON.parse(savedQuestions)
      answers.value = JSON.parse(savedAnswers)
      score.value = parseInt(route.query.score) || 0
      isTestCompleted.value = true

      // 스크롤을 맨 위로
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    } else {
      // 데이터가 없으면 처음부터 시작
      fetchQuestions()
    }
  } else {
    fetchQuestions()
  }
})

onUnmounted(() => {
  stopMiniGame()
})
</script>

<template>
  <div class="common-page">
    <AppHeader />

    <div class="common-container-md">
      <!-- 로딩 화면 + 미니게임 -->
      <div v-if="isLoadingQuestions" class="loading-section">
        <CommonCard class="loading-card mini-game-card" :class="{ 'shake': screenShake }">
          <div class="loading-content">
            <!-- 게임 헤더 -->
            <div class="game-header">
              <h2 class="game-title">한글 글자 잡기!</h2>
              <p class="game-instruction">
                떨어지는 글자를 터치! <span class="golden-hint">★ 보너스</span> / <span class="bomb-hint">💣 피하기</span>
              </p>

              <!-- 게임 상태 바 -->
              <div class="game-stats-bar">
                <!-- 라이프 -->
                <div class="lives-container">
                  <span v-for="i in 3" :key="i" class="life-heart" :class="{ 'lost': i > lives }">
                    {{ i <= lives ? '❤️' : '🖤' }}
                  </span>
                </div>

                <!-- 점수 -->
                <div class="game-score">
                  <span class="score-label">점수</span>
                  <span class="score-value">{{ miniGameScore }}</span>
                </div>

                <!-- 콤보 -->
                <div class="combo-container" :class="{ 'active': combo >= 5 }">
                  <span class="combo-value">{{ combo }}</span>
                  <span class="combo-label">COMBO</span>
                  <span v-if="comboMultiplier > 1" class="combo-multiplier">x{{ comboMultiplier }}</span>
                </div>
              </div>
            </div>

            <!-- 게임 영역 -->
            <div class="game-area" ref="gameAreaRef">
              <!-- 콤보 이펙트 -->
              <div v-if="showComboEffect" class="combo-effect">
                {{ comboEffectText }}
              </div>

              <!-- 놓친 글자 표시 -->
              <div v-if="missedChar" class="missed-char-effect">
                {{ missedChar }} MISS!
              </div>

              <!-- 게임 오버 오버레이 -->
              <div v-if="lives <= 0" class="game-over-overlay">
                <div class="game-over-content">
                  <span class="game-over-icon">💀</span>
                  <span class="game-over-text">GAME OVER</span>
                  <span class="game-over-score">최종 점수: {{ miniGameScore }}</span>
                  <span class="game-over-combo">최대 콤보: {{ maxCombo }}</span>
                  <button class="retry-game-button" @click.stop="restartMiniGame">
                    다시 하기
                  </button>
                </div>
              </div>

              <div
                v-for="char in fallingChars"
                :key="char.id"
                class="falling-char"
                :class="{
                  caught: char.caught,
                  golden: char.type === 'golden',
                  bomb: char.type === 'bomb'
                }"
                :style="{ left: char.x + 'px', top: char.y + 'px' }"
                @click.stop.prevent="catchChar(char.id, $event)"
                @touchstart.stop.prevent="catchChar(char.id, $event)"
                @mousedown.stop.prevent="catchChar(char.id, $event)"
              >
                {{ char.char }}
              </div>
            </div>

            <!-- 하단 정보 -->
            <div class="game-footer">
              <!-- 로딩 중 표시 -->
              <div v-if="!questionsReady" class="loading-status">
                <div class="mini-spinner"></div>
                <span>AI가 문제를 만들고 있어요...</span>
              </div>

              <!-- 문제 준비 완료 버튼 -->
              <div v-else class="ready-status">
                <div class="ready-message">
                  <span class="ready-icon">✨</span>
                  <span>문제가 준비되었습니다!</span>
                </div>
                <CommonButton variant="primary" @click="goToQuestions" class="go-button">
                  문제 풀러가기
                </CommonButton>
              </div>
            </div>
          </div>
        </CommonCard>
      </div>

      <!-- 시작 전 화면 -->
      <div v-else-if="!isTestStarted" class="intro-section">
        <CommonCard class="intro-card">
          <div class="intro-header">
            <div class="category-badge">
              <span class="category-icon">{{ currentCategoryInfo.icon }}</span>
              <span class="category-text">{{ currentCategoryInfo.title }}</span>
            </div>
            <h1 class="common-title1">마무리 테스트</h1>
            <p class="common-body1 intro-subtitle">
              {{ currentCategoryInfo.title }} 과정의 모든 학습을 마무리하는 테스트입니다
            </p>
          </div>

          <div class="test-info-grid">
            <div class="info-item">
              <div class="info-icon">📝</div>
              <div class="info-content">
                <div class="info-label">{{ t('finalTest.intro.questionCountLabel') }}</div>
                <div class="info-value">{{ t('finalTest.intro.questionsValue', { count: questions.length }) }}</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">⏱️</div>
              <div class="info-content">
                <div class="info-label">{{ t('finalTest.intro.estimatedTimeLabel') }}</div>
                <div class="info-value">{{ t('finalTest.intro.estimatedTimeValue') }}</div>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🎯</div>
              <div class="info-content">
                <div class="info-label">{{ t('finalTest.intro.passingScoreLabel') }}</div>
                <div class="info-value">{{ t('finalTest.intro.passingScoreValue') }}</div>
              </div>
            </div>
          </div>

          <div class="intro-notice">
            <div class="notice-icon">💡</div>
            <div class="notice-text">
              <strong>안내사항</strong>
              <ul>
                <li>총 {{ questions.length }}문제가 한 번에 출제됩니다</li>
                <li>모든 문제를 풀고 제출하면 결과를 확인할 수 있습니다</li>
                <li>정답률 80% 이상이면 통과입니다</li>
                <li>불합격 시 다시 도전할 수 있습니다</li>
              </ul>
            </div>
          </div>

          <div class="intro-actions">
            <CommonButton variant="outline" @click="goBackToLearn">
              돌아가기
            </CommonButton>
            <CommonButton variant="primary" @click="startTest">
              테스트 시작하기
            </CommonButton>
          </div>
        </CommonCard>
      </div>

      <!-- 테스트 진행 중 화면 -->
      <div v-else-if="isTestStarted && !isTestCompleted" class="test-section">
        <!-- 진행 상황 헤더 -->
        <div class="test-progress-header">
          <div class="progress-info">
            <span class="progress-label">{{ currentCategoryInfo.icon }} {{ currentCategoryInfo.title }} 마무리 테스트</span>
            <span class="progress-count">{{ Object.keys(answers).length }} / {{ questions.length }}</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <!-- 문제 목록 -->
        <div class="questions-container">
          <CommonCard
            v-for="(question, index) in questions"
            :key="index"
            class="question-card"
            :class="{ 'answered': answers[index] !== undefined }"
          >
            <div class="question-header">
              <span class="question-number">문제 {{ index + 1 }}</span>
              <span v-if="answers[index] !== undefined" class="answered-badge">✓ 답변완료</span>
            </div>

            <h3 class="question-text">{{ question.question }}</h3>
            <p v-if="question.questionEn" class="question-text-en">{{ question.questionEn }}</p>

            <!-- 선택지 -->
            <div class="options-list">
              <button
                v-for="(option, optionIndex) in question.options"
                :key="optionIndex"
                class="option-button"
                :class="{ 'selected': answers[index] === optionIndex }"
                @click="selectAnswer(index, optionIndex)"
              >
                <span class="option-number">{{ String.fromCharCode(65 + optionIndex) }}</span>
                <span class="option-text">{{ option }}</span>
                <span v-if="answers[index] === optionIndex" class="option-check">✓</span>
              </button>
            </div>
          </CommonCard>
        </div>

        <!-- 제출 버튼 (하단 고정) -->
        <div class="submit-section">
          <div class="submit-info">
            <span class="submit-text">{{ Object.keys(answers).length }} / {{ questions.length }} 문제 답변 완료</span>
          </div>
          <CommonButton
            variant="primary"
            @click="submitTest"
            :disabled="!isAllAnswered"
            class="submit-button"
          >
            {{ isAllAnswered ? '제출하기' : `${questions.length - Object.keys(answers).length}개 문제 남음` }}
          </CommonButton>
        </div>
      </div>

      <!-- 결과 화면 -->
      <div v-else-if="isTestCompleted" class="result-section">
        <CommonCard class="result-card">
          <div class="result-header">
            <div class="result-icon" :class="{ 'passed': isPassed, 'failed': !isPassed }">
              {{ isPassed ? '🎉' : '😢' }}
            </div>
            <h1 class="common-title1">{{ isPassed ? t('finalTest.result.passedTitle') : t('finalTest.result.failedTitle') }}</h1>
            <p class="common-body1 result-subtitle">
              {{ isPassed ? t('finalTest.result.passedSubtitle') : t('finalTest.result.failedSubtitle') }}
            </p>
          </div>

          <div class="result-stats">
            <div class="stat-item">
              <div class="stat-label">정답 수</div>
              <div class="stat-value">{{ score }} / {{ questions.length }}</div>
            </div>
            <div class="stat-item highlight">
              <div class="stat-label">정답률</div>
              <div class="stat-value" :class="{ 'passed': isPassed, 'failed': !isPassed }">
                {{ accuracy }}%
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">통과 기준</div>
              <div class="stat-value">80%</div>
            </div>
          </div>

          <div class="result-message" :class="{ 'passed': isPassed, 'failed': !isPassed }">
            <div class="message-icon">{{ isPassed ? '✅' : '❌' }}</div>
            <div class="message-text">
              <strong v-if="isPassed">{{ currentCategoryInfo.title }} 과정을 완료했습니다!</strong>
              <strong v-else>정답률 80% 이상이 필요합니다</strong>
              <p v-if="isPassed">다음 단계로 진행할 수 있습니다.</p>
              <p v-else>복습 후 다시 도전해보세요!</p>
            </div>
          </div>

          <!-- 해설 보기 버튼 -->
          <div class="review-button-section">
            <button class="review-link-button" @click="goToReview">
              <span class="review-link-icon">📖</span>
              <span class="review-link-text">문제 해설 보기</span>
              <span class="review-link-arrow">→</span>
            </button>
          </div>

          <div class="result-actions">
            <CommonButton variant="outline" @click="goBackToLearn">
              학습 페이지로
            </CommonButton>
            <CommonButton v-if="!isPassed" variant="primary" @click="retryTest">
              다시 도전하기
            </CommonButton>
            <CommonButton v-else variant="primary" @click="goBackToLearn">
              확인
            </CommonButton>
          </div>
        </CommonCard>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 공통 */
.common-page {
  min-height: 100vh;
  background: #f9fafb;
}

.common-container-md {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-lg);
}

/* 로딩 화면 + 미니게임 */
.loading-section {
  padding: var(--spacing-xl) 0;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  padding: var(--spacing-2xl);
}

.loading-content {
  text-align: center;
}

.mini-game-card {
  padding: var(--spacing-xl);
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
}

/* 게임 헤더 */
.game-header {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.game-title {
  font-size: 28px;
  font-weight: 800;
  color: #1f2937;
  margin: 0 0 var(--spacing-xs) 0;
}

.game-score {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, #3182F6, #60a5fa);
  padding: 12px 24px;
  border-radius: 30px;
  margin-top: var(--spacing-md);
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
}

.score-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.score-value {
  font-size: 28px;
  font-weight: 800;
  color: white;
}

.game-instruction {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* 게임 영역 */
.game-area {
  position: relative;
  width: 100%;
  height: 400px;
  background: linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
  border: 3px solid #bae6fd;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  box-shadow: inset 0 4px 20px rgba(49, 130, 246, 0.1);
}

.falling-char {
  position: absolute;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3182F6, #2563eb);
  color: white;
  font-size: 26px;
  font-weight: 700;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.3s ease, background 0.15s ease;
  box-shadow: 0 6px 16px rgba(49, 130, 246, 0.4);
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
  z-index: 10;
  touch-action: manipulation;
}

.falling-char:hover {
  transform: scale(1.15);
  box-shadow: 0 8px 20px rgba(49, 130, 246, 0.5);
}

.falling-char:active {
  transform: scale(0.9);
  background: linear-gradient(135deg, #10b981, #059669);
}

.falling-char.caught {
  transform: scale(2);
  opacity: 0;
  background: linear-gradient(135deg, #10b981, #059669);
  pointer-events: none;
}

/* 황금 글자 */
.falling-char.golden {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5), 0 0 15px rgba(251, 191, 36, 0.3);
  animation: goldenPulse 0.5s ease infinite;
}

@keyframes goldenPulse {
  0%, 100% {
    box-shadow: 0 6px 20px rgba(251, 191, 36, 0.5), 0 0 15px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 6px 25px rgba(251, 191, 36, 0.7), 0 0 25px rgba(251, 191, 36, 0.5);
  }
}

/* 폭탄 글자 */
.falling-char.bomb {
  background: linear-gradient(135deg, #374151, #1f2937);
  box-shadow: 0 6px 16px rgba(55, 65, 81, 0.5);
  animation: bombShake 0.3s ease infinite;
}

@keyframes bombShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

.falling-char.bomb:active,
.falling-char.bomb.caught {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* 게임 상태 바 */
.game-stats-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
}

/* 라이프 컨테이너 */
.lives-container {
  display: flex;
  gap: 4px;
}

.life-heart {
  font-size: 24px;
  transition: all 0.3s ease;
}

.life-heart.lost {
  opacity: 0.4;
  transform: scale(0.8);
}

/* 게임 스코어 (수정) */
.game-score {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #3182F6, #60a5fa);
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.3);
  margin-top: 0;
}

.score-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.score-value {
  font-size: 20px;
  font-weight: 800;
  color: white;
}

/* 콤보 컨테이너 */
.combo-container {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.combo-container.active {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  animation: comboPulse 0.5s ease infinite;
}

@keyframes comboPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.combo-value {
  font-size: 18px;
  font-weight: 800;
  color: #374151;
}

.combo-container.active .combo-value {
  color: white;
}

.combo-label {
  font-size: 10px;
  font-weight: 700;
  color: #6b7280;
}

.combo-container.active .combo-label {
  color: rgba(255, 255, 255, 0.9);
}

.combo-multiplier {
  font-size: 14px;
  font-weight: 800;
  color: #dc2626;
  background: white;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 콤보 이펙트 */
.combo-effect {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 900;
  color: #f59e0b;
  text-shadow: 0 2px 10px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.3);
  z-index: 100;
  animation: comboEffectAnim 0.8s ease forwards;
  pointer-events: none;
}

@keyframes comboEffectAnim {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  30% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.3);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -80%) scale(1);
  }
}

/* 놓친 글자 이펙트 */
.missed-char-effect {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 24px;
  font-weight: 800;
  color: #dc2626;
  z-index: 100;
  animation: missedAnim 0.5s ease forwards;
  pointer-events: none;
}

@keyframes missedAnim {
  0% {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px);
  }
}

/* 게임 오버 오버레이 */
.game-over-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.game-over-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.game-over-icon {
  font-size: 60px;
  animation: gameOverBounce 1s ease infinite;
}

@keyframes gameOverBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.game-over-text {
  font-size: 32px;
  font-weight: 900;
  color: #dc2626;
  text-shadow: 0 2px 10px rgba(220, 38, 38, 0.5);
}

.game-over-score {
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.game-over-combo {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-top: -4px;
}

.retry-game-button {
  margin-top: var(--spacing-md);
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #3182F6, #2563eb);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.4);
}

.retry-game-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(49, 130, 246, 0.5);
}

.retry-game-button:active {
  transform: scale(0.98);
}

/* 화면 흔들림 */
.mini-game-card.shake {
  animation: screenShake 0.3s ease;
}

@keyframes screenShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
}

/* 힌트 텍스트 */
.golden-hint {
  color: #f59e0b;
  font-weight: 700;
}

.bomb-hint {
  color: #6b7280;
  font-weight: 700;
}

/* 게임 푸터 */
.game-footer {
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) 0;
}

.loading-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  color: #6b7280;
  font-size: 16px;
  padding: var(--spacing-md) var(--spacing-lg);
  background: #f3f4f6;
  border-radius: 12px;
}

.mini-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #3182F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ready-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  animation: fadeInUp 0.5s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.ready-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 18px;
  font-weight: 700;
  color: #059669;
}

.ready-icon {
  font-size: 24px;
  animation: sparkle 1s ease infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
}

.go-button {
  padding: 16px 48px !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  animation: pulse-button 2s ease infinite;
  border-radius: 16px !important;
}

@keyframes pulse-button {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(49, 130, 246, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(49, 130, 246, 0);
  }
}

/* 시작 화면 */
.intro-section {
  padding: var(--spacing-xl) 0;
}

.intro-card {
  padding: var(--spacing-2xl);
}

.intro-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: #eff6ff;
  border-radius: 20px;
  margin-bottom: var(--spacing-lg);
}

.category-icon {
  font-size: 20px;
}

.category-text {
  font-size: 16px;
  font-weight: 700;
  color: #3182F6;
}

.intro-subtitle {
  color: #6b7280;
  margin-top: var(--spacing-sm);
}

.test-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.info-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background: #f9fafb;
  border-radius: 12px;
}

.info-icon {
  font-size: 32px;
}

.info-content {
  text-align: center;
}

.info-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.intro-notice {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: #fffbeb;
  border-radius: 12px;
  border: 1px solid #fcd34d;
  margin-bottom: var(--spacing-2xl);
}

.notice-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notice-text {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

.notice-text strong {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: #1f2937;
}

.notice-text ul {
  margin: 0;
  padding-left: 20px;
}

.notice-text li {
  margin-bottom: 4px;
}

.intro-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--spacing-md);
}

/* 테스트 진행 중 */
.test-section {
  padding-bottom: 100px;
}

.test-progress-header {
  position: sticky;
  top: 60px;
  background: white;
  padding: var(--spacing-lg);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--spacing-xl);
  z-index: 10;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.progress-label {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.progress-count {
  font-size: 14px;
  font-weight: 600;
  color: #3182F6;
}

.progress-bar-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3182F6, #60a5fa);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* 문제 카드 */
.questions-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.question-card {
  padding: var(--spacing-xl);
  transition: all 0.2s;
  border: 2px solid transparent;
}

.question-card.answered {
  border-color: #d1fae5;
  background: #f0fdf4;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.question-number {
  font-size: 14px;
  font-weight: 700;
  color: #3182F6;
}

.answered-badge {
  font-size: 12px;
  color: #059669;
  background: #d1fae5;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.6;
  margin-bottom: var(--spacing-sm);
}

.question-text-vi {
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
  margin-bottom: var(--spacing-lg);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.option-button:hover {
  border-color: #3182F6;
  background: #eff6ff;
}

.option-button.selected {
  border-color: #3182F6;
  background: #eff6ff;
}

.option-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f9fafb;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
  color: #6b7280;
  flex-shrink: 0;
}

.option-button.selected .option-number {
  background: #3182F6;
  color: white;
}

.option-text {
  flex: 1;
  font-size: 15px;
  color: #374151;
  line-height: 1.5;
}

.option-check {
  font-size: 18px;
  color: #3182F6;
}

/* 제출 섹션 */
.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: var(--spacing-lg);
  z-index: 100;
}

.submit-info {
  max-width: 900px;
  margin: 0 auto var(--spacing-sm);
  text-align: center;
}

.submit-text {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.submit-button {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: block;
  padding: var(--spacing-lg);
  font-size: 16px;
  font-weight: 700;
}

/* 결과 화면 */
.result-section {
  padding: var(--spacing-xl) 0;
}

.result-card {
  padding: var(--spacing-2xl);
}

.result-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.result-icon {
  font-size: 80px;
  margin-bottom: var(--spacing-lg);
}

.result-subtitle {
  color: #6b7280;
  margin-top: var(--spacing-sm);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-lg);
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item.highlight {
  background: #eff6ff;
  border: 2px solid #3182F6;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-value.passed {
  color: #059669;
}

.stat-value.failed {
  color: #dc2626;
}

.result-message {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  border-radius: 12px;
  margin-bottom: var(--spacing-2xl);
}

.result-message.passed {
  background: #ecfdf5;
  border: 2px solid #d1fae5;
}

.result-message.failed {
  background: #fef2f2;
  border: 2px solid #fecaca;
}

.message-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.message-text strong {
  display: block;
  font-size: 18px;
  margin-bottom: var(--spacing-xs);
}

.message-text.passed strong {
  color: #059669;
}

.message-text.failed strong {
  color: #dc2626;
}

.message-text p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* 오답 확인 */
.wrong-answers-section {
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: var(--spacing-lg);
}

.wrong-answers-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.wrong-answer-item {
  padding: var(--spacing-lg);
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 12px;
}

.wrong-question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.wrong-badge {
  font-size: 12px;
  color: #dc2626;
  background: #fecaca;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.wrong-question-text {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: var(--spacing-md);
}

.answer-comparison {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.user-answer,
.correct-answer {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 14px;
}

.user-answer .label {
  color: #dc2626;
  font-weight: 600;
}

.correct-answer .label {
  color: #059669;
  font-weight: 600;
}

.explanation {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-sm);
  border-top: 1px solid #fecaca;
}

.result-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

/* 반응형 */
@media (max-width: 768px) {
  .test-info-grid {
    grid-template-columns: 1fr;
  }

  .intro-actions {
    grid-template-columns: 1fr;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }

  .result-actions {
    grid-template-columns: 1fr;
  }

  .question-text {
    font-size: 16px;
  }

  .option-text {
    font-size: 14px;
  }

  .review-tabs {
    flex-wrap: wrap;
    gap: 8px;
  }

  .review-tab {
    padding: 8px 12px;
    font-size: 12px;
  }
}

/* ========== 해설 보기 버튼 ========== */
.review-button-section {
  margin-bottom: var(--spacing-xl);
}

.review-link-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #3182F6;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.review-link-button:hover {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(49, 130, 246, 0.2);
}

.review-link-button:active {
  transform: translateY(0);
}

.review-link-icon {
  font-size: 28px;
}

.review-link-text {
  flex: 1;
  text-align: left;
  margin-left: var(--spacing-md);
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
}

.review-link-arrow {
  font-size: 20px;
  color: #3182F6;
  font-weight: 700;
}
</style>
