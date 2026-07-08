import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ serverClient: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { login } from './actions'
import { serverClient } from '@/lib/supabase/server'

function makeFormData(fields: Record<string, string>): FormData {
	const fd = new FormData()
	for (const [k, v] of Object.entries(fields)) fd.append(k, v)
	return fd
}

const prevState = { error: '', resetFields: false }
const validCredentials = makeFormData({
	email: 'user@example.com',
	password: 'password123',
})

function makeSupabaseMock(signInError: unknown = null) {
	vi.mocked(serverClient).mockResolvedValue({
		auth: {
			signInWithPassword: vi.fn().mockResolvedValue({ error: signInError }),
		},
	} as any)
}

function makeCookiesMock(pendingInvite?: string) {
	const mockDelete = vi.fn()
	vi.mocked(cookies).mockResolvedValue({
		get: vi
			.fn()
			.mockReturnValue(pendingInvite ? { value: pendingInvite } : undefined),
		delete: mockDelete,
	} as any)
	return { mockDelete }
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('login', () => {
	it('returns the Supabase error message when sign-in fails', async () => {
		makeSupabaseMock({ message: 'Invalid login credentials' })
		makeCookiesMock()
		const result = await login(prevState, validCredentials)
		expect(result).toEqual({
			error: 'Invalid login credentials',
			resetFields: true,
		})
	})

	it('redirects to / on success when there is no pending invite', async () => {
		makeSupabaseMock(null)
		makeCookiesMock()
		await login(prevState, validCredentials)
		expect(redirect).toHaveBeenCalledWith('/')
	})

	it('redirects to the join URL and deletes the cookie when a pending invite exists', async () => {
		makeSupabaseMock(null)
		const { mockDelete } = makeCookiesMock('abc-123')
		await login(prevState, validCredentials)
		expect(mockDelete).toHaveBeenCalledWith('pending_invite')
		expect(redirect).toHaveBeenCalledWith(
			`/join?code=${encodeURIComponent('abc-123')}`,
		)
	})

	it('applies encodeURIComponent to the invite code', async () => {
		makeSupabaseMock(null)
		makeCookiesMock('code with spaces & special=chars')
		await login(prevState, validCredentials)
		expect(redirect).toHaveBeenCalledWith(
			`/join?code=${encodeURIComponent('code with spaces & special=chars')}`,
		)
	})
})
