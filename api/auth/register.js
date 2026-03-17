console.log('=== ENV DEBUG ===');
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30) + '...');
console.log('=================');

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

export const config = {
  runtime: 'nodejs',  // ✅ 保持 Node.js runtime（才能用 bcryptjs）
};

export default async function handler(req, res) {  // ✅ 加上 res 參數
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });  // ✅ 用 res.json()
  }

  try {
    // ✅ 修正：Node.js runtime 直接用 req.body（Vercel 會自動解析 JSON）
    const { username, password, email } = req.body;

    // 基本驗證
    if (!username || !password) {
      return res.status(400).json({ error: '帳號與密碼為必填' });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: '帳號至少 3 個字元' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密碼至少 6 個字元' });
    }

    // 初始化 Supabase 客戶端
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 檢查帳號是否已存在
    const { data: existing, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle();  // ✅ 用 maybeSingle() 避免找不到時拋錯

    if (existing) {
      return res.status(409).json({ error: '此帳號已存在' });
    }

    // 加密密碼
    const password_hash = await bcrypt.hash(password, 10);

    // 寫入資料庫
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ username, password_hash, email }])
      .select('id, username, created_at')
      .single();

    if (insertError) throw insertError;

    // ✅ 修正：回傳格式加上 success 欄位，與前端 login.js 匹配
    return res.status(201).json({ 
      success: true, 
      message: '註冊成功',
      user: { id: data.id, username: data.username }
    });

  } catch (err) {
    console.error('Register error:', err);
    // ✅ 修正：失敗回應也加上 success: false
    return res.status(500).json({ 
      success: false,
      error: '伺服器錯誤' 
    });
  }
}