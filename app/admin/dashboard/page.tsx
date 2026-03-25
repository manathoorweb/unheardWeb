'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Calendar, User, Clock, FileText, Plus, UserCircle, Save } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments')
  const [supabase] = useState(() => createClient())
  const [appointments, setAppointments] = useState<any[]>([])
  const [profile, setProfile] = useState<any>({
    full_name: '',
    bio: '',
    qualification: '',
    qualification_desc: '',
    display_hours: '',
    display_rating: '',
    specialties: '',
    note: '',
    next_available_at: '',
    avatar_url: ''
  })
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    fetchAppointments()
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('therapist_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (data) {
      setProfile({
        ...data,
        specialties: data.specialties?.join(', ') || ''
      })
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('therapist_profiles')
      .upsert({
        ...profile,
        user_id: user.id,
        specialties: profile.specialties.split(',').map((s: string) => s.trim()).filter(Boolean)
      })

    if (error) {
      alert(error.message)
    } else {
      alert('Profile updated successfully!')
    }
    setSaving(false)
  }

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*, patient_history(notes), profiles:patient_id(full_name)')
      .order('start_time', { ascending: true })
    if (data) setAppointments(data)
  }

  return (
    <div className="min-h-screen bg-[#FEFEFC] font-nunito flex">
      {/* Sidebar */}
      <aside className="w-[300px] bg-white border-r border-gray-100 p-8 flex flex-col gap-10">
        <h2 className="text-[28px] font-georgia font-bold text-[#0F9393]">unHeard <span className="text-[14px] text-gray-400 font-bold uppercase tracking-widest block">Therapist Portal</span></h2>
        
        <nav className="flex flex-col gap-4">
          <button 
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-4 px-6 py-4 rounded-full font-bold transition-all ${activeTab === 'appointments' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Calendar size={20} /> Appointments
          </button>
          <button 
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-4 px-6 py-4 rounded-full font-bold transition-all ${activeTab === 'patients' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <User size={20} /> Patients
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`flex items-center gap-4 px-6 py-4 rounded-full font-bold transition-all ${activeTab === 'availability' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Clock size={20} /> Availability
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-4 px-6 py-4 rounded-full font-bold transition-all ${activeTab === 'profile' ? 'bg-[#0F9393] text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <UserCircle size={20} /> Public Profile
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-12 overflow-y-auto">
        
        {activeTab === 'appointments' && (
          <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
              <h1 className="text-[32px] font-georgia font-bold">Upcoming Sessions</h1>
              <Button variant="black" className="h-[50px] gap-2"><Plus size={18}/> New Session</Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {appointments.length === 0 ? (
                <div className="bg-white p-20 rounded-[24px] border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
                  <Calendar size={48} className="text-gray-200" />
                  <p className="text-gray-400 italic">No appointments scheduled for today.</p>
                </div>
              ) : (
                appointments.map((apt) => (
                  <div key={apt.id} className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-[#0F9393]/10 rounded-full flex items-center justify-center text-[#0F9393] font-bold">
                        {new Date(apt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <h4 className="font-bold text-[18px]">Patient Name</h4>
                        <p className="text-[14px] text-gray-500">{apt.is_trial ? '15-Minute Trial' : 'Standard Session'} • Confirm via Meeting Link</p>
                      </div>
                    </div>
                    <Button variant="gray" className="h-[40px] w-fit px-8 rounded-full border border-gray-300">View History</Button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="flex flex-col gap-8">
            <h1 className="text-[32px] font-georgia font-bold">Working Hours</h1>
            <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100 max-w-2xl">
              <p className="text-gray-500 mb-8 font-bold">Set your available timings for each day of the week.</p>
              
              <div className="flex flex-col gap-6">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="font-bold w-24">{day}</span>
                    <div className="flex items-center gap-4">
                      <input type="time" defaultValue="09:00" className="border border-gray-200 rounded-lg p-2 font-nunito" />
                      <span className="text-gray-300">to</span>
                      <input type="time" defaultValue="17:00" className="border border-gray-200 rounded-lg p-2 font-nunito" />
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F9393]"></div>
                    </label>
                  </div>
                ))}
              </div>
              <Button variant="black" className="w-full mt-12 h-[60px]">Save Availability Engine Updates</Button>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="flex flex-col gap-8">
            <h1 className="text-[32px] font-georgia font-bold">Patient Records</h1>
            <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100">
               <div className="grid grid-cols-1 gap-6">
                  <p className="text-gray-400 italic">Patient record features coming soon...</p>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex flex-col gap-8">
            <h1 className="text-[32px] font-georgia font-bold">Public Profile Settings</h1>
            <div className="bg-white p-10 rounded-[24px] shadow-sm border border-gray-100 max-w-4xl">
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-8">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Full Name
                    <input 
                      type="text" 
                      value={profile.full_name}
                      onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                      required
                    />
                  </label>
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Main Qualification (e.g. Msc)
                    <input 
                      type="text" 
                      value={profile.qualification}
                      onChange={(e) => setProfile({...profile, qualification: e.target.value})}
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                  </label>
                </div>

                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                  Detailed Qualification Description
                  <input 
                    type="text" 
                    value={profile.qualification_desc}
                    onChange={(e) => setProfile({...profile, qualification_desc: e.target.value})}
                    placeholder="e.g. Msc in human life 2024 Pass Out batch"
                    className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Display Hours (e.g. 623+)
                    <input 
                      type="text" 
                      value={profile.display_hours}
                      onChange={(e) => setProfile({...profile, display_hours: e.target.value})}
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                  </label>
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Display Rating (e.g. 4.3)
                    <input 
                      type="text" 
                      value={profile.display_rating}
                      onChange={(e) => setProfile({...profile, display_rating: e.target.value})}
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                  </label>
                </div>

                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                   Hero Bio (Short Intro)
                   <textarea 
                     value={profile.bio}
                     onChange={(e) => setProfile({...profile, bio: e.target.value})}
                     className="mt-2 border border-gray-200 rounded-lg p-3 font-normal min-h-[100px] focus:border-[#0F9393] outline-none" 
                   />
                </label>

                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                   Note from the Therapist (Longer Bio)
                   <textarea 
                     value={profile.note}
                     onChange={(e) => setProfile({...profile, note: e.target.value})}
                     className="mt-2 border border-gray-200 rounded-lg p-3 font-normal min-h-[150px] focus:border-[#0F9393] outline-none" 
                   />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Specialties (Comma separated)
                    <input 
                      type="text" 
                      value={profile.specialties}
                      onChange={(e) => setProfile({...profile, specialties: e.target.value})}
                      placeholder="Anxiety, Depression, Trauma"
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                  </label>
                  <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Next Available Session Text
                    <input 
                      type="text" 
                      value={profile.next_available_at}
                      onChange={(e) => setProfile({...profile, next_available_at: e.target.value})}
                      placeholder="e.g. 19th Feb • 9:00 AM"
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                  </label>
                </div>

                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                    Avatar URL (Image Link)
                    <input 
                      type="text" 
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                      placeholder="https://example.com/photo.jpg"
                      className="mt-2 border border-gray-200 rounded-lg p-3 font-normal focus:border-[#0F9393] outline-none" 
                    />
                </label>

                <Button type="submit" variant="black" className="h-[60px] gap-3" disabled={saving}>
                  <Save size={20} /> {saving ? 'Saving...' : 'Update Public Profile'}
                </Button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
