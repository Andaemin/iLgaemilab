import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLearningStore } from '@/stores/useLearningStore'

/**
 * 학습 세션 시간 추적 Composable
 * - 페이지 진입/이탈 시 학습 시간 자동 추적
 * - 5분 이상 비활성 시 세션 종료
 * - 실제 활동 시간만 카운트
 */
export function useLearningSession(activityType = 'general') {
  const learningStore = useLearningStore()

  const sessionStartTime = ref(null)
  const lastActivityTime = ref(null)
  const accumulatedMinutes = ref(0)
  const inactivityTimer = ref(null)
  const activityCheckInterval = ref(null)

  const INACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5분 (밀리초)
  const CHECK_INTERVAL = 30 * 1000 // 30초마다 체크

  // 세션 시작
  const startSession = () => {
    const now = Date.now()
    sessionStartTime.value = now
    lastActivityTime.value = now

    console.log(`[Learning Session] Started: ${activityType}`)

    // 정기적으로 활동 체크
    activityCheckInterval.value = setInterval(checkActivity, CHECK_INTERVAL)

    // 사용자 활동 감지 리스너 등록
    registerActivityListeners()
  }

  // 사용자 활동 기록
  const recordActivity = () => {
    const now = Date.now()
    const timeSinceLastActivity = now - lastActivityTime.value

    // 비활성화 상태였다면 세션 재시작
    if (timeSinceLastActivity > INACTIVITY_THRESHOLD) {
      console.log('[Learning Session] Restarting after inactivity')
      sessionStartTime.value = now
    }

    lastActivityTime.value = now

    // 비활성화 타이머 리셋
    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
    }

    inactivityTimer.value = setTimeout(() => {
      pauseSession()
    }, INACTIVITY_THRESHOLD)
  }

  // 활동 체크
  const checkActivity = () => {
    if (!sessionStartTime.value) return

    const now = Date.now()
    const activeTime = lastActivityTime.value - sessionStartTime.value

    // 최소 1분 이상 활동 시 누적
    if (activeTime >= 60 * 1000) {
      const minutes = Math.floor(activeTime / (60 * 1000))
      accumulatedMinutes.value += minutes

      // 세션 시작 시간 리셋
      sessionStartTime.value = lastActivityTime.value

      console.log(`[Learning Session] Accumulated ${minutes} min (Total: ${accumulatedMinutes.value} min)`)
    }
  }

  // 세션 일시 정지
  const pauseSession = () => {
    if (!sessionStartTime.value) return

    checkActivity() // 마지막 체크

    console.log('[Learning Session] Paused due to inactivity')
    sessionStartTime.value = null

    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
      inactivityTimer.value = null
    }
  }

  // 세션 종료
  const endSession = async () => {
    if (activityCheckInterval.value) {
      clearInterval(activityCheckInterval.value)
      activityCheckInterval.value = null
    }

    if (inactivityTimer.value) {
      clearTimeout(inactivityTimer.value)
      inactivityTimer.value = null
    }

    // 마지막 체크
    checkActivity()

    removeActivityListeners()

    // 학습 시간이 있으면 서버에 기록
    if (accumulatedMinutes.value > 0) {
      console.log(`[Learning Session] Ended: ${activityType}, Total: ${accumulatedMinutes.value} min`)

      await learningStore.addLearningTime(accumulatedMinutes.value, activityType)

      // 리셋
      accumulatedMinutes.value = 0
      sessionStartTime.value = null
      lastActivityTime.value = null
    }
  }

  // 사용자 활동 감지 리스너
  const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

  const registerActivityListeners = () => {
    activityEvents.forEach(event => {
      document.addEventListener(event, recordActivity, { passive: true })
    })
  }

  const removeActivityListeners = () => {
    activityEvents.forEach(event => {
      document.removeEventListener(event, recordActivity)
    })
  }

  // 라이프사이클 훅
  onMounted(() => {
    startSession()
  })

  onBeforeUnmount(() => {
    endSession()
  })

  // visibility change 감지 (탭 전환 등)
  const handleVisibilityChange = () => {
    if (document.hidden) {
      pauseSession()
    } else {
      if (lastActivityTime.value && Date.now() - lastActivityTime.value < INACTIVITY_THRESHOLD) {
        startSession()
      }
    }
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  })

  return {
    accumulatedMinutes,
    recordActivity,
    endSession
  }
}
