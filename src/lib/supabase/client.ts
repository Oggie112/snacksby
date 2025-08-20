import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates and returns a Supabase client for use in the browser.
 * It uses environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
 * @returns {SupabaseClient} A Supabase client instance.
 */
export async function browserClient() {
  return createBrowserClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  )
}
