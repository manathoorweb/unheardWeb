'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';
import Image from 'next/image';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tid = searchParams.get('tid');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl text-center border border-gray-100"
      >
        <div className="w-24 h-24 bg-green-50 text-[#0F9393] rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 size={48} />
        </div>
        
        <h1 className="font-georgia text-[36px] font-bold text-gray-900 leading-tight mb-4">Payment Successful!</h1>
        <p className="font-nunito text-gray-500 mb-8 leading-relaxed">
          Thank you for your payment. Your session request is now being reviewed by our clinical experts. You will receive a confirmation on WhatsApp within 30 minutes.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-[14px] text-gray-400 font-mono">
          TXN ID: {tid || 'N/A'}
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={() => router.push('/')} 
            className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-95"
          >
            <Home size={18} /> Back to Home
          </button>
        </div>

        <div className="mt-12 flex justify-center">
          <Image src="/assets/logo unherd white.svg" alt="unHeard" width={80} height={24} className="invert brightness-0 opacity-20" />
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
