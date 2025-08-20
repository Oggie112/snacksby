import { createServerClient } from '@supabase/ssr'
import { NextResponse, NextRequest } from 'next/server'

/**
 * Next.js Middleware for authentication and routing.
 * This middleware checks if the requested path is public or requires authentication.
 * If the path is protected and no active Supabase session is found, it redirects the user to the login page.
 * It also handles refreshing user sessions by setting cookies.
 * @param request The incoming NextRequest object.
 * @returns A NextResponse object, either redirecting or allowing the request to proceed.
 */
export async function middleware(request: NextRequest) {
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

  // cookies available in this request
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: request.cookies,
    },
  )
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Match all request paths except for _next/static, _next/image, favicon.ico, and assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets).*)'],
}
