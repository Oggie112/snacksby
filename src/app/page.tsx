'use client'

import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_MY_HOUSEHOLD,
	type MyHouseholdData,
} from '@/lib/graphql/households'

export default function HomePage() {
	const { user } = useUserAndSession()

	const { data: householdData } = useQuery<MyHouseholdData>(GET_MY_HOUSEHOLD, {
		variables: { user_id: user?.id },
		skip: !user?.id,
	})

	const hasHousehold =
		(householdData?.household_membersCollection?.edges?.length ?? 0) > 0

	return (
		<div className="p-4 space-y-6">
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
		</div>
	)
}
