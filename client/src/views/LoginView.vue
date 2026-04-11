<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import CommonInput from '@/components/common/CommonInput.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const rememberMe = ref(false)

// Form data
const formData = reactive({
  email: '',
  password: ''
})

// Validation errors
const errors = reactive({
  email: '',
  password: ''
})

// Toast notification
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

// Validation
const validateEmail = () => {
  if (!formData.email) {
    errors.email = t('auth.validation.emailRequired')
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.validation.emailInvalid')
    return false
  }
  errors.email = ''
  return true
}

const validatePassword = () => {
  if (!formData.password) {
    errors.password = t('auth.validation.passwordRequired')
    return false
  }
  if (formData.password.length < 6) {
    errors.password = t('auth.validation.passwordMinLength', { count: 6 })
    return false
  }
  errors.password = ''
  return true
}

const validateForm = () => {
  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()
  return isEmailValid && isPasswordValid
}

// Login
const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const response = await axios.post('/api/auth/login', {
      email: formData.email,
      password: formData.password
    })

    if (response.data.success) {
      // 사용자 정보 저장
      authStore.setUser(response.data.user)

      // 토큰 저장
      if (response.data.token) {
        authStore.setToken(response.data.token)
      }

      // 로그인 상태 유지
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
      }

      showToast(t('auth.login.success'), 'success')

      // 리다이렉트
      setTimeout(() => {
        if (!response.data.user.levelTestCompleted) {
          router.push('/level-test-intro')
        } else {
          router.push('/')
        }
      }, 1000)
    }
  } catch (error) {
    console.error('Login error:', error)
    showToast(
      error.response?.data?.message || t('auth.login.failed'),
      'error'
    )
  } finally {
    loading.value = false
  }
}

// Toast notification
const showToast = (message, type = 'success') => {
  toast.message = message
  toast.type = type
  toast.show = true

  setTimeout(() => {
    toast.show = false
  }, 3000)
}

</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo & Title -->
      <div class="login-header">
        <div class="logo-container">
          <span class="logo-emoji">🐜</span>
        </div>
        <h1>{{ t('auth.login.welcomeBack') }}</h1>
        <p class="subtitle">{{ t('auth.login.subtitle') }}</p>
      </div>

      <!-- Login Form -->
      <CommonCard class="login-card common-animate-fade-in">
        <form @submit.prevent="handleLogin">
          <CommonInput
            v-model="formData.email"
            type="email"
            :label="t('auth.login.email')"
            placeholder="example@email.com"
            :error="errors.email"
            icon="✉️"
            @blur="validateEmail"
            class="common-mb-lg"
          />

          <CommonInput
            v-model="formData.password"
            type="password"
            :label="t('auth.login.password')"
            :placeholder="t('auth.login.passwordPlaceholder')"
            :error="errors.password"
            icon="🔒"
            @blur="validatePassword"
            class="common-mb-md"
          />

          <label class="remember-me">
            <input
              v-model="rememberMe"
              type="checkbox"
              class="checkbox"
            />
            <span class="common-body2">{{ t('auth.login.rememberMe') }}</span>
          </label>

          <CommonButton
            type="submit"
            variant="primary"
            size="large"
            full-width
            :loading="loading"
            :disabled="loading"
            class="common-mt-2xl"
          >
            {{ t('auth.login.submit') }}
          </CommonButton>

          <CommonButton
            type="button"
            variant="secondary"
            size="large"
            full-width
            @click="router.push('/register')"
            class="common-mt-md"
          >
            {{ t('auth.login.signUp') }}
          </CommonButton>
        </form>
      </CommonCard>

      <!-- Footer -->
      <div class="login-footer">
        <p class="common-caption">
          © 2024 ILgaemiLab. All rights reserved.
        </p>
      </div>
    </div>

    <!-- Toast Notification -->
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`, 'common-animate-fade-in']">
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.login-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 var(--spacing-2xl);
}

.login-header {
  padding-top: 60px;
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.logo-container {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-xl);
  background: var(--common-blue-light);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-emoji {
  font-size: 32px;
  font-family: 'TossFaceFont', system-ui;
}

.login-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
}

.subtitle {
  color: var(--gray-600);
  font-size: 18px;
}

.login-card {
  background: var(--gray-50);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: var(--spacing-2xl) var(--spacing-xl);
  margin-bottom: var(--spacing-2xl);
  border-radius: var(--radius-xl);
  border: 1px solid var(--gray-100);
}

.remember-me {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-sm);
}

.checkbox {
  width: 24px;
  height: 24px;
  cursor: pointer;
  accent-color: var(--common-blue);
}

.login-footer {
  text-align: center;
  padding: var(--spacing-xl) 0;
  margin-top: auto;
  color: var(--gray-600);
  font-size: 14px;
}

/* Toast */
.toast {
  position: fixed;
  top: var(--spacing-lg);
  left: 50%;
  transform: translateX(-50%);
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  font-weight: 500;
}

.toast-success {
  background: var(--success);
  color: white;
}

.toast-error {
  background: var(--danger);
  color: white;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 0 var(--spacing-lg);
    max-width: 100%;
  }

  .login-header {
    padding-top: 40px;
    margin-bottom: var(--spacing-2xl);
  }

  .logo-container {
    width: 64px;
    height: 64px;
  }

  .logo-emoji {
    font-size: 32px;
  }

  .login-header h1 {
    font-size: 32px;
  }

  .subtitle {
    font-size: 16px;
  }

  .login-card {
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .login-footer {
    padding: var(--spacing-lg) 0;
  }
}
</style>
