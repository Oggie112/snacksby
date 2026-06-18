'use server'

import { serverClient } from '@/lib/supabase/server'

export async function requestPasswordReset(
	_prevState: { error: string; sent: boolean },
	formData: FormData,
): Promise<{ error: string; sent: boolean }> {
	const email = (formData.get('email') as string)?.trim() ?? ''

	if (!email) return { error: 'Email is required.', sent: false }

	const supabase = await serverClient()
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
	if (!siteUrl) throw new Error('NEXT_PUBLIC_SITE_URL is not configured')

	await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
	})

	// Always return sent — don't reveal whether the email exists
	return { error: '', sent: true }
}
