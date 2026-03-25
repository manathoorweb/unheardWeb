'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'

export default function Login() {
  const [supabase] = useState(() => createClient())
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
      } else if (user) {
        // Fetch user role to determine redirect path
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_therapist')
          .eq('user_id', user.id)
          .single()

        const role = roleData?.role || 'patient'
        const isTherapist = roleData?.is_therapist || false
        
        if (role === 'super_admin') {
          window.location.href = '/super-admin'
        } else if (role === 'admin' || isTherapist) {
          window.location.href = '/admin/dashboard'
        } else {
          // Default for patients/others (redirect to homepage or onboarding)
          window.location.href = '/'
        }
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-[#FEFEFC] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#0F9393]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0F9393]/5 blur-[120px] rounded-full" />

      <div className="relative z-10 p-10 bg-white rounded-[32px] shadow-2xl max-w-md w-full border border-gray-100 mx-4">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-[40px] font-georgia font-bold text-[#0F9393] mb-2 tracking-tight">unHeard.</h1>
          <p className="text-gray-500 font-nunito text-[16px]">Sign in to your account</p>
        </div>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-nunito border border-red-100">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label className="font-nunito font-bold text-[14px] text-gray-700 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@un.com" 
              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-nunito font-bold text-[14px] text-gray-700 ml-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#0F9393] text-white py-4 rounded-2xl font-nunito font-bold text-[18px] shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all hover:translate-y-[-2px] active:translate-y-[0px] disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
           <p className="text-gray-400 font-nunito text-[14px]">
             Professional Therapy & Counseling
           </p>
        </div>
      </div>
    </div>
  )
}
