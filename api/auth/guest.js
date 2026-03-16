import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  // 只允許 POST 請求
  if (req.method !== 'POST') {
    res.status(405).json({ error: '方法不允許' });
    return;
  }

  try {
    console.log('🔐 Guest login attempt');
    console.log('🔑 JWT_SECRET length:', process.env.JWT_SECRET?.length);

    // 產生訪客 ID
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // 產生 JWT token
    const token = jwt.sign(
      { userId: guestId, username: 'guest', isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('✅ Guest token generated');

    // 使用 res.status().json() 格式（Vercel Node.js 標準）
    res.status(200).json({
      success: true,
      message: '訪客登入成功',
      token,
      user: { id: guestId, username: 'guest', isGuest: true }
    });

  } catch (err) {
    console.error('❌ Guest login error:', err.message);
    
    res.status(500).json({ 
      error: '伺服器錯誤',
      debug: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}