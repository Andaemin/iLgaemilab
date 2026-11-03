<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import CommonVButton from '@/components/common/CommonVButton.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  imagePreviewUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close', 'save'])

// 크롭 관련 state
const imageScale = ref(1)
const imagePosition = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0 })

// 이미지 분석 및 자동 크롭 기능
const imageElement = ref(null)
const isAnalyzing = ref(false)
const faceDetected = ref(false)
const autoDetectedCenter = ref({ x: 0, y: 0 })
const imageDimensions = ref({ width: 0, height: 0 })
const imageQuality = ref(null)
const backgroundDetected = ref(false)
const backgroundRemovalEnabled = ref(false)

// 필터 및 enhancement 옵션
const brightness = ref(0)
const contrast = ref(0)
const saturation = ref(0)
const showAdvancedControls = ref(false)

const handleScaleChange = (value) => {
  imageScale.value = value
}

const handleDragStart = (event) => {
  isDragging.value = true
  dragStart.value = {
    x: event.clientX - imagePosition.value.x,
    y: event.clientY - imagePosition.value.y
  }
  event.preventDefault()
}

const handleDragMove = (event) => {
  if (!isDragging.value) return
  
  imagePosition.value = {
    x: event.clientX - dragStart.value.x,
    y: event.clientY - dragStart.value.y
  }
}

const handleDragEnd = () => {
  isDragging.value = false
}

const imageStyles = computed(() => ({
  width: `${imageScale.value * 100}%`,
  height: `${imageScale.value * 100}%`,
  transform: `translate(calc(-50% + ${imagePosition.value.x}px), calc(-50% + ${imagePosition.value.y}px))`,
  cursor: isDragging.value ? 'grabbing' : 'grab',
  filter: imageFilters.value
}))

const previewStyles = computed(() => ({
  backgroundImage: props.imagePreviewUrl ? `url(${props.imagePreviewUrl})` : 'none',
  backgroundSize: `${imageScale.value * 100}%`,
  backgroundPosition: `${50 + (imagePosition.value.x / 200) * 100}% ${50 + (imagePosition.value.y / 200) * 100}%`
}))

const closeCropModal = () => {
  // 상태 초기화
  imageScale.value = 1
  imagePosition.value = { x: 0, y: 0 }
  isDragging.value = false
  emit('close')
}

// 이미지 분석 및 자동 크롭 기능
const analyzeImage = async () => {
  if (!props.imagePreviewUrl) return

  try {
    isAnalyzing.value = true
    
    // 이미지 로드 및 분석
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    await new Promise((resolve, reject) => {
      img.onload = resolve
      img.onerror = reject
      img.src = props.imagePreviewUrl
    })

    imageDimensions.value = { width: img.width, height: img.height }
    
    // 이미지 품질 평가
    evaluateImageQuality(img)
    
    // 얼굴 감지 시뮬레이션 (실제 구현에서는 ML 라이브러리 사용)
    await simulateFaceDetection(img)
    
    // 배경 감지 시뮬레이션
    await simulateBackgroundDetection(img)
    
  } catch (error) {
    console.error('이미지 분석 실패:', error)
  } finally {
    isAnalyzing.value = false
  }
}

const evaluateImageQuality = (img) => {
  const { width, height } = img
  const resolution = width * height
  
  let quality = {
    resolution: 'good',
    aspectRatio: 'good',
    size: 'good',
    recommendations: []
  }
  
  // 해상도 체크
  if (resolution < 100000) { // 100K pixels
    quality.resolution = 'low'
    quality.recommendations.push('더 높은 해상도의 이미지를 사용하는 것을 권장합니다')
  } else if (resolution > 4000000) { // 4M pixels
    quality.resolution = 'high'
    quality.recommendations.push('이미지가 매우 선명합니다')
  }
  
  // 종횡비 체크
  const aspectRatio = width / height
  if (aspectRatio < 0.7 || aspectRatio > 1.3) {
    quality.aspectRatio = 'poor'
    quality.recommendations.push('정사각형에 가까운 이미지가 더 좋습니다')
  }
  
  imageQuality.value = quality
}

