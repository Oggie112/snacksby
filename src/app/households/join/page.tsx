'use client'

import { useState, Suspense, type SubmitEvent } from 'react'

import { useLazyQuery, useMutation } from '@apollo/client/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import {
	ADD_HOUSEHOLD_MEMBER,
	GET_HOUSEHOLD_BY_CODE,
	GET_MY_HOUSEHOLD,
	type AddHouseholdMemberResult,
	type HouseholdByCodeData,
} from '@/lib/graphql/households'

function JoinForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { user } = useUserAndSession()
	const [code, setCode] = useState(searchParams.get('code') ?? '')
	const [error, setError] = useState<string | null>(null)

	const [findHousehold, { loading: searching }] =
		useLazyQuery<HouseholdByCodeData>(GET_HOUSEHOLD_BY_CODE, {
			fetchPolicy: 'network-only',
		})
	const [addMember, { loading: joining }] =
		useMutation<AddHouseholdMemberResult>(ADD_HOUSEHOLD_MEMBER)

	const loading = searching || joining

	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!user) return
		setError(null)

		const result = await findHousehold({
			variables: { invite_code: code.trim().toUpperCase() },
		})

		const household = result.data?.householdsCollection?.edges?.[0]?.node
		if (!household) {
			setError(
				'No household found with that code. Check the code and try again.',
			)
			return
		}
		try {
			await addMember({
				variables: {
					household_id: household.id,
					user_id: user.id,
					role: 'Member',
				},
				refetchQueries: [
					{ query: GET_MY_HOUSEHOLD, variables: { user_id: user.id } },
				],
			})
			router.push('/')
		} catch {
			setError('Failed to join household. You may already be a member.')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<div>
						<h1 className="text-2xl font-bold">Join a household</h1>
						<p className="text-base-content/60 text-sm mt-1">
							Enter the invite code from whoever set up your household.
						</p>
					</div>

					<form
						onSubmit={(e) => void handleSubmit(e)}
						className="flex flex-col gap-4"
					>
						<div className="form-control gap-1">
							<label htmlFor="code" className="label-text font-medium">
								Invite code
							</label>
							<input
								id="code"
								type="text"
								placeholder="ABC12345"
								value={code}
								onChange={(e) => setCode(e.target.value.toUpperCase())}
								className="input input-bordered w-full font-mono tracking-widest"
								maxLength={8}
								required
							/>
						</div>

						{error && <p className="text-error text-sm">{error}</p>}

						<button
							type="submit"
							disabled={loading || code.trim().length < 6}
							className="btn btn-primary w-full mt-2"
						>
							{loading ? (
								<span className="loading loading-spinner loading-sm" />
							) : (
								'Join household'
							)}
						</button>
					</form>

					<Link
						href="/households/setup"
						className="text-sm text-center text-base-content/40 hover:text-base-content/70 transition-colors"
					>
						← Back
					</Link>
				</div>
			</div>
		</div>
	)
}

export default function JoinHouseholdPage() {
	return (
		<Suspense>
			<JoinForm />
		</Suspense>
	)
}
