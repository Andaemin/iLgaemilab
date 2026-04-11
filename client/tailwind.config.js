/** @type {import('tailwindcss').Config} */
export default {
  // Vuetify와 충돌 방지 - prefix 제거하고 preflight만 비활성화
  // prefix: 'tw-', // 제거 - 클래스 직접 사용
  // important를 true로 설정하면 Tailwind가 우선순위를 가짐
  // 하지만 Vuetify를 기본으로 사용하므로 false로 유지
  important: false,
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  corePlugins: {
    // Vuetify와 충돌하는 Tailwind 기본 스타일 비활성화
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        primary: '#1976D2',
        secondary: '#424242',
        accent: '#82B1FF',
        error: '#FF5252',
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FFC107'
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}