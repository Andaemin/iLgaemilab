<script setup>
import { ref, computed } from 'vue'
import CommonVCard from '@/components/common/CommonVCard.vue'
import CommonVButton from '@/components/common/CommonVButton.vue'
import { useSnackbarStore } from '@/stores/useSnackbarStore'

const snackbarStore = useSnackbarStore()

// 학습 노트 데이터
const notes = ref([])
const koreanText = ref('')
const englishText = ref('')
const isTranslating = ref(false)
const showAddDialog = ref(false)
const selectedCategory = ref('all')
const noteCategory = ref('vocabulary')

// 카테고리 목록
const categories = [
  { id: 'all', label: '전체', icon: '📚', color: 'blue' },
  { id: 'vocabulary', label: '단어', icon: '📝', color: 'green' },
  { id: 'grammar', label: '문법', icon: '📖', color: 'orange' },
  { id: 'conversation', label: '회화', icon: '💬', color: 'purple' },
  { id: 'etc', label: '기타', icon: '✨', color: 'cyan' }
]

// 통계 계산
const stats = computed(() => {
  return {
    total: notes.value.length,
    today: notes.value.filter(note => {
      const today = new Date().toDateString()
      const noteDate = new Date(note.createdAt).toDateString()
      return today === noteDate
    }).length,
    thisWeek: notes.value.filter(note => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(note.createdAt) > weekAgo
    }).length
  }
})

// 필터링된 노트
const filteredNotes = computed(() => {
  if (selectedCategory.value === 'all') {
    return notes.value
  }
  return notes.value.filter(note => note.category === selectedCategory.value)
})

// 로컬스토리지에서 노트 로드
const loadNotes = () => {
  const savedNotes = localStorage.getItem('learningNotes')
  if (savedNotes) {
    notes.value = JSON.parse(savedNotes)
  }
}

// 노트 저장
const saveNotes = () => {
  localStorage.setItem('learningNotes', JSON.stringify(notes.value))
}

// 번역 API 호출
const translateToEnglish = async () => {
  if (!koreanText.value.trim()) {
    snackbarStore.showError('한국어 텍스트를 입력해주세요')
    return
  }

  try {
    isTranslating.value = true
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(koreanText.value)}`
    const response = await fetch(apiUrl)
    const data = await response.json()

    if (data && data[0] && data[0][0]) {
      englishText.value = data[0][0][0]
    } else {
      throw new Error('번역 결과를 가져올 수 없습니다')
    }

    snackbarStore.showSuccess('번역이 완료되었습니다! 🎉')
  } catch (error) {
    console.error('번역 오류:', error)
    snackbarStore.showError('번역 중 오류가 발생했습니다')
    englishText.value = ''
  } finally {
    isTranslating.value = false
  }
}

// 노트 추가
const addNote = () => {
  if (!koreanText.value.trim() || !englishText.value.trim()) {
    snackbarStore.showError('한국어와 영어를 모두 입력해주세요')
    return
  }

  const newNote = {
    id: Date.now(),
    korean: koreanText.value.trim(),
    english: englishText.value.trim(),
    category: noteCategory.value,
    createdAt: new Date().toISOString(),
    tags: []
  }

  notes.value.unshift(newNote)
  saveNotes()

  koreanText.value = ''
  englishText.value = ''
  noteCategory.value = 'vocabulary'
  showAddDialog.value = false

  snackbarStore.showSuccess('학습 노트가 추가되었습니다! ✨')
}

// 노트 삭제
const deleteNote = (id) => {
  const index = notes.value.findIndex(note => note.id === id)
  if (index !== -1) {
    notes.value.splice(index, 1)
    saveNotes()
    snackbarStore.showSuccess('노트가 삭제되었습니다')
  }
}

// 날짜 포맷
const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금 전'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`

  return date.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric'
  })
}

// 카테고리 정보 가져오기
const getCategoryInfo = (categoryId) => {
  return categories.find(cat => cat.id === categoryId) || categories[4]
}

// 다이얼로그 열기
const openAddDialog = () => {
  koreanText.value = ''
  englishText.value = ''
  noteCategory.value = 'vocabulary'
  showAddDialog.value = true
}

// 컴포넌트 마운트 시 노트 로드
loadNotes()
</script>

