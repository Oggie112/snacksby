'use client'

import { useEffect, useState, type SubmitEvent } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import {
	CREATE_RECIPE,
	GET_PUBLIC_RECIPES,
	type CreateRecipeResult,
} from '@/lib/graphql/recipes'
import { UNITS, type Unit } from '@/lib/units'

interface IngredientRow {
	name: string
	amount: string
	unit: Unit | null
}

interface MethodRow {
	instruction: string
}

export default function NewRecipePage() {
	const router = useRouter()
	const { user, isAuthenticated } = useUserAndSession()

	const { data: householdData } = useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})

	const householdId =
		householdData?.household_membersCollection?.edges?.[0]?.node
			?.household_id ?? null

	const [createRecipe, { loading, error }] =
		useMutation<CreateRecipeResult>(CREATE_RECIPE)

	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [servings, setServings] = useState('')
	const [prepTime, setPrepTime] = useState('')
	const [cookTime, setCookTime] = useState('')
	const [visibility, setVisibility] = useState<'private' | 'public'>('private')
	const [tagsInput, setTagsInput] = useState('')
	const [ingredients, setIngredients] = useState<IngredientRow[]>([
		{ name: '', amount: '', unit: null },
	])
	const [method, setMethod] = useState<MethodRow[]>([{ instruction: '' }])

	useEffect(() => {
		if (!isAuthenticated) {
			router.replace('/auth/login')
		}
	}, [isAuthenticated, router])

	if (!isAuthenticated) return null

	const addIngredient = () =>
		setIngredients((prev) => [...prev, { name: '', amount: '', unit: null }])
	const removeIngredient = (i: number) =>
		setIngredients((prev) => prev.filter((_, idx) => idx !== i))
	const updateIngredient = (i: number, updates: Partial<IngredientRow>) =>
		setIngredients((prev) =>
			prev.map((row, idx) => (idx === i ? { ...row, ...updates } : row)),
		)

	const addStep = () => setMethod((prev) => [...prev, { instruction: '' }])
	const removeStep = (i: number) =>
		setMethod((prev) => prev.filter((_, idx) => idx !== i))
	const updateStep = (i: number, value: string) =>
		setMethod((prev) =>
			prev.map((row, idx) => (idx === i ? { instruction: value } : row)),
		)

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const tags = tagsInput
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean)

		const filteredIngredients = ingredients
			.filter((i) => i.name.trim() && i.amount)
			.map((i) => ({
				name: i.name.trim(),
				amount: parseFloat(i.amount),
				unit: i.unit,
			}))
		const filteredMethod = method
			.filter((s) => s.instruction.trim())
			.map((s, i) => ({ step: i + 1, instruction: s.instruction }))

		const result = await createRecipe({
			variables: {
				created_by: user!.id,
				household_id: householdId,
				visibility,
				title,
				description: description || null,
				servings: servings ? parseInt(servings, 10) : null,
				prep_time: prepTime ? parseInt(prepTime, 10) : null,
				cook_time: cookTime ? parseInt(cookTime, 10) : null,
				ingredients: JSON.stringify(filteredIngredients),
				method: JSON.stringify(filteredMethod),
				tags,
			},
			refetchQueries: [{ query: GET_PUBLIC_RECIPES }],
		})

		const id = result.data?.insertIntorecipesCollection?.records?.[0]?.id
		if (id) {
			router.push(`/recipes/${id}`)
		} else {
			router.push('/recipes?saved=1')
		}
	}

	return (
		<div className="p-4 space-y-6 max-w-2xl mx-auto">
			<Link href="/recipes" className="btn btn-ghost btn-sm pl-0">
				← Back
			</Link>

			<h1 className="text-2xl font-bold">New Recipe</h1>

			<form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
				<div className="form-control gap-1">
					<label htmlFor="title" className="label-text font-medium">
						Title *
					</label>
					<input
						id="title"
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="input input-bordered w-full"
						required
					/>
				</div>

				<div className="form-control gap-1">
					<label htmlFor="description" className="label-text font-medium">
						Description
					</label>
					<textarea
						id="description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="textarea textarea-bordered w-full"
						rows={2}
					/>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div className="form-control gap-1">
						<label htmlFor="servings" className="label-text font-medium">
							Servings
						</label>
						<input
							id="servings"
							type="number"
							min="1"
							value={servings}
							onChange={(e) => setServings(e.target.value)}
							className="input input-bordered"
						/>
					</div>
					<div className="form-control gap-1">
						<label htmlFor="prep-time" className="label-text font-medium">
							Prep (min)
						</label>
						<input
							id="prep-time"
							type="number"
							min="0"
							value={prepTime}
							onChange={(e) => setPrepTime(e.target.value)}
							className="input input-bordered"
						/>
					</div>
					<div className="form-control gap-1">
						<label htmlFor="cook-time" className="label-text font-medium">
							Cook (min)
						</label>
						<input
							id="cook-time"
							type="number"
							min="0"
							value={cookTime}
							onChange={(e) => setCookTime(e.target.value)}
							className="input input-bordered"
						/>
					</div>
				</div>

				<div className="form-control gap-1">
					<label htmlFor="tags" className="label-text font-medium">
						Tags
					</label>
					<input
						id="tags"
						type="text"
						placeholder="pasta, italian, dinner"
						value={tagsInput}
						onChange={(e) => setTagsInput(e.target.value)}
						className="input input-bordered w-full"
					/>
					<span className="label-text-alt text-base-content/60">
						Comma-separated
					</span>
				</div>

				<div className="form-control gap-2">
					<span className="label-text font-medium">Visibility</span>
					<div className="flex gap-6">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								name="visibility"
								value="private"
								checked={visibility === 'private'}
								onChange={() => setVisibility('private')}
								className="radio radio-sm"
							/>
							<span className="text-sm">Private</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="radio"
								name="visibility"
								value="public"
								checked={visibility === 'public'}
								onChange={() => setVisibility('public')}
								className="radio radio-sm"
							/>
							<span className="text-sm">Public</span>
						</label>
					</div>
				</div>

				<div className="space-y-2">
					<h2 className="text-lg font-semibold">Ingredients</h2>
					{ingredients.map((ing, i) => (
						<div key={i} className="flex gap-2 items-center">
							<input
								type="number"
								min="0"
								step="any"
								placeholder="Qty"
								aria-label={`Ingredient ${i + 1} quantity`}
								value={ing.amount}
								onChange={(e) =>
									updateIngredient(i, { amount: e.target.value })
								}
								className="input input-bordered input-sm w-20 shrink-0"
							/>
							<select
								aria-label={`Ingredient ${i + 1} unit`}
								value={ing.unit ?? ''}
								onChange={(e) =>
									updateIngredient(i, {
										unit: (e.target.value as Unit) || null,
									})
								}
								className="select select-bordered select-sm w-24 shrink-0"
							>
								<option value="">—</option>
								{UNITS.map((u) => (
									<option key={u} value={u}>
										{u}
									</option>
								))}
							</select>
							<input
								type="text"
								placeholder="Ingredient"
								aria-label={`Ingredient ${i + 1} name`}
								value={ing.name}
								onChange={(e) => updateIngredient(i, { name: e.target.value })}
								className="input input-bordered input-sm flex-1"
							/>
							{ingredients.length > 1 && (
								<button
									type="button"
									aria-label={`Remove ingredient ${i + 1}`}
									onClick={() => removeIngredient(i)}
									className="btn btn-ghost btn-sm btn-square text-error"
								>
									✕
								</button>
							)}
						</div>
					))}
					<button
						type="button"
						onClick={addIngredient}
						className="btn btn-ghost btn-sm"
					>
						+ Add ingredient
					</button>
				</div>

				<div className="space-y-2">
					<h2 className="text-lg font-semibold">Method</h2>
					{method.map((step, i) => (
						<div key={i} className="flex gap-2 items-start">
							<span
								className="font-bold text-primary pt-2 shrink-0 w-5"
								aria-hidden="true"
							>
								{i + 1}.
							</span>
							<textarea
								aria-label={`Step ${i + 1}`}
								placeholder="Step instruction..."
								value={step.instruction}
								onChange={(e) => updateStep(i, e.target.value)}
								className="textarea textarea-bordered textarea-sm flex-1"
								rows={2}
							/>
							{method.length > 1 && (
								<button
									type="button"
									aria-label={`Remove step ${i + 1}`}
									onClick={() => removeStep(i)}
									className="btn btn-ghost btn-sm btn-square text-error mt-1"
								>
									✕
								</button>
							)}
						</div>
					))}
					<button
						type="button"
						onClick={addStep}
						className="btn btn-ghost btn-sm"
					>
						+ Add step
					</button>
				</div>

				{error && (
					<p role="alert" className="text-error text-sm">
						Failed to save recipe. Please try again.
					</p>
				)}

				<button
					type="submit"
					disabled={loading || !title.trim()}
					className="btn btn-primary w-full"
				>
					{loading ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						'Save Recipe'
					)}
				</button>
			</form>
		</div>
	)
}
