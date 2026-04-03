'use client';

import React, { useState, useEffect } from 'react';

interface Testimonial {
  text: string;
  author: string;
}

export const TestimonialCarousel = ({ testimonials }: { testimonials: Testimonial[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length || 0);
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
          &quot;{testimonials[activeIndex]?.text}&quot;
        </p>
      </div>
    </div>
  );
};