<template>
  <div class="learning-note-section">
    <!-- 통계 카드 -->
    <div class="stats-section common-animate-slide-up mb-6">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-blue">
            <span class="stat-icon">📚</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">전체 노트</span>
            <span class="stat-value">{{ stats.total }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-success">
            <span class="stat-icon">✨</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">오늘 학습</span>
            <span class="stat-value">{{ stats.today }}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-orange">
            <span class="stat-icon">🔥</span>
          </div>
          <div class="stat-content">
            <span class="stat-label">이번 주</span>
            <span class="stat-value">{{ stats.thisWeek }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 카테고리 필터 -->
    <div class="category-filter-section common-animate-slide-up mb-6">
      <div class="category-chips">
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-chip"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          <span class="chip-icon">{{ category.icon }}</span>
          <span class="chip-label">{{ category.label }}</span>
          <span v-if="category.id === 'all'" class="chip-count">{{ notes.length }}</span>
          <span v-else class="chip-count">{{ notes.filter(n => n.category === category.id).length }}</span>
        </button>
      </div>
    </div>

    <!-- 노트 추가 버튼 -->
    <div class="add-note-section common-animate-slide-up mb-6">
      <button class="add-note-button" @click="openAddDialog">
        <div class="add-button-icon">➕</div>
        <div class="add-button-text">
          <h3>새 노트 추가</h3>
          <p>배운 내용을 기록하고 복습하세요</p>
        </div>
        <div class="add-button-arrow">→</div>
      </button>
    </div>

    <!-- 노트 리스트 -->
    <div class="notes-grid">
      <div
        v-for="note in filteredNotes"
        :key="note.id"
        class="note-card common-animate-fade-in"
      >
        <!-- 카테고리 배지 -->
        <div class="note-category-badge" :class="`badge-${getCategoryInfo(note.category).color}`">
          <span class="badge-icon">{{ getCategoryInfo(note.category).icon }}</span>
          <span class="badge-label">{{ getCategoryInfo(note.category).label }}</span>
        </div>

        <!-- 노트 헤더 -->
        <div class="note-header">
          <span class="note-date">{{ formatDate(note.createdAt) }}</span>
          <button class="note-delete-btn" @click="deleteNote(note.id)">
            <v-icon size="small" color="error">mdi-delete-outline</v-icon>
          </button>
        </div>

        <!-- 노트 내용 -->
        <div class="note-content">
          <div class="note-section korean-section">
            <div class="note-lang-label">
              <span class="flag-icon">🇰🇷</span>
              <span class="lang-text">한국어</span>
            </div>
            <p class="note-text">{{ note.korean }}</p>
          </div>

          <div class="note-divider">
            <span class="divider-icon">⬇️</span>
          </div>

          <div class="note-section english-section">
            <div class="note-lang-label">
              <span class="flag-icon">🇺🇸</span>
              <span class="lang-text">English</span>
            </div>
            <p class="note-text english-text">{{ note.english }}</p>
          </div>
        </div>
      </div>

      <!-- 노트가 없을 때 -->
      <div v-if="filteredNotes.length === 0" class="empty-state">
        <div class="empty-icon">
          {{ selectedCategory === 'all' ? '📚' : getCategoryInfo(selectedCategory).icon }}
        </div>
        <h3 class="common-title1">
          {{ selectedCategory === 'all' ? '아직 학습 노트가 없어요' : `${getCategoryInfo(selectedCategory).label} 노트가 없어요` }}
        </h3>
        <p class="common-body2">새 노트를 추가하여 학습을 시작해보세요!</p>
        <CommonVButton
          common-variant="primary"
          @click="openAddDialog"
          class="mt-4"
        >
          첫 노트 추가하기
        </CommonVButton>
      </div>
    </div>

    <!-- 노트 추가 다이얼로그 -->
    <v-dialog v-model="showAddDialog" max-width="700" persistent scrollable>
      <div class="dialog-wrapper">
        <CommonVCard class="dialog-card dialog-scrollable">
          <v-card-title class="pa-6 pb-4">
            <div class="dialog-header">
              <span class="dialog-icon">✍️</span>
              <div>
                <h2 class="common-title1 mb-1">새 학습 노트</h2>
                <p class="common-body2 text-grey-600">배운 내용을 기록하고 영어로 번역해보세요</p>
              </div>
            </div>
          </v-card-title>

          <v-card-text class="pa-6 pt-2">
            <!-- 카테고리 선택 -->
            <div class="input-section">
              <label class="input-label">
                <span class="label-icon">🏷️</span>
                <span>카테고리</span>
              </label>
              <div class="category-select-chips">
                <button
                  v-for="cat in categories.filter(c => c.id !== 'all')"
                  :key="cat.id"
                  class="category-select-chip"
                  :class="{ active: noteCategory === cat.id }"
                  @click="noteCategory = cat.id"
                >
                  <span class="chip-icon">{{ cat.icon }}</span>
                  <span class="chip-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <!-- 한국어 입력 -->
            <div class="input-section">
              <label class="input-label">
                <span class="flag-icon">🇰🇷</span>
                <span>한국어</span>
              </label>
              <v-textarea
                v-model="koreanText"
                placeholder="예: 안녕하세요, 만나서 반갑습니다"
                rows="4"
                variant="outlined"
                color="primary"
                hide-details
                class="custom-textarea"
              />
            </div>

            <!-- 번역 버튼 -->
            <div class="translate-button-wrapper">
              <button
                class="translate-button"
                @click="translateToEnglish"
                :disabled="!koreanText.trim() || isTranslating"
              >
                <span v-if="isTranslating" class="translate-loading">
                  <v-progress-circular indeterminate size="20" width="2" color="white" />
                  <span>번역 중...</span>
                </span>
                <span v-else class="translate-content">
                  <span class="translate-icon">🔄</span>
                  <span>영어로 자동 번역하기</span>
                </span>
              </button>
            </div>

            <!-- 영어 입력 -->
            <div class="input-section">
              <label class="input-label">
                <span class="flag-icon">🇺🇸</span>
                <span>English</span>
              </label>
              <v-textarea
                v-model="englishText"
                placeholder="번역 버튼을 누르거나 직접 입력하세요"
                rows="4"
                variant="outlined"
                color="primary"
                hide-details
                class="custom-textarea"
              />
            </div>
          </v-card-text>

          <v-card-actions class="pa-6 pt-0">
            <div class="dialog-actions">
              <CommonVButton
                common-variant="ghost"
                @click="showAddDialog = false"
                size="large"
              >
                취소
              </CommonVButton>
              <CommonVButton
                common-variant="primary"
                @click="addNote"
                :disabled="!koreanText.trim() || !englishText.trim()"
                size="large"
                prepend-icon="mdi-check"
              >
                추가하기
              </CommonVButton>
            </div>
          </v-card-actions>
        </CommonVCard>
      </div>
    </v-dialog>
  </div>
</template>

<style scoped>
.learning-note-section {
  padding: 0;
}

/* Stats Section */
.stats-section {
  margin-bottom: var(--spacing-xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  transition: all var(--transition-fast);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 24px;
  font-family: 'TossFaceFont', system-ui;
}

.stat-blue {
  background: var(--common-blue-light);
}

.stat-success {
  background: var(--success-light);
}

.stat-orange {
  background: var(--warning-light);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: var(--gray-600);
  font-weight: 500;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--gray-900);
}

/* Category Filter */
.category-filter-section {
  margin-bottom: var(--spacing-xl);
}

.category-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.category-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 10px 16px;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
}

.category-chip:hover {
  border-color: var(--common-blue);
  transform: translateY(-1px);
}

.category-chip.active {
  background: var(--common-blue);
  border-color: var(--common-blue);
  color: white;
  box-shadow: var(--shadow-sm);
}

.chip-icon {
  font-size: 16px;
  font-family: 'TossFaceFont', system-ui;
}

.chip-label {
  font-weight: 600;
}

.chip-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  margin-left: 4px;
}

