'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'

export default function TherapistOnboarding() {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    qualification: '',
    specialties: '',
    avatar_url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('You must be logged in to complete onboarding')
      return
    }

    const { error } = await supabase
      .from('therapist_profiles')
      .upsert({
        user_id: user.id,
        full_name: formData.full_name,
        bio: formData.bio,
        qualification: formData.qualification,
        specialties: formData.specialties.split(',').map(s => s.trim()),
        avatar_url: formData.avatar_url
      })

    if (error) {
      alert(error.message)
    } else {
      // Also update the role if they don't have it (optional safety)
      await supabase.from('user_roles').upsert({ user_id: user.id, role: 'admin' })
      router.push('/admin/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#FEFEFC] flex items-center justify-center p-6 font-nunito">
      <div className="bg-white p-12 rounded-[32px] shadow-2xl max-w-2xl w-full border border-gray-100">
        <h1 className="text-[36px] font-georgia font-bold text-[#0F9393] mb-4 text-center">Complete Your Profile</h1>
        <p className="text-gray-500 text-center mb-10">Welcome to the team! Help us set up your public therapist page.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex flex-col font-bold text-[14px]">
              Full Name
              <input 
                type="text" 
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Dr. Ashaya Rathor" 
                className="mt-1 border border-gray-300 rounded-full px-5 py-3 font-normal focus:outline-none focus:border-[#0F9393]" 
                required
              />
            </label>
            <label className="flex flex-col font-bold text-[14px]">
              Qualification
              <input 
                type="text" 
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                placeholder="Msc in Psychology" 
                className="mt-1 border border-gray-300 rounded-full px-5 py-3 font-normal focus:outline-none focus:border-[#0F9393]" 
                required
              />
            </label>
          </div>

          <label className="flex flex-col font-bold text-[14px]">
            Biography (Short Bio)
            <textarea 
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              placeholder="Tell patients about your expertise and approach..." 
              className="mt-1 border border-gray-300 rounded-[20px] px-5 py-3 font-normal focus:outline-none focus:border-[#0F9393] resize-none" 
              required
            />
          </label>

          <label className="flex flex-col font-bold text-[14px]">
            Specialties (Comma separated)
            <input 
              type="text" 
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
              placeholder="Anxiety, Depression, Relationships" 
              className="mt-1 border border-gray-300 rounded-full px-5 py-3 font-normal focus:outline-none focus:border-[#0F9393]" 
              required
            />
          </label>

          <Button type="submit" variant="black" className="w-full mt-4 h-[60px]" disabled={loading}>
            {loading ? 'Saving Profile...' : 'Complete Onboarding →'}
          </Button>
        </form>
      </div>
    </div>
  )
}
