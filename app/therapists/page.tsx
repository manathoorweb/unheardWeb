'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useBooking } from '@/components/BookingContext';
import Button from '@/components/ui/Button';

// ----------------------------------------------------------------------
// THERAPIST CARD COMPONENT (PREMIUM CURATED DESIGN)
// ----------------------------------------------------------------------
const TherapistCard = ({ t, openBooking }: { t: any, openBooking: (id: string) => void }) => {
  return (
    <div className="group relative bg-white rounded-[40px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-black/5 hover:shadow-[0_30px_70px_rgba(0,0,0,0.12)] transition-all duration-700 hover:-translate-y-2 flex flex-col h-full">
      
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
        <Image 
          src={t.avatar_url || '/assets/section_2_3.webp'} 
          alt={t.full_name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px"
          className="object-cover transition-transform duration-1000 group-hover:scale-105" 
        />
        
        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
        
        {/* Name Overlay - Positioned for Impact */}
        <div className="absolute bottom-8 left-8 right-8 z-10 transition-transform duration-500">
          <h3 className="font-georgia font-bold text-[32px] md:text-[40px] text-white leading-tight tracking-tight mb-2">
            {t.full_name}
          </h3>
          <div className="flex items-center gap-3">
            <div className="h-[2px] w-8 bg-[#0F9393]"></div>
            <span className="text-[13px] md:text-[14px] font-bold text-white/90 uppercase tracking-[0.2em] font-nunito">
              {t.qualification || 'Licensed Therapist'}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Info Section */}
      <div className="p-10 flex flex-col flex-grow justify-between gap-10">
        
        <div className="flex flex-col gap-6">
          {/* Keywords / Tags (Minimalist Badges) */}
          <div className="flex flex-wrap gap-2.5">
            {(t.specialties || ['Anxiety', 'Growth', 'Stress', 'Self-Awareness']).slice(0, 4).map((kw: string, i: number) => (
              <span key={i} className="bg-[#f0f9f9] text-[#0F9393] text-[11px] px-5 py-2 rounded-full font-black uppercase tracking-widest border border-[#0F9393]/5">
                {kw}
              </span>
            ))}
          </div>

          <p className="text-gray-500 font-nunito text-[16px] leading-relaxed line-clamp-3">
            {t.bio || "Dedicated to helping individuals restructure their behavioral patterns and find mental clarity through evidence-based psychological frameworks."}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center border-t border-black/5 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Perspective</span>
              <span className="text-[18px] font-bold text-black font-georgia italic">{t.perspective || 'Insight-Driven'}</span>
            </div>
            <div className="text-right flex flex-col gap-1">
              <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">Impact</span>
              <span className="text-[20px] font-bold text-[#0F9393] font-georgia leading-none">{t.display_hours || '500+'} <span className="text-[14px] font-bold text-gray-400">Hrs</span></span>
            </div>
          </div>

          {/* Booking & Profile Action Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/therapists/${t.user_id}`} className="w-full">
              <button className="w-full h-[64px] border-[2.5px] border-black text-black rounded-full font-black text-[15px] hover:bg-black hover:text-white transition-all active:scale-95">
                View Profile
              </button>
            </Link>
            <button 
              onClick={() => openBooking(t.user_id)}
              className="w-full h-[64px] bg-black text-white rounded-full font-black text-[15px] hover:bg-[#1a1a1a] transition-all shadow-xl shadow-black/10 active:scale-95"
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
      const { data, error } = await supabase
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
             <h1 className="text-[52px] md:text-[90px] lg:text-[110px] font-bold font-georgia text-white leading-[1] tracking-[-0.04em]">
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
        <div className="w-[97vw] max-w-[2440px] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 min-h-[400px]">
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

        {/* MATCHING CTA (Premium Large Card) */}
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[50px] md:rounded-[80px] p-16 md:p-32 flex flex-col lg:flex-row items-center justify-between gap-16 shadow-[0_60px_120px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-[#0F9393]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px]"></div>
          <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-[#0F9393]/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]"></div>
          
          <div className="flex-grow max-w-[900px] text-center lg:text-left z-10 flex flex-col gap-10">
             <div className="flex flex-col gap-4">
               <span className="text-[#0F9393] font-black uppercase tracking-[0.4em] text-[14px]">The Concierge Service</span>
               <h2 className="text-[40px] md:text-[72px] lg:text-[84px] font-bold font-georgia text-black leading-[1] tracking-[-0.03em]">
                 Find your <br /><span className="text-[#0F9393] italic">Symmetry.</span>
               </h2>
             </div>
             <p className="text-gray-500 font-bold text-[20px] md:text-[26px] leading-relaxed font-nunito max-w-[700px]">
               Not sure where to start? Our internal matching algorithm pairs you with the counselor best suited for your specific psychological profile.
             </p>
          </div>
          <div className="z-10 shrink-0">
            <Button 
              variant="black" 
              className="w-[300px] md:w-[400px] h-[72px] md:h-[90px] text-[18px] md:text-[24px] font-black shadow-3xl transition-transform hover:-translate-y-2 rounded-full" 
              onClick={openBookingModal}
            >
              Match Me Automatically
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}
