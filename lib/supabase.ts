import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing env: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseKey) {
  throw new Error(
    'Missing env: SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  )
}

/**
 * Server-only Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if present, otherwise falls back to the publishable/anon key.
 * MUST only be imported from Route Handlers and Server Actions.
 * Never import this in any Client Component.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

