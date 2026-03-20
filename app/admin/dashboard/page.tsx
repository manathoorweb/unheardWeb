'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Calendar, User, Clock, FileText, Plus } from 'lucide-react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('appointments')
  const [supabase] = useState(() => createClient())
  const [appointments, setAppointments] = useState<any[]>([])
  
  useEffect(() => {
    fetchAppointments()
  }, [])

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
                 {[1,2,3].map(i => (
                   <div key={i} className="flex flex-col gap-4 p-6 border border-gray-100 rounded-[20px] hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full"></div>
                          <div>
                            <h4 className="font-bold text-[18px]">Rajesh Kumar <span className="text-[12px] text-gray-400 font-normal ml-2">ID: #8921</span></h4>
                            <p className="text-[14px] text-gray-500">Last session: 2 days ago</p>
                          </div>
                        </div>
                        <Button variant="gray" className="h-[35px] w-fit text-[12px] px-4 group-hover:bg-[#0F9393] group-hover:text-white transition-all">Add Prescription</Button>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100"><FileText size={14}/> Anxiety History</div>
                        <div className="flex items-center gap-2 text-[12px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100"><Clock size={14}/> 4 Total Sessions</div>
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
