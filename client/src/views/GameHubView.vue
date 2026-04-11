<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import AppHeader from "@/components/common/AppHeader.vue";
import TopGamesBanner from "@/components/game/TopGamesBanner.vue";

const { t } = useI18n();
const router = useRouter();

const goToGame = (gameType) => {
    if (gameType === "initial-consonant") {
        router.push("/game/initial-consonant");
    } else if (gameType === "word-chain") {
        router.push("/game/word-chain");
    } else if (gameType === "spelling-quiz") {
        router.push("/game/spelling-quiz");
    } else if (gameType === "typer") {
        router.push("/game/typer");
    } else if (gameType === "bingo") {
        router.push("/game/bingo");
    } else if (gameType === "crossword") {
        router.push("/game/crossword");
    }
};
</script>
<template>
    <div class="game-hub-page">
        <AppHeader />

        <div class="game-hub-content">
            <!-- 페이지 제목 -->
            <div class="page-header">
                <h1 class="common-title1">{{ t('games.title') }}</h1>
                <p class="common-body1 text-secondary">{{ t('games.subtitle') }}</p>
            </div>

            <!-- 인기 게임 TOP 3 배너 -->
            <div class="banner-wrapper">
                <TopGamesBanner />
            </div>

            <!-- 게임 카드 그리드 -->
            <div class="games-grid">
                <!-- 초성게임 -->
                <div class="game-card available" @click="goToGame('initial-consonant')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">🧩</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.initialConsonant.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.initialConsonant.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.initialConsonant.tag1') }}</span>
                        <span class="tag">{{ t('games.initialConsonant.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>

                <!-- 끝말잇기 -->
                <div class="game-card available" @click="goToGame('word-chain')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">💬</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.wordChain.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.wordChain.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.wordChain.tag1') }}</span>
                        <span class="tag">{{ t('games.wordChain.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>

                <!-- 맞춤법 퀴즈 -->
                <div class="game-card available" @click="goToGame('spelling-quiz')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">📝</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.spellingQuiz.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.spellingQuiz.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.spellingQuiz.tag1') }}</span>
                        <span class="tag">{{ t('games.spellingQuiz.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>

                <!-- 한글 타자 게임 -->
                <div class="game-card available" @click="goToGame('typer')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">🔥</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.typer.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.typer.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.typer.tag1') }}</span>
                        <span class="tag">{{ t('games.typer.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>

                <!-- 빙고 게임 -->
                <div class="game-card available" @click="goToGame('bingo')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">🎲</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.bingo.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.bingo.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.bingo.tag1') }}</span>
                        <span class="tag">{{ t('games.bingo.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>

                <!-- 크로스워드 퍼즐 -->
                <div class="game-card available" @click="goToGame('crossword')">
                    <div class="game-icon-wrapper">
                        <span class="game-icon">🎭</span>
                    </div>
                    <h3 class="common-title3">{{ t('games.crossword.title') }}</h3>
                    <p class="common-body3 text-secondary">{{ t('games.crossword.description') }}</p>
                    <div class="game-tags">
                        <span class="tag">{{ t('games.crossword.tag1') }}</span>
                        <span class="tag">{{ t('games.crossword.tag2') }}</span>
                    </div>
                    <div class="game-status-badge available">{{ t('games.available') }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.game-hub-page {
    min-height: 100vh;
    background: var(--gray-50);
    display: flex;
    flex-direction: column;
}

.game-hub-content {
    max-width: 1350px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.page-header {
    text-align: center;
    margin-bottom: 32px;
}

.page-header h1 {
    margin-bottom: 12px;
    color: var(--gray-900);
}

.page-header p {
    color: var(--gray-600);
}

.banner-wrapper {
    text-align: center;
    margin-bottom: 24px;
}

/* 게임 카드 그리드 */
.games-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    max-width: 1350px;
    width: 100%;
    margin: 0 auto;
    flex: 1;
    align-content: center;
}

.game-card {
    background: white;
    border-radius: var(--radius-lg);
    padding: 24px 20px;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    min-height: 180px;
    box-shadow: var(--shadow-sm);
    gap: 12px;
}

.game-card.available {
    cursor: pointer;
}

.game-card.available:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
}

.game-card.disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.game-icon-wrapper {
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, var(--gray-50), white);
    border-radius: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.game-icon {
    font-size: 56px;
}

.game-card h3 {
    margin: 0;
    margin-bottom: 8px;
    color: var(--gray-900);
    font-size: 18px;
    font-weight: 600;
}

.game-card p {
    margin: 0;
    line-height: 1.4;
    font-size: 13px;
}

.game-tags {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
}

.tag {
    padding: 4px 12px;
    background: var(--gray-100);
    border-radius: var(--radius-md);
    font-size: 12px;
    font-weight: 500;
    color: var(--gray-700);
}

.game-status-badge {
    margin-top: auto;
    padding: 8px 16px;
    border-radius: var(--radius-lg);
    font-size: 13px;
    font-weight: 600;
}

.game-status-badge.available {
    background: var(--common-blue);
    color: white;
}

.game-status-badge.disabled {
    background: var(--gray-200);
    color: var(--gray-600);
}

/* 태블릿 */
@media (max-width: 768px) {
    .game-hub-content {
        padding: 16px;
    }

    .games-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        align-content: start;
        padding-top: 16px;
    }

    .game-card {
        min-height: 160px;
        padding: 20px 16px;
    }

    .game-icon-wrapper {
        width: 72px;
        height: 72px;
    }

    .game-icon {
        font-size: 48px;
    }

    .game-card h3 {
        font-size: 16px;
    }
}

/* 모바일 */
@media (max-width: 480px) {
    .game-hub-content {
        padding: 12px;
    }

    .games-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding-top: 16px;
    }

    .game-card {
        min-height: 150px;
        padding: 16px;
    }

    .game-icon-wrapper {
        width: 56px;
        height: 56px;
    }

    .game-icon {
        font-size: 40px;
    }

    .game-card h3 {
        font-size: 14px;
    }

    .game-card p {
        font-size: 12px;
    }
}
</style>
