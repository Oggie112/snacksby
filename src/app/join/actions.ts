'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function storeInviteAndRedirect(
	code: string,
	formData: FormData,
): Promise<void> {
	const destination = formData.get('destination') as string
	const cookieStore = await cookies()
	cookieStore.set('pending_invite', code, {
		maxAge: 60 * 15,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
	})
	redirect(destination)
}
