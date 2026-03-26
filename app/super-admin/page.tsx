'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Button from '@/components/ui/Button'
import { Newspaper, Trash2, Layout } from 'lucide-react'
import BlogEditor from '@/components/BlogEditor'

export default function SuperAdminDashboard() {
  const [supabase] = useState(() => createClient())
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [admins, setAdmins] = useState<any[]>([])
  const [isTherapist, setIsTherapist] = useState(false)
  const [activeTab, setActiveTab] = useState('invite')
  const [blogs, setBlogs] = useState<any[]>([])
  const [editingBlog, setEditingBlog] = useState<any>(null)

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
  }

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*, author_id(id)')
      .order('created_at', { ascending: false })
    if (data) setBlogs(data)
  }

  const handleSaveBlog = async (blogData: any) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const slug = blogData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

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
                 initialData={editingBlog.id ? editingBlog : undefined}
               />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {blogs.map((blog: any) => (
                    <div key={blog.id} className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-6 hover:shadow-md transition-all">
                       <div className="flex justify-between items-start">
                          <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${blog.published ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            {blog.published ? 'Published' : 'Draft'}
                          </span>
                       </div>
                       <h3 className="font-bold text-[20px] font-georgia leading-tight">{blog.title}</h3>
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] font-black text-[12px]">
                            {blog.author_id?.id ? 'A' : 'T'}
                          </div>
                          <div>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Author ID</p>
                            <p className="text-[14px] font-bold text-black truncate w-40">{blog.author_id?.id || 'Platform'}</p>
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
      </div>
    </div>
  )
}
