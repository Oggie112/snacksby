'use client'

import { Suspense, useEffect, useState } from 'react'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import { useHouseholdRole } from '@/hooks/use-household-role'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import {
	GET_MY_RECIPES,
	GET_PUBLIC_RECIPES,
	type RecipesCollectionData,
} from '@/lib/graphql/recipes'

function RecipesContent() {
	const { user } = useUserAndSession()
	const { canEditRecipes } = useHouseholdRole()
	const router = useRouter()
	const searchParams = useSearchParams()

	const activeTags = searchParams.getAll('tag')

	const [search, setSearch] = useState('')
	const [activeTab, setActiveTab] = useState<'explore' | 'my-recipes'>(
		'explore',
	)
	const [savedBanner, setSavedBanner] = useState(false)

	useEffect(() => {
		if (searchParams.get('saved') === '1') {
			setSavedBanner(true)
			router.replace('/recipes')
			const timer = setTimeout(() => setSavedBanner(false), 3000)
			return () => clearTimeout(timer)
		}
	}, [searchParams, router])

	const { data: householdData } = useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})
	const householdId =
		householdData?.household_membersCollection?.edges?.[0]?.node
			?.household_id ?? null

	const { data, loading, error } = useQuery<RecipesCollectionData>(
		GET_PUBLIC_RECIPES,
		{
			skip: activeTab !== 'explore',
			fetchPolicy: 'cache-and-network',
		},
	)

	const {
		data: myData,
		loading: myLoading,
		error: myError,
	} = useQuery<RecipesCollectionData>(GET_MY_RECIPES, {
		variables: { household_id: householdId, user_id: user?.id },
		skip: activeTab !== 'my-recipes' || !user?.id,
		fetchPolicy: 'cache-and-network',
	})

	const recipes = data?.recipesCollection?.edges?.map((e) => e.node) ?? []
	const myRecipes = myData?.recipesCollection?.edges?.map((e) => e.node) ?? []

	const activeRecipes = activeTab === 'explore' ? recipes : myRecipes
	const tags = Array.from(new Set(activeRecipes.flatMap((r) => r.tags ?? [])))

	const filterRecipes = (list: typeof recipes) =>
		list.filter((r) => {
			const matchesSearch = r.title
				.toLowerCase()
				.includes(search.toLowerCase())
			const matchesTag =
				activeTags.length > 0
					? activeTags.every((t) => (r.tags ?? []).includes(t))
					: true
			return matchesSearch && matchesTag
		})

	const filteredRecipes = filterRecipes(recipes)
	const filteredMyRecipes = filterRecipes(myRecipes)

	return (
		<div className="p-4 space-y-4 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold">Recipes</h1>

			{savedBanner && (
				<div role="alert" className="alert alert-success">
					<span>Recipe saved.</span>
				</div>
			)}

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
								activeTags.includes(tag) ? 'badge-primary' : 'badge-accent'
							}`}
							onClick={() => {
								const next = activeTags.includes(tag)
									? activeTags.filter((t) => t !== tag)
									: [...activeTags, tag]
								const params = new URLSearchParams()
								next.forEach((t) => params.append('tag', t))
								router.replace(
									next.length > 0
										? `/recipes?${params.toString()}`
										: '/recipes',
								)
							}}
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
					<>
						{myLoading && (
							<span className="loading loading-spinner loading-md" />
						)}
						{myError && (
							<p className="text-error text-sm">Failed to load recipes.</p>
						)}
						{!myLoading && !myError && (
							<div className="grid gap-4">
								{filteredMyRecipes.map((recipe) => (
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
								{filteredMyRecipes.length === 0 && (
									<p className="text-base-content/60">No recipes yet.</p>
								)}
							</div>
						)}
					</>
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

export default function RecipesPage() {
	return (
		<Suspense
			fallback={
				<div className="p-4">
					<span className="loading loading-spinner loading-md" />
				</div>
			}
		>
			<RecipesContent />
		</Suspense>
	)
}
