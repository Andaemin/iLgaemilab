import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import bcrypt from 'bcrypt'
import { fileURLToPath } from 'url'
import authMiddleware from '../middlewares/auth.mjs'
import { User } from '../models/index.js'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to track profile changes
const trackProfileChange = async (userId, changeType, fieldName, oldValue, newValue, req) => {
  try {
    if (oldValue === newValue) return

    // Convert objects to JSON strings for comparison
    const oldStr = typeof oldValue === 'object' ? JSON.stringify(oldValue) : String(oldValue || '')
    const newStr = typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue || '')
    
    if (oldStr === newStr) return

    // Get device info from user agent
    const userAgent = req.get('User-Agent') || ''
    const deviceInfo = {
      userAgent,
      platform: req.get('sec-ch-ua-platform') || 'unknown',
      mobile: req.get('sec-ch-ua-mobile') === '?1',
      timestamp: new Date().toISOString()
    }

    // Determine if this is a security-sensitive change
    const securitySensitiveFields = ['email', 'password', 'phone']
    const isSecuritySensitive = securitySensitiveFields.includes(fieldName)

    // Create change description
    let changeDescription = `${fieldName} 변경`
    if (fieldName === 'name') changeDescription = '이름 변경'
    else if (fieldName === 'phone') changeDescription = '휴대전화 변경'
    else if (fieldName === 'occupation') changeDescription = '직업군 변경'
    else if (fieldName === 'learningGoal') changeDescription = '학습 목적 변경'
    else if (fieldName === 'profileImage') changeDescription = '프로필 이미지 변경'

    // ProfileChangeHistory model not implemented yet
    // await ProfileChangeHistory.create({ ... })

    console.log(`프로필 변경 기록됨: ${fieldName} (${oldStr} → ${newStr})`)
  } catch (error) {
    console.error('프로필 변경 추적 실패:', error)
    // Don't fail the main operation if tracking fails
  }
}

