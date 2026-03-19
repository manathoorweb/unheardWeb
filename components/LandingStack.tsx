'use client';

import React from 'react';
import Image from 'next/image';
import Button from './ui/Button';
import { LucideIcon, Smartphone, ShieldCheck, UserCheck } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="bg-[#1C1B17] border border-white/5 rounded-[24px] p-8 flex flex-col gap-6 hover:bg-[#22211C] transition-colors duration-300">
    <div className="w-12 h-12 bg-white/5 rounded-[12px] flex items-center justify-center">
      <Icon className="text-white w-6 h-6" />
    </div>
    <div className="space-y-4">
      <h3 className="font-georgia text-[22px] font-bold text-white tracking-tight">
        {title}
      </h3>
      <p className="font-nunito text-[16px] leading-relaxed text-white/60">
        {description}
      </p>
    </div>
  </div>
);

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
  const card1Ref = React.useRef<HTMLElement>(null);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const [stickyTop, setStickyTop] = React.useState(0);

  React.useEffect(() => {
    const calculatePinOffset = () => {
      if (!card1Ref.current || !ctaRef.current) return;
      
      const cardRect = card1Ref.current.getBoundingClientRect();
      const ctaRect = ctaRef.current.getBoundingClientRect();
      
      // Distance from top of the sticky container to the center of the CTA button
      const ctaOffsetFromTop = (ctaRect.top + (ctaRect.height / 2)) - cardRect.top;
      
      // The user requested the CTA to pin at exactly 50vh (middle of screen)
      const targetViewportY = window.innerHeight * 0.5;
      
      // The sticky top needed to align the CTA to targetViewportY
      const calculatedTop = targetViewportY - ctaOffsetFromTop;
      
      setStickyTop(Math.min(calculatedTop, 0));
    };

    calculatePinOffset();
    
    // Recalculate if images/fonts shift layout
    const timeout1 = setTimeout(calculatePinOffset, 100);
    const timeout2 = setTimeout(calculatePinOffset, 500);

    window.addEventListener('resize', calculatePinOffset);
    return () => {
      window.removeEventListener('resize', calculatePinOffset);
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, []);

  return (
    <div className="relative w-full bg-[#111111] pb-[100vh]">
      {/* 
        CARD 1: Hero + White Card 
        Scrolls up and uses a dynamically calculated top offset.
      */}
      <section 
        ref={card1Ref}
        className="sticky z-10 w-full"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="w-full flex flex-col items-center">
          {/* Hero Section */}
          <div className="relative h-screen w-full flex items-center px-[5vw] lg:px-[10vw]">
            <div className="absolute inset-0 z-0">
              <Image src="/assets/landingimage.png" alt="Hero Background" fill className="object-cover opacity-60" priority />
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
                <Button variant="gray" className="w-[241px] h-[56px] text-[20px] px-6 whitespace-nowrap">Start Felling Better !</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[60px] w-auto mt-2" />
              </div>
            </div>
          </div>

          {/* White Card Section */}
          <div className="w-full px-4 flex justify-center pb-20 -mt-[150px] md:-mt-[200px] relative z-10">
            <div className="w-[95vw] max-w-[1840px] bg-[#FEFEFC] rounded-[40px] py-16 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-xl">
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
              <div ref={ctaRef} className="mt-20 flex flex-row items-center gap-6">
                <Button variant="black" className="w-[241px] h-[56px] text-[20px] px-6 whitespace-nowrap">Start Felling Better !</Button>
                <img src="/assets/Group 54.svg" alt="Try now!" className="h-[50px] w-auto mt-2 invert" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        CARD 2: Why Choose (Black Card) 
        Slides up over Card 1. Using sticky top-0 so it pins to the top of the viewport when it arrives.
      */}
      <section className="sticky top-0 z-20 w-full flex justify-center pt-[100px] pb-20 pointer-events-none">
        <div className="w-[95vw] max-w-[1840px] bg-[#171612] rounded-t-[100px] rounded-b-[40px] pt-32 pb-24 px-6 md:px-12 lg:px-24 flex flex-col items-center shadow-2xl pointer-events-auto">
          <div className="text-center mb-20 max-w-[900px]">
            <h2 className="font-georgia text-[32px] md:text-[52px] font-bold leading-tight text-white mb-6">Why Choose Unheard?  Because the  <span className="text-[#008080]">Silenced Voice Deserves</span></h2>
            <p className="font-georgia text-[24px] md:text-[45px] font-bold leading-tight text-white">
              to <br className="hidden md:block" /> Be Heard.!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-[1400px]">
            <FeatureCard icon={Smartphone} title="Convenience & Accessibility" description="Online therapy lets you connect from home..." />
            <FeatureCard icon={ShieldCheck} title="Privacy & Comfort" description="Many people feel more comfortable opening up..." />
            <FeatureCard icon={UserCheck} title="Qualified & Licensed Professionals" description="Reputable online counselors are trained..." />
          </div>
        </div>
      </section>
    </div>
  );
};
