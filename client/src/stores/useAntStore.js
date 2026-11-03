import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAntStore = defineStore('ant', () => {
  // State
  const ant = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const levelUpNotification = ref(null);
  const recentReward = ref(null);

  // Computed
  const isLoaded = computed(() => ant.value !== null);

  const antLevel = computed(() => ant.value?.level || 1);

  const antStage = computed(() => ant.value?.stage || 'egg');

  const antName = computed(() => ant.value?.antName || '개미');

  const totalExperience = computed(() => ant.value?.totalExperience || 0);

  const happiness = computed(() => ant.value?.happiness || 50);

  const progress = computed(() => ant.value?.progress || {
    percentage: 0,
    currentXp: 0,
    requiredXp: 300,
    isMaxLevel: false,
  });

  const levelInfo = computed(() => ant.value?.levelInfo || {
    name: '알',
    description: '작고 소중한 개미 알이에요',
  });

  const stats = computed(() => ({
    totalTasksCompleted: ant.value?.totalTasksCompleted || 0,
    lessonsCompleted: ant.value?.lessonsCompleted || 0,
    wordsLearned: ant.value?.wordsLearned || 0,
    speakingMinutes: ant.value?.speakingMinutes || 0,
    quizzesCompleted: ant.value?.quizzesCompleted || 0,
    totalStudyDays: ant.value?.totalStudyDays || 0,
    currentStreak: ant.value?.currentStreak || 0,
    longestStreak: ant.value?.longestStreak || 0,
    feedCount: ant.value?.feedCount || 0,
  }));

  const specialEvents = computed(() => ant.value?.specialEvents || []);

  const achievements = computed(() => ant.value?.achievements || []);

  // Actions

  /**
   * 개미 상태 불러오기
   */
  async function fetchAntStatus() {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get('/api/ant/status', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        ant.value = response.data.data;
        return response.data.data;
      } else {
        throw new Error(response.data.message || '개미 상태를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 상태 불러오기 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미에게 먹이 주기 (학습 활동 완료 시 호출)
   * @param {string} activityType - lesson, words, speaking, quiz, all_tasks, streak
   * @param {number} amount - 추가 정보 (단어 수, 연속일 등)
   */
  async function feedAnt(activityType, amount = null) {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.post(
        '/api/ant/feed',
        { activityType, amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        ant.value = response.data.data.ant;
        recentReward.value = response.data.data.reward;

        // 레벨업 시 알림 표시
        if (response.data.data.levelUp) {
          levelUpNotification.value = response.data.data.levelUp;

          // 3초 후 알림 자동 제거
          setTimeout(() => {
            levelUpNotification.value = null;
          }, 5000);
        }

        // 보상 알림도 3초 후 자동 제거
        setTimeout(() => {
          recentReward.value = null;
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.data.message || '먹이 주기에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 먹이 주기 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미 이름 변경
   * @param {string} newName
   */
  async function updateAntName(newName) {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.patch(
        '/api/ant/name',
        { name: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (ant.value) {
          ant.value.antName = response.data.data.antName;
        }
        return response.data.data.antName;
      } else {
        throw new Error(response.data.message || '이름 변경에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 이름 변경 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미 색상 변경
   * @param {string} newColor
   */
  async function updateAntColor(newColor) {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.patch(
        '/api/ant/color',
        { color: newColor },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        if (ant.value) {
          ant.value.antColor = response.data.data.antColor;
        }
        return response.data.data.antColor;
      } else {
        throw new Error(response.data.message || '색상 변경에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 색상 변경 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미 성장 이력 조회
   */
  async function fetchAntHistory() {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get('/api/ant/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '이력 조회에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 이력 조회 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 학습 통계와 동기화
   */
  async function syncStats() {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.get('/api/ant/sync-stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        ant.value = response.data.data.ant;
        return response.data.data;
      } else {
        throw new Error(response.data.message || '통계 동기화에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('통계 동기화 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 게임 완료 시 경험치 획득
   * @param {string} gameType - typing, wordchain, spelling, bingo, crossword, hangman
   */
  async function completeGame(gameType) {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.post(
        '/api/ant/game-complete',
        { gameType },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        ant.value = response.data.data.ant;
        recentReward.value = response.data.data.reward;

        // 레벨업 시 알림 표시
        if (response.data.data.levelUp) {
          levelUpNotification.value = response.data.data.levelUp;

          setTimeout(() => {
            levelUpNotification.value = null;
          }, 5000);
        }

        // 보상 알림도 3초 후 자동 제거
        setTimeout(() => {
          recentReward.value = null;
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.data.message || '게임 완료 처리에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('게임 완료 처리 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미 커스터마이징 (모자, 옷, 배경)
   * @param {Object} customization - { hat, clothes, background }
   */
  async function updateCustomization(customization) {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.patch(
        '/api/ant/customize',
        customization,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // 로컬 상태 업데이트
        if (ant.value) {
          if (customization.hat !== undefined) ant.value.hat = response.data.data.hat;
          if (customization.clothes !== undefined) ant.value.clothes = response.data.data.clothes;
          if (customization.background !== undefined) ant.value.background = response.data.data.background;
        }
        return response.data.data;
      } else {
        throw new Error(response.data.message || '꾸미기에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 꾸미기 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 개미 클릭 (행복도 1% + 경험치 10xp)
   */
  async function clickAnt() {
    loading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('인증 토큰이 없습니다.');
      }

      const response = await axios.post(
        '/api/ant/click',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        ant.value = response.data.data.ant;
        recentReward.value = response.data.data.reward;

        // 레벨업 시 알림 표시
        if (response.data.data.levelUp) {
          levelUpNotification.value = response.data.data.levelUp;

          setTimeout(() => {
            levelUpNotification.value = null;
          }, 5000);
        }

        // 보상 알림도 3초 후 자동 제거
        setTimeout(() => {
          recentReward.value = null;
        }, 3000);

        return response.data.data;
      } else {
        throw new Error(response.data.message || '개미 클릭에 실패했습니다.');
      }
    } catch (err) {
      error.value = err.message;
      console.error('개미 클릭 실패:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * 레벨업 알림 닫기
   */
  function closeLevelUpNotification() {
    levelUpNotification.value = null;
  }

  /**
   * 에러 초기화
   */
  function clearError() {
    error.value = null;
  }

  /**
   * 스토어 초기화 (로그아웃 시)
   */
  function reset() {
    ant.value = null;
    loading.value = false;
    error.value = null;
    levelUpNotification.value = null;
    recentReward.value = null;
  }

  return {
    // State
    ant,
    loading,
    error,
    levelUpNotification,
    recentReward,

    // Computed
    isLoaded,
    antLevel,
    antStage,
    antName,
    totalExperience,
    happiness,
    progress,
    levelInfo,
    stats,
    specialEvents,
    achievements,

    // Actions
    fetchAntStatus,
    feedAnt,
    updateAntName,
    updateAntColor,
    fetchAntHistory,
    syncStats,
    completeGame,
    updateCustomization,
    clickAnt,
    closeLevelUpNotification,
    clearError,
    reset,
  };
});
