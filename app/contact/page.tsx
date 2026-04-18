'use client'

import { useState } from 'react'
import { submitContactInquiry } from '@/lib/actions'
import Button from '@/components/ui/Button'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await submitContactInquiry(formData)
      setSuccess(true)
      setFormData({ name: '', email: '', phone: '', message: '' })
    } catch (err) {
      alert('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white font-nunito pt-32 pb-20 px-6">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Left Side: Info */}
        <div className="flex flex-col gap-10">
          <div>
            <h1 className="text-[40px] font-georgia font-bold leading-tight mb-6">Let's start a <span className="text-[#0F9393]">conversation.</span></h1>
            <p className="text-gray-400 text-lg max-w-md">Whether you have a question about our therapy sessions, pricing, or anything else, our team is ready to answer all your questions.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393]">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Email us</p>
                <p className="text-xl font-bold">support@unheard.care</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#0F9393]/10 rounded-2xl flex items-center justify-center text-[#0F9393]">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Call us</p>
                <p className="text-xl font-bold">+91 98765 43210</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-10">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                <Send size={40} />
              </div>
              <h2 className="text-3xl font-georgia font-bold text-white">Message Sent!</h2>
              <p className="text-gray-400">Thank you for reaching out. We'll get back to you within 24 hours.</p>
              <Button onClick={() => setSuccess(false)} variant="white" className="mt-4">Send another</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-gray-400">
                  Your Name
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0F9393] transition-colors"
                    required
                  />
                </label>
                <label className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-gray-400">
                  Email Address
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0F9393] transition-colors"
                    required
                  />
                </label>
              </div>
              <label className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-gray-400">
                Phone Number
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 00000 00000" 
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0F9393] transition-colors"
                />
              </label>
              <label className="flex flex-col gap-2 font-bold text-xs uppercase tracking-widest text-gray-400">
                How can we help?
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  rows={5}
                  placeholder="Tell us about your requirements..." 
                  className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-[#0F9393] transition-colors resize-none"
                  required
                />
              </label>
              <Button type="submit" variant="white" className="w-full mt-4 h-[64px] rounded-2xl text-lg" disabled={loading}>
                {loading ? 'Sending Request...' : 'Send Message'}
              </Button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
