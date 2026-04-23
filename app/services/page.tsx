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
  { id: 6, title: 'Stress related to work, studies or life decisions', image: '/assets/service/bento_stress.webp', size: 'md' },
  { id: 7, title: 'Feeling stuck, disconnected, or overwhelmed', image: '/assets/service/bento_stuck.webp', size: 'lg' },
  { id: 8, title: 'Personal Growth & Emotional Clarity', image: '/assets/service/bento_growth.webp', size: 'md' }
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
  { id: 1, title: 'Academic stress & Pressure', image: '/assets/service/bento_stress.webp', size: 'lg' },
  { id: 2, title: 'Career confusion', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 3, title: 'Social anxiety', image: '/assets/service/bento_anxiety.webp', size: 'md' },
  { id: 4, title: 'Identity & Confidence', image: '/assets/service/bento_growth.webp', size: 'lg' },
  { id: 5, title: 'Emotional sensitivity', image: '/assets/service/bento_stuck.webp', size: 'md' },
  { id: 6, title: 'Peer Dynamics & Comparison', image: '/assets/service/bento_self_doubt.webp', size: 'md' }
];

const FAMILY_CARDS = [
  { id: 1, title: 'Parent-child conflict', image: '/assets/service/bento_burnout.webp', size: 'lg' },
  { id: 2, title: 'Communication gaps', image: '/assets/service/bento_stuck.webp', size: 'md' },
  { id: 3, title: 'Emotional distance', image: '/assets/service/bento_anxiety.webp', size: 'md' },
  { id: 4, title: 'Generational differences', image: '/assets/service/bento_growth.webp', size: 'lg' },
  { id: 5, title: 'Unspoken Family Dynamics', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 6, title: 'Pattern Recognition', image: '/assets/service/bento_self_doubt.webp', size: 'md' }
];

const ANXIETY_CARDS = [
  { id: 1, title: 'Generalised anxiety and constant worry', image: '/assets/service/bento_anxiety.webp', size: 'lg' },
  { id: 2, title: 'Panic attacks and physical sensations', image: '/assets/service/bento_overthinking.webp', size: 'md' },
  { id: 3, title: 'Social anxiety and performance pressure', image: '/assets/service/bento_stress.webp', size: 'md' },
  { id: 4, title: 'Health anxiety and hyper-vigilance', image: '/assets/service/bento_growth.webp', size: 'lg' },
  { id: 5, title: 'Stress overload and emotional fatigue', image: '/assets/service/bento_burnout.webp', size: 'md' },
  { id: 6, title: 'Sleep issues linked to racing thoughts', image: '/assets/service/bento_stuck.webp', size: 'md' }
];

