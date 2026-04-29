import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Set up your household' }

export default function HouseholdSetupPage() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6 text-center">
					<div>
						<h1 className="text-2xl font-bold">Your household</h1>
						<p className="text-base-content/60 text-sm mt-1">
							Create a household to share meal plans and recipes, or join one
							you&apos;ve been invited to.
						</p>
					</div>

					<div className="flex flex-col gap-3">
						<Link href="/households/new" className="btn btn-primary w-full">
							Create a household
						</Link>
						<Link href="/households/join" className="btn btn-outline w-full">
							Join with a code
						</Link>
					</div>

					<Link
						href="/"
						className="text-sm text-base-content/40 hover:text-base-content/70 transition-colors"
					>
						Skip for now
					</Link>
				</div>
			</div>
		</div>
	)
}
