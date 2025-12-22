import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ApolloProvider } from '@apollo/client/react'

import { supabaseClient } from './supabase/client'

const authLink = new SetContextLink(async (prevContext) => {
  const supabase = await supabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = prevContext.headers as Record<string, string> | undefined

  return {
    headers: {
      ...headers,
      apikey: process.env.SUPABASE_ANON_KEY,
      Authorization: session?.access_token
        ? `Bearer ${session.access_token}`
        : '',
    },
  }
})

const httpLink = new HttpLink({
  uri: `${process.env.SUPABASE_URL}/graphql/v1`,
  headers: {
    apikey: process.env.SUPABASE_ANON_KEY!,
  },
})

const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
})

export default apolloClient
