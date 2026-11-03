import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
  }),
  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
    hasCompletedLevelTest: (state) => state.user?.levelTestCompleted || false,
    currentLevel: (state) => state.user?.currentLevel || 0,
    userOccupation: (state) => state.user?.occupationCategory || null,
  },
  actions: {
    setUser(user) {
      this.user = user
      this.isAuthenticated = !!user
    },
    setToken(token) {
      this.token = token
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    },
    
    // ========== 수정: 프로필 이미지 & 로컬 백업 추가 ==========
    async checkAuth() {
      if (!this.token) {
        this.isAuthenticated = false
        // 🆕 토큰이 없어도 저장된 프로필 로드
        this.loadSavedUserProfile()
        return false
      }

      try {
        const response = await axios.get('/api/auth/me')
        if (response.data.success) {
          // 🆕 프로필 이미지 URL 정규화
          const userData = { ...response.data.user }
          if (userData.profileImage && !userData.profileImage.startsWith('http')) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
            userData.profileImage = `${apiUrl}${userData.profileImage}`
          }
          
          this.setUser(userData)
          
          // 🆕 서버 데이터를 로컬스토리지에 백업
          localStorage.setItem('user', JSON.stringify(userData))
          
          // 🆕 로컬 프로필과 병합
          this.mergeLocalProfileWithServer(userData)
          
          return true
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // 🆕 서버 실패 시에도 로컬 프로필 로드
        this.loadSavedUserProfile()
        this.logout()
      }
      return false
    },
    
    // ========== 수정: 로그아웃 시 프로필 백업 ==========
    logout() {
      // 🆕 로그아웃 전 사용자 정보 백업
      if (this.user && this.user.email) {
        localStorage.setItem('lastUser', JSON.stringify(this.user))
        
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
        userProfiles[this.user.email] = {
          ...this.user,
          lastLoginTime: new Date().toISOString()
        }
        localStorage.setItem('userProfiles', JSON.stringify(userProfiles))
      }
      
      this.user = null
      this.isAuthenticated = false
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('rememberMe')
      delete axios.defaults.headers.common['Authorization']
    },
    
    // ========== 수정: 초기화 시 로컬 프로필 로드 ==========
    async initializeAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        await this.checkAuth()
      } else {
        // 🆕 토큰이 없어도 저장된 프로필 로드
        this.loadSavedUserProfile()
      }
    },
    
    // ========== 🆕 새로 추가: 프로필 관리 기능 ==========
    
    // 프로필 업데이트 (메인 함수)
    async updateProfile(profileData) {
      return await this.updateUserProfile(profileData)
    },
    
    // 서버 API로 프로필 업데이트
    async updateUserProfile(profileData) {
      try {
        const response = await axios.put('/api/profile/update', profileData)
        
        if (response.data.success) {
          // 서버에서 받은 최신 정보로 업데이트
          this.setUser(response.data.user)
          this.isAuthenticated = true
          
          // 로컬스토리지 백업
          localStorage.setItem('user', JSON.stringify(response.data.user))
          
          // 사용자별 프로필 업데이트
          if (response.data.user && response.data.user.email) {
            const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
            userProfiles[response.data.user.email] = {
              ...response.data.user,
              lastUpdateTime: new Date().toISOString()
            }
            localStorage.setItem('userProfiles', JSON.stringify(userProfiles))
          }
          
          return { success: true, message: '프로필이 성공적으로 업데이트되었습니다.' }
        } else {
          return { success: false, message: response.data.message || '업데이트에 실패했습니다.' }
        }
      } catch (error) {
        console.error('Profile update failed:', error)
        // 서버 실패 시 로컬에서 업데이트
        return await this.updateUserProfileLocally(profileData)
      }
    },
    
    // 로컬에서만 프로필 업데이트 (서버 실패 시 폴백)
    async updateUserProfileLocally(profileData) {
      try {
        if (!this.user || !this.user.email) {
          // 토큰이 있으면 서버에서 다시 가져오기 시도
          if (this.token) {
            await this.checkAuth()
            if (this.user) {
              return await this.updateUserProfileLocally(profileData)
            }
          }
          return { success: false, message: '사용자 정보가 없습니다. 다시 로그인해주세요.' }
        }
        
        // 현재 사용자 정보 업데이트
        const updatedUser = {
          ...this.user,
          name: profileData.name !== undefined ? profileData.name : this.user.name,
          birthDate: profileData.birthDate !== undefined ? profileData.birthDate : this.user.birthDate,
          gender: profileData.gender !== undefined ? profileData.gender : this.user.gender,
          phone: profileData.phone !== undefined ? profileData.phone : this.user.phone,
          occupation: profileData.occupation !== undefined ? profileData.occupation : this.user.occupation,
          occupationCategory: profileData.occupation !== undefined ? profileData.occupation : this.user.occupationCategory,
          avatarUrl: profileData.avatarUrl !== undefined ? profileData.avatarUrl : this.user.avatarUrl,
          profileImage: profileData.profileImage !== undefined ? profileData.profileImage : this.user.profileImage,
          learningGoal: profileData.learningGoal !== undefined ? profileData.learningGoal : this.user.learningGoal
        }
        
        // 프로필 이미지 URL 정규화
        if (updatedUser.profileImage && !updatedUser.profileImage.startsWith('http')) {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
          updatedUser.profileImage = `${apiUrl}${updatedUser.profileImage}`
        }
        
        // 스토어 업데이트
        this.setUser(updatedUser)
        
        // 로컬스토리지 저장
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // 사용자별 프로필 저장
        if (updatedUser.email) {
          const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
          userProfiles[updatedUser.email] = updatedUser
          localStorage.setItem('userProfiles', JSON.stringify(userProfiles))
        }
        
        return { success: true, message: '프로필이 성공적으로 업데이트되었습니다.' }
      } catch (error) {
        console.error('Local profile update failed:', error)
        return { success: false, message: '프로필 업데이트에 실패했습니다.' }
      }
    },
    
    // 저장된 프로필 로드 (4단계 우선순위)
    loadSavedUserProfile() {
      try {
        // 1순위: 마지막 사용자
        const lastUser = localStorage.getItem('lastUser')
        if (lastUser) {
          const userInfo = JSON.parse(lastUser)
          this.user = userInfo
          return
        }
        
        // 2순위: 일반 user 저장소
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          const userInfo = JSON.parse(savedUser)
          this.user = userInfo
          return
        }
        
        // 3순위: userProfiles에서 최신 사용자
        const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
        const emails = Object.keys(userProfiles)
        
        if (emails.length > 0) {
          const latestProfile = emails.reduce((latest, email) => {
            const profile = userProfiles[email]
            if (!latest || (profile.lastLoginTime && profile.lastLoginTime > (latest.lastLoginTime || ''))) {
              return profile
            }
            return latest
          }, null)
          
          if (latestProfile) {
            // 프로필 이미지 URL 정규화
            if (latestProfile.profileImage && !latestProfile.profileImage.startsWith('http')) {
              const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3031'
              latestProfile.profileImage = `${apiUrl}${latestProfile.profileImage}`
            }
            
            this.user = latestProfile
            return
          }
        }
      } catch (error) {
        console.error('저장된 사용자 프로필 로드 실패:', error)
      }
    },
    
    // 사용자 정보 부분 업데이트
    updateUser(userData) {
      if (this.user) {
        this.user = { ...this.user, ...userData }
      }
    },
    
    // 서버-로컬 데이터 병합
    mergeLocalProfileWithServer(serverUser) {
      try {
        // 서버 데이터 우선 사용
        const finalUser = { ...serverUser }
        
        // 로컬 프로필 참조 (충돌 체크용)
        if (serverUser.email) {
          const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
          const localProfile = userProfiles[serverUser.email]
          
          if (localProfile) {
            // 로컬에만 있는 데이터 로그 출력
            Object.keys(localProfile).forEach(key => {
              if (!serverUser[key] && localProfile[key]) {
                console.log(`로컬에만 존재하는 ${key}:`, localProfile[key])
              }
            })
          }
        }
        
        this.setUser(finalUser)
      } catch (error) {
        console.error('프로필 데이터 병합 실패:', error)
        this.setUser(serverUser)
      }
    },
  },
})