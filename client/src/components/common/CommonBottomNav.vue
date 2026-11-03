<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import { useMainStore } from "@/stores/useMainStore";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const mainStore = useMainStore();

const navItems = computed(() => [
    {
        id: "home",
        label: t('nav.home'),
        icon: "🏠",
        path: "/home",
        requiresAuth: true,
    },
    {
        id: "learn",
        label: t('nav.learn'),
        icon: "📚",
        path: "/learn",
        requiresAuth: true,
    },
    {
        id: "game",
        label: t('nav.game'),
        icon: "🎮",
        path: "/game",
        requiresAuth: true,
    },
    {
        id: "practice",
        label: t('nav.practice'),
        icon: "🎤",
        path: "/speaking-test",
        requiresAuth: true,
    },
    {
        id: "worng-answers",
        label: t('nav.wrongAnswers'),
        icon: "📝",
        path: "/wrong-answers",
        requiresAuth: false,
    },
    // {
    //     id: "profile",
    //     label: t('nav.profile'),
    //     icon: "👤",
    //     path: "/profile",
    //     requiresAuth: true,
    // },
]);

// 현재 활성화된 탭 확인
const activeTab = computed(() => {
    const currentPath = route.path;
    const item = navItems.value.find((item) => currentPath.startsWith(item.path));
    return item?.id || "home";
});

// 로그인 안 된 경우 로그인/회원가입 탭만 보여주기
const guestNavItems = computed(() => [
    {
        id: "login",
        label: t('nav.login'),
        icon: "🔑",
        path: "/login",
    },
    {
        id: "register",
        label: t('nav.register'),
        icon: "✍️",
        path: "/register",
    },
]);

const visibleNavItems = computed(() => {
    return authStore.isAuthenticated ? navItems.value : guestNavItems.value;
});

const handleNavClick = (item) => {
    if (item.requiresAuth && !authStore.isAuthenticated) {
        router.push("/login");
        return;
    }
    router.push(item.path);
};

// 네비게이션 숨김 처리할 라우트들
const hideNavRoutes = ["/level-test", "/level-test-intro", "/login", "/register", "/game/word-chain", "/game/initial-consonant"];
const showNav = computed(() => {
    const currentPath = route.path;

    // 스토어에서 강제로 숨김 상태인 경우 (오답노트 카드 페이지 등)
    if (mainStore.hideBottomNav) {
        return false;
    }

    // 정확한 경로 매칭
    if (hideNavRoutes.includes(currentPath)) {
        return false;
    }

    // learn level 경로 패턴 매칭 (/learn/category/level)
    if (currentPath.match(/^\/learn\/[^/]+\/[^/]+$/)) {
        return false;
    }

    return true;
});
</script>

<template>
    <nav v-if="showNav" class="common-bottom-nav">
        <div class="nav-container">
            <button
                v-for="item in visibleNavItems"
                :key="item.id"
                class="nav-item"
                :class="{ 'nav-item-active': activeTab === item.id }"
                @click="handleNavClick(item)"
            >
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
                <div v-if="activeTab === item.id" class="active-indicator"></div>
            </button>
        </div>
    </nav>
</template>

<style scoped>
.common-bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 1px solid var(--gray-200);
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 56px;
    max-width: 500px;
    margin: 0 auto;
}

.nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    position: relative;
    transition: all var(--transition-fast);
    -webkit-tap-highlight-color: transparent;
}

.nav-item:active {
    transform: scale(0.95);
}

.nav-icon {
    font-size: 24px;
    font-family: "TossFaceFont", system-ui;
    transition: transform var(--transition-fast);
}

.nav-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--gray-500);
    transition: color var(--transition-fast);
}

.nav-item-active .nav-icon {
    transform: translateY(-2px);
}

.nav-item-active .nav-label {
    color: var(--common-blue);
    font-weight: 700;
}

.active-indicator {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 3px;
    background: var(--common-blue);
    border-radius: 0 0 3px 3px;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(-50%) translateY(-100%);
    }
    to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
    }
}

/* iOS 홈 인디케이터 대응 */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
    .common-bottom-nav {
        padding-bottom: env(safe-area-inset-bottom);
    }

    .nav-container {
        height: calc(56px + env(safe-area-inset-bottom));
        padding-bottom: env(safe-area-inset-bottom);
    }
}

/* 태블릿/데스크톱에서 네비게이션 최대 너비 제한 */
@media (min-width: 768px) {
    .common-bottom-nav {
        left: 50%;
        transform: translateX(-50%);
        max-width: 500px;
        border-left: 1px solid var(--gray-200);
        border-right: 1px solid var(--gray-200);
        border-radius: 16px 16px 0 0;
    }
}
</style>
