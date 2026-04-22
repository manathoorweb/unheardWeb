'use client';
import React, { useState, useEffect } from 'react';
import { requestSession } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    therapist_id?: string;
    type?: string;
    age?: string;
    service?: string;
  };
}

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  avatar_url: string;
  bio?: string;
  specialties?: string[];
  pricing?: Record<string, number>;
}

export default function BookingModal({ isOpen, onClose, initialConfig }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  const [user, setUser] = useState<any>(null); // Supabase user type is complex, leaving any for now or using User from @supabase/supabase-js if available. 
  // Actually I can just use 'any' for the user object from supabase for now or specify 'any' to avoid the 'any' error if it's strict.
  // The error was on line 27.
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    language: '',
    type: '',
    age: '',
    service: '',
    therapist_id: '',
    is_trial: true,
    scheduled_date: '',
    scheduled_time: ''
  });

  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [previewTherapist, setPreviewTherapist] = useState<Therapist | null>(null);

  useEffect(() => {
    async function fetchTherapists() {
      const { data } = await supabase.from('therapist_profiles').select('*');
      if (data) setTherapists(data);
    }
    fetchTherapists();
  }, [supabase]);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || prev.phone
        }));
      }
    }
    checkUser();
  }, [supabase]);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setFormData(prev => ({
        ...prev,
        therapist_id: initialConfig.therapist_id || prev.therapist_id,
        type: initialConfig.type || prev.type,
        age: initialConfig.age || prev.age,
        service: initialConfig.service || prev.service,
      }));
    }
  }, [isOpen, initialConfig]);

  const dispatchOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setDirection(1);
      setStep(2);
    } catch (err: any) {
      alert("Failed to send OTP: " + (err.message || 'Messaging offline.'));
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setDirection(1);
      setStep(3); // Go to Care Type
    } catch (err: any) {
      alert("Failed to verify OTP: " + (err.message || 'Incorrect Code'));
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1 && formData.phone) {
      return dispatchOTP();
    }
    if (step === 2) {
      return verifyOTP();
    }
    
    setDirection(1);
    setStep((s) => Math.min(s + 1, 6)); // Max steps is now 6
  };

  const handlePrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };
  
  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setDirection(1);
    }, 300);
  };

  const handleBookNow = async () => {
    setLoading(true);
    try {
      localStorage.setItem('unheard_booking_basic', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      }));

      // Merge Date and Time into ISO string
      let rawDateStr = new Date().toISOString();
      if (formData.scheduled_date && formData.scheduled_time) {
         // Create local datetime
         const combined = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
         rawDateStr = new Date(combined).toISOString();
      }

      await requestSession({
        therapist_id: formData.therapist_id,
        start_time: rawDateStr,
        is_trial: formData.is_trial,
        phone: formData.phone,
        patient_details: !user ? {
          name: formData.name,
          email: formData.email
        } : undefined,
        questionnaire: {
          age: formData.age,
          language: formData.language,
          type: formData.type,
          service: formData.service
        }
      });
      alert('Booking Request Sent Successfully!');
      closeAndReset();
    } catch (err: any) {
      alert(err.message || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  const handlePressStart = (t: Therapist) => {
    const timer = setTimeout(() => {
      setPreviewTherapist(t);
    }, 500);
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) clearTimeout(pressTimer);
  };

  const selectedTherapistData = therapists.find(t => t.user_id === formData.therapist_id);

  const getPricing = () => {
    const defaultPricing = { trial: 399, single: 999, standard: 2999, premium: 1999 };
    if (!selectedTherapistData?.pricing) return defaultPricing;
    return { ...defaultPricing, ...selectedTherapistData.pricing };
  };

  const currentPricing = getPricing();

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 50 : -50, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0 })
  };

  const renderStepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-[#0F9393]' : 'w-4 bg-gray-200'}`} />
      ))}
      <span className="ml-2 font-nunito font-bold text-[12px] text-gray-400 uppercase tracking-wider">
        Step {step}/6
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[1000px] h-full md:h-auto md:min-h-[600px] bg-white md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row group/modal"
          >
            {/* Desktop Branding Column */}
            <div className="hidden md:flex md:w-[40%] bg-[#111111] relative p-12 flex-col justify-between overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0F9393]/20 blur-[100px] rounded-full" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#0F9393]/10 blur-[100px] rounded-full" />
              <div className="relative z-10">
                <Image src="/assets/logo unherd white.svg" alt="unHeard" width={120} height={40} className="h-[40px] w-auto mb-12" priority />
                <h2 className="font-georgia text-[36px] font-bold text-white leading-tight mb-6">
                  Begin Your <br /><span className="text-[#0F9393]">Journey to</span> <br />Better Mental Health
                </h2>
                <p className="font-nunito text-white/70 text-[18px] leading-relaxed max-w-[280px]">
                  Take the first step towards a clearer mind and a more fulfilled life.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111111] bg-gray-600 overflow-hidden relative">
                       <Image src={`/assets/section_2_${i}.webp`} alt="User" fill className="object-cover" />
                    </div>
                  ))}
                <p className="font-nunito text-white/60 text-[14px]">Join 1,500+ happy <br /> members</p>
              </div>
              <div className="absolute bottom-[-50px] right-[-50px] opacity-20 rotate-12">
                 <Image src="/assets/landingimage.webp" alt="" width={400} height={400} className="grayscale" />
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden w-full h-[200px] bg-[#111111] relative p-8 flex flex-col justify-end overflow-hidden">
               <div className="absolute inset-0 opacity-40"><Image src="/assets/landingimage.webp" alt="" fill className="object-cover grayscale" /></div>
               <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent" />
               <button onClick={closeAndReset} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white"><X size={24} /></button>
               <div className="relative z-10">
                 <Image src="/assets/logo unherd white.svg" alt="unHeard" width={100} height={24} className="h-[24px] w-auto mb-4" />
                 <h2 className="font-georgia text-[24px] font-bold text-white">Book Your Session</h2>
               </div>
            </div>

            {/* Forms Section */}
            <div className="flex-grow p-8 md:p-12 flex flex-col relative bg-white">
              <button onClick={closeAndReset} className="hidden md:flex absolute top-8 right-8 text-gray-400 hover:text-black transition-colors"><X size={28} /></button>

              {renderStepIndicator()}

              <div className="flex-grow relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={step} custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="w-full h-full flex flex-col pt-2"
                  >
                    {step === 1 && (
                      <div className="flex flex-col gap-6 text-black">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Basic Details</h3>
                          <p className="font-nunito text-gray-500">Provide your contact info. We verify via WhatsApp.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Good Name</label>
                            <input 
                              type="text" 
                              value={formData.name} 
                              onChange={(e) => setFormData({...formData, name: e.target.value})} 
                              placeholder="e.g. John Doe" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Email Address</label>
                            <input 
                              type="email" 
                              value={formData.email} 
                              onChange={(e) => setFormData({...formData, email: e.target.value})} 
                              placeholder="e.g. john@example.com" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">WhatsApp Phone Number</label>
                            <input 
                              type="tel" 
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                              placeholder="e.g. +91 98765 43210" 
                              className="border border-gray-200 rounded-2xl px-5 py-3.5 font-nunito text-black focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] transition-all bg-gray-50/50" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-4 text-center mt-8">
                          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </div>
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Check WhatsApp</h3>
                          <p className="font-nunito text-gray-500">We securely pinged a 6-digit code to <strong>{formData.phone}</strong>.</p>
                        </div>
                        <div className="flex flex-col gap-2 max-w-[300px] mx-auto w-full">
                          <input type="text" value={formData.otp} onChange={(e) => setFormData({...formData, otp: e.target.value})} placeholder="0 0 0 0 0 0" className="border-b-2 border-gray-300 px-5 py-4 font-bold text-center text-[28px] tracking-[1rem] text-black focus:outline-none focus:border-[#0F9393] bg-transparent" maxLength={6} />
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">How can we help?</h3>
                          <p className="font-nunito text-gray-500">Select the type of care you&apos;re looking for.</p>
                        </div>
                        <div className="flex flex-col gap-5">
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Therapy Type</label>
                            <div className="flex flex-wrap gap-3">
                              {['Individual', 'Couple', 'Teenager', 'Family'].map((t) => (
                                <button key={t} onClick={() => setFormData({...formData, type: t})} className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${formData.type === t ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}>{t}</button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Age Group</label>
                            <div className="flex flex-wrap gap-3">
                              {['18-25', '26-35', '36-50', '50+'].map((a) => (
                                <button key={a} onClick={() => setFormData({...formData, age: a})} className={`px-6 py-2.5 rounded-full text-[14px] font-bold border-2 ${formData.age === a ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}`}>{a}</button>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <label className="font-nunito font-bold text-[14px] text-gray-900">Primary Concern</label>
                            <input type="text" value={formData.service} onChange={(e) => setFormData({...formData, service: e.target.value})} placeholder="e.g. Anxiety, Stress, Relationships" className="border border-gray-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50" />
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 4 && (
                      <div className="flex flex-col gap-6 h-full">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Select Therapist</h3>
                          <p className="font-nunito text-gray-500">Long press to preview therapist details.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                          {therapists.map((t: Therapist) => (
                            <div 
                              key={t.user_id} 
                              onPointerDown={() => handlePressStart(t)} onPointerUp={handlePressEnd} onPointerLeave={handlePressEnd}
                              onClick={() => setFormData({...formData, therapist_id: t.user_id})}
                              className={`group border-2 ${formData.therapist_id === t.user_id ? 'border-[#0F9393] bg-[#0F9393]/5 transform scale-[1.02]' : 'border-gray-100 hover:border-gray-200'} rounded-2xl p-4 cursor-pointer transition-all duration-300`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden shrink-0">
                                   <Image src={t.avatar_url || `/assets/section_2_3.webp`} width={64} height={64} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="Therapist" />
                                </div>
                                <div className="pointer-events-none select-none">
                                  <h4 className="font-georgia font-bold text-[16px] text-black leading-tight line-clamp-1">{t.full_name}</h4>
                                  <span className="font-nunito text-[12px] text-gray-500 line-clamp-1">{t.qualification}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step === 5 && (
                      <div className="flex flex-col gap-6 h-full">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Schedule Time</h3>
                          <p className="font-nunito text-gray-500">Secure your appointment block with the therapist.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                           <div className="flex flex-col gap-2">
                             <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center gap-2"><Calendar size={16}/> Select Date</label>
                             <input 
                               type="date" 
                               min={new Date().toISOString().split('T')[0]} // restrict past dates
                               value={formData.scheduled_date} 
                               onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                               className="border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold" 
                             />
                           </div>
                           
                           <div className="flex flex-col gap-2 mt-2">
                             <label className="font-nunito font-bold text-[14px] text-gray-900 flex items-center gap-2"><Clock size={16}/> Popular Slots</label>
                             <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                               {['09:00', '10:00', '11:00', '13:00', '15:00', '16:00', '18:00', '19:00'].map((time) => (
                                 <button 
                                   key={time} 
                                   onClick={() => setFormData({...formData, scheduled_time: time})} 
                                   className={`py-3 rounded-xl text-[14px] font-black border-2 ${formData.scheduled_time === time ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-md' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300'}`}
                                 >
                                   {time}
                                 </button>
                               ))}
                             </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {step === 6 && (
                      <div className="flex flex-col gap-6">
                        <div className="mb-2">
                          <h3 className="font-georgia font-bold text-[28px] text-black mb-2">Select Plan</h3>
                          <p className="font-nunito text-gray-500">Select a payment option to confirm your booking.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: 'Trial Session', price: currentPricing.trial, isTrial: true },
                            { label: 'Single Session', price: currentPricing.single, isTrial: false },
                            { label: 'Standard Pack', price: currentPricing.standard, isTrial: false },
                            { label: 'Premium Pack', price: currentPricing.premium, isTrial: false }
                          ].map((plan, i) => (
                            <div 
                              key={i} onClick={() => setFormData({...formData, is_trial: plan.isTrial})}
                              className={`border-2 ${((plan.isTrial && formData.is_trial) || (!plan.isTrial && !formData.is_trial && i === 1)) ? 'border-[#0F9393] bg-[#0F9393]/5 transform scale-[1.02]' : 'border-gray-100 hover:border-gray-200'} rounded-3xl p-6 cursor-pointer transition-all flex flex-col items-center justify-center text-center`}
                            >
                              <span className="font-nunito font-bold text-[12px] text-[#0F9393] uppercase tracking-widest mb-1">{plan.label}</span>
                              <h4 className="font-georgia font-bold text-[32px] text-black">{plan.price}/-</h4>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {step > 1 && (
                    <button onClick={handlePrev} className="group flex items-center gap-2 font-nunito font-bold text-gray-400 hover:text-black transition-colors">
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back
                    </button>
                  )}
                </div>
                
                <div className="flex gap-4">
                  {step < 6 ? (
                    <button 
                      onClick={handleNext} 
                      disabled={loading || (step === 1 && !formData.phone) || (step === 2 && formData.otp.length !== 6) || (step === 4 && !formData.therapist_id) || (step === 5 && (!formData.scheduled_date || !formData.scheduled_time))}
                      className="bg-black text-white px-8 py-3.5 rounded-2xl font-nunito font-bold flex items-center gap-3 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Processing...' : 'Continue'}
                      <ChevronRight size={20} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleBookNow} 
                      disabled={loading} 
                      className="bg-[#0F9393] text-white px-10 py-3.5 rounded-2xl font-nunito font-bold flex items-center gap-3 shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Complete Booking'}
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* MINI VIEWER POPOVER FOR LONG PRESS */}
            <AnimatePresence>
              {previewTherapist && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-12 overflow-y-auto">
                  <button onClick={() => setPreviewTherapist(null)} className="absolute top-8 right-8 text-black/50 hover:text-black bg-gray-100 p-2 rounded-full"><X size={24} /></button>
                  <div className="flex items-center gap-6 mb-8">
                     <Image src={previewTherapist.avatar_url || `/assets/section_2_3.webp`} width={100} height={100} className="rounded-[24px] object-cover shadow-2xl" alt="" />
                     <div>
                       <h3 className="font-georgia text-[32px] font-bold text-black">{previewTherapist.full_name}</h3>
                       <p className="text-[#0F9393] font-bold tracking-widest uppercase text-[12px]">{previewTherapist.qualification}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <p className="font-nunito text-[16px] text-gray-700 leading-relaxed italic border-l-4 border-[#0F9393]/20 pl-4">{previewTherapist.bio || 'Navigating mental clarity with evidence-based support.'}</p>
                    <div>
                      <h4 className="font-bold text-black mb-3">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {(previewTherapist.specialties || ['Growth', 'Anxiety']).map((s: string) => (
                           <span key={s} className="bg-gray-100 px-4 py-1.5 rounded-full text-[12px] font-bold text-gray-600">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-8">
                     <button
                       onClick={() => {
                         setFormData({...formData, therapist_id: previewTherapist.user_id});
                         setPreviewTherapist(null);
                         handleNext();
                       }}
                       className="w-full bg-black text-white rounded-2xl py-4 font-bold active:scale-95 transition-all text-[16px]"
                     >
                       Select 
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
