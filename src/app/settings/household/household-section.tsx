'use client'

import { useState } from 'react'

import { useQuery } from '@apollo/client/react'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_HOUSEHOLD_SETTINGS,
	type HouseholdSettingsData,
} from '@/lib/graphql/households'

const ROLE_BADGE: Record<string, string> = {
	Leader: 'badge-warning',
	Contributor: 'badge-secondary',
	Member: 'badge-ghost',
}

export function HouseholdSection() {
	const { user } = useUserAndSession()
	const [copied, setCopied] = useState(false)

	const { data, loading, error } = useQuery<HouseholdSettingsData>(
		GET_HOUSEHOLD_SETTINGS,
		{
			variables: { user_id: user?.id },
			skip: !user?.id,
		},
	)

	const household =
		data?.household_membersCollection?.edges?.[0]?.node?.households
	const members = household?.household_membersCollection?.edges ?? []
	const handleCopy = async () => {
		if (!household?.invite_code) return
		await navigator.clipboard.writeText(household.invite_code)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	if (loading) {
		return (
			<section className="card bg-base-100 shadow-md">
				<div className="card-body items-center">
					<span className="loading loading-spinner loading-sm" />
				</div>
			</section>
		)
	}

	if (error || !household) {
		return (
			<section className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h2 className="card-title text-lg">Household</h2>
					<p className="text-error text-sm">
						{error?.message ?? 'Could not load household data.'}
					</p>
				</div>
			</section>
		)
	}

	return (
		<section className="space-y-4">
			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-4">
					<h2 className="card-title text-lg">{household.name}</h2>
					<div>
						<p className="label-text font-medium mb-2">Invite code</p>
						<div className="flex items-center gap-3">
							<span className="font-mono tracking-widest text-lg">
								{household.invite_code}
							</span>
							<button
								className="btn btn-sm btn-ghost"
								onClick={() => void handleCopy()}
							>
								{copied ? 'Copied!' : 'Copy'}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-3">
					<h2 className="card-title text-lg">Members</h2>
					<ul className="space-y-2">
						{members.map(({ node }) => (
							<li
								key={node.user_id}
								className="flex items-center justify-between"
							>
								<span className="text-sm">
									{node.profiles?.full_name ?? 'Unknown'}
									{node.user_id === user?.id && (
										<span className="text-base-content/40 ml-1">(you)</span>
									)}
								</span>
								<span
									className={`badge ${ROLE_BADGE[node.role] ?? 'badge-ghost'} badge-sm`}
								>
									{node.role}
								</span>
							</li>
						))}
					</ul>
				</div>
			</div>
		</section>
	)
}
