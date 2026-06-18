'use server'

import { createAnthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { revalidatePath } from 'next/cache'

import { encryptApiKey } from '@/lib/ai/crypto'
import { adminClient } from '@/lib/supabase/admin'
import { serverClient } from '@/lib/supabase/server'

export async function resetInviteCode(householdId: string): Promise<void> {
	const supabase = await serverClient()
	const { error } = await supabase.rpc('reset_invite_code', {
		p_household_id: householdId,
	})
	if (error) throw new Error(error.message)
	revalidatePath('/settings')
}

export async function getAiKeyStatus(
	householdId: string,
): Promise<{ set: boolean; last4: string | null }> {
	const admin = adminClient()
	const { data } = await admin
		.from('household_ai_keys')
		.select('key_last4')
		.eq('household_id', householdId)
		.single()
	return { set: !!data, last4: data?.key_last4 ?? null }
}

export async function saveAiKey(
	householdId: string,
	apiKey: string,
): Promise<{ error?: string }> {
	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated.' }

	const { data: membership } = await supabase
		.from('household_members')
		.select('role')
		.eq('household_id', householdId)
		.eq('user_id', user.id)
		.single()

	if (membership?.role !== 'Leader')
		return { error: 'Only Leaders can manage the AI key.' }

	if (!apiKey.startsWith('sk-ant-'))
		return { error: 'Invalid key — Anthropic keys start with sk-ant-.' }

	try {
		const anthropic = createAnthropic({ apiKey })
		await generateText({
			model: anthropic('claude-haiku-4-5-20251001'),
			prompt: 'hi',
			maxOutputTokens: 1,
		})
	} catch {
		return { error: 'Key validation failed — check it is correct and active.' }
	}

	const encrypted = encryptApiKey(apiKey)

	const { error } = await supabase.from('household_ai_keys').upsert(
		{
			household_id: householdId,
			ciphertext: encrypted.ciphertext,
			iv: encrypted.iv,
			auth_tag: encrypted.auth_tag,
			key_last4: apiKey.slice(-4),
			created_by: user.id,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'household_id' },
	)

	if (error) return { error: error.message }

	revalidatePath('/settings')
	return {}
}

export async function removeAiKey(
	householdId: string,
): Promise<{ error?: string }> {
	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()
	if (!user) return { error: 'Not authenticated.' }

	const { data: membership } = await supabase
		.from('household_members')
		.select('role')
		.eq('household_id', householdId)
		.eq('user_id', user.id)
		.single()

	if (membership?.role !== 'Leader')
		return { error: 'Only Leaders can manage the AI key.' }

	const { error } = await supabase
		.from('household_ai_keys')
		.delete()
		.eq('household_id', householdId)

	if (error) return { error: error.message }

	revalidatePath('/settings')
	return {}
}
