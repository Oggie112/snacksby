'use client'

import { logout } from './actions'

export default function LogoutPage() {

    return (
        <div>
        <h1>Logout</h1>
        <button onClick={logout}>Logout</button>
        </div>
    )
}