<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAntStore } from '@/stores/useAntStore'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'
import ProfileBorderSelector from './ProfileBorderSelector.vue'

const props = defineProps({
  user: {
    type: Object,
    required: true
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  saveCompleted: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['image-select', 'save-profile', 'open-preset-selector', 'border-changed'])

const router = useRouter()
const antStore = useAntStore()

// 개인정보 수정 관련 state
const isEditingProfile = ref(false)
const editForm = ref({
  name: '',
  birthDate: '',
  gender: '',
  phone: '',
  occupation: '',
  address: '',
  learningGoal: '',
  koreanLevel: '',
  nativeLanguage: '',
  nationality: ''
})

// 폼 검증 에러 상태
const formErrors = ref({
  name: '',
  phone: '',
  occupation: ''
})

// 테두리 선택 다이얼로그
const showBorderSelector = ref(false)

const openBorderSelector = () => {
  showBorderSelector.value = true
}

const closeBorderSelector = () => {
  showBorderSelector.value = false
}

const handleBorderSaved = (newBorder) => {
  emit('border-changed', newBorder)
}

const levelNames = {
  1: '초급',
  2: '중급', 
  3: '고급'
}

const occupationNames = {
  manufacturing: '제조업',
  construction: '건설업',
  agriculture: '농업',
  logistics: '물류',
  service: '서비스업'
}

const genderOptions = [
  { title: '남성', value: 'male' },
  { title: '여성', value: 'female' }
]

const occupationOptions = [
  { title: '제조업', value: 'manufacturing' },
  { title: '건설업', value: 'construction' },
  { title: '농업', value: 'agriculture' },
  { title: '물류', value: 'logistics' },
  { title: '서비스업', value: 'service' }
]

const regionOptions = [
  { title: '서울특별시', value: 'seoul' },
  { title: '부산광역시', value: 'busan' },
  { title: '대구광역시', value: 'daegu' },
  { title: '인천광역시', value: 'incheon' },
  { title: '광주광역시', value: 'gwangju' },
  { title: '대전광역시', value: 'daejeon' },
  { title: '울산광역시', value: 'ulsan' },
  { title: '경기도', value: 'gyeonggi' },
  { title: '강원도', value: 'gangwon' },
  { title: '충청북도', value: 'chungbuk' },
  { title: '충청남도', value: 'chungnam' },
  { title: '전라북도', value: 'jeonbuk' },
  { title: '전라남도', value: 'jeonnam' },
  { title: '경상북도', value: 'gyeongbuk' },
  { title: '경상남도', value: 'gyeongnam' },
  { title: '제주특별자치도', value: 'jeju' }
]

const learningGoalOptions = [
  { title: '일상 회화', value: 'daily_conversation' },
  { title: '업무 소통', value: 'business_communication' },
  { title: '한국어능력시험(TOPIK)', value: 'topik_exam' },
  { title: '취업 준비', value: 'job_preparation' },
  { title: '문화 이해', value: 'cultural_understanding' },
  { title: '학업(진학)', value: 'academic_study' }
]

const koreanLevelOptions = [
  { title: '입문 (전혀 모름)', value: 'beginner' },
  { title: '초급 (기본 인사)', value: 'elementary' },
  { title: '중급 (간단한 대화)', value: 'intermediate' },
  { title: '고급 (유창한 대화)', value: 'advanced' },
  { title: '최고급 (원어민 수준)', value: 'superior' }
]

const nativeLanguageOptions = [
  { title: '베트남어', value: 'vietnamese' },
  { title: '영어', value: 'english' },
  { title: '중국어', value: 'chinese' },
  { title: '일본어', value: 'japanese' },
  { title: '타갈로그어', value: 'tagalog' },
  { title: '태국어', value: 'thai' },
  { title: '인도네시아어', value: 'indonesian' },
  { title: '러시아어', value: 'russian' },
  { title: '기타', value: 'other' }
]

const nationalityOptions = [
  { title: '대한민국', value: 'KR' },
  { title: '베트남', value: 'VN' },
  { title: '중국', value: 'CN' },
  { title: '필리핀', value: 'PH' },
  { title: '태국', value: 'TH' },
  { title: '인도네시아', value: 'ID' },
  { title: '캄보디아', value: 'KH' },
  { title: '미얀마', value: 'MM' },
  { title: '라오스', value: 'LA' },
  { title: '우즈베키스탄', value: 'UZ' },
  { title: '네팔', value: 'NP' },
  { title: '스리랑카', value: 'LK' },
  { title: '방글라데시', value: 'BD' },
  { title: '기타', value: 'OTHER' }
]

const displayOccupation = computed(() => {
  return occupationNames[props.user.occupationCategory] || 
         occupationNames[props.user.occupation] || 
         props.user.occupationCategory || 
         props.user.occupation || 
         '-'
})

const displayRegion = computed(() => {
  const region = regionOptions.find(item => item.value === props.user.address)
  return region ? region.title : (props.user.address || '-')
})

const displayNationality = computed(() => {
  const nationality = nationalityOptions.find(item => item.value === props.user.nationality)
  return nationality ? nationality.title : (props.user.nationality || '-')
})

const displayNativeLanguage = computed(() => {
  const language = nativeLanguageOptions.find(item => item.value === props.user.nativeLanguage)
  return language ? language.title : (props.user.nativeLanguage || '-')
})

const displayKoreanLevel = computed(() => {
  const level = koreanLevelOptions.find(item => item.value === props.user.koreanLevel)
  return level ? level.title : (props.user.koreanLevel || '-')
})

const displayLearningGoal = computed(() => {
  if (!props.user.learningGoal) return '-'
  
  // 배열인 경우 (multiple 선택)
  if (Array.isArray(props.user.learningGoal)) {
    const goals = props.user.learningGoal.map(goal => {
      const found = learningGoalOptions.find(item => item.value === goal)
      return found ? found.title : goal
    })
    return goals.join(', ')
  }
  
  // 문자열인 경우 (단일 선택)
  const goal = learningGoalOptions.find(item => item.value === props.user.learningGoal)
  return goal ? goal.title : props.user.learningGoal
})

const handleImageSelect = (event) => {
  emit('image-select', event)
}

const openPresetSelector = () => {
  emit('open-preset-selector')
}


const saveProfile = () => {
  if (!validateForm()) {
    return // 검증 실패 시 저장하지 않음
  }
  
  emit('save-profile', editForm.value)
  isEditingProfile.value = false
  hasUnsavedChanges.value = false
}

// 이미지 로드 에러 핸들링
const handleImageError = (event) => {
  console.warn('프로필 이미지 로드 실패:', event)
  // 에러 발생 시 기본 이모지로 표시되도록 자동 처리됨
}

// 폼 검증 함수들
const validateName = () => {
  const name = editForm.value.name.trim()
  if (!name) {
    formErrors.value.name = '이름을 입력해주세요'
    return false
  }
  if (name.length < 2) {
    formErrors.value.name = '이름은 2글자 이상이어야 합니다'
    return false
  }
  if (name.length > 50) {
    formErrors.value.name = '이름은 50글자를 초과할 수 없습니다'
    return false
  }
  formErrors.value.name = ''
  return true
}

const validatePhone = () => {
  const phone = editForm.value.phone.trim()
  if (!phone) {
    formErrors.value.phone = '전화번호를 입력해주세요'
    return false
  }
  
  // 한국 전화번호 패턴 (010-0000-0000, 02-000-0000 등)
  const phoneRegex = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$|^(02|0[3-9]\d)-\d{3,4}-\d{4}$/
  if (!phoneRegex.test(phone)) {
    formErrors.value.phone = '올바른 전화번호 형식이 아닙니다 (예: 010-0000-0000)'
    return false
  }
  
  formErrors.value.phone = ''
  return true
}

const validateOccupation = () => {
  if (!editForm.value.occupation) {
    formErrors.value.occupation = '직업군을 선택해주세요'
    return false
  }
  formErrors.value.occupation = ''
  return true
}

// 전체 폼 검증
const validateForm = () => {
  const isNameValid = validateName()
  const isPhoneValid = validatePhone()
  const isOccupationValid = validateOccupation()
  
  return isNameValid && isPhoneValid && isOccupationValid
}

// 실시간 검증을 위한 개별 필드 검증
const clearError = (field) => {
  formErrors.value[field] = ''
}

// 전화번호 자동 포맷팅
const formatPhoneNumber = () => {
  let phone = editForm.value.phone.replace(/[^\d]/g, '')
  
  if (phone.length <= 3) {
    editForm.value.phone = phone
  } else if (phone.length <= 7) {
    editForm.value.phone = phone.replace(/(\d{3})(\d{1,4})/, '$1-$2')
  } else if (phone.length <= 11) {
    if (phone.startsWith('02')) {
      editForm.value.phone = phone.replace(/(\d{2})(\d{3,4})(\d{4})/, '$1-$2-$3')
    } else {
      editForm.value.phone = phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
    }
  }
}

// 변경사항 추적
const hasUnsavedChanges = ref(false)
const originalForm = ref({})

// 폼 변경사항 감지
watch(editForm, () => {
  if (isEditingProfile.value) {
    hasUnsavedChanges.value = JSON.stringify(editForm.value) !== JSON.stringify(originalForm.value)
  }
}, { deep: true })

// 편집 모드 시작 시 원본 데이터 저장
const startEditProfile = () => {
  editForm.value = {
    name: props.user.name || '',
    birthDate: props.user.birthDate || '',
    gender: props.user.gender || '',
    phone: props.user.phone || '',
    occupation: props.user.occupationCategory || props.user.occupation || '',
    address: props.user.address || '',
    learningGoal: props.user.learningGoal || '',
    koreanLevel: props.user.koreanLevel || '',
    nativeLanguage: props.user.nativeLanguage || '',
    nationality: props.user.nationality || ''
  }
  originalForm.value = { ...editForm.value }
  isEditingProfile.value = true
  hasUnsavedChanges.value = false
}

// 편집 취소 (변경사항 확인)
const cancelEditProfile = () => {
  if (hasUnsavedChanges.value) {
    if (confirm('저장하지 않은 변경 사항이 있습니다. 정말 취소하시겠습니까?')) {
      resetForm()
    }
  } else {
    resetForm()
  }
}

// 폼 리셋
const resetForm = () => {
  isEditingProfile.value = false
  hasUnsavedChanges.value = false
  editForm.value = {
    name: '',
    birthDate: '',
    gender: '',
    phone: '',
    occupation: '',
    address: '',
    learningGoal: '',
    koreanLevel: '',
    nativeLanguage: '',
    nationality: ''
  }
  // 에러 초기화
  formErrors.value = {
    name: '',
    phone: '',
    occupation: ''
  }
}

// 브라우저 새로고침/닫기 방지
const handleBeforeUnload = (event) => {
  if (isEditingProfile.value && hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = '저장하지 않은 변경 사항이 있습니다.'
    return '저장하지 않은 변경 사항이 있습니다.'
  }
}

// 라우터 네비게이션 가드
const handleBeforeRouteLeave = () => {
  if (isEditingProfile.value && hasUnsavedChanges.value) {
    return confirm('저장하지 않은 변경 사항이 있습니다. 페이지를 떠나시겠습니까?')
  }
  return true
}

// 생명주기 훅
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  // 라우터 네비게이션 가드 등록 (부모 컴포넌트에서 처리하도록 이벤트 emit)
  window.addEventListener('popstate', () => {
    if (!handleBeforeRouteLeave()) {
      history.pushState(null, '', location.href)
    }
  })

  // 개미 키우기 레벨 불러오기
  try {
    await antStore.fetchAntStatus()
  } catch (error) {
    console.error('개미 상태를 불러오지 못했습니다:', error)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <CommonVCard class="profile-main-section">
    <v-card-text class="pa-6">
      <v-row no-gutters>
        <!-- 프로필 이미지 영역 -->
        <v-col cols="12" md="4" class="profile-avatar-section">
          <div class="profile-content">
            <div class="profile-avatar-container mb-4" :class="`border-${user.profileBorder || 'default'}`">
              <v-avatar size="100" class="profile-avatar elevation-2">
                <!-- 업로드된 이미지나 URL 이미지인 경우 -->
                <v-img 
                  v-if="profileImageUrl && !profileImageUrl.startsWith('preset:')" 
                  :src="profileImageUrl" 
                  alt="프로필 이미지"
                  cover
                  @error="handleImageError"
                />
                <!-- 프리셋 아바타인 경우 (preset:id:emoji 형식) -->
                <span 
                  v-else-if="profileImageUrl && profileImageUrl.startsWith('preset:')" 
                  class="avatar-emoji"
                >
                  {{ profileImageUrl.split(':')[2] || '🥰' }}
                </span>
                <!-- 기본 이모지 -->
                <span v-else class="avatar-emoji">🥰</span>
              </v-avatar>
              
              <!-- 프로필 편집 버튼들 -->
              <div class="avatar-edit-buttons">
                <v-btn
                  icon="mdi-camera"
                  size="small"
                  color="primary"
                  class="profile-edit-btn elevation-2"
                  @click="$refs.avatarInput.click()"
                  title="사진 업로드"
                >
                </v-btn>

                <v-btn
                  icon="mdi-emoticon"
                  size="small"
                  color="secondary"
                  class="profile-preset-btn elevation-2"
                  @click="openPresetSelector"
                  title="아바타 선택"
                >
                </v-btn>

                <v-btn
                  icon="mdi-border-color"
                  size="small"
                  color="warning"
                  class="profile-border-btn elevation-2"
                  @click="openBorderSelector"
                  title="테두리 변경"
                >
                </v-btn>
              </div>
              
              <input 
                ref="avatarInput"
                type="file" 
                accept="image/*" 
                @change="handleImageSelect" 
                style="display: none;"
              />
            </div>
            
            <!-- 아바타 옵션 설명 -->
            <div class="avatar-options mb-3">
              <p class="text-caption text-grey-600 text-center mb-1">
                사진을 업로드하거나 아바타를 선택하세요
              </p>
              <p class="text-caption text-grey-500 text-center">
                📷 2MB 이하, 400×400px 이상 (JPEG, PNG, WebP)
              </p>
            </div>
            
            <h2 class="text-h5 font-weight-bold mb-2">{{ user.name }}</h2>
            <p class="text-body-2 text-grey-600 mb-3">{{ user.email }}</p>

            <v-chip
              color="primary"
              variant="tonal"
              size="small"
              class="font-weight-medium"
            >
              Lv. {{ antStore.antLevel }} ({{ antStore.levelInfo.name }})
            </v-chip>
          </div>
        </v-col>

        <!-- 개인정보 영역 -->
        <v-col cols="12" md="8" class="profile-info-section">
          <div class="d-flex justify-space-between align-center mb-4">
            <h3 class="text-h6 font-weight-bold">개인정보</h3>
            <!-- 수정 버튼 -->
            <CommonVButton
              v-if="!isEditingProfile"
              common-variant="primary"
              @click="startEditProfile"
              prepend-icon="mdi-pencil"
              size="small"
            >
              수정
            </CommonVButton>
            <!-- 취소/저장 버튼 -->
            <div v-else class="d-flex gap-2">
              <CommonVButton
                common-variant="secondary"
                @click="cancelEditProfile"
                prepend-icon="mdi-close"
                size="small"
              >
                취소
              </CommonVButton>
              <CommonVButton
                common-variant="primary"
                @click="saveProfile"
                prepend-icon="mdi-content-save"
                size="small"
              >
                저장
              </CommonVButton>
            </div>
          </div>

          <!-- 개인정보 보기 모드 -->
          <div v-if="!isEditingProfile">
            <v-list lines="one" class="pa-0 bg-transparent">
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-account</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">이름</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ user.name }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-cake</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">생년월일</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ user.birthDate || '-' }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-phone</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">휴대전화</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ user.phone || '-' }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-briefcase</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">직업군</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayOccupation }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-gender-male-female</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">성별</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">
                    {{ user.gender === 'male' ? '남성' : user.gender === 'female' ? '여성' : '-' }}
                  </span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">거주지역</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayRegion }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-flag</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">국적</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayNationality }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-translate</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">모국어</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayNativeLanguage }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-school</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">한국어 수준</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayKoreanLevel }}</span>
                </template>
              </v-list-item>
              
              <v-divider class="my-1" />
              
              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="grey-600" size="20" class="mr-3">mdi-target</v-icon>
                </template>
                <v-list-item-title class="text-body-2 text-grey-600">학습 목적</v-list-item-title>
                <template v-slot:append>
                  <span class="text-body-1 font-weight-medium">{{ displayLearningGoal }}</span>
                </template>
              </v-list-item>
            </v-list>
          </div>
          
          <!-- 개인정보 수정 모드 -->
          <div v-else>
            <v-form @submit.prevent="saveProfile">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editForm.name"
                    label="이름 *"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-account"
                    :error-messages="formErrors.name"
                    @blur="validateName"
                    @input="clearError('name')"
                    counter="50"
                    required
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editForm.birthDate"
                    label="생년월일"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-cake"
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editForm.phone"
                    label="휴대전화 *"
                    placeholder="010-0000-0000"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-phone"
                    :error-messages="formErrors.phone"
                    @input="formatPhoneNumber(); clearError('phone')"
                    @blur="validatePhone"
                    maxlength="13"
                    required
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.occupation"
                    :items="occupationOptions"
                    label="직업군 *"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-briefcase"
                    :error-messages="formErrors.occupation"
                    @update:model-value="clearError('occupation')"
                    @blur="validateOccupation"
                    required
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.gender"
                    :items="genderOptions"
                    label="성별"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-gender-male-female"
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.address"
                    :items="regionOptions"
                    label="거주지역"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-map-marker"
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.nationality"
                    :items="nationalityOptions"
                    label="국적"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-flag"
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.nativeLanguage"
                    :items="nativeLanguageOptions"
                    label="모국어"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-translate"
                  />
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editForm.koreanLevel"
                    :items="koreanLevelOptions"
                    label="한국어 수준"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-school"
                  />
                </v-col>
                
                <v-col cols="12">
                  <v-select
                    v-model="editForm.learningGoal"
                    :items="learningGoalOptions"
                    label="학습 목적"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-target"
                    multiple
                    chips
                    closable-chips
                  />
                </v-col>
              </v-row>
              
              <div class="d-flex justify-end mt-4">
                <CommonVButton
                  common-variant="secondary"
                  @click="cancelEditProfile"
                  class="mr-3"
                >
                  취소
                </CommonVButton>
                <CommonVButton
                  common-variant="primary"
                  @click="saveProfile"
                >
                  저장
                </CommonVButton>
              </div>
            </v-form>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </CommonVCard>

  <!-- 테두리 선택 다이얼로그 -->
  <v-dialog v-model="showBorderSelector" max-width="800">
    <ProfileBorderSelector
      :current-border="user.profileBorder || 'default'"
      @close="closeBorderSelector"
      @saved="handleBorderSaved"
    />
  </v-dialog>
