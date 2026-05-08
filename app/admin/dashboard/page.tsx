'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import {
  Plus, UserCircle,
  LayoutDashboard,
  AlertCircle,
  Calendar, Sparkles, Phone, LogOut,
  ChevronRight,
  ChevronLeft, ExternalLink, Bell
} from 'lucide-react'
import { subscribeToPush } from '@/lib/push/pushService'
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
  session_summary?: string;
  therapist_name?: string;
}


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('registrations')
  const [supabase] = useState(() => createClient())

  const [registrations, setRegistrations] = useState<Registration[]>([])

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
  const [isPushLoading, setIsPushLoading] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [fitInput, setFitInput] = useState('');

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
        pre_booking_questionnaires(answers),
        therapist_profiles!therapist_id(full_name)
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

        return {
          id: a.id,
          start_time: a.start_time,
          is_trial: a.is_trial,
          status: a.status,
          assignment_status: a.assignment_status,
          guest_info: {
            name: a.guest_name || a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.name || 'Anonymous',
            phone: a.guest_phone || a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.phone || 'N/A',
            email: a.guest_email || a.pre_booking_questionnaires?.[0]?.answers?.guest_info?.email
          },
          answers: a.pre_booking_questionnaires?.[0]?.answers,
          session_count: fpMap.get(guestPhone) || 0,
          meeting_link: a.meeting_link,
          joined_at_patient: a.joined_at_patient,
          joined_at_therapist: a.joined_at_therapist,
          completed_at: a.completed_at,
          session_summary: a.session_summary,
          therapist_name: a.therapist_profiles?.full_name
        };
      })
      setRegistrations(formatted)
    }
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
          fetchProfile(user)
        ])
      }
      setLoading(false)
    }
    init()
  }, [checkUserPermissions, fetchRegistrations, fetchProfile, supabase.auth])

  // Periodic Refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchRegistrations()
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [fetchRegistrations])

  // Track Session Duration from LocalStorage
  useEffect(() => {
    const checkActiveSession = () => {
      const activeSession = localStorage.getItem('active_session_join');
      if (activeSession) {
        try {
          const { id, time } = JSON.parse(activeSession);
          const durationMs = Date.now() - time;
          const durationMins = Math.floor(durationMs / 60000);

          if (durationMins > 0) {
            console.log(`⏱️ Session ${id} completed. Duration: ${durationMins} mins.`);
            fetch('/api/admin/logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'meeting_leave',
                target_id: id,
                details: {
                  role: 'therapist',
                  duration_minutes: durationMins,
                  approx_duration: `${durationMins} minutes`
                }
              })
            }).catch(() => { });
          }

          localStorage.removeItem('active_session_join');
        } catch {
          localStorage.removeItem('active_session_join');
        }
      }
    };

    checkActiveSession();
    window.addEventListener('focus', checkActiveSession);
    return () => window.removeEventListener('focus', checkActiveSession);
  }, []);

  // Sync selected session with fresh data
  useEffect(() => {
    if (selectedSession) {
      const updated = registrations.find(r => r.id === selectedSession.id);
      if (updated) setSelectedSession(updated);
    }
  }, [registrations, selectedSession])


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
      // Log Session Close
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        fetch('/api/admin/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'meeting_leave', target_id: closingSession, details: { role: 'therapist' } })
        }).catch(() => { });
      }
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
      // Log Profile Change
      fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'profile_change', details: { role: 'therapist' } })
      }).catch(() => { });

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

  // Generate Dummy Chart Data
  const sessionChartData = [4, 6, 8, 5, 9, 7, 10]; // Last 7 days
  const performanceData = [4.2, 4.5, 4.3, 4.8, 4.6, 4.9, 4.7];

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
                    <Image
                      src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name?.trim() || 'Admin')}`}
                      className="w-full h-full object-cover"
                      alt={profile?.full_name || 'Admin'}
                      width={48}
                      height={48}
                    />
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
                      const isCompleted = r.status === 'completed';
                      
                      return (
                        <div key={r.id} className="relative">
                          <div className={`absolute -left-[30px] top-3.5 w-4 h-4 rounded-full border-[3px] border-[#F8F9FA] transition-all ${isCompleted ? 'bg-gray-300' : isFirst ? 'bg-[#0F9393] scale-110 shadow-md' : 'bg-gray-200'}`} />
                          <div
                            onClick={() => { setSelectedSession(r); setShowSheet(true); }}
                            className={`p-5 rounded-[22px] transition-all cursor-pointer group hover:scale-[1.02] active:scale-95 ${isCompleted ? 'bg-gray-50 border border-gray-100 text-gray-400' : isFirst ? 'bg-[#0F9393] text-white shadow-xl' : 'bg-white text-gray-900 shadow-sm border border-gray-50'}`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex flex-col">
                                <span className={`text-[16px] font-bold tracking-tight ${isCompleted ? 'text-gray-400' : isFirst ? 'text-white' : 'text-gray-900'}`}>{r.guest_info?.name}</span>
                                <span className={`text-[11px] font-medium ${isCompleted ? 'text-gray-300' : isFirst ? 'text-white/70' : 'text-gray-400'}`}>{isCompleted ? 'Session Completed' : r.is_trial ? 'Discovery' : 'Therapy'}</span>
                              </div>
                              <span className={`text-[13px] font-bold ${isCompleted ? 'text-gray-300' : isFirst ? 'text-white' : 'text-[#0F9393]'}`}>
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
                        if (!error) {
                          setProfile({ ...profile, is_available: nextVal });
                          // Log Availability Toggle
                          fetch('/api/admin/logs', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ action: 'profile_change', details: { role: 'therapist', available: nextVal } })
                          }).catch(() => { });
                        }
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
                .map((reg, idx, arr) => {
                  // Calculate gap between this session and the PREVIOUS one chronologically (which is the NEXT one in this descending list)
                  let dayGap = null;
                  const prevSession = arr[idx + 1];
                  if (prevSession && prevSession.guest_info?.phone === reg.guest_info?.phone) {
                    const current = new Date(reg.start_time).getTime();
                    const prev = new Date(prevSession.start_time).getTime();
                    dayGap = Math.floor((current - prev) / (1000 * 60 * 60 * 24));
                  }

                  return (
                    <div key={reg.id} className="relative flex items-stretch gap-3 md:gap-8 group">
                      {/* Timeline Thread */}
                      <div className="flex flex-col items-center w-8 md:w-16 flex-shrink-0">
                        <div className={`w-1 flex-grow ${idx === 0 ? 'bg-transparent' : 'bg-gray-100'}`} />
                        <div className={`w-4 h-4 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-10 ${reg.status === 'completed' ? 'bg-[#0F9393]' : 'bg-yellow-500 animate-pulse'}`} />
                        <div className={`w-1 flex-grow ${idx === arr.length - 1 ? 'bg-transparent' : 'bg-gray-100'}`} />
                        
                        {/* Gap Badge - Positioned between nodes */}
                        {dayGap !== null && (
                          <div className="absolute top-[100%] left-4 md:left-8 -translate-x-1/2 -translate-y-1/2 z-20">
                            <div className="bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                              <span className="text-[9px] font-black text-[#0F9393] whitespace-nowrap">+{dayGap}d</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => { setSelectedSession(reg); setShowSheet(true); }}
                        className="flex-1 bg-white p-6 md:p-8 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col gap-6 my-2"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0F9393] font-bold text-xl">
                              {reg.guest_info?.name?.[0] || 'A'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[16px] md:text-[18px] font-bold text-gray-900">{reg.guest_info?.name || 'Anonymous'}</span>
                              <span className="text-[12px] text-gray-400 font-medium">{reg.guest_info?.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 md:gap-8">
                            <div className="flex flex-col md:items-center">
                              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Therapist</span>
                              <span className="text-[13px] md:text-[14px] font-bold text-gray-700">{reg.therapist_name || 'Admin'}</span>
                            </div>
                            <div className="flex flex-col md:items-end">
                              <span className="text-[13px] md:text-[14px] font-bold text-gray-900">{new Date(reg.start_time).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${reg.status === 'completed' ? 'text-[#0F9393]' : 'text-yellow-600'}`}>
                                {reg.status === 'completed' ? 'Session Closed' : 'In Progress'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {reg.session_summary && (
                          <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100/50">
                            <p className="text-[13px] text-gray-600 leading-relaxed italic line-clamp-2 text-ellipsis">
                              &quot;{reg.session_summary}&quot;
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
                          <Image
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name?.trim() || 'Therapist')}&background=0F9393&color=fff&size=256`}
                            className="w-full h-full object-cover"
                            alt={profile.full_name}
                            width={176}
                            height={176}
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

                    <div className="flex flex-col mb-4">
                      <span className="text-[12px] font-bold text-[#0F9393] uppercase tracking-[0.4em] mb-1">{profile.microtag || 'Expert Consultant'}</span>
                      <h2 className="text-[40px] md:text-[48px] font-bold text-gray-900 tracking-tight leading-none" style={{ fontFamily: 'var(--font-georgia), serif' }}>
                        {profile.full_name?.split(' ').map((n: string, i: number) => (
                          <span key={i} className={i === 0 ? 'text-gray-900' : 'text-gray-400 block md:inline md:ml-2'}>{n}</span>
                        ))}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 mb-8">
                       <span className="text-[14px] font-bold text-gray-400 uppercase tracking-[0.2em]">Clinical Professional</span>
                       <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                       <div className="flex items-center gap-1.5 bg-green-500/5 px-3 py-1 rounded-full border border-green-500/10">
                          <div className={`w-1.5 h-1.5 rounded-full ${profile.phone ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300'}`} />
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{profile.phone ? 'WhatsApp Synced' : 'Sync Pending'}</span>
                       </div>
                    </div>

                    {/* Premium Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-12">
                      {[
                        { label: 'QUALIFICATION', value: profile.qualification?.split(' ')[0] || 'MSc', sub: 'Expert' },
                        { label: 'SESSIONS', value: `${profile.session_count || Math.floor(Math.random() * 50) + 380}+`, sub: 'Verified' },
                        { label: 'AVG RATING', value: profile.display_rating || '4.5', sub: 'Consistently' },
                        { label: 'EXP', value: profile.display_hours || '12+', sub: 'Dedicated' }
                      ].map((stat, idx) => (
                        <div key={idx} className="bg-[#171612] rounded-[32px] p-6 flex flex-col gap-4 border border-white/5 relative overflow-hidden group">
                          <div className="w-8 h-1 bg-[#0F9393] rounded-full" />
                          <div className="flex flex-col">
                            <span className="text-[28px] font-bold text-white tracking-tighter">{stat.value}</span>
                            <span className="text-[9px] font-bold text-[#0F9393] uppercase tracking-widest mt-1">{stat.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-bold">{stat.sub}</span>
                        </div>
                      ))}
                    </div>

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



                  {/* Personal & Settings Rows */}
                  <div className="flex flex-col gap-3">
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-[#0F9393]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#0F9393] transition-colors">
                          <UserCircle size={22} />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900">Personal Details</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0F9393] transition-colors" />
                    </div>
                    <div className="bg-white p-6 rounded-[28px] border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-[#0F9393]/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-[#0F9393] transition-colors">
                          <Plus size={22} />
                        </div>
                        <span className="text-[15px] font-bold text-gray-900">Profile Settings</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#0F9393] transition-colors" />
                    </div>
                  </div>

                  {/* Analytics Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-8 rounded-[36px] border border-gray-100 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Session Velocity</h4>
                        <Calendar size={16} className="text-gray-300" />
                      </div>
                      <div className="flex items-end justify-between h-32 gap-2 px-2">
                        {sessionChartData.map((val, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${(val / 10) * 100}%` }}
                              className="w-full bg-[#F3F4F6] group-hover:bg-[#0F9393] rounded-t-xl transition-all relative"
                            >
                              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">{val}</span>
                            </motion.div>
                            <span className="text-[9px] font-bold text-gray-300 uppercase">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white p-8 rounded-[36px] border border-gray-100 flex flex-col gap-6">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Patient Sentiment</h4>
                        <Sparkles size={16} className="text-gray-300" />
                      </div>
                      <div className="h-32 flex items-center justify-center relative">
                        <svg className="w-full h-full" viewBox="0 0 200 100" preserveAspectRatio="none">
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            d={`M 0 ${100 - performanceData[0] * 15} ${performanceData.map((v, i) => `L ${(i / 6) * 200} ${100 - v * 15}`).join(' ')}`}
                            fill="none"
                            stroke="#0F9393"
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <path
                            d={`M 0 ${100 - performanceData[0] * 15} ${performanceData.map((v, i) => `L ${(i / 6) * 200} ${100 - v * 15}`).join(' ')} L 200 100 L 0 100 Z`}
                            fill="url(#gradient-sentiment)"
                            opacity="0.1"
                          />
                          <defs>
                            <linearGradient id="gradient-sentiment" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#0F9393" />
                              <stop offset="100%" stopColor="transparent" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="flex justify-between px-2">
                        <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">7 Days Ago</span>
                        <span className="text-[9px] font-bold text-[#0F9393] uppercase tracking-widest">Current: 4.7</span>
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


                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                    {/* Identification Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-6">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Identification</h4>

                      {/* Avatar Upload */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                          <Image
                            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name?.trim() || 'Therapist')}&background=0F9393&color=fff`}
                            width={96} height={96} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Avatar"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <Plus size={24} className="text-[#0F9393]" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[14px] font-bold text-gray-900">Profile Image</span>
                          <span className="text-[12px] text-gray-400">Square SVG or PNG (Max 2MB)</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Microtag (Clinical Goal)</label>
                          <input
                            type="text"
                            maxLength={30}
                            placeholder="e.g. Clarity & Direction"
                            value={profile.microtag || ''}
                            onChange={(e) => setProfile({ ...profile, microtag: e.target.value })}
                            className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Professional Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Ms. Taruni Priya"
                            value={profile.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                            className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Primary Qualification</label>
                          <input
                            type="text"
                            placeholder="e.g. M.Sc. Counselling Psychology"
                            value={profile.qualification || ''}
                            onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                            className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Experience (Years)</label>
                          <input
                            type="text"
                            placeholder="e.g. 12+"
                            value={profile.display_hours || ''}
                            onChange={(e) => setProfile({ ...profile, display_hours: e.target.value })}
                            className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Clinical Phone (for WhatsApp Sync)</label>
                          <input
                            type="text"
                            placeholder="e.g. +91 9876543210"
                            value={profile.phone || ''}
                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
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
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Note from Therapist</label>
                          <input
                            type="text"
                            placeholder="e.g. For when you’re feeling stuck between choices and need a way forward."
                            value={profile.note || ''}
                            onChange={(e) => setProfile({ ...profile, note: e.target.value })}
                            className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-bold text-gray-900 italic transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Biography</label>
                          <textarea
                            placeholder="Her work centres on creating the internal conditions for change where feeling seen, heard, and supported allows growth to unfold naturally..."
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            className="w-full h-40 border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-medium text-gray-800 resize-none transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Therapeutic Approach</label>
                          <textarea
                            placeholder="Her approach is humanistic and trauma-informed, integrating REBT, CBT, EFT, and emotion-focused work..."
                            value={profile.approach_long || ''}
                            onChange={(e) => setProfile({ ...profile, approach_long: e.target.value })}
                            className="w-full h-40 border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] focus:bg-white bg-gray-50 font-medium text-gray-800 resize-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Methodology Section */}
                    <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-gray-100 flex flex-col gap-8">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">Methodology</h4>
                      <div className="flex flex-col gap-10">
                        {/* I Excel At (4-5 Bubbles) */}
                        <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">I Excel At (Add 4-5 using the plus icon to add more )</label>
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(profile.approach || '').split('\n').filter((l: string) => l.trim()).map((p: string, i: number) => (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                key={i}
                                className="flex items-center gap-2 bg-[#171612] px-5 py-3 rounded-2xl border border-white/5"
                              >
                                <span className="text-[14px] font-bold text-white">{p}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const lines = profile.approach.split('\n').filter((l: string) => l.trim());
                                    lines.splice(i, 1);
                                    setProfile({ ...profile, approach: lines.join('\n') });
                                  }}
                                  className="text-gray-500 hover:text-red-400 transition-colors"
                                >
                                  <Plus size={14} className="rotate-45" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                          {(!profile.approach || profile.approach.split('\n').filter((l: string) => l.trim()).length < 5) && (
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Add an expertise area (e.g. CBT, Trauma)..."
                                value={expertiseInput}
                                onChange={(e) => setExpertiseInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (expertiseInput.trim()) {
                                      const current = profile.approach || '';
                                      setProfile({ ...profile, approach: current ? `${current}\n${expertiseInput.trim()}` : expertiseInput.trim() });
                                      setExpertiseInput('');
                                    }
                                  }
                                }}
                                className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] bg-gray-50 font-medium text-gray-800"
                              />
                              <div 
                                onClick={() => {
                                  if (expertiseInput.trim()) {
                                    const current = profile.approach || '';
                                    setProfile({ ...profile, approach: current ? `${current}\n${expertiseInput.trim()}` : expertiseInput.trim() });
                                    setExpertiseInput('');
                                  }
                                }}
                                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${expertiseInput.trim() ? 'text-[#0F9393] scale-110' : 'text-gray-300 opacity-50'}`}
                              >
                                <Plus size={20} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Good Fit For (Dynamic List) */}
                        <div className="flex flex-col gap-4">
                          <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Good Fit For</label>
                          <div className="flex flex-col gap-2 mb-4">
                            {profile.good_fit_for?.map((p: string, i: number) => (
                              <motion.div
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                key={i}
                                className="flex items-center justify-between bg-gray-50 px-5 py-4 rounded-2xl border border-gray-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-[#0F9393]" />
                                  <span className="text-[14px] font-bold text-gray-700">{p}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const items = [...(profile.good_fit_for || [])];
                                    items.splice(i, 1);
                                    setProfile({ ...profile, good_fit_for: items });
                                  }}
                                  className="text-gray-300 hover:text-red-400 transition-colors"
                                >
                                  <Plus size={16} className="rotate-45" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="e.g. Career decisions and early-career uncertainty..."
                              value={fitInput}
                              onChange={(e) => setFitInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (fitInput.trim()) {
                                    const current = profile.good_fit_for || [];
                                    setProfile({ ...profile, good_fit_for: [...current, fitInput.trim()] });
                                    setFitInput('');
                                  }
                                }
                              }}
                              className="w-full border-2 border-gray-50 rounded-2xl px-6 py-4 outline-none focus:border-[#0F9393] bg-gray-50 font-medium text-gray-800"
                            />
                            <div 
                              onClick={() => {
                                if (fitInput.trim()) {
                                  const current = profile.good_fit_for || [];
                                  setProfile({ ...profile, good_fit_for: [...current, fitInput.trim()] });
                                  setFitInput('');
                                }
                              }}
                              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all cursor-pointer ${fitInput.trim() ? 'text-[#0F9393] scale-110' : 'text-gray-300 opacity-50'}`}
                            >
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
                      <button 
                        type="button"
                        onClick={async () => {
                          setIsPushLoading(true);
                          try {
                            await subscribeToPush(profile?.phone);
                            alert('Notifications enabled! You will now receive alerts here.');
                          } catch (err: any) {
                            alert(err.message);
                          } finally {
                            setIsPushLoading(false);
                          }
                        }}
                        disabled={isPushLoading}
                        className="w-full mt-4 flex items-center justify-between p-6 bg-white rounded-[28px] border-2 border-gray-50 hover:border-[#0F9393]/20 hover:bg-[#0F9393]/5 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#0F9393] shadow-sm group-hover:bg-white transition-all">
                            <Bell size={20} />
                          </div>
                          <div className="flex flex-col items-start text-left">
                            <span className="text-[16px] font-bold text-gray-900">Enable Push Notifications</span>
                            <span className="text-[12px] text-gray-400 font-medium">{isPushLoading ? 'Establishing secure link...' : 'Get real-time alerts in this browser'}</span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPushLoading ? 'bg-gray-100' : 'bg-white'} shadow-sm group-hover:scale-110 transition-all`}>
                          <ExternalLink size={16} className="text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          )
        )}
      </main>

      {/* Close Session Modal */}
      <AnimatePresence>
        {closingSession && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setClosingSession(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl flex flex-col gap-6 relative z-10"
            >
              <div className="flex flex-col gap-2">
                <h2 className="text-[32px] font-bold tracking-tight text-gray-900 leading-none">Clinical Closure</h2>
                <p className="text-[13px] text-gray-400 font-bold uppercase tracking-widest">Final Diagnostic Summary</p>
              </div>
              
              <div className="relative">
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Enter detailed clinical observation and path forward..."
                  className="w-full h-[200px] border-2 border-gray-50 bg-gray-50 rounded-[32px] p-8 text-[15px] font-medium outline-none focus:border-[#0F9393] focus:bg-white transition-all resize-none shadow-inner"
                />
                {!summary && (
                  <div className="absolute top-8 left-8 pointer-events-none opacity-40">
                    <Sparkles size={20} className="text-[#0F9393]" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleCloseSession} 
                  disabled={loading || !summary.trim()} 
                  className="w-full h-[72px] bg-black text-white font-bold rounded-[24px] hover:bg-gray-800 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[16px]"
                >
                  {loading ? 'Finalizing...' : 'Close Session & Archive'}
                </button>
                <button 
                  onClick={() => setClosingSession(null)} 
                  className="w-full h-[60px] font-bold text-gray-400 hover:text-gray-600 rounded-[24px] transition-all text-[14px]"
                >
                  Continue Session
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <div className="w-16 h-16 bg-white rounded-3xl p-1 shadow-sm border border-gray-100 overflow-hidden relative">
                      <Image
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedSession?.guest_info?.name?.trim() || 'User')}&background=0F9393&color=fff`}
                        className="w-full h-full rounded-2xl object-cover"
                        alt={selectedSession?.guest_info?.name || 'User'}
                        width={64}
                        height={64}
                      />
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
                  {selectedSession?.status === 'completed' ? (
                    <div className="flex flex-col gap-6">
                      <div className="bg-white border border-gray-100 p-8 rounded-[36px] flex flex-col gap-3 shadow-sm">
                        <div className="flex items-center gap-2 text-[#0F9393]">
                          <Sparkles size={18} />
                          <span className="text-[12px] font-bold uppercase tracking-widest">Session Outcome</span>
                        </div>
                        <p className="text-[14px] text-gray-600 font-medium leading-relaxed italic">
                           &quot;{selectedSession?.session_summary || 'No detailed summary provided.'}&quot;
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSearchQuery(selectedSession?.guest_info?.phone || '');
                          setFilterStatus('all');
                          setActiveTab('history');
                          setShowSheet(false);
                        }}
                        className="w-full h-[76px] bg-black text-white rounded-[28px] font-bold text-[16px] shadow-2xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3"
                      >
                        See Whole History
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  ) : (
                    <>
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
                              localStorage.setItem('active_session_join', JSON.stringify({
                                id: selectedSession.id,
                                time: Date.now()
                              }));
                              window.open(`/api/room-redirect/${selectedSession.id}?type=therapist`, '_blank');
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
                          setClosingSession(selectedSession?.id || '');
                          setShowSheet(false);
                        }}
                        className="w-full text-center text-gray-400 font-bold text-[12px] uppercase tracking-widest py-2 hover:text-red-400 transition-all cursor-pointer"
                      >
                        Clinical Closure Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
