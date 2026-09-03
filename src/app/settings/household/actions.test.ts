import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({ serverClient: vi.fn() }))
vi.mock('@/lib/supabase/admin', () => ({ adminClient: vi.fn() }))
vi.mock('@/lib/ai/crypto', () => ({ encryptApiKey: vi.fn() }))
vi.mock('ai', () => ({ generateText: vi.fn().mockResolvedValue({}) }))
vi.mock('@ai-sdk/anthropic', () => ({
	createAnthropic: vi.fn().mockReturnValue(vi.fn().mockReturnValue({})),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import {
	getAiKeyStatus,
	removeAiKey,
	resetInviteCode,
	saveAiKey,
} from './actions'
import { encryptApiKey } from '@/lib/ai/crypto'
import { adminClient } from '@/lib/supabase/admin'
import { serverClient } from '@/lib/supabase/server'

import { generateText } from 'ai'

interface ServerClientOptions {
	user?: Record<string, unknown> | null
	membershipData?: Record<string, unknown> | null
	upsertError?: { message: string } | null
	deleteError?: { message: string } | null
	rpcError?: { message: string } | null
}

function makeServerClient({
	user = { id: 'user-1' },
	membershipData = { role: 'Leader' },
	upsertError = null,
	deleteError = null,
	rpcError = null,
}: ServerClientOptions = {}) {
	const membersChain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: membershipData }),
	}

	// Supports both .upsert() and .delete().eq() on the same table
	const keysChain = {
		upsert: vi.fn().mockResolvedValue({ error: upsertError }),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockResolvedValue({ error: deleteError }),
	}

	vi.mocked(serverClient).mockResolvedValue({
		auth: {
			getUser: vi.fn().mockResolvedValue({ data: { user } }),
		},
		from: vi.fn().mockImplementation((table: string) => {
			if (table === 'household_members') return membersChain
			if (table === 'household_ai_keys') return keysChain
			return {}
		}),
		rpc: vi.fn().mockResolvedValue({ error: rpcError }),
	} as any)

	return { membersChain, keysChain }
}

function makeAdminClient(keyRow: Record<string, unknown> | null = null) {
	const chain = {
		select: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: keyRow }),
	}
	vi.mocked(adminClient).mockReturnValue({
		from: vi.fn().mockReturnValue(chain),
	} as any)
}

beforeEach(() => {
	vi.clearAllMocks()
	vi.mocked(encryptApiKey).mockReturnValue({
		ciphertext: 'c',
		iv: 'i',
		auth_tag: 'a',
	})
})

describe('getAiKeyStatus', () => {
	it('returns set: false when the caller is not authenticated', async () => {
		makeServerClient({ user: null })
		makeAdminClient({ key_last4: '1234' })
		expect(await getAiKeyStatus('hh-1')).toEqual({ set: false, last4: null })
	})

	it('returns set: false when the caller is not a household member', async () => {
		makeServerClient({ membershipData: null })
		makeAdminClient({ key_last4: '1234' })
		expect(await getAiKeyStatus('hh-1')).toEqual({ set: false, last4: null })
	})

	it('returns set: false when no key row exists', async () => {
		makeServerClient()
		makeAdminClient(null)
		expect(await getAiKeyStatus('hh-1')).toEqual({ set: false, last4: null })
	})

	it('returns set: true with last4 for a member when a key row exists', async () => {
		makeServerClient({ membershipData: { role: 'Contributor' } })
		makeAdminClient({ key_last4: '1234' })
		expect(await getAiKeyStatus('hh-1')).toEqual({ set: true, last4: '1234' })
	})
})

describe('resetInviteCode', () => {
	it('throws when the caller is not authenticated', async () => {
		makeServerClient({ user: null })
		await expect(resetInviteCode('hh-1')).rejects.toThrow('Not authenticated.')
	})

	it('throws when the caller is not a Leader', async () => {
		makeServerClient({ membershipData: { role: 'Contributor' } })
		await expect(resetInviteCode('hh-1')).rejects.toThrow('Only Leaders')
	})

	it('throws when the RPC returns an error', async () => {
		makeServerClient({ rpcError: { message: 'RPC failed' } })
		await expect(resetInviteCode('hh-1')).rejects.toThrow('RPC failed')
	})

	it('resolves without error on success', async () => {
		makeServerClient()
		await expect(resetInviteCode('hh-1')).resolves.toBeUndefined()
	})
})

describe('saveAiKey', () => {
	it('returns an error when the user is not authenticated', async () => {
		makeServerClient({ user: null })
		expect(await saveAiKey('hh-1', 'sk-ant-valid')).toEqual({
			error: 'Not authenticated.',
		})
	})

	it('returns an error when the user is not a Leader', async () => {
		makeServerClient({ membershipData: { role: 'Member' } })
		expect(await saveAiKey('hh-1', 'sk-ant-valid')).toEqual({
			error: 'Only Leaders can manage the AI key.',
		})
	})

	it('returns an error when the key does not start with sk-ant-', async () => {
		makeServerClient()
		expect(await saveAiKey('hh-1', 'sk-openai-oops')).toEqual({
			error: 'Invalid key — Anthropic keys start with sk-ant-.',
		})
	})

	it('returns an error when Anthropic key validation fails', async () => {
		makeServerClient()
		vi.mocked(generateText).mockRejectedValueOnce(
			new Error('authentication_error'),
		)
		expect(await saveAiKey('hh-1', 'sk-ant-badkey')).toEqual({
			error: 'Key validation failed — check it is correct and active.',
		})
	})

	it('returns an error when the upsert fails', async () => {
		makeServerClient({ upsertError: { message: 'DB write failed' } })
		expect(await saveAiKey('hh-1', 'sk-ant-validkey')).toEqual({
			error: 'DB write failed',
		})
	})

	it('encrypts and upserts on success', async () => {
		const { keysChain } = makeServerClient()
		const result = await saveAiKey('hh-1', 'sk-ant-validkey')
		expect(result).toEqual({})
		expect(encryptApiKey).toHaveBeenCalledWith('sk-ant-validkey')
		expect(keysChain.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				ciphertext: 'c',
				iv: 'i',
				auth_tag: 'a',
				key_last4: 'dkey',
			}),
			{ onConflict: 'household_id' },
		)
	})
})

describe('removeAiKey', () => {
	it('returns an error when the user is not authenticated', async () => {
		makeServerClient({ user: null })
		expect(await removeAiKey('hh-1')).toEqual({ error: 'Not authenticated.' })
	})

	it('returns an error when the user is not a Leader', async () => {
		makeServerClient({ membershipData: { role: 'Contributor' } })
		expect(await removeAiKey('hh-1')).toEqual({
			error: 'Only Leaders can manage the AI key.',
		})
	})

	it('returns an error when the delete fails', async () => {
		makeServerClient({ deleteError: { message: 'Delete failed' } })
		expect(await removeAiKey('hh-1')).toEqual({ error: 'Delete failed' })
	})

	it('returns an empty object on success', async () => {
		makeServerClient()
		expect(await removeAiKey('hh-1')).toEqual({})
	})
})
