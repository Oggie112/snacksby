'use client'

import MealSlot from './meal-slot'
import type { MealPlanNode } from '@/lib/graphql/meal-plan'

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
	dinnerAssignment: MealPlanNode | null
	householdId: string
	canEdit: boolean
	refetch: () => void
}

export default function DayColumn({
	date,
	isToday,
	dinnerAssignment,
	householdId,
	canEdit,
	refetch,
}: DayColumnProps) {
	const dayName = DAY_NAMES[dayIndex(date)]
	const dateLabel = `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`

	return (
		<div className="flex flex-col gap-2">
			<div
				className={`text-center py-1 rounded-lg ${isToday ? 'bg-primary text-primary-content' : 'bg-base-200'}`}
			>
				<p className="text-xs font-semibold uppercase tracking-wide">
					{dayName}
				</p>
				<p className="text-sm">{dateLabel}</p>
			</div>

			<div className="space-y-1">
				<p className="text-xs text-base-content/50 uppercase tracking-wide text-center">
					Dinner
				</p>
				<MealSlot
					date={toISO(date)}
					mealType="Dinner"
					assignment={dinnerAssignment}
					householdId={householdId}
					canEdit={canEdit}
					refetch={refetch}
				/>
			</div>
		</div>
	)
}
