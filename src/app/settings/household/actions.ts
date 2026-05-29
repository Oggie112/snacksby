'use server'

import { revalidatePath } from 'next/cache'

import { serverClient } from '@/lib/supabase/server'

export async function resetInviteCode(householdId: string): Promise<void> {
	const supabase = await serverClient()
	const { error } = await supabase.rpc('reset_invite_code', {
		p_household_id: householdId,
	})
	if (error) throw new Error(error.message)
	revalidatePath('/settings')
}
