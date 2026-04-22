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
      
      {/* HERO SECTION */}
      <div className="relative h-[80vh] max-h-[1000px] w-full flex items-center px-[5vw] lg:px-[10vw]">
        <div className="absolute inset-0 z-0">
          <Image src="/assets/servicesland.webp" alt="Services Hero" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#111111]" />
        </div>
        <div className="relative z-10 max-w-[800px] -mt-[100px]">
          <h1 className="text-[40px] md:text-[56px] font-bold leading-[1.1] text-white font-georgia mb-6 text-balance">
            Transformational frameworks for the modern mind.
          </h1>
          <p className="text-[18px] md:text-[22px] text-white/80 font-nunito max-w-[600px]">
            Strategic psychological counseling designed to build clarity, resilience, and alignment.
          </p>
        </div>
      </div>

      {/* PILLAR 01: INDIVIDUAL COUNSELING (White Card) */}
      <section
        ref={card1Ref}
        data-section-id="1"
        className="sticky z-10 w-full flex flex-col items-center will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop1}px`,
          minHeight: sectionHeights['1'] ? `${sectionHeights['1']}px` : 'auto'
        }}
      >
        <div className="relative w-[95vw] md:w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[50px] md:rounded-[100px] border border-black/5 shadow-2xl overflow-hidden flex flex-col items-center pt-24 md:pt-40 pb-24 px-6 md:px-12 lg:px-24 z-20 mt-10 md:mt-20">
          <div className="relative z-10 w-full flex flex-col items-center gap-12 lg:gap-20">
            <div className="flex flex-col gap-6 items-center text-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 01</span>
              <h2 className="text-[36px] md:text-[52px] font-bold font-georgia text-black leading-[1.1] tracking-tight max-w-[1000px] text-balance">
                Individual <span className="text-[#0F9393]">Psychological Work.</span>
              </h2>
              <div className="max-w-[850px]">
                <p className="font-nunito font-bold text-[20px] md:text-[28px] text-gray-500/80 mb-6 leading-relaxed text-balance">
                  Therapy for when your mind won&apos;t slow down. You might not call it a problem yet but it&apos;s there.
                </p>
                <button onClick={() => setShowFullIndividual(!showFullIndividual)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all mx-auto text-[16px] md:text-[18px]">
                  {showFullIndividual ? 'Read Less' : 'Read more about this pillar'}
                  <span className={`transition-transform duration-300 ${showFullIndividual ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <AnimatePresence>
                  {showFullIndividual && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-8 flex flex-col gap-8 text-[16px] md:text-[19px] text-gray-600 leading-relaxed font-nunito border-t border-black/5 mt-8 text-center px-4">
                        <p>Anxiety, overthinking, low mood, burnout, emotional instability, self-doubt—these don’t always look serious from the outside.</p>
                        <p>The constant overthinking. The anxiety that sits in the background. The feeling of being mentally exhausted without a clear reason.</p>
                        <p>At unHeard., individual therapy is not about fixing you. It’s about understanding what’s happening beneath the surface, so things won’t keep repeating in the same way.</p>
                        <div className="space-y-6">
                          <h4 className="text-black font-extrabold text-[20px] md:text-[24px]">How therapy works:</h4>
                          <p>We offer one-on-one online therapy focused on emotional clarity, self-awareness, and sustainable change.</p>
                          <p className="font-bold text-[#0F9393]">This is where you start making sense of yourself without having to simplify it.</p>
                        </div>
                        <p className="p-8 bg-[#F8F8F6] rounded-[30px] border border-black/5 italic font-medium text-black/70 max-w-[750px] mx-auto">Structured psychological counselling with trained mental health professionals. Online sessions. Confidential. At your pace.</p>
                        <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-[280px] md:w-[350px] h-[64px] rounded-full mx-auto" onClick={openBookingModal}>Start Individual Therapy</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-10 w-full auto-rows-[300px] mt-20 md:mt-32">
              {INDIVIDUAL_CARDS.map((card) => (
                <div key={card.id} className={`relative rounded-[40px] md:rounded-[60px] overflow-hidden group border border-black/5 ${card.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 transition-all group-hover:bg-[#0F9393]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rotate-[-45deg] group-hover:rotate-0 transition-transform">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-6 py-4 pt-8 rounded-[24px] backdrop-blur-xl bg-black/40 border border-white/10">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia text-white leading-tight">{card.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={target1Ref} className="mt-12 flex flex-row items-center justify-center gap-4 md:gap-10">
              <Button variant="black" className="w-[200px] md:w-[380px] h-[58px] md:h-[76px] flex items-center justify-center rounded-full text-[14px] md:text-[20px] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 px-4" onClick={openBookingModal}>Consult for Individuals</Button>
              <Image src="/assets/Group 54.svg" alt="Arrow" width={55} height={55} className="h-[40px] md:h-[60px] w-auto brightness-0 shrink-0" />
            </div>
          </div>
          <div className="h-[150px] w-full" />
        </div>
      </section>

      {/* PILLAR 02: RELATIONSHIP COUNSELING (Black Card) */}
      <section
        ref={card2Ref}
        data-section-id="2"
        className="sticky z-20 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop2}px`,
          minHeight: sectionHeights['2'] ? `${sectionHeights['2']}px` : 'auto'
        }}
      >
        <div className="relative w-[95vw] md:w-[97vw] max-w-[2440px] bg-[#171612] rounded-[50px] md:rounded-[100px] border border-white/5 overflow-hidden flex flex-col items-center pt-24 md:pt-40 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto shadow-2xl  z-20">
          <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24">
            <div className="flex flex-col gap-6 items-center text-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 02</span>
              <h2 className="text-[36px] md:text-[52px] font-bold font-georgia text-white leading-[1.1] tracking-tight text-balance">
                Relationship & <br className="md:hidden" />
                <span className="text-[#0F9393]">Couple Counseling.</span>
              </h2>
              <div className="max-w-[850px]">
                <p className="font-nunito font-bold text-[20px] md:text-[28px] text-gray-400 mb-6 leading-relaxed text-balance">
                  When conversations turn into conflicts, or silence.
                </p>
                <button onClick={() => setShowFullRelationship(!showFullRelationship)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all mx-auto text-[16px] md:text-[18px]">
                  {showFullRelationship ? 'Read Less' : 'Read more about this pillar'}
                  <span className={`transition-transform duration-300 ${showFullRelationship ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <AnimatePresence>
                  {showFullRelationship && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-8 flex flex-col gap-8 text-[16px] md:text-[19px] text-gray-400 leading-relaxed font-nunito border-t border-white/5 mt-8 text-center px-4">
                        <p>Most relationships don’t break suddenly. They strain quietly.</p>
                        <p>Misunderstandings repeat. Communication reduces. Small things start weighing more than they should.</p>
                        <p>Couple counseling isn’t about deciding who is right. It is about understanding the dynamics between two people.</p>
                        <p>Not every conflict is loud. Some just repeat quietly.</p>
                        <p>We work with couples and individuals navigating communication gaps and breakdowns, recurring conflicts and arguments, trust concerns, emotional distance, and unresolved resentment that builds over time.</p>
                        <p className="text-white font-bold italic text-[18px] md:text-[22px]">The goal isn’t to “fix” people. It’s to understand patterns, so something can actually shift.</p>
                        <Button variant="white" className="w-[280px] md:w-[350px] h-[64px] rounded-full mx-auto font-bold mt-4" onClick={openBookingModal}>Begin Relationship Support</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full auto-rows-[320px] mt-20 md:mt-32">
              {RELATIONSHIP_CARDS.map((card) => (
                <div key={card.id} className={`relative p-3 md:p-5 bg-white/5 rounded-[40px] md:rounded-[60px] group border border-white/5 ${card.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <div className="relative h-full w-full rounded-[32px] md:rounded-[45px] overflow-hidden">
                    <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                    <div className="absolute bottom-6 left-6 z-20">
                      <div className="px-6 py-4 pt-8 rounded-[24px] backdrop-blur-xl bg-black/60 border border-white/5">
                        <h3 className="text-[17px] md:text-[20px] font-bold font-georgia text-white leading-tight">{card.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={target2Ref} className="mt-12 flex flex-row items-center justify-center gap-4 md:gap-10">
              <Button variant="white" className="w-[200px] md:w-[380px] h-[58px] md:h-[76px] flex items-center justify-center rounded-full text-[14px] md:text-[20px] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 px-4" onClick={openBookingModal}>Optimize Relationship</Button>
              <Image src="/assets/Group 54.svg" alt="Arrow" width={55} height={55} className="h-[40px] md:h-[60px] w-auto brightness-0 invert shrink-0" />
            </div>
          </div>
          <div className="h-[200px] w-full" />
        </div>
      </section>

      {/* PILLAR 03: ANXIETY & STRESS THERAPY (White Card) */}
      <section
        ref={card3Ref}
        data-section-id="3"
        className="sticky z-30 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop3}px`,
          minHeight: sectionHeights['3'] ? `${sectionHeights['3']}px` : 'auto'
        }}
      >
        <div className="relative w-[95vw] md:w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[50px] md:rounded-[100px] border border-black/5 overflow-hidden flex flex-col items-center pt-24 md:pt-40 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto shadow-2xl z-20">
          <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24">
            <div className="flex flex-col gap-6 items-center text-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 03</span>
              <h2 className="text-[36px] md:text-[52px] font-bold font-georgia text-black leading-[1.1] tracking-tight text-balance">
                Anxiety and <br className="md:hidden" />
                <span className="text-[#0F9393]">Stress Therapy.</span>
              </h2>
              <div className="max-w-[850px]">
                <p className="font-nunito font-bold text-[20px] md:text-[28px] text-gray-500 mb-6 leading-relaxed text-balance">
                  Therapy for when your mind doesn’t switch off.
                </p>
                <button onClick={() => setShowFullAnxiety(!showFullAnxiety)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all mx-auto text-[16px] md:text-[18px]">
                  {showFullAnxiety ? 'Read Less' : 'Read more about this pillar'}
                  <span className={`transition-transform duration-300 ${showFullAnxiety ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <AnimatePresence>
                  {showFullAnxiety && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-8 flex flex-col gap-8 text-[16px] md:text-[19px] text-gray-600 leading-relaxed font-nunito border-t border-black/5 mt-8 text-center px-4">
                        <p>Anxiety doesn’t always look dramatic. It’s just constant. Racing thoughts. Restlessness. A sense that something is wrong.</p>
                        <p className="text-[#0F9393] font-bold italic text-[18px] md:text-[22px]">You don’t need to calm down. You need to understand what’s happening.</p>
                        <div className="p-8 bg-[#F8F8F6] rounded-[30px] border border-black/5 italic font-medium text-black/70 max-w-[750px] mx-auto leading-relaxed">
                          We help with generalised anxiety, panic attacks, social anxiety, health anxiety, stress overload, and sleep issues linked to anxiety.
                        </div>
                        <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-[280px] md:w-[350px] h-[64px] rounded-full mx-auto" onClick={openBookingModal}>Start Anxiety Therapy</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full auto-rows-[320px] mt-20 md:mt-32">
              {ANXIETY_CARDS.map((card) => (
                <div key={card.id} className={`relative rounded-[40px] md:rounded-[60px] overflow-hidden group border border-black/5 ${card.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-6 py-4 pt-8 rounded-[24px] backdrop-blur-xl bg-black/40 border border-white/10">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia text-white leading-tight">{card.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={target3Ref} className="mt-12 flex flex-row items-center justify-center gap-4 md:gap-10">
              <Button variant="black" className="w-[200px] md:w-[380px] h-[58px] md:h-[76px] flex items-center justify-center rounded-full text-[14px] md:text-[20px] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 px-4" onClick={openBookingModal}>Consult for Anxiety</Button>
              <Image src="/assets/Group 54.svg" alt="Arrow" width={55} height={55} className="h-[40px] md:h-[60px] w-auto brightness-0 shrink-0" />
            </div>
          </div>
          <div className="h-[200px] w-full" />
        </div>
      </section>

      {/* PILLAR 04: ADOLESCENT & YOUNG ADULT (Black Card) */}
      <section
        ref={card4Ref}
        data-section-id="4"
        className="sticky z-40 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop4}px`,
          minHeight: sectionHeights['4'] ? `${sectionHeights['4']}px` : 'auto'
        }}
      >
        <div className="relative w-[95vw] md:w-[97vw] max-w-[2440px] bg-[#171612] rounded-[50px] md:rounded-[100px] border border-white/5 overflow-hidden flex flex-col items-center pt-24 md:pt-40 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto shadow-2xl  z-20">
          <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24">
            <div className="flex flex-col gap-6 items-center text-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 04</span>
              <h2 className="text-[36px] md:text-[52px] font-bold font-georgia text-white leading-[1.1] tracking-tight text-balance">
                Adolescent & <br className="md:hidden" />
                <span className="text-[#0F9393]">Young Adult Counseling.</span>
              </h2>
              <div className="max-w-[850px]">
                <p className="font-nunito font-bold text-[20px] md:text-[28px] text-gray-400 mb-6 font-georgia italic leading-relaxed text-balance">
                  Growing up feels different now. Pressure from academics, career, expectations, it builds up quietly.
                </p>
                <button onClick={() => setShowFullAdolescent(!showFullAdolescent)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all mx-auto text-[16px] md:text-[18px]">
                  {showFullAdolescent ? 'Read Less' : 'Read more about this pillar'}
                  <span className={`transition-transform duration-300 ${showFullAdolescent ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <AnimatePresence>
                  {showFullAdolescent && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-8 flex flex-col gap-8 text-[16px] md:text-[19px] text-gray-400 leading-relaxed font-nunito border-t border-white/5 mt-8 text-center px-4">
                        <p>Growing up now comes with different kinds of pressure. Academic pressure, career confusion, identity struggles, social anxiety, comparison, peer pressure, digital overwhelm, family expectations, it’s a lot, and it shows up in ways that are often dismissed.</p>
                        <p className="text-[#0F9393] font-bold italic text-[18px] md:text-[22px]">This is a space where things don’t have to be filtered.</p>
                        <p className="p-8 bg-white/5 rounded-[30px] border border-white/10 italic font-medium text-white/70 max-w-[750px] mx-auto leading-relaxed">We provide a safe, structured space for adolescents and young adults to process, express, and find steadiness.</p>
                        <Button variant="white" className="w-[280px] md:w-[350px] h-[64px] rounded-full mx-auto font-bold mt-4" onClick={openBookingModal}>Support Your Growth</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full auto-rows-[320px] mt-20 md:mt-32">
              {ADOLESCENT_CARDS.map((card) => (
                <div key={card.id} className={`relative rounded-[40px] md:rounded-[60px] overflow-hidden group border border-white/5 ${card.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-6 py-4 pt-8 rounded-[24px] backdrop-blur-xl bg-black/60 border border-white/5">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia text-white leading-tight">{card.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={target4Ref} className="mt-12 flex flex-row items-center justify-center gap-4 md:gap-10">
              <Button variant="white" className="w-[200px] md:w-[380px] h-[58px] md:h-[76px] flex items-center justify-center rounded-full text-[14px] md:text-[20px] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 px-4" onClick={openBookingModal}>Consult for Young Adults</Button>
              <Image src="/assets/Group 54.svg" alt="Arrow" width={55} height={55} className="h-[40px] md:h-[60px] w-auto brightness-0 invert shrink-0" />
            </div>
          </div>
          <div className="h-[200px] w-full" />
        </div>
      </section>

      {/* PILLAR 05: FAMILY & INTERPERSONAL (White Card) */}
      <section
        ref={card5Ref}
        data-section-id="5"
        className="sticky z-50 w-full flex flex-col items-center pointer-events-none will-change-[top,transform] transform-gpu contain-paint"
        style={{ 
          top: `${stickyTop5}px`,
          minHeight: sectionHeights['5'] ? `${sectionHeights['5']}px` : 'auto'
        }}
      >
        <div className="relative w-[95vw] md:w-[97vw] max-w-[2440px] bg-[#FEFEFC] rounded-[50px] md:rounded-[100px] border border-black/5 overflow-hidden flex flex-col items-center pt-24 md:pt-40 pb-40 px-6 md:px-12 lg:px-24 pointer-events-auto shadow-2xl z-20">
          <div className="relative z-10 w-full flex flex-col items-center gap-16 lg:gap-24">
            <div className="flex flex-col gap-6 items-center text-center">
              <span className="text-[#0F9393] font-bold uppercase tracking-[0.2em] text-[14px]">PILLAR 05</span>
              <h2 className="text-[36px] md:text-[52px] font-bold font-georgia text-black leading-[1.1] tracking-tight text-balance">
                Family & <br className="md:hidden" />
                <span className="text-[#0F9393]">Interpersonal Therapy.</span>
              </h2>
              <div className="max-w-[850px]">
                <p className="font-nunito font-bold text-[20px] md:text-[28px] text-gray-500 mb-6 leading-relaxed text-balance">
                  When it’s not just one person. In families, things are often unspoken or dismissed. But they show up.
                </p>
                <button onClick={() => setShowFullFamily(!showFullFamily)} className="text-[#0F9393] font-bold flex items-center gap-2 hover:underline transition-all mx-auto text-[16px] md:text-[18px]">
                  {showFullFamily ? 'Read Less' : 'Read more about this pillar'}
                  <span className={`transition-transform duration-300 ${showFullFamily ? 'rotate-180' : ''}`}>↓</span>
                </button>
                <AnimatePresence>
                  {showFullFamily && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pt-8 flex flex-col gap-8 text-[16px] md:text-[19px] text-gray-600 leading-relaxed font-nunito border-t border-black/5 mt-8 text-center px-4">
                        <p>Families don’t come with manuals. Just patterns.</p>
                        <p>We work with families dealing with conflict, communication gaps, dependency, emotional distance, and generational differences. Without taking sides. Without oversimplifying.</p>
                        <p className="text-black font-bold italic text-[18px] md:text-[22px]">Family therapy helps understand patterns without blame.</p>
                        <p className="p-8 bg-[#F8F8F6] rounded-[30px] border border-black/5 italic font-medium text-black/70 max-w-[750px] mx-auto leading-relaxed">Structured support focused on building bridges between generational differences and rebuilding broken communication channels.</p>
                        <Button variant="black" className="bg-[#0F9393] text-white hover:bg-[#0D7A7A] w-[280px] md:w-[350px] h-[64px] rounded-full mx-auto" onClick={openBookingModal}>Start family counseling</Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full auto-rows-[320px] mt-20 md:mt-32">
              {FAMILY_CARDS.map((card) => (
                <div key={card.id} className={`relative rounded-[40px] md:rounded-[60px] overflow-hidden group border border-black/5 ${card.size === 'lg' ? 'md:col-span-2' : 'md:col-span-1'}`}>
                  <Image src={card.image} alt={card.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute bottom-6 left-6 z-20">
                    <div className="px-6 py-4 pt-8 rounded-[24px] backdrop-blur-xl bg-black/40 border border-white/10">
                      <h3 className="text-[17px] md:text-[20px] font-bold font-georgia text-white leading-tight">{card.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div ref={target5Ref} className="mt-12 flex flex-row items-center justify-center gap-4 md:gap-10">
              <Button variant="black" className="w-[200px] md:w-[380px] h-[58px] md:h-[76px] flex items-center justify-center rounded-full text-[14px] md:text-[20px] font-bold shadow-xl transition-all hover:scale-105 active:scale-95 px-4" onClick={openBookingModal}>Consult for Families</Button>
              <Image src="/assets/Group 54.svg" alt="Arrow" width={55} height={55} className="h-[40px] md:h-[60px] w-auto brightness-0 shrink-0" />
            </div>
          </div>
          <div className="h-[250px] w-full" />
        </div>
      </section>

    </div>
  );
}
