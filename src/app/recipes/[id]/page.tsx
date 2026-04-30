'use client'

import { use } from 'react'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { useUserAndSession } from '@/components/session-provider'
import { useHouseholdRole } from '@/hooks/use-household-role'
import {
	GET_RECIPE,
	type Ingredient,
	type MethodStep,
	type RecipeDetailData,
} from '@/lib/graphql/recipes'

export default function RecipePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)

	const { user } = useUserAndSession()
	const { role, loading: roleLoading } = useHouseholdRole()

	const { data, loading, error } = useQuery<RecipeDetailData>(GET_RECIPE, {
		variables: { id },
		fetchPolicy: 'cache-and-network',
	})
	const recipe = data?.recipesCollection?.edges?.[0]?.node
	const canEdit =
		!!user &&
		!roleLoading &&
		(role === 'Leader' || role === 'Contributor')

	if (loading) {
		return (
			<div className="p-4">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	if (error || !recipe) {
		return (
			<div className="p-4">
				<p className="text-error">Recipe not found.</p>
			</div>
		)
	}

	const ingredients = JSON.parse(recipe.ingredients) as Ingredient[]
	const method = JSON.parse(recipe.method) as MethodStep[]
	const totalTime = (recipe.prep_time ?? 0) + (recipe.cook_time ?? 0)

	return (
		<div className="p-4 space-y-6 max-w-2xl">
			<div className="flex items-center justify-between">
				<Link href="/recipes" className="btn btn-ghost btn-sm pl-0">
					← Back
				</Link>
				{canEdit && (
					<Link href={`/recipes/${id}/edit`} className="btn btn-outline btn-sm">
						Edit
					</Link>
				)}
			</div>

			<div>
				<h1 className="text-3xl font-bold">{recipe.title}</h1>
				{recipe.description && (
					<p className="text-base-content/70 mt-1">{recipe.description}</p>
				)}
			</div>

			<div className="flex gap-4 text-sm text-base-content/60 flex-wrap">
				{recipe.servings && <span>{recipe.servings} servings</span>}
				{recipe.prep_time && <span>Prep {recipe.prep_time} min</span>}
				{recipe.cook_time && <span>Cook {recipe.cook_time} min</span>}
				{totalTime > 0 && <span>Total {totalTime} min</span>}
			</div>

			{(recipe.tags ?? []).length > 0 && (
				<div className="flex gap-1 flex-wrap">
					{recipe.tags.map((t) => (
						<span key={t} className="badge badge-outline">
							{t}
						</span>
					))}
				</div>
			)}

			<div>
				<h2 className="text-xl font-semibold mb-3">Ingredients</h2>
				<ul className="space-y-1">
					{ingredients.map((ing, i) => (
						<li key={i} className="flex gap-3">
							<span className="text-base-content/60 min-w-24 shrink-0">
								{ing.quantity}
							</span>
							<span>{ing.name}</span>
						</li>
					))}
				</ul>
			</div>

			<div>
				<h2 className="text-xl font-semibold mb-3">Method</h2>
				<ol className="space-y-4">
					{method.map((s) => (
						<li key={s.step} className="flex gap-3">
							<span className="font-bold text-primary shrink-0">{s.step}.</span>
							<span>{s.instruction}</span>
						</li>
					))}
				</ol>
			</div>
		</div>
	)
}
