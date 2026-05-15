'use client'

import { useEffect, useState } from 'react'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import {
	GET_WEEK_PLAN,
	type MealType,
	type WeekPlanData,
} from '@/lib/graphql/meal-plan'
import {
	GET_SHOPPING_LIST,
	type ShoppingListData,
} from '@/lib/graphql/shopping-list'

function toISO(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-')
}

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

export default function HomePage() {
	const { user } = useUserAndSession()

	const [todayISO, setTodayISO] = useState('')
	const [tomorrowISO, setTomorrowISO] = useState('')

	useEffect(() => {
		const d = new Date()
		const t = new Date(d)
		t.setDate(d.getDate() + 1)
		setTodayISO(toISO(d))
		setTomorrowISO(toISO(t))
	}, [])

	const { data: householdData } = useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})

	const householdId =
		householdData?.household_membersCollection?.edges?.[0]?.node
			?.household_id ?? null

	const { data: planData } = useQuery<WeekPlanData>(GET_WEEK_PLAN, {
		variables: {
			householdId,
			startDate: todayISO,
			endDate: tomorrowISO,
		},
		skip: !householdId || !todayISO,
		fetchPolicy: 'cache-and-network',
	})
	const { data: shoppingData } = useQuery<ShoppingListData>(GET_SHOPPING_LIST, {
		variables: { householdId },
		skip: !householdId,
	})

	const hasHousehold = !!householdId

	const meals = planData?.meal_planCollection?.edges?.map((e) => e.node) ?? []
	const todayMeals = meals.filter((m) => m.date === todayISO)
	const tomorrowMeals = meals.filter((m) => m.date === tomorrowISO)
	const hasPlanData = meals.length > 0

	const allItems =
		shoppingData?.shopping_list_itemsCollection?.edges?.map((e) => e.node) ?? []
	const uncheckedCount = allItems.filter((i) => !i.checked).length
	const hasShoppingData = allItems.length > 0

	return (
		<div className="p-4 space-y-6 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold">Good morning</h1>

			{user && householdData && !hasHousehold && (
				<section className="card bg-primary/10 border border-primary/20 shadow-sm">
					<div className="card-body">
						<h2 className="card-title text-lg">Set up your household</h2>
						<p className="text-base-content/60 text-sm">
							Create or join a household to share recipes and meal plans with
							your family or housemates.
						</p>
						<div className="card-actions mt-2">
							<Link href="/households/setup" className="btn btn-sm btn-primary">
								Get started
							</Link>
						</div>
					</div>
				</section>
			)}

			{hasPlanData ? (
				<section className="space-y-3">
					<h2 className="text-lg font-semibold">Today &amp; Tomorrow</h2>
					<div className="grid grid-cols-2 gap-3">
						{(
							[
								{ label: 'Today', dayMeals: todayMeals },
								{ label: 'Tomorrow', dayMeals: tomorrowMeals },
							] as const
						).map(({ label, dayMeals }) => (
							<div key={label} className="card bg-base-100 shadow-md">
								<div className="card-body p-3 gap-2">
									<h3 className="font-semibold text-sm">{label}</h3>
									{MEAL_TYPES.map((type) => {
										const meal = dayMeals.find((m) => m.meal_type === type)
										return (
											<div key={type} className="text-xs">
												<span className="text-base-content/50">{type}</span>
												{meal ? (
													<Link
														href={`/recipes/${meal.recipes.id}`}
														className="block font-medium text-primary leading-tight mt-0.5 hover:underline"
													>
														{meal.recipes.title}
													</Link>
												) : (
													<p className="text-base-content/30 mt-0.5">—</p>
												)}
											</div>
										)
									})}
								</div>
							</div>
						))}
					</div>
					<Link href="/plan" className="btn btn-sm btn-primary">
						See full plan
					</Link>
				</section>
			) : (
				<section className="card bg-base-100 shadow-md">
					<div className="card-body">
						<h2 className="card-title text-lg">This week&apos;s plan</h2>
						<p className="text-base-content/60">No meals planned yet.</p>
						<div className="card-actions mt-2">
							<Link href="/plan" className="btn btn-sm btn-primary">
								Go to planner
							</Link>
						</div>
					</div>
				</section>
			)}

			{hasShoppingData ? (
				<section className="card bg-base-100 shadow-md">
					<div className="card-body items-center text-center">
						<h2 className="card-title text-lg">Shopping list</h2>
						<p className="text-5xl font-bold mt-2">{uncheckedCount}</p>
						<p className="text-base-content/60 text-sm mb-2">
							{uncheckedCount === 1 ? 'item' : 'items'} remaining
						</p>
						<Link href="/shopping-list" className="btn btn-accent">
							View list
						</Link>
					</div>
				</section>
			) : (
				<section className="card bg-base-100 shadow-md">
					<div className="card-body">
						<h2 className="card-title text-lg">Shopping list</h2>
						<p className="text-base-content/60">Your list is empty.</p>
						<div className="card-actions mt-2">
							<Link href="/shopping-list" className="btn btn-sm btn-accent">
								View list
							</Link>
						</div>
					</div>
				</section>
			)}
		</div>
	)
}
