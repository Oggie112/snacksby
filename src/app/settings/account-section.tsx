'use client'

import { useActionState, useState } from 'react'

import { updateEmail, updatePassword } from './actions'

interface Props {
	email: string
}

export function AccountSection({ email }: Props) {
	const [emailOpen, setEmailOpen] = useState(false)
	const [passwordOpen, setPasswordOpen] = useState(false)

	const [emailState, emailAction] = useActionState(updateEmail, {
		error: '',
		success: '',
	})
	const [passwordState, passwordAction] = useActionState(updatePassword, {
		error: '',
		success: '',
	})

	return (
		<section className="space-y-4">
			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-4">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="card-title text-lg">Email address</h2>
							<p className="text-base-content/60 text-sm">{email}</p>
						</div>
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setEmailOpen((o) => !o)}
						>
							{emailOpen ? 'Cancel' : 'Change'}
						</button>
					</div>

					{emailOpen && (
						<form action={emailAction} className="flex flex-col gap-3">
							<div className="form-control gap-1">
								<label htmlFor="new-email" className="label-text font-medium">
									New email
								</label>
								<input
									id="new-email"
									type="email"
									name="email"
									placeholder="new@example.com"
									className="input input-bordered w-full"
									required
								/>
							</div>
							<div className="form-control gap-1">
								<label
									htmlFor="email-password"
									className="label-text font-medium"
								>
									Current password
								</label>
								<input
									id="email-password"
									type="password"
									name="password"
									placeholder="••••••••"
									className="input input-bordered w-full"
									required
								/>
							</div>
							{emailState.error && (
								<p className="text-error text-sm">{emailState.error}</p>
							)}
							{emailState.success && (
								<p className="text-success text-sm">{emailState.success}</p>
							)}
							<button
								type="submit"
								className="btn btn-primary btn-sm self-start"
							>
								Update email
							</button>
						</form>
					)}
				</div>
			</div>

			<div className="card bg-base-100 shadow-md">
				<div className="card-body gap-4">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="card-title text-lg">Password</h2>
							<p className="text-base-content/60 text-sm">••••••••</p>
						</div>
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => setPasswordOpen((o) => !o)}
						>
							{passwordOpen ? 'Cancel' : 'Change'}
						</button>
					</div>

					{passwordOpen && (
						<form action={passwordAction} className="flex flex-col gap-3">
							<div className="form-control gap-1">
								<label
									htmlFor="currentPassword"
									className="label-text font-medium"
								>
									Current password
								</label>
								<input
									id="currentPassword"
									type="password"
									name="currentPassword"
									placeholder="••••••••"
									className="input input-bordered w-full"
									required
								/>
							</div>
							<div className="form-control gap-1">
								<label htmlFor="newPassword" className="label-text font-medium">
									New password
								</label>
								<input
									id="newPassword"
									type="password"
									name="newPassword"
									placeholder="••••••••"
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
									className="input input-bordered w-full"
									required
								/>
							</div>
							{passwordState.error && (
								<p className="text-error text-sm">{passwordState.error}</p>
							)}
							{passwordState.success && (
								<p className="text-success text-sm">{passwordState.success}</p>
							)}
							<button
								type="submit"
								className="btn btn-primary btn-sm self-start"
							>
								Update password
							</button>
						</form>
					)}
				</div>
			</div>
		</section>
	)
}
