import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Creates and returns a Supabase client for use in server-side contexts (e.g., Server Components, API routes).
 * It handles cookie management for session authentication.
 * The `setAll` cookie handler includes a `try...catch` block to manage scenarios where it's called from a Server Component,
 * which can be safely ignored if session refreshing middleware is in place.
 * @returns {SupabaseClient} A Supabase client instance configured for server-side operations.
 */
export async function serverClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
