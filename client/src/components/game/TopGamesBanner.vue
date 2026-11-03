<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import axios from 'axios';

const router = useRouter();
const { t } = useI18n();
const topGames = ref([]);
const isLoading = ref(true);

// 게임 타입별 정보 매핑 (i18n 적용)
const gameInfo = computed(() => ({
  initial_consonant: {
    name: t('games.initialConsonant.title'),
    route: '/game/initial-consonant'
  },
  word_chain: {
    name: t('games.wordChain.title'),
    route: '/game/word-chain'
  },
  spelling_quiz: {
    name: t('games.spellingQuiz.title'),
    route: '/game/spelling-quiz'
  },
  typer: {
    name: t('games.typer.title'),
    route: '/game/typer'
  },
  bingo: {
    name: t('games.bingo.title'),
    route: '/game/bingo'
  },
  crossword_puzzle: {
    name: t('games.crossword.title'),
    route: '/game/crossword'
  }
}));

// 순위 이모지
const getRankEmoji = (rank) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return rank;
};

// 순위 변화 아이콘
const getRankChangeIcon = (change) => {
  if (change === 'up') return '↑';
  if (change === 'down') return '↓';
  if (change === 'new') return '↑'; // 새로운 게임도 상승 화살표로 표시
  if (change === 'same') return ''; // 순위 유지는 아이콘 없음
  return '';
};

// TOP 게임 조회
const fetchTopGames = async () => {
  try {
    isLoading.value = true;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3031';
    console.log('🔍 TOP 게임 조회 시작, API URL:', API_URL);
    const response = await axios.get(`${API_URL}/api/game-stats/top-games?limit=3`);

    console.log('📥 TOP 게임 API 응답:', response.data);
    if (response.data.success) {
      topGames.value = response.data.data;
      console.log('✅ TOP 게임 데이터:', topGames.value);
    }
  } catch (error) {
    console.error('❌ TOP 게임 조회 실패:', error);
    console.error('에러 상세:', error.response?.data || error.message);
  } finally {
    isLoading.value = false;
  }
};

// 게임으로 이동
const goToGame = (gameType) => {
  const game = gameInfo.value[gameType];
  if (game) {
    router.push(game.route);
  }
};

onMounted(() => {
  fetchTopGames();
});
</script>

<template>
  <div class="top-games-banner">
    <template v-if="isLoading">
      <span class="banner-prefix">{{ t('games.topGames.prefix') }}</span>
      <span class="loading-text">{{ t('games.topGames.loading') }}</span>
    </template>
    <template v-else-if="topGames.length > 0">
      <span class="banner-prefix">{{ t('games.topGames.prefix') }}</span>
      <span
        v-for="(game, index) in topGames"
        :key="game.gameType"
        class="game-item"
        @click="goToGame(game.gameType)"
      >
        <span class="rank-emoji">{{ getRankEmoji(game.rank) }}</span>
        <span class="game-name">{{ gameInfo[game.gameType]?.name }}</span>
        <span
          v-if="getRankChangeIcon(game.rankChange)"
          class="rank-change"
          :class="`change-${game.rankChange}`"
        >
          {{ getRankChangeIcon(game.rankChange) }}
        </span>
      </span>
    </template>
    <template v-else>
      <span class="banner-prefix">{{ t('games.topGames.prefix') }}</span>
      <span class="no-data-text">{{ t('games.topGames.noData') }}</span>
    </template>
  </div>
</template>

<style scoped>
.top-games-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 12px 0;
  margin-bottom: 16px;
  font-size: 14px;
  color: var(--gray-600);
}

.banner-prefix {
  font-weight: 700;
  color: var(--gray-700);
}

.game-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  transition: color 0.2s;
}

.game-item:hover .game-name {
  color: var(--common-blue);
  text-decoration: underline;
}

.rank-emoji {
  font-size: 16px;
  margin-right: 2px;
}

.game-name {
  font-weight: 700;
  color: var(--gray-700);
  margin-right: 4px;
}

.rank-change {
  font-size: 12px;
  font-weight: 600;
  padding: 1px 3px;
  border-radius: 3px;
  margin-right: 8px;
}

.change-up {
  color: #ef4444; /* 빨간색 */
}

.change-down {
  color: #3b82f6; /* 파란색 */
}

.change-new {
  color: #ef4444; /* 새 게임도 빨간색 상승 화살표 */
}

.loading-text {
  color: var(--gray-500);
  font-style: italic;
}

.no-data-text {
  color: var(--gray-500);
}

/* 반응형 */
@media (max-width: 768px) {
  .top-games-banner {
    font-size: 13px;
    padding: 6px 0;
  }

  .rank-change {
    font-size: 11px;
  }

  .change-new {
    font-size: 9px;
  }
}
</style>
