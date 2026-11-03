<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/useAuthStore'
import axios from 'axios'
import CommonCard from '@/components/common/CommonCard.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import CommonInput from '@/components/common/CommonInput.vue'
import CommonSelect from '@/components/common/CommonSelect.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// State
const currentStep = ref(0)
const loading = ref(false)

// Form data
const formData = reactive({
  // Step 1: 기본 정보
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',

  // Step 2: 추가 정보
  phoneNumber: '',
  nativeLanguage: '',
  occupationCategory: '',
  koreanLevel: 'beginner',
  agreeTerms: false
})

// Validation errors
const errors = reactive({
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phoneNumber: '',
  nativeLanguage: '',
  occupationCategory: ''
})

// Toast notification
const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

// Options for selects
const languages = computed(() => [
  { value: 'vi', label: t('auth.register.languages.vi') },
  { value: 'th', label: t('auth.register.languages.th') },
  { value: 'ph', label: t('auth.register.languages.ph') },
  { value: 'id', label: t('auth.register.languages.id') },
  { value: 'my', label: t('auth.register.languages.my') },
  { value: 'kh', label: t('auth.register.languages.kh') },
  { value: 'np', label: t('auth.register.languages.np') },
  { value: 'other', label: t('auth.register.languages.other') }
])

const occupations = computed(() => [
  { value: 'manufacturing', label: t('auth.register.occupations.manufacturing') },
  { value: 'construction', label: t('auth.register.occupations.construction') },
  { value: 'agriculture', label: t('auth.register.occupations.agriculture') },
  { value: 'logistics', label: t('auth.register.occupations.logistics') },
  { value: 'service', label: t('auth.register.occupations.service') },
  { value: 'other', label: t('auth.register.occupations.other') }
])

const koreanLevels = computed(() => [
  { value: 'beginner', label: t('auth.register.levels.beginner') },
  { value: 'intermediate', label: t('auth.register.levels.intermediate') },
  { value: 'advanced', label: t('auth.register.levels.advanced') }
])

// Computed
const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return formData.email && formData.password &&
           formData.passwordConfirm && formData.name &&
           !errors.email && !errors.password &&
           !errors.passwordConfirm && !errors.name
  } else if (currentStep.value === 1) {
    return formData.nativeLanguage && formData.occupationCategory &&
           formData.agreeTerms
  }
  return true
})

// Methods
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
  if (formData.password.length < 8) {
    errors.password = t('auth.validation.passwordMinLength', { count: 8 })
    return false
  }
  errors.password = ''
  return true
}

const validatePasswordConfirm = () => {
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = t('auth.validation.passwordConfirmRequired')
    return false
  }
  if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = t('auth.validation.passwordMismatch')
    return false
  }
  errors.passwordConfirm = ''
  return true
}

const validateName = () => {
  if (!formData.name) {
    errors.name = t('auth.validation.nameRequired')
    return false
  }
  if (formData.name.length < 2) {
    errors.name = t('auth.validation.nameMinLength')
    return false
  }
  errors.name = ''
  return true
}

