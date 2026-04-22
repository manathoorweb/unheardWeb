'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Trash2 } from 'lucide-react'
import Image from 'next/image'
import BlogEditor from '@/components/BlogEditor'

import { useCallback } from 'react'

interface AdminRole {
  id: string;
  user_id: string;
  role: string;
  is_blogger: boolean;
  full_name?: string;
  qualification?: string;
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [admins, setAdmins] = useState<AdminRole[]>([])
  const [isTherapist, setIsTherapist] = useState(false)
  const [activeTab, setActiveTab] = useState('invite')
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [editingBlog, setEditingBlog] = useState<Partial<Blog> | null>(null)
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsappStatus>({ status: 'disconnected', qrDataUrl: null })

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success) {
        setWhatsappStatus(data.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTab === 'whatsapp') {
      // Fetch immediately, then poll
      fetchStatus();
      interval = setInterval(fetchStatus, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, fetchStatus]);

  const handleWhatsappReconnect = async () => {
    setWhatsappStatus({ status: 'initializing', qrDataUrl: null });
    await fetch('/api/whatsapp/reconnect', { method: 'POST' });
  };

  const fetchAdmins = useCallback(async () => {
    // Fetch roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .in('role', ['admin', 'super_admin', 'blogger'])
    
    // Fetch profiles
    const { data: profiles } = await supabase
      .from('therapist_profiles')
      .select('user_id, full_name, qualification')

    if (roles) {
      setAdmins(roles.map((role: any) => {
        const profile = profiles?.find(p => p.user_id === role.user_id)
        return {
          ...role,
          full_name: profile?.full_name || 'Admin User',
          qualification: profile?.qualification
        }
      }))
    }
  }, [supabase]);

  const fetchBlogs = useCallback(async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, author_id(id)')
      .order('created_at', { ascending: false })
    if (data) setBlogs(data)
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Run dependent checks after we have the session
        fetchAdmins();
        
        const { data } = await supabase
          .from('user_roles')
          .select('is_therapist')
          .eq('user_id', session.user.id)
          .single();
        if (data) setIsTherapist(data.is_therapist);
      }
    }
    init();
  }, [supabase, fetchAdmins]);

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
        body: JSON.stringify({ email, full_name: name }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage('Invitation sent successfully!')
        setEmail('')
        setName('')
      } else {
        setMessage('Failed to send invite')
      }
    } catch {
      setMessage('Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FEFEFC] p-8 md:p-12 font-nunito">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <h1 className="text-[40px] font-georgia font-bold text-[#0F9393]">Super Admin Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <nav className="flex bg-gray-100 p-1.5 rounded-full">
               <button 
                  onClick={() => setActiveTab('invite')}
                  className={`px-6 py-2 rounded-full font-bold text-[14px] transition-all ${activeTab === 'invite' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
               >
                  Management
               </button>
               <button 
                  onClick={() => { setActiveTab('blogs'); fetchBlogs(); }}
                  className={`px-6 py-2 rounded-full font-bold text-[14px] transition-all ${activeTab === 'blogs' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
               >
                  Blog Library
               </button>
               <button 
                  onClick={() => setActiveTab('whatsapp')}
                  className={`px-6 py-2 rounded-full font-bold text-[14px] transition-all ${activeTab === 'whatsapp' ? 'bg-white text-black shadow-sm' : 'text-gray-400'}`}
               >
                  WhatsApp Bot
               </button>
            </nav>

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
                        <div className="flex items-center gap-2">
                           <p className="text-[14px] text-gray-600">{admin.qualification || 'Awaiting profile setup'}</p>
                           <span className="text-gray-300">•</span>
                           <button 
                             onClick={() => toggleBloggerRole(admin.user_id, admin.is_blogger)}
                             className={`text-[12px] font-black uppercase tracking-widest ${admin.is_blogger ? 'text-[#0F9393]' : 'text-gray-400 hover:text-gray-600'}`}
                           >
                              {admin.is_blogger ? 'Blogger Active' : 'Enable Blogging'}
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
             <div className="flex justify-between items-center bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <div className="flex flex-col">
                  <h2 className="text-[24px] font-georgia font-bold text-black">Global Blog Repository</h2>
                  <p className="text-gray-400 font-bold text-[14px] uppercase tracking-widest">Monitor and curate all platform content</p>
                </div>
                {!editingBlog && (
                  <Button 
                    variant="black" 
                    className="h-[50px] gap-2"
                    onClick={() => setEditingBlog({ title: '', content: [], published: false })}
                  >
                    Write Official Blog
                  </Button>
                )}
             </div>

              {editingBlog ? (
               <BlogEditor 
                 onSave={handleSaveBlog}
                 initialData={(editingBlog || undefined) as any}
               />
             ) : (
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
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 ))}
               </div>
             )}
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
      </div>
    </div>
  )
}
