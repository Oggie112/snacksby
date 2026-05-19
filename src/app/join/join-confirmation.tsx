'use client'

import { useState } from 'react'

import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import {
	ADD_HOUSEHOLD_MEMBER,
	GET_MY_HOUSEHOLD,
	GET_MY_ROLE,
} from '@/lib/graphql/households'

interface Props {
	household: { id: string; name: string }
}

export function JoinConfirmation({ household }: Props) {
	const router = useRouter()
	const { user } = useUserAndSession()
	const [error, setError] = useState<string | null>(null)

	const [addMember, { loading }] = useMutation(ADD_HOUSEHOLD_MEMBER)

	const handleJoin = async () => {
		if (!user) return
		setError(null)
		try {
			await addMember({
				variables: {
					household_id: household.id,
					user_id: user.id,
					role: 'Member',
				},
				refetchQueries: [
					{ query: GET_MY_HOUSEHOLD, variables: { user_id: user.id } },
					{ query: GET_MY_ROLE, variables: { user_id: user.id } },
				],
			})
			router.push('/')
		} catch {
			setError('Could not join — you may already be a member of a household.')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<div>
						<h1 className="text-2xl font-bold">You&apos;ve been invited</h1>
						<p className="text-base-content/60 text-sm mt-1">
							Join <strong>{household.name}</strong> on Snacksby.
						</p>
					</div>

					{error && <p className="text-error text-sm">{error}</p>}

					<button
						className="btn btn-primary w-full"
						disabled={loading}
						onClick={() => void handleJoin()}
					>
						{loading ? (
							<span className="loading loading-spinner loading-sm" />
						) : (
							`Join ${household.name}`
						)}
					</button>

					<a
						href="/auth/logout"
						className="text-sm text-center text-base-content/40 hover:text-base-content/70 transition-colors"
					>
						Not you? Sign out
					</a>
				</div>
			</div>
		</div>
	)
}
