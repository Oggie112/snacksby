'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { serverClient } from '@/lib/supabase/server'

/**
 * Handles user logout by signing out from Supabase.
 * On successful logout, it revalidates the path and redirects to the home page.
 * @throws {Error} If the logout process fails.
 */
export async function logout() {
  const supabase = await serverClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error('Logout failed: ' + error.message)
  } else {
    revalidatePath('/')
    redirect('/')
  }
}
