import { createClient } from '@supabase/supabase-js'

export function adminClient() {
	return createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SB_SECRET_KEY!,
	)
}
