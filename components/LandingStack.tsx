'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import { LucideIcon, Smartphone, ShieldCheck, UserCheck } from 'lucide-react';
import { useBooking } from '@/components/BookingContext';
import AnimatedCounter from './ui/AnimatedCounter';

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------
const faqData = [
  {
    question: "What are the Pricing plans?",
    answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    question: "How qualified are the therapists?",
    answer: "All our therapists are carefully vetted, licensed professionals with extensive experience in various therapeutic modalities to ensure you receive the best care possible."
  },
  {
    question: "How do online sessions work?",
    answer: "Online sessions are conducted via secure, high-quality video calls. You can join from the comfort of your own home, making therapy more accessible and convenient than ever."
  }
];

const testimonialData = [
  {
    text: "I was really nervous to try online therapy at first, but it turned out to be one of the best decisions I've made. I felt comfortable സംസാരിക്കുന്നത് from my own space, and my counselor really listened without judging me.",
    author: "Anonymous"
  },
  {
    text: "The progress I've made here has been life-changing. I finally found someone who understands my unique struggles and gives me actionable tools to improve my mindset.",
    author: "Anonymous"
  },
  {
    text: "Unheard gave me the privacy and convenience I needed. Knowing I didn't have to commute made committing to my mental health journey so much easier.",
    author: "Anonymous"
  }
];

const blogData = [
  {
    title: "What is the cause of anxiety in adults?",
    author: "Balkrishna Iyer",
    date: "15 February 2026",
    readTime: "10 min read",
    image: "/assets/section_2_3.png",
    keywords: ["Anxiety", "Adults", "Causes"]
  },
  {
    title: "How to manage stress at work effectively",
    author: "Ananya Sharma",
    date: "10 March 2026",
    readTime: "8 min read",
    image: "/assets/section_2_4.png",
    keywords: ["Stress", "Work", "Mindfulness"]
  },
  {
    title: "The importance of regular meditation",
    author: "Rahul Verma",
    date: "22 February 2026",
    readTime: "12 min read",
    image: "/assets/section_2_1.png",
    keywords: ["Meditation", "Mental Health", "Wellness"]
  }
];

interface FeatureCardProps {
  title: string;
  description: string;
}

