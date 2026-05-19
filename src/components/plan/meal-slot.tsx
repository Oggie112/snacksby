'use client'

import { useState } from 'react'

import { useMutation } from '@apollo/client/react'

import RecipePickerModal from './recipe-picker-modal'
import RecipeCard from '@/components/recipe-card'
import {
	ASSIGN_MEAL,
	REASSIGN_MEAL,
	REMOVE_MEAL,
	type AssignMealResult,
	type MealPlanNode,
	type MealType,
	type ReassignMealResult,
	type RemoveMealResult,
} from '@/lib/graphql/meal-plan'
import type { RecipeNode } from '@/lib/graphql/recipes'

interface MealSlotProps {
	date: string
	mealType: MealType
	assignment: MealPlanNode | null
	householdId: string
	canEdit: boolean
	refetch: () => void
}

export default function MealSlot({
	date,
	mealType,
	assignment,
	householdId,
	canEdit,
	refetch,
}: MealSlotProps) {
	const [pickerOpen, setPickerOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [assignMeal, { loading: assigning }] =
		useMutation<AssignMealResult>(ASSIGN_MEAL)
	const [reassignMeal, { loading: reassigning }] =
		useMutation<ReassignMealResult>(REASSIGN_MEAL)
	const [removeMeal, { loading: removing }] =
		useMutation<RemoveMealResult>(REMOVE_MEAL)

	const mutating = assigning || reassigning || removing

	async function handleSelect(recipe: RecipeNode) {
		setError(null)
		setPickerOpen(false)
		try {
			if (assignment) {
				await reassignMeal({
					variables: { id: assignment.id, recipeId: recipe.id },
				})
			} else {
				await assignMeal({
					variables: { householdId, date, mealType, recipeId: recipe.id },
				})
			}
			refetch()
		} catch {
			setError('Failed to save. Please try again.')
		}
	}

	async function handleRemove() {
		if (!assignment) return
		setError(null)
		try {
			await removeMeal({ variables: { id: assignment.id } })
			refetch()
		} catch {
			setError('Failed to remove. Please try again.')
		}
	}

	return (
		<>
			<div className="group min-h-[60px] lg:min-h-[90px] xl:min-h-[110px] rounded-lg border border-base-300 p-2 flex flex-col gap-1">
				{assignment ? (
					<>
						<div className="flex-1">
							<RecipeCard
								id={assignment.recipes.id}
								title={assignment.recipes.title}
							/>
						</div>
						{canEdit && (
							<div className="flex justify-between mt-auto opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
								<button
									className="btn btn-sm btn-ghost btn-circle"
									onClick={() => setPickerOpen(true)}
									disabled={mutating}
									title="Change recipe"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth={2}
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
										/>
									</svg>
								</button>
								<button
									className="btn btn-sm btn-ghost btn-circle text-error"
									onClick={() => void handleRemove()}
									disabled={mutating}
									title="Remove"
								>
									{removing ? (
										<span className="loading loading-spinner loading-xs" />
									) : (
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="size-4"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2.5}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									)}
								</button>
							</div>
						)}
					</>
				) : canEdit ? (
					<button
						className="flex-1 flex items-center justify-center text-base-content/40 hover:text-base-content/70 transition-colors"
						onClick={() => setPickerOpen(true)}
						disabled={mutating}
					>
						{mutating ? (
							<span className="loading loading-spinner loading-sm" />
						) : (
							<span className="text-2xl leading-none">+</span>
						)}
					</button>
				) : (
					<p className="text-xs text-base-content/40 italic">
						No dinner planned
					</p>
				)}
				{error && <p className="text-error text-xs">{error}</p>}
			</div>

			{pickerOpen && (
				<RecipePickerModal
					householdId={householdId}
					onSelect={(recipe) => void handleSelect(recipe)}
					onClose={() => setPickerOpen(false)}
				/>
			)}
		</>
	)
}
