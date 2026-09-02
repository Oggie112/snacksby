import { serverClient } from './server'

export async function getUserAndSession() {
	const supabase = await serverClient()

	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()
	if (error || !user) return { user: null }

	return { user }
}