</template>

<style scoped>
.profile-main-section {
  margin-bottom: 24px;
}

.profile-avatar-section {
  padding-right: 24px !important;
}

.profile-info-section {
  padding-left: 24px !important;
}

.profile-content {
  text-align: center;
  padding: 0 20px;
}

.profile-avatar-container {
  position: relative;
  display: inline-block;
  margin-left: -20px;
}

.profile-avatar {
  background: rgb(var(--v-theme-grey-100));
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
  position: relative;
  z-index: 2;
}

/* 프로필 테두리 스타일 */
.profile-avatar-container::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  z-index: 1;
  pointer-events: none;
}

/* 기본 테두리 */
.profile-avatar-container.border-default::before {
  border: 2px solid #BDBDBD;
  box-shadow: 0 0 8px rgba(189, 189, 189, 0.3);
}

/* 브론즈 테두리 */
.profile-avatar-container.border-bronze::before {
  border: 3px solid #CD7F32;
  box-shadow: 0 0 15px rgba(205, 127, 50, 0.6),
              inset 0 0 10px rgba(205, 127, 50, 0.3);
  background: radial-gradient(circle, transparent 60%, rgba(205, 127, 50, 0.1) 100%);
}

/* 실버 테두리 */
.profile-avatar-container.border-silver::before {
  border: 3px solid #C0C0C0;
  box-shadow: 0 0 15px rgba(192, 192, 192, 0.8),
              inset 0 0 10px rgba(192, 192, 192, 0.4);
  background: radial-gradient(circle, transparent 60%, rgba(192, 192, 192, 0.1) 100%);
}

