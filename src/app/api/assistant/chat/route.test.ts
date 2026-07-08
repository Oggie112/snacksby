import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ serverClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ adminClient: vi.fn() }))
vi.mock('@/lib/ai/crypto', () => ({
	decryptApiKey: vi.fn().mockReturnValue('sk-ant-key'),
}))
vi.mock('@/lib/ai/tools', () => ({
	createAssistantTools: vi.fn().mockReturnValue({}),
}))
vi.mock('ai', () => ({
	convertToModelMessages: vi.fn().mockResolvedValue([]),
	stepCountIs: vi.fn().mockReturnValue(() => false),
	streamText: vi.fn(),
}))
vi.mock('@ai-sdk/anthropic', () => {
	const instance = Object.assign(vi.fn().mockReturnValue({}), {
		tools: { webSearch_20260209: vi.fn().mockReturnValue({}) },
	})
	return { createAnthropic: vi.fn().mockReturnValue(instance) }
})

import { POST } from './route'
import { decryptApiKey } from '@/lib/ai/crypto'
import { adminClient } from '@/lib/supabase/admin'
import { serverClient } from '@/lib/supabase/server'

import { streamText } from 'ai'

const DEFAULT_USER = { id: 'user-1' }
const DEFAULT_MEMBERSHIP = { household_id: 'hh-1', role: 'Leader' }
const DEFAULT_KEY_ROW = { ciphertext: 'c', iv: 'i', auth_tag: 'a' }

interface SetupMocksOptions {
	user?: Record<string, unknown> | null
	membership?: Record<string, unknown> | null
	keyRow?: Record<string, unknown> | null
}

function setupMocks({
	user = DEFAULT_USER,
	membership = DEFAULT_MEMBERSHIP,
	keyRow = DEFAULT_KEY_ROW,
}: SetupMocksOptions = {}) {
	const membersChain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: membership }),
	}
	vi.mocked(serverClient).mockResolvedValue({
		auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
		from: vi.fn().mockReturnValue(membersChain),
	} as any)

	const adminChain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: keyRow }),
	}
	vi.mocked(adminClient).mockReturnValue({
		from: vi.fn().mockReturnValue(adminChain),
	} as any)
}

function makeRequest(body: unknown = { messages: [] }) {
	return new NextRequest('http://localhost/api/assistant/chat', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	})
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(decryptApiKey).mockReturnValue('sk-ant-key')
	vi.mocked(streamText).mockReturnValue({
		toUIMessageStreamResponse: vi
			.fn()
			.mockReturnValue(new Response('ok', { status: 200 })),
	} as any)
})

describe('POST /api/assistant/chat — auth guards', () => {
	it('returns 401 when the user is not authenticated', async () => {
		setupMocks({ user: null })
		const res = await POST(makeRequest())
		expect(res.status).toBe(401)
	})

	it('returns 403 when the user has no household membership', async () => {
		setupMocks({ membership: null })
		const res = await POST(makeRequest())
		expect(res.status).toBe(403)
	})

	it('returns 403 when the user has the Member role', async () => {
		setupMocks({ membership: { household_id: 'hh-1', role: 'Member' } })
		const res = await POST(makeRequest())
		expect(res.status).toBe(403)
	})

	it('returns 404 when no AI key is configured for the household', async () => {
		setupMocks({ keyRow: null })
		const res = await POST(makeRequest())
		expect(res.status).toBe(404)
	})
})

describe('POST /api/assistant/chat — decryption and body parsing', () => {
	it('returns 500 when decrypting the API key throws', async () => {
		setupMocks()
		vi.mocked(decryptApiKey).mockImplementationOnce(() => {
			throw new Error('tampered')
		})
		const res = await POST(makeRequest())
		expect(res.status).toBe(500)
	})

	it('returns 400 when the request body is not valid JSON', async () => {
		setupMocks()
		const req = new NextRequest('http://localhost/api/assistant/chat', {
			method: 'POST',
			body: '{not valid json}',
		})
		const res = await POST(req)
		expect(res.status).toBe(400)
	})
})

describe('POST /api/assistant/chat — provider error mapping', () => {
	it('returns 422 when streamText throws an authentication error', async () => {
		setupMocks()
		vi.mocked(streamText).mockImplementationOnce(() => {
			throw new Error('Invalid API key — authentication failed')
		})
		const res = await POST(makeRequest())
		expect(res.status).toBe(422)
	})

	it('returns 429 when streamText throws a rate-limit error', async () => {
		setupMocks()
		vi.mocked(streamText).mockImplementationOnce(() => {
			throw new Error('rate limit exceeded')
		})
		const res = await POST(makeRequest())
		expect(res.status).toBe(429)
	})

	it('returns 502 when streamText throws a generic provider error', async () => {
		setupMocks()
		vi.mocked(streamText).mockImplementationOnce(() => {
			throw new Error('upstream provider unavailable')
		})
		const res = await POST(makeRequest())
		expect(res.status).toBe(502)
	})
})
