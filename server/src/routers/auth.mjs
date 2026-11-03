import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// Register endpoint
router.post('/api/auth/register', async (req, res) => {
  try {
    const {
      email,
      password,
      name,
      nationality,
      nativeLanguage,
      occupationCategory,
      koreanLevel = 'beginner'
    } = req.body

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 사용 중인 이메일입니다'
      })
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      name,
      nationality,
      nativeLanguage,
      occupationCategory,
      koreanLevel,
      currentLevel: 0,
      levelTestCompleted: false
    })

    // Generate token
    const token = generateToken(user)

    // Return user data without password
    const userData = user.toJSON()
    delete userData.password

    res.json({
      success: true,
      token,
      user: userData,
      message: '회원가입이 완료되었습니다!'
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      message: '회원가입 중 오류가 발생했습니다',
      error: error.message
    })
  }
})

// Login endpoint
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log(`🔐 로그인 시도: ${email}`);

    // Find user
    const user = await User.findOne({ where: { email } })
    if (!user) {
      console.log(`❌ 사용자를 찾을 수 없음: ${email}`);
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      })
    }

    console.log(`✅ 사용자 발견: ${user.email}, ID: ${user.id}`);

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    console.log(`🔑 비밀번호 검증 결과: ${isValidPassword}`);

    if (!isValidPassword) {
      console.log(`❌ 비밀번호 불일치: ${email}`);
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다'
      })
    }

    // Update last login
    await user.update({ lastLogin: new Date() })

    // Generate token
    const token = generateToken(user)

    // Return user data without password
    const userData = user.toJSON()
    delete userData.password

    res.json({
      success: true,
      token,
      user: userData,
      message: '로그인 성공!'
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: '로그인 중 오류가 발생했습니다',
      error: error.message
    })
  }
})

// ========== 수정: 프로필 정보 포함하도록 개선 ==========
// Get current user endpoint
router.get('/api/auth/me', async (req, res) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다'
      })
    }

    const token = authHeader.substring(7)

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET)

    // Find user
    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      })
    }

    // Return user data without password
    const userData = user.toJSON()
    delete userData.password

    // 🆕 프로필 이미지 경로 정규화
    if (userData.profileImage && !userData.profileImage.startsWith('http')) {
      // 상대 경로를 절대 경로로 변환
      userData.profileImage = `/uploads/profiles/${userData.profileImage.split('/').pop()}`
    }

    res.json({
      success: true,
      user: userData
    })
  } catch (error) {
    console.error('Auth check error:', error)
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      })
    }
    res.status(500).json({
      success: false,
      message: '인증 확인 중 오류가 발생했습니다',
      error: error.message
    })
  }
})

// Logout endpoint (optional - mainly for client-side cleanup)
router.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: '로그아웃되었습니다'
  })
})

// Middleware to authenticate requests
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다'
      })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = await User.findByPk(decoded.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      })
    }
    res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다'
    })
  }
}

export default router