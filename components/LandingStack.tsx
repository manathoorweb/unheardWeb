'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import { useBooking } from '@/components/BookingContext';
import AnimatedCounter from './ui/AnimatedCounter';

// New Modular Imports
import { faqData, testimonialData, blogData, understandingContent } from '@/lib/data/landing';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { TestimonialCarousel } from '@/components/landing/TestimonialCarousel';
import { BlogCard } from '@/components/landing/BlogCard';

export const LandingStack = () => {
  const { openBookingModal } = useBooking();
  const card1Ref = React.useRef<HTMLElement>(null);
  const cta1Ref = React.useRef<HTMLDivElement>(null);
  const card2Ref = React.useRef<HTMLElement>(null);
  const cta2Ref = React.useRef<HTMLButtonElement>(null);
  const cta2MobileRef = React.useRef<HTMLButtonElement>(null);
  const lastRef2 = React.useRef<HTMLDivElement>(null);
  const card3Ref = React.useRef<HTMLElement>(null);
  const cta3Ref = React.useRef<HTMLButtonElement>(null);
  const lastRef3 = React.useRef<HTMLDivElement>(null);

  const [stickyTop1, setStickyTop1] = React.useState(0);
  const [stickyTop2, setStickyTop2] = React.useState(0);
  const [stickyTop3, setStickyTop3] = React.useState(0);

  React.useEffect(() => {
    const calculatePinOffset = () => {
      const getOffset = (card: HTMLElement | null, cta: HTMLElement | null) => {
        if (!card || !cta) return 0;

        // Get absolute positions relative to the document
        const cardRect = card.getBoundingClientRect();
        const ctaRect = cta.getBoundingClientRect();
        const scrollY = window.scrollY;

        const cardTop = cardRect.top + scrollY;
        const ctaTop = ctaRect.top + scrollY;

        // Offset from the card top to the CTA
        const ctaOffsetInCard = ctaTop - cardTop;
        const ctaHeight = cta.offsetHeight;

        // We want the CTA center to be at 50% of the viewport
        const targetViewportY = window.innerHeight * 0.5;
        const ctaCenterOffset = ctaOffsetInCard + (ctaHeight / 2);

        return Math.min(targetViewportY - ctaCenterOffset, 0);
      };

      setStickyTop1(getOffset(card1Ref.current, cta1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, lastRef2.current));
      setStickyTop3(getOffset(card3Ref.current, lastRef3.current));
    };

    let resizeTimer: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculatePinOffset, 150);
    };

    // Initial calculation
    calculatePinOffset();

    // Multiple triggers to ensure stability after navigation and image loads
    const timers = [
      setTimeout(calculatePinOffset, 50),
      setTimeout(calculatePinOffset, 200),
      setTimeout(calculatePinOffset, 500),
      setTimeout(calculatePinOffset, 1000),
      setTimeout(calculatePinOffset, 2500)
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
    <div className="relative w-full bg-[#111111]">
      {/* 
        CARD 1: Hero + White Card 
      */}
      <section ref={card1Ref} className="sticky z-10 w-full" style={{ top: `${stickyTop1}px` }}>
        <div className="w-full flex flex-col items-center">
          <div className="relative h-screen w-full flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0 text-white" style={{ position: 'absolute' }}>
              <Image
                src="/assets/landingimage.png"
                alt="Hero Background"
                fill
                sizes="100vw"
                className="object-cover opacity-60"
                priority
                quality={90}
              />
            </div>
            <div className="relative z-10 max-w-[800px] flex flex-col gap-8">
              <h1 className="text-[40px] md:text-[50px] font-bold leading-[1.1] tracking-[-0.02em] text-white font-georgia">
                Clarity, where your inner world finally makes sense.
              </h1>
              <div className="flex flex-col gap-4 text-white">
                <p className="text-[18px] md:text-[22px] font-bold leading-[1.4] tracking-[-0.02em] max-w-[733px] font-nunito bg-gradient-to-r from-white to-[#FFF7E9] bg-clip-text text-transparent">
                  Professional psychological counseling that listens, understands context and responds with clarity.
                </p>
                <p className="text-[18px] md:text-[22px] font-bold leading-[1.4] tracking-[-0.02em] font-nunito italic opacity-80">
                  Not everything you experience is easy to articulate. That does not make it complicated, only unexplored.
                </p>
              </div>
              <div className="flex flex-row items-center gap-6 mt-4">
                <Button variant="gray" className="w-[260px] h-[56px] text-[20px] px-6 whitespace-nowrap" onClick={openBookingModal}>Begin with understanding.</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[40px] md:h-[60px] w-auto mt-2" />
              </div>
            </div>
          </div>

          <div className="w-full px-4 flex justify-center pb-20 -mt-[150px] md:-mt-[200px] relative z-10">
            <div className="w-[90vw] max-w-[1400px] bg-[#FEFEFC] rounded-[40px] py-16 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-xl min-h-[120vh]">
              <div className="w-full space-y-20">
                {understandingContent.map((row, idx) => (
                  <div key={idx} className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                    <div className="flex flex-row gap-4 md:gap-6 w-full lg:w-auto">
                      {row.images.map((img, i) => (
                        <div key={i} className="relative w-[140px] sm:w-[200px] md:w-[278px] h-[130px] sm:h-[180px] md:h-[260px] rounded-[22px] overflow-hidden group border border-black/5">
                          <img src={img.src} alt={img.label} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 md:p-4">
                            <span className="text-white font-nunito text-[12px] md:text-[16px] font-bold opacity-90 leading-tight">{img.label}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex-grow max-w-[500px] lg:max-w-none">
                      <div className="font-nunito text-[18px] md:text-[20px] font-bold leading-relaxed text-black/80 whitespace-pre-line">
                        {row.text}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={cta1Ref} className="mt-20 flex flex-row items-center gap-6">
                <Button variant="black" className="w-[260px] h-[56px] text-[20px] px-6 whitespace-nowrap" onClick={openBookingModal}>Begin with understanding.</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[35px] md:h-[50px] w-auto mt-2 invert" />
              </div>
              <div className="h-[150px] md:h-[250px] w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* 
        CARD 2: Features (Black Card)
      */}
      <section ref={card2Ref} className="sticky z-20 w-full flex justify-center pt-[200px] pb-20 -mt-40 md:-mt-[250px] pointer-events-none" style={{ top: `${stickyTop2}px` }}>
        <div className="w-[90vw] max-w-[1440px] bg-[#171612] rounded-t-[40px] rounded-b-[40px] pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-2xl pointer-events-auto">
          <div className="text-center mb-20 max-w-[900px]">
            <h2 className="font-georgia text-[32px] md:text-[52px] font-bold leading-tight text-white mb-6">
              Why Unheard? Insight-driven counseling, <span className="text-[#008080]">not scripted conversations</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1400px] items-stretch">
            <FeatureCard
              title="Insight-driven, not scripted"
              description="Our therapeutic approach moves beyond surface-level techniques, diving deep into the complexities of your unique experience for genuine mental transformation."
            />
            <FeatureCard
              title="Grounded in Psychology"
              description="Academic rigor meets deep human empathy. Every session is rooted in proven psychological frameworks delivered through a lens of profound personal understanding."
            />
            <FeatureCard
              title="Focus on Clarity"
              description="We prioritize sustainable mental clarity over temporary, band-aid relief, equipping you with the internal tools for lifelong emotional resilience."
            />
            <FeatureCard
              title="Structured, not repetitive"
              description="Experience a methodical, progress-oriented journey that adapts to your growth, ensuring every conversation moves you forward rather than looping back."
            />
            <FeatureCard
              title="Applied, not abstract"
              description="Transform high-level psychological insights into practical, real-world strategies that empower your daily interactions and long-term goals."
            />
            <FeatureCard
              title="Confidential & Secure"
              description="Access world-class therapy from the privacy of your own space, supported by top-tier encryption and a total commitment to your personal discretion."
            />
          </div>

          <div className="mt-24 md:mt-40 w-full max-w-[1440px] flex flex-col items-center">
            <div className="relative w-full rounded-[24px] overflow-hidden bg-[#131210]" style={{ position: 'relative' }}>
              <picture className="w-full">
                <source media="(min-width: 768px)" srcSet="/assets/freeDekstop.png" />
                <img src="/assets/freeMobile.png" alt="Free Demo Banner Background" className="w-full h-auto object-cover" />
              </picture>
              <div className="hidden md:flex absolute inset-0 flex-col justify-center pl-12 lg:pl-[8%] w-[70%] lg:w-[60%] z-10">
                <h3 className="font-georgia font-bold text-[28px] lg:text-[40px] xl:text-[46px] leading-[1.1] text-white tracking-[-0.02em]">
                  Thinking of the<br />effectiveness<br />of online consultation
                </h3>
                <div className="mt-6 flex flex-row items-center">
                  <button ref={cta2Ref} className="bg-[#E5E5E5] hover:bg-white text-black font-nunito font-bold text-[16px] lg:text-[18px] px-6 lg:px-8 py-2.5 lg:py-3 rounded-full transition-colors whitespace-nowrap" onClick={openBookingModal}>Book a free demo</button>
                  <img src="/assets/Group 54.svg" alt="Arrow" className="h-[30px] lg:h-[40px] w-auto brightness-0 invert object-contain ml-2" />
                </div>
              </div>
              <div className="md:hidden absolute inset-0 p-6 flex flex-col justify-center z-10 items-center bg-black/20">
                <h3 className="font-georgia font-bold text-[22px] sm:text-[28px] leading-[1.2] text-white tracking-[-0.02em] text-center mb-4 drop-shadow-lg">Thinking of the effects of online consultation</h3>
                <div className="flex flex-row items-center gap-4">
                  <Button ref={cta2MobileRef} variant="black" className="w-[180px] h-[50px] text-[15px] px-4 font-bold rounded-[15px] shadow-2xl border border-white/20" onClick={openBookingModal}>Book a free demo</Button>
                  <img src="/assets/Group 54.svg" alt="Arrow" className="h-[30px] md:h-[40px] w-auto brightness-0 invert rotate-[-10deg]" />
                </div>
              </div>
            </div>
          </div>

          <div ref={lastRef2} className="mt-20 md:mt-28 w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-6 px-10">
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none"><AnimatedCounter end={1500} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Happy Patients</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none"><AnimatedCounter end={80} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Licensed Therapists</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none"><AnimatedCounter end={2000} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Hours of Therapy</span>
            </div>
          </div>
          <div className="h-[400px] md:h-[600px] w-full" />
        </div>
      </section>

      <section ref={card3Ref} className="sticky z-30 w-full flex justify-center pt-[200px] -mt-10 md:-mt-20 pointer-events-none" style={{ top: `${stickyTop3}px` }}>
        <div className="w-[90vw] max-w-[1440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] pt-24 md:pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto min-h-screen">
          <div className="text-center mb-16 max-w-[900px]">
            <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black">Your Questions, Answered <br /> <span className="text-[#0F9393]">At Unheard.</span></h2>
          </div>
          <div className="flex flex-col lg:flex-row w-full max-w-[1200px] gap-12 lg:gap-20 items-stretch">
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end shrink-0">
              <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[30px] overflow-hidden shadow-lg" style={{ position: 'relative' }}>
                <Image
                  src="/assets/section_2_2.png"
                  alt="FAQ Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center"><FAQAccordion data={faqData} /></div>
          </div>
          <div className="mt-20">
            <button ref={cta3Ref} className="bg-black hover:bg-gray-800 text-white font-nunito font-bold text-[18px] px-10 py-4 rounded-full transition-colors whitespace-nowrap">Contact Us</button>
          </div>
          <div className="mt-32 w-full max-w-[900px] flex flex-col items-center text-center">
            <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black mb-8">Voices Finally Heard, <br /> <span className="text-[#0F9393]">Lives Transformed</span></h2>
            <div ref={lastRef3} className="w-full"><TestimonialCarousel testimonials={testimonialData} /></div>
          </div>
          <div className="h-[100px] md:h-[150px] w-full" />
        </div>
      </section>

      {/* 
        FOOTER BANNER: Unheard Truth
      */}
      <section className="relative z-40 w-[90vw] mx-auto bg-black rounded-t-[60px] md:rounded-t-[80px] pt-32 pb-40 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] border-t border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#0F9393]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 w-full max-w-[1440px] flex flex-col items-center px-6">
          <div className="text-center mb-20 text-white">
            <h2 className="font-georgia text-[40px] md:text-[64px] font-bold leading-tight flex flex-col items-center text-center">
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
};
