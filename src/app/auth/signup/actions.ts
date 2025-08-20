'use server'

import { serverClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

/**
 * Handles user signup by registering a new user with Supabase.
 * Performs basic validation on email, password, and display name.
 * @param _prevState - The previous state, containing error information.
 * @param formData - The form data submitted by the user, expected to contain 'email', 'password', 'confirmPassword', and 'displayName' fields.
 */
export async function signUpUser(_prevState: { error: string }, formData: FormData) {
  const email = (formData.get('email') as string).trim()
  const password = (formData.get('password') as string).trim()
  const confirmPassword = (formData.get('confirmPassword') as string).trim()
  const displayName = (formData.get('displayName') as string).trim()

  if (!email || !password || !confirmPassword || !displayName) {
    return {error: 'All fields are required'}
  }

  if (password !== confirmPassword) {
    return {error: 'Passwords do not match'}
  }

  if (password.length < 8) {
    return {error: 'Password must be at least 8 characters long'}
  }

  const supabase = await serverClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { displayName },
    },
  })

  if (error) {
    return {error: error.message, resetPasswords: true}
    } else {
        redirect('/auth/login')
    }
}