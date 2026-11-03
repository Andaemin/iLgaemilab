<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

// Components
import AppHeader from '@/components/common/AppHeader.vue'
import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileInfoSection from '@/components/profile/ProfileInfoSection.vue'
import ProfileMenuSection from '@/components/profile/ProfileMenuSection.vue'
import ProfileMainSection from '@/components/profile/ProfileMainSection.vue'
import ProfileLearningNoteSection from '@/components/profile/ProfileLearningNoteSection.vue'
import ImageCropModal from '@/components/profile/ImageCropModal.vue'
import AvatarPresetSelector from '@/components/profile/AvatarPresetSelector.vue'
import CommonSnackbar from '@/components/common/CommonSnackbar.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'
import AntGarden from '@/components/ant/AntGarden.vue'

const router = useRouter()
const authStore = useAuthStore()
const snackbarStore = useSnackbarStore()

// 현재 보기 상태 (profile 또는 learningNote)
const currentView = ref('profile')

const user = computed(() => {
  // 서버에서 받은 데이터만 사용, 기본값 제거
  if (authStore.user) {
    return authStore.user
  }
  
  // 로그인하지 않은 경우에만 빈 객체
  return {
    name: '',
    email: '',
    level: 0,
    occupation: '',
    occupationCategory: '',
    joinDate: '',
    avatarUrl: '',
    profileImage: '',
    birthDate: '',
    gender: '',
    phone: ''
  }
})

// 프로필 이미지 URL 계산 (반응성 강화)
const profileImageUrl = computed(() => {
  console.log('profileImageUrl computed 실행됨:', {
    profileImage: user.value?.profileImage,
    avatarUrl: user.value?.avatarUrl,
    timestamp: new Date().toISOString()
  })
  
  // 업로드된 프로필 이미지가 있는 경우
  if (user.value?.profileImage) {
    // 이미 전체 URL인 경우 그대로 반환
    if (user.value.profileImage.startsWith('http')) {
      return user.value.profileImage
    }
    // 상대 경로인 경우 API URL과 합성
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
    return `${apiUrl}${user.value.profileImage}`
  }
  
  // 프리셋 아바타가 있는 경우 (preset:id:emoji 형식)
  if (user.value?.avatarUrl && user.value.avatarUrl.startsWith('preset:')) {
    return user.value.avatarUrl
  }
  
  // 일반 URL 아바타가 있는 경우
  if (user.value?.avatarUrl && (user.value.avatarUrl.startsWith('http') || user.value.avatarUrl.startsWith('/'))) {
    return user.value.avatarUrl
  }
  
  // 기본값: 빈 문자열 (이모지로 폴백)
  return ''
})

// 이미지 선택 및 편집 관련 state
const selectedFile = ref(null)
const imagePreviewUrl = ref('')
const showCropModal = ref(false)
const showPresetSelector = ref(false)
const isLoading = ref(false)

// 강제 리렌더링을 위한 key
const headerKey = ref(0)

// 저장 완료 시그널
const saveCompleted = ref(0)

// 이미지 파일 선택 처리
const handleImageSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    snackbarStore.showError('JPEG, PNG, WebP 파일만 업로드 가능합니다')
    event.target.value = ''
    return
  }
  
  // 파일 크기 검증 (2MB = 2 * 1024 * 1024 bytes)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    snackbarStore.showError('파일 크기는 2MB 이하만 가능합니다')
    event.target.value = ''
    return
  }
  
  selectedFile.value = file
  
  // 이미지 해상도 검증
  const img = new Image()
  img.onload = () => {
    const minWidth = 400
    const minHeight = 400
    
    if (img.width < minWidth || img.height < minHeight) {
      snackbarStore.showError(`이미지 해상도는 최소 ${minWidth}×${minHeight}px 이상이어야 합니다`)
      event.target.value = ''
      return
    }
    
    // 검증 통과 시 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreviewUrl.value = e.target.result
      showCropModal.value = true
    }
    reader.readAsDataURL(file)
  }
  
  img.onerror = () => {
    snackbarStore.showError('이미지 파일을 읽을 수 없습니다')
    event.target.value = ''
  }
  
  img.src = URL.createObjectURL(file)
}

