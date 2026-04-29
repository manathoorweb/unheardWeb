'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useBooking } from '@/components/BookingContext';

const INDIVIDUAL_CARDS = [
  { id: 1, title: 'Anxiety and constant worry', image: '/assets/service/bento_anxiety.webp', size: 'lg' },
  { id: 2, title: 'Overthinking and intrusive thoughts', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 3, title: 'Depression and low mood', image: '/assets/service/bento_depression.webp', size: 'md' },
  { id: 4, title: 'Emotional burnout and fatigue', image: '/assets/service/bento_burnout.webp', size: 'lg' },
  { id: 5, title: 'Self-doubt and low confidence', image: '/assets/service/bento_self_doubt.webp', size: 'md' },
  { id: 6, title: 'Stress related to work, studies,life', image: '/assets/service/bento_stress.webp', size: 'md' },
  { id: 7, title: 'Feeling stuck,overwhelmed, disconnected', image: '/assets/service/bento_stuck.webp', size: 'md' }
];

const RELATIONSHIP_CARDS = [
  { id: 1, title: 'Communication breakdowns', image: '/assets/service/bento_stuck.webp', size: 'lg' },
  { id: 2, title: 'Frequent arguments', image: '/assets/service/bento_stress.webp', size: 'md' },
  { id: 3, title: 'Trust issues and emotional distance', image: '/assets/service/bento_anxiety.webp', size: 'md' },
  { id: 4, title: 'Pre-marital and marital concerns', image: '/assets/service/bento_growth.webp', size: 'lg' },
  { id: 5, title: 'Compatibility gaps', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 6, title: 'Infidelity and rebuilding trust', image: '/assets/service/bento_burnout.webp', size: 'md' }
];

const ADOLESCENT_CARDS = [
  { id: 1, title: 'Academic stress', image: '/assets/service/bento_stress.webp', size: 'lg' },
  { id: 2, title: 'Career confusion', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 3, title: 'Social anxiety', image: '/assets/service/bento_anxiety.webp', size: 'md' },
  { id: 4, title: 'Emotional sensitivity', image: '/assets/service/bento_stuck.webp', size: 'lg' },
  { id: 5, title: 'Identity and confidence', image: '/assets/service/bento_growth.webp', size: 'md' }
];

const FAMILY_CARDS = [
  { id: 1, title: 'Parent-child conflict', image: '/assets/service/bento_burnout.webp', size: 'lg' },
  { id: 2, title: 'Communication gaps', image: '/assets/service/bento_stuck.webp', size: 'md' },
  { id: 3, title: 'Emotional distance', image: '/assets/service/bento_anxiety.webp', size: 'md' },
  { id: 4, title: 'Generational differences', image: '/assets/service/bento_growth.webp', size: 'lg' }
];

const ANXIETY_CARDS = [
  { id: 1, title: 'Generalised anxiety', image: '/assets/service/bento_anxiety.webp', size: 'lg' },
  { id: 2, title: 'Panic attacks', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 3, title: 'Social anxiety', image: '/assets/service/bento_stress.webp', size: 'md' },
  { id: 4, title: 'Health anxiety', image: '/assets/service/bento_growth.webp', size: 'lg' },
  { id: 5, title: 'Stress overload', image: '/assets/service/bento_burnout.webp', size: 'md' },
  { id: 6, title: 'Sleep issues linked to anxiety', image: '/assets/service/bento_stuck.webp', size: 'md' }
];