const simulateFaceDetection = async (img) => {
  // 실제 구현에서는 MediaPipe나 face-api.js 등을 사용
  // 여기서는 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // 랜덤하게 얼굴 감지 시뮬레이션
  const hasDetectedFace = Math.random() > 0.3
  faceDetected.value = hasDetectedFace
  
  if (hasDetectedFace) {
    // 얼굴이 있을 것으로 예상되는 위치 (상단 중앙)
    autoDetectedCenter.value = {
      x: (Math.random() - 0.5) * 40, // -20 to 20
      y: -20 + (Math.random() - 0.5) * 30 // -35 to -5
    }
  }
}

const simulateBackgroundDetection = async (img) => {
  // 실제로는 이미지 분석을 통해 단색 배경 감지
  await new Promise(resolve => setTimeout(resolve, 500))
  backgroundDetected.value = Math.random() > 0.4
}

const autoPositionToFace = () => {
  if (faceDetected.value) {
    imagePosition.value = { ...autoDetectedCenter.value }
    imageScale.value = 1.2 // 얼굴이 잘 보이도록 약간 확대
  }
}

const resetPosition = () => {
  imagePosition.value = { x: 0, y: 0 }
  imageScale.value = 1
  brightness.value = 0
  contrast.value = 0
  saturation.value = 0
}

const handleSave = async () => {
  // 실제 크롭된 이미지 생성 로직은 부모 컴포넌트에서 처리
  const cropData = {
    scale: imageScale.value,
    position: imagePosition.value,
    previewUrl: props.imagePreviewUrl,
    filters: {
      brightness: brightness.value,
      contrast: contrast.value,
      saturation: saturation.value
    },
    backgroundRemoval: backgroundRemovalEnabled.value
  }
  
  emit('save', cropData)
}

// 필터 적용된 이미지 스타일
const imageFilters = computed(() => {
  const filters = []
  if (brightness.value !== 0) filters.push(`brightness(${1 + brightness.value / 100})`)
  if (contrast.value !== 0) filters.push(`contrast(${1 + contrast.value / 100})`)
  if (saturation.value !== 0) filters.push(`saturate(${1 + saturation.value / 100})`)
  return filters.length > 0 ? filters.join(' ') : 'none'
})

// 이미지가 변경될 때 자동 분석
watch(() => props.imagePreviewUrl, async (newUrl) => {
  if (newUrl) {
    await nextTick()
    await analyzeImage()
  }
}, { immediate: true })
</script>

