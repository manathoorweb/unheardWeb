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
                At Unheard, therapy isn’t limited to surface-level conversations.              </h1>
              <p className="text-[18px] md:text-[22px] leading-relaxed text-white/90 font-nunito max-w-[600px]">
                It’s a structured, psychological work of understanding how you think, feel, and respond over time, not just in moments. We look at patterns. The ones that repeat. The ones that exhaust you. The ones you’ve learnt to live with, but shouldn’t have to.
              </p>
            </div>
          </div>

          <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center pt-24 md:pt-32 pb-20 px-6 md:px-12 lg:px-24 mt-10 md:-mt-[150px] z-20">
            <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#0F9393]/5 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-4 items-center">
              {/* Left Column: Narrative & CTA */}
              <div className="flex flex-col gap-10 items-start text-left">
                <div className="flex flex-col gap-6 w-full">
                  <h2 className="text-[32px] md:text-[48px] font-bold font-georgia text-black leading-[1.1] tracking-tight">
                    “We understand you in context. <br />
                    <span className="text-[#0F9393]">And not in judgement.”</span>
                  </h2>

                  <div className="flex flex-col gap-5 max-w-[800px] text-[18px] md:text-[21px] text-black/70 font-nunito leading-relaxed">
                    <p>We offer online counseling with trained clinical psychologists, psychologists, and mental health professionals who work with real-life complexity. Not textbook versions of it.</p>
                    <p>You may be dealing with anxiety that doesn’t switch off, relationship stress, emotional burnout, or something you can’t fully explain yet.</p>
                    <p className="font-bold text-black/90">That’s enough to begin.</p>
                    <p>This is a space where mental health is approached with depth, cultural sensitivity, and clinical clarity, without making it feel distant or intimidating.</p>
                  </div>
                </div>

                <div ref={cta1Ref} className="flex flex-col items-start gap-8 w-full">
                  <div className="flex flex-row flex-wrap items-center gap-4 md:gap-6">
                    <Button variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold shadow-2xl transition-transform hover:-translate-y-1" onClick={openBookingModal}>Begin with Clarity</Button>
                    <Image src="/assets/Group 54.svg" alt="Arrow" width={50} height={50} className="h-[35px] md:h-[50px] w-auto brightness-0 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Visual Anchor (Maximized Scale) */}
              <div className="flex justify-center lg:justify-end w-full">
                <div className="relative w-full lg:w-[800px] h-[500px] md:h-[600px] lg:h-[700px] rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl group border border-black/5">
                  <Image
                    src="/assets/service/about/2.webp"
                    alt="Therapeutic Context"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
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
          <div className="relative z-10 w-full flex flex-col gap-6 md:gap-10">

            {/* Bento Grid Architecture: 3-Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

              {/* Column 1: Left Tall */}
              <div className="relative rounded-[40px] overflow-hidden group shadow-2xl h-[400px] md:h-[650px] bg-[#111111]">
                <div className="absolute inset-0 z-0 bg-black">
                  <Image src="/assets/service/1.webp" alt="Context" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F9393]/40 via-[#0F9393]/5 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-11"></div>
                </div>
                <div className="relative z-20 h-full p-8 md:p-10 flex flex-col justify-end">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    You don’t have to explain <br />it perfectly for it to matter.
                  </h3>
                </div>
              </div>

              {/* Column 2: Middle Stack */}
              <div className="flex flex-col gap-8 h-full">
                {/* Mid Top Card */}
                <div className="relative bg-[#0F9393] rounded-[40px] p-10 flex flex-col justify-end shadow-xl h-[300px] md:h-1/2">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight tracking-tight">
                    Online therapy, <br />
                    at your pace.
                  </h3>
                </div>

                {/* Mid Bottom Card */}
                <div className="relative bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 flex flex-col justify-end shadow-2xl h-[300px] md:h-1/2">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    Private. Professional. <br />
                    Without judgment.
                  </h3>
                </div>
              </div>

              {/* Column 3: Right Tall */}
              <div className="relative rounded-[40px] overflow-hidden group shadow-2xl h-[400px] md:h-[650px] bg-[#111111]">
                <div className="absolute inset-0 z-0 bg-black">
                  <Image src="/assets/service/2.webp" alt="Fine" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 saturate-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F9393]/40 via-[#0F9393]/5 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-11"></div>
                </div>
                <div className="relative z-20 h-full p-8 md:p-10 flex flex-col justify-end">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    For when “I’m fine” <br />
                    doesn’t feel true.
                  </h3>
                </div>
              </div>
            </div>

            {/* SECOND Bento Grid: Duplicated Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4 md:mt-6">

              {/* Column 1: Left Tall */}
              <div className="relative rounded-[40px] overflow-hidden group shadow-2xl h-[400px] md:h-[650px] bg-[#111111]">
                <div className="absolute inset-0 z-0 bg-black">
                  <Image src="/assets/service/3.webp" alt="Support" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 saturate-[0.8]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F9393]/40 via-[#0F9393]/5 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-11"></div>
                </div>
                <div className="relative z-20 h-full p-8 md:p-10 flex flex-col justify-end">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    Mental health support <br />
                    that actually listens.
                  </h3>
                </div>
              </div>

              {/* Column 2: Middle Stack */}
              <div className="flex flex-col gap-8 h-full">
                {/* Mid Top Card */}
                <div className="relative bg-[#1A1A1A] border border-white/5 rounded-[40px] p-10 flex flex-col justify-end shadow-xl h-[300px] md:h-1/2 group transition-all hover:bg-white/[0.05]">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    You don’t have to make it <br />
                    sound valid for it to matter.
                  </h3>
                </div>

                {/* Mid Bottom Card (Accent Color) */}
                <div className="relative bg-[#0F9393] rounded-[40px] p-10 flex flex-col justify-end shadow-2xl h-[300px] md:h-1/2">
                   <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight tracking-tight">
                     Take your time. <br />
                     We’re not going anywhere.
                   </h3>
                </div>
              </div>

              {/* Column 3: Right Tall */}
              <div className="relative rounded-[40px] overflow-hidden group shadow-2xl h-[400px] md:h-[650px] bg-[#111111]">
                <div className="absolute inset-0 z-0 bg-black">
                  <Image src="/assets/landingimage.webp" alt="Why" fill className="object-cover opacity-60 transition-transform duration-1000 group-hover:scale-105 saturate-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F9393]/40 via-[#0F9393]/5 to-transparent z-10"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-11"></div>
                </div>
                <div className="relative z-20 h-full p-8 md:p-10 flex flex-col justify-end">
                  <h3 className="text-[24px] md:text-[30px] font-bold text-white font-georgia leading-tight">
                    It makes sense. <br />
                    Let’s understand why.
                  </h3>
                </div>
              </div>
            </div>
            <div ref={target2Ref}>
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
          <div className="relative z-10 w-full flex flex-col lg:flex-row-reverse gap-8 mt-10 md:mt-16">
            {/* Right Side: Large Visual Anchor (Mirrored) */}
            <div className="relative w-full lg:w-[63%] rounded-[50px] overflow-hidden aspect-[4/3] md:aspect-[16/10] shadow-2xl group">
              <Image 
                src="/assets/landingimage.webp" 
                alt="Wellbeing" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Left Side: White Narrative Card */}
            <div className="w-full lg:w-[37%] bg-white p-10 md:p-14 rounded-[50px] flex flex-col justify-between shadow-2xl relative border border-black/5 hover:bg-black/[0.01] transition-all group overflow-hidden">
              <div className="relative z-10 flex flex-col gap-8">
                <h3 className="text-[28px] md:text-[36px] font-bold text-black font-georgia leading-[1.2] tracking-tight">
                  You don’t need to be <br />
                  <span className="text-[#0F9393]">in crisis</span> to start therapy. <br />
                  You don’t need the <br />
                  right words either.
                </h3>
              </div>

              <div className="relative z-10 flex flex-col gap-8">
                <p className="text-black font-georgia italic text-[20px] md:text-[24px] leading-tight">
                  "Just a sense that <br />
                  something isn’t <br />
                  <span className="text-[#0F9393]">sitting right</span> anymore."
                </p>
                
                <button 
                  onClick={openBookingModal}
                  className="flex items-center gap-4 group/btn w-fit"
                >
                  <div className="bg-[#0F9393] text-white px-8 h-[64px] rounded-full flex items-center font-bold text-[18px] transition-all group-hover/btn:bg-[#0D7A7A] group-hover/btn:px-10 shadow-lg shadow-[#0F9393]/20">
                    Begin Journey
                  </div>
                  <div className="w-[64px] h-[64px] rounded-full bg-black flex items-center justify-center transition-transform group-hover/btn:rotate-45 shadow-xl">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                  </div>
                </button>
              </div>

              {/* Subtle Background Glow */}
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0F9393]/5 rounded-full blur-[80px] -translate-x-1/2 translate-y-1/2"></div>
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
