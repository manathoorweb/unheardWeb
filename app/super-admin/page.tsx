'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { 
  Trash2, Users, 
  PenTool, Ticket, Phone, 
  MonitorPlay, ArrowLeftRight, 
  Sparkles, 
  Plus, Smartphone, LogOut
} from 'lucide-react'
import Image from 'next/image'
import BlogEditor from '@/components/BlogEditor'
import { useCallback } from 'react'

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
  is_blogger: boolean;
  phone_number?: string;
  full_name?: string;
  qualification?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  usage_limit: number;
  usage_count: number;
  is_active: boolean;
  expires_at: string | null;
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: any[];
  published: boolean;
  created_at: string;
  author_id: { id: string } | string;
}

interface WhatsappStatus {
  status: 'disconnected' | 'initializing' | 'pending_qr' | 'authenticated' | 'error';
  qrDataUrl: string | null;
}

export default function SuperAdminDashboard() {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [admins, setAdmins] = useState<AdminRole[]>([])
  const [isTherapist, setIsTherapist] = useState(false)
  const [activeTab, setActiveTab] = useState('queue')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [showClosed, setShowClosed] = useState(false)
  const [virtualRooms, setVirtualRooms] = useState<any[]>([])
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>({ status: 'disconnected', qrDataUrl: null })
  const [editingProfile, setEditingProfile] = useState<any>(null)
  const [selectedQueueItem, setSelectedQueueItem] = useState<any | null>(null)
  const [showQueueSheet, setShowQueueSheet] = useState(false)
  const [cronStatus, setCronStatus] = useState<{ lastRun: string | null, loading: boolean }>({ lastRun: null, loading: false })
  
  // Coupon Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    usage_limit: -1,
    expires_at: ''
  })

  const logAction = async (action: string, targetId?: string, details?: any) => {
    try {
      await fetch('/api/admin/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, target_id: targetId, details })
      });
    } catch (e) {
      console.warn('Failed to log action:', e);
    }
  };

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setWhatsappStatus(data.data);
      }
    } catch {}
  }, []);

  const fetchBlogs = useCallback(async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, author_id(id)')
      .order('created_at', { ascending: false })
    if (data) setBlogs(data)
  }, [supabase]);

  const fetchAdmins = useCallback(async () => {
    const { data: profiles } = await supabase
      .from('therapist_profiles')
      .select('*')
      .order('full_name', { ascending: true })
    
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role, is_blogger, phone_number')

    if (profiles) {
      setAdmins(profiles.map((profile: any) => {
        const roleData = roles?.find(r => r.user_id === profile.user_id)
        return {
          id: profile.id,
          user_id: profile.user_id,
          role: roleData?.role || 'therapist',
          is_blogger: roleData ? !!roleData.is_blogger : false,
          phone_number: roleData?.phone_number || profile.phone,
          full_name: profile.full_name || 'Anonymous Professional',
          qualification: profile.qualification || 'Therapist'
        }
      }))
    }
  }, [supabase]);

  const fetchCoupons = useCallback(async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setCoupons(data)
  }, [supabase]);

  const fetchQueue = useCallback(async () => {
    let query = supabase
      .from('pre_booking_questionnaires')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!showClosed) {
        query = query.eq('status', 'pending');
    }
    
    const { data } = await query;
    if (data) setQueue(data);
  }, [supabase, showClosed]);

  const fetchVirtualRooms = useCallback(async () => {
    const { data } = await supabase.from('virtual_rooms').select('*').order('created_at', { ascending: false });
    if (data) setVirtualRooms(data);
  }, [supabase]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'whatsapp') {
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    if (window.location.hash === '#blogs') {
      setActiveTab('blogs');
      fetchBlogs();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, fetchStatus, fetchBlogs]);

  const triggerCron = async () => {
    setCronStatus(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/cron/notifications');
      const data = await res.json();
      if (data.success) {
        setCronStatus({ lastRun: new Date().toLocaleTimeString(), loading: false });
      } else {
        setCronStatus(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setCronStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    triggerCron();
    const interval = setInterval(triggerCron, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWhatsappReconnect = async () => {
    setWhatsappStatus({ status: 'initializing', qrDataUrl: null });
    await fetch('/api/whatsapp/reconnect', { method: 'POST' });
  };

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Run dependent checks after we have the session
        fetchAdmins();
        fetchQueue();
        fetchVirtualRooms();
        
        const { data } = await supabase
          .from('user_roles')
          .select('is_therapist')
          .eq('user_id', session.user.id)
          .single();
        if (data) setIsTherapist(data.is_therapist);
      }
    }
    init();
  }, [supabase, fetchAdmins, fetchQueue, fetchVirtualRooms]);

  const handleSaveBlog = async (blogData: Partial<Blog>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = (blogData.title || '').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

    const { error } = await supabase
      .from('blogs')
      .upsert({
        id: editingBlog?.id || undefined,
        author_id: user.id,
        title: blogData.title,
        slug,
        content: blogData.content,
        published: blogData.published,
        updated_at: new Date().toISOString()
      })

    if (error) {
      alert(error.message)
    } else {
      await logAction(editingBlog?.id ? 'edit_blog' : 'add_blog', blogData.title);
      alert('Blog saved successfully!')
      setEditingBlog(null)
      fetchBlogs()
      localStorage.removeItem('blog_draft')
    }
  }

  const toggleBloggerRole = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ is_blogger: !currentStatus })
      .eq('user_id', userId)
    
    if (error) {
      alert(error.message)
    } else {
      fetchAdmins()
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name, phone_number: phone }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('Invitation sent successfully!')
        setEmail('')
        setName('')
        setPhone('')
      } else {
        setMessage('Failed to send invite')
      }
    } catch {
      setMessage('Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTherapist = async (questionnaireId: string, therapistId: string, meetingLink: string) => {
    if (!therapistId) return alert('Please select a therapist first');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/assign-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionnaire_id: questionnaireId, therapist_id: therapistId, meeting_link: meetingLink }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Therapist assigned and WhatsApp messages dispatched!');
        setShowQueueSheet(false);
        fetchQueue();
      } else {
        alert(data.error || 'Failed to assign therapist');
      }
    } catch {
      alert('Error assigning therapist');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, userId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('therapist-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('therapist-assets')
        .getPublicUrl(filePath);

      setEditingProfile({ ...editingProfile, avatar_url: publicUrl });
      alert('Avatar uploaded! Please save the profile to finalize.');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = async (userId: string) => {
    setLoading(true);
    const { data } = await supabase.from('therapist_profiles').select('*').eq('user_id', userId).single();
    if (data) setEditingProfile(data);
    setLoading(false);
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('therapist_profiles')
      .update(editingProfile)
      .eq('user_id', editingProfile.user_id);

    if (error) {
      alert(error.message);
    } else {
      await logAction('profile_change', editingProfile.user_id, { name: editingProfile.full_name });
      alert('Profile updated successfully!');
      setEditingProfile(null);
      fetchAdmins();
    }
    setLoading(false);
  }


  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans flex flex-col md:flex-row relative">
      {/* Sidebar - Studio Admin Edition */}
      <aside className="hidden md:flex w-[280px] bg-white border-r border-gray-100 p-10 flex-col gap-10 sticky top-0 h-screen overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-2">
          <div className="w-12 h-12 bg-black rounded-[18px] flex items-center justify-center text-white shadow-xl">
            <Sparkles size={24} />
          </div>
          <h2 className="text-[22px] font-black tracking-tighter text-gray-900 mt-4">unHeard</h2>
          <p className="text-[10px] text-[#0F9393] font-black uppercase tracking-[0.4em]">System Admin</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => { setActiveTab('queue'); fetchQueue(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'queue' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Users size={18} /> Queue
          </button>
          <button 
            onClick={() => setActiveTab('invite')}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'invite' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Smartphone size={18} /> Staff
          </button>
          <button 
            onClick={() => { setActiveTab('blogs'); fetchBlogs(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'blogs' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <PenTool size={18} /> Content
          </button>
          <button 
            onClick={() => { setActiveTab('coupons'); fetchCoupons(); }}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'coupons' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Ticket size={18} /> Offers
          </button>
          <button 
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'whatsapp' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Phone size={18} /> Engine
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-4 px-6 py-4 rounded-[22px] font-black text-[13px] uppercase tracking-widest transition-all duration-300 cursor-pointer ${activeTab === 'system' ? 'bg-[#0F9393] text-white shadow-xl shadow-[#0F9393]/20 scale-105' : 'text-gray-400 hover:bg-gray-50'}`}
          >
            <Sparkles size={18} /> System
          </button>
        </nav>

        {isTherapist && (
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="mt-auto flex items-center gap-4 p-5 bg-black text-white rounded-[28px] hover:bg-gray-900 transition-all cursor-pointer shadow-xl group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#0F9393] flex items-center justify-center group-hover:rotate-12 transition-all">
              <ArrowLeftRight size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black tracking-tight leading-none">Therapist View</span>
              <span className="text-[9px] text-[#0F9393] font-black uppercase tracking-widest mt-1">Switch Pro</span>
            </div>
          </button>
        )}
      </aside>

      {/* Mobile Bottom Nav - Classic Fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 flex justify-around items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('queue')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'queue' ? 'text-[#0F9393]' : 'text-gray-400'}`}>
          <Users size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Queue</span>
        </button>
        <button onClick={() => setActiveTab('invite')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'invite' ? 'text-[#0F9393]' : 'text-gray-400'}`}>
          <Smartphone size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Staff</span>
        </button>
        <button onClick={() => setActiveTab('blogs')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'blogs' ? 'text-[#0F9393]' : 'text-gray-400'}`}>
          <PenTool size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Content</span>
        </button>
        <button onClick={() => setActiveTab('whatsapp')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'whatsapp' ? 'text-[#0F9393]' : 'text-gray-400'}`}>
          <Phone size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Engine</span>
        </button>
        <button onClick={() => setActiveTab('system')} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${activeTab === 'system' ? 'text-[#0F9393]' : 'text-gray-400'}`}>
          <Sparkles size={20} />
          <span className="text-[10px] font-bold uppercase tracking-wider">System</span>
        </button>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 p-5 md:p-12 overflow-y-auto max-h-screen pb-32 md:pb-12">
        {/* Top Header Controls */}
        <div className="flex justify-between items-center mb-10 md:mb-12">
           <div className="flex flex-col">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">System Controller</p>
              <h1 className="text-[24px] font-bold text-gray-900 tracking-tight leading-none">Super Admin</h1>
           </div>
           <div className="flex gap-2">
              {isTherapist && (
                <button 
                  onClick={() => window.location.href = '/admin/dashboard'}
                  className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-[#0F9393] cursor-pointer hover:bg-gray-50 transition-all"
                  title="Switch to Therapist View"
                >
                  <MonitorPlay size={18} />
                </button>
              )}
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = '/login';
                }}
                className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-red-400 cursor-pointer hover:bg-red-50 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
           </div>
        </div>

        {activeTab === 'invite' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Invite Form */}
            <div className="bg-white p-10 rounded-[24px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
              <h2 className="text-[24px] font-bold font-georgia text-gray-900">Invite a New Therapist</h2>
              <form onSubmit={handleInvite} className="flex flex-col gap-6">
                <label className="flex flex-col font-bold text-[14px] text-gray-700">
                  Therapist&apos;s Name
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
                  Phone Number
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number" 
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
                  {loading ? 'Sending...' : 'Send Invite (Email & WhatsApp)'}
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
                        <div className="flex items-center gap-3">
                           <h4 className="font-bold text-[18px] text-[#0F9393]">{admin.full_name}</h4>
                           <span className="text-[12px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">{admin.phone_number || 'No Phone Sync'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[14px] text-gray-600">{admin.qualification || 'Awaiting profile setup'}</p>
                           <span className="text-gray-300">•</span>
                           <button 
                             onClick={() => toggleBloggerRole(admin.user_id, admin.is_blogger)}
                             className={`text-[12px] font-black uppercase tracking-widest ${admin.is_blogger ? 'text-[#0F9393]' : 'text-gray-400 hover:text-gray-600'}`}
                           >
                              {admin.is_blogger ? 'Blogger Active' : 'Enable Blogging'}
                           </button>
                           <span className="text-gray-300">•</span>
                           <button 
                             onClick={() => handleEditProfile(admin.user_id)}
                             className="text-[12px] font-black uppercase tracking-widest text-[#0F9393] hover:underline"
                           >
                              Edit Profile
                           </button>
                        </div>
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
        )}

        {activeTab === 'blogs' && (
          <div className="flex flex-col gap-8">
            {/* Mobile Fallback */}
            <div className="md:hidden flex flex-col items-center justify-center py-20 px-6 bg-white rounded-[32px] border border-dashed border-gray-200 text-center gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                <PenTool size={32} />
              </div>
              <h3 className="text-[20px] font-bold text-gray-900">Desktop Only Feature</h3>
              <p className="text-gray-500 text-[14px] leading-relaxed max-w-[280px]">Please open this on a desktop computer to access the clinical content management and blog editor tools.</p>
            </div>

            {/* Desktop Blog View */}
            <div className="hidden md:flex flex-col gap-8">
              {editingBlog ? (
               <BlogEditor 
                 onSave={handleSaveBlog}
                 onBack={() => setEditingBlog(null)}
                 initialData={(editingBlog || undefined) as any}
               />
             ) : (
               <div className="flex flex-col gap-8">
                 <div className="flex justify-end">
                   <Button 
                     variant="black" 
                     className="h-[50px] gap-2 px-8"
                     onClick={() => setEditingBlog({ title: '', content: [], published: false })}
                   >
                     Write Official Blog
                   </Button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {blogs.map((blog: Blog) => (
                    <div key={blog.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${blog.published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                       </div>
                       <h3 className="font-bold text-[20px] font-georgia leading-tight">{blog.title}</h3>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] font-black text-[12px]">
                            {typeof blog.author_id !== 'string' && blog.author_id?.id ? 'A' : 'T'}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Author ID</p>
                            <p className="text-[14px] font-bold text-black truncate w-40">
                              {typeof blog.author_id === 'string' ? blog.author_id : (blog.author_id?.id || 'Platform')}
                            </p>
                          </div>
                       </div>
                       <div className="flex gap-3 pt-4 border-t border-gray-50">
                          <button onClick={() => setEditingBlog(blog)} className="flex-grow h-[45px] bg-[#0F9393]/5 text-[#0F9393] font-bold rounded-xl text-[14px]">Edit</button>
                          <button 
                            className="w-[45px] h-[45px] bg-red-50 flex items-center justify-center text-red-300 rounded-xl"
                            onClick={async () => {
                              if (confirm('Delete this blog?')) {
                                await supabase.from('blogs').delete().eq('id', blog.id)
                                fetchBlogs()
                              }
                             }}>
                             <Trash2 size={18} />
                           </button>
                       </div>
                    </div>
                 ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="bg-white p-6 md:p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-8 text-black min-h-[500px]">
             <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div className="flex flex-col gap-1">
                   <h2 className="text-[26px] md:text-[32px] font-bold font-georgia text-gray-900 tracking-tight">{showClosed ? 'All Requests' : 'Clinical Intake Queue'}</h2>
                   <p className="text-gray-400 font-bold text-[13px] uppercase tracking-widest">{showClosed ? 'Full session request history' : 'Assessing new patient questionnaires'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                   <button 
                      onClick={() => { setShowClosed(!showClosed); fetchQueue(); }}
                      className={`flex-1 md:flex-none px-6 py-3 rounded-2xl text-[13px] font-bold transition-all border shadow-sm ${showClosed ? 'bg-black text-white border-black' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                   >
                      {showClosed ? 'View Pending Only' : 'Monitor Full History'}
                   </button>
                   <button 
                     onClick={fetchQueue}
                     className="w-12 h-12 md:w-auto md:px-6 bg-[#0F9393]/5 text-[#0F9393] rounded-2xl flex items-center justify-center font-bold text-[13px] hover:bg-[#0F9393]/10 transition-all border border-[#0F9393]/10"
                     title="Refresh Queue"
                   >
                      <Sparkles size={18} className="md:mr-2" />
                      <span className="hidden md:inline">Sync Data</span>
                   </button>
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {queue.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <p className="text-gray-500 font-bold mb-2">Queue is Clear</p>
                    <p className="text-gray-400 text-[14px]">No pending intakes require clinical assessment.</p>
                  </div>
                ) : (
                  queue.map((request, i) => {
                    const qAnswers = request.answers || {};
                    const isAllotted = request.status === 'allotted';
                    const displayName = qAnswers.name || qAnswers.guest_info?.name || (request.guest_name !== 'Guest' ? request.guest_name : 'Anonymous User');
                    
                    return (
                      <div 
                        key={request.id || i} 
                        onClick={() => { setSelectedQueueItem(request); setShowQueueSheet(true); }}
                        className={`p-6 border rounded-[28px] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 group ${isAllotted ? 'bg-gray-50/50 border-gray-100 grayscale' : 'bg-white border-[#0F9393]/10'}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393] font-bold">
                            {displayName[0]}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[16px] font-bold text-gray-900">
                              {displayName}
                            </span>
                            <span className={`text-[11px] font-black uppercase tracking-widest mt-1 ${isAllotted ? 'text-gray-400' : 'text-[#0F9393]'}`}>{request.is_trial ? 'Discovery' : 'Standard'}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-3 md:gap-8">
                           <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Age</span>
                              <span className="text-[14px] font-bold text-gray-800">{qAnswers.age || 'N/A'}</span>
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Language</span>
                              <span className="text-[14px] font-bold text-gray-800">{qAnswers.language || 'N/A'}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-4">
                           <div className="flex flex-col md:items-end">
                              <span className="text-[14px] font-bold text-gray-900">{new Date(request.requested_start_time).toLocaleDateString([], { day: '2-digit', month: 'short' })}</span>
                              <span className="text-[11px] font-bold text-gray-400">{new Date(request.requested_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                           <button className="px-5 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-black group-hover:text-white transition-all">
                             Assess
                           </button>
                        </div>
                      </div>
                    )
                  })
                )}
             </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-black">
            {/* Create Coupon */}
            <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6">
              <h2 className="text-[24px] font-bold font-georgia text-gray-900">Create New Coupon</h2>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const { error } = await supabase.from('coupons').insert([couponForm]);
                  if (error) alert(error.message);
                  else {
                    alert('Coupon created!');
                    setCouponForm({ code: '', discount_type: 'percentage', value: 0, usage_limit: -1, expires_at: '' });
                    fetchCoupons();
                  }
                }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-2">
                  <label className="text-[14px] font-bold text-gray-600">Coupon Code</label>
                  <input 
                    type="text" 
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none" 
                    placeholder="E.g. UNHEARD20"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Type</label>
                    <select 
                      value={couponForm.discount_type}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as any })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none bg-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Value</label>
                    <input 
                      type="number" 
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Usage Limit (-1 for unlimited)</label>
                    <input 
                      type="number" 
                      value={couponForm.usage_limit}
                      onChange={(e) => setCouponForm({ ...couponForm, usage_limit: Number(e.target.value) })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                      required
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[14px] font-bold text-gray-600">Expires At (Optional)</label>
                    <input 
                      type="date" 
                      value={couponForm.expires_at}
                      onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                      className="border border-gray-200 rounded-full px-5 py-3 focus:border-[#0F9393] outline-none"
                    />
                  </div>
                </div>
                <Button variant="black" type="submit" className="mt-4">Generate Coupon Code</Button>
              </form>
            </div>

            {/* List Coupons */}
            <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 overflow-hidden">
               <h2 className="text-[24px] font-bold font-georgia text-gray-900">Active Coupons</h2>
               <div className="flex flex-col gap-4 overflow-y-auto max-h-[600px] pr-2">
                  {coupons.length === 0 ? (
                    <p className="text-gray-400 italic">No coupons created yet.</p>
                  ) : (
                    coupons.map((coupon, i) => (
                      <div key={coupon.id || i} className="p-5 border border-gray-100 rounded-2xl hover:bg-gray-50/50 transition-all group">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col">
                               <span className="text-[20px] font-black text-[#0F9393] tracking-wider">{coupon.code}</span>
                               <span className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                                 {coupon.discount_type === 'percentage' ? `${coupon.value}% Off` : `₹${coupon.value} Off`}
                               </span>
                            </div>
                            <button 
                              onClick={async () => {
                                if(confirm('Delete coupon?')) {
                                  await supabase.from('coupons').delete().eq('id', coupon.id);
                                  fetchCoupons();
                                }
                              }}
                              className="text-red-200 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-sm">
                               <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Usage</p>
                               <p className="text-[14px] font-bold text-gray-700">{coupon.usage_count} / {coupon.usage_limit === -1 ? '∞' : coupon.usage_limit}</p>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-gray-50 shadow-sm">
                               <p className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">Status</p>
                               <p className={`text-[14px] font-bold ${coupon.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                 {coupon.is_active ? 'Active' : 'Disabled'}
                               </p>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'whatsapp' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center text-center max-w-[600px] mx-auto text-black mt-8">
            <h2 className="text-[28px] font-bold font-georgia text-gray-900 mb-2">WhatsApp Integration</h2>
            <p className="text-gray-500 mb-8">Scan to connect the automated message dispatcher.</p>
            
            {whatsappStatus.status === 'authenticated' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-inner">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-[24px] font-bold text-green-600 tracking-tight">Connected & Automated</h3>
                <p className="text-gray-500 mb-6 max-w-[300px]">The secure WebSocket session is actively running and ready to dispatch messages.</p>
                <div className="flex gap-4">
                  <Button variant="black" onClick={handleWhatsappReconnect} className="bg-red-600 hover:bg-red-700">Reset Login & Logout</Button>
                </div>
              </div>
            )}

            {whatsappStatus.status === 'error' && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-2 shadow-inner">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <h3 className="text-[24px] font-bold text-red-600 tracking-tight">Session Expired</h3>
                <p className="text-gray-500 mb-6 max-w-[300px]">The WhatsApp connection was closed due to a protocol error. Manual re-authentication is required.</p>
                <Button variant="black" className="bg-red-600 hover:bg-red-700" onClick={handleWhatsappReconnect}>Full Reset & Scan QR</Button>
              </div>
            )}

            {whatsappStatus.status === 'pending_qr' && whatsappStatus.qrDataUrl && (
              <div className="flex flex-col items-center gap-6">
                 <div className="p-4 border border-gray-200 rounded-3xl bg-white shadow-xl shadow-black/5">
                   <Image src={whatsappStatus.qrDataUrl} alt="WhatsApp QR Code" width={280} height={280} className="rounded-xl" />
                 </div>
                 <div className="flex flex-col gap-2 bg-gray-50 p-6 rounded-2xl w-full">
                   <p className="text-gray-700 font-bold text-[14px]">1. Open WhatsApp on your phone</p>
                   <p className="text-gray-700 font-bold text-[14px]">2. Tap Menu or Settings and select Linked Devices</p>
                   <p className="text-gray-700 font-bold text-[14px]">3. Point your phone to this screen</p>
                 </div>
                 <Button variant="black" onClick={handleWhatsappReconnect} className="w-full mt-2">Refresh QR Code</Button>
              </div>
            )}

            {(whatsappStatus.status === 'disconnected' || whatsappStatus.status === 'initializing') && (
               <div className="flex flex-col items-center gap-6 py-12">
                 <div className="w-16 h-16 border-4 border-gray-100 border-t-[#0F9393] rounded-full animate-spin"></div>
                 <div className="flex flex-col gap-1">
                   <p className="text-black text-[18px] font-bold">
                     {whatsappStatus.status === 'initializing' ? 'Booting Secure WebSocket Connection...' : 'Waiting for Engine Startup'}
                   </p>
                   <p className="text-gray-400 text-[14px]">
                     Establishing link with Supabase session store
                   </p>
                 </div>
                 {whatsappStatus.status === 'disconnected' && (
                   <Button variant="black" onClick={handleWhatsappReconnect} className="mt-4">
                     Start WhatsApp Engine
                   </Button>
                 )}
               </div>
            )}
          </div>
        )}
        {activeTab === 'rooms' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 flex flex-col gap-6 text-black">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h2 className="text-[28px] font-bold font-georgia text-gray-900">Virtual Room Engine</h2>
                    <p className="text-gray-500 font-nunito">Supply Google Meet links to beautifully automate session routing without any APIs.</p>
                 </div>
                 <form 
                   onSubmit={async (e) => {
                     e.preventDefault();
                     const formData = new FormData(e.currentTarget);
                     const { error } = await supabase.from('virtual_rooms').insert({
                       name: formData.get('name'),
                       gmeet_link: formData.get('gmeet_link')
                     });
                     if (error) alert(error.message);
                     else {
                       fetchVirtualRooms();
                       (e.target as HTMLFormElement).reset();
                     }
                   }}
                   className="flex gap-3 bg-gray-50 p-2 rounded-2xl"
                 >
                   <input required name="name" type="text" placeholder="e.g. Room A" className="px-4 py-2 rounded-xl border border-gray-200" />
                   <input required name="gmeet_link" type="url" placeholder="https://meet.google.com/..." className="px-4 py-2 rounded-xl border border-gray-200 w-[280px]" />
                   <Button variant="black" type="submit">Add Room</Button>
                 </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {virtualRooms.length === 0 ? (
                   <div className="col-span-full py-20 text-center flex flex-col items-center">
                      <p className="text-gray-400 font-bold">No virtual rooms configured.</p>
                   </div>
                 ) : (
                   virtualRooms.map((room, i) => (
                     <div key={room.id || i} className="p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 shadow-sm bg-gray-50/50">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-[18px]">{room.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${room.is_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {room.is_active ? 'Active' : 'Disabled'}
                          </span>
                        </div>
                        <p className="text-[12px] font-mono p-3 bg-white rounded-xl break-all border border-gray-100 text-gray-500">{room.gmeet_link}</p>
                        <div className="flex gap-2 mt-2">
                           <button 
                             onClick={async () => {
                               const { error } = await supabase.from('virtual_rooms').delete().eq('id', room.id);
                               if (!error) fetchVirtualRooms();
                             }}
                             className="flex-1 bg-red-50 text-red-500 font-bold text-[13px] py-2.5 rounded-xl hover:bg-red-100 transition-all"
                           >
                             Remove Pool
                           </button>
                        </div>
                     </div>
                   ))
                 )}
              </div>
          </div>
        )}
        {editingProfile && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-4xl rounded-[32px] p-10 shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center">
                <h2 className="text-[28px] font-georgia font-bold text-gray-900">Edit Therapist Profile</h2>
                <button onClick={() => setEditingProfile(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕ Close</button>
              </div>

              <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="col-span-full flex items-center gap-6 mb-4">
                  <div 
                    className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group cursor-pointer"
                    onClick={() => document.getElementById('admin-avatar-upload')?.click()}
                  >
                    <Image
                      src={editingProfile.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(editingProfile.full_name?.trim() || 'Therapist')}&background=0F9393&color=fff`}
                      width={96} height={96} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="Avatar"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={24} className="text-[#0F9393]" />
                    </div>
                    <input 
                      id="admin-avatar-upload"
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={(e) => handleProfileImageUpload(e, editingProfile.user_id)}
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-gray-900">{loading ? 'Uploading...' : 'Therapist Portrait'}</span>
                    <span className="text-[12px] text-gray-400">Click to change professional photo</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    value={editingProfile.full_name || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, full_name: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-5 py-3 outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Microtag (e.g. Aligned Growth)</label>
                  <input 
                    type="text" 
                    value={editingProfile.microtag || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, microtag: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-5 py-3 outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Qualification</label>
                  <input 
                    type="text" 
                    value={editingProfile.qualification || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, qualification: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-5 py-3 outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Tagline</label>
                  <input 
                    type="text" 
                    value={editingProfile.tagline || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, tagline: e.target.value})}
                    className="w-full border border-gray-100 rounded-xl px-5 py-3 outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold italic"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Biography</label>
                  <textarea 
                    value={editingProfile.bio || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, bio: e.target.value})}
                    className="w-full h-32 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:border-[#0F9393] bg-gray-50/50 font-medium resize-none"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Therapeutic Approach</label>
                  <textarea 
                    value={editingProfile.approach || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, approach: e.target.value})}
                    className="w-full h-32 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:border-[#0F9393] bg-gray-50/50 font-medium resize-none"
                  />
                </div>
                <div className="col-span-full flex flex-col gap-2">
                  <label className="text-[12px] font-black text-gray-400 uppercase">Good Fit For (One per line)</label>
                  <textarea 
                    value={editingProfile.good_fit_for?.join('\n') || ''} 
                    onChange={(e) => setEditingProfile({...editingProfile, good_fit_for: e.target.value.split('\n').filter(l => l.trim())})}
                    className="w-full h-32 border border-gray-100 rounded-xl px-5 py-4 outline-none focus:border-[#0F9393] bg-gray-50/50 font-medium resize-none"
                  />
                </div>
                <div className="col-span-full pt-4">
                  <Button type="submit" variant="black" className="w-full h-[60px] text-[18px]" disabled={loading}>
                    {loading ? 'Saving...' : 'Update Profile'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
           {activeTab === 'system' && (
             <div className="flex flex-col gap-8 max-w-4xl mx-auto">
                <div className="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
                   <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                            <Sparkles size={28} />
                         </div>
                         <div>
                            <h3 className="text-[24px] font-bold text-gray-900 tracking-tight">Notification Engine</h3>
                            <p className="text-gray-400 text-[13px] font-bold">Automated reminders & meeting link delivery</p>
                         </div>
                      </div>
                      <div className="flex flex-col items-end">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engine Status</span>
                         <span className="flex items-center gap-2 text-green-500 font-bold text-[14px]">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Active (Auto-Pilot)
                         </span>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100">
                         <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-4">Last Processed Sync</p>
                         <h4 className="text-[28px] font-bold text-gray-900">{cronStatus.lastRun || 'Never'}</h4>
                         <p className="text-gray-500 text-[12px] mt-2">Next auto-sync in 15 minutes</p>
                      </div>

                      <div className="flex flex-col justify-center gap-4">
                         <Button 
                           variant="black" 
                           onClick={triggerCron}
                           disabled={cronStatus.loading}
                           className="h-[70px] bg-[#0F9393] hover:bg-[#0D7F7F] border-none rounded-3xl font-black uppercase tracking-widest text-[14px] shadow-xl"
                         >
                            {cronStatus.loading ? 'Synchronizing...' : 'Manual Sync Now'}
                         </Button>
                         <p className="text-gray-400 text-[11px] text-center font-bold px-4">
                            Triggering a manual sync will instantly check for upcoming sessions and dispatch any pending 6h or 15m WhatsApp reminders.
                         </p>
                      </div>
                   </div>

                   <div className="mt-10 pt-10 border-t border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest">6h Reminder</span>
                         <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Sends the secure meeting link to the patient precisely 6 hours before the session.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest">15m Reminder</span>
                         <p className="text-[13px] text-gray-500 leading-relaxed font-medium">Final alert sent to both patient and therapist to ensure everyone joins the room on time.</p>
                      </div>
                      <div className="flex flex-col gap-2">
                         <span className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest">Auto-Pilot</span>
                         <p className="text-[13px] text-gray-500 leading-relaxed font-medium">As long as this dashboard is open in any admin's browser, reminders will be sent automatically.</p>
                      </div>
                   </div>
                </div>
             </div>
           )}
        </main>

      {/* Clinical Intake Detail Sheet */}
      {showQueueSheet && selectedQueueItem && (
        <div className="fixed inset-0 z-[200]">
          <div onClick={() => setShowQueueSheet(false)} className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] bg-[#F8F9FA] rounded-t-[42px] shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="w-full flex justify-center py-4 cursor-grab">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-10 flex flex-col gap-8">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-white rounded-3xl p-1 shadow-sm border border-gray-100">
                    <div className="w-full h-full bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393] text-2xl font-bold">
                      {(selectedQueueItem.guest_name !== 'Guest' && selectedQueueItem.guest_name) ? selectedQueueItem.guest_name[0] : (selectedQueueItem.answers?.name?.[0] || selectedQueueItem.answers?.guest_info?.name?.[0] || 'A')}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-[24px] font-bold tracking-tight text-gray-900">
                      {selectedQueueItem.answers?.name || selectedQueueItem.answers?.guest_info?.name || (selectedQueueItem.guest_name !== 'Guest' ? selectedQueueItem.guest_name : 'Anonymous User')}
                    </h2>
                    <p className="text-[#0F9393] font-bold text-[13px] uppercase tracking-widest">{selectedQueueItem.is_trial ? 'Discovery Session' : 'Standard Session'}</p>
                  </div>
                </div>
                <button onClick={() => setShowQueueSheet(false)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100"><Plus size={20} className="rotate-45" /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Service</span>
                    <span className="text-[14px] font-bold text-gray-900">{selectedQueueItem.answers?.service || 'N/A'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Language</span>
                    <span className="text-[14px] font-bold text-gray-900">{selectedQueueItem.answers?.language || 'N/A'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Age Group</span>
                    <span className="text-[14px] font-bold text-gray-900">{selectedQueueItem.answers?.age || 'N/A'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Phone</span>
                    <span className="text-[14px] font-bold text-gray-900">{selectedQueueItem.guest_phone || 'N/A'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email</span>
                    <span className="text-[14px] font-bold text-gray-900 truncate block">{selectedQueueItem.guest_email || 'N/A'}</span>
                 </div>
                 <div className="bg-white border border-gray-100 p-5 rounded-[28px] shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Requested</span>
                    <span className="text-[14px] font-bold text-gray-900">{new Date(selectedQueueItem.requested_start_time).toLocaleDateString([], { day: '2-digit', month: 'short' })} {new Date(selectedQueueItem.requested_start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
              </div>

              {selectedQueueItem.status !== 'allotted' ? (
                <div className="bg-[#111111] rounded-[40px] p-8 md:p-10 text-white shadow-2xl flex flex-col gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#0F9393] rounded-full" />
                    <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.3em]">Clinical Assignment</h4>
                  </div>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAssignTherapist(
                        selectedQueueItem.id, 
                        formData.get('therapist_id') as string,
                        formData.get('meeting_link') as string
                      );
                    }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Primary Therapist</label>
                       <select 
                         name="therapist_id" 
                         required
                         defaultValue=""
                         className="w-full h-[64px] border-none rounded-2xl px-6 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-[#0F9393] transition-all"
                       >
                         <option value="" disabled className="text-black">Choose Professional...</option>
                         {admins.map((admin, i) => (
                           <option key={admin.user_id || i} value={admin.user_id} className="text-black">{admin.full_name || 'Professional'}</option>
                         ))}
                       </select>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-bold text-[#0F9393] uppercase tracking-widest ml-1">Session Gateway (Optional Override)</label>
                       <input 
                         type="url"
                         name="meeting_link"
                         placeholder="Paste custom Google Meet link here..."
                         className="w-full h-[64px] border-none rounded-2xl px-6 bg-white/5 text-white font-bold outline-none focus:ring-2 focus:ring-[#0F9393] transition-all placeholder:text-gray-600"
                       />
                    </div>

                    <Button variant="black" type="submit" disabled={loading} className="w-full h-[76px] bg-[#0F9393] hover:bg-[#0D7F7F] border-none text-[16px] font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl mt-4">
                       {loading ? 'Processing...' : 'Confirm Assignment'}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="bg-green-500/5 border border-green-500/10 p-10 rounded-[40px] flex flex-col items-center text-center gap-4">
                   <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500">
                      <Sparkles size={40} />
                   </div>
                   <h3 className="text-[24px] font-bold text-gray-900">Successfully Allotted</h3>
                   <p className="text-gray-500 max-w-xs">This request has been processed and clinical resources have been assigned.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
