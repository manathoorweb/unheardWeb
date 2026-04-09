'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useBooking } from '@/components/BookingContext';
import { blogData } from '@/lib/data/landing';
import { BlogCard } from '@/components/landing/BlogCard';

export default function ServicesPage() {
  const { openBookingModal } = useBooking();

  // SECTION PINNING REFS
  const card1Ref = useRef<HTMLElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLElement>(null);
  const target2Ref = useRef<HTMLButtonElement>(null);
  const card3Ref = useRef<HTMLElement>(null);
  const target3Ref = useRef<HTMLButtonElement>(null);
  const card4Ref = useRef<HTMLElement>(null);
  const target4Ref = useRef<HTMLButtonElement>(null);
  const card5Ref = useRef<HTMLElement>(null);
  const target5Ref = useRef<HTMLDivElement>(null);

  // STICKY TOP OFFSETS
  const [stickyTop1, setStickyTop1] = useState(0);
  const [stickyTop2, setStickyTop2] = useState(0);
  const [stickyTop3, setStickyTop3] = useState(0);
  const [stickyTop4, setStickyTop4] = useState(0);
  const [stickyTop5, setStickyTop5] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculatePinOffset = () => {
      const getOffset = (card: HTMLElement | null, target: HTMLElement | null) => {
        if (!card || !target) return 0;

        // Get absolute positions relative to the document
        const cardRect = card.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const scrollY = window.scrollY;

        const cardTop = cardRect.top + scrollY;
        const targetTop = targetRect.top + scrollY;

        // Offset from the card top to the target
        const targetOffsetInCard = targetTop - cardTop;
        const targetHeight = target.offsetHeight;

        // Pin when the target reaches ~40% of the viewport height (consistent with Landing)
        const targetViewportY = window.innerHeight * 0.4;
        const targetCenterOffset = targetOffsetInCard + (targetHeight / 2);

        // Limit to 0 to prevent positive offsets which cause "jumping"
        return Math.min(targetViewportY - targetCenterOffset, 0);
      };

      setStickyTop1(getOffset(card1Ref.current, target1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, target2Ref.current));
      setStickyTop3(getOffset(card3Ref.current, target3Ref.current));
      setStickyTop4(getOffset(card4Ref.current, target4Ref.current));
      setStickyTop5(getOffset(card5Ref.current, target5Ref.current));
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

  if (!mounted) {
    return <div className="min-h-screen bg-[#111111]" />;
  }

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip">

      {/* 
        SECTION 1: HERO & INDIVIDUAL PSYCHOLOGICAL WORK (White Card)
      */}
      <section
        ref={card1Ref}
        className="sticky z-10 w-full flex flex-col items-center"
        style={{ top: `${stickyTop1}px` }}
      >
        <div className="w-full flex flex-col items-center">
          <div className="relative h-screen max-h-[1000px] w-full max-w-[2560px] flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0 text-white" style={{ position: 'absolute' }}>
              <Image
                src="/assets/servicesland.webp"
                alt="Services Background"
                fill
                sizes="100vw"
                className="object-cover opacity-60"
                priority
                quality={90}
              />
            </div>
            <div className="relative z-10 max-w-[800px] flex flex-col gap-8 -mt-[100px]">
              <h1 className="text-[40px] md:text-[50px] font-bold leading-[1.1] tracking-[-0.02em] text-white font-georgia">
                Transformational frameworks for the modern mind.
              </h1>
              <p className="text-[18px] md:text-[22px] leading-relaxed text-white/90 font-nunito max-w-[600px]">
                Explore our comprehensive suite of psychological interventions. Designed to build clarity, resilience, and alignment across all spheres of life and work.
              </p>
            </div>
          </div>

          <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] border border-black/5 overflow-hidden flex flex-col items-center pt-24 md:pt-32 pb-20 px-6 md:px-12 lg:px-24 -mt-[100px] md:-mt-[150px] z-20">
            <div className="absolute top-[10%] right-[5%] w-[400px] h-[400px] bg-[#0F9393]/5 rounded-full blur-[60px] pointer-events-none"></div>

            <div className="relative z-10 w-full flex flex-col items-center text-center gap-12 lg:gap-20">
              <div className="flex flex-col gap-6 items-center">
                <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px] md:text-[16px]">PILLAR 01</span>
                <h1 className="text-[36px] md:text-[60px] lg:text-[80px] font-bold font-georgia text-black leading-[1.05] tracking-tight max-w-[1000px]">
                  Individual <br />
                  <span className="text-[#0F9393]">Psychological Work.</span>
                </h1>
                <p className="font-nunito font-bold text-[20px] md:text-[26px] text-gray-500 max-w-[800px] leading-relaxed">
                  Strategic awareness and emotional restructuring for the modern individual functioning in a complex world.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                {[
                  {
                    title: 'Personal Expansion',
                    desc: 'Decoding internal narratives that limit your potential and response loops. We work to identify the core cognitive structures that dictate your daily choices, enabling a conscious redesign of your life\'s path and future potential.',
                    img: '/assets/service/1.webp'
                  },
                  {
                    title: 'Emotional Resilience',
                    desc: 'Building the core psychological strength to navigate high-stakes reality. Strengthen your internal architecture to handle pressure, uncertainty, and complex emotional landscapes without losing clarity or personal alignment.',
                    img: '/assets/service/2.webp'
                  },
                  {
                    title: 'Clarity & Alignment',
                    desc: 'Syncing your internal identity with your external actions and ambitions. Achieve a state where your deep values, personal goals, and public actions are in perfect synchronization, reducing friction and maximizing impact.',
                    img: '/assets/service/3.webp'
                  }
                ].map((item, i) => (
                  <div key={i} className="relative p-8 md:p-10 rounded-[40px] overflow-hidden group transition-all h-full min-h-[480px] md:min-h-[520px] flex flex-col justify-end border border-black/5">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Dark gradient overlay from left to right */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-20 flex flex-col items-start text-left gap-4">
                      <h3 className="text-[24px] md:text-[28px] font-bold font-georgia text-white leading-tight">{item.title}</h3>
                      <div className="h-[2px] w-12 bg-[#0F9393] group-hover:w-20 transition-all"></div>
                      <p className="text-[14px] md:text-[16px] font-medium text-white/90 font-nunito leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div ref={target1Ref} className="mt-12 flex flex-row items-center gap-4 md:gap-6">
                <Button variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold transition-transform hover:-translate-y-1" onClick={openBookingModal}>Consult for Individuals</Button>
                <img src="/assets/Group 54.svg" alt="Arrow" className="h-[35px] md:h-[50px] w-auto brightness-0 -mt-2" />
              </div>
            </div>
            <div className="h-[120px] md:h-[180px] w-full shrink-0" />
          </div>
        </div>
      </section>

      {/* 
        SECTION 2: RELATIONSHIP & COUPLE DYNAMICS (Black Card)
      */}
      <section
        ref={card2Ref}
        className="sticky z-20 w-full flex justify-center pb-20 -mt-[150px] pointer-events-none"
        style={{ top: `${stickyTop2}px` }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#171612] rounded-[40px] md:rounded-[60px] border border-white/5 overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto">
          <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#0F9393]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 02</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-white leading-tight tracking-tight">
                Relationship & <br />
                <span className="text-[#0F9393]">Couple Dynamics.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[800px]">
                Restructuring the silent patterns that govern partnership, intimacy, and shared reality.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              {[
                {
                  title: 'Pattern Decoding',
                  desc: 'We identify the repetitive emotional loops that create friction and disconnect in shared spaces. By analyzing interaction cycles, we provide the tools to break cycles of avoidance and build a foundation of psychological safety.',
                  img: '/assets/service/4.webp'
                },
                {
                  title: 'Shared Alignment',
                  desc: 'Building a new system of communication that prioritizes clarity over comfort and alignment over avoidance. Syncing shared values and personal growth trajectories to ensure the partnership remains a vehicle for mutual elevation.',
                  img: '/assets/service/5.webp'
                }
              ].map((item, i) => (
                  <div key={i} className="relative p-8 md:p-10 rounded-[40px] overflow-hidden group transition-all h-full min-h-[480px] md:min-h-[540px] flex flex-col justify-end border border-white/5">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Dark gradient overlay from left to right */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-20 flex flex-col items-start text-left gap-4">
                    <h3 className="text-[26px] md:text-[32px] font-bold font-georgia text-white leading-tight">{item.title}</h3>
                    <div className="h-[2px] w-12 bg-[#0F9393] group-hover:w-20 transition-all"></div>
                    <p className="text-[17px] md:text-[20px] font-medium text-white/90 font-nunito leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative overflow-hidden p-12 md:p-20 lg:p-24 rounded-[50px] md:rounded-[70px] border border-white/5 w-full flex flex-col md:flex-row items-center justify-between gap-12 mt-12 group transition-all duration-500">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/assets/service/6.webp"
                  alt="Beyond Conversation"
                  fill
                  className="object-cover object-top transition-transform duration-1000 group-hover:scale-110 opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
              </div>

              <div className="relative z-10 flex flex-col gap-4 text-center md:text-left">
                <h4 className="text-white font-bold text-[24px] md:text-[32px] font-georgia">Beyond Conversation.</h4>
                <p className="text-gray-300 font-bold font-nunito text-[16px] md:text-[19px] max-w-[500px]">Our approach to relationships is analytical and solution-focused, designed for long-term psychological sync.</p>
              </div>
              <div className="relative z-10 flex flex-row items-center gap-4 md:gap-6">
                <Button ref={target2Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] shrink-0 transition-transform hover:-translate-y-1" onClick={openBookingModal}>Optimize Relationship</Button>
                <img src="/assets/Group 54.svg" alt="Arrow" className="h-[35px] md:h-[50px] w-auto brightness-0 invert -mt-2" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        SECTION 3: ADOLESCENT DEVELOPMENT SUPPORT (Off-white Card)
      */}
      <section
        ref={card3Ref}
        className="sticky z-30 w-full flex justify-center pb-20 -mt-[150px] pointer-events-none"
        style={{ top: `${stickyTop3}px` }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[40px] md:rounded-[60px] border border-black/5 overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto">
          <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-[#0F9393]/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 03</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-black leading-tight tracking-tight">
                Adolescent <br className="hidden md:block" />
                <span className="text-[#0F9393]">Development Support.</span>
              </h2>
              <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Providing a structured framework for identity formation, emotional regulation, and transitional clarity during the critical years.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "0px 0px -30% 0px" }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.3
                  }
                }
              }}
              className="flex flex-col md:flex-row items-center justify-between gap-6 w-full relative"
            >
              {['Identity Mapping', 'Impulse Management', 'Social Navigation', 'Academic Flow'].map((title, i, arr) => (
                <React.Fragment key={i}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="flex-1 w-full flex flex-col items-center gap-6 group transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] text-[20px] font-black border-2 border-[#0F9393]/20 group-hover:bg-[#0F9393] group-hover:text-white transition-all duration-500">{i + 1}</div>
                    <h3 className="text-[22px] md:text-[24px] font-bold text-black font-georgia text-center">{title}</h3>
                  </motion.div>

                  {/* Animated Flow Arrow - Staggered Entry */}
                  {i < arr.length - 1 && (
                    <motion.div
                      variants={{
                        hidden: { opacity: 0, scale: 0.8 },
                        show: { opacity: 1, scale: 1 }
                      }}
                      className="flex items-center justify-center text-[#0F9393] transition-all"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="md:rotate-0 rotate-90"
                      >
                        <path d="M5 12h14m-7-7 7 7-7 7" />
                      </svg>
                    </motion.div>
                  )}
                </React.Fragment>
              ))}
            </motion.div>

            <div className="mt-10 flex flex-col items-center gap-10">
              <p className="text-[20px] md:text-[28px] font-extrabold text-[#0F9393] leading-relaxed italic max-w-[900px]">
                "Support that respects the adolescent's evolving agency while providing the tools for structural well-being."
              </p>
              <div className="flex flex-row items-center gap-4 md:gap-6">
                <Button ref={target3Ref} variant="black" className="w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-bold transition-transform hover:-translate-y-1" onClick={openBookingModal}>Support Your Child</Button>
                <img src="/assets/Group 54.svg" alt="Arrow" className="h-[35px] md:h-[50px] w-auto brightness-0 -mt-2" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        SECTION 4: INSTITUTIONAL PROGRAMS (Schools & Colleges) (Grey Card)
      */}
      <section
        ref={card4Ref}
        className="sticky z-40 w-full flex justify-center pb-20 -mt-[150px] pointer-events-none"
        style={{ top: `${stickyTop4}px` }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#1a1a1a] rounded-[40px] md:rounded-[60px] border border-white/5 overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 text-white pointer-events-auto">
          <div className="absolute center-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 04</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[72px] font-bold font-georgia text-white leading-tight tracking-tight">
                Institutional <br className="hidden md:block" />
                <span className="text-[#0F9393]">Programs.</span>
              </h2>
              <p className="text-gray-400 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Designing psychological safety and mental health frameworks for large-scale educational systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-[1100px]">
              {[
                {
                  title: 'For Schools',
                  desc: 'Integrated student counseling, teacher sensitization programs, and parent psychological workshops. We build structural safety within the K-12 ecosystem.',
                  img: '/assets/service/7.webp'
                },
                {
                  title: 'For Universities',
                  desc: 'High-performance mental coaching, peer-support networks, and crisis management protocols. Designed for the high-stakes academic environment.',
                  img: '/assets/service/8.webp'
                }
              ].map((item, i) => (
                <div key={i} className="relative p-10 md:p-12 rounded-[40px] md:rounded-[50px] overflow-hidden group transition-all h-full min-h-[500px] flex flex-col justify-end border border-white/10">
                  {/* Background Image & Overlay */}
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-start text-left gap-4">
                    <h3 className="text-[28px] md:text-[36px] font-bold font-georgia text-white leading-tight">{item.title}</h3>
                    <div className="h-[3px] w-16 bg-[#0F9393] group-hover:w-24 transition-all duration-500"></div>
                    <p className="text-[16px] md:text-[19px] font-medium text-white/90 font-nunito leading-relaxed max-w-[400px]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex flex-col items-center gap-8">
              <div className="flex flex-row items-center gap-4 md:gap-6">
                <Button ref={target4Ref} variant="black" className="bg-white text-black hover:bg-gray-100 rounded-full w-[260px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center font-bold text-[16px] md:text-[20px] transition-transform hover:-translate-y-1" onClick={openBookingModal}>Partner with unHeard.</Button>
                <img src="/assets/Group 54.svg" alt="Arrow" className="h-[35px] md:h-[50px] w-auto brightness-0 invert -mt-2" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 
        SECTION 5: CORPORATE MENTAL PERFORMANCE (Pure White/Teal Card)
      */}
      <section
        ref={card5Ref}
        className="sticky z-50 w-full flex justify-center pb-20 -mt-[150px] pointer-events-none"
        style={{ top: `${stickyTop5}px` }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-white rounded-[40px] md:rounded-[60px] border border-black/5 overflow-hidden flex flex-col items-center pt-32 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto">

          <div className="absolute top-0 left-0 w-full h-[150px] bg-gradient-to-b from-[#0F9393]/10 to-transparent"></div>

          <div className="relative z-10 w-full flex flex-col items-center text-center gap-16 md:gap-24">
            <div className="flex flex-col gap-6 items-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.25em] text-[14px]">PILLAR 05</span>
              <h2 className="text-[36px] md:text-[60px] lg:text-[76px] font-bold font-georgia text-black leading-tight tracking-tight">
                Corporate Mental <br className="hidden md:block" />
                <span className="text-[#0F9393]">Performance.</span>
              </h2>
              <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito leading-relaxed max-w-[850px]">
                Psychological clarity for high-performing organizations. From leadership awareness to cultural restructuring.
              </p>
            </div>

            <div className="w-full flex flex-col gap-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {[
                  {
                    title: 'Executive Coaching',
                    desc: 'Decoding behavioral blocks and decision patterns for leaders at the peak. We work with executives to refine cognitive agility, emotional regulation, and high-stakes decision-making frameworks for sustained pressure environments.',
                    img: '/assets/service/10.webp'
                  },
                  {
                    title: 'Culture Transformation',
                    desc: 'Building structural safety that enables creative friction and sustainable growth. We restructure organizational dynamics to prioritize psychological safety as the primary driver for high-performance innovation and team velocity.',
                    img: '/assets/service/9.webp'
                  }
                ].map((item, i) => (
                  <div key={i} className="relative p-8 md:p-10 rounded-[40px] overflow-hidden group transition-all h-full min-h-[480px] md:min-h-[540px] flex flex-col justify-end border border-black/5">
                    {/* Background Image & Overlay */}
                    <div className="absolute inset-0 z-0">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/40 to-transparent"></div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-start text-left gap-4">
                      <h3 className="text-[26px] md:text-[32px] font-bold font-georgia text-white leading-tight">{item.title}</h3>
                      <div className="h-[2px] w-12 bg-[#0F9393] group-hover:w-20 transition-all duration-500"></div>
                      <p className="text-[17px] md:text-[20px] font-medium text-white/90 font-nunito leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center gap-12 mt-10">
                <div className="flex flex-col items-center gap-6">
                  <h3 className="text-[32px] md:text-[56px] font-bold font-georgia text-black tracking-tight">Operational Clarity.</h3>
                  <p className="text-gray-500 font-bold text-[18px] md:text-[24px] font-nunito italic text-center">Unleash the cognitive potential of your organization.</p>
                </div>

                <div ref={target5Ref} className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
                  <div className="relative flex flex-row items-center gap-4 md:gap-6">
                    <Button variant="black" className="w-[280px] md:w-[350px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full text-[16px] md:text-[20px] font-extrabold transition-transform hover:-translate-y-1" onClick={openBookingModal}>Book for Organization</Button>
                    <div className="absolute left-full ml-4 md:relative md:ml-0">
                      <img src="/assets/Group 54.svg" alt="Arrow" className="h-[35px] md:h-[50px] w-auto brightness-0 invert -mt-1" />
                    </div>
                  </div>
                  <Link href="/contact">
                    <Button variant="white" className="w-[280px] md:w-[320px] h-[54px] md:h-[72px] flex items-center justify-center rounded-full border-[3px] border-black text-black font-black text-[16px] md:text-[20px] hover:bg-black hover:text-white transition-all">Contact Sales</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        FOOTER BANNER: Unheard Truth (Mirrored from Landing)
      */}
      <section className="-mt-[130px] relative z-[60] w-[97vw] mx-auto bg-black rounded-t-[60px] md:rounded-t-[80px] pt-32 pb-40 flex flex-col items-center border-t border-white/5 overflow-hidden">
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
            <button className="group flex items-center gap-4 bg-white p-1.5 pl-8 pr-2 rounded-full border-2 border-white hover:bg-gray-100 transition-all">
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
