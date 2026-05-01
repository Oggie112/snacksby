'use client'

import { use, useEffect, useState, type SubmitEvent } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import { useHouseholdRole } from '@/hooks/use-household-role'
import {
	DELETE_RECIPE,
	GET_PUBLIC_RECIPES,
	GET_RECIPE,
	UPDATE_RECIPE,
	type DeleteRecipeResult,
	type Ingredient,
	type MethodStep,
	type RecipeDetailData,
	type UpdateRecipeResult,
} from '@/lib/graphql/recipes'

interface IngredientRow {
	name: string
	quantity: string
}

interface MethodRow {
	instruction: string
}

export default function EditRecipePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = use(params)
	const router = useRouter()
	const { user, isAuthenticated } = useUserAndSession()
	const { role, loading: roleLoading } = useHouseholdRole()

	const {
		data,
		loading: queryLoading,
		error: queryError,
	} = useQuery<RecipeDetailData>(GET_RECIPE, { variables: { id } })
	const recipe = data?.recipesCollection?.edges?.[0]?.node

	const [updateRecipe, { loading: mutationLoading, error }] =
		useMutation<UpdateRecipeResult>(UPDATE_RECIPE)

	const [deleteRecipe, { loading: deleteLoading, error: deleteError }] =
		useMutation<DeleteRecipeResult>(DELETE_RECIPE)

	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const [initialized, setInitialized] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [servings, setServings] = useState('')
	const [prepTime, setPrepTime] = useState('')
	const [cookTime, setCookTime] = useState('')
	const [visibility, setVisibility] = useState<'private' | 'public'>('private')
	const [tagsInput, setTagsInput] = useState('')
	const [ingredients, setIngredients] = useState<IngredientRow[]>([
		{ name: '', quantity: '' },
	])
	const [method, setMethod] = useState<MethodRow[]>([{ instruction: '' }])

	useEffect(() => {
		if (!isAuthenticated) {
			router.replace('/auth/login')
		}
	}, [isAuthenticated, router])

	useEffect(() => {
		if (!recipe || initialized) return

		if (roleLoading) return

		if (user && role !== 'Leader' && role !== 'Contributor') {
			router.replace(`/recipes/${id}`)
			return
		}

		setTitle(recipe.title)
		setDescription(recipe.description ?? '')
		setServings(recipe.servings ? String(recipe.servings) : '')
		setPrepTime(recipe.prep_time ? String(recipe.prep_time) : '')
		setCookTime(recipe.cook_time ? String(recipe.cook_time) : '')
		setVisibility(recipe.visibility)
		setTagsInput((recipe.tags ?? []).join(', '))

		const parsedIngredients = JSON.parse(recipe.ingredients) as Ingredient[]
		const parsedMethod = JSON.parse(recipe.method) as MethodStep[]

		setIngredients(
			parsedIngredients.length > 0
				? parsedIngredients
				: [{ name: '', quantity: '' }],
		)
		setMethod(
			parsedMethod.length > 0
				? parsedMethod.map((s) => ({ instruction: s.instruction }))
				: [{ instruction: '' }],
		)

		setInitialized(true)
	}, [recipe, initialized, user, id, router, role, roleLoading])

	if (!isAuthenticated) return null

	if (queryError) {
		return (
			<div className="p-4">
				<p className="text-error">Recipe not found.</p>
			</div>
		)
	}

	if (queryLoading || roleLoading || !initialized) {
		return (
			<div className="p-4">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	const addIngredient = () =>
		setIngredients((prev) => [...prev, { name: '', quantity: '' }])
	const removeIngredient = (i: number) =>
		setIngredients((prev) => prev.filter((_, idx) => idx !== i))
	const updateIngredient = (
		i: number,
		field: keyof IngredientRow,
		value: string,
	) =>
		setIngredients((prev) =>
			prev.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)),
		)

	const addStep = () => setMethod((prev) => [...prev, { instruction: '' }])
	const removeStep = (i: number) =>
		setMethod((prev) => prev.filter((_, idx) => idx !== i))
	const updateStep = (i: number, value: string) =>
		setMethod((prev) =>
			prev.map((row, idx) => (idx === i ? { instruction: value } : row)),
		)

	const handleDelete = async () => {
		await deleteRecipe({
			variables: { id },
			refetchQueries: [{ query: GET_PUBLIC_RECIPES }],
		})
		router.push('/recipes')
	}

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()

		const tags = tagsInput
			.split(',')
			.map((t) => t.trim())
			.filter(Boolean)

		const filteredIngredients = ingredients.filter((i) => i.name.trim())
		const filteredMethod = method
			.filter((s) => s.instruction.trim())
			.map((s, i) => ({ step: i + 1, instruction: s.instruction }))

		const result = await updateRecipe({
			variables: {
				id,
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
			refetchQueries: [
				{ query: GET_RECIPE, variables: { id } },
				{ query: GET_PUBLIC_RECIPES },
			],
		})

		const updated = result.data?.updaterecipesCollection?.records?.[0]?.id
		if (updated) {
			router.push(`/recipes/${id}`)
		} else {
			router.push('/recipes')
		}
	}

	return (
		<div className="p-4 space-y-6 max-w-2xl">
			<Link href={`/recipes/${id}`} className="btn btn-ghost btn-sm pl-0">
				← Back
			</Link>

			<h1 className="text-2xl font-bold">Edit Recipe</h1>

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
								type="text"
								placeholder="Quantity"
								value={ing.quantity}
								onChange={(e) =>
									updateIngredient(i, 'quantity', e.target.value)
								}
								className="input input-bordered input-sm w-28 shrink-0"
							/>
							<input
								type="text"
								placeholder="Ingredient"
								value={ing.name}
								onChange={(e) => updateIngredient(i, 'name', e.target.value)}
								className="input input-bordered input-sm flex-1"
							/>
							{ingredients.length > 1 && (
								<button
									type="button"
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
							<span className="font-bold text-primary pt-2 shrink-0 w-5">
								{i + 1}.
							</span>
							<textarea
								placeholder="Step instruction..."
								value={step.instruction}
								onChange={(e) => updateStep(i, e.target.value)}
								className="textarea textarea-bordered textarea-sm flex-1"
								rows={2}
							/>
							{method.length > 1 && (
								<button
									type="button"
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
					<p className="text-error text-sm">
						Failed to save changes. Please try again.
					</p>
				)}

				<button
					type="submit"
					disabled={mutationLoading || !title.trim()}
					className="btn btn-primary w-full"
				>
					{mutationLoading ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						'Save Changes'
					)}
				</button>
				<div className="divider" />

				<button
					type="button"
					onClick={() => setShowDeleteModal(true)}
					className="btn btn-error btn-outline w-full"
				>
					Delete Recipe
				</button>
			</form>

			{showDeleteModal && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Delete Recipe?</h3>
						<p className="py-4 text-base-content/70">This cannot be undone.</p>
						{deleteError && (
							<p className="text-error text-sm mb-2">
								Failed to delete. Please try again.
							</p>
						)}
						<div className="modal-action">
							<button
								onClick={() => setShowDeleteModal(false)}
								className="btn btn-ghost"
							>
								Cancel
							</button>
							<button
								onClick={() => void handleDelete()}
								disabled={deleteLoading}
								className="btn btn-error"
							>
								{deleteLoading ? (
									<span className="loading loading-spinner loading-sm" />
								) : (
									'Delete'
								)}
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => setShowDeleteModal(false)}
					/>
				</div>
			)}
		</div>
	)
}
