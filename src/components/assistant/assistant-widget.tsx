'use client'

import type { ComponentProps } from 'react'

import { isToolUIPart } from 'ai'
import Image from 'next/image'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

import { ProposalCard } from './proposal-card'
import { useAssistant } from './use-assistant'
import type { AssistantProposal } from '@/lib/ai/tools'

const markdownComponents: ComponentProps<typeof ReactMarkdown>['components'] = {
	p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
	ul: ({ children }) => (
		<ul className="list-disc ml-4 space-y-0.5 mb-1">{children}</ul>
	),
	ol: ({ children }) => (
		<ol className="list-decimal ml-4 space-y-0.5 mb-1">{children}</ol>
	),
	li: ({ children }) => <li>{children}</li>,
	strong: ({ children }) => (
		<strong className="font-semibold">{children}</strong>
	),
	h2: ({ children }) => <p className="font-semibold mt-2 mb-1">{children}</p>,
	h3: ({ children }) => (
		<p className="font-semibold mt-1.5 mb-0.5">{children}</p>
	),
}

function getFriendlyError(message: string): string {
	const lower = message.toLowerCase()
	if (
		lower.includes('expired') ||
		lower.includes('authentication') ||
		(lower.includes('invalid') &&
			(lower.includes('key') || lower.includes('api')))
	)
		return 'API key is invalid or expired — a Leader can update it in Settings.'
	if (lower.includes('rate limit'))
		return 'Rate limit reached — try again shortly.'
	if (lower.includes('not available for members'))
		return 'The AI assistant is not available to Members.'
	return 'Something went wrong — please try again.'
}

export function AssistantWidget() {
	const {
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
	} = useAssistant()

	if (roleLoading || !role || role === 'Member') return null

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

					{keyStatus === 'checking' ? (
						<div className="flex-1 flex items-center justify-center p-8">
							<span className="loading loading-spinner loading-md" />
						</div>
					) : keyStatus === 'unset' ? (
						<div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-sm">
							<p className="text-base-content/70">
								No API key configured for this household.
							</p>
							<Link
								href="/settings"
								className="btn btn-sm btn-primary"
								onClick={() => setOpen(false)}
							>
								Go to Settings
							</Link>
						</div>
					) : (
						<>
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
															return isUser ? (
																<span key={i}>{part.text}</span>
															) : (
																<ReactMarkdown
																	key={i}
																	components={markdownComponents}
																>
																	{part.text}
																</ReactMarkdown>
															)
														}

														if (isToolUIPart(part)) {
															// eslint-disable-next-line @typescript-eslint/no-explicit-any
															const p = part as any
															const isPropose = (
																part.type as string
															).startsWith('tool-propose')
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
																		onDismiss={() =>
																			handleDismiss(p.toolCallId)
																		}
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
									<p className="text-error text-xs text-center">
										{getFriendlyError(error.message)}
									</p>
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
						</>
					)}
				</div>
			)}
		</>
	)
}
