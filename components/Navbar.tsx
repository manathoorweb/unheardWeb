'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Button from './ui/Button';
import { useBooking } from './BookingContext';

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
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  // Safe check for admin pages
  const isAdminPage = pathname?.startsWith('/admin') || pathname?.startsWith('/super-admin') || pathname === '/login';
  
  const { openBookingModal } = useBooking();
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If it's an admin page, we don't need scroll listeners
    if (isAdminPage) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > 50;
      setIsScrolled(scrolled);

      if (!isLandingPage) {
        setIsDark(false); 
        setIsScrolled(true); 
        return;
      }

      setIsDark(!scrolled); 
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLandingPage, isAdminPage]);

  // Prevent hydration mismatch: only render on client
  if (!mounted || isAdminPage) {
    return null;
  }

  return (
    <nav className={cn(
      "fixed top-[55px] left-1/2 -translate-x-1/2 z-50 w-[95vw] xl:w-[90vw] max-w-[1440px] transition-all duration-300",
      !isDark && "top-[20px]" // Subtle shift when on light theme
    )}>
      {/* Desktop Layout */}
      <div className="hidden xl:flex items-center w-full">
        {/* Logo Outside */}
        <Link href="/" className="flex-shrink-0 mr-4 xl:mr-8">
          <img 
            src="/assets/logo unherd white.svg" 
            alt="unHeard Logo"
            className={cn("h-[35px] xl:h-[40px] w-auto transition-all", !isDark && "brightness-0")}
          />
        </Link>

        {/* Glass Container with Links */}
        <div 
          className={cn(
            "h-[63px] px-8 xl:px-16 flex items-center justify-center flex-grow mx-2 xl:mx-4 transition-all duration-300",
            !isScrolled || isDark 
              ? "bg-[rgba(39,37,37,0.05)] border border-[rgba(255,255,255,0.08)] shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] backdrop-blur-[8px]" 
              : "bg-white/80 border border-black/10 shadow-lg backdrop-blur-[8px]",
            "rounded-[15px]",
            "max-w-[850px]"
          )}
        >
          <div className="flex items-center gap-6 lg:gap-10 xl:gap-[53px]">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={cn(
                  "text-[16px] xl:text-[20px] font-medium font-nunito whitespace-nowrap transition-colors",
                  isDark || !isScrolled ? "text-white hover:text-white/70" : "text-black hover:text-[#0F9393]"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Button Outside */}
        <div className="flex-shrink-0 ml-4 xl:ml-8">
          <Button 
            variant={isDark || !isScrolled ? "gray" : "black"} 
            onClick={openBookingModal} 
            className="w-[140px] xl:w-[161px] h-[50px] xl:h-[56px] text-[16px] xl:text-[20px]"
          >
            Book Now
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Layout */}
      <div className="xl:hidden flex items-center justify-center w-full">
        <div 
          className={cn(
            "w-full h-[63px] px-4 flex items-center justify-between transition-all duration-300",
            !isScrolled || isDark 
              ? "bg-[rgba(39,37,37,0.05)] border border-[rgba(255,255,255,0.08)] shadow-[0px_0px_7.9px_rgba(0,0,0,0.25)] backdrop-blur-[8px]" 
              : "bg-white/90 border border-black/10 shadow-lg backdrop-blur-[8px]",
            "rounded-[15px]"
          )}
        >
          <Link href="/">
            <img 
              src="/assets/logo unherd white.svg" 
              alt="unHeard Logo" 
              className={cn("h-[30px] w-auto transition-all", (!isDark && isScrolled) && "brightness-0")}
            />
          </Link>

          <div className="flex items-center gap-4">
            <Button variant={isDark || !isScrolled ? "gray" : "black"} className="w-[120px] h-[40px] text-sm rounded-[15px]" onClick={openBookingModal}>
              Book Now
            </Button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className={cn("p-1 rounded-md transition-colors", (isDark || !isScrolled) ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5")}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-[75px] left-0 right-0 bg-[#1A1A1A]/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl z-50 mx-4"
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
