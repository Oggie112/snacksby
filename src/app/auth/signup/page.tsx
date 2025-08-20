'use client'

import { useState, useActionState, useEffect } from 'react'

import { signUpUser } from './actions'

export default function SignupPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [actionState, action] = useActionState(signUpUser, {
    error: '',
    resetPasswords: false,
  })

  useEffect(() => {
    if (actionState.resetPasswords) {
      setPassword('')
      setConfirmPassword('')
    }
  }, [actionState.resetPasswords])

  /**
   * Validates the password and confirm password fields.
   * Sets `passwordError` based on validation rules (length, match).
   * This function is called on blur of password fields and also determines the submit button's disabled state.
   * @returns {boolean} True if passwords are valid, false otherwise.
   */
  const validatePassword = () => {
    if (password.length > 0 && password.length < 8) {
      setPasswordError('Password must be at least 8 characters long')
    } else if (password !== confirmPassword && confirmPassword.length > 0) {
      setPasswordError('Passwords do not match')
    } else {
      setPasswordError(null)
      return true
    }
  }

  return (
    <div>
      <h1>Sign Up</h1>
      <form action={action}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <label htmlFor="displayName">Display Name</label>
        <input
          id="displayName"
          type="text"
          placeholder="Display Name"
          name="displayName"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={validatePassword}
          required
        />
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={validatePassword}
          required
        />
        <button type="submit" disabled={!validatePassword}>
          Sign Up
        </button>
      </form>
      {passwordError && <p className="error">{passwordError}</p>}
      {actionState.error && <p className="error">{actionState.error}</p>}
    </div>
  )
}
