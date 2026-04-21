export default function HomePage() {
	return (
		<div className="p-4 space-y-6">
			<h1 className="text-2xl font-bold">Good morning</h1>

			<section className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h2 className="card-title text-lg">This week&apos;s plan</h2>
					<p className="text-base-content/60">No meals planned yet.</p>
					<div className="card-actions mt-2">
						<a href="/plan" className="btn btn-sm btn-primary">
							Go to planner
						</a>
					</div>
				</div>
			</section>

			<section className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h2 className="card-title text-lg">Shopping list</h2>
					<p className="text-base-content/60">Your list is empty.</p>
					<div className="card-actions mt-2">
						<a href="/shopping-list" className="btn btn-sm btn-accent">
							View list
						</a>
					</div>
				</div>
			</section>
		</div>
	)
}
