'use server'

import { redirect } from 'next/navigation'

import { serverClient } from '@/lib/supabase/server'

export async function resetPassword(
	_prevState: { error: string },
	formData: FormData,
): Promise<{ error: string }> {
	const password = (formData.get('password') as string) ?? ''
	const confirmPassword = (formData.get('confirmPassword') as string) ?? ''

	if (password !== confirmPassword) return { error: 'Passwords do not match.' }
	if (password.length < 8)
		return { error: 'Password must be at least 8 characters.' }

	const supabase = await serverClient()

	const {
		data: { session },
	} = await supabase.auth.getSession()
	const payload = session
		? JSON.parse(
				Buffer.from(session.access_token.split('.')[1], 'base64').toString(),
			)
		: null
	const isRecoverySession =
		Array.isArray(payload?.amr) &&
		payload.amr.some((m: { method: string }) => m.method === 'recovery')

	if (!isRecoverySession) {
		return {
			error: 'Password reset link has expired. Please request a new one.',
		}
	}

	const { error } = await supabase.auth.updateUser({ password })

	if (error) return { error: error.message }

	redirect('/')
}
