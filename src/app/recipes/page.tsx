'use client'

import { useState } from 'react'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { useHouseholdRole } from '@/hooks/use-household-role'
import {
	GET_PUBLIC_RECIPES,
	type RecipesCollectionData,
} from '@/lib/graphql/recipes'

export default function RecipesPage() {
	const { canEditRecipes } = useHouseholdRole()

	const [search, setSearch] = useState('')
	const [activeTag, setActiveTag] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'explore' | 'my-recipes'>(
		'explore',
	)

	const { data, loading, error } = useQuery<RecipesCollectionData>(
		GET_PUBLIC_RECIPES,
		{
			skip: activeTab !== 'explore',
			fetchPolicy: 'cache-and-network',
		},
	)
	const recipes = data?.recipesCollection?.edges?.map((e) => e.node) ?? []
	const tags = Array.from(new Set(recipes.flatMap((r) => r.tags ?? [])))
	const filteredRecipes = recipes.filter((r) => {
		const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
		const matchesTag = activeTag ? (r.tags ?? []).includes(activeTag) : true
		return matchesSearch && matchesTag
	})

	return (
		<div className="p-4 space-y-4">
			<h1 className="text-2xl font-bold">Recipes</h1>

			<input
				type="text"
				placeholder="Search recipes..."
				value={search}
				onChange={(e) => setSearch(e.target.value)}
				className="input input-bordered w-full"
			/>

			{tags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{tags.map((tag) => (
						<button
							key={tag}
							className={`badge cursor-pointer ${
								activeTag === tag ? 'badge-primary' : 'badge-accent'
							}`}
							onClick={() => setActiveTag(activeTag === tag ? null : tag)}
						>
							{tag}
						</button>
					))}
				</div>
			)}

			<div className="flex items-center justify-between">
				<div role="tablist" className="tabs tabs-bordered">
					<button
						role="tab"
						className={`tab ${activeTab === 'explore' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('explore')}
					>
						Explore
					</button>
					<button
						role="tab"
						className={`tab ${activeTab === 'my-recipes' ? 'tab-active' : ''}`}
						onClick={() => setActiveTab('my-recipes')}
					>
						My Recipes
					</button>
				</div>
				{canEditRecipes && (
					<Link
						href="/recipes/new"
						className="btn btn-sm btn-primary hidden md:inline-flex"
					>
						New Recipe
					</Link>
				)}
			</div>

			<div className="mt-4">
				{activeTab === 'explore' && (
					<>
						{loading && <span className="loading loading-spinner loading-md" />}
						{error && (
							<p className="text-error text-sm">Failed to load recipes.</p>
						)}
						{!loading && !error && (
							<div className="grid gap-4">
								{filteredRecipes.map((recipe) => (
									<div key={recipe.id} className="card bg-base-100 shadow-md">
										<div className="card-body">
											<h2 className="card-title">{recipe.title}</h2>
											{(recipe.tags ?? []).length > 0 && (
												<div className="flex gap-1 flex-wrap">
													{recipe.tags.map((t) => (
														<span key={t} className="badge badge-outline">
															{t}
														</span>
													))}
												</div>
											)}
											<Link
												href={`/recipes/${recipe.id}`}
												className="btn btn-sm btn-accent mt-2"
											>
												View
											</Link>
										</div>
									</div>
								))}
								{filteredRecipes.length === 0 && (
									<p className="text-base-content/60">No public recipes yet.</p>
								)}
							</div>
						)}
					</>
				)}

				{activeTab === 'my-recipes' && (
					<p className="text-base-content/60">
						Join or create a household to see your recipes.
					</p>
				)}
			</div>

			{canEditRecipes && (
				<Link
					href="/recipes/new"
					className="btn btn-primary btn-circle fixed bottom-20 right-4 shadow-lg md:hidden"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="size-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</Link>
			)}
		</div>
	)
}
