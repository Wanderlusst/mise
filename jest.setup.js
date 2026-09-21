// Load environment variables for Jest test environment
require('dotenv').config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://xicyvhnlcynkcbsrotys.supabase.co'
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'sb_publishable_mock_key'
}
