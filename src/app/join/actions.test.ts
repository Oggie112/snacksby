import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { storeInviteAndRedirect } from './actions'

function makeFormData(fields: Record<string, string>): FormData {
	const fd = new FormData()
	for (const [k, v] of Object.entries(fields)) fd.append(k, v)
	return fd
}

function makeCookiesMock() {
	const mockSet = vi.fn()
	vi.mocked(cookies).mockResolvedValue({ set: mockSet } as any)
	return { mockSet }
}

beforeEach(() => {
	vi.clearAllMocks()
})

afterEach(() => {
	vi.unstubAllEnvs()
})

describe('storeInviteAndRedirect', () => {
	it('sets the pending_invite cookie with httpOnly and 15-minute maxAge', async () => {
		const { mockSet } = makeCookiesMock()
		await storeInviteAndRedirect(
			'inv-code',
			makeFormData({ destination: '/join' }),
		)
		expect(mockSet).toHaveBeenCalledWith(
			'pending_invite',
			'inv-code',
			expect.objectContaining({ httpOnly: true, maxAge: 900 }),
		)
	})

	it('sets secure: false outside production', async () => {
		const { mockSet } = makeCookiesMock()
		vi.stubEnv('NODE_ENV', 'test')
		await storeInviteAndRedirect(
			'inv-code',
			makeFormData({ destination: '/join' }),
		)
		expect(mockSet).toHaveBeenCalledWith(
			'pending_invite',
			'inv-code',
			expect.objectContaining({ secure: false }),
		)
	})

	it('sets secure: true in production', async () => {
		const { mockSet } = makeCookiesMock()
		vi.stubEnv('NODE_ENV', 'production')
		await storeInviteAndRedirect(
			'inv-code',
			makeFormData({ destination: '/join' }),
		)
		expect(mockSet).toHaveBeenCalledWith(
			'pending_invite',
			'inv-code',
			expect.objectContaining({ secure: true }),
		)
	})

	it('redirects to the destination from the form', async () => {
		makeCookiesMock()
		await storeInviteAndRedirect(
			'inv-code',
			makeFormData({ destination: '/join?code=inv-code' }),
		)
		expect(redirect).toHaveBeenCalledWith('/join?code=inv-code')
	})
})
