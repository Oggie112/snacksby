import {
	ApolloClient,
	InMemoryCache,
	HttpLink,
	ApolloLink,
} from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'

import { supabaseClient } from './supabase/client'

const authLink = new SetContextLink(async (prevContext) => {
	const supabase = supabaseClient()
	const {
		data: { session },
	} = await supabase.auth.getSession()

	const headers = prevContext.headers as Record<string, string> | undefined

	return {
		headers: {
			...headers,
			Authorization: session?.access_token
				? `Bearer ${session.access_token}`
				: '',
			apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		},
	}
})

const httpLink = new HttpLink({
	uri: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`,
})

export const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
	link: ApolloLink.from([authLink, httpLink]),
	cache,
})

export default apolloClient