// 이미지 크롭 완료 처리
const handleCropComplete = async (cropData) => {
  if (!cropData || !cropData.previewUrl) {
    snackbarStore.showError('이미지 처리 중 오류가 발생했습니다')
    return
  }

  try {
    isLoading.value = true

    // Canvas를 사용하여 크롭된 이미지 생성
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = cropData.previewUrl
    })

    // 정사각형 크기 설정 (400x400)
    const size = 400
    canvas.width = size
    canvas.height = size

    // 이미지 크롭 및 필터 적용
    ctx.filter = `brightness(${1 + cropData.filters.brightness / 100}) contrast(${1 + cropData.filters.contrast / 100}) saturate(${1 + cropData.filters.saturation / 100})`

    const scale = cropData.scale
    const sourceSize = Math.min(img.width, img.height)
    const sourceX = (img.width - sourceSize) / 2 + (cropData.position.x / scale)
    const sourceY = (img.height - sourceSize) / 2 + (cropData.position.y / scale)

    ctx.drawImage(
      img,
      sourceX, sourceY, sourceSize / scale, sourceSize / scale,
      0, 0, size, size
    )

    // Canvas를 Blob으로 변환
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })

    if (!blob) {
      throw new Error('이미지 변환에 실패했습니다')
    }

    const formData = new FormData()
    const fileName = `profile_${Date.now()}.jpg`
    formData.append('profileImage', blob, fileName)

    // Vite proxy를 사용하므로 /api로 시작
    const uploadUrl = '/api/profile/upload-image'
    console.log('크롭 이미지 업로드 URL:', uploadUrl)
    console.log('인증 토큰:', authStore.token ? '존재함' : '없음')

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      },
      body: formData
    })

    console.log('크롭 응답 상태:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || '이미지 업로드에 실패했습니다')
    }

    const result = await response.json()
    console.log('이미지 업로드 결과:', result)

    // 사용자 정보 직접 업데이트 (서버에서 받은 전체 사용자 정보 사용)
    if (result.user) {
      authStore.setUser(result.user)

      // 로컬스토리지도 업데이트
      localStorage.setItem('user', JSON.stringify(result.user))

      // 사용자별 프로필도 업데이트
      if (result.user.email) {
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
        userProfiles[result.user.email] = {
          ...result.user,
          lastUpdateTime: new Date().toISOString()
        }
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles))
      }
    } else {
      // 서버에서 user 정보를 안 준 경우 수동으로 업데이트
      await authStore.updateProfile({
        profileImage: result.profileImagePath,
        avatarUrl: null // 업로드된 이미지 사용 시 아바타 URL 클리어
      })
    }

    // ProfileHeader 강제 리렌더링
    headerKey.value++

    snackbarStore.showSuccess('프로필 이미지가 업데이트되었습니다! 🎉')
    showCropModal.value = false

  } catch (error) {
    console.error('이미지 업로드 오류:', error)
    snackbarStore.showError(`업로드 실패: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 아바타 프리셋 선택 처리
const handlePresetSelect = async (preset) => {
  try {
    isLoading.value = true
    
    const updateResult = await authStore.updateProfile({
      avatarUrl: `preset:${preset.id}:${preset.emoji}`,
      profileImage: null // 프리셋 사용 시 업로드된 이미지 클리어
    })

    if (updateResult.success) {
      // ProfileHeader 강제 리렌더링
      headerKey.value++
      
      snackbarStore.showSuccess(`아바타가 ${preset.emoji}로 변경되었습니다!`)
      showPresetSelector.value = false
    } else {
      throw new Error(updateResult.message || '아바타 업데이트에 실패했습니다')
    }
    
  } catch (error) {
    console.error('아바타 업데이트 오류:', error)
    snackbarStore.showError(error.message || '아바타 업데이트에 실패했습니다')
  } finally {
    isLoading.value = false
  }
}

// 프로필 저장 처리
const handleSaveProfile = async (profileData) => {
  try {
    isLoading.value = true

    // 프로필 데이터 복사본 생성 (원본 보존)
    const profileDataToUpdate = { ...profileData }

    // 이미지 파일이 포함된 경우 별도 처리
    if (profileData.imageFile) {
      const formData = new FormData()
      const fileName = `profile_${Date.now()}.jpg`
      formData.append('profileImage', profileData.imageFile, fileName)

      // Vite proxy를 사용하므로 /api로 시작
      const uploadUrl = '/api/profile/upload-image'
      console.log('이미지 업로드 URL:', uploadUrl)
      console.log('인증 토큰:', authStore.token ? '존재함' : '없음')

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        },
        body: formData
      })

      console.log('응답 상태:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '이미지 업로드에 실패했습니다')
      }

      const result = await response.json()
      console.log('이미지 업로드 결과 (프로필 저장):', result)

      // 이미지 업로드 성공 시 프로필에 이미지 경로 추가
      profileDataToUpdate.profileImage = result.profileImagePath
      profileDataToUpdate.avatarUrl = null // 업로드된 이미지 사용 시 아바타 URL 클리어

      // imageFile은 서버로 보내지 않도록 제거
      delete profileDataToUpdate.imageFile
    } else {
      // 이미지 파일이 없는 경우에도 imageFile 속성 제거
      delete profileDataToUpdate.imageFile
    }

    // 프로필 정보 업데이트 (이미지 정보 포함)
    console.log('최종 업데이트 데이터:', profileDataToUpdate)
    const updateResult = await authStore.updateProfile(profileDataToUpdate)

    if (updateResult.success) {
      console.log('프로필 업데이트 성공, 강제 리렌더링 트리거')

      // 강제로 user computed를 다시 계산하도록 트리거
      // Vue의 반응성을 위해 nextTick 사용
      await nextTick()

      // 추가적으로 profileImageUrl이 업데이트되었는지 확인
      console.log('업데이트 후 profileImageUrl:', profileImageUrl.value)
      console.log('업데이트 후 user 정보:', authStore.user)

      // ProfileHeader 강제 리렌더링
      headerKey.value++

      // 저장 완료 시그널 증가 (자식 컴포넌트에서 watch로 감지)
      saveCompleted.value++

      snackbarStore.showSuccess('프로필이 성공적으로 업데이트되었습니다! ✨')
    } else {
      throw new Error(updateResult.message || '프로필 업데이트에 실패했습니다')
    }

  } catch (error) {
    console.error('프로필 저장 오류:', error)
    snackbarStore.showError(`프로필 저장 실패: ${error.message}`)
  } finally {
    isLoading.value = false
  }
}

// 테두리 변경 처리
const handleBorderChanged = async (newBorder) => {
  try {
    // 사용자 정보 업데이트
    await authStore.updateProfile({ profileBorder: newBorder })

    // ProfileHeader 강제 리렌더링
    headerKey.value++

    snackbarStore.showSuccess('프로필 테두리가 성공적으로 변경되었습니다! ✨')
  } catch (error) {
    console.error('테두리 변경 오류:', error)
    snackbarStore.showError('테두리 변경에 실패했습니다')
  }
}

// 프리셋 선택기 열기
const openPresetSelector = () => {
  showPresetSelector.value = true
}

// 학습 노트 보기 토글
const showLearningNote = () => {
  currentView.value = 'learningNote'
}

// 개미 키우기 보기 토글
const showAntGarden = () => {
  currentView.value = 'antGarden'
}

// 정보 수정하기 보기 토글
const showEditProfile = () => {
  currentView.value = 'editProfile'
}

// 프로필로 돌아가기
const backToProfile = () => {
  currentView.value = 'profile'
}

// 컴포넌트 마운트 시 실행
onMounted(() => {
  // 사용자 정보가 없으면 로그인 페이지로 리다이렉트
  if (!authStore.isAuthenticated) {
    router.push('/login')
  }
})
</script>

<template>
  <div>
    <AppHeader />
    
    <div class="profile-container">
      <v-container>
        <v-row>
          <!-- 프로필 헤더 (사이드바 형태) -->
          <v-col cols="12" md="4">
            <ProfileHeader
              :key="headerKey"
              :user="user"
              :profile-image-url="profileImageUrl"
            />
            
            <!-- 메뉴 섹션 -->
            <ProfileMenuSection
              @show-learning-note="showLearningNote"
              @show-ant-garden="showAntGarden"
              @show-edit-profile="showEditProfile"
            />
          </v-col>
          
          <!-- 메인 콘텐츠 영역 -->
          <v-col cols="12" md="8">
            <!-- 프로필 보기 -->
            <div v-if="currentView === 'profile'">
              <!-- 개인정보 섹션 -->
              <ProfileInfoSection
                :user="user"
              />
            </div>

            <!-- 학습 노트 보기 -->
            <div v-else-if="currentView === 'learningNote'">
              <!-- 뒤로가기 버튼 -->
              <div class="mb-4">
                <CommonVButton
                  common-variant="ghost"
                  @click="backToProfile"
                  prepend-icon="mdi-arrow-left"
                  size="small"
                >
                  내 정보로 돌아가기
                </CommonVButton>
              </div>

              <!-- 학습 노트 섹션 -->
              <ProfileLearningNoteSection />
            </div>

            <!-- 개미 키우기 보기 -->
            <div v-else-if="currentView === 'antGarden'">
              <!-- 뒤로가기 버튼 -->
              <div class="mb-4">
                <CommonVButton
                  common-variant="ghost"
                  @click="backToProfile"
                  prepend-icon="mdi-arrow-left"
                  size="small"
                >
                  내 정보로 돌아가기
                </CommonVButton>
              </div>

              <!-- 개미 키우기 섹션 -->
              <AntGarden />
            </div>

            <!-- 정보 수정하기 보기 -->
            <div v-else-if="currentView === 'editProfile'">
              <!-- 뒤로가기 버튼 -->
              <div class="mb-4">
                <CommonVButton
                  common-variant="ghost"
                  @click="backToProfile"
                  prepend-icon="mdi-arrow-left"
                  size="small"
                >
                  내 정보로 돌아가기
                </CommonVButton>
              </div>

              <!-- 정보 수정 섹션 -->
              <ProfileMainSection
                :user="user"
                :profile-image-url="profileImageUrl"
                :save-completed="saveCompleted"
                @image-select="handleImageSelect"
                @save-profile="handleSaveProfile"
                @open-preset-selector="openPresetSelector"
                @border-changed="handleBorderChanged"
              />
            </div>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <!-- 이미지 크롭 모달 -->
    <ImageCropModal
      :show="showCropModal"
      :image-preview-url="imagePreviewUrl"
      @close="showCropModal = false"
      @save="handleCropComplete"
    />

    <!-- 아바타 프리셋 선택 모달 -->
    <AvatarPresetSelector
      v-model="showPresetSelector"
      @preset-select="handlePresetSelect"
      :loading="isLoading"
    />

    <!-- 스낵바 -->
    <CommonSnackbar />
  </div>
</template>

<style scoped>
.profile-container {
  min-height: calc(100vh - 64px);
  background: rgb(var(--v-theme-grey-50));
  padding-top: 24px;
  padding-bottom: 24px;
}

@media (max-width: 960px) {
  .profile-container {
    padding-top: 16px;
    padding-bottom: 16px;
  }
}
</style>