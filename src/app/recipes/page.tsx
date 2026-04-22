'use client'

import { useState } from 'react'

export default function RecipesPage() {
	const [search, setSearch] = useState('')
	const [activeTag, setActiveTag] = useState<string | null>(null)
	const [activeTab, setActiveTab] = useState<'explore' | 'my-recipes'>(
		'explore',
	)

	const recipes = [
		{ id: 1, title: 'Spaghetti Bolognese', tags: ['pasta', 'beef'] },
		{ id: 2, title: 'Avocado Toast', tags: ['vegan', 'breakfast'] },
		{ id: 3, title: 'Chicken Curry', tags: ['spicy', 'chicken'] },
	]

	const tags = ['pasta', 'beef', 'vegan', 'breakfast', 'spicy', 'chicken']

	const filteredRecipes = recipes.filter((r) => {
		const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase())
		const matchesTag = activeTag ? r.tags.includes(activeTag) : true
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

			<div className="mt-4">
				{activeTab === 'explore' && (
					<div className="grid gap-4">
						{filteredRecipes.map((recipe) => (
							<div key={recipe.id} className="card bg-base-100 shadow-md">
								<div className="card-body">
									<h2 className="card-title">{recipe.title}</h2>
									<div className="flex gap-1">
										{recipe.tags.map((t) => (
											<span key={t} className="badge badge-outline">
												{t}
											</span>
										))}
									</div>
									<button className="btn btn-sm btn-accent mt-2">View</button>
								</div>
							</div>
						))}

						{filteredRecipes.length === 0 && (
							<p className="text-info">No recipes found.</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
