'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';

function ResumePaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token');
  const payloadParam = searchParams.get('p');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (!token && !payloadParam) {
      setError('Invalid or missing secure link.');
      setLoading(false);
      return;
    }

    // Verify token and fetch data
    async function verify() {
      try {
        const query = payloadParam ? `p=${encodeURIComponent(payloadParam)}` : `token=${token}`;
        const res = await fetch(`/api/payment/verify-token?${query}`);
        const data = await res.json();
        if (data.success) {
          setPaymentData(data.payload);
        } else {
          setError(data.error || 'Link expired or invalid.');
        }
      } catch (err) {
        setError('Connection error.');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [token, payloadParam]);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Re-initialize PhonePe
      const res = await fetch('/api/payment/phonepe/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionnaireId: paymentData?.qid,
          phone: paymentData?.phone,
          name: paymentData?.name
        })
      });
      const result = await res.json();
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        setError(result.error || 'Failed to initialize payment.');
      }
    } catch (err) {
      setError('Failed to contact payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC]">
        <Loader2 className="animate-spin text-[#0F9393]" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] p-8">
        <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="font-georgia text-2xl font-bold mb-4">Secure Link Problem</h1>
          <p className="text-gray-500 mb-8">{error}</p>
          <button onClick={() => router.push('/')} className="w-full bg-black text-white py-4 rounded-2xl font-bold">Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] p-4">
      <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl relative overflow-hidden border border-gray-100">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#0F9393]" />
        
        <div className="mb-8">
          <Image src="/assets/logo unherd white.svg" alt="unHeard" width={100} height={30} className="invert brightness-0 mb-8" />
          <h1 className="font-georgia text-[32px] font-bold text-gray-900 leading-tight mb-2">Resume Payment</h1>
          <p className="font-nunito text-gray-500">Securely complete your session booking for <strong>unHeard</strong>.</p>
        </div>

        <div className="bg-gray-50 rounded-[24px] p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-bold text-[12px] uppercase tracking-widest">Amount to Pay</span>
            <span className="text-[#0F9393] font-georgia font-bold text-[24px]">₹{paymentData?.amount}/-</span>
          </div>
          <div className="border-t border-gray-200 pt-4 text-[14px] text-gray-600 flex flex-col gap-1">
            <p><strong>Service:</strong> Psychological Counseling</p>
            <p><strong>Patient:</strong> {paymentData?.name}</p>
          </div>
        </div>

        <button 
          onClick={handlePay}
          className="w-full bg-[#0F9393] text-white py-5 rounded-2xl font-bold text-[18px] flex items-center justify-center gap-3 shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all active:scale-95"
        >
          Secure Checkout <ArrowRight size={20} />
        </button>

        <p className="mt-8 text-center text-[12px] text-gray-400 font-nunito">
          Protected by industry-standard encryption.
        </p>
      </div>
    </div>
  );
}

export default function ResumePaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResumePaymentContent />
    </Suspense>
  );
}
