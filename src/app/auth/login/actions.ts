'use server'

import { redirect } from 'next/navigation'

import { serverClient } from '@/lib/supabase/server'

/**
 * Handles user login by authenticating with Supabase.
 * @param _prevState - The previous state, containing error information and a flag to reset form fields.
 * @param formData - The form data submitted by the user, expected to contain 'email' and 'password' fields.
 */
export async function login(
  _prevState: { error: string; resetFields: boolean },
  formData: FormData,
) {
  const email = (formData.get('email') as string) ?? ''
  const password = (formData.get('password') as string) ?? ''

  const supabase = await serverClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message, resetFields: true }
  } else {
    redirect('/')
  }
}
