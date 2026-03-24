import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates and returns a Supabase client for use in the browser.
 * It uses environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
 * @returns A Supabase client instance configured for browser use.
 */
export const supabaseClient = function browserClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
	)
}
