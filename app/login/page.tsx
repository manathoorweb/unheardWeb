'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Login() {
  const [supabase] = useState(() => createClient())
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#FEFEFC]">
      <div className="p-10 bg-white rounded-[24px] shadow-xl max-w-md w-full border border-gray-100">
        <h1 className="text-[32px] font-georgia font-bold text-center mb-2 text-[#0F9393]">unHeard.</h1>
        <p className="text-center text-gray-500 mb-8 font-nunito text-[16px]">Sign in or create an account</p>
        
        {mounted && (
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#0F9393',
                    brandAccent: '#0c7a7a',
                  }
                }
              }
            }}
            theme="light"
            providers={['google']}
            redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
          />
        )}
      </div>
    </div>
  )
}