/* 골드 테두리 */
.profile-avatar-container.border-gold::before {
  border: 3px solid #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
              0 0 40px rgba(255, 215, 0, 0.4),
              inset 0 0 15px rgba(255, 215, 0, 0.3);
  background: radial-gradient(circle, transparent 60%, rgba(255, 215, 0, 0.15) 100%);
  animation: pulse-gold 2s ease-in-out infinite;
}

@keyframes pulse-gold {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.02); opacity: 1; }
}

/* 다이아몬드 테두리 */
.profile-avatar-container.border-diamond::before {
  border: 3px solid #B9F2FF;
  box-shadow: 0 0 20px rgba(185, 242, 255, 1),
              0 0 40px rgba(185, 242, 255, 0.6),
              inset 0 0 15px rgba(185, 242, 255, 0.4);
  background: radial-gradient(circle, transparent 60%, rgba(185, 242, 255, 0.2) 100%);
  animation: shine-diamond 3s linear infinite;
}

@keyframes shine-diamond {
  0% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(30deg) brightness(1.2); }
  100% { filter: hue-rotate(0deg) brightness(1); }
}

/* 플래티넘 테두리 */
.profile-avatar-container.border-platinum::before {
  border: 4px solid #E5E4E2;
  box-shadow: 0 0 25px rgba(229, 228, 226, 1),
              0 0 50px rgba(229, 228, 226, 0.6),
              inset 0 0 20px rgba(229, 228, 226, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(229, 228, 226, 0.2) 100%);
}

