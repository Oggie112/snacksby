import { serverClient } from './server'
import type { AuthUser } from '@/components/session-provider'

/**
 * Resolves the current authenticated user from the request cookies.
 *
 * Uses `getClaims()` rather than `getUser()`: once the project's asymmetric
 * JWT signing keys are active, the access token is verified locally against
 * the cached JWKS with no network round-trip. On the legacy HS256 secret it
 * transparently falls back to a `getUser()` call. The middleware remains the
 * authoritative network check on every protected request.
 */
export async function getUserAndSession(): Promise<{ user: AuthUser | null }> {
	const supabase = await serverClient()

	const { data, error } = await supabase.auth.getClaims()
	if (error || !data?.claims) return { user: null }

	return {
		user: {
			id: data.claims.sub,
			email: data.claims.email ?? null,
		},
	}
}
