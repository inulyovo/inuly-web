import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允許' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '請輸入帳號與密碼' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 查詢使用者
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, email')
      .eq('username', username)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 驗證密碼
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return new Response(JSON.stringify({ error: '帳號或密碼錯誤' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
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

    return new Response(JSON.stringify({
      success: true,
      message: '登入成功',
      token,
      user: userInfo
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=${token}; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax`
      }
    });

  } catch (err) {
    console.error('Login error:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });

    // 開發環境回傳詳細錯誤（上線時請移除）
    if (process.env.NODE_ENV === 'development') {
      return new Response(JSON.stringify({
        error: '伺服器錯誤',
        debug: err.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: '伺服器錯誤' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}