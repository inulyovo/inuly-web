import jwt from 'jsonwebtoken';

/**
 * 驗證 JWT Token
 * @param {Object} req - 請求對象
 * @returns {Object} { valid: boolean, user: Object|null, error: string|null }
 */
export function verifyToken(req) {
  try {
    // 獲取 Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return { 
        valid: false, 
        user: null,
        error: '未提供認證令牌' 
      };
    }

    // 提取 token（格式：Bearer <token>）
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return { 
        valid: false, 
        user: null,
        error: '令牌格式不正確' 
      };
    }

    // 驗證並解碼 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    return { 
      valid: true, 
      user: decoded,
      error: null 
    };
  } catch (err) {
    console.error('Token 驗證失敗:', err.message);
    
    // 判斷錯誤類型
    if (err.name === 'TokenExpiredError') {
      return { 
        valid: false, 
        user: null,
        error: '令牌已過期，請重新登入' 
      };
    }
    
    if (err.name === 'JsonWebTokenError') {
      return { 
        valid: false, 
        user: null,
        error: '無效的令牌' 
      };
    }
    
    return { 
      valid: false, 
      user: null,
      error: '認證失敗' 
    };
  }
}