/* 마스터 테두리 */
.profile-avatar-container.border-master::before {
  border: 4px solid #9D4EDD;
  box-shadow: 0 0 30px rgba(157, 78, 221, 1),
              0 0 60px rgba(157, 78, 221, 0.6),
              inset 0 0 25px rgba(157, 78, 221, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(157, 78, 221, 0.25) 100%);
  animation: pulse-master 1.5s ease-in-out infinite;
}

@keyframes pulse-master {
  0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(157, 78, 221, 1); }
  50% { transform: scale(1.03); box-shadow: 0 0 50px rgba(157, 78, 221, 1); }
}

/* 챌린저 테두리 */
.profile-avatar-container.border-challenger::before {
  border: 5px solid;
  border-image: linear-gradient(45deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #9D4EDD, #FF6B6B) 1;
  box-shadow: 0 0 40px rgba(255, 107, 107, 0.8),
              0 0 80px rgba(255, 107, 107, 0.4);
  animation: rotate-gradient 3s linear infinite;
}

@keyframes rotate-gradient {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* 무지개 테두리 */
.profile-avatar-container.border-rainbow::before {
  border: 4px solid;
  border-image: linear-gradient(90deg,
    #FF0000, #FF7F00, #FFFF00, #00FF00,
    #0000FF, #4B0082, #9400D3) 1;
  box-shadow: 0 0 35px rgba(255, 0, 255, 0.7);
  animation: rainbow-flow 3s linear infinite;
}

@keyframes rainbow-flow {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(360deg); }
}

/* 불꽃 테두리 */
.profile-avatar-container.border-fire::before {
  border: 4px solid #FF4500;
  box-shadow: 0 0 30px rgba(255, 69, 0, 1),
              0 0 60px rgba(255, 140, 0, 0.7),
              inset 0 0 25px rgba(255, 69, 0, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(255, 69, 0, 0.3) 100%);
  animation: flicker-fire 0.3s ease-in-out infinite alternate;
}

@keyframes flicker-fire {
  0% { opacity: 0.9; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.02); }
}

/* 얼음 테두리 */
.profile-avatar-container.border-ice::before {
  border: 4px solid #00CED1;
  box-shadow: 0 0 30px rgba(0, 206, 209, 1),
              0 0 60px rgba(64, 224, 208, 0.7),
              inset 0 0 25px rgba(0, 206, 209, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(0, 206, 209, 0.25) 100%);
  animation: shimmer-ice 2s ease-in-out infinite;
}

@keyframes shimmer-ice {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3); }
}

