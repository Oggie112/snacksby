'use client'

import { useActionState, useEffect, useState } from 'react'

import Link from 'next/link'

import { login } from './actions'

export default function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [actionState, action] = useActionState(login, {
		error: '',
		resetFields: false,
	})

	useEffect(() => {
		if (actionState.resetFields) {
			setEmail('')
			setPassword('')
		}
	}, [actionState.resetFields])

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<h1 className="text-3xl font-bold text-primary text-center">
						Snacksby
					</h1>
					<p className="text-base-content/60 text-sm text-center -mt-4">
						Welcome back
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
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
								className="input input-bordered w-full"
								required
							/>
						</div>

						{actionState.error && (
							<p className="text-error text-sm">{actionState.error}</p>
						)}

						<button type="submit" className="btn btn-primary w-full mt-2">
							Log in
						</button>
					</form>

					<p className="text-center text-sm text-base-content/60">
						No account?{' '}
						<Link
							href="/auth/signup"
							className="text-primary font-medium hover:underline"
						>
							Sign up
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
