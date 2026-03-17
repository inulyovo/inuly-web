import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../middleware/verifyToken.js';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    // 驗證登錄狀態
    const authResult = verifyToken(req);
    
    if (!authResult.valid) {
      return res.status(401).json({
        success: false,
        error: authResult.error
      });
    }

    const { id } = req.query;
    const user = authResult.user;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: '請提供留言 ID'
      });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // 刪除留言（只刪除自己的）
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id)
      .eq('user_id', user.userId);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: '刪除成功'
    });
  } catch (err) {
    console.error('刪除留言失敗:', err);
    return res.status(500).json({
      success: false,
      error: '刪除留言失敗'
    });
  }
}