/* 자연 테두리 */
.profile-avatar-container.border-nature::before {
  border: 4px solid #2E7D32;
  box-shadow: 0 0 30px rgba(46, 125, 50, 1),
              0 0 60px rgba(102, 187, 106, 0.7),
              inset 0 0 25px rgba(46, 125, 50, 0.5);
  background: radial-gradient(circle, transparent 60%, rgba(46, 125, 50, 0.25) 100%);
  animation: grow-nature 3s ease-in-out infinite;
}

@keyframes grow-nature {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}

/* === 롤 스타일 화려한 테두리 === */

/* 개미 여왕 테두리 */
.profile-avatar-container.border-ant-queen::before {
  border: 5px solid transparent;
  background: linear-gradient(45deg, #FFD700, #FFA500, #FFD700) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 20px rgba(255, 215, 0, 1),
    0 0 40px rgba(255, 165, 0, 0.8),
    0 0 60px rgba(255, 215, 0, 0.6),
    inset 0 0 30px rgba(255, 215, 0, 0.4),
    0 4px 15px rgba(0, 0, 0, 0.3);
  animation: ant-queen-glow 2s ease-in-out infinite;
}

@keyframes ant-queen-glow {
  0%, 100% {
    filter: brightness(1) drop-shadow(0 0 10px #FFD700);
    transform: scale(1);
  }
  50% {
    filter: brightness(1.3) drop-shadow(0 0 20px #FFA500);
    transform: scale(1.02);
  }
}

/* 트로피 테두리 */
.profile-avatar-container.border-trophy::before {
  border: 5px solid;
  border-image: linear-gradient(135deg, #C9A961, #FFD700, #E6C56C, #FFD700, #C9A961) 1;
  box-shadow:
    0 0 25px rgba(255, 215, 0, 1),
    0 0 50px rgba(201, 169, 97, 0.8),
    0 8px 20px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.5),
    inset 0 -2px 10px rgba(0, 0, 0, 0.3);
  background: radial-gradient(circle, transparent 60%, rgba(255, 215, 0, 0.2) 100%);
  animation: trophy-shine 3s linear infinite;
}

@keyframes trophy-shine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.4); }
  100% { filter: brightness(1); }
}

