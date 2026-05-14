'use client'

import Link from 'next/link'

export default function OfflinePage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
			<div className="card bg-base-100 shadow-sm max-w-sm w-full p-8 flex flex-col items-center gap-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={1.5}
					stroke="currentColor"
					className="w-12 h-12 text-base-content/40"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M3 3l18 18M8.111 8.111A6.003 6.003 0 0 0 6.343 9.9M15.89 15.89A6.003 6.003 0 0 0 17.657 9.9m-2.121-2.121A6.003 6.003 0 0 0 12 7a6.003 6.003 0 0 0-3.536 1.779M12 17v.01M12 12a3 3 0 0 1 3 3"
					/>
				</svg>

				<div className="flex flex-col gap-1">
					<h1 className="text-xl font-semibold">You&apos;re offline</h1>
					<p className="text-base-content/60 text-sm">
						This page isn&apos;t available without a connection.
					</p>
					<p className="text-base-content/60 text-sm">
						Pages you&apos;ve visited recently may still be available.
					</p>
				</div>

				<div className="flex gap-3 mt-2">
					<button
						className="btn btn-primary btn-sm"
						onClick={() => window.location.reload()}
					>
						Try again
					</button>
					<Link href="/" className="btn btn-ghost btn-sm">
						Go home
					</Link>
				</div>
			</div>
		</div>
	)
}
