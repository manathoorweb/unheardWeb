'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { useBooking } from '@/components/BookingContext';
import Button from '@/components/ui/Button';

// ----------------------------------------------------------------------
// THERAPIST CARD COMPONENT (WIDE DESIGN)
// ----------------------------------------------------------------------
const TherapistCard = ({ t, openBooking }: { t: any, openBooking: () => void }) => {
  return (
    <div className="group relative bg-white rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-black/5 hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] transition-all duration-700 hover:-translate-y-2">
      
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image 
          src={t.avatar_url || '/assets/section_2_3.png'} 
          alt={t.full_name} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        
        {/* Sophisticated White Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent opacity-100" />
        
        {/* Artist Name Overlay */}
        <div className="absolute bottom-6 left-8 right-8 z-10 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
          <h3 className="font-georgia font-bold text-[28px] md:text-[34px] lg:text-[38px] text-black leading-[1.1] tracking-[-0.03em] mb-1">
            {t.full_name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[13px] md:text-[14px] font-black text-[#0F9393] uppercase tracking-[0.1em] font-nunito opacity-90">
              {t.qualification || 'Licensed Therapist'}
            </span>
          </div>
        </div>
      </div>

      {/* Modern Info Section */}
      <div className="p-10 flex flex-col gap-8">
        
        {/* Keywords / Tags (Minimal Outline) */}
        <div className="flex flex-wrap gap-2">
          {(t.specialties || ['Anxiety', 'Growth', 'Stress']).slice(0, 4).map((kw: string, i: number) => (
            <span key={i} className="bg-black text-white text-[11px] px-5 py-2 rounded-full font-bold uppercase tracking-widest">
              {kw}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-end border-b border-black/5 pb-6">
          <div className="flex flex-col">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Impact</span>
            <span className="text-[20px] font-bold text-black leading-none font-georgia">{t.display_hours || '0+'} <span className="text-[14px] font-bold text-gray-400">Sessions</span></span>
          </div>
          <div className="text-right">
            <span className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Availability</span>
            <span className="px-4 py-2 bg-[#0F9393]/10 text-[#0F9393] rounded-full text-[14px] font-black inline-block">{t.next_available_at || 'Soon'}</span>
          </div>
        </div>

        {/* Booking & Profile Action Grid */}
        <div className="grid grid-cols-2 gap-5 mt-2">
          <Link href={`/therapists/${t.user_id}`} className="w-full">
            <button className="w-full h-[60px] border-2 border-black text-black rounded-full font-black text-[15px] hover:bg-black hover:text-white transition-all active:scale-95 shadow-sm">
              View Profile
            </button>
          </Link>
          <button 
            onClick={openBooking}
            className="w-full h-[60px] bg-black text-white rounded-full font-black text-[15px] hover:bg-[#1a1a1a] transition-all shadow-lg active:scale-95"
          >
            Book Free Trial
          </button>
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
    <div className="min-h-screen bg-[#111111] font-nunito flex flex-col items-center pt-32 md:pt-48 pb-24 gap-12 lg:gap-16 px-4 md:px-10 lg:px-20 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <div className="w-full max-w-[1400px] flex flex-col items-center text-center gap-6 mb-4">
        <h1 className="text-[48px] md:text-[72px] font-bold font-georgia text-white leading-[1] tracking-[-0.03em]">
          Ready to be <span className="text-[#0F9393]">Heard?</span>
        </h1>
        <p className="text-[18px] md:text-[22px] font-medium text-gray-400 max-w-[700px] leading-relaxed">
          Meet the experts dedicated to helping you find your way forward. 
        </p>
      </div>

      {/* FILTER BAR SECTION */}
      <div className="w-full max-w-[1400px] flex flex-col gap-8 mb-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-y border-white/5 py-8">
           {/* Specialty Pills */}
           <div className="flex flex-wrap justify-center md:justify-start gap-3 flex-grow order-2 md:order-1">
             {uniqueSpecialties.slice(0, 8).map(spec => (
               <button 
                 key={spec}
                 onClick={() => setSelectedSpecialty(spec)}
                 className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all border ${
                   selectedSpecialty === spec 
                   ? 'bg-[#0F9393] text-white border-[#0F9393] shadow-lg shadow-[#0F9393]/20 scale-105' 
                   : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/30'
                 }`}
               >
                 {spec}
               </button>
             ))}
           </div>

           {/* Availability Toggle */}
           <button 
             onClick={() => setShowAvailableOnly(!showAvailableOnly)}
             className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-2xl font-bold text-[14px] transition-all border order-1 md:order-2 ${
               showAvailableOnly 
               ? 'bg-white text-black border-white' 
               : 'bg-transparent text-white border-white/20 hover:border-white/40'
             }`}
           >
             <div className={`w-3 h-3 rounded-full ${showAvailableOnly ? 'bg-[#0F9393] animate-pulse' : 'bg-gray-600'}`}></div>
             Show Available Only
           </button>
        </div>
      </div>

      {/* THERAPIST GRID: WIDER LAYOUT (2 per row on laptop) */}
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 min-h-[400px]">
        {filteredTherapists.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 gap-4">
             <span className="text-[48px]">📭</span>
             <p className="italic text-[20px]">No counselors match your current filters. Try adjust your search!</p>
             <button onClick={() => {setSelectedSpecialty('All'); setShowAvailableOnly(false)}} className="text-[#0F9393] font-bold underline">Reset Filters</button>
          </div>
        ) : (
          filteredTherapists.map((t) => (
            <TherapistCard key={t.id} t={t} openBooking={openBookingModal} />
          ))
        )}
      </div>

      {/* MATCHING CTA (95vw Card) */}
      <div className="w-full max-w-[1400px] bg-[#FEFEFC] rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl mt-12 mb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F9393]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex-grow max-w-[700px] text-center md:text-left z-10">
           <h2 className="text-[32px] md:text-[48px] font-bold font-georgia text-black leading-tight mb-4">
             Find your <span className="text-[#0F9393]">Perfect Match</span>
           </h2>
           <p className="text-gray-500 font-bold text-[18px] md:text-[20px] leading-relaxed font-nunito opacity-80">
             Not sure where to start? Answer a few questions and we'll recommend the best counselor for you.
           </p>
        </div>
        <Button 
          variant="black" 
          className="w-full md:w-auto px-12 h-[64px] text-[20px] font-bold shadow-xl shrink-0 z-10 hover:scale-105 active:scale-95 transition-all" 
          onClick={openBookingModal}
        >
          Match Me Now
        </Button>
      </div>

    </div>
  );
}