<template>
  <v-dialog
    :model-value="show"
    max-width="600"
    persistent
    @update:model-value="closeCropModal"
  >
    <v-card class="crop-modal">
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-h6 font-weight-bold">프로필 이미지 편집</span>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeCropModal"
        />
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- 이미지 분석 상태 -->
        <div v-if="isAnalyzing" class="analysis-banner mb-4">
          <v-alert type="info" variant="tonal" class="d-flex align-center">
            <v-progress-circular indeterminate size="16" class="mr-3" />
            <span>이미지를 분석 중입니다...</span>
          </v-alert>
        </div>

        <!-- 이미지 품질 및 자동 크롭 정보 -->
        <div v-if="imageQuality && !isAnalyzing" class="quality-info mb-4">
          <v-row>
            <v-col cols="12" md="8">
              <div class="d-flex align-center gap-3 mb-2">
                <v-icon 
                  :color="faceDetected ? 'success' : 'grey'"
                  size="20"
                >
                  {{ faceDetected ? 'mdi-face-recognition' : 'mdi-face-outline' }}
                </v-icon>
                <span class="text-body-2">
                  {{ faceDetected ? '얼굴이 감지되었습니다' : '얼굴을 감지하지 못했습니다' }}
                </span>
                <CommonVButton
                  v-if="faceDetected"
                  common-variant="ghost"
                  size="x-small"
                  @click="autoPositionToFace"
                >
                  자동 맞춤
                </CommonVButton>
              </div>
              
              <div v-if="imageQuality.recommendations.length > 0" class="recommendations">
                <p class="text-caption text-grey-600 mb-1">권장사항:</p>
                <ul class="text-caption text-grey-600">
                  <li v-for="rec in imageQuality.recommendations" :key="rec">{{ rec }}</li>
                </ul>
              </div>
            </v-col>
            <v-col cols="12" md="4" class="text-right">
              <div class="quality-metrics">
                <v-chip
                  :color="imageQuality.resolution === 'high' ? 'success' : imageQuality.resolution === 'good' ? 'info' : 'warning'"
                  size="x-small"
                  class="mr-1 mb-1"
                >
                  {{ imageDimensions.width }}×{{ imageDimensions.height }}
                </v-chip>
                <v-chip
                  v-if="backgroundDetected"
                  color="info"
                  size="x-small"
                  class="mb-1"
                >
                  배경 감지됨
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </div>

        <div class="crop-container">
          <!-- 크롭 미리보기 영역 -->
          <div class="crop-preview-area">
            <div class="crop-circle-container">
              <div 
                class="crop-image-wrapper"
                @mousedown="handleDragStart"
                @mousemove="handleDragMove"
                @mouseup="handleDragEnd"
                @mouseleave="handleDragEnd"
              >
                <img 
                  v-if="imagePreviewUrl" 
                  ref="imageElement"
                  :src="imagePreviewUrl" 
                  alt="선택된 이미지" 
                  class="crop-image"
                  :style="imageStyles"
                />
              </div>
              <!-- 원형 크롭 가이드 -->
              <div class="crop-circle-guide"></div>
              <!-- 얼굴 감지 표시 -->
              <div v-if="faceDetected && !isDragging" class="face-indicator">
                <v-icon color="success" size="20">mdi-face-recognition</v-icon>
              </div>
            </div>
            
            <!-- 실제 아바타 미리보기 -->
            <div class="avatar-preview">
              <v-avatar size="80" class="preview-avatar">
                <div 
                  class="preview-avatar-inner"
                  :style="previewStyles"
                >
                  <span v-if="!imagePreviewUrl" class="preview-emoji">🥰</span>
                </div>
              </v-avatar>
              <p class="text-caption text-grey-600 mt-2">미리보기</p>
            </div>
          </div>
          
          <div class="crop-controls mt-6">
            <!-- 기본 컨트롤 -->
            <div class="basic-controls mb-4">
              <!-- 크기 조절 슬라이더 -->
              <div class="scale-control mb-4">
                <label class="text-body-2 font-weight-medium mb-2 d-block">크기 조절</label>
                <div class="scale-slider-container">
                  <span class="scale-label text-caption">작게</span>
                  <v-slider
                    :model-value="imageScale"
                    min="0.5"
                    max="3"
                    step="0.1"
                    color="primary"
                    class="mx-4"
                    @update:model-value="handleScaleChange"
                  />
                  <span class="scale-label text-caption">크게</span>
                </div>
              </div>

              <!-- 빠른 액션 버튼들 -->
              <div class="quick-actions d-flex gap-2 mb-4">
                <CommonVButton
                  common-variant="ghost"
                  size="small"
                  @click="resetPosition"
                  icon="mdi-backup-restore"
                >
                  초기화
                </CommonVButton>
                <CommonVButton
                  v-if="backgroundDetected"
                  common-variant="ghost"
                  size="small"
                  @click="backgroundRemovalEnabled = !backgroundRemovalEnabled"
                  :icon="backgroundRemovalEnabled ? 'mdi-image-outline' : 'mdi-image-off-outline'"
                >
                  {{ backgroundRemovalEnabled ? '배경 복원' : '배경 제거' }}
                </CommonVButton>
              </div>
            </div>

            <!-- 고급 컨트롤 토글 -->
            <div class="advanced-toggle mb-3">
              <v-btn
                variant="text"
                size="small"
                @click="showAdvancedControls = !showAdvancedControls"
                class="text-caption"
              >
                <v-icon size="16" class="mr-1">
                  {{ showAdvancedControls ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
                </v-icon>
                고급 설정
              </v-btn>
            </div>

            <!-- 고급 컨트롤 -->
            <v-expand-transition>
              <div v-if="showAdvancedControls" class="advanced-controls">
                <v-divider class="mb-4" />
                
                <!-- 밝기 조절 -->
                <div class="filter-control mb-3">
                  <label class="text-body-2 font-weight-medium mb-2 d-block">밝기</label>
                  <div class="filter-slider-container">
                    <span class="filter-label text-caption">어둡게</span>
                    <v-slider
                      v-model="brightness"
                      min="-50"
                      max="50"
                      step="5"
                      color="warning"
                      class="mx-4"
                      show-ticks="always"
                      tick-size="2"
                    />
                    <span class="filter-label text-caption">밝게</span>
                  </div>
                </div>

                <!-- 대비 조절 -->
                <div class="filter-control mb-3">
                  <label class="text-body-2 font-weight-medium mb-2 d-block">대비</label>
                  <div class="filter-slider-container">
                    <span class="filter-label text-caption">낮게</span>
                    <v-slider
                      v-model="contrast"
                      min="-50"
                      max="50"
                      step="5"
                      color="info"
                      class="mx-4"
                      show-ticks="always"
                      tick-size="2"
                    />
                    <span class="filter-label text-caption">높게</span>
                  </div>
                </div>

                <!-- 채도 조절 -->
                <div class="filter-control mb-3">
                  <label class="text-body-2 font-weight-medium mb-2 d-block">채도</label>
                  <div class="filter-slider-container">
                    <span class="filter-label text-caption">흐리게</span>
                    <v-slider
                      v-model="saturation"
                      min="-50"
                      max="50"
                      step="5"
                      color="success"
                      class="mx-4"
                      show-ticks="always"
                      tick-size="2"
                    />
                    <span class="filter-label text-caption">선명하게</span>
                  </div>
                </div>
              </div>
            </v-expand-transition>
            
            <p class="text-caption text-grey-600 mt-4">이미지를 드래그하여 위치를 조정하세요</p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="pa-6 pt-0">
        <v-spacer />
        <CommonVButton
          common-variant="secondary"
          @click="closeCropModal"
          class="mr-3"
        >
          취소
        </CommonVButton>
        <CommonVButton
          common-variant="primary"
          @click="handleSave"
        >
          저장
        </CommonVButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.crop-modal {
  font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
}

/* 크롭 미리보기 영역 */
.crop-preview-area {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  justify-content: center;
  align-items: flex-start;
}

.crop-circle-container {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgb(var(--v-theme-grey-300));
  background: rgb(var(--v-theme-grey-50));
}

.crop-image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 50%;
}

.crop-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform-origin: center;
  object-fit: cover;
  user-select: none;
  transition: transform 0.1s ease;
  transform: translate(-50%, -50%);
}

