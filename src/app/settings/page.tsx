import { AccountSection } from './account-section'
import { getUserAndSession } from '@/lib/supabase/session'

export default async function SettingsPage() {
	const { user } = await getUserAndSession()

	return (
		<div className="p-4 space-y-6">
			<h1 className="text-2xl font-bold">Settings</h1>
			<AccountSection email={user?.email ?? ''} />
			<section className="card bg-base-100 shadow-md">
				<div className="card-body">
					<h2 className="card-title text-lg">Household</h2>
					<p className="text-base-content/60">
						Household management and invite code coming soon.
					</p>
				</div>
			</section>
		</div>
	)
}
