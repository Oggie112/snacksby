'use client'

import { useState } from 'react'

import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/navigation'

import { resetInviteCode } from './actions'
import { useUserAndSession } from '@/components/session-provider'
import {
	GET_HOUSEHOLD_SETTINGS,
	GET_MY_HOUSEHOLD,
	GET_MY_ROLE,
	REMOVE_HOUSEHOLD_MEMBER,
	UPDATE_HOUSEHOLD_MEMBER_ROLE,
	UPDATE_HOUSEHOLD_NAME,
	type HouseholdSettingsData,
	type RemoveHouseholdMemberResult,
	type UpdateHouseholdMemberRoleResult,
	type UpdateHouseholdNameResult,
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
	const [shared, setShared] = useState(false)
	const [regenerating, setRegenerating] = useState(false)
	const [confirmRegenerate, setConfirmRegenerate] = useState(false)
	const [confirmingId, setConfirmingId] = useState<string | null>(null)
	const [leaveError, setLeaveError] = useState<string | null>(null)
	const [changingRoleId, setChangingRoleId] = useState<string | null>(null)
	const [removingMemberId, setRemovingMemberId] = useState<string | null>(null)
	const [editingName, setEditingName] = useState(false)
	const [nameInput, setNameInput] = useState('')
	const [nameError, setNameError] = useState<string | null>(null)

	const { data, loading, error, refetch } = useQuery<HouseholdSettingsData>(
		GET_HOUSEHOLD_SETTINGS,
		{
			variables: { user_id: user?.id },
			skip: !user?.id,
		},
	)

	const [removeMember, { loading: removing }] =
		useMutation<RemoveHouseholdMemberResult>(REMOVE_HOUSEHOLD_MEMBER)

	const [updateMemberRole] = useMutation<UpdateHouseholdMemberRoleResult>(
		UPDATE_HOUSEHOLD_MEMBER_ROLE,
	)

	const [updateHouseholdName, { loading: savingName }] =
		useMutation<UpdateHouseholdNameResult>(UPDATE_HOUSEHOLD_NAME)

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

	const handleShare = async () => {
		if (!household?.invite_code) return
		const url = `${window.location.origin}/join?code=${household.invite_code}`
		const shareData = { title: 'Join my household on Snacksby', url }
		if (navigator.canShare?.(shareData)) {
			await navigator.share(shareData)
		} else {
			await navigator.clipboard.writeText(url)
			setShared(true)
			setTimeout(() => setShared(false), 2000)
		}
	}

	const handleRegenerate = async () => {
		if (!household?.id) return
		setRegenerating(true)
		setConfirmRegenerate(false)
		try {
			await resetInviteCode(household.id)
			await refetch()
		} finally {
			setRegenerating(false)
		}
	}

	const handleRoleChange = async (targetUserId: string, newRole: string) => {
		if (!household?.id) return
		setChangingRoleId(targetUserId)
		await updateMemberRole({
			variables: {
				household_id: household.id,
				user_id: targetUserId,
				role: newRole,
			},
		})
		setChangingRoleId(null)
		;(document.activeElement as HTMLElement)?.blur()
		await refetch()
	}

	const handleRemove = async () => {
		if (!household?.id || !removingMemberId) return
		await removeMember({
			variables: { household_id: household.id, user_id: removingMemberId },
		})
		setRemovingMemberId(null)
		await refetch()
	}

	const handleEditNameOpen = () => {
		setNameInput(household?.name ?? '')
		setNameError(null)
		setEditingName(true)
	}

	const handleSaveName = async () => {
		const trimmed = nameInput.trim()
		if (!trimmed) {
			setNameError('Name cannot be empty.')
			return
		}
		if (!household?.id) return
		setNameError(null)
		try {
			await updateHouseholdName({
				variables: { id: household.id, name: trimmed },
			})
			setEditingName(false)
			await refetch()
		} catch {
			setNameError('Failed to save. Please try again.')
		}
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
		<>
			<section className="space-y-4">
				<div className="card bg-base-100 shadow-md">
					<div className="card-body gap-4">
						{editingName ? (
							<div className="flex flex-col gap-2">
								<input
									className="input input-bordered input-sm w-full max-w-xs text-base font-semibold"
									value={nameInput}
									onChange={(e) => setNameInput(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') void handleSaveName()
										if (e.key === 'Escape') setEditingName(false)
									}}
									autoFocus
									maxLength={80}
								/>
								{nameError && <p className="text-error text-xs">{nameError}</p>}
								<div className="flex gap-2">
									<button
										className="btn btn-sm btn-primary"
										disabled={savingName}
										onClick={() => void handleSaveName()}
									>
										{savingName ? (
											<span className="loading loading-spinner loading-xs" />
										) : (
											'Save'
										)}
									</button>
									<button
										className="btn btn-sm btn-ghost"
										disabled={savingName}
										onClick={() => setEditingName(false)}
									>
										Cancel
									</button>
								</div>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<h2 className="card-title text-lg">{household.name}</h2>
								{currentUserRole === 'Leader' && (
									<button
										className="btn btn-xs btn-ghost btn-circle"
										onClick={handleEditNameOpen}
										title="Rename household"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="size-3.5"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
											/>
										</svg>
									</button>
								)}
							</div>
						)}
						{(currentUserRole === 'Leader' ||
							currentUserRole === 'Contributor') && (
							<div className="flex flex-col gap-3">
								<p className="label-text font-medium">Invite</p>
								<button
									className="btn btn-sm btn-primary self-start"
									onClick={() => void handleShare()}
								>
									{shared ? 'Link copied!' : 'Share invite link'}
								</button>
								{currentUserRole === 'Leader' && (
									<div>
										<p className="label-text mb-2">Invite code</p>
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
										{confirmRegenerate ? (
											<div className="flex items-center gap-2 mt-3">
												<span className="text-sm text-base-content/60 flex-1">
													This invalidates all existing invite links.
												</span>
												<button
													className="btn btn-sm btn-error"
													disabled={regenerating}
													onClick={() => void handleRegenerate()}
												>
													{regenerating ? (
														<span className="loading loading-spinner loading-xs" />
													) : (
														'Confirm'
													)}
												</button>
												<button
													className="btn btn-sm btn-ghost"
													onClick={() => setConfirmRegenerate(false)}
												>
													Cancel
												</button>
											</div>
										) : (
											<button
												className="btn btn-sm btn-ghost btn-error mt-3"
												onClick={() => setConfirmRegenerate(true)}
											>
												Regenerate code
											</button>
										)}
									</div>
								)}
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
										{currentUserRole === 'Leader' &&
										node.user_id !== user?.id &&
										node.role !== 'Leader' ? (
											<div className="dropdown dropdown-end">
												<div
													tabIndex={0}
													role="button"
													className={`badge ${ROLE_BADGE[node.role] ?? 'badge-ghost'} badge-sm cursor-pointer`}
												>
													{changingRoleId === node.user_id ? (
														<span className="loading loading-spinner loading-xs" />
													) : (
														node.role
													)}
												</div>
												<div
													tabIndex={0}
													className="dropdown-content flex flex-col gap-1 p-2 shadow-md bg-base-100 rounded-box z-10"
												>
													{(['Leader', 'Contributor', 'Member'] as const).map(
														(r) => (
															<button
																key={r}
																disabled={
																	node.role === r ||
																	changingRoleId === node.user_id
																}
																onClick={() =>
																	void handleRoleChange(node.user_id, r)
																}
																className={`badge ${ROLE_BADGE[r]} badge-sm w-full cursor-pointer hover:opacity-80 disabled:opacity-40 disabled:cursor-default`}
															>
																{r}
															</button>
														),
													)}
													<div className="divider my-0" />
													<button
														className="badge badge-error badge-sm w-full cursor-pointer hover:opacity-80"
														onClick={() => {
															setRemovingMemberId(node.user_id)
															;(document.activeElement as HTMLElement)?.blur()
														}}
													>
														Remove
													</button>
												</div>
											</div>
										) : (
											<span
												className={`badge ${ROLE_BADGE[node.role] ?? 'badge-ghost'} badge-sm`}
											>
												{node.role}
											</span>
										)}
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
			{removingMemberId && (
				<div className="modal modal-open">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Remove member?</h3>
						<p className="py-4 text-base-content/70">
							They&apos;ll need a new invite code to rejoin.
						</p>
						<div className="modal-action">
							<button
								className="btn btn-ghost"
								onClick={() => setRemovingMemberId(null)}
							>
								Cancel
							</button>
							<button
								className="btn btn-error"
								disabled={removing}
								onClick={() => void handleRemove()}
							>
								{removing ? (
									<span className="loading loading-spinner loading-sm" />
								) : (
									'Remove'
								)}
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => setRemovingMemberId(null)}
					/>
				</div>
			)}
		</>
	)
}
