'use server'

import { serverClient } from '@/lib/supabase/server'

export async function updateEmail(
	_prevState: { error: string; success: string },
	formData: FormData,
): Promise<{ error: string; success: string }> {
	const newEmail = (formData.get('email') as string)?.trim() ?? ''
	const password = (formData.get('password') as string) ?? ''

	if (!newEmail) return { error: 'Email is required.', success: '' }

	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user?.email) return { error: 'Not authenticated.', success: '' }

	const { error: authError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password,
	})
	if (authError) return { error: 'Password is incorrect.', success: '' }

	const { error } = await supabase.auth.updateUser({ email: newEmail })
	if (error) return { error: error.message, success: '' }
	return { error: '', success: 'Confirmation sent. Check both inboxes.' }
}

export async function updatePassword(
	_prevState: { error: string; success: string },
	formData: FormData,
): Promise<{ error: string; success: string }> {
	const currentPassword = (formData.get('currentPassword') as string) ?? ''
	const newPassword = (formData.get('newPassword') as string) ?? ''
	const confirmPassword = (formData.get('confirmPassword') as string) ?? ''

	if (newPassword !== confirmPassword)
		return { error: 'New passwords do not match.', success: '' }
	if (newPassword.length < 8)
		return { error: 'Password must be at least 8 characters.', success: '' }

	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user?.email) return { error: 'Not authenticated.', success: '' }

	const { error: authError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: currentPassword,
	})
	if (authError) return { error: 'Current password is incorrect.', success: '' }

	const { error } = await supabase.auth.updateUser({ password: newPassword })
	if (error) return { error: error.message, success: '' }
	return { error: '', success: 'Password updated.' }
}
