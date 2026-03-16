export default function handler(req, res) {
  console.log('=== TEST ENV ===');
  console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ EXISTS' : '❌ NOT FOUND');
  console.log('Length:', process.env.JWT_SECRET?.length);
  console.log('================');
  
  return new Response(JSON.stringify({
    jwt_secret_exists: !!process.env.JWT_SECRET,
    jwt_secret_length: process.env.JWT_SECRET?.length || 0,
    supabase_url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}