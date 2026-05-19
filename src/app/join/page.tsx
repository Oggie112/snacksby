import Link from 'next/link'

import { storeInviteAndRedirect } from './actions'
import { JoinConfirmation } from './join-confirmation'
import { adminClient } from '@/lib/supabase/admin'
import { serverClient } from '@/lib/supabase/server'

interface Props {
	searchParams: Promise<{ code?: string }>
}

export default async function JoinPage({ searchParams }: Props) {
	const { code } = await searchParams

	if (!code) {
		return <InvalidInvite message="No invite code provided." />
	}

	const { data: household } = await adminClient()
		.from('households')
		.select('id, name')
		.eq('invite_code', code.toUpperCase())
		.single()

	if (!household) {
		return (
			<InvalidInvite message="This invite link is invalid or has been reset." />
		)
	}

	const supabase = await serverClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (user) {
		return <JoinConfirmation household={household} />
	}

	const boundAction = storeInviteAndRedirect.bind(null, code)

	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-6">
					<div>
						<h1 className="text-2xl font-bold">You&apos;ve been invited</h1>
						<p className="text-base-content/60 text-sm mt-1">
							Join <strong>{household.name}</strong> on Snacksby.
						</p>
					</div>
					<div className="flex flex-col gap-3">
						<form action={boundAction}>
							<input type="hidden" name="destination" value="/auth/signup" />
							<button type="submit" className="btn btn-primary w-full">
								Create an account
							</button>
						</form>
						<form action={boundAction}>
							<input type="hidden" name="destination" value="/auth/login" />
							<button type="submit" className="btn btn-outline w-full">
								Sign in
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	)
}

function InvalidInvite({ message }: { message: string }) {
	return (
		<div className="min-h-screen flex items-center justify-center bg-neutral px-4">
			<div className="card bg-base-100 shadow-lg w-full max-w-sm">
				<div className="card-body gap-4">
					<h1 className="text-2xl font-bold">Invalid invite</h1>
					<p className="text-base-content/60 text-sm">{message}</p>
					<Link href="/" className="btn btn-ghost btn-sm self-start">
						Go home
					</Link>
				</div>
			</div>
		</div>
	)
}
