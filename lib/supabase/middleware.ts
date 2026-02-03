import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase environment variables are missing');
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // refreshing the auth token
        const {
            data: { user },
        } = await supabase.auth.getUser()

        // Protected routes
        const protectedRoutes = ['/account', '/addresses', '/orders', '/checkout', '/wishlist']
        const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

        if (isProtectedRoute && !user) {
            // no user, potentially respond by redirecting the user to the login page
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirectedFrom', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        return supabaseResponse
    } catch (error) {
        // If anything fails, let the request proceed to avoid a blank screen
        console.error('Middleware Error:', error)
        return NextResponse.next({
            request,
        })
    }
}
