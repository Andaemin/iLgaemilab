import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          // 기존 Vuetify 기본 컬러 (유지)
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
          
          // 🆕 토스 스타일 컬러 추가 (프로필 페이지용)
          // 토스 브랜드 컬러
          'common-blue': '#3182F6',
          'common-green': '#11C456',
          'common-red': '#FF5757',
          'common-orange': '#FF9500',
          
          // 토스 그레이 스케일
          'grey-50': '#FAFBFC',
          'grey-100': '#F2F4F6',
          'grey-200': '#E5E8EB',
          'grey-300': '#D1D6DB',
          'grey-400': '#B0B8C1',
          'grey-500': '#8B95A1',
          'grey-600': '#6B7684',
          'grey-700': '#4E5968',
          'grey-800': '#33394A',
          'grey-900': '#191F28',
          
          // 토스 서브 컬러
          'blue-50': '#EBF4FF',
          'blue-100': '#CCE2FF',
          'blue-500': '#3182F6',
          'blue-600': '#1B64DA',
          'blue-700': '#1957C2',
          
          'orange-50': '#FFF5E6',
          'green-50': '#E8FAF0',
          'red-50': '#FFEBEE',
          'purple-50': '#F3E5F5',
          'indigo-50': '#E8EAF6',
          'teal-50': '#E0F2F1',
          'cyan-50': '#E0F7FA'
        }
      }
    },
    defaultTheme: 'light'
  },
  
  // 🆕 토스 스타일 기본 설정 추가 (프로필 컴포넌트용)
  defaults: {
    VBtn: {
      style: [
        {
          fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif',
          fontWeight: 600,
          borderRadius: '12px',
          textTransform: 'none'
        }
      ]
    },
    VCard: {
      style: [
        {
          fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }
      ]
    },
    VTextField: {
      style: [
        {
          fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif'
        }
      ],
      variant: 'outlined',
      color: 'primary'
    },
    VSelect: {
      style: [
        {
          fontFamily: 'Pretendard, system-ui, -apple-system, sans-serif'
        }
      ],
      variant: 'outlined',
      color: 'primary'
    }
  }
})

export default vuetify