
'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';
import Button from './ui/Button';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Detect iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(ios);

    // Detect if already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    if (ios) {
      // For iOS, we can show the prompt after a short delay since there's no event
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    } else {
      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);
      return () => window.removeEventListener('beforeinstallprompt', handler);
    }
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
       // On iOS, we just show instructions, so this button might not be needed 
       // or it can just close the prompt after they read it.
       return;
    }
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // We rely on the browser not firing beforeinstallprompt again once installed
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] bg-[#171612] border border-white/10 rounded-[32px] p-8 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F9393]/10 blur-[50px] -z-10" />
      
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="bg-[#0F9393]/20 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">
            <Download className="text-[#0F9393]" size={28} />
          </div>
          <button onClick={handleDismiss} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-white font-bold text-[22px] tracking-tight">Install unHeard App</h3>
          <p className="text-gray-400 text-[15px] mt-2 leading-relaxed font-medium">
            {isIOS 
              ? 'Get the full app experience on your iPhone with just two taps.' 
              : 'Add unHeard to your home screen for instant access to your clinical dashboard.'}
          </p>
        </div>

        {isIOS ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Share size={20} />
               </div>
               <p className="text-[14px] text-gray-300 font-bold">1. Tap the Share button in Safari</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <span className="font-bold text-[18px]">+</span>
               </div>
               <p className="text-[14px] text-gray-300 font-bold">2. Select "Add to Home Screen"</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleInstall} variant="black" className="w-full bg-white text-black hover:bg-gray-100 h-[56px] rounded-2xl font-bold text-[15px]">
              Install Now
            </Button>
          </div>
        )}
        
        {isIOS && (
           <Button onClick={handleDismiss} variant="black" className="w-full bg-[#0F9393] text-white hover:bg-[#0D7F7F] h-[56px] rounded-2xl font-bold text-[15px]">
              Got it
           </Button>
        )}
      </div>
    </div>
  );
}
