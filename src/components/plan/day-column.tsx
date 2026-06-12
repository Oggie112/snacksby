'use client'

import { useEffect, useRef, useState } from 'react'

import MealSlot from './meal-slot'
import type { MealPlanNode, MealType } from '@/lib/graphql/meal-plan'

const MEAL_TYPES: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack']

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
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

function dayIndex(date: Date): number {
	return (date.getDay() + 6) % 7 // Mon=0 … Sun=6
}

function toISO(date: Date): string {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, '0'),
		String(date.getDate()).padStart(2, '0'),
	].join('-')
}

interface DayColumnProps {
	date: Date
	isToday: boolean
	assignments: Map<MealType, MealPlanNode | null>
	householdId: string
	canEdit: boolean
	refetch: () => void
}

export default function DayColumn({
	date,
	isToday,
	assignments,
	householdId,
	canEdit,
	refetch,
}: DayColumnProps) {
	const ref = useRef<HTMLDivElement>(null)
	const [inFocus, setInFocus] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		const observer = new IntersectionObserver(
			([entry]) => setInFocus(entry.intersectionRatio >= 0.8),
			{ threshold: 0.8 },
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [])

	useEffect(() => {
		if (isToday) ref.current?.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' })
	}, [isToday])

	const dayName = DAY_NAMES[dayIndex(date)]
	const dateLabel = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`

	return (
		<div
			ref={ref}
			className={`flex flex-col gap-2 w-[90vw] shrink-0 snap-start sm:w-auto sm:shrink sm:snap-align-none transition-all duration-300 ${inFocus ? '' : 'opacity-50 grayscale sm:opacity-100 sm:grayscale-0'}`}
		>
			<div
				className={`text-center py-1 rounded-lg ${isToday ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
			>
				<p className="text-xs font-semibold uppercase tracking-wide">
					{dayName}
				</p>
				<p className="text-sm">{dateLabel}</p>
			</div>

			<div className="space-y-2">
				{MEAL_TYPES.map((type) => (
					<div key={type} className="space-y-1">
						<p className="text-xs text-base-content/50 uppercase tracking-wide text-center">
							{type}
						</p>
						<MealSlot
							date={toISO(date)}
							mealType={type}
							assignment={assignments.get(type) ?? null}
							householdId={householdId}
							canEdit={canEdit}
							refetch={refetch}
						/>
					</div>
				))}
			</div>
		</div>
	)
}
