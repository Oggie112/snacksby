'use client'

import { createContext, useContext, ReactNode } from 'react'

/** Minimal identity surface derived from the verified JWT claims. */
export interface AuthUser {
	id: string
	email: string | null
}

interface SessionContextType {
	user: AuthUser | null
	isAuthenticated?: boolean
}

const SessionContext = createContext<SessionContextType>({
	user: null,
})

export const useUserAndSession = () => {
	const ctx = useContext(SessionContext)
	if (!ctx) {
		throw new Error('useUserAndSession must be used within a SessionProvider')
	}
	return ctx
}

interface Props {
	children: ReactNode
	user: AuthUser | null
}

export const SessionProvider = ({ children, user }: Props) => {
	const isAuthenticated = !!user
	return (
		<SessionContext.Provider value={{ user, isAuthenticated }}>
			{children}
		</SessionContext.Provider>
	)
}
