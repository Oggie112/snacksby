'use client'

import { useState } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import {
	GET_HOUSEHOLD_SETTINGS,
	GET_MY_HOUSEHOLD,
	GET_MY_ROLE,
	REMOVE_HOUSEHOLD_MEMBER,
	type HouseholdSettingsData,
	type RemoveHouseholdMemberResult,
} from '@/lib/graphql/households'

const ROLE_BADGE: Record<string, string> = {
	Leader: 'badge-warning',
	Contributor: 'badge-secondary',
	Member: 'badge-ghost',
}

const LEAVE_KEY = '__leave__'

export function HouseholdSection() {
	const { user } = useUserAndSession()
	const router = useRouter()
	const [copied, setCopied] = useState(false)
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [leaveError, setLeaveError] = useState<string | null>(null)

	const { data, loading, error, refetch } = useQuery<HouseholdSettingsData>(
		GET_HOUSEHOLD_SETTINGS,
		{
			variables: { user_id: user?.id },
			skip: !user?.id,
		},
	)

	const [removeMember, { loading: removing }] =
		useMutation<RemoveHouseholdMemberResult>(REMOVE_HOUSEHOLD_MEMBER)

	const membership = data?.household_membersCollection?.edges?.[0]?.node
	const household = membership?.households
	const members = household?.household_membersCollection?.edges ?? []
	const currentUserRole = membership?.role

	const handleCopy = async () => {
		if (!household?.invite_code) return
		await navigator.clipboard.writeText(household.invite_code)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const handleRemove = async (targetUserId: string) => {
		if (!household?.id) return
		await removeMember({
			variables: { household_id: household.id, user_id: targetUserId },
		})
		setConfirmingId(null)
		await refetch()
	}

	const handleLeaveClick = () => {
		setLeaveError(null)
		const leaderCount = members.filter((m) => m.node.role === 'Leader').length
		if (currentUserRole === 'Leader' && leaderCount === 1) {
			setLeaveError(
				"You're the only Leader — promote another member before leaving.",
			)
			return
		}
		setConfirmingId(LEAVE_KEY)
	}

	const handleLeaveConfirm = async () => {
		if (!user?.id || !household?.id) return
		await removeMember({
			variables: { household_id: household.id, user_id: user.id },
			refetchQueries: [
				{ query: GET_MY_HOUSEHOLD, variables: { user_id: user.id } },
				{ query: GET_MY_ROLE, variables: { user_id: user.id } },
			],
		})
		router.push('/households/setup')
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

	if (error) {
		return (
			<section className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h2 className="card-title text-lg">Household</h2>
					<p className="text-error text-sm">{error.message}</p>
				</div>
			</section>
		)
	}

	if (!household) {
		return (
			<section className="card bg-base-100 shadow-md">
				<div className="card-body gap-3">
					<h2 className="card-title text-lg">Household</h2>
					<p className="text-base-content/60 text-sm">
						You need to create or join a household to see anything here.
					</p>
					<a
						href="/households/setup"
						className="btn btn-primary btn-sm self-start"
					>
						Create or join a household
					</a>
				</div>
			</section>
		)
	}

	return (
		<section className="space-y-4">
			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-4">
					<h2 className="card-title text-lg">{household.name}</h2>
					{currentUserRole === 'Leader' && (
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
					)}
				</div>
			</div>

			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-3">
					<h2 className="card-title text-lg">Members</h2>
					<ul className="space-y-3">
						{members.map(({ node }) => (
							<li
								key={node.user_id}
								className="flex items-center justify-between gap-2"
							>
								<span className="text-sm">
									{node.profiles?.full_name ?? 'Unknown'}
									{node.user_id === user?.id && (
										<span className="text-base-content/40 ml-1">(you)</span>
									)}
								</span>
								<div className="flex items-center gap-2">
									<span
										className={`badge ${ROLE_BADGE[node.role] ?? 'badge-ghost'} badge-sm`}
									>
										{node.role}
									</span>
									{currentUserRole === 'Leader' &&
										node.user_id !== user?.id &&
										(confirmingId === node.user_id ? (
											<>
												<button
													className="btn btn-xs btn-error"
													disabled={removing}
													onClick={() => void handleRemove(node.user_id)}
												>
													Confirm
												</button>
												<button
													className="btn btn-xs btn-ghost"
													onClick={() => setConfirmingId(null)}
												>
													Cancel
												</button>
											</>
										) : (
											<button
												className="btn btn-xs btn-ghost text-error"
												onClick={() => setConfirmingId(node.user_id)}
											>
												Remove
											</button>
										))}
								</div>
							</li>
						))}
					</ul>

					<div className="divider my-1" />

					{leaveError && <p className="text-error text-sm">{leaveError}</p>}

					{confirmingId === LEAVE_KEY ? (
						<div className="flex items-center gap-2">
							<span className="text-sm text-base-content/60 flex-1">
								Leave this household?
							</span>
							<button
								className="btn btn-sm btn-error"
								disabled={removing}
								onClick={() => void handleLeaveConfirm()}
							>
								Confirm
							</button>
							<button
								className="btn btn-sm btn-ghost"
								onClick={() => setConfirmingId(null)}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							className="btn btn-sm btn-outline btn-error self-start"
							onClick={handleLeaveClick}
						>
							Leave household
						</button>
					)}
				</div>
			</div>
		</section>
	)
}
