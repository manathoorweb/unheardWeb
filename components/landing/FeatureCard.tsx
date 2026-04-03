'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
}

export const FeatureCard = ({ title, description }: FeatureCardProps) => {
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
      <div className="absolute inset-0 z-0 flex flex-col justify-end pointer-events-none">
        <div className="w-full h-[96px] bg-[#0F1615] rounded-b-[15px] relative flex flex-col justify-center px-4">
          <div className="flex flex-row items-center justify-between w-full mt-2 pr-2">
             <div className="flex -space-x-3 ml-2 opacity-0">
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
               <div className="w-[29px] h-[29px]"></div>
             </div>
             
             <div className="font-georgia font-bold text-[18px] md:text-[20px] leading-[23px] tracking-[-0.02em] text-right bg-[linear-gradient(90deg,#A0F5F5_0%,#0F9393_100%)] bg-clip-text text-transparent opacity-50">
               {formatTitle(title)}
             </div>
          </div>
        </div>
      </div>

      {/* LAYER 1: The Glassmorphism Base (Rectangle 3) */}
      <div className="absolute inset-0 z-10 bg-[rgba(28,27,20,0.23)] backdrop-blur-[1px] border border-[rgba(0,0,0,0.12)] rounded-[15px] shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] pointer-events-none transition-all duration-300 group-hover:bg-[rgba(28,27,20,0.3)]"></div>

      {/* LAYER 2: Foreground Text & Crisp Elements */}
      <div className="relative z-20 pt-[30px] flex flex-col h-full pointer-events-auto">
        <div className="px-6 flex flex-col items-center text-center flex-grow">
          <h3 className="w-full font-georgia font-bold text-[28px] leading-[32px] tracking-[-0.02em] text-white mb-10 text-left">
            {formatTitle(title)}
          </h3>
          <p className="w-full font-nunito font-bold text-[16px] leading-[22px] tracking-[-0.02em] bg-[linear-gradient(90deg,#FFFFFF_0%,#D9FFF4_81.74%)] bg-clip-text text-transparent text-left opacity-90">
            {description}
          </p>
        </div>

        <div className="w-full h-[96px] relative flex flex-col justify-center px-4 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[326.51px] border-t border-white/20"></div>
          <div className="flex flex-row items-center justify-between w-full mt-2 pr-2">
             <div className="flex -space-x-3 ml-2">
               <div className="w-[29px] h-[29px] rounded-full bg-[#D9D9D9]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#BEB8B8]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#B0A5A5]"></div>
               <div className="w-[29px] h-[29px] rounded-full bg-[#D9D9D9]"></div>
             </div>
             <div className="font-georgia font-bold text-[18px] md:text-[20px] leading-[23px] tracking-[-0.02em] text-right opacity-0">
               {formatTitle(title)}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
