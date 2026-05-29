'use client'

import { Suspense } from 'react'

import { useQuery } from '@apollo/client/react'
import { useRouter, useSearchParams } from 'next/navigation'

import DayColumn from '@/components/plan/day-column'
import { useUserAndSession } from '@/components/session-provider'
import { useHouseholdRole } from '@/hooks/use-household-role'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'
import {
	GET_WEEK_PLAN,
	type MealPlanNode,
	type MealType,
	type WeekPlanData,
} from '@/lib/graphql/meal-plan'

const MONTH_NAMES = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
]

function toISO(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-')
}

function getMondayOf(input: Date): Date {
	const d = new Date(input)
	const day = d.getDay()
	d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
	d.setHours(0, 0, 0, 0)
	return d
}

function addDays(date: Date, n: number): Date {
	const d = new Date(date)
	d.setDate(d.getDate() + n)
	return d
}

function PlanContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useUserAndSession()
	const { loading: roleLoading, canEditRecipes: canEdit } = useHouseholdRole()

	const weekParam = searchParams.get('week')
	const weekStart = getMondayOf(weekParam ? new Date(weekParam) : new Date())
	const weekEnd = addDays(weekStart, 6)
	const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
	const todayISO = toISO(new Date())

	const { data: householdData, loading: householdLoading } =
		useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
			variables: { user_id: user?.id },
			skip: !user?.id,
		})

	const householdId =
		householdData?.household_membersCollection?.edges?.[0]?.node
			?.household_id ?? null

	const {
		data: weekPlanData,
		loading: planLoading,
		refetch,
	} = useQuery<WeekPlanData>(GET_WEEK_PLAN, {
		variables: {
			householdId,
			startDate: toISO(weekStart),
			endDate: toISO(weekEnd),
		},
		skip: !householdId,
		fetchPolicy: 'cache-and-network',
	})

	const assignments = new Map<string, Map<MealType, MealPlanNode>>()
	weekPlanData?.meal_planCollection?.edges?.forEach(({ node }) => {
		if (!assignments.has(node.date)) assignments.set(node.date, new Map())
		assignments.get(node.date)!.set(node.meal_type, node)
	})

	function navigate(weeks: number) {
		router.push(`/plan?week=${toISO(addDays(weekStart, weeks * 7))}`)
	}

	const weekLabel = (() => {
		const start = `${weekStart.getDate()} ${MONTH_NAMES[weekStart.getMonth()]}`
		const end = `${weekEnd.getDate()} ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
		return `${start} – ${end}`
	})()

	if (!user || householdLoading || roleLoading) {
		return (
			<div className="p-4">
				<span className="loading loading-spinner loading-md" />
			</div>
		)
	}

	if (!householdId) {
		return (
			<div className="p-4">
				<p className="text-base-content/60">
					Join or create a household to start meal planning.
				</p>
			</div>
		)
	}

	return (
		<div className="p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Meal Plan</h1>
				{planLoading && <span className="loading loading-spinner loading-sm" />}
			</div>

			<div className="flex items-center gap-2">
				<button className="btn btn-sm btn-ghost" onClick={() => navigate(-1)}>
					←
				</button>
				<span className="flex-1 text-center text-sm font-medium">
					{weekLabel}
				</span>
				<button className="btn btn-sm btn-ghost" onClick={() => navigate(1)}>
					→
				</button>
			</div>

			<div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 sm:grid sm:grid-cols-7 sm:overflow-x-visible sm:snap-none">
				{weekDates.map((date) => (
					<DayColumn
						key={toISO(date)}
						date={date}
						isToday={toISO(date) === todayISO}
						assignments={assignments.get(toISO(date)) ?? new Map()}
						householdId={householdId}
						canEdit={canEdit}
						refetch={() => void refetch()}
					/>
				))}
			</div>
		</div>
	)
}

export default function PlanPage() {
	return (
		<Suspense
			fallback={
				<div className="p-4">
					<span className="loading loading-spinner loading-md" />
				</div>
			}
		>
			<PlanContent />
		</Suspense>
	)
}
