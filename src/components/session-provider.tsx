'use client'

import { createContext, useContext, ReactNode } from 'react'

import type { User } from '@supabase/supabase-js'

interface SessionContextType {
	user: User | null
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
	user: User | null
}

export const SessionProvider = ({ children, user }: Props) => {
	const isAuthenticated = !!user
	return (
		<SessionContext.Provider value={{ user, isAuthenticated }}>
			{children}
		</SessionContext.Provider>
	)
}
