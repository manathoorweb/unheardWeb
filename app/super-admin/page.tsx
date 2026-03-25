'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'

export default function SuperAdminDashboard() {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [admins, setAdmins] = useState<any[]>([])

  const [isTherapist, setIsTherapist] = useState(false)

  useEffect(() => {
    fetchAdmins()
    checkRole()
  }, [])

  const checkRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_roles')
        .select('is_therapist')
        .eq('user_id', user.id)
        .single()
      if (data) setIsTherapist(data.is_therapist)
    }
  }

  const fetchAdmins = async () => {
    const { data } = await supabase
      .from('therapist_profiles')
      .select('*')
    if (data) setAdmins(data)
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('Invitation sent successfully!')
        setEmail('')
        setName('')
      } else {
        setMessage(data.error || 'Failed to send invitation')
      }
    } catch (err) {
      setMessage('Error sending invitation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFEFC] p-8 md:p-12 font-nunito">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-[40px] font-georgia font-bold text-[#0F9393]">Super Admin Dashboard</h1>
          
          {isTherapist && (
            <Button 
              onClick={() => window.location.href = '/admin/dashboard'}
              variant="black"
              className="bg-[#0F9393] hover:bg-[#0D7F7F]"
            >
              Switch to Therapist View →
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Invite Form */}
          <div className="bg-white p-10 rounded-[24px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
            <h2 className="text-[24px] font-bold font-georgia text-gray-900">Invite a New Therapist</h2>
            <form onSubmit={handleInvite} className="flex flex-col gap-6">
              <label className="flex flex-col font-bold text-[14px] text-gray-700">
                Therapist's Name
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter name" 
                  className="mt-1 border border-gray-200 rounded-full px-5 py-3 font-normal text-black focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                  required
                />
              </label>
              <label className="flex flex-col font-bold text-[14px] text-gray-700">
                Email Address
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email" 
                  className="mt-1 border border-gray-200 rounded-full px-5 py-3 font-normal text-black focus:outline-none focus:border-[#0F9393] bg-gray-50/50" 
                  required
                />
              </label>
              <Button type="submit" variant="black" className="w-full mt-2" disabled={loading}>
                {loading ? 'Sending...' : 'Send Invite via Resend'}
              </Button>
              {message && <p className={`text-center font-bold ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </form>
          </div>

          {/* Existing Admins List */}
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
            <h2 className="text-[24px] font-bold font-georgia text-gray-900">Existing Therapists (Admins)</h2>
            <div className="flex flex-col gap-4">
              {admins.length === 0 ? (
                <p className="text-gray-400 italic">No therapists active yet.</p>
              ) : (
                admins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <div>
                      <h4 className="font-bold text-[18px] text-[#0F9393]">{admin.full_name}</h4>
                      <p className="text-[14px] text-gray-600">{admin.qualification || 'Awaiting profile setup'}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-[12px] text-gray-400 uppercase font-black tracking-widest">Active</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
