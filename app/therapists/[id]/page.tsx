'use client';

import React, { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useBooking } from '@/components/BookingContext';
import Button from '@/components/ui/Button';

export default function TherapistProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { openBookingModal } = useBooking();
  const [supabase] = useState(() => createClient());
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getTherapist() {
      const { data, error } = await supabase
        .from('therapist_profiles')
        .select('*')
        .eq('user_id', id)
        .single();
      
      if (data) {
        setTherapist(data);
      }
      setLoading(false);
    }
    getTherapist();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-nunito text-[24px] font-bold">
        Loading Profile...
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-white font-nunito gap-6">
        <h1 className="text-[32px] font-bold">Therapist not found</h1>
        <Link href="/">
          <Button variant="gray">Go Home</Button>
        </Link>
      </div>
    );
  }

  const t = therapist;

  return (
    <div className="relative w-full bg-[#111111] font-nunito flex flex-col items-center pb-[100vh] pt-[80px] md:pt-[120px]">
      
      {/* GLOBAL BACKGROUND BLOBS */}
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-[#0F9393]/10 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-[#0F9393]/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"></div>

      {/* SECTION 1: HERO (WHITE CARD - STICKY) */}
      <section className="sticky top-[10px] md:top-[80px] z-10 w-full flex flex-col items-center px-2 md:px-0">
        <div className="relative w-full md:w-[95vw] max-w-[1780px] bg-[#FEFEFC] rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col min-h-[auto] lg:min-h-[85vh]">
          
          {/* Subtle White Card BG Blob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] bg-[#0F9393]/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none"></div>

          {/* HERO CONTENT */}
          <div className="relative z-10 flex flex-col lg:flex-row p-6 md:p-16 lg:p-24 gap-10 lg:gap-24 items-center flex-grow">
            
            {/* Image Wrapper with Badges */}
            <div className="w-full lg:w-[45%] relative group">
              <div className="aspect-[1/1] md:aspect-[4/5] relative rounded-[24px] md:rounded-[40px] overflow-hidden shadow-2xl border-[6px] md:border-[12px] border-white transition-all duration-700">
                <Image 
                  src={t.avatar_url || '/assets/section_2_4.png'} 
                  alt={t.full_name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              {/* Glassmorphism Badge */}
              <div className="absolute top-6 md:top-10 -right-2 md:-right-4 bg-white/80 backdrop-blur-md border border-white px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-xl flex items-center gap-2 md:gap-3 scale-90 md:scale-100">
                 <div className="w-6 h-6 md:w-8 md:h-8 bg-[#0F9393] rounded-full flex items-center justify-center text-white font-bold text-[12px] md:text-[18px]">
                   ✓
                 </div>
                 <div>
                   <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Verified</p>
                   <p className="text-[12px] md:text-[14px] font-bold text-black leading-none mt-1">Specialist</p>
                 </div>
              </div>
            </div>

            {/* Intro Text Section */}
            <div className="w-full lg:w-[55%] flex flex-col gap-6 md:gap-10">
              <div className="flex flex-col gap-3 md:gap-4">
                <span className="bg-[#0F9393]/10 text-[#0F9393] px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] w-fit">
                   Mental Health Expert
                </span>
                <h1 className="text-[32px] md:text-[60px] lg:text-[80px] font-bold font-georgia text-black leading-[1.1] tracking-[-0.03em]">
                  {t.full_name}
                </h1>
              </div>

              <div className="relative">
                <div className="absolute -left-4 md:-left-6 top-0 text-[40px] md:text-[64px] font-georgia text-[#0F9393]/20 leading-none">&ldquo;</div>
                <p className="text-[16px] md:text-[22px] lg:text-[28px] font-bold text-black/80 leading-relaxed font-nunito italic max-w-[600px] pl-4 md:pl-6 border-l-2 md:border-l-4 border-[#0F9393]/20">
                  {t.bio || "Helping you find the strength to navigate through life's most complex emotional landscapes."}
                </p>
              </div>
              
              <div className="flex flex-col gap-6 mt-4">
                <button 
                  onClick={openBookingModal}
                  className="w-full md:w-fit bg-black text-white px-8 md:px-12 py-4 md:py-6 rounded-full text-[16px] md:text-[20px] font-bold flex flex-row items-center justify-center gap-4 md:gap-5 hover:bg-gray-800 transition-all shadow-xl group active:scale-95"
                >
                  Book Free Intro Session 
                  <span className="bg-[#0F9393] rounded-full p-2 md:p-2.5">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </span>
                </button>
                <div className="flex items-center gap-4 md:gap-6 px-2">
                   <div className="flex -space-x-2 md:-space-x-3">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                         <img src={`/assets/section_2_${i}.png`} alt="" className="w-full h-full object-cover" />
                       </div>
                     ))}
                   </div>
                   <p className="text-[12px] md:text-[14px] font-bold text-gray-400 flex items-center gap-2">
                    Heard by <span className="text-black font-black">1500+</span> others
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT & STATS (BLACK CARD - STICKY OVER HERO) */}
      <section className="sticky top-[30px] md:top-[100px] z-20 w-full flex flex-col items-center mt-[40px] md:mt-[120px] px-2 md:px-0">
        <div className="relative w-full md:w-[95vw] max-w-[1780px] bg-[#171612] rounded-[32px] md:rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-6 md:p-16 lg:p-24 flex flex-col gap-10 md:gap-20 min-h-[auto] lg:min-h-[80vh] overflow-hidden">
          
          {/* Animated Background Blob for Black Card */}
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-[#0F9393]/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10">
            <h2 className="text-[32px] md:text-[60px] font-bold font-georgia text-white leading-tight">
              My <span className="text-[#0F9393]">Impact</span> <br className="hidden md:block" /> & Qualifications
            </h2>
            <p className="text-gray-400 font-bold text-[14px] md:text-[18px] max-w-[400px] leading-relaxed">
               Validated expertise combined with a commitment to individual success.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { label: 'Qualification', value: t.qualification || 'Msc', desc: 'Expert' },
              { label: 'Sessions', value: t.display_hours || '0+', desc: 'Verified' },
              { label: 'Avg Rating', value: t.display_rating || '5.0', desc: 'Consistently' },
              { label: 'Exp', value: '12+', desc: 'Dedicated' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1C1B17]/50 backdrop-blur-xl border border-white/5 rounded-[20px] md:rounded-[32px] p-5 md:p-10 flex flex-col items-start relative shadow-2xl transition-all duration-300">
                <div className="w-8 md:w-12 h-1 bg-[#0F9393] mb-4 md:mb-8 rounded-full"></div>
                <h3 className="text-[28px] md:text-[56px] font-black font-nunito tracking-tighter text-white leading-none mb-2 md:mb-4">
                  {stat.value}
                </h3>
                <p className="text-[10px] md:text-[14px] font-extrabold text-[#0F9393] uppercase tracking-widest mb-1 md:mb-3">{stat.label}</p>
                <div className="w-full h-[1px] bg-white/5 my-2 md:my-4"></div>
                <p className="text-[10px] md:text-[13px] text-gray-500 font-bold leading-relaxed">{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: KEYWORDS (WHITE CARD - STICKY OVER ABOUT) */}
      <section className="sticky top-[50px] md:top-[120px] z-30 w-full flex flex-col items-center mt-[40px] md:mt-[120px] px-2 md:px-0">
        <div className="relative w-full md:w-[95vw] max-w-[1780px] bg-[#FEFEFC] rounded-[32px] md:rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] p-6 md:p-16 lg:p-24 flex flex-col gap-8 md:gap-14 min-h-[auto] lg:min-h-[60vh] overflow-hidden">
          
          <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-[#0F9393]/5 rounded-full blur-[80px]"></div>

          <div className="relative z-10 flex flex-col gap-4 md:gap-6 max-w-[700px]">
            <h2 className="text-[32px] md:text-[64px] font-bold font-georgia text-black leading-tight tracking-tight">
              I <span className="text-[#0F9393]">Excel</span> At.
            </h2>
            <p className="text-gray-500 font-bold text-[16px] md:text-[22px] leading-relaxed font-nunito">
              Chosen areas of mastery for breakthroughs.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-2 md:gap-5">
            {(t.specialties || ['Anxiety', 'Depression', 'Relationships', 'Trauma', 'Growth', 'Stress']).map((kw: string, i: number) => (
              <div key={i} className="bg-black text-white text-[14px] md:text-[20px] px-6 md:px-12 py-3 md:py-5 rounded-[12px] md:rounded-[24px] font-bold shadow-xl">
                {kw}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: NOTE & FINAL CTA (BLACK CARD - STICKY OVER KEYWORDS) */}
      <section className="sticky top-[70px] md:top-[140px] z-40 w-full flex flex-col items-center mt-[40px] md:mt-[120px] px-2 md:px-0">
        <div className="relative w-full md:w-[95vw] max-w-[1780px] bg-[#171612] rounded-[32px] md:rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] p-6 md:p-16 lg:p-24 flex flex-col gap-10 md:gap-16 min-h-[auto] lg:min-h-[75vh] overflow-hidden">
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,#0F939311_0%,transparent_70%)]"></div>

          <div className="relative z-10 flex flex-col gap-6 md:gap-8">
            <h2 className="text-[24px] md:text-[56px] font-bold font-georgia text-white flex items-center gap-4 md:gap-6">
               <span className="w-8 md:w-16 h-1 bg-[#0F9393]"></span>
               Therapist's Note
            </h2>
            <div className="max-w-[1100px]">
              <p className="text-[18px] md:text-[36px] font-bold text-white leading-relaxed font-nunito opacity-95">
                &quot;{t.note || "Every step forward, no matter how small, is a victory. I am here to walk that path with you."}&quot;
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 mt-6 md:mt-10">
            <button 
              onClick={openBookingModal}
              className="w-full md:w-auto bg-white text-black px-10 md:px-16 py-5 md:py-7 rounded-full text-[16px] md:text-[20px] font-bold flex flex-row items-center justify-center gap-4 md:gap-6 hover:bg-gray-100 transition-all shadow-2xl group"
            >
              Start Transformation 
              <span className="bg-[#0F9393] rounded-full p-2 md:p-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </span>
            </button>
            <div className="text-gray-400 text-[14px] md:text-[18px] font-bold italic md:border-l border-white/10 md:pl-10 text-center md:text-left">
              First session is always <br className="hidden md:block" /> <span className="text-white">100% Free of cost.</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
