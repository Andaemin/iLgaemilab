import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useLearningStore = defineStore('learning', () => {
  // State
  const dailyGoal = ref({
    targetMinutes: 30,
    completedMinutes: 0,
    streak: 0,
    lastStudyDate: null,
    tasks: []
  })

  const todayStats = ref({
    lessonsCompleted: 0,
    wordsLearned: 0,
    pronunciationScore: 0,
    quizScore: 0
  })

  const learningHistory = ref([])

  // Computed
  const progressPercentage = computed(() => {
    const totalTasks = dailyGoal.value.tasks.length
    if (totalTasks === 0) return 0
    const completedCount = dailyGoal.value.tasks.filter(t => t.completed).length
    return Math.round((completedCount / totalTasks) * 100)
  })

  const completedTasksCount = computed(() => {
    return dailyGoal.value.tasks.filter(task => task.completed).length
  })

  const isGoalCompleted = computed(() => {
    return progressPercentage.value >= 100
  })

  // Actions
  const fetchDailyGoal = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ 토큰 없음, 로컬 데이터 사용')
        return
      }

      const response = await axios.get('/api/learning/daily-goal', {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('🌐 서버에서 목표 데이터 가져옴:', response.data)

      // 서버 데이터와 로컬 데이터 병합 (서버 우선)
      if (response.data.goal) {
        const serverGoal = response.data.goal

        // 서버의 데이터로 업데이트
        dailyGoal.value.targetMinutes = serverGoal.targetMinutes || dailyGoal.value.targetMinutes
        dailyGoal.value.completedMinutes = serverGoal.completedMinutes || dailyGoal.value.completedMinutes
        dailyGoal.value.streak = serverGoal.streak || dailyGoal.value.streak

        // tasks는 서버 데이터 사용 (DB가 최신)
        if (serverGoal.tasks && serverGoal.tasks.length > 0) {
          dailyGoal.value.tasks = serverGoal.tasks
        }

        // 로컬스토리지에도 저장
        saveDailyProgress()
      }

      if (response.data.stats) {
        todayStats.value = response.data.stats
      }

      console.log('✅ 서버 데이터 병합 완료')
    } catch (error) {
      console.warn('⚠️ 서버 연결 실패, 로컬 데이터 사용:', error.message)
      // API 실패 시 로컬스토리지 데이터를 그대로 유지
    }
  }

  const initializeDefaultGoal = () => {
    const today = new Date().toDateString()
    const savedDate = localStorage.getItem('todayDate')

    // 날짜가 바뀌면 로컬스토리지 초기화
    if (savedDate && savedDate !== today) {
      console.log('🔄 새로운 날! 로컬스토리지 초기화')
      localStorage.removeItem('todayProgress')
      localStorage.setItem('todayDate', today)
    }

    const lastStudy = localStorage.getItem('lastStudyDate')

    // 스트릭 계산
    if (lastStudy) {
      const lastDate = new Date(lastStudy)
      const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        dailyGoal.value.streak = (parseInt(localStorage.getItem('streak') || '0') || 0) + 1
      } else if (diffDays > 1) {
        dailyGoal.value.streak = 0
      } else {
        dailyGoal.value.streak = parseInt(localStorage.getItem('streak') || '0') || 0
      }
    }

    // 오늘의 기본 태스크 설정 (titleKey로 변경)
    const defaultTasks = [
      {
        id: 1,
        titleKey: 'home.dailyGoal.completeLesson',
        completed: false,
        points: 10
      },
      {
        id: 2,
        titleKey: 'home.dailyGoal.learnWords',
        completed: false,
        points: 5
      },
      {
        id: 3,
        titleKey: 'home.dailyGoal.speakingPractice',
        completed: false,
        points: 5
      },
      {
        id: 4,
        titleKey: 'home.dailyGoal.reviewQuiz',
        completed: false,
        points: 5
      }
    ]

    // 로컬 스토리지에서 오늘 진행 상황 불러오기
    const todayProgress = localStorage.getItem('todayProgress')
    if (todayProgress && savedDate === today) {
      try {
        const progress = JSON.parse(todayProgress)
        dailyGoal.value.completedMinutes = progress.completedMinutes || 0
        dailyGoal.value.streak = progress.streak || dailyGoal.value.streak

        // 저장된 태스크와 기본 태스크 병합 (ID 기준)
        dailyGoal.value.tasks = defaultTasks.map(defaultTask => {
          const savedTask = progress.tasks?.find(t => t.id === defaultTask.id)
          return savedTask || defaultTask
        })

        // todayStats 복원
        if (progress.todayStats) {
          todayStats.value = progress.todayStats
        }

        console.log('💾 저장된 진행 상황 복원:', {
          completedMinutes: dailyGoal.value.completedMinutes,
          tasks: dailyGoal.value.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })),
          streak: dailyGoal.value.streak
        })
      } catch (error) {
        console.error('로컬스토리지 파싱 오류:', error)
        dailyGoal.value.tasks = defaultTasks
      }
    } else {
      dailyGoal.value.tasks = defaultTasks
      localStorage.setItem('todayDate', today)
    }
  }

  const updateTask = async (taskId, completed) => {
    console.log(`🔄 updateTask 호출 - taskId: ${taskId}, completed: ${completed}`)

    const task = dailyGoal.value.tasks.find(t => t.id === taskId)
    console.log('🔍 찾은 태스크:', task)

    if (!task) {
      console.error(`❌ taskId ${taskId}에 해당하는 태스크를 찾을 수 없음!`)
      return
    }

    const oldCompleted = task.completed

    // 1️⃣ 먼저 서버에 업데이트 (DB 먼저 업데이트)
    try {
      const token = localStorage.getItem('token')
      if (token) {
        console.log('🌐 서버에 태스크 업데이트 요청 중...')
        const response = await axios.patch(`/api/learning/tasks/${taskId}`,
          { completed },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        console.log('✅ 서버 업데이트 완료:', response.data)

        // 서버 응답에서 업데이트된 completedMinutes 반영
        if (response.data.completedMinutes !== undefined) {
          dailyGoal.value.completedMinutes = response.data.completedMinutes
        }
      }
    } catch (error) {
      console.error('❌ 서버 업데이트 실패:', error)
      // 서버 업데이트 실패해도 로컬은 업데이트 진행
    }

    // 2️⃣ 로컬 상태 업데이트
    task.completed = completed
    console.log(`📝 태스크 상태 변경: ${oldCompleted} → ${completed}`)
    console.log('📊 현재 모든 태스크:', dailyGoal.value.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))

    // 3️⃣ 로컬 스토리지 업데이트
    saveDailyProgress()
  }

  const addLearningTime = async (minutes, source = 'manual') => {
    // 30분 제한 - 이미 30분을 달성했으면 더 이상 추가하지 않음
    if (dailyGoal.value.completedMinutes >= 30) {
      console.log('⏰ 오늘의 학습 시간 목표 30분 달성! 추가 시간은 기록하지 않습니다.')
      return
    }

    // 추가할 시간이 30분을 초과하지 않도록 제한
    const remainingMinutes = 30 - dailyGoal.value.completedMinutes
    const actualMinutes = Math.min(minutes, remainingMinutes)

    // 로컬 업데이트
    dailyGoal.value.completedMinutes += actualMinutes

    console.log(`⏱️ 학습 시간 추가: +${actualMinutes}분 (총: ${dailyGoal.value.completedMinutes}/30분)`)

    // 말하기 연습 시간 추적
    if (source === 'speaking') {
      // 5분 이상이면 "발음 연습 5분" 미션 자동 완료
      if (actualMinutes >= 5) {
        const speakingTask = dailyGoal.value.tasks.find(t => t.id === 3)
        if (speakingTask && !speakingTask.completed) {
          await updateTask(3, true)
        }
      }
    }

    saveDailyProgress()

    // 서버 동기화
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/learning/add-time',
          { minutes: actualMinutes, source },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (error) {
      console.error('Failed to sync learning time:', error)
    }
  }

  const completeLesson = async () => {
    console.log('📚 completeLesson() 호출됨')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.warn('⚠️ 토큰 없음, 서버에 기록 불가')
        return
      }

      // 서버에 레슨 완료 요청 (서버에서 tasks, completedMinutes, lessonsCompleted 모두 업데이트)
      console.log('🌐 서버에 레슨 완료 요청 중...')
      const response = await axios.post('/api/learning/complete-lesson',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      console.log('✅ 서버 응답:', response.data)

      // 서버 응답으로 로컬 상태 업데이트
      if (response.data.tasks) {
        dailyGoal.value.tasks = response.data.tasks
      }
      if (response.data.lessonsCompleted !== undefined) {
        todayStats.value.lessonsCompleted = response.data.lessonsCompleted
      }

      // 로컬스토리지 업데이트
      saveDailyProgress()

      console.log('✅ 레슨 완료 처리 성공!')
      console.log('📊 업데이트된 태스크:', dailyGoal.value.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))
      console.log('📈 진행도:', progressPercentage.value, '%')

    } catch (error) {
      console.error('❌ 레슨 완료 처리 실패:', error)
      console.error('서버 응답:', error.response?.data)
    }
  }

  const addWordsLearned = async (count) => {
    todayStats.value.wordsLearned = (todayStats.value.wordsLearned || 0) + count

    // 10개 이상이면 "단어 10개 학습하기" 미션 자동 완료
    if (todayStats.value.wordsLearned >= 10) {
      const wordTask = dailyGoal.value.tasks.find(t => t.id === 2)
      if (wordTask && !wordTask.completed) {
        await updateTask(2, true)
      }
    }

    // 서버에 기록
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/learning/add-words',
          { count },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (error) {
      console.error('Failed to record words learned:', error)
    }
  }

  const completeQuiz = async () => {
    // 퀴즈 완료 시 "복습 퀴즈 풀기" 미션 자동 완료
    const quizTask = dailyGoal.value.tasks.find(t => t.id === 4)
    if (quizTask && !quizTask.completed) {
      await updateTask(4, true)
    }

    // 학습 시간도 추가 (퀴즈당 평균 5분)
    await addLearningTime(5, 'quiz')

    // 서버에 퀴즈 완료 기록
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await axios.post('/api/learning/complete-quiz',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (error) {
      console.error('Failed to record quiz completion:', error)
    }
  }

  const saveDailyProgress = () => {
    const today = new Date().toDateString()
    const progressData = {
      completedMinutes: dailyGoal.value.completedMinutes,
      tasks: dailyGoal.value.tasks,
      streak: dailyGoal.value.streak,
      todayStats: todayStats.value
    }

    localStorage.setItem('todayDate', today)
    localStorage.setItem('todayProgress', JSON.stringify(progressData))
    localStorage.setItem('lastStudyDate', today)
    localStorage.setItem('streak', dailyGoal.value.streak.toString())

    console.log('📝 학습 진행 상황 저장:', {
      completedMinutes: progressData.completedMinutes,
      tasks: progressData.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })),
      streak: progressData.streak
    })
  }

  const updateTodayStats = (statType, value) => {
    if (todayStats.value.hasOwnProperty(statType)) {
      todayStats.value[statType] = value
    }
  }

  const resetDailyGoal = () => {
    dailyGoal.value.completedMinutes = 0
    dailyGoal.value.tasks.forEach(task => {
      task.completed = false
    })
    saveDailyProgress()
  }

  // Initialize on store creation
  initializeDefaultGoal()

  return {
    // State
    dailyGoal,
    todayStats,
    learningHistory,

    // Computed
    progressPercentage,
    completedTasksCount,
    isGoalCompleted,

    // Actions
    fetchDailyGoal,
    updateTask,
    addLearningTime,
    completeLesson,
    addWordsLearned,
    completeQuiz,
    updateTodayStats,
    resetDailyGoal,
    saveDailyProgress
  }
}, {
  persist: false // Pinia persist 비활성화 - saveDailyProgress()로 수동 관리
})