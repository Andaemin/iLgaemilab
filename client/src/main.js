import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import i18n from "./plugins/i18n";
import { pinia } from "./stores";
import { useAuthStore } from "./stores/useAuthStore";
import axios from "axios";

// Vuetify 스타일 먼저 로드
import "vuetify/styles";
// 토스 스타일 디자인 시스템
import "./assets/styles/main.css";

// Configure axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3031";
axios.defaults.headers.common["Content-Type"] = "application/json";

const app = createApp(App);
app.use(pinia);

// Initialize auth store
const authStore = useAuthStore();
authStore.initializeAuth();

// Add axios interceptor to include auth token in all requests
axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid - logout user
            const authStore = useAuthStore();
            authStore.logout();
            router.push("/login");
        }
        return Promise.reject(error);
    }
);

app.use(router);
app.use(vuetify);
app.use(i18n);
app.mount("#app");
