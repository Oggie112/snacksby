import { AccountSection } from './account/account-section'
import { HouseholdSection } from './household/household-section'
import { logout } from '@/app/auth/logout/actions'
import { getUserAndSession } from '@/lib/supabase/session'

export default async function SettingsPage() {
	const { user } = await getUserAndSession()

	return (
		<div className="p-4 space-y-8 max-w-2xl mx-auto">
			<h1 className="text-2xl font-bold">Settings</h1>
			<div className="space-y-4">
				<h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
					Account
				</h2>
				<AccountSection email={user?.email ?? ''} />
			</div>
			<div className="space-y-4">
				<h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40">
					Household
				</h2>
				<HouseholdSection />
			</div>
			<form action={logout}>
				<button type="submit" className="btn btn-error btn-outline w-full">
					Sign out
				</button>
			</form>
		</div>
	)
}
