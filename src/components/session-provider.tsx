'use client'

import { createContext, useContext, ReactNode } from 'react'

import type { Session, User } from '@supabase/supabase-js'

interface SessionContextType {
	session: Session | null
	user: User | null
	isAuthenticated?: boolean
}

const SessionContext = createContext<SessionContextType>({
	session: null,
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
	session: Session | null
	user: User | null
}

export const SessionProvider = ({ children, session, user }: Props) => {
	const isAuthenticated = !!user && !!session
	return (
		<SessionContext.Provider value={{ session, user, isAuthenticated }}>
			{children}
		</SessionContext.Provider>
	)
}
