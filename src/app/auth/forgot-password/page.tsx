'use client'

import { useActionState } from 'react'

import Link from 'next/link'

import { requestPasswordReset } from './actions'

export default function ForgotPasswordPage() {
	const [state, action] = useActionState(requestPasswordReset, {
		error: '',
		sent: false,
	})

	if (state.sent) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
				<div className="card bg-base-100 shadow-lg w-full max-w-sm">
					<div className="card-body gap-6 text-center">
						<h1 className="text-3xl font-bold text-primary">Snacksby</h1>
						<p className="text-base-content/60 text-sm -mt-4">
							Check your email
						</p>
						<p className="text-sm text-base-content">
							If an account exists for that address, we&apos;ve sent a reset
							link. It may take a minute to arrive.
						</p>
						<Link href="/auth/login" className="btn btn-ghost btn-sm">
							Back to login
						</Link>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<h1 className="text-3xl font-bold text-primary text-center">
						Snacksby
					</h1>
					<p className="text-base-content/60 text-sm text-center -mt-4">
						Reset your password
					</p>

					<form action={action} className="flex flex-col gap-4">
						<div className="form-control gap-1">
							<label htmlFor="email" className="label-text font-medium">
								Email
							</label>
							<input
								id="email"
								type="email"
								name="email"
								placeholder="you@example.com"
								className="input input-bordered w-full"
								required
							/>
						</div>

						{state.error && (
							<p role="alert" className="text-error text-sm">
								{state.error}
							</p>
						)}

						<button type="submit" className="btn btn-primary w-full mt-2">
							Send reset link
						</button>
					</form>

					<p className="text-center text-sm text-base-content/60">
						<Link
							href="/auth/login"
							className="text-primary font-medium hover:underline"
						>
							Back to login
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