/* 왕관 테두리 */
.profile-avatar-container.border-crown::before {
  border: 6px solid transparent;
  background: linear-gradient(60deg, #9D4EDD, #C77DFF, #E0AAFF, #C77DFF, #9D4EDD) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 30px rgba(157, 78, 221, 1),
    0 0 60px rgba(199, 125, 255, 0.8),
    0 0 90px rgba(224, 170, 255, 0.6),
    inset 0 0 20px rgba(199, 125, 255, 0.5),
    0 5px 20px rgba(0, 0, 0, 0.4);
  animation: crown-royal 3s ease-in-out infinite;
}

@keyframes crown-royal {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
  50% {
    transform: scale(1.03) rotate(1deg);
    filter: brightness(1.3);
  }
}

/* 드래곤 테두리 */
.profile-avatar-container.border-dragon::before {
  border: 5px solid;
  border-image: linear-gradient(90deg, #8B0000, #DC143C, #FF4500, #DC143C, #8B0000) 1;
  box-shadow:
    0 0 35px rgba(220, 20, 60, 1),
    0 0 70px rgba(255, 69, 0, 0.9),
    0 0 105px rgba(139, 0, 0, 0.7),
    inset 0 0 30px rgba(255, 69, 0, 0.6),
    0 6px 25px rgba(0, 0, 0, 0.5);
  background: radial-gradient(circle, transparent 55%, rgba(255, 69, 0, 0.3) 100%);
  animation: dragon-breath 1.5s ease-in-out infinite;
}

@keyframes dragon-breath {
  0%, 100% {
    filter: brightness(1) hue-rotate(0deg);
    transform: scale(1);
  }
  25% {
    filter: brightness(1.4) hue-rotate(5deg);
    transform: scale(1.02);
  }
  75% {
    filter: brightness(1.2) hue-rotate(-5deg);
    transform: scale(1.01);
  }
}

/* 크리스탈 테두리 */
.profile-avatar-container.border-crystal::before {
  border: 5px solid transparent;
  background:
    linear-gradient(135deg,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(185, 242, 255, 0.8) 25%,
      rgba(224, 170, 255, 0.8) 50%,
      rgba(255, 192, 203, 0.8) 75%,
      rgba(255, 255, 255, 0.9) 100%) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 30px rgba(185, 242, 255, 1),
    0 0 60px rgba(224, 170, 255, 0.8),
    0 0 90px rgba(255, 255, 255, 0.6),
    inset 0 0 25px rgba(255, 255, 255, 0.7);
  animation: crystal-prism 4s linear infinite;
}

@keyframes crystal-prism {
  0% { filter: hue-rotate(0deg) brightness(1.2); }
  100% { filter: hue-rotate(360deg) brightness(1.2); }
}

/* 네온 테두리 */
.profile-avatar-container.border-neon::before {
  border: 4px solid;
  border-image: linear-gradient(90deg, #00FFFF, #FF00FF, #FFFF00, #00FF00, #00FFFF) 1;
  box-shadow:
    0 0 15px rgba(0, 255, 255, 1),
    0 0 30px rgba(255, 0, 255, 1),
    0 0 45px rgba(255, 255, 0, 0.8),
    0 0 60px rgba(0, 255, 0, 0.6),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
  animation: neon-pulse 1s ease-in-out infinite;
}

@keyframes neon-pulse {
  0%, 100% {
    filter: brightness(1);
    opacity: 1;
  }
  50% {
    filter: brightness(1.5);
    opacity: 0.9;
  }
}

/* 사이버 테두리 */
.profile-avatar-container.border-cyber::before {
  border: 5px solid;
  border-image: linear-gradient(45deg, #00D9FF, #7C3AED, #FF006E, #7C3AED, #00D9FF) 1;
  box-shadow:
    0 0 25px rgba(0, 217, 255, 1),
    0 0 50px rgba(124, 58, 237, 0.8),
    0 0 75px rgba(255, 0, 110, 0.6),
    inset 0 0 20px rgba(0, 217, 255, 0.5),
    0 4px 20px rgba(0, 0, 0, 0.6);
  animation: cyber-scan 2s linear infinite;
}

@keyframes cyber-scan {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(360deg) brightness(1); }
}

/* 불사조 테두리 */
.profile-avatar-container.border-phoenix::before {
  border: 6px solid transparent;
  background:
    linear-gradient(90deg,
      #FF4500 0%,
      #FFD700 25%,
      #FF69B4 50%,
      #FF8C00 75%,
      #FF4500 100%) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 40px rgba(255, 69, 0, 1),
    0 0 80px rgba(255, 215, 0, 0.9),
    0 0 120px rgba(255, 105, 180, 0.7),
    inset 0 0 35px rgba(255, 140, 0, 0.6),
    0 8px 30px rgba(0, 0, 0, 0.5);
  animation: phoenix-rebirth 2.5s ease-in-out infinite;
}

@keyframes phoenix-rebirth {
  0%, 100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
  25% {
    transform: scale(1.04) rotate(2deg);
    filter: brightness(1.5);
  }
  75% {
    transform: scale(1.02) rotate(-2deg);
    filter: brightness(1.3);
  }
}

/* 미식 테두리 */
.profile-avatar-container.border-mythic::before {
  border: 7px solid transparent;
  background:
    conic-gradient(from 0deg,
      #FF0000, #FF7F00, #FFFF00, #00FF00,
      #0000FF, #4B0082, #9400D3, #FF00FF,
      #FF0000) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 50px rgba(255, 255, 255, 1),
    0 0 100px rgba(138, 43, 226, 0.9),
    0 0 150px rgba(75, 0, 130, 0.7),
    inset 0 0 40px rgba(255, 255, 255, 0.7),
    0 10px 40px rgba(0, 0, 0, 0.6);
  animation: mythic-cosmos 4s linear infinite;
}

@keyframes mythic-cosmos {
  0% {
    filter: hue-rotate(0deg) brightness(1.2);
    transform: rotate(0deg) scale(1);
  }
  100% {
    filter: hue-rotate(360deg) brightness(1.2);
    transform: rotate(360deg) scale(1);
  }
}

/* 레전드 테두리 */
.profile-avatar-container.border-legend::before {
  border: 8px solid transparent;
  background:
    conic-gradient(from 45deg,
      #FFD700, #FF69B4, #00FFFF, #FF00FF,
      #FFFF00, #00FF00, #FF4500, #9D4EDD,
      #FFD700) border-box;
  -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  box-shadow:
    0 0 60px rgba(255, 215, 0, 1),
    0 0 120px rgba(255, 105, 180, 0.9),
    0 0 180px rgba(157, 78, 221, 0.8),
    0 0 240px rgba(0, 255, 255, 0.6),
    inset 0 0 50px rgba(255, 255, 255, 0.8),
    0 12px 50px rgba(0, 0, 0, 0.7);
  animation: legend-ultimate 3s ease-in-out infinite;
}

@keyframes legend-ultimate {
  0%, 100% {
    transform: rotate(0deg) scale(1);
    filter: brightness(1.3) hue-rotate(0deg) saturate(1.5);
  }
  33% {
    transform: rotate(120deg) scale(1.05);
    filter: brightness(1.6) hue-rotate(120deg) saturate(2);
  }
  66% {
    transform: rotate(240deg) scale(1.03);
    filter: brightness(1.5) hue-rotate(240deg) saturate(1.8);
  }
}

/* 🌌 은하수 Galaxy */
.profile-avatar-container.border-galaxy::before {
  border: 6px solid transparent;
  background: radial-gradient(circle, #1a1a2e, #0f0f1e, #000) border-box;
  box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2);
  animation: twinkle-galaxy 3s ease-in-out infinite;
}

@keyframes twinkle-galaxy {
  0%, 100% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.8), 0 0 80px rgba(75, 0, 130, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2); }
  50% { box-shadow: 0 0 60px rgba(138, 43, 226, 1), 0 0 120px rgba(75, 0, 130, 0.8), inset 0 0 50px rgba(255, 255, 255, 0.4); }
}

/* ⚡ 번개 Thunder */
.profile-avatar-container.border-thunder::before {
  border: 5px solid #FFFF00;
  box-shadow: 0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 215, 0, 0.8);
  animation: strike-thunder 0.5s ease-in-out infinite;
}

@keyframes strike-thunder {
  0%, 90%, 100% { opacity: 1; box-shadow: 0 0 50px rgba(255, 255, 0, 1), 0 0 100px rgba(255, 215, 0, 0.8); }
  45% { opacity: 0.6; box-shadow: 0 0 80px rgba(255, 255, 0, 1), 0 0 150px rgba(255, 215, 0, 1); }
}

/* 🌊 바다 Ocean */
.profile-avatar-container.border-ocean::before {
  border: 5px solid transparent;
  background: linear-gradient(135deg, #006994, #0099CC, #00CED1) border-box;
  box-shadow: 0 0 40px rgba(0, 206, 209, 0.8);
  animation: wave-ocean 3s ease-in-out infinite;
}

@keyframes wave-ocean {
  0%, 100% { transform: translateY(0) scale(1); filter: brightness(1); }
  50% { transform: translateY(-3px) scale(1.02); filter: brightness(1.2); }
}

/* 🌈 오로라 Aurora */
.profile-avatar-container.border-aurora::before {
  border: 6px solid transparent;
  background: linear-gradient(45deg, #00FF87, #60EFFF, #FF00D4, #00FF87) border-box;
  box-shadow: 0 0 50px rgba(0, 255, 135, 0.8), 0 0 100px rgba(96, 239, 255, 0.6);
  animation: flow-aurora 4s linear infinite;
}

@keyframes flow-aurora {
  0% { filter: hue-rotate(0deg) brightness(1); }
  100% { filter: hue-rotate(360deg) brightness(1.2); }
}

/* 🩸 블러드 Blood */
.profile-avatar-container.border-blood::before {
  border: 6px solid #8B0000;
  box-shadow: 0 0 40px rgba(139, 0, 0, 1), 0 0 80px rgba(220, 20, 60, 0.8), inset 0 0 30px rgba(139, 0, 0, 0.5);
  animation: pulse-blood 2s ease-in-out infinite;
}

@keyframes pulse-blood {
  0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(139, 0, 0, 1), 0 0 80px rgba(220, 20, 60, 0.8); }
  50% { transform: scale(1.03); box-shadow: 0 0 60px rgba(139, 0, 0, 1), 0 0 120px rgba(220, 20, 60, 1); }
}

/* ✨ 신성 Holy */
.profile-avatar-container.border-holy::before {
  border: 6px solid #FFFACD;
  box-shadow: 0 0 50px rgba(255, 250, 205, 1), 0 0 100px rgba(255, 255, 255, 0.8);
  animation: radiance-holy 2s ease-in-out infinite;
}

@keyframes radiance-holy {
  0%, 100% { filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 250, 205, 0.8)); }
  50% { filter: brightness(1.5) drop-shadow(0 0 40px rgba(255, 250, 205, 1)); }
}

/* ☠️ 독성 Toxic */
.profile-avatar-container.border-toxic::before {
  border: 5px solid #00FF00;
  box-shadow: 0 0 50px rgba(0, 255, 0, 0.9), 0 0 100px rgba(50, 205, 50, 0.7);
  animation: corrode-toxic 2s ease-in-out infinite;
}

@keyframes corrode-toxic {
  0%, 100% { filter: hue-rotate(0deg) brightness(1); }
  50% { filter: hue-rotate(20deg) brightness(1.3); }
}

/* 🕳️ 공허 Void */
.profile-avatar-container.border-void::before {
  border: 7px solid #1a001a;
  box-shadow: 0 0 60px rgba(75, 0, 130, 1), 0 0 120px rgba(138, 43, 226, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.9);
  animation: consume-void 3s ease-in-out infinite;
}

@keyframes consume-void {
  0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(75, 0, 130, 1), 0 0 120px rgba(138, 43, 226, 0.8); }
  50% { transform: scale(0.98); box-shadow: 0 0 80px rgba(75, 0, 130, 1), 0 0 160px rgba(138, 43, 226, 1); }
}

/* 🔥 지옥불 Inferno */
.profile-avatar-container.border-inferno::before {
  border: 7px solid transparent;
  background: linear-gradient(135deg, #FF0000, #FF4500, #FF6347, #FF0000) border-box;
  box-shadow: 0 0 60px rgba(255, 69, 0, 1), 0 0 120px rgba(255, 0, 0, 0.8);
  animation: blaze-inferno 1.5s ease-in-out infinite;
}

@keyframes blaze-inferno {
  0%, 100% { filter: brightness(1) saturate(1.5); transform: scale(1); }
  50% { filter: brightness(1.4) saturate(2); transform: scale(1.04); }
}

/* ❄️ 서리 Frost */
.profile-avatar-container.border-frost::before {
  border: 6px solid #E0FFFF;
  box-shadow: 0 0 50px rgba(224, 255, 255, 1), 0 0 100px rgba(176, 224, 230, 0.8), inset 0 0 30px rgba(240, 248, 255, 0.5);
  animation: crystallize-frost 3s ease-in-out infinite;
}

@keyframes crystallize-frost {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.3) drop-shadow(0 0 30px rgba(224, 255, 255, 1)); }
}

