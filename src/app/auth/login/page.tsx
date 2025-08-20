'use client'

import { login } from './actions'

import { useActionState, useEffect, useState } from 'react'

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [actionState, action] = useActionState(login, {error: '', resetFields: false})

  useEffect(() => {
    if (actionState.resetFields) {
      setEmail('')
      setPassword('')
    }
  }, [actionState.resetFields])
  
  return (
    <div>
      <h1>Login</h1>
      <form action={action}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name='email'
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name='password'
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {actionState.error && (
        <p className="text-red-600">{actionState.error}</p>
      )}
    </div>
  )
}