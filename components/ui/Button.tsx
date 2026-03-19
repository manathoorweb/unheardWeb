'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'white' | 'black' | 'gray';
  children: React.ReactNode;
}

const Button = ({ variant = 'gray', children, className, ...props }: ButtonProps) => {
  const variants = {
    white: 'bg-white text-black hover:bg-white/90',
    black: 'bg-black text-white hover:bg-black/90',
    gray: 'bg-[#D9D9D9] text-black hover:bg-white',
  };

  return (
    <button 
      className={cn(
        "w-[161px] h-[56px] rounded-[22px]",
        "text-[20px] font-bold font-nunito tracking-[-0.02em]",
        "transition-all duration-200 flex items-center justify-center",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
