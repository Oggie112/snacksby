import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ serverClient: vi.fn() }))

import { requestPasswordReset } from './actions'
import { serverClient } from '@/lib/supabase/server'

function makeFormData(fields: Record<string, string>): FormData {
	const fd = new FormData()
	for (const [k, v] of Object.entries(fields)) fd.append(k, v)
	return fd
}

function makeSupabaseMock(resetError: unknown = null) {
	vi.mocked(serverClient).mockResolvedValue({
		auth: {
			resetPasswordForEmail: vi.fn().mockResolvedValue({ error: resetError }),
		},
	} as any)
}

const prevState = { error: '', sent: false }

beforeEach(() => {
	vi.clearAllMocks()
	process.env.NEXT_PUBLIC_SITE_URL = 'https://snacksby.app'
})

describe('requestPasswordReset', () => {
	it('returns an error without calling Supabase when email is empty', async () => {
		const result = await requestPasswordReset(
			prevState,
			makeFormData({ email: '' }),
		)
		expect(result).toEqual({ error: 'Email is required.', sent: false })
		expect(serverClient).not.toHaveBeenCalled()
	})

	it('throws when NEXT_PUBLIC_SITE_URL is not set', async () => {
		makeSupabaseMock()
		delete process.env.NEXT_PUBLIC_SITE_URL
		await expect(
			requestPasswordReset(
				prevState,
				makeFormData({ email: 'test@example.com' }),
			),
		).rejects.toThrow('NEXT_PUBLIC_SITE_URL is not configured')
	})

	it('calls resetPasswordForEmail with the correct redirectTo URL', async () => {
		const mockResetPassword = vi.fn().mockResolvedValue({ error: null })
		vi.mocked(serverClient).mockResolvedValue({
			auth: { resetPasswordForEmail: mockResetPassword },
		} as any)

		await requestPasswordReset(
			prevState,
			makeFormData({ email: 'test@example.com' }),
		)

		expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', {
			redirectTo:
				'https://snacksby.app/auth/callback?next=/auth/reset-password',
		})
	})

	it('always returns sent: true regardless of whether the email exists', async () => {
		makeSupabaseMock({ message: 'User not found' })
		const result = await requestPasswordReset(
			prevState,
			makeFormData({ email: 'notreal@example.com' }),
		)
		expect(result).toEqual({ error: '', sent: true })
	})
})
