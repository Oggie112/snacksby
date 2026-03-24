import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

/**
 * Next.js Proxy for authentication and routing.
 * Checks if the requested path is public or requires authentication.
 * If the path is protected and no active Supabase session is found, redirects to the login page.
 * Also handles refreshing user sessions by setting cookies.
 *
 * ⚠️ Auth limitation: Server Actions are POST requests to their parent route, so a matcher
 * that excludes a path also skips this proxy for Server Actions on that path.
 * Do not rely solely on this proxy for auth — every protected Server Action must
 * independently verify the session via serverClient().auth.getUser().
 *
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object, either redirecting or allowing the request to proceed.
 */
export async function proxy(request: NextRequest) {
	console.log('--- Middleware triggered ---')
	console.log('Path:', request.nextUrl.pathname)

	const pathname = request.nextUrl.pathname

	// Define public paths that do not require authentication.
	// These paths are explicitly allowed even if the matcher includes them.
	const isPublic =
		pathname === '/' ||
		pathname.startsWith('/auth/login') ||
		pathname.startsWith('/auth/signup') ||
		pathname.startsWith('/auth/logout') ||
		pathname.startsWith('/favicon') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/assets') ||
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
	matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