.category-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
}

/* Add Note Section */
.add-note-section {
  margin-bottom: var(--spacing-2xl);
}

.add-note-button {
  width: 100%;
  background: linear-gradient(135deg, var(--common-blue), var(--common-blue-dark));
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

.add-note-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.add-note-button:hover::before {
  opacity: 1;
}

.add-note-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.add-note-button:active {
  transform: scale(0.98);
}

.add-button-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.add-button-text {
  flex: 1;
  text-align: left;
  color: white;
}

.add-button-text h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}

.add-button-text p {
  font-size: 13px;
  opacity: 0.9;
}

.add-button-arrow {
  font-size: 24px;
  color: white;
  transition: transform var(--transition-fast);
}

.add-note-button:hover .add-button-arrow {
  transform: translateX(4px);
}

/* Notes Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.note-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.note-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--common-blue), var(--info));
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.note-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--gray-200);
}

.note-card:hover::before {
  opacity: 1;
}

.note-category-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
}

.badge-blue {
  background: var(--common-blue-light);
  color: var(--common-blue);
}

.badge-green {
  background: var(--success-light);
  color: var(--success);
}

.badge-orange {
  background: var(--warning-light);
  color: var(--warning);
}

.badge-purple {
  background: #f3e8ff;
  color: #9333ea;
}

.badge-cyan {
  background: #e0f2fe;
  color: #0891b2;
}

.badge-icon {
  font-size: 14px;
  font-family: 'TossFaceFont', system-ui;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.note-date {
  font-size: 12px;
  color: var(--gray-500);
  font-weight: 500;
}

.note-delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.note-delete-btn:hover {
  background: var(--danger-light);
}

.note-content {
  margin-top: var(--spacing-md);
}

.note-section {
  margin-bottom: var(--spacing-md);
}

.korean-section {
  background: var(--common-blue-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.english-section {
  background: var(--success-light);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}

.note-lang-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.flag-icon {
  font-size: 16px;
  font-family: 'TossFaceFont', system-ui;
}

.lang-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.note-text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--gray-900);
  white-space: pre-wrap;
  word-break: break-word;
  font-weight: 500;
}

.english-text {
  font-style: italic;
}

.note-divider {
  text-align: center;
  margin: var(--spacing-md) 0;
}

.divider-icon {
  font-size: 16px;
  opacity: 0.3;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 96px;
  font-family: 'TossFaceFont', system-ui;
  margin-bottom: var(--spacing-lg);
  filter: grayscale(0.3);
  opacity: 0.8;
}

.empty-state h3 {
  margin-bottom: var(--spacing-sm);
  color: var(--gray-900);
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: var(--spacing-lg);
}

/* Dialog */
.dialog-wrapper {
  animation: dialogFadeIn 0.2s ease;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.dialog-card {
  border-radius: var(--radius-xl) !important;
}

.dialog-scrollable {
  max-height: 90vh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.dialog-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.dialog-icon {
  font-size: 40px;
  font-family: 'TossFaceFont', system-ui;
  flex-shrink: 0;
}

.input-section {
  margin-bottom: var(--spacing-lg);
}

.input-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
  font-weight: 600;
  color: var(--gray-900);
  font-size: 14px;
}

.label-icon {
  font-size: 16px;
  font-family: 'TossFaceFont', system-ui;
}

.category-select-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.category-select-chip {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 8px 16px;
  background: var(--gray-50);
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
  font-weight: 500;
  color: var(--gray-700);
}

.category-select-chip:hover {
  border-color: var(--common-blue);
  background: var(--common-blue-light);
}

.category-select-chip.active {
  background: var(--common-blue);
  border-color: var(--common-blue);
  color: white;
}

.custom-textarea :deep(.v-field__field) {
  font-size: 15px;
}

.translate-button-wrapper {
  margin: var(--spacing-xl) 0;
}

.translate-button {
  width: 100%;
  background: linear-gradient(135deg, var(--warning), #ff8c00);
  border: none;
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px rgba(255, 167, 36, 0.3);
}

.translate-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 167, 36, 0.4);
}

