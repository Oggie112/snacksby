import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

// ⚠️ Server Actions are POST requests to their parent route — a public matcher entry
// also bypasses this middleware for actions on that route. Every protected Server Action
// must independently verify the session via serverClient().auth.getUser().
export async function middleware(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	// Define public paths that do not require authentication.
	// These paths are explicitly allowed even if the matcher includes them.
	const isPublic =
		pathname === '/' ||
		pathname.startsWith('/auth/login') ||
		pathname.startsWith('/auth/signup') ||
		pathname.startsWith('/auth/logout') ||
		pathname.startsWith('/auth/forgot-password') ||
		pathname.startsWith('/auth/callback') ||
		pathname.startsWith('/auth/reset-password') ||
		pathname.startsWith('/join') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/assets') ||
		pathname.startsWith('/images/') ||
		pathname === '/manifest.webmanifest' ||
		pathname === '/sw.js' ||
		pathname.startsWith('/workbox-') ||
		pathname.startsWith('/api/public') // if you have any public APIs

	if (isPublic) {
		return NextResponse.next()
	}

	const response = NextResponse.next({ request })

	// cookies available in this request
	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(
					cookiesToSet: {
						name: string
						value: string
						options: CookieOptions
					}[],
				) {
					cookiesToSet.forEach(({ name, value, options }) => {
						response.cookies.set(name, value, options)
					})
				},
			},
		},
	)
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser()
	if (error || !user) {
		return NextResponse.redirect(new URL('/auth/login', request.url))
	}

	return response
}

export const config = {
	// Match all request paths except for _next/static, _next/image, favicon.ico, and assets.
	matcher: [
		'/((?!_next/static|_next/image|favicon.ico|assets|images|manifest.webmanifest|sw.js|workbox-).*)',
	],
}