const FeatureCard = ({ title, description }: FeatureCardProps) => {
  const formatTitle = (text: string) => {
    if (text.includes(' & ')) {
      const parts = text.split(' & ');
      return (
        <>
          {parts[0]} &amp; <br /> {parts[1]}
        </>
      );
    }
    return text;
  };

  return (
    <div className="relative w-full max-w-[367px] h-auto min-h-[496px] rounded-[15px] overflow-hidden group mx-auto flex flex-col items-stretch">
      
      {/* LAYER 0: Bottom Background Elements (Behind the glass) */}
      {/* The Teal Text remains here so it gets blured by the glass overlay */}
      <div className="absolute inset-0 z-0 flex flex-col justify-end pointer-events-none">
        {/* Rectangle 10 (Footer Background) */}
        <div className="w-full h-[96px] bg-[#0F1615] rounded-b-[15px] relative flex flex-col justify-center px-4">
          <div className="flex flex-row items-center justify-between w-full mt-2 pr-2">
             {/* Invisible spacer for circles so flex-between aligns text correctly */}
             <div className="flex -space-x-3 ml-2 opacity-0">
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
             </div>
             
             {/* Footer Teal Title (Behind glass) */}
             <div className="font-georgia font-bold text-[18px] md:text-[20px] leading-[23px] tracking-[-0.02em] text-right bg-[linear-gradient(90deg,#A0F5F5_0%,#0F9393_100%)] bg-clip-text text-transparent opacity-50">
               {formatTitle(title)}
             </div>
          </div>
        </div>
      </div>

      {/* LAYER 1: The Glassmorphism Base (Rectangle 3) */}
      {/* Reduced blur per user request for natural readability */}
      <div className="absolute inset-0 z-10 bg-[rgba(28,27,20,0.23)] backdrop-blur-[1px] border border-[rgba(0,0,0,0.12)] rounded-[15px] shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] pointer-events-none transition-all duration-300 group-hover:bg-[rgba(28,27,20,0.3)]"></div>

      {/* LAYER 2: Foreground Text & Crisp Elements (Top Title, Description, Circles, Line) */}
      <div className="relative z-20 pt-[30px] flex flex-col h-full pointer-events-auto">
        
        {/* Main Text Content */}
        <div className="px-6 flex flex-col items-center text-center flex-grow">
          <h3 className="w-full font-georgia font-bold text-[28px] leading-[32px] tracking-[-0.02em] text-white mb-10 text-left">
            {formatTitle(title)}
          </h3>
          
          <p className="w-full font-nunito font-bold text-[16px] leading-[22px] tracking-[-0.02em] bg-[linear-gradient(90deg,#FFFFFF_0%,#D9FFF4_81.74%)] bg-clip-text text-transparent text-left opacity-90">
            {description}
          </p>
        </div>

        {/* Footer Overlay Container (Crisp line and circles) */}
        <div className="w-full h-[96px] relative flex flex-col justify-center px-4 pointer-events-none">
          {/* White Separation Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[326.51px] border-t border-white/20"></div>
          
          <div className="flex flex-row items-center justify-between w-full mt-2 pr-2">
             {/* Crisp Circles (On top of glass) */}
             <div className="flex -space-x-3 ml-2">
               <div className="w-[29px] h-[29px] rounded-full bg-[#D9D9D9]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#BEB8B8]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#B0A5A5]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#D9D9D9]"></div>
             </div>
             
             {/* Invisible spacer so circles stay on the left */}
             <div className="font-georgia font-bold text-[18px] md:text-[20px] leading-[23px] tracking-[-0.02em] text-right opacity-0">
               {formatTitle(title)}
             </div>
          </div>
        </div>

      </div>

    </div>
  );
};

