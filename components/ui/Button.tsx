'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'white' | 'black' | 'gray';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gray', children, className, ...props }, ref) => {
    const variants = {
      white: 'bg-white text-black hover:bg-white/90',
      black: 'bg-black text-white hover:bg-black/90',
      gray: 'bg-[#D9D9D9] text-black hover:bg-white',
    };

    return (
      <button 
        ref={ref}
        className={cn(
          "w-[140px] h-[48px] rounded-[22px]",
          "text-[18px] font-bold font-nunito tracking-[-0.02em]",
          "transition-all duration-200 flex items-center justify-center",
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
