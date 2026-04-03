'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useBooking } from '@/components/BookingContext';

export default function AboutPage() {
  const { openBookingModal } = useBooking();
  
  // SECTION PINNING REFS
  const card1Ref = useRef<HTMLElement>(null);
  const cta1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);

  // STICKY TOP OFFSETS
  const [stickyTop1, setStickyTop1] = useState(0);
  const [stickyTop2, setStickyTop2] = useState(0);
  const [stickyTop3, setStickyTop3] = useState(0);

  useEffect(() => {
    const calculatePinOffset = () => {
      const getOffset = (card: HTMLElement | null, target: HTMLElement | null) => {
        if (!card || !target) return 0;
        
        // Calculate vertical distance from card top to target's center using offsetTop loop
        let targetCenterOffset = target.offsetHeight / 2;
        let curr: HTMLElement | null = target;
        while (curr && curr !== card) {
          targetCenterOffset += curr.offsetTop;
          const parent = curr.offsetParent as HTMLElement;
          if (!parent) break;
          curr = parent;
        }

        // Pin when the target reaches 50% of the viewport height
        const targetViewportY = window.innerHeight * 0.5;

        // Never move upwards (offset <= 0), effectively allowing the section to stack
        return Math.min(targetViewportY - targetCenterOffset, 0);
      };

      setStickyTop1(getOffset(card1Ref.current, cta1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, target2Ref.current));
      setStickyTop3(getOffset(card3Ref.current, target3Ref.current));
    };

    let resizeTimer: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculatePinOffset, 150);
    };

    calculatePinOffset();
    
    // Multiple passes for layout stability (handling font loads/images)
    const timers = [
      setTimeout(calculatePinOffset, 100),
      setTimeout(calculatePinOffset, 500),
      setTimeout(calculatePinOffset, 2000)
    ];

    window.addEventListener('resize', debouncedCalculate);
    window.addEventListener('popstate', calculatePinOffset);
    
    return () => {
      window.removeEventListener('resize', debouncedCalculate);
      window.removeEventListener('popstate', calculatePinOffset);
      timers.forEach(clearTimeout);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip pb-[40vh]">
      
      {/* Invisible Navbar Spacer - Prevents collision with fixed navbar */}
      <div className="h-[110px] md:h-[135px] w-full shrink-0" />
      
      {/* 
        SECTION 1: THE MISSION (White Card)
      */}
      <section 
        ref={card1Ref}
        className="sticky z-10 w-full flex flex-col items-center pt-10 md:pt-20 lg:pt-28"
        style={{ top: `${stickyTop1}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1400px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-2xl overflow-hidden min-h-[140vh] flex flex-col items-center pt-24 md:pt-32 pb-20 px-6 md:px-12 lg:px-24">
          
          <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#0F9393]/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-12 lg:gap-20">
            <div className="flex flex-col gap-6 max-w-[1000px]">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px] md:text-[16px]">Who We Are</span>
              <h1 className="text-[36px] md:text-[60px] lg:text-[80px] font-bold font-georgia text-black leading-[1.05] tracking-[-0.03em]">
                Patterns are not random. <br />
                <span className="text-[#0F9393]">They are structural.</span>
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-center items-center">
               <div className="flex flex-col gap-8 items-center text-center">
                 <p className="font-nunito font-bold text-[22px] md:text-[28px] text-black leading-relaxed">
                   unHeard. is built on the understanding that most psychological distress is not random, it is patterned, reinforced, and often misinterpreted.
                 </p>
               </div>
               <div className="flex flex-col gap-8 bg-black/5 p-10 md:p-14 rounded-[40px] border border-black/5 relative items-center text-center">
            
                 <p className="font-nunito font-extrabold text-[20px] md:text-[26px] text-black/90 leading-relaxed italic">
                   "This space exists to identify those patterns with precision and restructure them intentionally."
                 </p>
                 <p className="font-nunito font-bold text-[16px] md:text-[20px] text-gray-500 leading-relaxed">
                   We work with individuals who experience ongoing stress, emotional fatigue or internal confusion — without needing a clinical label.
                 </p>
               </div>
            </div>

            <div ref={cta1Ref} className="mt-10 flex flex-col items-center gap-8">
               <Button variant="black" className="px-16 h-[68px] rounded-full text-[20px] font-bold shadow-xl" onClick={openBookingModal}>Begin with Clarity</Button>
               <p className="text-gray-400 font-bold text-[14px] uppercase tracking-[0.3em] text-center">Decoding Awareness • Intention • Integration</p>
            </div>
          </div>
          
          <div className="h-[400px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 2: OUR APPROACH (Black Card)
      */}
      <section 
        ref={card2Ref}
        className="sticky z-20 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop2}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-[#171612] rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24">
          
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">OUR APPROACH</span>
              <h2 className="text-[32px] md:text-[60px] lg:text-[68px] font-bold font-georgia text-white leading-tight tracking-tight">
                Grounded in psychological science, <br />
                <span className="text-[#0F9393]">expanded through applied insight.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[900px]">
                We work across cognitive patterns, emotional responses, and behavioral loops.
              </p>
            </div>

            <div className="flex flex-col gap-10 items-center w-full">
               <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">METHODOLOGY</span>
               <div ref={target2Ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full">
                  {[
                    { step: '01', title: 'Awareness', desc: 'Decoding the silent narratives that influence your daily reactions.' },
                    { step: '02', title: 'Understanding', desc: 'Mapping the correlation between cognitive patterns and emotional state.' },
                    { step: '03', title: 'Restructuring', desc: 'Intentional breaking and rebuilding of emotional response loops.' },
                    { step: '04', title: 'Integration', desc: 'Executing these subtle shifts into the fabric of your reality.' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-8 p-10 rounded-[40px] bg-white/5 border border-white/5 hover:border-[#0F9393]/30 transition-all group lg:min-h-[320px]">
                      <div className="text-[48px] font-black text-[#0F9393]/20 group-hover:text-[#0F9393]/80 transition-colors">{item.step}</div>
                      <div className="flex flex-col gap-4">
                        <h3 className="text-[22px] md:text-[26px] font-bold text-white font-georgia">{item.title}</h3>
                        <p className="text-[15px] md:text-[18px] font-bold text-gray-500 leading-relaxed font-nunito">{item.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white/5 p-10 md:p-16 lg:p-20 rounded-[40px] md:rounded-[60px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 mt-10 relative overflow-hidden w-full">
               <div className="absolute top-0 right-0 w-80 h-80 bg-[#0F9393]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
               <div className="max-w-[700px] flex flex-col gap-8 text-center lg:text-left items-center lg:items-start">
                  <h3 className="text-[24px] md:text-[38px] lg:text-[44px] font-bold text-white font-georgia leading-tight tracking-tight">The focus remains: <br /><span className="text-[#0F9393]">awareness → understanding → restructuring → integration.</span></h3>
                  <p className="text-gray-400 font-bold text-[18px] md:text-[22px] leading-relaxed font-nunito max-w-[600px]">Each engagement is structured yet adaptive, analytical yet human, reflective yet action-oriented.</p>
               </div>
               <Button variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full px-16 h-[72px] font-bold text-[20px] shrink-0 shadow-2xl transition-transform hover:scale-105 active:scale-95" onClick={openBookingModal}>Learn the methodology</Button>
            </div>
          </div>
          <div className="h-[400px] w-full" />
        </div>
      </section>

      {/* 
        SECTION 3: OUR PHILOSOPHY (White/Off-white Card) - STACKED
      */}
      <section 
        ref={card3Ref}
        className="sticky z-30 w-full flex flex-col items-center mt-[-25vh] md:-mt-[60vh] pt-[100px] md:pt-[200px]"
        style={{ top: `${stickyTop3}px` }}
      >
        <div className="relative w-full md:w-[95vw] lg:w-[90vw] max-w-[1440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.2)] overflow-hidden min-h-[140vh] flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24">
          
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-[1300px] flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">OUR PHILOSOPHY</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-black leading-[1.1] tracking-tight">
                Clarity is not comfort. <br className="hidden md:block" />
                It is alignment. <br className="hidden md:block" />
                <span className="text-[#0F9393]">And alignment creates sustainable <br className="hidden lg:block" /> mental well-being.</span>
              </h2>
            </div>

            <div ref={target3Ref} className="flex flex-col gap-12 items-center text-center">
               <div className="flex flex-col gap-6 items-center">
                 <p className="text-[22px] md:text-[38px] lg:text-[42px] font-extrabold text-black/95 leading-snug font-nunito italic max-w-[1100px] tracking-tight">
                   "Not everything needs to be labeled to be real."
                 </p>
                 <p className="text-[20px] md:text-[34px] lg:text-[38px] font-bold text-[#0F9393] leading-snug font-nunito italic max-w-[1100px] tracking-tight">
                   "The right conversation can shift everything."
                 </p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-10 text-center items-center">
                 <div className="p-12 rounded-[50px] bg-[#111111] text-white flex flex-col items-center gap-8 relative overflow-hidden group">
                   <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#0F9393]/10 rounded-full blur-3xl group-hover:bg-[#0F9393]/20 transition-all"></div>
                   <h3 className="text-[28px] md:text-[32px] font-bold font-georgia text-[#0F9393]">Adaptive & Human</h3>
                   <p className="text-gray-400 font-bold text-[16px] md:text-[19px] leading-relaxed">Each engagement is structured yet adaptive, analytical yet human, reflective yet action-oriented.</p>
                 </div>
                 <div className="p-12 rounded-[50px] bg-white border border-black/5 flex flex-col items-center gap-8 group hover:bg-black/5 transition-all shadow-sm">
                   <h3 className="text-[28px] md:text-[32px] font-bold font-georgia text-black">Action-Oriented</h3>
                   <p className="text-gray-500 font-bold text-[16px] md:text-[19px] leading-relaxed">We don't just explore the past; we build the future. Our methodology is designed for breakthroughs that manifest in your actual reality.</p>
                 </div>
               </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-12">
               <div className="flex flex-col items-center gap-6">
                  <h3 className="text-[32px] md:text-[56px] font-bold font-georgia text-black tracking-tight">Ready to Align?</h3>
                  <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito italic text-center">Let your inner world finally make sense.</p>
               </div>
               
               <div className="flex flex-col md:flex-row items-center gap-8">
                 <Button variant="black" className="px-20 h-[80px] rounded-full text-[24px] font-extrabold shadow-2xl hover:scale-105 active:scale-95 transition-all" onClick={openBookingModal}>Start Your Transformation</Button>
                 <Link href="/therapists">
                   <button className="h-[80px] px-12 rounded-full border-[3px] border-black text-black font-black text-[22px] hover:bg-black hover:text-white transition-all">Explore Counselors</button>
                 </Link>
               </div>
               
               <div className="mt-12 flex items-center gap-6 opacity-40 grayscale">
                 <div className="h-[2px] w-16 bg-black"></div>
                 <p className="text-black font-black uppercase tracking-[0.5em] text-[16px]">unHeard.</p>
                 <div className="h-[2px] w-16 bg-black"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER SPACER */}
      <div className="h-[200px] w-full" />
    </div>
  );
}