const understandingContent = [
  {
    images: [
      { src: '/assets/section_2_1.png', label: 'Anxiety And overthinking' },
      { src: '/assets/section_2_2.png', label: 'Depression and Low Mood' }
    ],
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  },
  {
    images: [
      { src: '/assets/section_2_3.png', label: 'Stress and burnout' },
      { src: '/assets/section_2_4.png', label: 'Anxiety And overthinking' }
    ],
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  }
];

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
        
        // Use offsetTop accumulation to find the CTA center relative to card top.
        // This is layout-invariant and doesn't flicker on scroll.
        let ctaCenterOffset = cta.offsetHeight / 2;
        let curr: HTMLElement | null = cta;
        while (curr && curr !== card) {
          ctaCenterOffset += curr.offsetTop;
          // Traverse up to find the next offset parent until we reach the card
          const parent = curr.offsetParent as HTMLElement;
          if (!parent) break;
          curr = parent;
        }
        
        const targetViewportY = window.innerHeight * 0.5;
        return Math.min(targetViewportY - ctaCenterOffset, 0);
      };

      const getActiveCta2 = () => {
        if (cta2Ref.current && cta2Ref.current.offsetWidth > 0) return cta2Ref.current;
        if (cta2MobileRef.current && cta2MobileRef.current.offsetWidth > 0) return cta2MobileRef.current;
        return cta2Ref.current;
      };

      setStickyTop1(getOffset(card1Ref.current, cta1Ref.current));
      setStickyTop2(getOffset(card2Ref.current, lastRef2.current));
      setStickyTop3(getOffset(card3Ref.current, lastRef3.current));
    };

    calculatePinOffset();
    
    const timer1 = setTimeout(calculatePinOffset, 100);
    const timer2 = setTimeout(calculatePinOffset, 500);
    const timer3 = setTimeout(calculatePinOffset, 2000);

    window.addEventListener('resize', calculatePinOffset);

    return () => {
      window.removeEventListener('resize', calculatePinOffset);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#111111]">
      {/* 
        CARD 1: Hero + White Card 
        Scrolls up and uses a dynamically calculated top offset.
      */}
      <section
        ref={card1Ref}
        className="sticky z-10 w-full"
        style={{ top: `${stickyTop1}px` }}
      >
        <div className="w-full flex flex-col items-center">
          {/* Hero Section */}
          <div className="relative h-screen w-full flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0">
              <Image src="/assets/landingimage.png" alt="Hero Background" fill sizes="100vw" className="object-cover opacity-60" priority />
              <div className="absolute inset-0" />
            </div>
            <div className="relative z-10 max-w-[800px] flex flex-col gap-8">
              <h1 className="text-[40px] md:text-[50px] font-bold leading-[1.1] tracking-[-0.02em] text-white font-georgia">
                Confidential Online Therapy <br /> That Helps You Feel Better
              </h1>
              <p className="text-[20px] md:text-[25px] font-bold leading-[1.4] tracking-[-0.02em] max-w-[733px] font-nunito bg-gradient-to-r from-white to-[#FFF7E9] bg-clip-text text-transparent">
                Evidence-based online therapy delivered by licensed clinicians — supporting you through anxiety, depression, stress, trauma, and relationship challenges. Start your personalized care journey today
              </p>
              <div className="flex flex-row items-center gap-6 mt-4">
                <Button variant="gray" className="w-[241px] h-[56px] text-[20px] px-6 whitespace-nowrap" onClick={openBookingModal}>Start Feeling Better !</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[40px] md:h-[60px] w-auto mt-2" />
              </div>
            </div>
          </div>

          {/* White Card Section */}
          <div className="w-full px-4 flex justify-center pb-20 -mt-[150px] md:-mt-[200px] relative z-10">
            <div className="w-[90vw] max-w-[1400px] bg-[#FEFEFC] rounded-[40px] py-16 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-xl min-h-[120vh]">
              <div className="md:w-[832px] text-center mb-16">
                <h2 className="font-georgia text-[32px] md:text-[45px] font-bold leading-tight text-black mb-8">
                  Feeling like no one in the world understands <span className="text-[#008080]">your struggle</span>?
                </h2>
                <p className="font-nunito text-[20px] md:text-[25px] font-bold leading-relaxed bg-gradient-to-r from-black to-[#666666] bg-clip-text text-transparent">
                  You&apos;re not alone. Many people struggle silently without realizing that what they&apos;re experiencing has a name — and more importantly, a solution.
                </p>
              </div>
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
                      <p className="font-nunito text-[18px] md:text-[20px] font-bold leading-relaxed text-black/80">{row.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={cta1Ref} className="mt-20 flex flex-row items-center gap-6">
                <Button variant="black" className="w-[241px] h-[56px] text-[20px] px-6 whitespace-nowrap" onClick={openBookingModal}>Start Feeling Better !</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[35px] md:h-[50px] w-auto mt-2 invert" />
              </div>
              {/* Spacer to prevent CTA from being covered by next card's rounded top */}
              <div className="h-[150px] md:h-[250px] w-full" />
            </div>
          </div>
        </div>
      </section>


      <section 
        ref={card2Ref}
        className="sticky z-20 w-full flex justify-center pt-[200px] pb-20 -mt-40 md:-mt-[250px] pointer-events-none"
        style={{ top: `${stickyTop2}px` }}
      >
        <div className="w-[90vw] max-w-[1400px] bg-[#171612] rounded-t-[40px] rounded-b-[40px] pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-2xl pointer-events-auto">
          <div className="text-center mb-20 max-w-[900px]">
            <h2 className="font-georgia text-[32px] md:text-[52px] font-bold leading-tight text-white mb-6">Why Choose Unheard? Because the <span className="text-[#008080]">Silenced Voice Deserves</span> to Be Heard!</h2>
            <p className="font-georgia text-[24px] md:text-[45px] font-bold leading-tight text-white">
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1400px] items-stretch">
            <FeatureCard title="Convenience & Accessibility" description="Online therapy lets you connect from home, saving travel time and making it easier to fit sessions into your schedule. This is especially helpful if you live in a remote area or have a busy routine." />
            <FeatureCard title="Privacy & Comfort" description="Many people feel more comfortable opening up from a familiar environment. Online sessions can reduce the fear of being judged and make it easier to talk honestly about personal issues." />
            <FeatureCard title="Qualified & Licensed Professionals" description="Reputable online counselors are trained, certified, and follow ethical guidelines—just like in-person therapists. Many platforms also show reviews and credentials, helping you choose someone trustworthy." />
          </div>

          {/* Free Demo Banner Image */}
          <div className="mt-24 md:mt-40 w-full max-w-[1400px] flex flex-col items-center">
            
            <div className="relative w-full rounded-[24px] overflow-hidden bg-[#131210]">
              <picture className="w-full">
                <source media="(min-width: 768px)" srcSet="/assets/freeDekstop.png" />
                <img src="/assets/freeMobile.png" alt="Free Demo Banner Background" className="w-full h-auto object-cover" />
              </picture>
              
              {/* Desktop Overlay Content */}
              <div className="hidden md:flex absolute inset-0 flex-col justify-center pl-12 lg:pl-[8%] w-[70%] lg:w-[60%] z-10">
                 <h3 className="font-georgia font-bold text-[28px] lg:text-[40px] xl:text-[46px] leading-[1.1] text-white tracking-[-0.02em]">
                   Thinking of the<br/>effectiveness<br/>of online consultation
                 </h3>
                 <div className="mt-6 flex flex-row items-center">
                    <button 
                      ref={cta2Ref} 
                      className="bg-[#E5E5E5] hover:bg-white text-black font-nunito font-bold text-[16px] lg:text-[18px] px-6 lg:px-8 py-2.5 lg:py-3 rounded-full transition-colors whitespace-nowrap"
                      onClick={openBookingModal}
                    >
                      Book a free demo
                    </button>
                    <div className="relative ml-2 flex items-center">
                      <img src="/assets/Group 54.svg" alt="Arrow" className="h-[30px] lg:h-[40px] w-auto brightness-0 invert object-contain" />
                    </div>
                 </div>
              </div>
              
              {/* Mobile Overlay Content */}
              <div className="md:hidden absolute inset-0 p-6 flex flex-col justify-center z-10 items-center bg-black/20">
                 <h3 className="font-georgia font-bold text-[22px] sm:text-[28px] leading-[1.2] text-white tracking-[-0.02em] text-center mb-6 drop-shadow-lg">
                   Thinking of the<br/>effectiveness<br/>of online consultation
                 </h3>
                 <div className="flex flex-row items-center gap-4">
                    <Button 
                      ref={cta2MobileRef}
                      variant="black" 
                      className="w-[180px] h-[50px] text-[15px] px-4 font-bold rounded-[15px] shadow-2xl border border-white/20"
                      onClick={openBookingModal}
                    >
                      Book a free demo
                    </Button>
                    <div className="flex items-center">
                       <img src="/assets/Group 54.svg" alt="Arrow" className="h-[30px] md:h-[40px] w-auto brightness-0 invert rotate-[-10deg]" />
                    </div>
                 </div>
              </div>
            </div>

          </div>


          {/* Stats Section */}
          <div ref={lastRef2} className="mt-20 md:mt-28 w-full max-w-[1000px] flex flex-col md:flex-row items-center justify-between gap-12 md:gap-6 px-10">
             <div className="flex flex-col items-center text-center">
               <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none">
                 <AnimatedCounter end={1500} suffix="+" />
               </span>
               <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Happy Patients</span>
             </div>
             <div className="flex flex-col items-center text-center">
               <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none">
                 <AnimatedCounter end={80} suffix="+" />
               </span>
               <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Licensed Therapists</span>
             </div>
             <div className="flex flex-col items-center text-center">
               <span className="font-georgia font-bold text-[56px] md:text-[72px] text-white leading-none">
                 <AnimatedCounter end={2000} suffix="+" />
               </span>
               <span className="font-nunito font-semibold text-[20px] md:text-[24px] text-white mt-1">Hours of Therapy</span>
             </div>
          </div>
          
          {/* Spacer to prevent content from being covered by next card's rounded top */}
          <div className="h-[400px] md:h-[600px] w-full" />
        </div>
      </section>

      {/* 
        CARD 3: FAQ & Testimonials (White Card) 
        Slides up over the Black Card. Uses calculated stickyTop.
      */}
      <section 
        ref={card3Ref}
        className="sticky z-30 w-full flex justify-center pt-[200px] -mt-10 md:-mt-20 pointer-events-none"
        style={{ top: `${stickyTop3}px` }}
      >
        <div className="w-[90vw] max-w-[1400px] bg-[#FEFEFC] rounded-t-[40px] rounded-b-[40px] pt-24 md:pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.3)] pointer-events-auto min-h-screen">
          
          {/* FAQ Header */}
          <div className="text-center mb-16 max-w-[900px]">
            <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black">
              Your Questions, Answered <br /> <span className="text-[#0F9393]">At Unheard.</span>
            </h2>
          </div>

          {/* FAQ Content Block */}
          <div className="flex flex-col lg:flex-row w-full max-w-[1200px] gap-12 lg:gap-20 items-stretch">
            {/* Left side Image */}
            <div className="w-full lg:w-1/2 flex justify-center lg:justify-end shrink-0">
              <div className="relative w-full max-w-[450px] aspect-[4/5] rounded-[30px] overflow-hidden shadow-lg">
                <img src="/assets/section_2_2.png" alt="FAQ Preview" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Right side Accordion */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center">
              <FAQAccordion data={faqData} />
            </div>
          </div>

          {/* Contact Button */}
          <div className="mt-20">
            <button 
              ref={cta3Ref}
              className="bg-black hover:bg-gray-800 text-white font-nunito font-bold text-[18px] px-10 py-4 rounded-full transition-colors whitespace-nowrap"
            >
              Contact Us
            </button>
          </div>

          {/* Testimonials Section */}
          <div className="mt-32 w-full max-w-[900px] flex flex-col items-center text-center">
            <h2 className="font-georgia text-[36px] md:text-[48px] font-bold leading-tight text-black mb-8">
              Voices Finally Heard, <br /> <span className="text-[#0F9393]">Lives Transformed</span>
            </h2>
            
            {/* Carousel implementation */}
            <div ref={lastRef3} className="w-full">
              <TestimonialCarousel testimonials={testimonialData} />
            </div>
          </div>

          {/* Spacer to prevent content from being covered by next component */}
          <div className="h-[100px] md:h-[150px] w-full" />
        </div>
      </section>

      {/* Unheard Truth Footer Banner with Blog Gallery */}
      <section className="relative z-40 w-[90vw] mx-auto bg-black rounded-t-[60px] md:rounded-t-[80px] pt-32 pb-40 flex flex-col items-center shadow-[0_-20px_50px_rgba(0,0,0,0.4)] border-t border-white/5 overflow-hidden">
         {/* Background Blobs (Slightly more visible on black) */}
         <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#0F9393]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
         <div className="absolute bottom-0 left-0 w-[30vw] h-[30vw] bg-[#0F9393]/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>

         <div className="relative z-10 w-full max-w-[1400px] flex flex-col items-center px-6">
            <div className="text-center mb-20">
               <h2 className="font-georgia text-[40px] md:text-[64px] font-bold leading-tight text-white flex flex-col items-center text-center">
                  <span className="text-[#0F9393]">Unheard Truth:</span>
                  <span>Discover, Reflect, and Grow</span>
               </h2>
            </div>

            {/* Blog Grid */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
               {blogData.map((blog, idx) => (
                  <BlogCard key={idx} blog={blog} />
               ))}
            </div>

            {/* View All Button */}
            <div className="mt-20">
               <button className="group flex items-center gap-4 bg-white p-1.5 pl-8 pr-2 rounded-full border-2 border-white hover:bg-gray-100 transition-all shadow-xl">
                  <span className="text-black font-nunito font-black text-[18px]">View all</span>
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </div>
               </button>
            </div>
         </div>
      </section>

    </div>
  );
};