const nextStep = async () => {
  if (currentStep.value === 0) {
    // Validate step 1
    const isValid = validateEmail() & validatePassword() &
                   validatePasswordConfirm() & validateName()
    if (isValid) {
      currentStep.value++
    }
  } else if (currentStep.value === 1) {
    // Submit form
    await handleRegister()
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleRegister = async () => {
  loading.value = true

  try {
    const response = await axios.post('/api/auth/register', {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      nativeLanguage: formData.nativeLanguage,
      occupationCategory: formData.occupationCategory,
      koreanLevel: formData.koreanLevel
    })

    if (response.data.success) {
      // Store user data and token
      authStore.setUser(response.data.user)
      authStore.setToken(response.data.token)

      // Show completion step
      currentStep.value = 2

      // Redirect after animation
      setTimeout(() => {
        router.push('/level-test-intro')
      }, 3000)
    }
  } catch (error) {
    console.error('Registration error:', error)
    let message = t('auth.register.errorGeneric')

    if (error.response?.data?.message) {
      message = error.response.data.message
    } else if (error.response?.status === 409) {
      message = t('auth.register.errorDuplicate')
    }

    toast.message = message
    toast.type = 'error'
    toast.show = true

    setTimeout(() => {
      toast.show = false
    }, 3000)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Header -->
      <div class="register-header">
        <div class="logo-container">
          <span class="logo-emoji">🐜</span>
        </div>
        <h1>{{ t('auth.register.welcome') }}</h1>
        <p class="subtitle">
          {{ t('auth.register.subtitle') }}
        </p>
      </div>

      <!-- Stepper -->
      <div class="stepper">
        <div
          v-for="step in 3"
          :key="step"
          class="step-indicator"
          :class="{
            'active': currentStep === step - 1,
            'completed': currentStep > step - 1
          }"
          @click="step - 1 < currentStep ? currentStep = step - 1 : null"
        >
          {{ currentStep > step - 1 ? '✓' : step }}
        </div>
      </div>

      <!-- Form Card -->
      <CommonCard class="register-card">
        <form @submit.prevent="nextStep">
          <!-- Step 1: 기본 정보 -->
          <div v-show="currentStep === 0" class="step-content">
            <h2 class="step-title">{{ t('auth.register.step1Title') }}</h2>

            <CommonInput
              v-model="formData.email"
              type="email"
              :label="t('auth.register.email')"
              :placeholder="t('auth.register.emailPlaceholder')"
              :error="errors.email"
              icon="✉️"
              required
              @blur="validateEmail"
              class="common-mb-lg"
            />

            <CommonInput
              v-model="formData.password"
              type="password"
              :label="t('auth.register.password')"
              :placeholder="t('auth.register.passwordPlaceholder')"
              :error="errors.password"
              icon="🔒"
              required
              @blur="validatePassword"
              class="common-mb-lg"
            />

            <CommonInput
              v-model="formData.passwordConfirm"
              type="password"
              :label="t('auth.register.confirmPassword')"
              :placeholder="t('auth.register.confirmPasswordPlaceholder')"
              :error="errors.passwordConfirm"
              icon="🔒"
              required
              @blur="validatePasswordConfirm"
              class="common-mb-lg"
            />

            <CommonInput
              v-model="formData.name"
              type="text"
              :label="t('auth.register.name')"
              :placeholder="t('auth.register.namePlaceholder')"
              :error="errors.name"
              icon="👤"
              required
              @blur="validateName"
              class="common-mb-lg"
            />
          </div>

          <!-- Step 2: 추가 정보 -->
          <div v-show="currentStep === 1" class="step-content">
            <h2 class="step-title">{{ t('auth.register.step2Title') }}</h2>

            <CommonInput
              v-model="formData.phoneNumber"
              type="tel"
              :label="t('auth.register.phoneOptional')"
              :placeholder="t('auth.register.phonePlaceholder')"
              icon="📱"
              class="common-mb-lg"
            />

            <CommonSelect
              v-model="formData.nativeLanguage"
              :label="t('auth.register.nativeLanguage')"
              :placeholder="t('auth.register.nativeLanguagePlaceholder')"
              :options="languages"
              :error="errors.nativeLanguage"
              icon="💬"
              required
              class="common-mb-lg"
            />

            <CommonSelect
              v-model="formData.occupationCategory"
              :label="t('auth.register.occupationCategory')"
              :placeholder="t('auth.register.occupationPlaceholder')"
              :options="occupations"
              :error="errors.occupationCategory"
              icon="💼"
              required
              class="common-mb-lg"
            />

            <CommonSelect
              v-model="formData.koreanLevel"
              :label="t('auth.register.koreanLevel')"
              :placeholder="t('auth.register.koreanLevelPlaceholder')"
              :options="koreanLevels"
              icon="📚"
              class="common-mb-lg"
            />

            <div class="terms-container">
              <label class="terms-checkbox">
                <input
                  v-model="formData.agreeTerms"
                  type="checkbox"
                  class="checkbox"
                />
                <span class="common-body2">
                  <a href="#" @click.prevent class="link">{{ t('auth.register.termsLink') }}</a>{{ t('auth.register.termsAndPrivacy').includes('과') ? '과' : '' }}
                  <a href="#" @click.prevent class="link">{{ t('auth.register.privacyLink') }}</a>{{ t('auth.register.termsAndPrivacy').includes('에') ? '에' : '' }}
                  {{ t('auth.register.agreeTerms') }}
                </span>
              </label>
            </div>
          </div>

          <!-- Step 3: 완료 -->
          <div v-show="currentStep === 2" class="step-content completion">
            <div class="completion-icon">🎉</div>
            <h2 class="step-title">{{ t('auth.register.completionTitle') }}</h2>
            <p class="common-body1 completion-message">
              {{ t('auth.register.completionMessage', { name: formData.name }) }}<br>
              {{ t('auth.register.completionSubtitle') }}
            </p>
            <div class="completion-loading">
              <div class="loading-bar"></div>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="currentStep < 2" class="form-actions">
            <CommonButton
              v-if="currentStep > 0"
              type="button"
              variant="secondary"
              size="large"
              @click="prevStep"
            >
              {{ t('auth.register.previous') }}
            </CommonButton>
            <CommonButton
              type="submit"
              variant="primary"
              size="large"
              :full-width="currentStep === 0"
              :loading="loading"
              :disabled="!canProceed || loading"
            >
              {{ currentStep === 1 ? t('auth.register.submit') : t('auth.register.next') }}
            </CommonButton>
          </div>
        </form>
      </CommonCard>

      <!-- Footer -->
      <div class="register-footer">
        {{ t('auth.register.hasAccount') }}
        <a href="#" @click.prevent="router.push('/login')">
          {{ t('auth.register.signIn') }}
        </a>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.show" :class="['toast', `toast-${toast.type}`]">
      {{ toast.message }}
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
}

.register-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  padding: 0 var(--spacing-2xl);
}

.register-header {
  padding-top: 60px;
  margin-bottom: var(--spacing-2xl);
}

.logo-container {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-lg);
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

.register-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: var(--spacing-sm);
  line-height: 1.3;
}

