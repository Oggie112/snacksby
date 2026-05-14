'use client'

import { useEffect } from 'react'

import { ApolloProvider } from '@apollo/client/react'
import { CachePersistor } from 'apollo3-cache-persist'
import { get, set, del } from 'idb-keyval'

import apolloClient, { cache } from '@/lib/apollo'
import { supabaseClient } from '@/lib/supabase/client'

const idbStorage = {
	getItem: (key: string): Promise<string | null> =>
		get<string>(key).then((v) => v ?? null),
	setItem: (key: string, value: string) => set(key, value),
	removeItem: (key: string) => del(key),
}

const persistor = new CachePersistor({
	cache,
	storage: idbStorage,
	maxSize: 10485760,
	debug: false,
})

void persistor.restore()

export function ApolloClientProvider({
	children,
}: {
	children: React.ReactNode
}) {
	useEffect(() => {
		function handleReconnect() {
			void apolloClient.refetchQueries({
				include: ['GetShoppingList', 'GetWeekPlan', 'GetWeekIngredients'],
			})
		}

		window.addEventListener('online', handleReconnect)

		const supabase = supabaseClient()
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === 'SIGNED_OUT') {
				void persistor.purge()
				void apolloClient.clearStore()
			}
		})

		return () => {
			window.removeEventListener('online', handleReconnect)
			subscription.unsubscribe()
		}
	}, [])

	return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
}
