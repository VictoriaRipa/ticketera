import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Admin client for server-side operations that need to bypass RLS.
 * Only use this in server-side code (API routes, server actions).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
