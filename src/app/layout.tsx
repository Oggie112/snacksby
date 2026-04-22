import type { Metadata } from 'next'
import './globals.css'

import { ApolloClientProvider } from '@/components/apollo-provider'
import { Nav } from '@/components/nav'
import { SessionProvider } from '@/components/session-provider'
import { getUserAndSession } from '@/lib/supabase/session'

export const metadata: Metadata = {
	title: {
		template: '%s | Snacksby',
		default: 'Snacksby',
	},
	description: 'Collaborative meal planning for couples and families',
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const { user, session } = await getUserAndSession() // fetch session server-side

	return (
		<html lang="en" data-theme="mytheme-light">
			<body className="bg-neutral text-neutral-content min-h-screen">
				<SessionProvider user={user} session={session}>
					<ApolloClientProvider>
						<Nav />
						<main className="pb-16 md:pb-0 md:pt-0 max-w-2xl mx-auto">
							{children}
						</main>
					</ApolloClientProvider>
				</SessionProvider>
			</body>
		</html>
	)
}
