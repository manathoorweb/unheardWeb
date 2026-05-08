'use client'

import { createClient } from '@/utils/supabase/client'
import { useState, useEffect } from 'react'
import { 
  Phone, ChevronRight, 
  ShieldCheck, Sparkles, Calendar, 
  MapPin, User, Clock, CheckCircle2,
  X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

const FloatingIcon = ({ icon: Icon, delay, x, y, size = 32 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: [0.3, 0.6, 0.3],
      y: [y, y - 20, y],
      x: [x, x + 10, x]
    }}
    transition={{ 
      duration: 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
    style={{ left: x, top: y }}
  >
    <div className="bg-white/40 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-white/20 text-[#0F9393]/60">
      <Icon size={size} />
    </div>
  </motion.div>
)

export default function Login() {
  const [supabase] = useState(() => createClient())
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(0) // 0: Welcome, 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingUser, setExistingUser] = useState<any>(null)

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setExistingUser(user)
    }
    checkSession()
  }, [supabase])

  const handleDirectLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_therapist')
          .eq('user_id', user.id)
          .single()

        const role = roleData?.role || 'patient'
        const isTherapist = roleData?.is_therapist || false
        
        // Log Admin Direct Login
        if (role !== 'patient' || isTherapist) {
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', details: { method: 'direct', role } })
          }).catch(() => {});
        }

        if (role === 'super_admin') window.location.href = '/super-admin'
        else if (role === 'admin' || isTherapist) window.location.href = '/admin/dashboard'
        else window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || 'Direct login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'login' })
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      setStep(2)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      })
      const data = await res.json()
      if (data.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.access_token
        })
        if (sessionError) throw sessionError
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role, is_therapist')
          .eq('user_id', user.id)
          .single()

        const role = roleData?.role || 'patient'
        const isTherapist = roleData?.is_therapist || false
        
        // Log Admin Login
        if (role !== 'patient' || isTherapist) {
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', details: { method: 'otp', role } })
          }).catch(() => {});
        }

        if (role === 'super_admin') window.location.href = '/super-admin'
        else if (role === 'admin' || isTherapist) window.location.href = '/admin/dashboard'
        else window.location.href = '/'
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F2F5] relative overflow-hidden font-nunito">
      {/* Background with Floating Icons */}
      <div className="absolute inset-0 z-0">
        <FloatingIcon icon={Calendar} delay={0} x="15%" y="20%" size={40} />
        <FloatingIcon icon={MapPin} delay={1} x="75%" y="15%" size={48} />
        <FloatingIcon icon={User} delay={2} x="85%" y="45%" size={36} />
        <FloatingIcon icon={Clock} delay={1.5} x="10%" y="55%" size={44} />
        <FloatingIcon icon={Sparkles} delay={3} x="45%" y="30%" size={52} />
        <FloatingIcon icon={CheckCircle2} delay={0.5} x="70%" y="65%" size={40} />
        
        {/* Decorative Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#0F9393]/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      {/* Bottom Sheet Modal */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 120 }}
        className="fixed bottom-0 left-0 right-0 z-20 bg-white rounded-t-[48px] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] p-8 md:p-12 max-w-2xl mx-auto"
      >
        {/* Handle for visual indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-100 rounded-full" />

        <div className="flex flex-col gap-6">
          <header className="flex justify-between items-start">
            <div className="w-14 h-14 bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393]">
              <ShieldCheck size={28} />
            </div>
            <button className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <X size={20} />
            </button>
          </header>

          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-georgia font-bold text-gray-900 leading-tight">Welcome Back</h1>
            <p className="text-gray-500 font-bold text-[14px] leading-relaxed max-w-sm">
              Access the professional therapist portal and manage your sessions securely.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div 
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col gap-3"
              >
                {existingUser && (
                  <button 
                    onClick={handleDirectLogin}
                    disabled={loading}
                    className="w-full bg-[#0F9393] text-white py-4 rounded-[20px] font-bold text-[16px] shadow-2xl shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all flex items-center justify-center gap-3 active:scale-95 duration-300 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} /> Direct Access to Portal
                  </button>
                )}
                <button 
                  onClick={() => setStep(1)}
                  className="w-full bg-[#171612] text-white py-4 rounded-[20px] font-bold text-[16px] shadow-2xl shadow-black/20 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95 duration-300"
                >
                  <Phone size={18} /> Continue with Phone
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.form 
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOTP}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#0F9393]" />
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210" 
                      className="w-full border-2 border-gray-100 rounded-[20px] pl-14 pr-6 py-4 font-bold text-[16px] text-gray-900 focus:outline-none focus:border-[#0F9393] transition-all bg-gray-50/50" 
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-[13px] font-bold text-center">{error}</p>}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#171612] text-white py-4 rounded-[20px] font-bold text-[16px] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Access Code'}
                  <ChevronRight size={18} />
                </button>
                <button type="button" onClick={() => setStep(0)} className="text-gray-400 font-bold text-[13px] hover:text-gray-600 transition-all">Go Back</button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOTP}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-2 text-center">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Enter 6-Digit Code</label>
                  <input 
                    type="text" 
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000" 
                    className="w-full border-2 border-gray-100 rounded-[20px] px-6 py-4 font-bold text-[24px] tracking-[0.4em] text-center text-gray-900 focus:outline-none focus:border-[#0F9393] transition-all bg-gray-50/50" 
                  />
                  <p className="text-gray-400 text-[13px] mt-2">Code sent to your WhatsApp</p>
                </div>
                {error && <p className="text-red-500 text-[13px] font-bold text-center">{error}</p>}
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#0F9393] text-white py-4 rounded-[20px] font-bold text-[16px] shadow-xl hover:bg-[#0D7F7F] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enter'}
                  <ShieldCheck size={18} />
                </button>
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 font-bold text-[13px] hover:text-gray-600 transition-all">Change Phone Number</button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <PWAInstallPrompt />
    </div>
  )
}
