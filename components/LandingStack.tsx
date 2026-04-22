'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import { useBooking } from '@/components/BookingContext';
import AnimatedCounter from './ui/AnimatedCounter';
import { faqData, blogData, specialtiesData } from '@/lib/data/landing';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { BlogCard } from '@/components/landing/BlogCard';

export const LandingStack = () => {
  const { openBookingModal } = useBooking();
  const [isAnxietyDetailsOpen, setIsAnxietyDetailsOpen] = useState(false);
  const card1Ref = React.useRef<HTMLElement>(null);
  const cta1Ref = React.useRef<HTMLDivElement>(null);
  const card2Ref = React.useRef<HTMLElement>(null);
  const lastRef2 = React.useRef<HTMLDivElement>(null);
  const card3Ref = React.useRef<HTMLElement>(null);
  const lastRef3 = React.useRef<HTMLDivElement>(null);
  const card4Ref = React.useRef<HTMLElement>(null);
  const lastRef4 = React.useRef<HTMLDivElement>(null);
  const card5Ref = React.useRef<HTMLElement>(null);
  const lastRef5 = React.useRef<HTMLDivElement>(null);

  const [stickyTop1, setStickyTop1] = React.useState(0);
  const [stickyTop2, setStickyTop2] = React.useState(0);
  const [stickyTop3, setStickyTop3] = React.useState(0);
  const [stickyTop4, setStickyTop4] = React.useState(0);
  const [stickyTop5, setStickyTop5] = React.useState(0);
  const [vh, setVh] = React.useState(0);
  const [sectionHeights, setSectionHeights] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    setVh(window.innerHeight);

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

        // We want the CTA center to be at 40% of the viewport
        const targetViewportY = (vh || window.innerHeight) * 0.4;
        const ctaCenterOffset = ctaOffsetInCard + (ctaHeight / 2);

        return Math.min(targetViewportY - ctaCenterOffset, 0);
      };

      setStickyTop1(getOffset(card1Ref.current, cta1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, lastRef2.current));
      setStickyTop3(getOffset(card3Ref.current, lastRef3.current));
      setStickyTop4(getOffset(card4Ref.current, lastRef4.current));
      setStickyTop5(getOffset(card5Ref.current, lastRef5.current));
    };

    let resizeTimer: NodeJS.Timeout;
    const debouncedCalculate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(calculatePinOffset, 150);
    };

    // HEIGHT STABILIZATION
    const observer = new ResizeObserver((entries) => {
      setSectionHeights(prev => {
        const next = { ...prev };
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) next[id] = entry.contentRect.height;
        });
        return next;
      });
      // Recalculate pinning offsets when any section height changes
      debouncedCalculate();
    });

    [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

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
      observer.disconnect();
    };
  }, [vh]);

  return (
    <div className="relative w-full bg-[#111111]">
      {/* 
        CARD 1: Hero + White Card 
      */}
      <section
        ref={card1Ref}
        data-section-id="1"
        className="sticky z-10 w-full will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop1}px`,
          minHeight: sectionHeights['1'] ? `${sectionHeights['1']}px` : 'auto'
        }}
      >
        <div className="w-full flex flex-col items-center">
          <div className="relative h-screen max-h-[1000px] w-full max-w-[2560px] flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0 text-white bg-[#0a0a0a]">
              <Image
                src="/assets/landingimage.webp"
                alt="Hero Background"
                fill
                sizes="100vw"
                className="object-cover opacity-60"
                priority
                quality={90}
              />
            </div>
            <div className="relative z-10 max-w-[800px] flex flex-col gap-4">
              <h1 className="text-[40px] font-bold leading-[1.1] tracking-[-0.02em] text-white font-georgia">
                When your mind feels louder than your life, clarity is non-negotiable.
              </h1>
              <div className="flex flex-col gap-4 text-white">
                <p className="text-[18px] md:text-[22px] font-bold leading-[1.4] tracking-[-0.02em] max-w-[733px] font-nunito bg-gradient-to-r from-white to-[#FFF7E9] bg-clip-text text-transparent">
                  At unHeard., we don’t reduce people to symptoms or labels because not everything you feel needs ‘fixing’.
                </p>
                <p className="text-[18px] md:text-[22px] font-bold leading-[1.4] tracking-[-0.02em] font-nunito italic opacity-80">
                  Unheard. is an online psychological counseling that identifies, understands and restructures thought, emotion and behavior in relation, and not in isolation.
                </p>
              </div>
              <div className="flex flex-row items-center gap-4 md:gap-6 mt-4">
                <Button variant="gray" className="w-[180px] sm:w-[200px] md:w-[240px] h-[48px] md:h-[56px] text-[13px] sm:text-[14px] md:text-[17px] px-4 sm:px-6 md:px-8 whitespace-nowrap" onClick={openBookingModal}>Begin with understanding.</Button>
                <Image src="/assets/Group 54.svg" alt="Try now!" width={60} height={60} className="h-[40px] md:h-[60px] w-auto -mt-4" />
              </div>
            </div>
          </div>

          <div className="w-full px-4 flex justify-center pb-20 -mt-[150px] md:-mt-[200px] relative z-10">
            <div className="w-[97vw] max-w-[2400px] bg-[#FEFEFC] rounded-[40px] pt-16 pb-[100px] md:pb-[150px] px-6 md:px-12 lg:px-16 flex flex-col items-center shadow-xl">
              {/* Centered Title */}
              <div className="w-full flex flex-col items-center text-center mb-16">
                <h2 className="font-georgia text-[36px] font-bold leading-tight text-black max-w-[900px]">
                  There’s a reason it’s called Unheard.
                </h2>
              </div>

              {/* 2x2 Grid + Single Big Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

                {/* 2x2 Cluster (Left 2 columns on LG, Full width on MD) */}
                <div className="lg:col-span-2 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card 1a: Image */}
                  <div className="relative rounded-[30px] overflow-hidden border border-black/10 aspect-square group">
                    <Image src="/assets/section_2_1.webp" alt="Philosophy" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/20 flex items-end p-8">
                      <span className="text-white font-nunito text-[14px] font-bold tracking-widest uppercase border border-white/20 px-4 py-2 rounded-full backdrop-blur-sm">Philosophy</span>
                    </div>
                  </div>

                  {/* Card 1b: Philosophy Text */}
                  <div className="rounded-[30px] border border-black/10 p-8 md:p-10 flex flex-col justify-between bg-white hover:shadow-lg transition-all aspect-square">
                    <span className="text-[20px] font-bold text-black/20 font-nunito">01</span>
                    <p className="font-nunito text-[18px] xl:text-[20px] font-bold text-black/80 leading-relaxed">
                      unHeard., isn&apos;t built on quick fixes or motivational language.
                    </p>
                  </div>

                  {/* Card 3: Listening Text */}
                  <div className="rounded-[30px] border border-black/10 p-8 md:p-10 flex flex-col justify-between bg-[#F8F8F6] hover:shadow-lg transition-all aspect-square">
                    <span className="text-[20px] font-bold text-black/20 font-nunito">02</span>
                    <div className="space-y-4">
                      <p className="font-nunito text-[18px] xl:text-[20px] font-bold text-black/80 leading-relaxed">
                        It’s built on careful listening. On trained observation. On understanding before intervention.
                      </p>
                      <p className="font-nunito text-[15px] xl:text-[17px] font-semibold text-black/50 leading-relaxed">
                        Because a lot of what people carry… never quite gets said properly.
                      </p>
                    </div>
                  </div>

                  {/* Card 4: Observation Image */}
                  <div className="relative rounded-[30px] overflow-hidden border border-black/10 aspect-square group">
                    <Image src="/assets/section_2_2.webp" alt="Observation" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                      <p className="text-white font-nunito text-[16px] md:text-[18px] font-bold leading-relaxed">
                        We pay attention to what&apos;s said. And also to what&apos;s avoided, repeated, or left unfinished.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Single Big Card (Right column on LG, Full width on MD) */}
                <div className="lg:col-span-1 md:col-span-2 rounded-[30px] border border-black/10 p-8 md:p-10 flex flex-col justify-between bg-white hover:shadow-xl transition-all h-full md:h-auto lg:h-full min-h-[400px] md:min-h-0 lg:min-h-[500px]">
                  <div>
                    <span className="text-[24px] font-bold text-[#0F9393] font-nunito">03</span>
                    <div className="mt-10 space-y-8">
                      <p className="font-nunito text-[20px] xl:text-[22px] font-bold text-black/90 leading-tight">
                        Our work is guided by qualified psychologists and trained therapists offering online mental health support that is confidential, ethical, structural, culturally aware, and grounded in evidence-based care.
                      </p>
                      <p className="font-nunito text-[18px] xl:text-[20px] font-bold text-[#0F9393] leading-relaxed italic border-l-4 border-[#0F9393]/30 pl-6">
                        This is not advice. It&apos;s not venting. It&apos;s therapy that actually engages with how your mind works.
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 pt-10 border-t border-black/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#0F9393]/10 flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#0F9393]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04kM12 20.944a11.955 11.955 0 01-8.618-3.04A12.02 12.02 0 013 9c0-3.314 2.686-6 6-6s6 2.686 6 6a6 6 0 01-3 5.196" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-nunito text-[16px] font-bold text-black/80">Psychological Care</p>
                        <p className="font-nunito text-[14px] text-black/40">Evidence-based Support</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered CTA */}
              <div className="mt-20 w-full flex flex-col items-center">
                <div ref={cta1Ref} className="flex flex-row items-center justify-center gap-4 md:gap-6">
                  <Button variant="black" className="w-[200px] md:w-[240px] h-[52px] md:h-[58px] text-[14px] md:text-[18px] px-4 md:px-8 whitespace-nowrap" onClick={openBookingModal}>Begin with understanding.</Button>
                  <Image src="/assets/Group 54.svg" alt="Try now!" width={55} height={55} className="h-[40px] md:h-[55px] w-auto invert -mt-3" />
                </div>
              </div>
            </div>
          </div>
          <div className="h-[100px] md:h-[150px] w-full shrink-0" />
        </div>
      </section>

      {/* 
        CARD 2: Features (Black Card)
      */}
      <section
        ref={card2Ref}
        data-section-id="2"
        className="sticky z-20 w-full flex justify-center pb-20 -mt-[330px] pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop2}px`,
          minHeight: sectionHeights['2'] ? `${sectionHeights['2']}px` : 'auto'
        }}
      >
        <div className="w-[97vw] max-w-[2440px] bg-[#171612] rounded-t-[40px] rounded-b-[40px] pt-18 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-2xl pointer-events-auto">
          <div className="text-center mb-10 max-w-[900px]">
            <h2 className="font-georgia text-[36px] font-bold leading-tight text-white mb-6">
              Why Unheard?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1000px] items-stretch">
            <FeatureCard
              title="Insight-driven, not scripted"
              description="Our therapeutic approach moves beyond surface-level techniques, diving deep into the complexities of your unique experience for genuine mental transformation."
            />
            <FeatureCard
              title="Grounded in Psychology"
              description="Academic rigor meets deep human empathy. Every session is rooted in proven psychological frameworks delivered through a lens of profound personal understanding."
            />
            <div className="hidden lg:block">
              <FeatureCard
                title="Focus on Clarity"
                description="We prioritize sustainable mental clarity over temporary, band-aid relief, equipping you with the internal tools for lifelong emotional resilience."
              />
            </div>
          </div>

          {/* Anxiety Section - Wide Flow */}
          <div className="w-[90vw] max-w-[1600px] my-12">
            <div className="relative w-full rounded-[40px] overflow-hidden bg-white border border-black/5 shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-10 md:p-6 lg:p-8">
                {/* Left Content */}
                <div className="flex flex-col items-start text-left z-10 max-w-[650px]">
                  <h3 className="font-georgia font-bold text-[36px] leading-[1.1] text-black tracking-[-0.02em] mb-4">
                    Therapy for when your mind doesn&apos;t switch off.
                  </h3>
                  <div className="space-y-4">
                    <p className="font-nunito text-[18px] md:text-[20px] text-black/80 leading-relaxed">
                      Anxiety doesn’t always look dramatic. It’s just constant. Racing thoughts. Restlessness. A sense that something is wrong.
                      <br />

                      You don’t need to calm down. You need to understand what’s happening.
                    </p>
                  </div>

                  {/* Read More Section */}
                  <div className="mt-4 mb-8 w-full">
                    <button
                      onClick={() => setIsAnxietyDetailsOpen(!isAnxietyDetailsOpen)}
                      className="flex items-center gap-2 text-black/40 hover:text-black font-nunito font-bold text-[14px] uppercase tracking-widest transition-colors mb-4"
                    >
                      {isAnxietyDetailsOpen ? 'Show less' : 'Read more'}
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isAnxietyDetailsOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isAnxietyDetailsOpen && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 py-6 border-t border-black/5 animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="col-span-full text-black/60 font-nunito font-bold text-[14px] uppercase tracking-widest mb-2">We help with:</p>
                        {[
                          'Generalised anxiety',
                          'Panic attacks',
                          'Social anxiety',
                          'Health anxiety',
                          'Stress overload',
                          'Sleep issues linked to anxiety'
                        ].map((item: string, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0F9393]" />
                            <span className="text-black/80 font-nunito text-[16px] md:text-[18px]">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Button
                      variant="black"
                      className="w-[200px] md:w-[240px] h-[52px] md:h-[58px] !rounded-full text-[14px] md:text-[16px] px-4 md:px-8 whitespace-nowrap shadow-xl"
                      onClick={openBookingModal}
                    >
                      Begin with understanding.
                    </Button>
                  </div>
                </div>

                {/* Right Image */}
                <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:h-[420px] rounded-[30px] overflow-hidden shadow-2xl">
                  <Image
                    src="/assets/service/about/1.webp"
                    alt="Anxiety Therapy"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 700px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1000px] items-stretch">
            <div className="lg:hidden block">
              <FeatureCard
                title="Focus on Clarity"
                description="We prioritize sustainable mental clarity over temporary, band-aid relief, equipping you with the internal tools for lifelong emotional resilience."
              />
            </div>
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

          <div ref={lastRef2} className="mt-20 md:mt-28 w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-6 px-10">
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[60px] lg:text-[72px] text-white leading-none"><AnimatedCounter end={1500} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[18px] md:text-[20px] lg:text-[24px] text-white mt-1">Happy Patients</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[60px] lg:text-[72px] text-white leading-none"><AnimatedCounter end={80} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[18px] md:text-[20px] lg:text-[24px] text-white mt-1">Licensed Therapists</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="font-georgia font-bold text-[56px] md:text-[60px] lg:text-[72px] text-white leading-none"><AnimatedCounter end={2000} suffix="+" /></span>
              <span className="font-nunito font-semibold text-[18px] md:text-[20px] lg:text-[24px] text-white mt-1">Hours of Therapy</span>
            </div>
          </div>
          <div className="h-[200px] md:h-[250px] w-full shrink-0" />
        </div>
      </section>

      {/* 
        CARD 3: FAQ (White Card)
      */}
      <section
        ref={card3Ref}
        data-section-id="3"
        className="sticky z-30 w-full flex justify-center pb-20 -mt-[330px] pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop3}px`,
          minHeight: sectionHeights['3'] ? `${sectionHeights['3']}px` : 'auto'
        }}
      >
        <div className="w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] pt-40 pb-40 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto">
          <div className="text-center mb-16 max-w-[900px]">
            <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black">Your Questions, Answered <br /> <span className="text-[#0F9393]">At Unheard.</span></h2>
          </div>
          <div className="flex flex-col lg:flex-row w-full max-w-[1200px] gap-12 lg:gap-20 items-stretch">
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end shrink-0">
              <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[30px] overflow-hidden shadow-lg bg-gray-200">
                <Image src="/assets/section_2_2.webp" alt="FAQ Preview" fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px" className="object-cover" />
              </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <FAQAccordion data={faqData} />
              <div ref={lastRef3} className="mt-12 w-full flex justify-center">
                <button className="bg-black hover:bg-gray-800 text-white font-nunito font-bold text-[14px] md:text-[18px] w-[200px] md:w-[300px] h-[54px] md:h-[64px] flex items-center justify-center rounded-full transition-colors whitespace-nowrap" onClick={() => window.location.href = '#contact'}>Contact Us</button>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full shrink-0 pointer-events-none" />
        </div>
      </section>

      {/* 
        CARD 4: Specialties Wall (Black Card)
      */}
      <section
        ref={card4Ref}
        data-section-id="4"
        className="sticky z-40 w-full flex justify-center pb-20 -mt-[330px] pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop4}px`,
          minHeight: sectionHeights['4'] ? `${sectionHeights['4']}px` : 'auto'
        }}
      >
        <div className="w-[97vw] max-w-[2440px] bg-[#171612] rounded-t-[40px] rounded-b-[40px] pt-40 pb-40 flex flex-col items-center shadow-2xl pointer-events-auto border-t border-white/5 overflow-hidden">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#0F9393]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Header Title */}
            <div className="text-center mb-16 px-6 max-w-[1200px]">
              <h2 className="font-georgia text-[36px] md:text-[42px] lg:text-[48px] font-bold leading-[1.05] text-white">
                Comprehensive support for <br /> <span className="opacity-80">every mental landscape.</span>
              </h2>
            </div>

            {/* Specialties Wall Grid */}
            <div className="w-full flex justify-center mb-24 overflow-visible px-4">
              <div className="hidden lg:flex items-start gap-5 w-full max-w-[1400px] justify-center">
                {[
                  { count: 2, offset: 'mt-32', indices: [0, 1] },
                  { count: 2, offset: 'mt-16', indices: [2, 3] },
                  { count: 1, offset: 'mt-24', indices: [4] },
                  { count: 1, offset: 'mt-0', indices: [5] },
                  { count: 1, offset: 'mt-24', indices: [6] },
                  { count: 2, offset: 'mt-16', indices: [7, 8] },
                  { count: 2, offset: 'mt-32', indices: [9, 10] }
                ].map((col, colIdx) => (
                  <div key={colIdx} className={`flex flex-col gap-5 flex-1 max-w-[190px] ${col.offset}`}>
                    {col.indices.map((dataIdx) => (
                      <div key={dataIdx} className="relative aspect-[3/4] rounded-[30px] overflow-hidden border border-white/10 shadow-2xl transition-all duration-700 group hover:-translate-y-2">
                        <Image src={specialtiesData[dataIdx].image} alt="Expertise" fill className="object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-bottom p-6 h-full">
                          <p className="text-white font-nunito text-[16px] font-bold leading-tight self-end">{specialtiesData[dataIdx].text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              
              {/* Mobile Mobile/Tablet Grid */}
              <div className="flex lg:hidden items-start gap-3 sm:gap-6 w-full max-w-[800px] justify-center">
                {[
                  { count: 3, offset: 'mt-12', indices: [0, 1, 2] },
                  { count: 2, offset: 'mt-0', indices: [3, 4] },
                  { count: 3, offset: 'mt-12', indices: [5, 6, 7] }
                ].map((col, colIdx) => (
                  <div key={colIdx} className={`flex flex-col gap-3 sm:gap-5 flex-1 ${col.offset}`}>
                    {col.indices.map((dataIdx) => (
                      <div key={dataIdx} className="relative aspect-[3/4] rounded-2xl md:rounded-[40px] overflow-hidden border border-white/10 shadow-xl group">
                        <Image src={specialtiesData[dataIdx].image} alt="Expertise" fill className="object-cover opacity-80" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-4 sm:p-8 h-full">
                          <p className="text-white font-nunito text-[13px] sm:text-[18px] md:text-[22px] font-bold leading-tight">{specialtiesData[dataIdx].text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Content */}
            <div ref={lastRef4} className="text-center mb-32 px-6 max-w-[600px] lg:max-w-[520px] lg:-mt-[340px] relative z-20">
              <p className="font-georgia italic text-[22px] md:text-[32px] text-[#0F9393] mb-6 tracking-tight">Therapy for when your mind doesn&apos;t switch off.</p>
              <p className="font-nunito text-[18px] md:text-[24px] text-white/40 mb-12 mx-auto leading-relaxed">Professional care tailored to identify, understand, and restructure thought, emotion, and behavior.</p>
              <div className="flex flex-row items-center justify-center gap-4 md:gap-6 mt-4">
                <Button variant="white" className="w-[180px] md:w-[240px] h-[52px] md:h-[58px] text-[14px] md:text-[17px] px-4 md:px-8 whitespace-nowrap shadow-xl" onClick={openBookingModal}>Begin with understanding.</Button>
                <Image src="/assets/Group 54.svg" alt="Try now!" width={55} height={55} className="h-[40px] md:h-[55px] w-auto -mt-3" />
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full shrink-0 pointer-events-none" />
        </div>
      </section>

      {/* 
        CARD 5: Blog Section (White Card)
      */}
      <section
        ref={card5Ref}
        data-section-id="5"
        className="sticky z-50 w-full flex justify-center pb-20 -mt-[330px] pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop5}px`,
          minHeight: sectionHeights['5'] ? `${sectionHeights['5']}px` : 'auto'
        }}
      >
        <div className="w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] pt-40 pb-40 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto">
          <div className="w-full max-w-[1440px] flex flex-col items-center">
            <div className="text-center mb-24 max-w-[900px]">
              <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black flex flex-col items-center">
                <span className="text-[#0F9393] mb-4">Unheard Truth:</span>
                <span className="opacity-40 text-[24px] md:text-[32px] font-medium italic leading-relaxed text-center">Discover, Reflect, and Grow</span>
              </h2>
              <div className="mt-8 w-24 h-1 bg-[#0F9393]/20 mx-auto rounded-full" />
            </div>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {blogData.map((blog, idx) => (
                <BlogCard key={idx} blog={blog} variant="light" />
              ))}
            </div>
            
            <div ref={lastRef5} className="mt-24 flex justify-center">
              <button onClick={() => window.location.href = '/blog'} className="group flex items-center gap-4 bg-black p-1.5 pl-8 pr-2 rounded-full border-2 border-black hover:bg-gray-800 transition-all shadow-xl">
                <span className="text-white font-nunito font-bold text-[14px] md:text-[18px]">View all articles</span>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final Footer Spacer */}
      <section className="relative z-[60] w-full bg-[#111111] pt-40 pb-20">
        <div className="w-full h-px bg-white/5 mb-20" />
      </section>
    </div>
  );
};
