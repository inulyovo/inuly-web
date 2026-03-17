import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: messages, error } = await supabase
      .from('messages')
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
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      user: msg.users,
      username: msg.display_name || msg.users?.username,
      avatar: msg.avatar || './img/5.jpg'  // 預設頭像
    }));

    return res.status(200).json({
      success: true,
      messages: formattedMessages
    });
  } catch (err) {
    console.error('獲取留言失敗:', err);
    return res.status(500).json({
      success: false,
      error: '獲取留言失敗'
    });
  }
}