import { useEffect, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { useMutation } from '@apollo/client/react'
import { DefaultChatTransport } from 'ai'

import { getAiKeyStatus } from '@/app/settings/household/actions'
import { useUserAndSession } from '@/components/session-provider'
import { useHouseholdRole } from '@/hooks/use-household-role'
import type { AssistantProposal } from '@/lib/ai/tools'
import {
	ASSIGN_MEAL,
	REMOVE_MEAL,
	type AssignMealResult,
	type RemoveMealResult,
} from '@/lib/graphql/meal-plan'
import { CREATE_RECIPE, type CreateRecipeResult } from '@/lib/graphql/recipes'

export function useAssistant() {
	const { user } = useUserAndSession()
	const { role, householdId, loading: roleLoading } = useHouseholdRole()

	const [open, setOpen] = useState(false)
	const [input, setInput] = useState('')
	const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
	const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [keyStatus, setKeyStatus] = useState<
		'idle' | 'checking' | 'set' | 'unset'
	>('idle')
	const bottomRef = useRef<HTMLDivElement>(null)

	const { messages, sendMessage, status, error } = useChat({
		transport: new DefaultChatTransport({ api: '/api/assistant/chat' }),
	})

	const [assignMeal] = useMutation<AssignMealResult>(ASSIGN_MEAL)
	const [removeMeal] = useMutation<RemoveMealResult>(REMOVE_MEAL)
	const [createRecipe] = useMutation<CreateRecipeResult>(CREATE_RECIPE)

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
	}, [messages])

	useEffect(() => {
		if (!open || !householdId || keyStatus !== 'idle') return
		setKeyStatus('checking')
		void getAiKeyStatus(householdId).then(({ set }) => {
			setKeyStatus(set ? 'set' : 'unset')
		})
	}, [open, householdId, keyStatus])

	const busy = status === 'submitted' || status === 'streaming'

	const handleSend = async () => {
		const text = input.trim()
		if (!text || busy) return
		setInput('')
		await sendMessage({ text })
	}

	const handleConfirm = async (
		toolCallId: string,
		proposal: AssistantProposal,
	) => {
		if (!householdId || !user) return
		setConfirmingId(toolCallId)
		try {
			if (proposal.type === 'add_to_plan') {
				await assignMeal({
					variables: {
						householdId,
						date: proposal.date,
						mealType: proposal.mealType,
						recipeId: proposal.recipeId,
					},
				})
			} else if (proposal.type === 'remove_from_plan') {
				await removeMeal({ variables: { id: proposal.entryId } })
			} else if (proposal.type === 'create_recipe') {
				const { recipe } = proposal
				await createRecipe({
					variables: {
						created_by: user.id,
						household_id: householdId,
						visibility: recipe.visibility,
						title: recipe.title,
						description: recipe.description ?? null,
						servings: recipe.servings ?? null,
						prep_time: recipe.prep_time ?? null,
						cook_time: recipe.cook_time ?? null,
						ingredients: recipe.ingredients,
						method: recipe.method,
						tags: recipe.tags,
					},
				})
			}
			setDoneIds((prev) => new Set(prev).add(toolCallId))
		} finally {
			setConfirmingId(null)
		}
	}

	const handleDismiss = (toolCallId: string) => {
		setDismissedIds((prev) => new Set(prev).add(toolCallId))
	}

	return {
		role,
		roleLoading,
		open,
		setOpen,
		input,
		setInput,
		messages,
		error,
		keyStatus,
		doneIds,
		dismissedIds,
		confirmingId,
		bottomRef,
		busy,
		handleSend,
		handleConfirm,
		handleDismiss,
	}
}
