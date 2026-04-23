'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useBooking } from '@/components/BookingContext';
import { blogData } from '@/lib/data/landing';
import { BlogCard } from '@/components/landing/BlogCard';

export default function AboutPage() {
  const { openBookingModal } = useBooking();
  
  const card1Ref = useRef<HTMLElement>(null);
  const cta1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);

  const [stickyTop1, setStickyTop1] = useState(0);
  const [stickyTop2, setStickyTop2] = useState(0);
  const [stickyTop3, setStickyTop3] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [vh, setVh] = useState(0);
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    setMounted(true);
    setVh(window.innerHeight);

    const observer = new ResizeObserver((entries) => {
      setSectionHeights(prev => {
        const next = { ...prev };
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) next[id] = entry.contentRect.height;
        });
        return next;
      });
    });

    [card1Ref, card2Ref, card3Ref].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    const calculatePinOffset = () => {
      const getOffset = (card: HTMLElement | null, target: HTMLElement | null) => {
        if (!card || !target) return 0;
        
        let targetCenterOffset = target.offsetHeight / 2;
        let curr: HTMLElement | null = target;
        while (curr && curr !== card) {
          targetCenterOffset += curr.offsetTop;
          const parent = curr.offsetParent as HTMLElement;
          if (!parent) break;
          curr = parent;
        }
        const targetViewportY = (vh || window.innerHeight) * 0.45;
        return targetViewportY - targetCenterOffset;
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
      observer.disconnect();
    };
  }, [vh]);

  if (!mounted) return null;

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip">
      
      {/* SECTION 1 */}
      <section 
        ref={card1Ref}
        data-section-id="1"
        className="sticky top-0 z-10 w-full flex flex-col items-center will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop1}px`,
          minHeight: sectionHeights['1'] ? `${sectionHeights['1']}px` : 'auto'
        }}
      >
        <div className="w-full flex flex-col items-center">
          <div className="relative h-screen max-h-[1000px] w-full max-w-[2560px] flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
              <Image
                src="/assets/service/about/1.webp"
                alt="About Background"
                fill
                sizes="100vw"
                className="object-cover opacity-70"
                priority
                quality={90}
              />
              <div className="absolute inset-0 bg-black/50 z-[1]"></div>
            </div>
            <div className="relative z-10 max-w-[800px] flex flex-col gap-8 mt-28 md:-mt-[100px]">
              <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-white font-georgia">
                 Because patterns are not random. They are structural.
              </h1>
              <p className="text-[18px] md:text-[22px] leading-relaxed text-white/90 font-nunito max-w-[600px]">
                unHeard. is built on the understanding that most psychological distress is not random--it is patterned, reinforced, and often misinterpreted. We identify those patterns with precision and restructure them intentionally.
              </p>
            </div>
          </div>

          <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center pt-24 md:pt-32 pb-20 px-6 md:px-12 lg:px-24 mt-10 md:-mt-[150px] z-20">
            <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#0F9393]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 w-full flex flex-col items-center text-center gap-12 lg:gap-20">
              <div className="flex flex-col gap-6 max-w-[1000px]">
                <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px] md:text-[16px]">Who We Are</span>
                <h2 className="text-[36px] font-bold font-georgia text-black leading-[1.05] tracking-[-0.03em]">
                  Decoding silence into <br />
                  <span className="text-[#0F9393]">Structural Clarity.</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-center items-center">
                 <div className="flex flex-col gap-8 items-center text-center">
                   <p className="font-nunito font-bold text-[20px] md:text-[26px] text-black leading-relaxed text-center lg:text-justify">
                     unHeard. is a dedicated space for those who feel mentally overwhelmed or internally unclear but do not necessarily fit traditional clinical labels. We believe that true growth happens when you stop managing symptoms and start restructuring patterns.
                   </p>
                 </div>
                  <div className="relative flex flex-col gap-8 p-10 md:p-14 rounded-[40px] overflow-hidden group items-center text-center shadow-xl">
                    <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
                      <Image src="/assets/service/about/2.webp" alt="Restructuring" fill className="object-cover transition-transform duration-700 hover:scale-110 opacity-70" />
                      <div className="absolute inset-0 bg-black/50 z-[1]"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                    </div>
                    <div className="relative z-20 flex flex-col gap-8">
                      <p className="font-nunito font-extrabold text-[20px] md:text-[26px] text-white leading-relaxed italic text-center lg:text-justify">
                        &quot;This space exists to identify the repetitive emotional loops that create friction and disconnect -- and to provide the tools for sustainable mental well-being.&quot;
                      </p>
                      <p className="font-nunito font-bold text-[16px] md:text-[20px] text-white/80 leading-relaxed text-center lg:text-justify">
                        We work with modern individuals who prioritize strategic awareness and the intention of personal awareness over standard comforting narratives.
                      </p>
                    </div>
                  </div>
              </div>
              <div ref={cta1Ref} className="mt-10 flex flex-col items-center gap-8">
                 <div className="flex flex-row flex-wrap items-center gap-4 md:gap-6">
                    <Button variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Begin with Clarity</Button>
                    <Image src="/assets/Group 54.svg" alt="Arrow" width={50} height={50} className="h-[35px] md:h-[50px] w-auto brightness-0 shrink-0" />
                 </div>
              </div>
            </div>
            <div className="h-[200px] md:h-[250px] w-full shrink-0" />
          </div>
        </div>
      </section>

      {/* SECTION 2 */}
      <section 
        ref={card2Ref}
        data-section-id="2"
        className="sticky top-0 z-20 w-full flex justify-center pb-20 -mt-[150px] pointer-events-auto will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop2}px`,
          minHeight: sectionHeights['2'] ? `${sectionHeights['2']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#171612] rounded-[40px] md:rounded-[60px] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto">
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10 w-full flex flex-col gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">OUR APPROACH</span>
              <h2 className="text-[36px] font-bold font-georgia text-white leading-tight tracking-tight text-center">
                Grounded in psychological science, <br />
                <span className="text-[#0F9393]">expanded through applied insight.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[20px] md:text-[26px] font-nunito leading-relaxed max-w-[900px] text-center">
                We work across cognitive patterns, emotional responses, and behavioral loops.
              </p>
            </div>
            <div className="flex flex-col gap-10 items-center w-full">
               <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">METHODOLOGY</span>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 w-full">
                  {[
                    { step: '01', title: 'Awareness', desc: 'Decoding the silent narratives that influence your daily reactions.', img: '/assets/service/1.webp' },
                    { step: '02', title: 'Understanding', desc: 'Mapping the correlation between cognitive patterns and emotional state.', img: '/assets/service/2.webp' },
                    { step: '03', title: 'Restructuring', desc: 'Intentional breaking and rebuilding of emotional response loops.', img: '/assets/service/3.webp' },
                    { step: '04', title: 'Integration', desc: 'Executing these subtle shifts into the fabric of your reality.', img: '/assets/landingimage.webp' }
                  ].map((item, i) => (
                    <div key={i} className="relative p-10 rounded-[40px] overflow-hidden group shadow-xl transition-all h-full min-h-[500px] flex flex-col justify-end">
                      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
                        <Image src={item.img} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10"></div>
                      </div>
                      <div className="relative z-20 flex flex-col items-start text-left gap-4">
                        <div className="text-[32px] font-black text-[#0F9393]/40 group-hover:text-[#0F9393] transition-colors">{item.step}</div>
                        <h3 className="text-[24px] md:text-[28px] font-bold text-white font-georgia leading-tight">{item.title}</h3>
                        <div className="h-[2px] w-12 bg-[#0F9393] group-hover:w-20 transition-all"></div>
                        <p className="text-[14px] md:text-[16px] font-medium text-white/80 leading-relaxed font-nunito">{item.desc}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
            <div ref={target2Ref} className="bg-white/5 p-8 md:p-16 lg:p-20 rounded-[40px] md:rounded-[60px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-12 mt-10 relative w-full">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#0F9393]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="max-w-[700px] flex flex-col gap-8 text-center lg:text-left items-center lg:items-start z-10">
                <h3 className="text-[24px] md:text-[38px] lg:text-[44px] font-bold text-white font-georgia leading-tight tracking-tight">The focus remains: <br /><span className="text-[#0F9393]">Awareness, Understanding, Restructuring & Integration.</span></h3>
                <p className="text-gray-400 font-bold text-[18px] md:text-[22px] leading-relaxed text-center lg:text-justify">Each engagement is structured yet adaptive, analytical yet human, reflective yet action-oriented.</p>
              </div>
              <div className="flex flex-row flex-wrap items-center justify-center gap-4 md:gap-6 z-10 px-2 lg:px-0">
                <Button variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[240px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] shrink-0 shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Practice Methodology</Button>
                <Image src="/assets/Group 54.svg" alt="Arrow" width={50} height={50} className="h-[30px] md:h-[50px] w-auto brightness-0 invert shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 */}
      <section 
        ref={card3Ref}
        data-section-id="3"
        className="sticky top-0 z-30 w-full flex justify-center pb-40 -mt-[150px] pointer-events-auto will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop3}px`,
          minHeight: sectionHeights['3'] ? `${sectionHeights['3']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_[-40px]_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto">
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>
          <div className="relative z-10 w-full max-w-[1300px] flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-8 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.3em] text-[12px] md:text-[14px] bg-[#0F9393]/5 px-4 py-1.5 rounded-full">OUR PHILOSOPHY</span>
              <h2 className="text-[40px] md:text-[56px] lg:text-[72px] font-bold font-georgia text-black leading-[1.05] tracking-tight">
                Clarity is not <span className="italic">comfort.</span> <br className="hidden md:block" />
                It is <span className="text-[#0F9393]">alignment.</span>
              </h2>
              <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-black/40 max-w-[700px] leading-relaxed">
                And alignment creates the sustainable mental well-being required for a life lived with intention.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 w-full mt-10 md:mt-16 items-stretch relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[120%] bg-[#0F9393]/5 rounded-full blur-[120px] pointer-events-none"></div>
               <div className="p-10 md:p-14 rounded-[50px] bg-[#111111] text-white flex flex-col items-center gap-8 relative overflow-hidden group shadow-2xl transition-all hover:scale-[1.02] duration-500">
                 <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#0F9393]/10 rounded-full blur-[80px] group-hover:bg-[#0F9393]/15 transition-all"></div>
                 <div className="w-12 h-12 rounded-2xl bg-[#0F9393]/20 flex items-center justify-center font-georgia text-[20px] font-bold text-[#0F9393] mb-2 tracking-tighter">01</div>
                 <h3 className="text-[28px] md:text-[36px] font-bold font-georgia text-white">Adaptive & <br /> <span className="text-[#0F9393]">Human</span></h3>
                 <p className="text-gray-400 font-medium text-[16px] md:text-[19px] leading-relaxed text-center group-hover:text-gray-300 transition-colors">Each engagement is structured yet adaptive, analytical yet human, reflective yet action-oriented. We prioritize the resonance of the experience over rigid metrics.</p>
               </div>
               <div className="p-10 md:p-14 rounded-[50px] bg-white border border-black/5 flex flex-col items-center gap-8 group hover:bg-black/[0.02] transition-all shadow-xl hover:scale-[1.02] duration-500 relative overflow-hidden">
                 <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#0F9393]/5 rounded-full blur-[80px] group-hover:bg-[#0F9393]/10 transition-all"></div>
                 <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center font-georgia text-[20px] font-bold text-black mb-2 tracking-tighter">02</div>
                 <h3 className="text-[28px] md:text-[36px] font-bold font-georgia text-black">Action-<br /> <span className="text-[#0F9393]">Oriented</span></h3>
                 <p className="text-gray-500 font-medium text-[16px] md:text-[19px] leading-relaxed text-center group-hover:text-gray-600 transition-colors">We don&apos;t just explore the past; we build the future. Our methodology is designed for breakthroughs that manifest in your actual reality, improving your daily response mechanisms.</p>
               </div>
            </div>
            <div className="mt-20 flex flex-col items-center gap-12 relative z-20">
               <div ref={target3Ref} className="flex flex-col items-center gap-6 text-center">
                  <h3 className="text-[36px] font-bold font-georgia text-black tracking-tight">Ready to Align?</h3>
               </div>
               <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-8">
                  <Button variant="black" className="w-[280px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-extrabold shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Start Your Transformation</Button>
                  <Link href="/therapists">
                    <button className="w-[280px] md:w-[300px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full border-[3px] border-black text-black font-black text-[16px] md:text-[20px] hover:bg-black hover:text-white transition-all text-center">Explore Counselors</button>
                  </Link>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER BANNER */}
      <section className="-mt-[130px] relative z-40 w-[97vw] mx-auto bg-black rounded-t-[60px] md:rounded-t-[80px] pt-32 pb-40 flex flex-col items-center border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#0F9393]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 w-full max-w-[1440px] flex flex-col items-center px-6">
          <div className="text-center mb-20 text-white">
            <h2 className="font-georgia text-[36px] font-bold leading-tight flex flex-col items-center text-center">
              <span className="text-[#0F9393]">Unheard Truth:</span>
              <span>Discover, Reflect, and Grow</span>
            </h2>
          </div>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {blogData.map((blog, idx) => <BlogCard key={idx} blog={blog} />)}
          </div>
          <div className="mt-20">
            <button className="group flex items-center gap-4 bg-white p-1.5 pl-8 pr-2 rounded-full border-2 border-white hover:bg-gray-100 transition-all shadow-xl">
              <span className="text-black font-nunito font-black text-[18px]">View all</span>
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
              </div>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
