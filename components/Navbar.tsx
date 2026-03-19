'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Services', href: '/services' },
  { name: 'Therapist', href: '/therapist' },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-[55px] left-1/2 -translate-x-1/2 z-50 w-[90vw] max-w-[1440px]">
      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center w-full">
        {/* Logo Outside */}
        <Link href="/" className="flex-shrink-0 mr-8"> {/* Added margin right to control gap */}
          <img 
            src="/assets/logo unherd white.svg" 
            alt="unHeard Logo" 
            className="h-[40px] w-auto"
          />
        </Link>

        {/* Glass Container with Links */}
        <div 
          className={cn(
            "h-[63px] px-16 flex items-center justify-center flex-grow mx-4", // Widened padding and added flex-grow
            "bg-[rgba(39,37,37,0.05)] border border-[rgba(255,255,255,0.08)]",
            "shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] rounded-[15px]",
            "backdrop-blur-[8px]",
            "max-w-[850px]" // Constraint for the glass box
          )}
        >
          <div className="flex items-center gap-[53px]">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className="text-[20px] font-medium text-white font-nunito whitespace-nowrap hover:text-white/70 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Button Outside */}
        <div className="flex-shrink-0 ml-8">
          <Button variant="gray">
            Book Now
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex items-center justify-center w-full">
        <div 
          className={cn(
            "w-full h-[63px] px-2 flex items-center justify-between",
            "bg-[rgba(39,37,37,0.05)] border border-[rgba(255,255,255,0.08)]",
            "shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] rounded-[15px]",
            "backdrop-blur-[8px]"
          )}
        >
          <Link href="/">
            <img 
              src="/assets/logo unherd white.svg" 
              alt="unHeard Logo" 
              className="h-[30px] w-auto"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="gray" className="w-[120px] h-[40px] text-sm rounded-[15px]">
              Book Now
            </Button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-1 hover:bg-white/10 rounded-md transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-[75px] left-4 right-4 bg-[#1A1A1A] border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-bold text-white font-nunito hover:text-white/70 transition-colors py-2 border-b border-white/5 last:border-0"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
