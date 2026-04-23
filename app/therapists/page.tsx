'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useBooking } from '@/components/BookingContext';
import Button from '@/components/ui/Button';

// ----------------------------------------------------------------------
// THERAPIST CARD COMPONENT (INDUSTRIAL PREMIUM DESIGN)
// ----------------------------------------------------------------------
const TherapistCard = ({ t, openBooking }: { t: any, openBooking: (id: string) => void }) => {
  return (
    <div className="group relative bg-[#171612] rounded-[40px] overflow-hidden border border-white/5 hover:border-[#0F9393]/30 transition-all duration-700 hover:shadow-[0_40px_100px_rgba(0,0,0,0.6)] flex flex-col h-full">
      
      {/* Visual Anchor: Image with Organic Shape or Mask */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image 
          src={t.avatar_url || '/assets/section_2_3.webp'} 
          alt={t.full_name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 600px"
          className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" 
        />
        
        {/* Architectural Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#171612] via-transparent to-transparent" />
        <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
           <div className="bg-[#0F9393] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              Verified Expert
           </div>
        </div>

        {/* Name & Title Overlay */}
        <div className="absolute bottom-6 left-8 right-8 z-10 transition-transform duration-500">
          <h3 className="font-georgia font-bold text-[28px] md:text-[32px] text-white leading-tight tracking-tight mb-1">
            {t.full_name}
          </h3>
          <span className="text-[12px] font-black text-[#0F9393] uppercase tracking-[0.25em] font-nunito">
            {t.qualification || 'Therapist'}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 md:p-10 flex flex-col flex-grow gap-8">
        
        <div className="flex flex-col gap-5">
          {/* Minimalist Expertise Badges */}
          <div className="flex flex-wrap gap-2">
            {(t.specialties || ['Anxiety', 'Growth', 'Stress']).slice(0, 3).map((kw: string, i: number) => (
              <span key={i} className="bg-white/5 text-white/60 text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-wider border border-white/5">
                {kw}
              </span>
            ))}
          </div>

          <p className="text-gray-400 font-nunito text-[15px] leading-relaxed line-clamp-3 opacity-80 group-hover:opacity-100 transition-opacity">
            {t.bio || "Specializing in the identification and restructuring of repetitive mental patterns to achieve sustainable clarity."}
          </p>
        </div>

        {/* Stats & Actions */}
        <div className="mt-auto flex flex-col gap-8">
          <div className="flex justify-between items-center border-t border-white/5 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Perspective</span>
              <span className="text-[16px] font-bold text-white font-georgia italic">{t.perspective || 'Insight-Driven'}</span>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">Impact</span>
              <span className="text-[18px] font-bold text-[#0F9393] font-georgia leading-none">{t.display_hours || '500+'} <span className="text-[12px] font-bold text-white/30">Hrs</span></span>
            </div>
          </div>

          {/* Buttons: Sleek Industrial Design */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/therapists/${t.user_id}`} className="flex-1">
              <button className="w-full h-[56px] border border-white/20 text-white rounded-full font-bold text-[14px] hover:bg-white hover:text-black transition-all active:scale-95">
                View Profile
              </button>
            </Link>
            <button 
              onClick={() => openBooking(t.user_id)}
              className="flex-1 h-[56px] bg-[#0F9393] text-white rounded-full font-bold text-[14px] hover:bg-[#0F9393]/80 transition-all shadow-xl shadow-[#0F9393]/10 active:scale-95"
            >
              Book Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TherapistListing() {
  const { openBookingModal } = useBooking();
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  useEffect(() => {
    async function getTherapists() {
      const { data } = await supabase
        .from('therapist_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setTherapists(data);
      }
      setLoading(false);
    }
    getTherapists();
  }, [supabase]);

  // Derived data
  const uniqueSpecialties = ['All', ...Array.from(new Set(therapists.flatMap(t => t.specialties || [])))];
  
  const filteredTherapists = therapists.filter(t => {
    const specialtyMatch = selectedSpecialty === 'All' || (t.specialties && t.specialties.includes(selectedSpecialty));
    const availabilityMatch = !showAvailableOnly || (t.next_available_at && t.next_available_at.toLowerCase().includes('soon') || t.next_available_at === 'Available');
    return specialtyMatch && availabilityMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white font-nunito text-[24px] font-bold">
        Discovering Experts...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip">
      
      {/* 
        HERO SECTION - NORMAL SCROLL
      */}
      <section className="relative w-full h-[65vh] max-h-[800px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <Image 
            src="/assets/section_2_1.webp" 
            alt="Therapists Hero" 
            fill 
            className="object-cover opacity-50"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#111111]/30 to-[#111111]"></div>
        <div className="relative z-10 w-full max-w-[2440px] px-[5vw] flex flex-col items-center text-center gap-8 -mt-10">
          <div className="flex flex-col items-center gap-4">
             <span className="text-[#0F9393] font-black uppercase tracking-[0.4em] text-[14px]">Discover Excellence</span>
             <h1 className="text-[56px] md:text-[80px] font-bold font-georgia text-white leading-[1] tracking-[-0.04em]">
              The minds behind <br /> the <span className="text-[#0F9393] italic">restructuring.</span>
            </h1>
          </div>
          <p className="text-[18px] md:text-[22px] font-medium text-gray-300 max-w-[850px] leading-relaxed font-nunito opacity-90">
            Our counselors are selected for their clinical precision and strategic empathy. Find the resonance that matches your unique mental architecture.
          </p>
        </div>
      </section>

      <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24 mb-40">
        
        {/* FILTER BAR SECTION */}
        <div className="w-[97vw] max-w-[2440px] -mt-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-[#1a1a1a]/40 backdrop-blur-3xl p-10 rounded-[50px] border border-white/5 shadow-3xl">
             {/* Specialty Pills */}
             <div className="flex flex-wrap justify-center md:justify-start gap-3.5 flex-grow order-2 md:order-1">
               {uniqueSpecialties.slice(0, 10).map(spec => (
                 <button 
                   key={spec}
                   onClick={() => setSelectedSpecialty(spec)}
                   className={`px-8 py-3 rounded-full text-[13px] md:text-[14px] font-black transition-all border ${
                     selectedSpecialty === spec 
                     ? 'bg-[#0F9393] text-white border-[#0F9393] shadow-xl shadow-[#0F9393]/20' 
                     : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                   }`}
                 >
                   {spec}
                 </button>
               ))}
             </div>

             {/* Availability Toggle */}
             <button 
               onClick={() => setShowAvailableOnly(!showAvailableOnly)}
               className={`shrink-0 flex items-center gap-4 px-10 py-3.5 rounded-full font-black text-[14px] transition-all border order-1 md:order-2 ${
                 showAvailableOnly 
                 ? 'bg-white text-black border-white shadow-xl shadow-white/5' 
                 : 'bg-transparent text-white border-white/10 hover:border-white/30'
               }`}
             >
               <div className={`w-2.5 h-2.5 rounded-full ${showAvailableOnly ? 'bg-[#0F9393] animate-pulse' : 'bg-gray-600'}`}></div>
               Show Available Only
             </button>
          </div>
        </div>

        {/* THERAPIST GRID */}
        <div className="w-[97vw] max-w-[2440px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 lg:gap-16 min-h-[400px]">
          {filteredTherapists.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-40 text-gray-500 gap-8 bg-white/5 rounded-[60px] border border-white/5">
               <span className="text-[80px] opacity-20">📭</span>
               <div className="flex flex-col items-center gap-4">
                 <p className="italic text-[24px] font-georgia text-white/60">No counselors match your current filters.</p>
                 <button onClick={() => {setSelectedSpecialty('All'); setShowAvailableOnly(false)}} className="text-[#0F9393] font-bold border-b-2 border-[#0F9393] text-[18px] hover:text-[#0F9393]/80 hover:border-[#0F9393]/80 transition-all">Clear all parameters</button>
               </div>
            </div>
          ) : (
            filteredTherapists.map((t) => (
              <TherapistCard key={t.id} t={t} openBooking={(id) => openBookingModal({ therapist_id: id })} />
            ))
          )}
        </div>

      </div>

    </div>
  );
}