.translate-button:active:not(:disabled) {
  transform: scale(0.98);
}

.translate-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.translate-content,
.translate-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.translate-icon {
  font-size: 18px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.translate-button:not(:disabled):hover .translate-icon {
  animation-duration: 0.5s;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);
  width: 100%;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-sm);
  }

  .stat-card {
    padding: var(--spacing-md);
    flex-direction: column;
    text-align: center;
  }

  .stat-icon-wrapper {
    width: 40px;
    height: 40px;
  }

  .stat-icon {
    font-size: 20px;
  }

  .stat-value {
    font-size: 20px;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .category-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: var(--spacing-sm);
  }

  .category-chip {
    flex-shrink: 0;
  }

  .add-button-text h3 {
    font-size: 16px;
  }

  .add-button-text p {
    font-size: 12px;
  }

  .dialog-wrapper {
    max-height: 95vh;
    overflow-y: auto;
  }

  .dialog-scrollable {
    max-height: none;
  }

  .dialog-actions {
    flex-direction: column-reverse;
    position: sticky;
    bottom: 0;
    background: white;
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--gray-200);
    margin-top: var(--spacing-md);
  }

  .dialog-actions > * {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gap: var(--spacing-xs);
  }

  .stat-card {
    padding: var(--spacing-sm);
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 18px;
  }

  .add-note-button {
    padding: var(--spacing-lg);
  }

  .add-button-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
}
</style>
