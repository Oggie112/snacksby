'use client'

import { useState, type SubmitEvent } from 'react'

import { useMutation } from '@apollo/client/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useUserAndSession } from '@/components/session-provider'
import {
	CREATE_HOUSEHOLD,
	GET_MY_HOUSEHOLD,
	type CreateHouseholdResult,
} from '@/lib/graphql/households'

export default function NewHouseholdPage() {
	const router = useRouter()
	const { user } = useUserAndSession()
	const [name, setName] = useState('')
	const [createHousehold, { loading, error }] =
		useMutation<CreateHouseholdResult>(CREATE_HOUSEHOLD)
	const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (!user) return

		const invite_code = crypto
			.randomUUID()
			.replace(/-/g, '')
			.slice(0, 8)
			.toUpperCase()

		const result = await createHousehold({
			variables: { name: name.trim(), invite_code },
			refetchQueries: [
				{ query: GET_MY_HOUSEHOLD, variables: { user_id: user.id } },
			],
		})

		if (result.data?.insertIntohouseholdsCollection?.records[0]?.id) {
			router.push('/')
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<div>
						<h1 className="text-2xl font-bold">Create a household</h1>
						<p className="text-base-content/60 text-sm mt-1">
							Give your household a name — just yours, a partner&apos;s, or your
							whole family&apos;s.
						</p>
					</div>

					<form
						onSubmit={(e) => void handleSubmit(e)}
						className="flex flex-col gap-4"
					>
						<div className="form-control gap-1">
							<label htmlFor="name" className="label-text font-medium">
								Household name
							</label>
							<input
								id="name"
								type="text"
								placeholder="The Ogdens"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="input input-bordered w-full"
								required
							/>
						</div>

						{error && <p className="text-error text-sm">{error.message}</p>}

						<button
							type="submit"
							disabled={loading || !name.trim()}
							className="btn btn-primary w-full mt-2"
						>
							{loading ? (
								<span className="loading loading-spinner loading-sm" />
							) : (
								'Create household'
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