// ----------------------------------------------------------------------
// SUBCOMPONENTS
// ----------------------------------------------------------------------
const FAQAccordion = ({ data }: { data: any[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <div className="w-full flex flex-col gap-6">
      {data.map((faq, index) => (
        <FAQItem 
          key={index} 
          faq={faq} 
          isOpen={activeIndex === index} 
          onClick={() => setActiveIndex(activeIndex === index ? null : index)} 
        />
      ))}
    </div>
  );
};

const FAQItem = ({ faq, isOpen, onClick }: { faq: any, isOpen: boolean, onClick: () => void }) => {
  return (
    <div 
      className={`w-full bg-white rounded-[16px] border border-gray-100 p-6 md:p-8 cursor-pointer transition-all duration-300 ${isOpen ? 'shadow-[0_10px_30px_rgba(0,0,0,0.08)]' : 'shadow-[0_5px_15px_rgba(0,0,0,0.04)] hover:shadow-md'}`}
      onClick={onClick}
    >
      <h4 className="font-nunito font-bold text-[18px] md:text-[20px] text-black pr-8 relative">
        {faq.question}
        <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[24px] font-light text-gray-400">
          {isOpen ? '−' : '+'}
        </span>
      </h4>
      {isOpen && (
        <p className="font-nunito text-[14px] md:text-[16px] text-[#666666] mt-4 leading-relaxed pr-6 text-left">
          {faq.answer}
        </p>
      )}
    </div>
  );
};

const TestimonialCarousel = ({ testimonials }: { testimonials: any[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Dots */}
      <div className="flex flex-row gap-2 mb-10">
        {testimonials.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setActiveIndex(i)}
            className={`transition-all duration-500 rounded-full ${
              i === activeIndex 
                ? 'w-8 h-2 bg-black' 
                : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>

      <div className="min-h-[100px] flex items-center justify-center">
        <p className="font-nunito text-[16px] md:text-[20px] font-bold text-black/80 italic leading-relaxed max-w-[800px] px-4">
          &quot;{testimonials[activeIndex].text}&quot;
        </p>
      </div>
    </div>
  );
};

const BlogCard = ({ blog }: { blog: any }) => {
  return (
    <div className="group relative bg-[#1A1A1A]/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 flex flex-col gap-5 shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 max-w-[420px] mx-auto w-full">
      
      {/* Image Container with Arrow */}
      <div className="relative aspect-[16/10] rounded-[24px] overflow-hidden">
        <Image 
          src={blog.image} 
          alt={blog.title} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        {/* Floating Arrow Button */}
        <div className="absolute bottom-4 right-4 w-12 h-12 bg-[#0F9393] rounded-full flex items-center justify-center text-white shadow-xl translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 px-1">
        <h3 className="font-nunito font-bold text-[22px] md:text-[24px] text-white leading-tight tracking-tight">
          {blog.title}
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {blog.keywords.map((kw: string, i: number) => (
            <span key={i} className="bg-white text-black text-[10px] px-4 py-1.5 rounded-full font-bold uppercase tracking-widest">
              {kw}
            </span>
          ))}
        </div>

        <div className="w-full h-[1px] bg-white/10 my-1"></div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[13px] font-bold text-white/90 font-nunito">{blog.author}</span>
            <span className="text-[12px] font-bold text-white/50 font-nunito">{blog.readTime}</span>
          </div>
          <span className="text-[12px] font-bold text-white/50 font-nunito">{blog.date}</span>
        </div>
      </div>
    </div>
  );
};
