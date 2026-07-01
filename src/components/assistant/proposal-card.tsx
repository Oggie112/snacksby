import type { AssistantProposal } from '@/lib/ai/tools'

interface ProposalCardProps {
	proposal: AssistantProposal
	done: boolean
	onConfirm: () => void
	onDismiss: () => void
	confirming: boolean
}

export function ProposalCard({
	proposal,
	done,
	onConfirm,
	onDismiss,
	confirming,
}: ProposalCardProps) {
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
