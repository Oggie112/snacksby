'use client'

import { useActionState, useState } from 'react'

import { resetPassword } from './actions'

export default function ResetPasswordPage() {
	const [password, setPassword] = useState('')
	const [confirm, setConfirm] = useState('')
	const [state, action] = useActionState(resetPassword, { error: '' })

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<h1 className="text-3xl font-bold text-primary text-center">
						Snacksby
					</h1>
					<p className="text-base-content/60 text-sm text-center -mt-4">
						Choose a new password
					</p>

					<form action={action} className="flex flex-col gap-4">
						<div className="form-control gap-1">
							<label htmlFor="password" className="label-text font-medium">
								New password
							</label>
							<input
								id="password"
								type="password"
								name="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="input input-bordered w-full"
								required
							/>
						</div>

						<div className="form-control gap-1">
							<label
								htmlFor="confirmPassword"
								className="label-text font-medium"
							>
								Confirm new password
							</label>
							<input
								id="confirmPassword"
								type="password"
								name="confirmPassword"
								placeholder="••••••••"
								value={confirm}
								onChange={(e) => setConfirm(e.target.value)}
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
							Set new password
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
