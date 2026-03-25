import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // If we are redirecting to home, let's try to find their dashboard instead
      if (next === '/') {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_therapist')
          .eq('user_id', user.id)
          .single()

        const role = roleData?.role || 'patient'
        const isTherapist = roleData?.is_therapist || false
        
        if (role === 'super_admin') next = '/super-admin'
        else if (role === 'admin' || isTherapist) next = '/admin/dashboard'
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}
