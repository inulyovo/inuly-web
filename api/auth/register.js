console.log('=== ENV DEBUG ===');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...');
console.log('=================');
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
    const { username, password, email } = await req.json();

    // 基本驗證
    if (!username || !password) {
      return new Response(JSON.stringify({ error: '帳號與密碼為必填' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (username.length < 3) {
      return new Response(JSON.stringify({ error: '帳號至少 3 個字元' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    if (password.length < 6) {
      return new Response(JSON.stringify({ error: '密碼至少 6 個字元' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 初始化 Supabase 客戶端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 檢查帳號是否已存在
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existing) {
      return new Response(JSON.stringify({ error: '此帳號已存在' }), { 
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 加密密碼
    const password_hash = await bcrypt.hash(password, 10);

    // 寫入資料庫
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password_hash, email }])
      .select('id, username, created_at')
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      message: '註冊成功',
      user: { id: data.id, username: data.username }
    }), { 
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Register error:', err);
    return new Response(JSON.stringify({ error: '伺服器錯誤' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}