.subtitle {
  color: var(--gray-600);
  font-size: 16px;
}

/* Stepper */
.stepper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3xl);
  padding: 0 60px;
  position: relative;
}

.stepper::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 80px;
  right: 80px;
  height: 2px;
  background: var(--gray-200);
  transform: translateY(-50%);
  z-index: 0;
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--gray-300);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  color: var(--gray-500);
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  z-index: 1;
}

.step-indicator.active {
  background: var(--common-blue);
  border-color: var(--common-blue);
  color: white;
  box-shadow: 0 0 0 4px var(--common-blue-light);
}

.step-indicator.completed {
  background: var(--success);
  border-color: var(--success);
  color: white;
  cursor: pointer;
}

.register-card {
  background: transparent;
  box-shadow: none;
  padding: 0 var(--spacing-lg);
  min-height: 480px;
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-xl);
}

.step-content {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-900);
  margin-bottom: var(--spacing-xl);
  text-align: center;
}

.terms-container {
  padding: var(--spacing-md);
  background: var(--gray-50);
  border-radius: var(--radius-sm);
  margin-bottom: var(--spacing-lg);
}

.terms-checkbox {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.checkbox {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
  accent-color: var(--common-blue);
}

.link {
  color: var(--common-blue);
  text-decoration: none;
  font-weight: 500;
  transition: opacity var(--transition-fast);
}

.link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

/* Completion Step */
.completion {
  text-align: center;
  padding: var(--spacing-2xl) 0;
}

.completion-icon {
  font-size: 72px;
  margin-bottom: var(--spacing-lg);
  font-family: 'TossFaceFont', system-ui;
}

.completion-message {
  color: var(--gray-600);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.completion-loading {
  width: 200px;
  height: 4px;
  background: var(--gray-200);
  border-radius: var(--radius-full);
  margin: 0 auto;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  background: var(--common-blue);
  animation: loading-progress 3s ease-out forwards;
}

@keyframes loading-progress {
  from { width: 0; }
  to { width: 100%; }
}

.register-footer {
  text-align: center;
  padding: var(--spacing-xl) 0;
  margin-top: auto;
  color: var(--gray-600);
  font-size: 14px;
}

.register-footer a {
  color: var(--common-blue);
  text-decoration: none;
  font-weight: 600;
}

.register-footer a:hover {
  text-decoration: underline;
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
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.toast-error {
  background: var(--error);
  color: white;
}

.toast-success {
  background: var(--success);
  color: white;
}

/* Mobile Responsive */
@media (max-width: 480px) {
  .register-container {
    padding: 0 var(--spacing-lg);
  }

  .register-header {
    padding-top: 40px;
    margin-bottom: var(--spacing-xl);
  }

  .register-header h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .stepper {
    padding: 0 20px;
    margin-bottom: var(--spacing-xl);
  }

  .stepper::before {
    left: 40px;
    right: 40px;
  }

  .register-card {
    padding: 0 var(--spacing-sm);
  }

  .step-title {
    font-size: 18px;
    margin-bottom: var(--spacing-lg);
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .form-actions .common-button {
    width: 100%;
  }

  .register-footer {
    padding: var(--spacing-lg) 0;
  }
}
</style>
