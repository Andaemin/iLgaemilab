<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "@/stores/useAuthStore";
import CommonButton from "@/components/common/CommonButton.vue";
import LanguageToggle from "@/components/common/LanguageToggle.vue";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.getUser);

const logout = () => {
    authStore.logout();
    router.push("/login");
};

const goHome = () => {
    router.push("/home");
};

const goProfile = () => {
    router.push("/profile");
};
</script>

<template>
    <header class="app-header">
        <div class="header-content">
            <div class="logo-section" @click="goHome">
                <span class="logo-icon">🐜</span>
                <span class="logo-text">{{ t('common.appName') }}</span>
            </div>
            <div class="user-section">
                <LanguageToggle />
                <span class="user-name" @click="goProfile">{{ t('common.userName', { name: user?.name }) }}</span>
                <CommonButton variant="ghost" size="small" class="logout-button" @click="logout">{{ t('common.logout') }}</CommonButton>
            </div>
        </div>
    </header>
</template>

<style scoped>
.app-header {
    padding: var(--spacing-md) 0;
    position: sticky;
    top: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    z-index: 1000;
    border-bottom: 1px solid var(--gray-100);
}

.header-content {
    max-width: var(--max-width);
    margin: 0 auto;
    padding: 0 var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    cursor: pointer;
    transition: all 0.2s;
    padding: 8px;
    margin-left: -8px;
    border-radius: 12px;
}

.logo-section:hover {
    background: var(--gray-50);
    transform: translateY(-1px);
}

.logo-section:active {
    transform: translateY(0);
}

.logo-icon {
    font-size: 20px;
    font-family: "TossFaceFont", system-ui;
}

.logo-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--gray-900);
}

.user-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
}

.user-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--gray-700);
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s;
}

.user-name:hover {
    background: var(--gray-50);
    color: var(--gray-900);
    transform: translateY(-1px);
}

.user-name:active {
    transform: translateY(0);
    background: var(--gray-100);
}

.logout-button {
    color: #dc2626 !important;
}

.logout-button:hover {
    background: #fef2f2 !important;
    color: #b91c1c !important;
}

/* Mobile Responsive */
@media (max-width: 480px) {
    .app-header {
        padding: var(--spacing-sm) 0;
    }

    .header-content {
        padding: 0 var(--spacing-md);
    }

    .logo-icon {
        font-size: 18px;
    }

    .logo-text {
        font-size: 16px;
    }

    .user-name {
        font-size: 13px;
    }

    .user-section .common-button {
        font-size: 12px;
        padding: 4px 8px;
    }
}

@media (max-width: 375px) {
    .logo-text {
        font-size: 15px;
    }

    .user-name {
        font-size: 12px;
    }
}
</style>
