
'use client';

import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import Button from './ui/Button';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if user has already accepted or dismissed
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) return;

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    }
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] bg-[#171612] border border-white/10 rounded-[24px] p-6 shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="bg-[#0F9393]/20 p-3 rounded-2xl">
            <Download className="text-[#0F9393]" size={24} />
          </div>
          <button onClick={handleDismiss} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <div>
          <h3 className="text-white font-bold text-[18px]">Install unHeard App</h3>
          <p className="text-gray-400 text-[14px] mt-1">Get instant access to your dashboard and real-time session updates.</p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button onClick={handleInstall} variant="black" className="flex-1 bg-white text-black hover:bg-gray-100 h-[48px] rounded-xl font-bold">
            Install Now
          </Button>
          <button onClick={handleDismiss} className="flex-1 text-gray-500 font-bold hover:text-white transition-colors text-[14px]">
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}