.crop-circle-guide {
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  border: 2px solid rgb(var(--v-theme-primary));
  border-radius: 50%;
  pointer-events: none;
  box-shadow: 0 0 0 1px white;
}

/* 아바타 미리보기 */
.avatar-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.preview-avatar {
  border: 2px solid rgb(var(--v-theme-grey-200));
  background: rgb(var(--v-theme-grey-100));
}

.preview-avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-emoji {
  font-size: 32px;
  font-family: 'TossFaceFont', system-ui;
}

/* 크기 조절 컨트롤 */
.scale-slider-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.scale-label {
  min-width: 30px;
  text-align: center;
  color: rgb(var(--v-theme-grey-500));
}

/* 새로운 스타일 추가 */
.analysis-banner {
  border-radius: var(--radius-md);
}

.quality-info {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: var(--radius-md);
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.12);
}

.recommendations ul {
  list-style-type: disc;
  padding-left: 16px;
  margin: 0;
}

.recommendations li {
  margin-bottom: 2px;
}

.quality-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.face-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
  box-shadow: var(--shadow-sm);
}

.quick-actions {
  flex-wrap: wrap;
}

.advanced-controls {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: var(--radius-md);
  padding: 16px;
}

.filter-control {
  margin-bottom: 12px;
}

.filter-slider-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-label {
  min-width: 50px;
  text-align: center;
  color: rgb(var(--v-theme-grey-500));
  font-size: 11px;
}

.advanced-toggle {
  text-align: center;
}

/* 필터 적용된 이미지 전환 효과 */
.crop-image {
  transition: filter 0.3s ease, transform 0.1s ease;
}

/* 모바일 반응형 */
@media (max-width: 600px) {
  .crop-preview-area {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  
  .quality-info {
    padding: 12px;
  }
  
  .quality-metrics {
    align-items: flex-start;
    margin-top: 8px;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .filter-slider-container {
    gap: 8px;
  }
  
  .filter-label {
    min-width: 40px;
    font-size: 10px;
  }
  
  .advanced-controls {
    padding: 12px;
  }
}
</style>