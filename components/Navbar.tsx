'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Button from './ui/Button';
import { useBooking } from './BookingContext';

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Services', href: '/services' },
  { name: 'Therapist', href: '/therapists' },
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout;
    const checkMobile = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 150);
    };

    setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      clearTimeout(resizeTimer);
    };
  }, []);

  useEffect(() => {
    setMounted(true);
    // If it's an admin page, we don't need scroll listeners
    if (isAdminPage) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const scrolled = scrollY > 50;
          setIsScrolled(scrolled);
          setIsDark(!scrolled);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run immediately on path change to sync state
    handleScroll();

    // Also run with a small delay to ensure DOM is settled after navigation
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, [pathname]); // Consolidated to only use pathname

  // Prevent hydration mismatch: only render on client
  if (!mounted || isAdminPage) {
    return null;
  }

  return (
    <nav 
      className={cn(
        "fixed top-[45px] md:top-[55px] left-1/2 -translate-x-1/2 z-[100] w-[97vw] max-w-[2440px] transition-all duration-300",
        !isDark && "top-[20px]"
      )}
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', willChange: 'transform, top' }}
    >
      {/* Container with All Elements (Logo, Links, Button) */}
      <div
        className={cn(
          "relative h-[68px] md:h-[75px] px-4 md:px-8 lg:px-12 flex items-center justify-between transition-all duration-500 rounded-[20px] md:rounded-[24px] overflow-hidden shadow-2xl group/nav",
          (!isScrolled || isDark || isMobile)
            ? "bg-[rgba(39,37,37,0.1)] border border-white/10 backdrop-blur-[8px]"
            : "bg-white/90 border border-black/5 backdrop-blur-[8px]"
        )}
      >
        {/* Sub-blob background for extra glow on dark */}
        {(!isScrolled || isDark) && (
          <div className="absolute top-[-50%] left-[-10%] w-[40%] h-[200%] bg-[#0F9393]/5 rounded-full blur-[40px] pointer-events-none group-hover/nav:bg-[#0F9393]/10 transition-all duration-1000"></div>
        )}

        {/* LEFT: Logo */}
        <Link href="/" className="flex-shrink-0 z-10 hover:opacity-80 transition-opacity">
          <img
            src="/assets/logo unherd white.svg"
            alt="unHeard Logo"
            className={cn("h-[30px] md:h-[35px] lg:h-[40px] w-auto transition-all", (!isDark && isScrolled && !isMobile) && "brightness-0")}
          />
        </Link>

        {/* CENTER: Navigation Links (Visible on tablets and up) */}
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-8 xl:gap-[50px] z-10 bg-black/5 dark:bg-white/5 py-2 px-6 rounded-full transition-all">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-[14px] lg:text-[16px] xl:text-[20px] font-bold font-nunito whitespace-nowrap transition-all hover:scale-105",
                isDark || !isScrolled ? "text-white/80 hover:text-white" : "text-black/70 hover:text-[#0F9393]"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* RIGHT: Button and Hamburger (Mobile only toggle) */}
        <div className="flex items-center gap-3 md:gap-4 lg:gap-6 z-10">
          <Button
            variant={isDark || !isScrolled || isMobile ? "gray" : "black"}
            onClick={openBookingModal}
            className="w-[100px] md:w-[130px] lg:w-[160px] h-[40px] md:h-[48px] lg:h-[56px] text-xs md:text-base font-black shadow-lg rounded-[15px] md:rounded-[18px] transition-all hover:scale-105 active:scale-95"
          >
            Book Now
          </Button>

          {/* Hamburger Only on Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "md:hidden p-1.5 rounded-xl transition-all border",
              (isDark || !isScrolled || isMobile)
                ? "text-white border-white/10 hover:bg-white/10"
                : "text-black border-black/5 hover:bg-black/5"
            )}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 200,
              opacity: { duration: 0.2 }
            }}
            className="md:hidden absolute top-[85px] left-0 right-0 bg-[#1A1A1A]/95 border border-white/10 rounded-[32px] p-8 shadow-2xl backdrop-blur-xl z-50 overflow-hidden will-change-transform"
          >
            {/* Decorative Background for drawer */}
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-[#0F9393]/20 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-[20px] md:text-[24px] font-black text-white/90 font-nunito hover:text-[#0F9393] transition-all py-3 flex items-center justify-between border-b border-white/5 last:border-0"
                >
                  {link.name}
                  <span className="text-[#0F9393] opacity-0 group-hover:opacity-100">&rarr;</span>
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
