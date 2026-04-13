import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getEnvVar(name: string): string {
  const value = process.env[name]
  if (!value || value.startsWith('your_')) {
    throw new Error(
      `Missing environment variable: ${name}. ` +
      `Please update your .env.local file with valid Supabase credentials. ` +
      `Get them from https://supabase.com/dashboard/project/_/settings/api`
    )
  }
  return value
}

// Lazy-initialized clients to avoid crashing at import time
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

// Client-side Supabase client (limited permissions)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      _supabase = createClient(getEnvVar('NEXT_PUBLIC_SUPABASE_URL'), getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
    }
    return (_supabase as unknown as Record<string, unknown>)[prop as string]
  },
})

// Server-side Supabase client (full permissions, use only in server actions/API routes)
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      _supabaseAdmin = createClient(getEnvVar('NEXT_PUBLIC_SUPABASE_URL'), getEnvVar('SUPABASE_SERVICE_ROLE_KEY'))
    }
    return (_supabaseAdmin as unknown as Record<string, unknown>)[prop as string]
  },
})
