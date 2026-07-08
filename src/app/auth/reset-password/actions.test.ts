import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
	serverClient: vi.fn(),
}))

vi.mock('next/navigation', () => ({
	redirect: vi.fn(),
}))

import { redirect } from 'next/navigation'

import { resetPassword } from './actions'
import { serverClient } from '@/lib/supabase/server'

function makeFormData(fields: Record<string, string>): FormData {
	const fd = new FormData()
	for (const [k, v] of Object.entries(fields)) fd.append(k, v)
	return fd
}

function makeSupabaseMock(session: unknown, updateError: unknown = null) {
	const updateUser = vi.fn().mockResolvedValue({ error: updateError })
	vi.mocked(serverClient).mockResolvedValue({
		auth: {
			getSession: vi.fn().mockResolvedValue({ data: { session } }),
			updateUser,
		},
	} as any)
	return { updateUser }
}

function makeRecoveryToken(): string {
	const payload = { amr: [{ method: 'recovery' }] }
	return `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('resetPassword — validation', () => {
	it('returns an error when passwords do not match', async () => {
		const result = await resetPassword(
			{ error: '' },
			makeFormData({ password: 'password1', confirmPassword: 'password2' }),
		)
		expect(result).toEqual({ error: 'Passwords do not match.' })
	})

	it('returns an error when the password is fewer than 8 characters', async () => {
		const result = await resetPassword(
			{ error: '' },
			makeFormData({ password: 'short', confirmPassword: 'short' }),
		)
		expect(result).toEqual({ error: 'Password must be at least 8 characters.' })
	})
})

describe('resetPassword — session check', () => {
	it('returns the expired-link error when there is no session', async () => {
		makeSupabaseMock(null)
		const result = await resetPassword(
			{ error: '' },
			makeFormData({ password: 'validpass', confirmPassword: 'validpass' }),
		)
		expect(result).toEqual({
			error: 'Password reset link has expired. Please request a new one.',
		})
	})

	it('returns the expired-link error when the session amr is not a recovery method', async () => {
		const payload = { amr: [{ method: 'otp' }] }
		const token = `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.sig`
		makeSupabaseMock({ access_token: token })

		const result = await resetPassword(
			{ error: '' },
			makeFormData({ password: 'validpass', confirmPassword: 'validpass' }),
		)
		expect(result).toEqual({
			error: 'Password reset link has expired. Please request a new one.',
		})
	})

	it('calls updateUser with the new password on a valid recovery session', async () => {
		const { updateUser } = makeSupabaseMock({
			access_token: makeRecoveryToken(),
		})

		await resetPassword(
			{ error: '' },
			makeFormData({ password: 'validpass', confirmPassword: 'validpass' }),
		)

		expect(updateUser).toHaveBeenCalledWith({ password: 'validpass' })
	})

	it('redirects to / on successful password update', async () => {
		makeSupabaseMock({ access_token: makeRecoveryToken() })

		await resetPassword(
			{ error: '' },
			makeFormData({ password: 'validpass', confirmPassword: 'validpass' }),
		)

		expect(redirect).toHaveBeenCalledWith('/')
	})

	it('returns the server error message when updateUser fails', async () => {
		makeSupabaseMock(
			{ access_token: makeRecoveryToken() },
			{ message: 'Password too weak.' },
		)

		const result = await resetPassword(
			{ error: '' },
			makeFormData({ password: 'validpass', confirmPassword: 'validpass' }),
		)

		expect(result).toEqual({ error: 'Password too weak.' })
	})
})
