'use client'

import { useState, useActionState, useEffect } from 'react'

import Link from 'next/link'

import { signUpUser } from './actions'

export default function SignupPage() {
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordError, setPasswordError] = useState<string | null>(null)
	const [actionState, action] = useActionState(signUpUser, {
		error: '',
		resetPasswords: false,
	})

	useEffect(() => {
		if (actionState.resetPasswords) {
			setPassword('')
			setConfirmPassword('')
		}
	}, [actionState.resetPasswords])

	const validatePassword = () => {
		if (password.length > 0 && password.length < 8) {
			setPasswordError('Password must be at least 8 characters long')
		} else if (password !== confirmPassword && confirmPassword.length > 0) {
			setPasswordError('Passwords do not match')
		} else {
			setPasswordError(null)
			return true
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<h1 className="text-3xl font-bold text-primary text-center">
						Snacksby
					</h1>
					<p className="text-base-content/60 text-sm text-center -mt-4">
						Create your account
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

						<div className="form-control gap-1">
							<label htmlFor="displayName" className="label-text font-medium">
								Display name
							</label>
							<input
								id="displayName"
								type="text"
								name="displayName"
								placeholder="Your name"
								className="input input-bordered w-full"
								required
							/>
						</div>

						<div className="form-control gap-1">
							<label htmlFor="password" className="label-text font-medium">
								Password
							</label>
							<input
								id="password"
								type="password"
								name="password"
								placeholder="••••••••"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onBlur={validatePassword}
								className="input input-bordered w-full"
								required
							/>
						</div>

						<div className="form-control gap-1">
							<label
								htmlFor="confirmPassword"
								className="label-text font-medium"
							>
								Confirm password
							</label>
							<input
								id="confirmPassword"
								type="password"
								name="confirmPassword"
								placeholder="••••••••"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								onBlur={validatePassword}
								className="input input-bordered w-full"
								required
							/>
						</div>

						{passwordError && (
							<p className="text-error text-sm">{passwordError}</p>
						)}
						{actionState.error && (
							<p className="text-error text-sm">{actionState.error}</p>
						)}

						<button
							type="submit"
							disabled={!validatePassword}
							className="btn btn-primary w-full mt-2"
						>
							Create account
						</button>
					</form>

					<p className="text-center text-sm text-base-content/60">
						Already have an account?{' '}
						<Link
							href="/auth/login"
							className="text-primary font-medium hover:underline"
						>
							Log in
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
