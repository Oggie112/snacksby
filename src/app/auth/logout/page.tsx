'use client'

import Link from 'next/link'

import { logout } from './actions'

export default function LogoutPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6 text-center">
					<h1 className="text-2xl font-bold">Log out</h1>
					<p className="text-base-content/60 text-sm -mt-4">
						Are you sure you want to log out?
					</p>

					<div className="flex flex-col gap-3">
						<button
							onClick={() => void logout()}
							className="btn btn-error w-full"
						>
							Log out
						</button>
						<Link href="/" className="btn btn-ghost w-full">
							Cancel
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
