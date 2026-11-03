import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import { useAuthStore } from "../stores/useAuthStore";

const routes = [
    {
        path: "/",
        name: "landing",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "home",
        component: HomeView,
        meta: { requiresAuth: true }
    },
    {
        path: "/learn",
        name: "learn",
        component: () => import("../views/LearnView.vue"),
        meta: { requiresAuth: true, underConstruction: true }
    },
    {
        path: "/wrong-answers",
        name: "wrong-answers",
        component: () => import("../views/WrongAnswersView.vue"),
        meta: { requiresAuth: true, title: "오답 노트" }
    },
    {
        path: "/review-test/:category",
        name: "review-test",
        component: () => import("../views/ReviewTestView.vue"),
        meta: {
            requiresAuth: true,
            title: "복습 테스트",
            hideFooter: true
        },
        props: true
    },


		// 카테고리 및 레벨에 따른 학습 페이지
		{
				path: "/learn/:category/:level",
				name: "learn-level",
				component: () => import("../views/LearnLevelView.vue"),
				meta: {
					requiresAuth: true ,
					title:"레벨 학습",
					hideFooter: true

				},
				props: true // URL 파라미터 props로 전달
		},

		// 카테고리별 마무리 테스트
		{
				path: "/final-test/:category",
				name: "final-test",
				component: () => import("../views/FinalTestView.vue"),
				meta: {
					requiresAuth: true,
					title: "마무리 테스트",
					hideFooter: true
				},
				props: true
		},

		// 마무리 테스트 해설 페이지
		{
				path: "/final-test-review",
				name: "final-test-review",
				component: () => import("../views/FinalTestReviewView.vue"),
				meta: {
					requiresAuth: true,
					title: "마무리 테스트 해설",
					hideFooter: true
				}
		},



    {
        path: "/vocabulary",
        name: "vocabulary",
        component: () => import("../views/VocabularyView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/game",
        name: "game-hub",
        component: () => import("../views/GameHubView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/game/initial-consonant",
        name: "initial-consonant-game",
        component: () => import("../views/VocabularyView.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/game/word-chain",
        name: "word-chain-game",
        component: () => import("../components/game/WordChainGame.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/game/spelling-quiz",
        name: "spelling-quiz-game",
        component: () => import("../components/game/SpellingQuizGame.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/game/typer",
        name: "typer-game",
        component: () => import("../components/game/TyperGame.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/game/bingo",
        name: "bingo-game",
        component: () => import("../components/game/BingoGame.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/game/crossword",
        name: "crossword-game",
        component: () => import("../components/game/CrosswordPuzzleGame.vue"),
        meta: { requiresAuth: true, hideFooter: true }
    },
    {
        path: "/profile",
        name: "profile",
        component: () => import("../views/ProfileView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/login",
        name: "login",
        component: () => import("../views/LoginView.vue"),
        meta: { guest: true }
    },
    {
        path: "/register",
        name: "register",
        component: () => import("../views/RegisterView.vue"),
        meta: { guest: true }
    },
    {
        path: "/level-test-intro",
        name: "level-test-intro",
        component: () => import("../views/LevelTestIntroView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/level-test",
        name: "level-test",
        component: () => import("../views/LevelTestView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/level-test/result",
        name: "level-test-result",
        component: () => import("../views/LevelTestResultView.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/about",
        name: "about",
        component: () => import("../views/AboutView.vue"),
    },
    {
        path: "/rtzrtest",
        name: "rtzrtest",
        component: () => import("../views/RtzrTest.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/speaking-test",
        name: "speaking-test",
        component: () => import("../views/SpeakingTest.vue"),
        meta: { requiresAuth: true }
    },
    {
        path: "/under-construction",
        name: "under-construction",
        component: () => import("../views/UnderConstructionView.vue")
    },
    {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: () => import("../views/UnderConstructionView.vue")
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        // 뒤로가기/앞으로가기 시 저장된 위치로 이동
        if (savedPosition) {
            return savedPosition;
        }
        // 새로운 페이지로 이동 시 맨 위로 스크롤
        return { top: 0, behavior: 'smooth' };
    }
});

// Navigation guards
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore();

    // Initialize auth on first load
    if (!authStore.isAuthenticated && authStore.token) {
        await authStore.initializeAuth();
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login' });
    }
    // Check if route is for guests only
    else if (to.meta.guest && authStore.isAuthenticated) {
        next({ name: 'home' });
    }
    else {
        next();
    }
});

export default router;
