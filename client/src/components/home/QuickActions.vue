<script setup>
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter();

const quickActions = [
    {
        titleKey: "home.quickActions.todayLesson",
        descKey: "home.quickActions.todayLessonDesc",
        icon: "📚",
        route: "/learn",
        color: "var(--common-blue)",
        bgColor: "var(--blue-50)",
    },
    {
        titleKey: "home.quickActions.speakingPractice",
        descKey: "home.quickActions.speakingPracticeDesc",
        icon: "🎤",
        route: "/speaking-test",
        color: "var(--primary)",
        bgColor: "var(--primary-light)",
    },
    {
        titleKey: "home.quickActions.wrongAnswers",
        descKey: "home.quickActions.wrongAnswersDesc",
        icon: "📝",
        route: "/wrong-answers",
        color: "var(--warning)",
        bgColor: "var(--warning-light)",
    },
    {
        titleKey: "home.quickActions.games",
        descKey: "home.quickActions.gamesDesc",
        icon: "🎮",
        route: "/game",
        color: "var(--success)",
        bgColor: "var(--success-light)",
    },
];

const handleAction = (route) => {
    router.push(route);
};
</script>

<template>
    <section class="quick-actions-section">
        <h2 class="section-title">{{ t('home.quickActions.title') }}</h2>
        <div class="quick-actions-grid">
            <button
                v-for="action in quickActions"
                :key="action.route"
                class="action-card"
                :style="{ backgroundColor: action.bgColor }"
                @click="handleAction(action.route)"
            >
                <span class="action-icon">{{ action.icon }}</span>
                <div class="action-content">
                    <h3 class="action-title" :style="{ color: action.color }">
                        {{ t(action.titleKey) }}
                    </h3>
                    <p class="action-description">{{ t(action.descKey) }}</p>
                </div>
                <span class="action-arrow">→</span>
            </button>
        </div>
    </section>
</template>

<style scoped>
.quick-actions-section {
    margin-bottom: var(--spacing-2xl);
}

.section-title {
    font-size: 20px;
    font-weight: 700;
    color: var(--gray-900);
    margin-bottom: var(--spacing-lg);
}

.quick-actions-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
}

.action-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: white;
    border: none;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    position: relative;
    overflow: hidden;
}

.action-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.action-card:active {
    transform: scale(0.98);
}

.action-icon {
    font-size: 36px;
    font-family: "TossFaceFont", system-ui;
    flex-shrink: 0;
}

.action-content {
    flex: 1;
    min-width: 0;
}

.action-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 4px;
}

.action-description {
    font-size: 12px;
    color: var(--gray-600);
    line-height: 1.3;
}

.action-arrow {
    position: absolute;
    right: var(--spacing-md);
    font-size: 20px;
    color: var(--gray-400);
    transition: transform var(--transition-fast);
}

.action-card:hover .action-arrow {
    transform: translateX(4px);
}

/* Mobile Responsive */
@media (max-width: 480px) {
    .quick-actions-section {
        margin-bottom: var(--spacing-xl);
    }

    .section-title {
        font-size: 18px;
        margin-bottom: var(--spacing-md);
    }

    .quick-actions-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-sm);
    }

    .action-card {
        padding: var(--spacing-md);
    }

    .action-icon {
        font-size: 28px;
    }

    .action-title {
        font-size: 15px;
    }

    .action-description {
        font-size: 11px;
    }

    .action-arrow {
        font-size: 18px;
    }
}

@media (max-width: 375px) {
    .action-card {
        padding: 12px;
        gap: 12px;
    }

    .action-icon {
        font-size: 24px;
    }

    .action-title {
        font-size: 14px;
    }

    .action-description {
        display: none; /* Hide description on very small screens */
    }
}
</style>
