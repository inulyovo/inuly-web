// /api/auth/login.js
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {  // ✅ 加上 res 參數
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });  // ✅ 用 res.json()
  }

  try {
    // ✅ 修正：Node.js runtime 直接用 req.body（Vercel 會自動解析 JSON）
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,  // ✅ 加上 success 欄位匹配前端
        error: '請輸入帳號與密碼' 
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 查詢使用者
    const { data: user, error: queryError } = await supabase
      .from('users')
      .select('id, username, password_hash, email')
      .eq('username', username)
      .maybeSingle();  // ✅ 用 maybeSingle() 避免找不到時拋錯

    if (queryError || !user) {
      return res.status(401).json({ 
        success: false,
        error: '帳號或密碼錯誤' 
      });
    }

    // 驗證密碼
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ 
        success: false,
        error: '帳號或密碼錯誤' 
      });
    }

    // 產生 JWT token (7 天有效)
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 更新最後登入時間
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    // 回傳 token 與使用者資訊 (不包含密碼)
    const { password_hash, ...userInfo } = user;

    // ✅ 修正：用 res 回傳，加上 success: true
    return res.status(200).json({
      success: true,  // ✅ 前端需要這個欄位
      message: '登入成功',
      token,
      user: userInfo
    });

  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    // ✅ 失敗回應也要加上 success: false
    return res.status(500).json({ 
      success: false,
      error: process.env.NODE_ENV === 'development' ? err.message : '伺服器錯誤' 
    });
  }
}