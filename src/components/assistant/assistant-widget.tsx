'use client'

import { useEffect, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { useMutation } from '@apollo/client/react'
import Image from 'next/image'
import { DefaultChatTransport, isToolUIPart } from 'ai'

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

// ——— Proposal confirmation card ——————————————————————————————————————————

function ProposalCard({
	proposal,
	done,
	onConfirm,
	onDismiss,
	confirming,
}: {
	proposal: AssistantProposal
	done: boolean
	onConfirm: () => void
	onDismiss: () => void
	confirming: boolean
}) {
	if (done) {
		return <div className="alert alert-success py-2 text-sm mt-1">Done ✓</div>
	}

	let summary: string
	if (proposal.type === 'add_to_plan') {
		summary = `Add "${proposal.recipeTitle}" to ${proposal.date} (${proposal.mealType})`
	} else if (proposal.type === 'remove_from_plan') {
		summary = `Remove "${proposal.recipeTitle}" from ${proposal.date} (${proposal.mealType})`
	} else {
		summary = `Save recipe "${proposal.recipe.title}" to your household library`
	}

	return (
		<div className="card card-bordered bg-base-200 mt-2 p-3 text-sm">
			<p className="mb-2">{summary}</p>
			<div className="flex gap-2">
				<button
					className="btn btn-xs btn-primary"
					disabled={confirming}
					onClick={onConfirm}
				>
					{confirming ? (
						<span className="loading loading-spinner loading-xs" />
					) : (
						'Confirm'
					)}
				</button>
				<button
					className="btn btn-xs btn-ghost"
					disabled={confirming}
					onClick={onDismiss}
				>
					Dismiss
				</button>
			</div>
		</div>
	)
}

// ——— Main widget ——————————————————————————————————————————————————————————

export function AssistantWidget() {
	const { user } = useUserAndSession()
	const { role, householdId, loading: roleLoading } = useHouseholdRole()
	const [open, setOpen] = useState(false)
	const [input, setInput] = useState('')
	const [doneIds, setDoneIds] = useState<Set<string>>(new Set())
	const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
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

	if (roleLoading || !role || role === 'Member') return null

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

	return (
		<>
			{/* Floating toggle button */}
			<button
				className="btn btn-circle fixed bottom-20 right-4 md:bottom-6 md:right-6 shadow-lg z-50 overflow-hidden p-0 border-0"
				onClick={() => setOpen((v) => !v)}
				aria-label="Toggle AI assistant"
			>
				{open ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				) : (
					<Image
						src="/images/snacksby-logo.png"
						alt="Snacksby assistant"
						width={56}
						height={56}
						className="object-cover object-center scale-[1.12]"
					/>
				)}
			</button>

			{/* Chat panel */}
			{open && (
				<div
					className="fixed bottom-20 right-6 w-80 sm:w-96 z-40 flex flex-col bg-base-100 border border-base-300 rounded-2xl shadow-xl overflow-hidden"
					style={{ maxHeight: 'calc(100dvh - 6rem)' }}
				>
					{/* Header */}
					<div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-200">
						<span className="font-semibold text-sm">Snacksby assistant</span>
						<button
							className="btn btn-xs btn-ghost btn-circle"
							onClick={() => setOpen(false)}
							aria-label="Close"
						>
							✕
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
						{messages.length === 0 && (
							<p className="text-base-content/50 text-center text-xs mt-4">
								Ask me about your recipes or meal plan.
							</p>
						)}

						{messages.map((message) => {
							const isUser = message.role === 'user'
							return (
								<div
									key={message.id}
									className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[85%] ${isUser ? 'chat chat-end' : 'chat chat-start'} w-full`}
									>
										<div
											className={`chat-bubble text-sm ${isUser ? 'chat-bubble-primary' : 'bg-base-200 text-base-content'}`}
										>
											{message.parts.map((part, i) => {
												if (part.type === 'text') {
													return <span key={i}>{part.text}</span>
												}

												if (isToolUIPart(part)) {
													// eslint-disable-next-line @typescript-eslint/no-explicit-any
													const p = part as any
													const isPropose = (part.type as string).startsWith(
														'tool-propose',
													)
													if (
														isPropose &&
														p.state === 'output-available' &&
														p.output &&
														!dismissedIds.has(p.toolCallId)
													) {
														const proposal = p.output as AssistantProposal
														return (
															<ProposalCard
																key={p.toolCallId}
																proposal={proposal}
																done={doneIds.has(p.toolCallId)}
																confirming={confirmingId === p.toolCallId}
																onConfirm={() =>
																	void handleConfirm(p.toolCallId, proposal)
																}
																onDismiss={() => handleDismiss(p.toolCallId)}
															/>
														)
													}
												}

												return null
											})}
										</div>
									</div>
								</div>
							)
						})}

						{busy && (
							<div className="flex justify-start">
								<div className="chat chat-start">
									<div className="chat-bubble bg-base-200">
										<span className="loading loading-dots loading-xs" />
									</div>
								</div>
							</div>
						)}

						{error && (
							<p className="text-error text-xs text-center">{error.message}</p>
						)}

						<div ref={bottomRef} />
					</div>

					{/* Input */}
					<div className="border-t border-base-300 p-3 flex gap-2">
						<input
							className="input input-sm input-bordered flex-1"
							placeholder="Ask anything…"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === 'Enter' && !e.shiftKey) {
									e.preventDefault()
									void handleSend()
								}
							}}
							disabled={busy}
						/>
						<button
							className="btn btn-sm btn-primary"
							disabled={busy || !input.trim()}
							onClick={() => void handleSend()}
						>
							Send
						</button>
					</div>
				</div>
			)}
		</>
	)
}