/* 🌑 그림자 Shadow */
.profile-avatar-container.border-shadow::before {
  border: 7px solid #2F4F4F;
  box-shadow: 0 0 50px rgba(0, 0, 0, 1), 0 0 100px rgba(47, 79, 79, 0.9), inset 0 0 40px rgba(0, 0, 0, 0.8);
  animation: lurk-shadow 3s ease-in-out infinite;
}

@keyframes lurk-shadow {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.7; }
}

/* 🌸 벚꽃 Sakura */
.profile-avatar-container.border-sakura::before {
  border: 5px solid #FFB7C5;
  box-shadow: 0 0 40px rgba(255, 183, 197, 1), 0 0 80px rgba(255, 192, 203, 0.8);
  animation: flutter-sakura 3s ease-in-out infinite;
}

@keyframes flutter-sakura {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(5deg); }
}

/* 🔩 금속 Metal */
.profile-avatar-container.border-metal::before {
  border: 6px solid #C0C0C0;
  box-shadow: 0 0 30px rgba(192, 192, 192, 1), inset 0 0 20px rgba(169, 169, 169, 0.5);
  animation: shine-metal 2s linear infinite;
}

@keyframes shine-metal {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.4); }
  100% { filter: brightness(1); }
}

/* 😈 악마 Demon */
.profile-avatar-container.border-demon::before {
  border: 7px solid #8B0000;
  box-shadow: 0 0 60px rgba(139, 0, 0, 1), 0 0 120px rgba(255, 0, 0, 0.8), inset 0 0 40px rgba(0, 0, 0, 0.8);
  animation: menace-demon 2s ease-in-out infinite;
}

