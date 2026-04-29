'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import {
  Plus, UserCircle,
  Trash2, LayoutDashboard,
  Ticket, CheckCircle2, AlertCircle,
  Smartphone, Calendar, Sparkles, Phone, LogOut
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'

function LiveTimer({ startTime, status }: { startTime: string | null, status: string }) {
  const [duration, setDuration] = useState<string>('00:00');

  useEffect(() => {
    if (!startTime || status === 'completed') return;

    const updateTimer = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);
      
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      
      setDuration(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startTime, status]);

  return <span>{duration}</span>;
}

interface Registration {
  id: string;
  start_time: string;
  is_trial: boolean;
  status: string;
  assignment_status?: string;
  guest_info?: {
    name: string;
    email: string;
    phone: string;
  };
  answers?: any;
  session_count?: number;
  meeting_link?: string;
  joined_at_patient?: string;
  joined_at_therapist?: string;
  completed_at?: string;
}

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  display_hours: string;
  display_rating: string;
  is_available: boolean;
  avatar_url: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  value: number;
  usage_count: number;
  is_active: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('registrations')
  const [supabase] = useState(() => createClient())

  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])

  const [isAdmin, setIsAdmin] = useState(false)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all')
  const [profile, setProfile] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<Registration | null>(null)
  const [showSheet, setShowSheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [closingSession, setClosingSession] = useState<string | null>(null);
  const [summary, setSummary] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Proactive Expiration Check
    fetch('/api/admin/expire-sessions', { method: 'POST' })
      .catch(err => console.error('Expiration check failed:', err))
  }, [])

  const checkUserPermissions = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (data) {
      setRole(data.role)
      setIsAdmin(['admin', 'super_admin'].includes(data.role))
    }
  }, [supabase])

  const fetchRegistrations = useCallback(async (existingUser?: any) => {
    const user = existingUser || (await supabase.auth.getUser()).data.user
    if (!user) return

    const { data: apts } = await supabase
      .from('appointments')
      .select(`
        *,
        pre_booking_questionnaires(answers)
      `)
      .order('start_time', { ascending: false })

    const { data: fps } = await supabase
      .from('fingerprint_logs')
      .select('phone')

    const fpMap = new Map();
    fps?.forEach(f => fpMap.set(f.phone, (fpMap.get(f.phone) || 0) + 1));

    if (apts) {
      const formatted = apts.map((a: any) => {
        const guestPhone = a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.phone || 'N/A';
        const guestName = a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.name || 'Anonymous';

        return {
          id: a.id,
          start_time: a.start_time,
          is_trial: a.is_trial,
          status: a.status,
          assignment_status: a.assignment_status,
          guest_info: {
            name: guestName,
            phone: guestPhone,
            email: a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.email
          },
          answers: a.pre_booking_questionnaires?.[0]?.answers,
          session_count: fpMap.get(guestPhone) || 0,
          meeting_link: a.meeting_link,
          joined_at_patient: a.joined_at_patient,
          joined_at_therapist: a.joined_at_therapist,
          completed_at: a.completed_at
        };
      })
      setRegistrations(formatted)
    }
  }, [supabase])

  const fetchTherapists = useCallback(async () => {
    const { data } = await supabase
      .from('therapist_profiles')
      .select('*')
    if (data) setTherapists(data)
  }, [supabase])

  const fetchCoupons = useCallback(async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false })
    if (data) setCoupons(data)
  }, [supabase])

  const fetchProfile = useCallback(async (existingUser?: any) => {
    try {
      const user = existingUser || (await supabase.auth.getUser()).data.user
      if (!user) return
      const { data, error } = await supabase.from('therapist_profiles').select('*').eq('user_id', user.id).single()
      if (data) {
        setProfile(data)
      } else if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error.message || JSON.stringify(error))
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err)
    }
  }, [supabase])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await checkUserPermissions()
        await Promise.all([
          fetchRegistrations(user),
          fetchTherapists(),
          fetchCoupons(),
          fetchProfile(user)
        ])
      }
      setLoading(false)
    }
    init()
  }, [checkUserPermissions, fetchRegistrations, fetchTherapists, fetchCoupons, fetchProfile])

  // Periodic Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRegistrations()
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchRegistrations])

  // Sync selected session with fresh data
  useEffect(() => {
    if (selectedSession) {
      const updated = registrations.find(r => r.id === selectedSession.id);
      if (updated) setSelectedSession(updated);
    }
  }, [registrations])


  const handleCloseSession = async () => {
    if (!closingSession) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/close-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: closingSession, summary }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Session closed and resources cleaned up.');
        setClosingSession(null);
        setSummary('');
        fetchRegistrations();
      } else {
        alert(data.error);
      }
    } catch {
      alert('Error closing session');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('therapist_profiles')
      .update(profile)
      .eq('user_id', user.id)

    if (error) {
      alert(error.message);
    } else {
      alert('Profile updated successfully!');
      fetchProfile();
    }
    setLoading(false);
  }

  const getDuration = (reg: Registration) => {
    if (!reg.joined_at_therapist || !reg.joined_at_patient) return null;
    const start = Math.max(new Date(reg.joined_at_therapist).getTime(), new Date(reg.joined_at_patient).getTime());
    const end = reg.completed_at ? new Date(reg.completed_at).getTime() : Date.now();
    const diff = Math.floor((end - start) / (1000 * 60));
    return diff;
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC]">Loading Admin Dashboard...</div>

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col md:flex-row relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] bg-white border-r border-gray-100 p-8 flex-col gap-10 sticky top-0 h-screen">
        <div className="flex flex-col gap-2">
          <div className="w-10 h-10 bg-[#0F9393] rounded-[14px] flex items-center justify-center text-white shadow-lg shadow-[#0F9393]/20">
            <Sparkles size={20} />
          </div>
          <h2 className="text-[20px] font-bold tracking-tight text-gray-900 mt-3">unHeard</h2>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.3em]">Therapist Pro</p>
        </div>

        <nav className="flex flex-col gap-1.5">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-[18px] font-bold text-[13px] transition-all duration-300 cursor-pointer ${activeTab === 'registrations' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Calendar size={16} /> Sessions
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-[18px] font-bold text-[13px] transition-all duration-300 cursor-pointer ${activeTab === 'history' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={16} /> History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-4 px-5 py-3.5 rounded-[18px] font-bold text-[13px] transition-all duration-300 cursor-pointer ${activeTab === 'profile' ? 'bg-black text-white shadow-xl' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <UserCircle size={16} /> Profile
          </button>
        </nav>

        {isAdmin && (
          <button
            onClick={() => window.location.href = '/super-admin'}
            className="mt-auto flex items-center gap-4 p-4 bg-black text-white rounded-[22px] hover:bg-gray-900 transition-all cursor-pointer shadow-lg group"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0F9393] flex items-center justify-center group-hover:rotate-6 transition-all">
              <LayoutDashboard size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold tracking-tight leading-none">Admin Pro</span>
              <span className="text-[8px] text-[#0F9393] font-bold uppercase tracking-widest mt-1">System</span>
            </div>
          </button>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('registrations')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'registrations' ? 'text-[#0F9393]' : 'text-gray-400'}`}
        >
          <Calendar size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Sessions</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'history' ? 'text-[#0F9393]' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'profile' ? 'text-[#0F9393]' : 'text-gray-400'}`}
        >
          <UserCircle size={22} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>

      <main className="flex-grow p-4 md:p-12 overflow-y-auto w-full pb-28 md:pb-12">
        <PWAInstallPrompt />

        {activeTab === 'registrations' && (
          <div className="flex flex-col gap-8 h-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 p-1">
                  <div className="w-full h-full bg-gray-50 rounded-lg overflow-hidden">
                    <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'Admin'}`} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Hi,</p>
                  <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">{profile?.full_name?.split(' ')[0] || 'Therapist'}</h1>
                </div>
              </div>
              <div className="flex gap-2">
                {role === 'super_admin' && (
                  <button 
                    onClick={() => window.location.href = '/super-admin'}
                    className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#0F9393] cursor-pointer hover:bg-gray-50 transition-all"
                    title="Switch to Super Admin View"
                  >
                    <LayoutDashboard size={18} />
                  </button>
                )}
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.href = '/login';
                  }}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-red-400 cursor-pointer hover:bg-red-50 transition-all"
                >
                  <LogOut size={18} />
                </button>
                <button className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-50 transition-all">
                  <AlertCircle size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">{new Date().toLocaleDateString([], { month: 'short', year: 'numeric' })}</p>
                  <h3 className="text-[26px] font-bold text-gray-900 tracking-tight">Today</h3>
                </div>
                <div className="w-9 h-9 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-[#0F9393]">
                  <Calendar size={16} />
                </div>
              </div>

              <div className="flex justify-between md:justify-start md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[...Array(7)].map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - d.getDay() + i + 1);
                  const isSelected = d.toDateString() === selectedDate.toDateString();
                  const isToday = d.toDateString() === new Date().toDateString();
                  return (
                    <div 
                      key={i} 
                      onClick={() => setSelectedDate(new Date(d))}
                      className={`flex flex-col items-center gap-2.5 p-3.5 min-w-[64px] rounded-[20px] transition-all cursor-pointer border ${isSelected ? 'bg-[#0F9393] text-white shadow-lg shadow-[#0F9393]/20 border-[#0F9393]' : 'bg-white text-gray-400 hover:bg-gray-50 border-gray-100'}`}
                    >
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>{d.toLocaleDateString([], { weekday: 'short' })}</span>
                      <span className="text-[18px] font-bold tracking-tight leading-none">{d.getDate()}</span>
                      {isToday && !isSelected && <div className="w-1 h-1 bg-[#0F9393] rounded-full mt-1" />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-1 rounded-full bg-[#0F9393]" />
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.2em] text-gray-400">Schedule</h3>
                </div>
                <div className="flex flex-col relative ml-2 border-l border-gray-100 pl-6 gap-6">
                  {registrations
                    .filter(r => new Date(r.start_time).toDateString() === selectedDate.toDateString())
                    .map((r, i) => {
                      const isFirst = i === 0;
                      return (
                        <div key={r.id} className="relative">
                          <div className={`absolute -left-[30px] top-3.5 w-4 h-4 rounded-full border-[3px] border-[#F8F9FA] transition-all ${isFirst ? 'bg-[#0F9393] scale-110 shadow-md' : 'bg-gray-200'}`} />
                          <div 
                            onClick={() => { setSelectedSession(r); setShowSheet(true); }}
                            className={`p-5 rounded-[22px] transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${isFirst ? 'bg-[#0F9393] text-white shadow-xl' : 'bg-white text-gray-900 shadow-sm border border-gray-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className={`text-[16px] font-bold tracking-tight ${isFirst ? 'text-white' : 'text-gray-900'}`}>{r.guest_info?.name}</span>
                                <span className={`text-[11px] font-medium ${isFirst ? 'text-white/70' : 'text-gray-400'}`}>{r.is_trial ? 'Discovery' : 'Therapy'}</span>
                              </div>
                              <span className={`text-[13px] font-bold ${isFirst ? 'text-white' : 'text-[#0F9393]'}`}>
                                {new Date(r.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  {registrations.filter(r => new Date(r.start_time).toDateString() === selectedDate.toDateString()).length === 0 && (
                    <p className="text-gray-400 italic text-[13px] py-2">No sessions for this date.</p>
                  )}
                </div>
              </div>

              <div className="bg-[#111111] rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl group min-h-[200px]">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#0F9393]/15 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <p className="text-gray-500 font-bold text-[9px] uppercase tracking-[0.4em] mb-1.5">Portfolio</p>
                      <h3 className="text-[32px] font-bold tracking-tight leading-none">Activity</h3>
                    </div>
                    <div
                      onClick={async () => {
                        const nextVal = !profile.is_available;
                        const { error } = await supabase.from('therapist_profiles').update({ is_available: nextVal }).eq('user_id', profile.user_id);
                        if (!error) setProfile({ ...profile, is_available: nextVal });
                      }}
                      className={`w-12 h-6 rounded-full relative transition-all duration-500 cursor-pointer shadow-inner ${profile?.is_available ? 'bg-[#0F9393]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 shadow-sm transform ${profile?.is_available ? 'translate-x-7' : 'translate-x-1'}`} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="flex flex-col">
                      <span className="text-[42px] font-bold tracking-tight leading-none text-[#0F9393]">{registrations.filter(r => r.status === 'completed').length}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Done</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[42px] font-bold tracking-tight leading-none">{(registrations.reduce((acc, r) => acc + (getDuration(r) || 0), 0) / 60).toFixed(1)}</span>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Hours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-[28px] font-bold tracking-tight text-gray-900">Clinical History</h2>
                <p className="text-[12px] text-[#0F9393] font-bold uppercase tracking-widest mt-1">Diagnostic Records Archive</p>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-200 w-full md:w-auto">
                {['all', 'ongoing', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${filterStatus === status ? 'bg-white text-[#0F9393] shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <input 
                type="text"
                placeholder="Search Patient Name or Phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-[28px] px-8 py-5 text-[15px] font-bold text-gray-900 shadow-sm outline-none focus:border-[#0F9393] transition-all"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300">
                <Plus size={24} className="rotate-45" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {registrations
                .filter(r => {
                  const matchesSearch = r.guest_info?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                        r.guest_info?.phone?.includes(searchQuery);
                  if (!matchesSearch) return false;
                  if (filterStatus === 'all') return true;
                  if (filterStatus === 'ongoing') return r.status !== 'completed' && r.status !== 'cancelled';
                  if (filterStatus === 'completed') return r.status === 'completed';
                  return true;
                })
                .map((reg) => (
                  <div 
                    key={reg.id} 
                    onClick={() => { setSelectedSession(reg); setShowSheet(true); }}
                    className="bg-white p-6 rounded-[28px] border border-gray-50 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0F9393] font-bold">
                        {reg.guest_info?.name?.[0] || 'A'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-gray-900">{reg.guest_info?.name || 'Anonymous'}</span>
                        <span className="text-[12px] text-gray-400 font-medium">{reg.guest_info?.phone}</span>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end">
                      <span className="text-[14px] font-bold text-gray-900">{new Date(reg.start_time).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      <span className="text-[11px] font-bold text-[#0F9393] uppercase tracking-widest">{reg.status === 'completed' ? 'Diagnostic Closed' : 'Active Record'}</span>
                    </div>
                    <button className="px-5 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all">
                      View Details
                    </button>
                  </div>
                ))}
              {registrations.length === 0 && (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                  <LayoutDashboard size={48} className="text-gray-100" />
                  <p className="text-gray-400 font-bold italic">No diagnostic records found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          !profile ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white/50 backdrop-blur-xl rounded-[40px] border border-white/20 text-center gap-6 shadow-2xl">
              <div className="w-20 h-20 bg-[#0F9393]/10 rounded-full flex items-center justify-center text-[#0F9393] animate-pulse">
                <Sparkles size={40} />
              </div>
              <h3 className="text-[24px] font-bold text-gray-900">Finalizing Your Presence</h3>
              <p className="text-gray-500 max-w-sm mb-4">We're preparing your professional showcase. Ensure your clinical data is synced.</p>
              <Button variant="black" onClick={fetchProfile} className="rounded-2xl px-12 h-[60px]">Initialize Profile</Button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {!isEditing ? (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  className="relative w-full max-w-2xl mx-auto flex flex-col gap-8 pb-20"
                >
                  {/* Soft Background Glow */}
                  <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#0F9393]/5 blur-[120px] rounded-full -z-10" />
                  
                  {/* iOS Style Profile Header */}
                  <div className="flex flex-col items-center text-center pt-8 pb-4">
                    <div className="relative mb-8">
                       <motion.div 
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                         className="w-36 h-36 md:w-44 md:h-44 rounded-full p-2 bg-white shadow-2xl relative z-10"
                       >
                          <div className="w-full h-full rounded-full overflow-hidden bg-gray-50 border-4 border-gray-50">
                             <img 
                               src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=0F9393&color=fff&size=256`} 
                               className="w-full h-full object-cover" 
                               alt={profile.full_name}
                             />
                          </div>
                       </motion.div>
                       {/* Floating Availability Card */}
                       <motion.div 
                         initial={{ x: 20, opacity: 0 }}
                         animate={{ x: 0, opacity: 1 }}
                         className="absolute -top-4 -right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50 flex items-center gap-2 z-20"
                       >
                          <div className={`w-2 h-2 rounded-full ${profile.is_available ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          <span className="text-[11px] font-bold text-gray-900 uppercase tracking-widest">{profile.is_available ? 'Available' : 'Busy'}</span>
                       </motion.div>
                    </div>

                    <h2 className="text-[40px] md:text-[48px] font-bold text-gray-900 tracking-tight leading-none mb-3" style={{ fontFamily: 'var(--font-georgia), serif' }}>
                       {profile.full_name?.split(' ').map((n: string, i: number) => (
                         <span key={i} className={i === 0 ? 'text-gray-900' : 'text-gray-400 block md:inline md:ml-2'}>{n}</span>
                       ))}
                    </h2>
                    <p className="text-[14px] font-bold text-[#0F9393] uppercase tracking-[0.4em] mb-8">{profile.qualification || 'Clinical Professional'}</p>
                    
                    <div className="flex gap-4 w-full justify-center">
                       <button 
                         onClick={() => setIsEditing(true)}
                         className="bg-black text-white px-10 py-4 rounded-[24px] font-bold text-[14px] shadow-2xl hover:bg-gray-800 transition-all active:scale-95"
                       >
                          Edit Profile
                       </button>
                       <button className="w-14 h-14 bg-white rounded-[24px] shadow-lg flex items-center justify-center text-gray-400 hover:text-[#0F9393] transition-all border border-gray-50">
                          <Plus size={24} />
                       </button>
                    </div>
                  </div>

                  {/* Connectivity/Status Card */}
                  <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[32px] shadow-xl flex items-center justify-between group cursor-pointer hover:bg-white/80 transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
                           <Smartphone size={22} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[15px] font-bold text-gray-900">Clinical Reachable</span>
                           <span className="text-[12px] text-gray-400 font-medium">WhatsApp Sync Active</span>
                        </div>
                     </div>
                     <div className="bg-green-500/10 px-4 py-1.5 rounded-full">
                        <span className="text-[11px] font-black text-green-600 uppercase tracking-widest">Active</span>
                     </div>
                  </div>

                  {/* Professional Content Cards */}
                  <div className="grid grid-cols-1 gap-6">
                    {/* Bio Card */}
                    <div className="bg-white rounded-[36px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-6">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-[#0F9393] rounded-full" />
                          <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.3em]">Biography</h4>
                       </div>
                       <div className="flex flex-col gap-4">
                          <p className="text-[20px] font-bold text-gray-900 leading-tight italic border-l-4 border-[#0F9393]/10 pl-6">
                             {profile.tagline || 'Helping you find clarity in times of transition.'}
                          </p>
                          <p className="text-[16px] text-gray-700 leading-relaxed font-medium">
                             {profile.bio || 'Professional clinical support tailored to your journey.'}
                          </p>
                       </div>
                    </div>

                    {/* Approach Card */}
                    <div className="bg-white rounded-[36px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col gap-8">
                       <div className="flex flex-col gap-6">
                          <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.3em]">Therapeutic Framework</h4>
                          <div className="flex flex-wrap gap-3">
                             {profile.approach?.split('\n').filter((l: string) => l.trim()).map((tag: string, i: number) => (
                               <div key={i} className="px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                                  <div className="w-2 h-2 rounded-full bg-[#0F9393]" />
                                  <span className="text-[14px] font-bold text-gray-800">{tag}</span>
                               </div>
                             ))}
                             {!profile.approach && (
                               <p className="text-gray-400 italic text-[14px]">Define your unique approach to care...</p>
                             )}
                          </div>
                       </div>

                       <div className="h-px bg-gray-50" />

                       <div className="flex flex-col gap-6">
                          <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.3em]">Good Fit For</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             {profile.good_fit_for?.map((item: string, i: number) => (
                               <div key={i} className="p-4 bg-[#0F9393]/5 rounded-2xl border border-[#0F9393]/10 flex items-start gap-4">
                                  <div className="mt-1 text-[#0F9393]"><CheckCircle2 size={16} /></div>
                                  <span className="text-[14px] font-bold text-gray-700">{item}</span>
                               </div>
                             ))}
                             {(!profile.good_fit_for || profile.good_fit_for.length === 0) && (
                               <p className="text-gray-400 italic text-[14px]">Specify areas of expertise...</p>
                             )}
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="flex flex-col gap-8 max-w-2xl mx-auto w-full pb-20"
                >
                  <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl p-8 rounded-[40px] shadow-2xl border border-white/50 sticky top-4 z-30">
                    <div className="flex items-center gap-4">
                       <button onClick={() => setIsEditing(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900">
                          <Plus size={20} className="rotate-45" />
                       </button>
                       <div>
                          <h2 className="text-[20px] font-bold text-gray-900">Profile Settings</h2>
                          <p className="text-[11px] text-[#0F9393] font-bold uppercase tracking-widest mt-0.5">Edit Professional Brand</p>
                       </div>
                    </div>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="px-8 py-3 bg-black text-white font-bold text-[13px] rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                      {loading ? 'Saving...' : 'Save All'}
                    </button>
                  </div>

                  {/* Instructional Guide Card */}
                  <div className="bg-[#0F9393] p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                     <div className="absolute top-[-20px] right-[-20px] opacity-10"><Sparkles size={120} /></div>
                     <h4 className="text-[14px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Sparkles size={16} /> Content Standard
                     </h4>
                     <p className="text-[14px] text-white/90 leading-relaxed font-medium mb-4">
                        Your profile is your digital clinical identity. Follow the **Ms. Taruni Priya** standard for clarity and impact.
                     </p>
                     <div className="bg-white/10 backdrop-blur-md rounded-[24px] p-5 border border-white/10">
                        <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Example Standard</p>
                        <p className="text-[13px] italic font-medium leading-relaxed">
                           "Her approach is structured yet flexible, combining counselling frameworks with practical application..."
                        </p>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                    {/* Identification Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-6">
                       <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Identification</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Full Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Ms. Taruni Priya"
                              value={profile.full_name || ''}
                              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                              className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Qualification</label>
                            <input
                              type="text"
                              placeholder="e.g. M.Sc. Counselling Psychology"
                              value={profile.qualification || ''}
                              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                              className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                            />
                          </div>
                          <div className="col-span-full flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Microtag (Quick Summary)</label>
                            <input
                              type="text"
                              placeholder="e.g. Clarity & Direction"
                              value={profile.microtag || ''}
                              onChange={(e) => setProfile({ ...profile, microtag: e.target.value })}
                              className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                            />
                          </div>
                       </div>
                    </div>

                    {/* Clinical Presence Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-6">
                       <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Clinical Presence</h4>
                       <div className="flex flex-col gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Professional Tagline</label>
                            <input
                              type="text"
                              placeholder="e.g. For when you’re feeling stuck between choices..."
                              value={profile.tagline || ''}
                              onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
                              className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 italic transition-all"
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Biography</label>
                            <textarea
                              placeholder="Describe your work focus (e.g. Her work focuses on decision-making...)"
                              value={profile.bio || ''}
                              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              className="w-full h-40 border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-medium text-gray-800 resize-none transition-all"
                            />
                          </div>
                       </div>
                    </div>

                    {/* Methodology Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-8">
                       <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Methodology</h4>
                       <div className="flex flex-col gap-10">
                          {/* Therapeutic Approach Points */}
                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Therapeutic Approach</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {profile.approach?.split('\n').filter((l: string) => l.trim()).map((p: string, i: number) => (
                                 <motion.div 
                                   initial={{ scale: 0.8, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   key={i} 
                                   className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100"
                                 >
                                    <span className="text-[13px] font-bold text-gray-700">{p}</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const lines = profile.approach.split('\n').filter((l: string) => l.trim());
                                        lines.splice(i, 1);
                                        setProfile({ ...profile, approach: lines.join('\n') });
                                      }}
                                      className="text-gray-300 hover:text-red-400 transition-colors"
                                    >
                                       <Plus size={14} className="rotate-45" />
                                    </button>
                                 </motion.div>
                               ))}
                            </div>
                            <div className="relative">
                               <input
                                 type="text"
                                 placeholder="Add a methodology point (e.g. CBT, Trauma-Informed)..."
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     e.preventDefault();
                                     const val = e.currentTarget.value.trim();
                                     if (val) {
                                       const current = profile.approach || '';
                                       setProfile({ ...profile, approach: current ? `${current}\n${val}` : val });
                                       e.currentTarget.value = '';
                                     }
                                   }
                                 }}
                                 className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] bg-gray-50 font-medium text-gray-800"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                  <Plus size={20} />
                               </div>
                            </div>
                          </div>

                          {/* Ideal Patient Match Points */}
                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Ideal Patient Match</label>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {profile.good_fit_for?.map((p: string, i: number) => (
                                 <motion.div 
                                   initial={{ scale: 0.8, opacity: 0 }}
                                   animate={{ scale: 1, opacity: 1 }}
                                   key={i} 
                                   className="flex items-center gap-2 bg-[#0F9393]/5 px-4 py-2 rounded-xl border border-[#0F9393]/10"
                                 >
                                    <span className="text-[13px] font-bold text-[#0F9393]">{p}</span>
                                    <button 
                                      type="button"
                                      onClick={() => {
                                        const items = [...(profile.good_fit_for || [])];
                                        items.splice(i, 1);
                                        setProfile({ ...profile, good_fit_for: items });
                                      }}
                                      className="text-[#0F9393]/40 hover:text-red-400 transition-colors"
                                    >
                                       <Plus size={14} className="rotate-45" />
                                    </button>
                                 </motion.div>
                               ))}
                            </div>
                            <div className="relative">
                               <input
                                 type="text"
                                 placeholder="Add a clinical focus (e.g. Anxiety, Career Decisions)..."
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter') {
                                     e.preventDefault();
                                     const val = e.currentTarget.value.trim();
                                     if (val) {
                                       const current = profile.good_fit_for || [];
                                       setProfile({ ...profile, good_fit_for: [...current, val] });
                                       e.currentTarget.value = '';
                                     }
                                   }
                                 }}
                                 className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] bg-gray-50 font-medium text-gray-800"
                               />
                               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                  <Plus size={20} />
                               </div>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        variant="black" 
                        className="w-full h-[76px] text-[18px] rounded-[28px] shadow-2xl hover:shadow-black/20 transition-all active:scale-95" 
                        disabled={loading}
                        onClick={async (e) => {
                          await handleUpdateProfile(e);
                          setIsEditing(false);
                        }}
                      >
                        {loading ? 'Publishing Changes...' : 'Publish to Showcase'}
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}
      </main>

      {/* Close Session Modal */}
      {closingSession && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-10 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <h2 className="text-[28px] font-bold tracking-tighter text-gray-900 mb-2">Close Therapy Session</h2>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Enter session summary..."
              className="w-full h-[150px] border border-gray-200 rounded-[20px] p-6 text-[14px] font-medium outline-none focus:border-[#0F9393] transition-all resize-none"
            />
            <div className="flex gap-4">
              <button onClick={() => setClosingSession(null)} className="flex-1 h-[55px] font-bold text-gray-500 hover:bg-gray-50 rounded-2xl transition-all">Go Back</button>
              <button onClick={handleCloseSession} disabled={loading || !summary.trim()} className="flex-[2] h-[55px] bg-black text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg">
                {loading ? 'Closing...' : 'Close & Save Summary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Session Details Bottom Sheet */}
      <AnimatePresence>
        {showSheet && (
          <div className="fixed inset-0 z-[200]">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSheet(false)} 
              className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 150) setShowSheet(false);
              }}
              className="absolute bottom-0 left-0 right-0 h-[85vh] bg-[#F8F9FA] rounded-t-[42px] shadow-2xl flex flex-col"
            >
              <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
              <div className="flex-1 overflow-y-auto px-8 pb-10 flex flex-col gap-8">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-3xl p-1 shadow-sm border border-gray-100">
                      <img src={`https://ui-avatars.com/api/?name=${selectedSession?.guest_info?.name || 'User'}&background=0F9393&color=fff`} className="w-full h-full rounded-2xl object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-[24px] font-bold tracking-tight text-gray-900">{selectedSession?.guest_info?.name}</h2>
                      <p className="text-gray-400 font-bold text-[13px]">Professional Profile</p>
                    </div>
                  </div>
                  <button onClick={() => setShowSheet(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><Plus size={20} className="rotate-45" /></button>
                </div>

                {/* Active Session Highlight */}
                {selectedSession?.status !== 'completed' && (
                  <div className={`p-6 rounded-[32px] shadow-xl flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-500 ${selectedSession?.joined_at_patient ? 'bg-[#0F9393] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${selectedSession?.joined_at_patient ? 'opacity-70' : ''}`}>Client Connected</span>
                      <span className="text-[18px] font-bold">
                        {selectedSession?.joined_at_patient 
                          ? new Date(selectedSession.joined_at_patient).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Awaiting Join...'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-[10px] font-bold uppercase tracking-widest block mb-1 ${selectedSession?.joined_at_patient ? 'opacity-70' : ''}`}>Session Duration</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[32px] font-black tracking-tighter tabular-nums leading-none">
                          {selectedSession?.joined_at_patient 
                            ? <LiveTimer startTime={selectedSession.joined_at_patient} status={selectedSession.status} />
                            : '00:00'}
                        </span>
                        {selectedSession?.joined_at_patient && <span className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Live</span>}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Diagnostic Insights Grid */}
                <div className="grid grid-cols-3 gap-4">
                   <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Symptoms</span>
                      <span className="text-[14px] font-bold text-gray-900">{selectedSession?.answers?.service || 'N/A'}</span>
                   </div>
                   <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Language</span>
                      <span className="text-[14px] font-bold text-gray-900">{selectedSession?.answers?.language || 'English'}</span>
                   </div>
                   <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Age Group</span>
                      <span className="text-[14px] font-bold text-gray-900">{selectedSession?.answers?.age || '18-25'}</span>
                   </div>
                </div>

                <div className="flex flex-col gap-6">
                   <h3 className="text-[14px] font-bold uppercase tracking-[0.2em] text-gray-400">Session Protocol</h3>
                   <div className="flex flex-col relative ml-2 border-l-2 border-gray-200 pl-8 gap-10">
                      <div className="relative">
                         <div className="absolute -left-[41px] top-1 w-6 h-6 bg-[#0F9393] rounded-full border-4 border-[#F8F9FA] shadow-md" />
                         <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900">Registration Confirmed</span>
                            <span className="text-[13px] text-gray-400 font-medium">Patient portal assignment verified</span>
                         </div>
                      </div>
                      <div className="relative">
                         <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-[#F8F9FA] shadow-md ${selectedSession?.joined_at_patient ? 'bg-[#0F9393]' : 'bg-gray-200'}`} />
                         <div className="flex flex-col">
                            <span className={`text-[16px] font-bold ${selectedSession?.joined_at_patient ? 'text-gray-900' : 'text-gray-400'}`}>Client Connection</span>
                            <span className="text-[13px] text-gray-400 font-medium">
                              {selectedSession?.joined_at_patient 
                                ? `Joined at ${new Date(selectedSession.joined_at_patient).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Waiting for client to enter room'}
                            </span>
                         </div>
                      </div>
                      <div className="relative">
                         <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-[#F8F9FA] shadow-md ${selectedSession?.joined_at_therapist ? 'bg-[#0F9393]' : 'bg-gray-200'}`} />
                         <div className="flex flex-col">
                            <span className={`text-[16px] font-bold ${selectedSession?.joined_at_therapist ? 'text-gray-900' : 'text-gray-400'}`}>Clinical Assignment</span>
                            <span className="text-[13px] text-gray-400 font-medium">
                              {selectedSession?.joined_at_therapist 
                                ? `Therapist joined at ${new Date(selectedSession.joined_at_therapist).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                : 'Awaiting therapist session join'}
                            </span>
                         </div>
                      </div>
                    </div>
                </div>

                <div className="mt-auto flex flex-col gap-4">
                  <div className="bg-white border border-gray-100 p-6 rounded-[32px] flex justify-between items-center">
                     <div>
                        <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Rate</span>
                        <h4 className="text-[24px] font-bold text-gray-900">₹{selectedSession?.is_trial ? '399.00' : '1,200.00'} <span className="text-[14px] text-gray-400 font-medium">/ 50 mins</span></h4>
                     </div>
                     <div className="bg-gray-50 px-4 py-2 rounded-xl text-[12px] font-bold text-gray-500">
                        Patient Paid
                     </div>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => window.location.href = `tel:${selectedSession?.guest_info?.phone}`} 
                      className="w-16 h-16 bg-white border border-gray-100 rounded-3xl flex items-center justify-center text-gray-900 shadow-sm hover:bg-gray-50 transition-all"
                    >
                       <Phone size={24} />
                    </button>
                    <button 
                      onClick={() => {
                         if (selectedSession?.id) {
                            window.open(`/room/${selectedSession.id}`, '_blank');
                         } else {
                            alert('Session ID not found. Please sync with system admin.');
                         }
                      }}
                      className="flex-1 bg-black text-white rounded-[24px] font-bold text-[15px] uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all h-16"
                    >
                      Join Session
                    </button>
                  </div>

                  <button 
                    onClick={() => {
                      if (confirm('Close this session permanently?')) {
                        setClosingSession(selectedSession?.id || '');
                        setShowSheet(false);
                      }
                    }}
                    className="w-full text-center text-gray-400 font-bold text-[12px] uppercase tracking-widest py-2 hover:text-red-400 transition-all cursor-pointer"
                  >
                    Clinical Closure Request
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
