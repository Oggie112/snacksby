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
	const { error } = await supabase.auth.updateUser({ password })

	if (error) return { error: error.message }

	redirect('/')
}