export default function ServicesPage() {
  const { openBookingModal } = useBooking();
  const [showFullIndividual, setShowFullIndividual] = useState(false);
  const [showFullRelationship, setShowFullRelationship] = useState(false);
  const [showFullAdolescent, setShowFullAdolescent] = useState(false);
  const [showFullFamily, setShowFullFamily] = useState(false);
  const [showFullAnxiety, setShowFullAnxiety] = useState(false);

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
          minHeight: sectionHeights['1'] ? `${sectionHeights['1']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#1A1A1A] rounded-t-[40px] rounded-b-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center pt-36 md:pt-52 pb-24 px-6 md:px-12 lg:px-24 z-20">
          <div className="relative z-10 w-full">
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
                      Therapy for when your mind won&apos;t slow down. You might not call it a problem yet but it&apos;s there.
                    </p>
                    <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-full md:w-[280px] h-[60px] rounded-full text-[16px] md:text-[18px]" onClick={openBookingModal}>
                      Consult for Individuals
                    </Button>
                  </div>
                </div>

                {/* Right Column: Descriptions &Philosophy */}
                <div className="flex flex-col gap-4 text-left text-[16px] md:text-[19px] text-white/70 leading-snug font-nunito font-medium pt-2 lg:pt-10">
                  <p>Anxiety, overthinking, low mood, burnout, emotional instability, self-doubt—these don’t always look serious from the outside.</p>
                  <p>The constant overthinking. The anxiety that sits in the background. The feeling of being mentally exhausted without a clear reason.</p>
                  <p>At unHeard., individual therapy is not about fixing you. It’s about understanding what’s happening beneath the surface, so things won’t keep repeating in the same way.</p>
                  
                  <div className="mt-4">
                    <button onClick={() => setShowFullIndividual(!showFullIndividual)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullIndividual ? 'Read Less' : 'Read more'}
                      <span className={`transition-transform duration-300 ${showFullIndividual ? 'rotate-180' : ''}`}>↓</span>
                    </button>
                    
                    <AnimatePresence>
                      {showFullIndividual && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-white/10 mt-4">
                            <h4 className="text-white font-extrabold text-[18px] md:text-[20px]">How therapy works:</h4>
                            <p>We offer one-on-one online therapy focused on emotional clarity, self-awareness, and sustainable change.</p>
                            <p className="font-bold text-[#0F9393]">This is where you start making sense of yourself without having to simplify it.</p>
                            <p className="p-6 bg-white/5 rounded-[24px] border border-white/5 italic font-medium text-white/50 text-[15px] md:text-[17px]">
                              Structured psychological counselling with trained mental health professionals. Online sessions. Confidential. At your pace.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
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
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[300px] md:h-[360px] bg-[#1A1A1A] border border-white/10 rounded-[35px] p-4 md:p-6 flex flex-col relative shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-[12px] font-bold bg-white/5 px-2.5 py-0.5 rounded-full text-white/30 border border-white/5">
                        {idx % 4 === 0 ? '18-65 | Private' : idx % 4 === 1 ? '13-25 | Teens' : idx % 4 === 2 ? 'Person | Group' : '18-65 | Family'}
                      </span>
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-white/5 flex items-center justify-center opacity-50">
                        <div className="w-1 h-1 rounded-full bg-[#0F9393]/30" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-1">
                        {card.title.split(' and ')[0]}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-white/30 font-nunito leading-tight line-clamp-1">
                        {card.title.includes('and') ? card.title.split(' and ')[1] : 'Personalized support.'}
                      </p>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 h-[140px] md:h-[180px] rounded-[28px] overflow-hidden">
                      <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all shadow-lg">
                          <span className="text-[9px] md:text-[11px] font-bold text-white uppercase tracking-wider">Read More</span>
                        </div>
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

      {/* PILLAR 02: RELATIONSHIP COUNSELING (Black Card) */}
      <section
        ref={card2Ref}
        data-section-id="2"
        className="sticky z-20 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint -mt-20 md:-mt-32"
        style={{
          top: `${stickyTop2}px`,
          minHeight: sectionHeights['2'] ? `${sectionHeights['2']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] border border-black/5 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            {/* Intro Header: 2-Column Grid (No nested card background) */}
            <div className="w-full flex flex-col items-center mb-16">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px]">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 02</span>
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
                  <p>Most relationships don’t break suddenly. They strain quietly. Misunderstandings repeat. Communication reduces. Small things start weighing more than they should.</p>
                  <p>Couple counseling isn’t about deciding who is right. It is about understanding the dynamics between two people.</p>
                  <p>We work with couples navigating communication gaps, recurring conflicts, trust concerns, emotional distance, and unresolved resentment.</p>
                  
                  <div className="mt-4">
                    <button onClick={() => setShowFullRelationship(!showFullRelationship)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullRelationship ? 'Read Less' : 'Read more about this pillar'}
                      <span className={`transition-transform duration-300 ${showFullRelationship ? 'rotate-180' : ''}`}>↓</span>
                    </button>
                    
                    <AnimatePresence>
                      {showFullRelationship && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-black/5 mt-4">
                            <p>Not every conflict is loud. Some just repeat quietly.</p>
                            <p className="font-bold text-[#0F9393] text-[18px] md:text-[22px]">The goal isn’t to “fix” people. It’s to understand patterns, so something can actually shift.</p>
                            <p className="p-6 bg-black/5 rounded-[24px] border border-black/5 italic font-medium text-black/40 text-[15px] md:text-[17px]">
                              Strategic couple therapy focused on dynamics, intimacy, and sustainable relational growth.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
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
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[300px] md:h-[360px] bg-white border border-black/5 rounded-[35px] p-4 md:p-6 flex flex-col relative shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-[12px] font-bold bg-black/5 px-2.5 py-0.5 rounded-full text-black/30 border border-black/5">
                        {idx % 3 === 0 ? 'Couples | High Res' : 'Marital | Private'}
                      </span>
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full border border-black/5 flex items-center justify-center opacity-50">
                        <div className="w-1 h-1 rounded-full bg-[#0F9393]/30" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-black line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-black/40 font-nunito leading-tight line-clamp-1">
                        Professional support for relational health.
                      </p>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 h-[140px] md:h-[180px] rounded-[28px] overflow-hidden">
                      <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
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
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px]">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 03</span>
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
                  <p>Anxiety doesn’t always look dramatic. It’s just constant. Racing thoughts. Restlessness. A sense that something is wrong.</p>
                  <p>You don’t need to calm down. You need to understand what’s happening beneath the surface.</p>
                  <p>We help with generalised anxiety, panic attacks, social anxiety, health anxiety, and stress overload.</p>
                  
                  <div className="mt-4">
                    <button onClick={() => setShowFullAnxiety(!showFullAnxiety)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullAnxiety ? 'Read Less' : 'Read more about this pillar'}
                      <span className={`transition-transform duration-300 ${showFullAnxiety ? 'rotate-180' : ''}`}>↓</span>
                    </button>
                    
                    <AnimatePresence>
                      {showFullAnxiety && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-white/10 mt-4">
                            <p>Anxiety is often just your mind trying to protect you in a way that isn&apos;t working anymore.</p>
                            <p className="font-bold text-[#0F9393] text-[18px] md:text-[22px]">Sustainable change comes from self-awareness, not just coping mechanisms.</p>
                            <p className="p-6 bg-white/5 rounded-[24px] border border-white/5 italic font-medium text-white/50 text-[15px] md:text-[17px]">
                              Deep psychological work focused on root causes of stress and anxiety dynamics.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
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
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[300px] md:h-[360px] bg-[#1A1A1A] border border-white/10 rounded-[35px] p-4 md:p-6 flex flex-col relative shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-[12px] font-bold bg-white/5 px-2.5 py-0.5 rounded-full text-white/30 border border-white/5">
                         Relief | Sustainable
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-white/30 font-nunito leading-tight line-clamp-1">
                        Expert guidance for emotional stability.
                      </p>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 h-[140px] md:h-[180px] rounded-[28px] overflow-hidden">
                      <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all shadow-lg">
                          <span className="text-[9px] md:text-[11px] font-bold text-white uppercase tracking-wider">Learn More</span>
                        </div>
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
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px]">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 04</span>
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
                  <p>Academic pressure, career confusion, identity struggles, social anxiety, comparison—it’s a lot, and it shows up in ways that are often dismissed.</p>
                  <p>This is a space where things don’t have to be filtered. A safe, structured space for adolescents and young adults to process and find steadiness.</p>
                  
                  <div className="mt-4">
                    <button onClick={() => setShowFullAdolescent(!showFullAdolescent)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullAdolescent ? 'Read Less' : 'Read more about this pillar'}
                      <span className={`transition-transform duration-300 ${showFullAdolescent ? 'rotate-180' : ''}`}>↓</span>
                    </button>
                    
                    <AnimatePresence>
                      {showFullAdolescent && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-black/5 mt-4">
                            <p>Identity development isn&apos;t just about finding yourself—it&apos;s about understanding the environment you&apos;re growing up in.</p>
                            <p className="font-bold text-[#0F9393] text-[18px] md:text-[22px]">We provide professional guidance for navigating transitions and peer dynamics.</p>
                            <p className="p-6 bg-black/5 rounded-[24px] border border-black/5 italic font-medium text-black/40 text-[15px] md:text-[17px]">
                              Evidence-based counseling for the internal and external challenges of young adulthood.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
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
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[300px] md:h-[360px] bg-white border border-black/5 rounded-[35px] p-4 md:p-6 flex flex-col relative shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] md:text-[12px] font-bold bg-black/5 px-2.5 py-0.5 rounded-full text-black/30 border border-black/5">
                        Transition | Support
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-black line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-black/40 font-nunito leading-tight line-clamp-1">
                        Support for the modern young adult.
                      </p>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 h-[140px] md:h-[180px] rounded-[28px] overflow-hidden">
                      <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 bg-black/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-black/10 cursor-pointer hover:bg-black/10 transition-all shadow-lg">
                          <span className="text-[9px] md:text-[11px] font-bold text-black uppercase tracking-wider">Expand</span>
                        </div>
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
          top: `${stickyTop5}px`,
          minHeight: sectionHeights['5'] ? `${sectionHeights['5']}px` : 'auto'
        }}
      >
        <div className="relative w-[97vw] max-w-[2440px] bg-[#111111] rounded-t-[40px] rounded-b-[40px] border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center pt-18 pb-24 px-6 md:px-12 lg:px-24 pointer-events-auto z-20">
          <div className="relative z-10 w-full">
            {/* Intro Header: 2-Column Grid */}
            <div className="w-full flex flex-col items-center mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-start w-full max-w-[1400px]">
                {/* Left Column: Heading & Primary Subtext */}
                <div className="flex flex-col gap-6 text-left">
                  <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 05</span>
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
                  <p>Families don’t come with manuals. Just patterns. We work with families dealing with conflict, communication gaps, dependency, and generational differences.</p>
                  <p>Family therapy helps understand patterns without blame. Rebuilding bridges and communication channels.</p>
                  
                  <div className="mt-4">
                    <button onClick={() => setShowFullFamily(!showFullFamily)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all text-[16px]">
                      {showFullFamily ? 'Read Less' : 'Read more about this pillar'}
                      <span className={`transition-transform duration-300 ${showFullFamily ? 'rotate-180' : ''}`}>↓</span>
                    </button>
                    
                    <AnimatePresence>
                      {showFullFamily && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="pt-6 flex flex-col gap-5 border-t border-white/10 mt-4">
                            <p>Interpersonal dynamics define how we feel in our most private spaces.</p>
                            <p className="font-bold text-[#0F9393] text-[18px] md:text-[22px]">Structured support for generational healing and rebuilding broken channels.</p>
                            <p className="p-6 bg-white/5 rounded-[24px] border border-white/5 italic font-medium text-white/50 text-[15px] md:text-[17px]">
                              Clinical family systems therapy for sustainable relational harmony.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
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
                  <div key={`${card.id}-${idx}`} className="flex-shrink-0 w-[240px] md:w-[320px] h-[300px] md:h-[360px] bg-[#1A1A1A] border border-white/10 rounded-[35px] p-4 md:p-6 flex flex-col relative shadow-sm group overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-[10px] md:text-[12px] font-bold bg-white/5 px-2.5 py-0.5 rounded-full text-white/30 border border-white/5">
                        Relational | Legacy
                      </span>
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia leading-tight text-white line-clamp-1">
                        {card.title}
                      </h3>
                      <p className="text-[11px] md:text-[13px] text-white/30 font-nunito leading-tight line-clamp-1">
                        Healing generational patterns.
                      </p>
                    </div>

                    <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6 h-[140px] md:h-[180px] rounded-[28px] overflow-hidden">
                      <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all shadow-lg">
                          <span className="text-[9px] md:text-[11px] font-bold text-white uppercase tracking-wider">Start Here</span>
                        </div>
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
