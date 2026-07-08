import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ serverClient: vi.fn() }))

import { GET } from './route'
import { serverClient } from '@/lib/supabase/server'

function makeSupabaseMock(exchangeError: unknown = null) {
	vi.mocked(serverClient).mockResolvedValue({
		auth: {
			exchangeCodeForSession: vi
				.fn()
				.mockResolvedValue({ error: exchangeError }),
		},
	} as any)
}

function makeRequest(params: Record<string, string> = {}) {
	const url = new URL('http://localhost/auth/callback')
	for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
	return new NextRequest(url.toString())
}

function locationOf(res: Response): string {
	return res.headers.get('location') ?? ''
}

beforeEach(() => {
	vi.clearAllMocks()
})

describe('GET /auth/callback', () => {
	it('redirects to /auth/login when no code param is present', async () => {
		const res = await GET(makeRequest())
		expect(locationOf(res)).toBe('http://localhost/auth/login')
	})

	it('redirects to / when the code exchange succeeds and next is not set', async () => {
		makeSupabaseMock(null)
		const res = await GET(makeRequest({ code: 'abc123' }))
		expect(locationOf(res)).toBe('http://localhost/')
	})

	it('redirects to the next param path on a successful exchange', async () => {
		makeSupabaseMock(null)
		const res = await GET(makeRequest({ code: 'abc123', next: '/dashboard' }))
		expect(locationOf(res)).toBe('http://localhost/dashboard')
	})

	it('redirects to /auth/login when the code exchange fails', async () => {
		makeSupabaseMock({ message: 'expired' })
		const res = await GET(makeRequest({ code: 'badcode' }))
		expect(locationOf(res)).toBe('http://localhost/auth/login')
	})

	it('blocks open redirects: redirects to / when next starts with //', async () => {
		makeSupabaseMock(null)
		const res = await GET(
			makeRequest({ code: 'abc', next: '//evil.com/steal' }),
		)
		expect(locationOf(res)).toBe('http://localhost/')
	})

	it('blocks open redirects: redirects to / when next is an absolute URL', async () => {
		makeSupabaseMock(null)
		const res = await GET(
			makeRequest({ code: 'abc', next: 'https://evil.com' }),
		)
		expect(locationOf(res)).toBe('http://localhost/')
	})
})