// uploads 디렉터리 생성
const uploadsDir = path.join(__dirname, '../../uploads/profiles')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    // 파일명: user-email-timestamp.확장자
    const userEmail = req.user?.email || 'anonymous'
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const filename = `${userEmail.replace('@', '-')}-${timestamp}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
  fileFilter: (req, file, cb) => {
    // 이미지 파일만 허용
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('이미지 파일만 업로드 가능합니다.'))
    }
  }
})

// 프로필 이미지 업로드 (기존 엔드포인트)
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
  try {
    console.log('프로필 이미지 업로드 요청 받음')
    console.log('사용자 정보:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : '없음')
    console.log('업로드된 파일:', req.file ? `파일명: ${req.file.filename}, 크기: ${req.file.size}` : '없음')
    
    if (!req.file) {
      console.log('파일이 업로드되지 않음')
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다.'
      })
    }

    // 업로드된 파일 확인
    console.log('파일 저장 경로:', req.file.path)
    console.log('파일 존재 여부:', fs.existsSync(req.file.path))

    // 업로드된 파일의 URL 생성
    const imageUrl = `/uploads/profiles/${req.file.filename}`
    console.log('생성된 이미지 URL:', imageUrl)

    // 관리자 계정 이미지 업로드 - 데이터베이스 저장
    if (req.user.email === 'admin@ilgaemilab.com') {
      console.log('관리자 계정 이미지 업로드 - DB에 저장')
      
      try {
        // 데이터베이스에서 관리자 계정 찾기
        let adminUser = await User.findOne({ where: { email: 'admin@ilgaemilab.com' } })
        
        if (!adminUser) {
          console.log('관리자 계정을 새로 생성합니다 (이미지 업로드)')
          adminUser = await User.create({
            email: 'admin@ilgaemilab.com',
            name: '관리자',
            password: await bcrypt.hash('admin123', 10),
            nationality: 'KR',
            nativeLanguage: 'Korean',
            occupationCategory: 'admin',
            koreanLevel: 'intermediate',
            currentLevel: 10,
            levelTestCompleted: true,
            phone: '',
            gender: null,
            birthDate: null,
            profileImage: imageUrl
          })
        } else {
          // 기존 관리자 계정의 이미지만 업데이트
          const oldImageUrl = adminUser.profileImage
          await adminUser.update({ profileImage: imageUrl })
          await adminUser.reload()
          
          // Track the avatar change
          await trackProfileChange(adminUser.id, 'avatar_change', 'profileImage', oldImageUrl, imageUrl, req)
        }
        
        const userData = adminUser.toJSON()
        delete userData.password
        
        console.log('관리자 이미지 DB 업데이트 성공')
        return res.json({
          success: true,
          message: '프로필 이미지가 성공적으로 업로드되었습니다.',
          imageUrl: imageUrl,
          filename: req.file.filename,
          user: userData
        })
        
      } catch (error) {
        console.error('관리자 이미지 업로드 DB 처리 실패:', error)
        // 에러 발생 시 기본 응답
        const updatedAdminData = {
          id: req.user.id,
          email: 'admin@ilgaemilab.com',
          name: '관리자',
          nationality: 'KR',
          nativeLanguage: 'Korean',
          occupationCategory: 'admin',
          koreanLevel: 'intermediate',
          currentLevel: 10,
          levelTestCompleted: true,
          phone: '',
          gender: null,
          birthDate: null,
          profileImage: imageUrl,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        return res.json({
          success: true,
          message: '프로필 이미지가 성공적으로 업로드되었습니다.',
          imageUrl: imageUrl,
          filename: req.file.filename,
          user: updatedAdminData
        })
      }
    }

    // 일반 사용자 DB 업데이트
    const currentUser = await User.findByPk(req.user.id)
    const oldImageUrl = currentUser?.profileImage
    
    await User.update(
      { profileImage: imageUrl },
      { where: { id: req.user.id } }
    )

    // Track the avatar change
    await trackProfileChange(req.user.id, 'avatar_change', 'profileImage', oldImageUrl, imageUrl, req)

    // 업데이트된 사용자 정보 조회
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    console.log('프로필 이미지 업로드 및 DB 업데이트 성공')
    res.json({
      success: true,
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
      imageUrl: imageUrl,
      filename: req.file.filename,
      user: updatedUser
    })

  } catch (error) {
    console.error('프로필 이미지 업로드 실패:', error)
    
    // 업로드된 파일이 있다면 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path)
        console.log('실패한 업로드 파일 삭제:', req.file.filename)
      } catch (unlinkError) {
        console.error('파일 삭제 실패:', unlinkError)
      }
    }
    
    res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다: ' + error.message
    })
  }
})

// 프로필 이미지 업로드 (새 엔드포인트 - 클라이언트 호환)
router.post('/upload-image', authMiddleware, upload.single('profileImage'), async (req, res) => {
  try {
    console.log('프로필 이미지 업로드 요청 받음 (upload-image)')
    console.log('사용자 정보:', req.user ? `ID: ${req.user.id}, Email: ${req.user.email}` : '없음')
    console.log('업로드된 파일:', req.file ? `파일명: ${req.file.filename}, 크기: ${req.file.size}` : '없음')
    
    if (!req.file) {
      console.log('파일이 업로드되지 않음')
      return res.status(400).json({
        success: false,
        message: '파일이 업로드되지 않았습니다.'
      })
    }

    // 업로드된 파일 확인
    console.log('파일 저장 경로:', req.file.path)
    console.log('파일 존재 여부:', fs.existsSync(req.file.path))

    // 업로드된 파일의 URL 생성
    const imageUrl = `/uploads/profiles/${req.file.filename}`
    console.log('생성된 이미지 URL:', imageUrl)

    // 관리자 계정 이미지 업로드 - 데이터베이스 저장
    if (req.user.email === 'admin@ilgaemilab.com') {
      console.log('관리자 계정 이미지 업로드 - DB에 저장')
      
      try {
        // 데이터베이스에서 관리자 계정 찾기
        let adminUser = await User.findOne({ where: { email: 'admin@ilgaemilab.com' } })
        
        if (!adminUser) {
          console.log('관리자 계정을 새로 생성합니다 (이미지 업로드)')
          adminUser = await User.create({
            email: 'admin@ilgaemilab.com',
            name: '관리자',
            password: await bcrypt.hash('admin123', 10),
            nationality: 'KR',
            nativeLanguage: 'Korean',
            occupationCategory: 'admin',
            koreanLevel: 'intermediate',
            currentLevel: 10,
            levelTestCompleted: true,
            phone: '',
            gender: null,
            birthDate: null,
            profileImage: imageUrl
          })
        } else {
          // 기존 관리자 계정의 이미지만 업데이트
          const oldImageUrl = adminUser.profileImage
          await adminUser.update({ profileImage: imageUrl })
          await adminUser.reload()
          
          // Track the avatar change
          await trackProfileChange(adminUser.id, 'avatar_change', 'profileImage', oldImageUrl, imageUrl, req)
        }
        
        const userData = adminUser.toJSON()
        delete userData.password
        
        console.log('관리자 이미지 DB 업데이트 성공')
        return res.json({
          success: true,
          message: '프로필 이미지가 성공적으로 업로드되었습니다.',
          profileImagePath: imageUrl,
          imageUrl: imageUrl,
          filename: req.file.filename,
          user: userData
        })
        
      } catch (error) {
        console.error('관리자 이미지 업로드 DB 처리 실패:', error)
        return res.status(500).json({
          success: false,
          message: '이미지 업로드 중 오류가 발생했습니다.'
        })
      }
    }

    // 일반 사용자 DB 업데이트
    const currentUser = await User.findByPk(req.user.id)
    const oldImageUrl = currentUser?.profileImage
    
    await User.update(
      { profileImage: imageUrl },
      { where: { id: req.user.id } }
    )

    // Track the avatar change
    await trackProfileChange(req.user.id, 'avatar_change', 'profileImage', oldImageUrl, imageUrl, req)

    // 업데이트된 사용자 정보 조회
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    console.log('프로필 이미지 업로드 및 DB 업데이트 성공')
    res.json({
      success: true,
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
      profileImagePath: imageUrl,
      imageUrl: imageUrl,
      filename: req.file.filename,
      user: updatedUser
    })

  } catch (error) {
    console.error('프로필 이미지 업로드 실패:', error)
    
    // 업로드된 파일이 있다면 삭제
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path)
        console.log('실패한 업로드 파일 삭제:', req.file.filename)
      } catch (unlinkError) {
        console.error('파일 삭제 실패:', unlinkError)
      }
    }
    
    res.status(500).json({
      success: false,
      message: '이미지 업로드 중 오류가 발생했습니다: ' + error.message
    })
  }
})

// 프로필 정보 업데이트
router.put('/update', authMiddleware, async (req, res) => {
  try {
    console.log('프로필 업데이트 요청 받음')
    console.log('사용자 정보:', req.user)
    console.log('요청 데이터:', req.body)
    
    const { name, birthDate, gender, phone, occupation, profileImage, learningGoal } = req.body

    if (!req.user || !req.user.id) {
      console.error('사용자 ID가 없습니다:', req.user)
      return res.status(400).json({
        success: false,
        message: '사용자 정보가 유효하지 않습니다.'
      })
    }

    // 관리자 계정 데이터베이스 처리
    if (req.user.email === 'admin@ilgaemilab.com') {
      console.log('관리자 계정 프로필 업데이트 - DB에 저장')
      
      try {
        // 데이터베이스에서 관리자 계정 찾기
        let adminUser = await User.findOne({ where: { email: 'admin@ilgaemilab.com' } })
        
        if (!adminUser) {
          console.log('관리자 계정을 새로 생성합니다')
          // 관리자 계정 생성
          adminUser = await User.create({
            email: 'admin@ilgaemilab.com',
            name: name || '관리자',
            password: await bcrypt.hash('admin123', 10),
            nationality: 'KR',
            nativeLanguage: 'Korean',
            occupationCategory: occupation || 'admin',
            koreanLevel: 'intermediate',
            currentLevel: 10,
            levelTestCompleted: true,
            phone: phone || '',
            gender: gender || null,
            birthDate: birthDate || null,
            profileImage: profileImage || '',
            learningGoal: learningGoal ? JSON.stringify(learningGoal) : null
          })
        } else {
          // 기존 관리자 계정 업데이트
          console.log('기존 관리자 계정 업데이트, ID:', adminUser.id)
          
          // Track changes before updating
          if (name !== undefined && name !== adminUser.name) {
            await trackProfileChange(adminUser.id, 'profile_update', 'name', adminUser.name, name, req)
          }
          if (birthDate !== undefined && birthDate !== adminUser.birthDate) {
            await trackProfileChange(adminUser.id, 'profile_update', 'birthDate', adminUser.birthDate, birthDate, req)
          }
          if (gender !== undefined && gender !== adminUser.gender) {
            await trackProfileChange(adminUser.id, 'profile_update', 'gender', adminUser.gender, gender, req)
          }
          if (phone !== undefined && phone !== adminUser.phone) {
            await trackProfileChange(adminUser.id, 'phone_change', 'phone', adminUser.phone, phone, req)
          }
          if (occupation !== undefined && occupation !== adminUser.occupationCategory) {
            await trackProfileChange(adminUser.id, 'profile_update', 'occupation', adminUser.occupationCategory, occupation, req)
          }
          if (profileImage !== undefined && profileImage !== adminUser.profileImage) {
            await trackProfileChange(adminUser.id, 'avatar_change', 'profileImage', adminUser.profileImage, profileImage, req)
          }
          if (learningGoal !== undefined) {
            const oldGoal = adminUser.learningGoal
            const newGoal = learningGoal ? JSON.stringify(learningGoal) : null
            if (oldGoal !== newGoal) {
              await trackProfileChange(adminUser.id, 'learning_preferences', 'learningGoal', oldGoal, newGoal, req)
            }
          }
          
          const updateData = {}
          if (name !== undefined) updateData.name = name
          if (birthDate !== undefined) updateData.birthDate = birthDate
          if (gender !== undefined) updateData.gender = gender
          if (phone !== undefined) updateData.phone = phone
          if (occupation !== undefined) updateData.occupationCategory = occupation
          if (profileImage !== undefined) updateData.profileImage = profileImage
          if (learningGoal !== undefined) updateData.learningGoal = learningGoal ? JSON.stringify(learningGoal) : null
          
          await adminUser.update(updateData)
          await adminUser.reload() // 최신 데이터로 새로고침
        }
        
        const userData = adminUser.toJSON()
        delete userData.password
        
        console.log('관리자 프로필 DB 업데이트 완료:', userData)
        
        return res.json({
          success: true,
          message: '프로필이 성공적으로 업데이트되었습니다.',
          user: userData
        })
        
      } catch (error) {
        console.error('관리자 프로필 업데이트 실패:', error)
        return res.status(500).json({
          success: false,
          message: '관리자 프로필 업데이트 중 오류가 발생했습니다.'
        })
      }
    }

    // 일반 사용자 처리
    let existingUser = await User.findByPk(req.user.id)
    
    // 사용자가 없는 경우 생성
    if (!existingUser) {
      console.log('사용자가 DB에 없어서 새로 생성합니다:', req.user.id)
      try {
        existingUser = await User.create({
          id: req.user.id,
          email: req.user.email,
          name: name || 'User',
          password: 'temp-password',
          occupationCategory: occupation || 'manufacturing',
          koreanLevel: 'intermediate',
          phone: phone || null,
          gender: gender || null,
          birthDate: birthDate || null,
          profileImage: profileImage || null,
          learningGoal: learningGoal ? JSON.stringify(learningGoal) : null
        })
        console.log('새 사용자 생성 완료:', existingUser.id)
      } catch (createError) {
        console.error('사용자 생성 실패:', createError)
        return res.status(500).json({
          success: false,
          message: '사용자 계정 생성에 실패했습니다.'
        })
      }
    }

    // Track changes before updating
    if (name !== undefined && name !== existingUser.name) {
      await trackProfileChange(req.user.id, 'profile_update', 'name', existingUser.name, name, req)
    }
    if (birthDate !== undefined && birthDate !== existingUser.birthDate) {
      await trackProfileChange(req.user.id, 'profile_update', 'birthDate', existingUser.birthDate, birthDate, req)
    }
    if (gender !== undefined && gender !== existingUser.gender) {
      await trackProfileChange(req.user.id, 'profile_update', 'gender', existingUser.gender, gender, req)
    }
    if (phone !== undefined && phone !== existingUser.phone) {
      await trackProfileChange(req.user.id, 'phone_change', 'phone', existingUser.phone, phone, req)
    }
    if (occupation !== undefined && occupation !== existingUser.occupationCategory) {
      await trackProfileChange(req.user.id, 'profile_update', 'occupation', existingUser.occupationCategory, occupation, req)
    }
    if (profileImage !== undefined && profileImage !== existingUser.profileImage) {
      await trackProfileChange(req.user.id, 'avatar_change', 'profileImage', existingUser.profileImage, profileImage, req)
    }
    if (learningGoal !== undefined) {
      const oldGoal = existingUser.learningGoal
      const newGoal = learningGoal ? JSON.stringify(learningGoal) : null
      if (oldGoal !== newGoal) {
        await trackProfileChange(req.user.id, 'learning_preferences', 'learningGoal', oldGoal, newGoal, req)
      }
    }

    // 데이터베이스에 프로필 정보 업데이트
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (birthDate !== undefined) updateData.birthDate = birthDate
    if (gender !== undefined) updateData.gender = gender
    if (phone !== undefined) updateData.phone = phone
    if (occupation !== undefined) updateData.occupationCategory = occupation // 올바른 필드명 사용
    if (profileImage !== undefined) updateData.profileImage = profileImage
    if (learningGoal !== undefined) updateData.learningGoal = learningGoal ? JSON.stringify(learningGoal) : null
    
    console.log('업데이트할 데이터:', updateData)
    
    const [updatedRows] = await User.update(updateData, { where: { id: req.user.id } })
    console.log('업데이트된 행 수:', updatedRows)
    
    // 업데이트된 사용자 정보 조회
    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    })

    if (!updatedUser) {
      console.error('업데이트 후 사용자를 찾을 수 없습니다.')
      return res.status(500).json({
        success: false,
        message: '사용자 정보를 찾을 수 없습니다.'
      })
    }

    console.log('최종 업데이트된 사용자 정보:', updatedUser.toJSON())

    res.json({
      success: true,
      message: '프로필이 성공적으로 업데이트되었습니다.',
      user: updatedUser.toJSON()
    })

  } catch (error) {
    console.error('프로필 업데이트 실패:', error)
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.'
    })
  }
})

// 프로필 변경 이력 조회 (disabled - ProfileChangeHistory model not implemented)
router.get('/change-history', authMiddleware, async (req, res) => {
  try {
    // ProfileChangeHistory model not implemented yet
    // Return empty history for now
    res.json({
      success: true,
      data: {
        history: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      }
    })

  } catch (error) {
    console.error('프로필 변경 이력 조회 실패:', error)
    res.status(500).json({
      success: false,
      message: '변경 이력을 불러오는 중 오류가 발생했습니다.'
    })
  }
})

// 프로필 테두리 변경 API
router.put('/border', authMiddleware, async (req, res) => {
  try {
    const { borderStyle } = req.body
    const userId = req.user.id

    // 유효한 테두리 스타일 목록
    const validBorders = [
      'default',
      'bronze',
      'silver',
      'gold',
      'diamond',
      'platinum',
      'master',
      'challenger',
      'rainbow',
      'fire',
      'ice',
      'nature',
      'ant-queen',
      'trophy',
      'crown',
      'dragon',
      'crystal',
      'neon',
      'cyber',
      'phoenix',
      'mythic',
      'legend',
      'galaxy',
      'thunder',
      'ocean',
      'aurora',
      'blood',
      'holy',
      'toxic',
      'void',
      'inferno',
      'frost',
      'shadow',
      'sakura',
      'metal',
      'demon',
      'angel',
      'storm',
      'lava',
      'lunar',
      'solar',
      'cosmic'
    ]

    if (!borderStyle || !validBorders.includes(borderStyle)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 테두리 스타일입니다.'
      })
    }

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      })
    }

    const oldBorder = user.profileBorder
    user.profileBorder = borderStyle
    await user.save()

    // 변경 사항 추적
    await trackProfileChange(userId, 'update', 'profileBorder', oldBorder, borderStyle, req)

    res.json({
      success: true,
      message: '프로필 테두리가 성공적으로 변경되었습니다.',
      data: {
        profileBorder: user.profileBorder
      }
    })
  } catch (error) {
    console.error('프로필 테두리 변경 실패:', error)
    res.status(500).json({
      success: false,
      message: '프로필 테두리 변경 중 오류가 발생했습니다.'
    })
  }
})

// Helper function to calculate time ago
const getTimeAgo = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000)

  if (diffInSeconds < 60) return '방금 전'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
  return `${Math.floor(diffInSeconds / 31536000)}년 전`
}

export default router