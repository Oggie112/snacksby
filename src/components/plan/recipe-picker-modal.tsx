'use client'

import { useState } from 'react'

import { useQuery } from '@apollo/client/react'

import Modal from '@/components/modal'
import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_RECIPES,
	GET_PUBLIC_RECIPES,
	type RecipeNode,
	type RecipesCollectionData,
} from '@/lib/graphql/recipes'

interface RecipePickerModalProps {
	householdId: string
	onSelect: (recipe: RecipeNode) => void
	onClose: () => void
}

export default function RecipePickerModal({
	householdId,
	onSelect,
	onClose,
}: RecipePickerModalProps) {
	const { user } = useUserAndSession()
	const [search, setSearch] = useState('')
	const [activeTab, setActiveTab] = useState<'my-recipes' | 'explore'>(
		'my-recipes',
	)

	const { data: myData, loading: myLoading } = useQuery<RecipesCollectionData>(
		GET_MY_RECIPES,
		{
			variables: { household_id: householdId, user_id: user?.id },
			skip: activeTab !== 'my-recipes' || !user?.id,
			fetchPolicy: 'cache-and-network',
		},
	)

	const { data: exploreData, loading: exploreLoading } =
		useQuery<RecipesCollectionData>(GET_PUBLIC_RECIPES, {
			skip: activeTab !== 'explore',
			fetchPolicy: 'cache-and-network',
		})

	const rawRecipes =
		activeTab === 'my-recipes'
			? (myData?.recipesCollection?.edges?.map((e) => e.node) ?? [])
			: (exploreData?.recipesCollection?.edges?.map((e) => e.node) ?? [])

	const loading = activeTab === 'my-recipes' ? myLoading : exploreLoading

	const filtered = rawRecipes.filter((r) =>
		r.title.toLowerCase().includes(search.toLowerCase()),
	)

	return (
		<Modal
			onClose={onClose}
			labelledBy="picker-title"
			className="max-h-[80vh] flex flex-col"
		>
			<div className="flex items-center justify-between mb-3">
				<h3 id="picker-title" className="font-bold text-lg">
					Choose a recipe
				</h3>
				<button
					className="btn btn-sm btn-ghost"
					aria-label="Close"
					onClick={onClose}
				>
					✕
				</button>
			</div>

			<input
				type="text"
				placeholder="Search..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="input input-bordered input-sm w-full mb-3"
			/>

			<div role="tablist" className="tabs tabs-bordered mb-3">
				<button
					id="picker-tab-my-recipes"
					role="tab"
					aria-selected={activeTab === 'my-recipes'}
					aria-controls="picker-panel"
					className={`tab ${activeTab === 'my-recipes' ? 'tab-active' : ''}`}
					onClick={() => setActiveTab('my-recipes')}
				>
					My Recipes
				</button>
				<button
					id="picker-tab-explore"
					role="tab"
					aria-selected={activeTab === 'explore'}
					aria-controls="picker-panel"
					className={`tab ${activeTab === 'explore' ? 'tab-active' : ''}`}
					onClick={() => setActiveTab('explore')}
				>
					Explore
				</button>
			</div>

			<div
				id="picker-panel"
				role="tabpanel"
				aria-labelledby={
					activeTab === 'my-recipes'
						? 'picker-tab-my-recipes'
						: 'picker-tab-explore'
				}
				className="overflow-y-auto flex-1 space-y-2"
			>
				{loading && (
					<span
						className="loading loading-spinner loading-sm"
						aria-label="Loading recipes"
					/>
				)}
				{!loading && filtered.length === 0 && (
					<p className="text-base-content/60 text-sm">No recipes found.</p>
				)}
				{!loading &&
					filtered.map((recipe) => (
						<button
							key={recipe.id}
							className="w-full text-left p-3 rounded-lg bg-base-200 hover:bg-base-300 transition-colors"
							onClick={() => onSelect(recipe)}
						>
							<p className="font-medium">{recipe.title}</p>
							{(recipe.tags ?? []).length > 0 && (
								<div className="flex gap-1 flex-wrap mt-1">
									{recipe.tags.map((t) => (
										<span key={t} className="badge badge-outline badge-xs">
											{t}
										</span>
									))}
								</div>
							)}
						</button>
					))}
			</div>
		</Modal>
	)
}
