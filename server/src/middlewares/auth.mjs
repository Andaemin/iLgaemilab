import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다'
      })
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      req.user = decoded
      next()
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: '인증 처리 중 오류가 발생했습니다'
    })
  }
}

export default authMiddleware;