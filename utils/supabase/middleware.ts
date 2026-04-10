import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  // Do not put code between createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protect Admin / Dashboard routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard') || pathname.startsWith('/super-admin')) {
    if (!user) {
      // Redirect to login if unauthenticated
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Role-based protection: fetch user role from our user_roles table
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, is_therapist')
      .eq('user_id', user.id)
      .single()

    const role = roleData?.role || 'patient'
    const isTherapist = roleData?.is_therapist || false

    // Handle legacy /dashboard redirect
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      if (role === 'super_admin') url.pathname = '/super-admin'
      else if (role === 'admin' || isTherapist) url.pathname = '/admin/dashboard'
      else url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Super Admin protection
    if (pathname.startsWith('/super-admin') && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // redirect unauthorized to home
      return NextResponse.redirect(url)
    }

    // Admin (Therapist) protection
    // Allow access if user is admin OR if they have is_therapist flag (for super admins)
    if (pathname.startsWith('/admin') && role !== 'admin' && !isTherapist && role !== 'super_admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/' // redirect unauthorized to home
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
