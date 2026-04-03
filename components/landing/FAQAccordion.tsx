'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQAccordionProps {
  data: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQAccordion = ({ data }: FAQAccordionProps) => {
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
      className={cn(
        "w-full bg-white rounded-[16px] border border-gray-100 p-6 md:p-8 cursor-pointer transition-all duration-300",
        isOpen ? 'shadow-[0_10px_30px_rgba(0,0,0,0.08)]' : 'shadow-[0_5px_15px_rgba(0,0,0,0.04)] hover:shadow-md'
      )}
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
