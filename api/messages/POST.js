import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../middleware/verifyToken.js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    // 1. 驗證 token
    const authResult = verifyToken(req);
    if (!authResult.valid) {
      return res.status(401).json({ success: false, error: authResult.error });
    }
    const user = authResult.user;

    // 2. 接收參數（包含 avatar）
    const { content, displayName, avatar } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: '留言內容不能為空' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, error: '留言內容不能超過 1000 字' });
    }

    // 3. 使用 service role key 繞過 RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 4. 插入留言（包含 avatar）
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        user_id: user.userId,
        content: content.trim(),
        display_name: displayName || null,
        avatar: avatar || './img/5.jpg'  // 預設頭像
      }])
      .select(`
        id,
        content,
        created_at,
        user_id,
        display_name,
        avatar,
        users:user_id (
          id,
          username
        )
      `)
      .single();

    if (error) throw error;

    const finalUsername = data.display_name || data.users?.username || user.username;
    
    return res.status(201).json({
      success: true,
      message: '留言成功',
      data: {
        id: data.id,
        content: data.content,
        created_at: data.created_at,
        username: finalUsername,
        avatar: data.avatar  // ✅ 回傳頭像路徑
      }
    });
  } catch (err) {
    console.error('創建留言失敗:', err);
    return res.status(500).json({
      success: false,
      error: '創建留言失敗'
    });
  }
}