export default function ServicesPage() {
  const { openBookingModal } = useBooking();
  const [showFullIndividual, setShowFullIndividual] = useState(false);
  const [showFullRelationship, setShowFullRelationship] = useState(false);

  // STICKY PINNING LOGIC
  const card1Ref = useRef<HTMLElement>(null);
  const target1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLElement>(null);
  const target2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLElement>(null);
  const target3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLElement>(null);
  const target4Ref = useRef<HTMLDivElement>(null);
  const card5Ref = useRef<HTMLElement>(null);
  const target5Ref = useRef<HTMLDivElement>(null);

  const [stickyTop1, setStickyTop1] = useState(0);
  const [stickyTop2, setStickyTop2] = useState(0);
  const [stickyTop3, setStickyTop3] = useState(0);
  const [stickyTop4, setStickyTop4] = useState(0);
  const [stickyTop5, setStickyTop5] = useState(0);
  const [sectionHeights, setSectionHeights] = useState<Record<string, number>>({});

  useEffect(() => {
    const calculatePinOffset = () => {
      const vh = window.innerHeight;
      const getOffset = (card: HTMLElement | null, target: HTMLElement | null) => {
        if (!card || !target) return 0;
        const cardRect = card.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const scrollY = window.scrollY;
        const targetOffsetInCard = (targetRect.top + scrollY) - (cardRect.top + scrollY);
        const targetViewportY = vh * 0.4;
        return Math.min(targetViewportY - (targetOffsetInCard + target.offsetHeight / 2), 0);
      };

      setStickyTop1(getOffset(card1Ref.current, target1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, target2Ref.current));
      setStickyTop3(getOffset(card3Ref.current, target3Ref.current));
      setStickyTop4(getOffset(card4Ref.current, target4Ref.current));
      setStickyTop5(getOffset(card5Ref.current, target5Ref.current));
    };

    const observer = new ResizeObserver((entries) => {
      setSectionHeights(prev => {
        const next = { ...prev };
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-section-id');
          if (id) next[id] = entry.contentRect.height;
        });
        return next;
      });
      calculatePinOffset();
    });

    [card1Ref, card2Ref, card3Ref, card4Ref, card5Ref].forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    calculatePinOffset();
    window.addEventListener('resize', calculatePinOffset);
    window.addEventListener('scroll', calculatePinOffset);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculatePinOffset);
      window.removeEventListener('scroll', calculatePinOffset);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#111111] overflow-x-clip">


      {/* PILLAR 01: INDIVIDUAL COUNSELING (Black Card) */}
      <section
        ref={card1Ref}
        data-section-id="1"
        className="sticky z-10 w-full flex flex-col items-center will-change-[top,transform] transform-gpu contain-paint"
        style={{
          top: `${stickyTop1}px`,
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#1A1A1A] rounded-t-[40px] rounded-b-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center pt-36 md:pt-52 pb-24 px-6 md:px-12 lg:px-24 z-20">
          <div className="relative z-10 w-full">
            <div className="h-12 md:h-20" />
            {/* Intro Header: 2-Column Grid (No nested card background) */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px]">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <h2 className="text-[36px] md:text-[64px] font-bold font-georgia text-white leading-[1] tracking-tight text-balance">
                    Individual<br />Psychological Work.
                  </h2>
                  <div className="max-w-[450px]">
                    <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-white/60 mb-8 leading-tight">
                      For when your inner world feels difficult to sit with.                    </p>
                    <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Consult for Individuals
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-white/70 leading-snug font-nunito font-medium pt-2 lg:pt-10">
                  <p>Therapy for when your mind won&apos;t slow down. You might not call it a problem yet, but it&apos;s there.</p>
                  <p>Anxiety, overthinking, low mood, burnout, emotional instability, self-doubt these don’t always look serious from the outside.</p>
                  <p>The constant overthinking. The anxiety that sits in the background. The feeling of being mentally exhausted without a clear reason.</p>
                  <p>At unHeard., individual therapy is not about fixing you. It’s about understanding what’s happening beneath the surface, so things won’t keep repeating in the same way.</p>
                  <h4 className="text-white font-extrabold text-[18px] md:text-[20px]">How therapy works:</h4>
                  <div className="mt-4">
                    <button onClick={() => setShowFullIndividual(!showFullIndividual)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullIndividual ? 'Read Less' : 'Read more'}
                      <span className={`transition-transform duration-300 ${showFullIndividual ? 'rotate-180' : ''}`}>↓</span>
                    </button>

                    <AnimatePresence>
                      {showFullIndividual && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-white/10 mt-4">

                            <p>We offer one-on-one online therapy focused on emotional clarity, self-awareness, and sustainable change.</p>
                            <p className="font-bold text-[#0F9393]">This is where you start making sense of yourself without having to simplify it.</p>
                            <p className="font-bold text-[#0F9393]">
                              Structured psychological counselling with trained mental health professional. Online sessions. Confidential. At your pace.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Moving Cards Header */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] mb-8 text-left uppercase">
                <span className="text-[#FFFFFF] font-black tracking-[0.4em] text-[20px]">What we work with</span>
              </div>
            </div>

            {/* Breaking Out: Moving Cards Marquee (Full Screen Width) */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-6 md:py-10">
              <motion.div
                className="flex gap-4 md:gap-6 px-6"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              >
                {[...INDIVIDUAL_CARDS, ...INDIVIDUAL_CARDS].map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[230px] md:h-[292px] bg-[#1A1A1A] border border-white/10 rounded-[30px] relative shadow-sm group overflow-hidden">
                    <div className="p-5 md:p-6 pb-0">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="relative w-full h-[135px] md:h-[180px] rounded-[20px] overflow-hidden">
                        <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div ref={target1Ref} className="mt-8"></div>
            </div>
          </div>
        </div>
      </section>

      <section
        ref={card2Ref}
        data-section-id="2"
        className="sticky z-20 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint -mt-20 md:-mt-32"
        style={{
          top: `${stickyTop2}px`,
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] border border-black/5 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            <div className="h-12 md:h-20" />
            {/* Intro Header: 2-Column Grid (No nested card background) */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px] -mt-8 md:-mt-12">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <h2 className="text-[36px] md:text-[64px] font-bold font-georgia text-black leading-[1] tracking-tight text-balance">
                    Relationship & <br />
                    <span className="text-[#0F9393]">Couple Counseling.</span>
                  </h2>
                  <div className="max-w-[450px]">
                    <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-black/50 mb-8 leading-tight">
                      When conversations turn into conflicts, or silence.
                    </p>
                    <Button variant="black" className="bg-black text-white hover:bg-gray-800 w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Begin Relationship Support
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-black/60 leading-snug font-nunito font-medium pt-2 lg:pt-14">
                  <p>Most relationships don’t break suddenly. They strain quietly.</p>
                  <p>Misunderstandings repeat. Communication reduces. Small things start weighing more than they should.</p>
                  <p>Couple counseling isn’t about deciding who is right. It is about understanding the dynamics between two people.</p>
                  <p>Not every conflict is loud. Some just repeat quietly. <strong>Learn how it works</strong></p>

                  <div className="mt-4">
                    <button onClick={() => setShowFullRelationship(!showFullRelationship)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullRelationship ? 'Read Less' : 'Read more'}
                      <span className={`transition-transform duration-300 ${showFullRelationship ? 'rotate-180' : ''}`}>↓</span>
                    </button>

                    <AnimatePresence>
                      {showFullRelationship && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-black/5 mt-4">
                            <p>We work with couples and individuals navigating communication gaps and breakdowns, recurring conflicts and arguments, trust concerns, emotional distance, and unresolved resentment that builds over time.</p>
                            <p className="font-bold text-[#0F9393] text-[18px] md:text-[22px]">The goal isn’t to “fix” people. It’s to understand patterns, so something can actually shift.</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>

            {/* Moving Cards Header */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] mb-8 text-left uppercase">
                <span className="text-[#000000] font-black tracking-[0.4em] text-[20px]">What we work with</span>
              </div>
            </div>

            {/* Breaking Out: Moving Cards Marquee (Full Screen Width) */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-6 md:py-10">
              <motion.div
                className="flex gap-4 md:gap-6 px-6"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                {[...RELATIONSHIP_CARDS, ...RELATIONSHIP_CARDS].map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[230px] md:h-[292px] bg-white border border-black/5 rounded-[30px] relative shadow-sm group overflow-hidden">
                    <div className="p-5 md:p-6 pb-0">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-black line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="relative w-full h-[135px] md:h-[180px] rounded-[20px] overflow-hidden">
                        <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div ref={target2Ref} className="mt-8"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 03: ANXIETY & STRESS THERAPY */}
      <section
        ref={card3Ref}
        data-section-id="3"
        className="sticky z-30 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint -mt-20 md:-mt-32"
        style={{
          top: `${stickyTop3}px`,
          minHeight: sectionHeights['3'] ? `${sectionHeights['3']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#111111] rounded-t-[40px] rounded-b-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            <div className="h-12 md:h-20" />
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px] -mt-12 md:-mt-16">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <h2 className="text-[36px] md:text-[64px] font-bold font-georgia text-white leading-[1] tracking-tight text-balance">
                    Anxiety and <br />
                    <span className="text-[#0F9393]">Stress Therapy.</span>
                  </h2>
                  <div className="max-w-[450px]">
                    <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-white/60 mb-8 leading-tight">
                      Therapy for when your mind doesn’t switch off.
                    </p>
                    <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Start Anxiety Therapy
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-white/70 leading-snug font-nunito font-medium pt-2 lg:pt-14">
                  <p>Therapy for when your mind doesn’t switch off. Anxiety doesn’t always look dramatic. It’s just constant. Racing thoughts. Restlessness. A sense that something is wrong.</p>
                  <p>You don’t need to calm down. You need to understand what’s happening.</p>
                </div>
              </div>
            </div>

            {/* Moving Cards Header */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] mb-8 text-left uppercase">
                <span className="text-[#FFFFFF] font-black tracking-[0.4em] text-[20px]">What we work with</span>
              </div>
            </div>

            {/* Breaking Out: Moving Cards Marquee */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-6 md:py-10">
              <motion.div
                className="flex gap-4 md:gap-6 px-6"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              >
                {[...ANXIETY_CARDS, ...ANXIETY_CARDS].slice(0, 12).map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[230px] md:h-[292px] bg-[#1A1A1A] border border-white/10 rounded-[30px] relative shadow-sm group overflow-hidden">
                    <div className="p-5 md:p-6 pb-0">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="relative w-full h-[135px] md:h-[180px] rounded-[20px] overflow-hidden">
                        <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div ref={target3Ref} className="mt-8"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 04: ADOLESCENT & YOUNG ADULT (White Card) */}
      <section
        ref={card4Ref}
        data-section-id="4"
        className="sticky z-40 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint -mt-20 md:-mt-32"
        style={{
          top: `${stickyTop4}px`,
          minHeight: sectionHeights['4'] ? `${sectionHeights['4']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] border border-black/5 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            <div className="h-12 md:h-20" />
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px] -mt-12 md:-mt-16">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <h2 className="text-[36px] md:text-[64px] font-bold font-georgia text-black leading-[1] tracking-tight text-balance">
                    Adolescent & <br />
                    <span className="text-[#0F9393]">Young Adults.</span>
                  </h2>
                  <div className="max-w-[450px]">
                    <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-black/50 mb-8 leading-tight">
                      Growing up feels different now. Pressure from academics, career, expectations, it builds up quietly.
                    </p>
                    <Button variant="black" className="bg-black text-white hover:bg-gray-800 w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Support Your Growth
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-black/60 leading-snug font-nunito font-medium pt-2 lg:pt-14">
                  <p>Growing up now comes with different kinds of pressure.</p>
                  <p>Academic pressure, career confusion, identity struggles, social anxiety, comparison, peer pressure, digital overwhelm, family expectations, it’s a lot, and it shows up in ways that are often dismissed.</p>
                  <p>We provide a safe, structured space for adolescents and young adults to process, express, and find steadiness.</p>
                </div>
              </div>
            </div>

            {/* Moving Cards Header */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] mb-8 text-left uppercase">
                <span className="text-[#000000] font-black tracking-[0.4em] text-[20px]">What we work with</span>
              </div>
            </div>

            {/* Breaking Out: Moving Cards Marquee */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-6 md:py-10">
              <motion.div
                className="flex gap-4 md:gap-6 px-6"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                {[...ADOLESCENT_CARDS, ...ADOLESCENT_CARDS].slice(0, 12).map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[230px] md:h-[292px] bg-white border border-black/5 rounded-[30px] relative shadow-sm group overflow-hidden">
                    <div className="p-5 md:p-6 pb-0">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-black line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="relative w-full h-[135px] md:h-[180px] rounded-[20px] overflow-hidden">
                        <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div ref={target4Ref} className="mt-8"></div>
            </div>
          </div>
        </div>
      </section>

      {/* PILLAR 05: FAMILY & INTERPERSONAL */}
      <section
        ref={card5Ref}
        data-section-id="5"
        className="sticky z-50 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint -mt-20 md:-mt-32"
        style={{
          top: `${stickyTop5}px`
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#111111] rounded-t-[40px] rounded-b-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            <div className="h-12 md:h-20" />
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px] -mt-12 md:-mt-16">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <h2 className="text-[36px] md:text-[64px] font-bold font-georgia text-white leading-[1] tracking-tight text-balance">
                    Family & <br />
                    <span className="text-[#0F9393]">Interpersonal.</span>
                  </h2>
                  <div className="max-w-[450px]">
                    <p className="font-nunito font-semibold text-[18px] md:text-[22px] text-white/60 mb-8 leading-tight">
                      When it’s not just one person. In families, things are often unspoken or dismissed. But they show up.
                    </p>
                    <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Consult for Families
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-white/70 leading-snug font-nunito font-medium pt-2 lg:pt-14">
                  <p>Families don’t come with manuals. Just patterns.</p>
                  <p>We work with families dealing with conflict, communication gaps, dependency, emotional distance, and generational differences.</p>
                  <p>Without taking sides. Without oversimplifying.</p>
                </div>
              </div>
            </div>
            <div className="h-12 md:h-20" />

            {/* Moving Cards Header */}
            <div className="w-full flex flex-col items-center">
              <div className="w-full max-w-[1400px] mb-8 text-left uppercase">
                <span className="text-[#FFFFFF] font-black tracking-[0.4em] text-[20px]">We work with</span>
              </div>
            </div>

            {/* Breaking Out: Moving Cards Marquee */}
            <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden py-6 md:py-10">
              <motion.div
                className="flex gap-4 md:gap-6 px-6"
                animate={{ x: [0, -1200] }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              >
                {[...FAMILY_CARDS, ...FAMILY_CARDS].slice(0, 12).map((card, idx) => (
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[230px] md:h-[292px] bg-[#1A1A1A] border border-white/10 rounded-[30px] relative shadow-sm group overflow-hidden">
                    <div className="p-5 md:p-6 pb-0">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-2">
                        {card.title}
                      </h3>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                      <div className="relative w-full h-[135px] md:h-[180px] rounded-[20px] overflow-hidden">
                        <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <div ref={target5Ref} className="mt-8"></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
