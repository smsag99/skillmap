import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Redirect to login if accessing protected routes without auth
    if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Redirect to dashboard if already logged in
    if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}
export const proxyConfig = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
}