@keyframes menace-demon {
  0%, 100% { filter: brightness(1) contrast(1.2); }
  50% { filter: brightness(1.3) contrast(1.5); }
}

/* 👼 천사 Angel */
.profile-avatar-container.border-angel::before {
  border: 6px solid #F0F8FF;
  box-shadow: 0 0 50px rgba(240, 248, 255, 1), 0 0 100px rgba(255, 255, 255, 0.9);
  animation: glow-angel 2s ease-in-out infinite;
}

@keyframes glow-angel {
  0%, 100% { filter: brightness(1.3); box-shadow: 0 0 50px rgba(240, 248, 255, 1), 0 0 100px rgba(255, 255, 255, 0.9); }
  50% { filter: brightness(1.6); box-shadow: 0 0 70px rgba(240, 248, 255, 1), 0 0 140px rgba(255, 255, 255, 1); }
}

/* 🌪️ 폭풍 Storm */
.profile-avatar-container.border-storm::before {
  border: 6px solid #4B0082;
  box-shadow: 0 0 50px rgba(75, 0, 130, 1), 0 0 100px rgba(138, 43, 226, 0.8);
  animation: rage-storm 1s ease-in-out infinite;
}

@keyframes rage-storm {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

/* 🌋 용암 Lava */
.profile-avatar-container.border-lava::before {
  border: 7px solid transparent;
  background: linear-gradient(135deg, #FF4500, #FF6347, #FF8C00, #FF4500) border-box;
  box-shadow: 0 0 60px rgba(255, 69, 0, 1), 0 0 120px rgba(255, 140, 0, 0.8);
  animation: flow-lava 3s ease-in-out infinite;
}

@keyframes flow-lava {
  0%, 100% { filter: brightness(1.2); }
  50% { filter: brightness(1.5) saturate(1.5); }
}

/* 🌙 달빛 Lunar */
.profile-avatar-container.border-lunar::before {
  border: 5px solid #E6E6FA;
  box-shadow: 0 0 40px rgba(230, 230, 250, 1), 0 0 80px rgba(216, 191, 216, 0.8);
  animation: phases-lunar 4s ease-in-out infinite;
}

@keyframes phases-lunar {
  0%, 100% { opacity: 0.9; filter: brightness(1); }
  50% { opacity: 1; filter: brightness(1.3); }
}

/* ☀️ 태양 Solar */
.profile-avatar-container.border-solar::before {
  border: 7px solid #FFD700;
  box-shadow: 0 0 60px rgba(255, 215, 0, 1), 0 0 120px rgba(255, 165, 0, 0.9), 0 0 180px rgba(255, 140, 0, 0.7);
  animation: radiate-solar 2s ease-in-out infinite;
}

@keyframes radiate-solar {
  0%, 100% { transform: scale(1); filter: brightness(1.3); }
  50% { transform: scale(1.05); filter: brightness(1.6); }
}

/* 🪐 우주 Cosmic */
.profile-avatar-container.border-cosmic::before {
  border: 8px solid transparent;
  background: conic-gradient(from 90deg, #4B0082, #8A2BE2, #9370DB, #BA55D3, #4B0082) border-box;
  box-shadow: 0 0 70px rgba(138, 43, 226, 1), 0 0 140px rgba(147, 112, 219, 0.8);
  animation: nebula-cosmic 5s linear infinite;
}

@keyframes nebula-cosmic {
  0% { transform: rotate(0deg); filter: hue-rotate(0deg); }
  100% { transform: rotate(360deg); filter: hue-rotate(360deg); }
}

.avatar-emoji {
  font-size: 50px;
  font-family: 'TossFaceFont', system-ui;
}

.avatar-edit-buttons {
  position: absolute;
  bottom: -10px;
  right: -20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10;
}

.profile-edit-btn,
.profile-preset-btn,
.profile-border-btn {
  background: rgb(var(--v-theme-primary)) !important;
  border: 3px solid white;
  width: 40px !important;
  height: 40px !important;
  min-width: 40px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  position: relative;
  z-index: 11;
}

.profile-edit-btn:hover,
.profile-preset-btn:hover,
.profile-border-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25) !important;
}

.profile-edit-btn:active,
.profile-preset-btn:active,
.profile-border-btn:active {
  transform: scale(0.95);
}

.profile-edit-btn :deep(.v-icon),
.profile-preset-btn :deep(.v-icon),
.profile-border-btn :deep(.v-icon) {
  font-size: 20px !important;
}

.profile-preset-btn {
  background: rgb(var(--v-theme-secondary)) !important;
}

.profile-border-btn {
  background: rgb(var(--v-theme-warning)) !important;
}

/* 모바일에서 레이아웃 조정 */
@media (max-width: 960px) {
  .profile-avatar-section {
    padding-right: 0 !important;
    margin-bottom: 24px;
  }

  .profile-info-section {
    padding-left: 0 !important;
  }

  .profile-avatar-container {
    margin-left: 0;
  }

  .profile-content {
    padding: 0;
  }
}

/* Vuetify 리스트 아이템 커스터마이징 */
:deep(.v-list-item__prepend) {
  padding-right: 12px !important;
}

:deep(.v-list-item__append) {
  padding-left: 12px !important;
}

:deep(.v-list-item) {
  min-height: 48px !important;
}
</style>