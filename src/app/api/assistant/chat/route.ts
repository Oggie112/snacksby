import { createAnthropic } from '@ai-sdk/anthropic'
import { stepCountIs, streamText } from 'ai'
import { type NextRequest, NextResponse } from 'next/server'

import { decryptApiKey } from '@/lib/ai/crypto'
import { createAssistantTools } from '@/lib/ai/tools'
import { adminClient } from '@/lib/supabase/admin'
import { serverClient } from '@/lib/supabase/server'

// Allow streaming responses up to 60 seconds on Vercel
export const maxDuration = 60

export async function POST(request: NextRequest) {
	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
	}

	const { data: membership } = await supabase
		.from('household_members')
		.select('household_id, role')
		.eq('user_id', user.id)
		.single()

	if (!membership) {
		return NextResponse.json({ error: 'No household found.' }, { status: 403 })
	}

	const { household_id, role } = membership

	if (role === 'Member') {
		return NextResponse.json(
			{ error: 'The AI assistant is not available for Members.' },
			{ status: 403 },
		)
	}

	const admin = adminClient()
	const { data: keyRow } = await admin
		.from('household_ai_keys')
		.select('ciphertext, iv, auth_tag')
		.eq('household_id', household_id)
		.single()

	if (!keyRow) {
		return NextResponse.json(
			{
				error:
					'No Anthropic key set for this household. A Leader can add one in Settings → Household.',
			},
			{ status: 404 },
		)
	}

	let apiKey: string
	try {
		apiKey = decryptApiKey(keyRow)
	} catch {
		return NextResponse.json(
			{ error: 'Failed to read API key.' },
			{ status: 500 },
		)
	}

	let messages
	try {
		const body = await request.json()
		messages = body.messages
	} catch {
		return NextResponse.json(
			{ error: 'Invalid request body.' },
			{ status: 400 },
		)
	}

	const canWrite = role === 'Leader' || role === 'Contributor'

	const systemPrompt = [
		'You are a helpful cooking and meal-planning assistant for the Snacksby app.',
		'Help users with recipes, meal plans, ingredients, and cooking techniques.',
		`The user's role in their household is: ${role}.`,
		canWrite
			? 'They can manage recipes and the meal plan. When they ask you to add or change something, use the propose tools — do not act without their confirmation.'
			: 'They can view recipes and the meal plan but cannot make changes.',
		'For web recipe searches, always use proposeCreateRecipe to hand the structured recipe back to the user for confirmation before saving.',
		'Be concise. Avoid unnecessary preamble.',
	].join('\n')

	const anthropic = createAnthropic({ apiKey })

	const tools = createAssistantTools({
		supabase,
		householdId: household_id,
		canWrite,
	})

	const result = streamText({
		model: anthropic('claude-sonnet-4-6'),
		system: systemPrompt,
		messages,
		tools: {
			...tools,
			web_search: anthropic.tools.webSearch_20260209({ maxUses: 3 }),
		},
		stopWhen: stepCountIs(5),
		maxOutputTokens: 2048,
	})

	return result.toUIMessageStreamResponse()
}
