'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { requestSession } from '@/lib/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Calendar, Clock, Heart, ShieldCheck, AlertCircle, Phone, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import AnimatedModal from './ui/AnimatedModal';
import { reportClientError } from '@/lib/actions';
import { initiatePhonePeTransaction } from '@/components/PhonePeProvider';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: {
    therapist_id?: string;
    type?: string;
    age?: string;
    service?: string;
  };
}

interface Therapist {
  user_id: string;
  full_name: string;
  qualification: string;
  avatar_url: string;
  bio?: string;
  specialties?: string[];
  pricing?: Record<string, number>;
}

const caringMessages = [
  'Securing your confidential space...',
  'Matching you with your clinical expert...',
  'Finalizing clinical assessments...',
  'Preparing your safe healing zone...'
];

type ModalStep = 
  | 'phone'
  | 'informed_consent'
  | 'personal_info'
  | 'minor_consent'
  | 'privacy_agreement'
  | 'care_preferences'
  | 'scheduling'
  | 'clinical_checkin'
  | 'plan_selection';

export default function BookingModal({ isOpen, onClose, initialConfig }: BookingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [direction, setDirection] = useState(1);
  const [supabase] = useState(() => createClient());
  const [therapists, setTherapists] = useState<Therapist[]>([]);

  // User state flags
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isEnteringOtp, setIsEnteringOtp] = useState(false);
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);
  const [previewLegal, setPreviewLegal] = useState<null | 'consent' | 'telehealth' | 'privacy' | 'terms'>(null);

  const [isCaringInProgress, setIsCaringInProgress] = useState(false);
  const [caringMessageIndex, setCaringMessageIndex] = useState(0);

  useEffect(() => {
    if (!isCaringInProgress) return;
    const interval = setInterval(() => {
      setCaringMessageIndex((prev) => (prev + 1) % caringMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isCaringInProgress]);

  // Clean initial form state - ZERO data from local storage
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    occupation: '',
    relationshipStatus: '',
    preferredFormat: 'Video call',
    additionalInfo: '',
    therapyBefore: '',
    diagnoses: '',
    medication: '',
    underCare: '',
    wellbeing: 0, // Scale 1 to 5
    stressLevel: 0, // Scale 1 to 5
    harmingThoughts: '',
    trustedPerson: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    acceptTerms: false,
    digitalSignature: '',
    informedConsentAgreed: false,
    minorParentName: '',
    minorConsent: false,
    confidentialityAgreed: false,
    email: '',
    phone: '',
    otp: '',
    language: 'English',
    type: 'Individual',
    age: '26-35',
    service: '',
    therapist_id: '',
    is_trial: true,
    plan_type: 'Trial Session',
    scheduled_date: '',
    scheduled_time: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [isTrialAvailable, setIsTrialAvailable] = useState(true);

  const [timeLeft, setTimeLeft] = useState(780); // 13 minutes
  const [previewTherapist, setPreviewTherapist] = useState<Therapist | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');

  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'success' | 'error', title: string, message: string}>({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Clear any old legacy localStorage items on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      localStorage.removeItem('unheard_booking_basic');
    }
  }, [isOpen]);

  const closeAndReset = useCallback(() => {
    onClose();
    setTimeout(() => {
      setCurrentStepIndex(0);
      setDirection(1);
      setTimeLeft(780);
      setIsEnteringOtp(false);
      setIsReturningUser(false);
      setWelcomeBanner(null);
      setPreviewLegal(null);
      setFormData(prev => ({
        ...prev,
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        occupation: '',
        relationshipStatus: '',
        email: '',
        phone: '',
        otp: '',
        wellbeing: 0,
        stressLevel: 0,
        harmingThoughts: '',
        trustedPerson: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        acceptTerms: false,
        digitalSignature: '',
        informedConsentAgreed: false,
        minorParentName: '',
        minorConsent: false,
        confidentialityAgreed: false
      }));
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setDeviceId(result.visitorId);
    };
    setFp();
  }, []);

  useEffect(() => {
    async function fetchTherapists() {
      const { data } = await supabase.from('therapist_profiles').select('*');
      if (data) setTherapists(data);
    }
    fetchTherapists();
  }, [supabase]);

  // Initial config setup (like therapist profile or service)
  useEffect(() => {
    if (isOpen && initialConfig) {
      setFormData(prev => ({
        ...prev,
        therapist_id: initialConfig.therapist_id || prev.therapist_id,
        type: initialConfig.type || prev.type,
        age: initialConfig.age || prev.age,
        service: initialConfig.service || prev.service,
      }));
    }
  }, [isOpen, initialConfig]);

  // Session Timeout Timer Logic
  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(780);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev > 0 ? prev - 1 : 0);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeLeft === 0) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Session Expired',
        message: 'Your booking session has expired. Please start over to secure your slot.'
      });
      closeAndReset();
    }
  }, [timeLeft, isOpen, closeAndReset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
      setFormData(prev => ({
        ...prev,
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: '12:00'
      }));
    }
  }, []);

  // Age calculation helper
  const calculateAge = (dobString: string) => {
    if (!dobString) return 100;
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = formData.dob !== '' && calculateAge(formData.dob) < 18;

  // Active steps calculation based on user registration status & age
  const getActiveSteps = (): ModalStep[] => {
    if (isReturningUser) {
      return ['phone', 'personal_info', 'care_preferences', 'scheduling', 'clinical_checkin', 'plan_selection'];
    }

    // New user steps
    if (isMinor) {
      return ['phone', 'informed_consent', 'personal_info', 'minor_consent', 'privacy_agreement', 'care_preferences', 'scheduling', 'clinical_checkin', 'plan_selection'];
    }

    return ['phone', 'informed_consent', 'personal_info', 'privacy_agreement', 'care_preferences', 'scheduling', 'clinical_checkin', 'plan_selection'];
  };

  const activeSteps = getActiveSteps();
  const currentStep = activeSteps[currentStepIndex] || 'phone';

  // Handler for Phone Verification (checks Database)
  const handleCheckPhone = async () => {
    const cleanDigits = formData.phone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Invalid Number',
        message: 'Please enter a valid 10-digit WhatsApp phone number.'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/booking/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone })
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to check phone number.');
      }

      if (data.registered) {
        // RETURNING USER: Load details directly from Database
        setIsReturningUser(true);
        setIsEnteringOtp(false);

        const u = data.data || {};
        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        setFormData(prev => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          dob: u.dob || prev.dob,
          gender: u.gender || prev.gender,
          occupation: u.occupation || prev.occupation,
          relationshipStatus: u.relationshipStatus || prev.relationshipStatus,
          // Therapy Type & Preferred Format are NOT loaded from DB (fresh selection for each booking)
          preferredFormat: prev.preferredFormat,
          type: prev.type,
          language: u.language || prev.language,
          age: u.age || prev.age,
          service: u.service || prev.service,
          emergencyContactName: u.emergencyContactName || prev.emergencyContactName,
          emergencyContactPhone: u.emergencyContactPhone || prev.emergencyContactPhone,
          emergencyContactRelation: u.emergencyContactRelation || prev.emergencyContactRelation,
          trustedPerson: u.trustedPerson || prev.trustedPerson,
          digitalSignature: u.digitalSignature || fullName || prev.digitalSignature,
          acceptTerms: true,
          informedConsentAgreed: true,
          confidentialityAgreed: true,
          // Ratings asked fresh
          wellbeing: 0,
          stressLevel: 0
        }));

        setWelcomeBanner(`Welcome back${u.firstName ? `, ${u.firstName}` : ''}! We've pre-filled your details from your profile.`);

        try {
          const trialCheck = await fetch('/api/booking/check-trial', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: formData.phone, deviceId })
          });
          const trialData = await trialCheck.json();
          setIsTrialAvailable(trialData.available);
          if (!trialData.available) {
            setFormData(prev => ({ ...prev, is_trial: false }));
          }
        } catch (tErr) {
          console.warn('Trial check error:', tErr);
        }

        setDirection(1);
        setCurrentStepIndex(1); // Advances to personal_info (pre-filled)
      } else {
        // NEW USER: Show OTP entry
        setIsReturningUser(false);
        setIsEnteringOtp(true);
      }
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - handleCheckPhone');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Verification Failed',
        message: err.message || 'Could not verify phone number. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const dispatchOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, type: 'booking' })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Code Sent',
        message: `A new 6-digit verification code has been dispatched to ${formData.phone} via WhatsApp.`
      });
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - dispatchOTP');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Verification Failed',
        message: err.message || 'An error occurred while dispatching the security code.'
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, otp: formData.otp })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      if (data.session) {
        await supabase.auth.setSession(data.session);
      }
      
      const trialCheck = await fetch('/api/booking/check-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone, deviceId, userId: data.session?.user?.id })
      });
      const trialData = await trialCheck.json();
      setIsTrialAvailable(trialData.available);
      if (!trialData.available) {
        setFormData(prev => ({ ...prev, is_trial: false }));
      }

      setIsEnteringOtp(false);
      setDirection(1);
      setCurrentStepIndex(1); // First time user goes to Step 2: Informed Consent
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - verifyOTP');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Authentication Error',
        message: err.message || 'Incorrect verification code. Please check WhatsApp and try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Validation rules per step
  const isStepValid = (stepName: ModalStep) => {
    if (stepName === 'phone') {
      if (isEnteringOtp) return formData.otp.trim().length === 6;
      return formData.phone.trim().replace(/\D/g, '').length >= 10;
    }
    if (stepName === 'informed_consent') {
      return formData.informedConsentAgreed && formData.digitalSignature.trim() !== '';
    }
    if (stepName === 'personal_info') {
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
        formData.dob !== ''
      );
    }
    if (stepName === 'minor_consent') {
      return formData.minorParentName.trim() !== '' && formData.minorConsent;
    }
    if (stepName === 'privacy_agreement') {
      return formData.confidentialityAgreed;
    }
    if (stepName === 'care_preferences') {
      return true;
    }
    if (stepName === 'scheduling') {
      return (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) || (Boolean(formData.scheduled_date) && Boolean(formData.scheduled_time));
    }
    if (stepName === 'clinical_checkin') {
      return (
        formData.wellbeing >= 1 && formData.wellbeing <= 5 &&
        formData.stressLevel >= 1 && formData.stressLevel <= 5 &&
        formData.harmingThoughts !== '' &&
        (formData.harmingThoughts === 'No' || (
          formData.trustedPerson !== '' &&
          formData.emergencyContactName.trim() !== '' &&
          formData.emergencyContactPhone.trim() !== '' &&
          formData.emergencyContactRelation !== ''
        ))
      );
    }
    if (stepName === 'plan_selection') {
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    if (currentStep === 'phone') {
      if (isEnteringOtp) {
        return verifyOTP();
      }
      return handleCheckPhone();
    }
    
    setDirection(1);
    setCurrentStepIndex((prev) => Math.min(prev + 1, activeSteps.length - 1));
  };

  const handlePrev = () => {
    if (currentStep === 'phone' && isEnteringOtp) {
      setIsEnteringOtp(false);
      return;
    }
    setDirection(-1);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleBookNow = async () => {
    setLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      let rawDateStr = new Date().toISOString();
      if (formData.scheduled_date && formData.scheduled_time) {
         const combined = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
         rawDateStr = new Date(combined).toISOString();
      }

      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
         rawDateStr = new Date(Date.now() + 5 * 60 * 1000).toISOString();
         console.warn("🚧 DEV MODE: Overriding booking time to exactly 5 minutes from now! Payload Start Time:", rawDateStr);
      }

      // Payload saved directly to Supabase DB - ZERO LocalStorage
      const payload: any = {
        start_time: rawDateStr,
        is_trial: formData.is_trial,
        phone: formData.phone,
        deviceId,
        questionnaire: {
          name: fullName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob,
          gender: formData.gender,
          occupation: formData.occupation,
          relationshipStatus: formData.relationshipStatus,
          age: formData.age,
          language: formData.language,
          type: formData.type,
          service: formData.service,
          plan_type: formData.plan_type,
          preferredFormat: formData.preferredFormat,
          additionalInfo: formData.additionalInfo,
          therapyBefore: formData.therapyBefore,
          diagnoses: formData.diagnoses,
          medication: formData.medication,
          underCare: formData.underCare,
          wellbeing: formData.wellbeing,
          stressLevel: formData.stressLevel,
          harmingThoughts: formData.harmingThoughts,
          trustedPerson: formData.trustedPerson,
          emergencyContactName: formData.emergencyContactName,
          emergencyContactPhone: formData.emergencyContactPhone,
          emergencyContactRelation: formData.emergencyContactRelation,
          acceptTerms: true,
          digitalSignature: formData.digitalSignature || fullName,
          informed_consent_agreed: true,
          minor_parent_name: formData.minorParentName || '',
          minor_consent_agreed: formData.minorConsent || false,
          confidentiality_agreed: true,
          signed_at: new Date().toISOString()
        },
        patient_details: {
          name: fullName,
          email: formData.email
        }
      };

      if (formData.therapist_id) {
        payload.therapist_id = formData.therapist_id;
      }

      const result = await requestSession(payload);

      if (!result.success) {
        throw new Error(result.error);
      }

      // PHONEPE PAYMENT INTEGRATION
      if (result.requiresPayment) {
        setLoading(true);
        try {
          const payInitRes = await fetch('/api/payment/phonepe/init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questionnaireId: result.questionnaireId,
              amount: result.amount,
              phone: formData.phone,
              name: fullName
            })
          });

          const payData = await payInitRes.json();
          if (payData.success && payData.redirectUrl) {
            initiatePhonePeTransaction(payData.redirectUrl, async (status) => {
              if (status === 'CONCLUDED') {
                setIsCaringInProgress(true);
                try {
                  await fetch('/api/payment/phonepe/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transactionId: result.transactionId })
                  });
                } catch (vErr) {
                  console.error("Verification Trigger Error:", vErr);
                }

                setTimeout(() => {
                  setIsCaringInProgress(false);
                  setModalState({
                    isOpen: true,
                    type: 'success',
                    title: 'Booking Confirmed!',
                    message: 'Your payment was successful. We are now preparing your session.'
                  });
                  closeAndReset();
                }, 3500);
              } else if (status === 'USER_CANCEL') {
                setLoading(false);
                setModalState({
                  isOpen: true,
                  type: 'error',
                  title: 'Payment Cancelled',
                  message: 'The payment process was interrupted. You can try again to secure your slot.'
                });
              }
            });
            return;
          } else {
            throw new Error(payData.error || 'Failed to initialize payment gateway.');
          }
        } catch (payErr: any) {
          console.error("PAYMENT INIT ERROR:", payErr);
          throw new Error("Payment Gateway Initialization Failed. Please try again or contact support.");
        }
      }

      setIsCaringInProgress(true);
      setTimeout(() => {
        setIsCaringInProgress(false);
        setModalState({
          isOpen: true,
          type: 'success',
          title: 'Request Received!',
          message: 'A clinical expert is reviewing your questionnaire and will assign the best therapist for your success.'
        });
        closeAndReset();
      }, 3500);
    } catch (err: any) {
      reportClientError(err.message, 'BookingModal.tsx - handleBookNow');
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Booking Error',
        message: 'An error occurred while submitting your session request. Please try again or contact support.'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedTherapistData = therapists.find(t => t.user_id === formData.therapist_id);

  const getPricing = () => {
    const defaultPricing = { trial: 399, single: 999, standard: 2999, premium: 1999 };
    if (!selectedTherapistData?.pricing) return defaultPricing;
    return { ...defaultPricing, ...selectedTherapistData.pricing };
  };

  const currentPricing = getPricing();

  const stepVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 40 : -40, opacity: 0 })
  };

  const isLastStep = currentStepIndex === activeSteps.length - 1;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div key="booking-modal-container" className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeAndReset}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[960px] h-[92vh] md:h-[600px] max-h-[640px] bg-white md:rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row group/modal"
          >
            {/* Desktop Branding Column (Balanced 310px width) */}
            <div className="hidden md:flex md:w-[310px] shrink-0 bg-[#111111] relative p-8 flex-col justify-between overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[260px] h-[260px] bg-[#0F9393]/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[260px] h-[260px] bg-[#0F9393]/10 blur-[80px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <Image src="/assets/logo unherd white.svg" alt="unHeard" width={110} height={36} className="h-[34px] w-auto mb-7" priority />
                <h2 className="font-georgia text-[28px] font-bold text-white leading-tight mb-4">
                  Begin Your <br /><span className="text-[#0F9393]">Journey to</span> <br />Better Mental Health
                </h2>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors mb-4 ${timeLeft < 60 ? 'bg-red-500/20 border-red-500/30 text-red-400 animate-pulse' : 'bg-white/10 border-white/20 text-white/80'}`}>
                  <Clock size={13} className={timeLeft < 60 ? 'animate-pulse' : ''} />
                  <span className="font-nunito font-bold text-[11px] tracking-tight">Slot held: {formatTime(timeLeft)}</span>
                </div>
                <p className="font-nunito text-white/70 text-[14px] leading-relaxed">
                  Take the first step towards a clearer mind, supported by licensed clinical psychologists.
                </p>
              </div>
              <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111111] bg-gray-600 overflow-hidden relative">
                       <Image src={`/assets/section_2_${i}.webp`} alt="User" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <p className="font-nunito text-white/60 text-[12px] leading-tight">Trusted by 1,500+ <br /> individuals</p>
              </div>
            </div>

            {/* Mobile Header */}
            <div className="md:hidden w-full h-[140px] shrink-0 bg-[#111111] relative p-5 flex flex-col justify-end overflow-hidden">
               <button onClick={closeAndReset} className="absolute top-4 right-4 z-20 text-white/70 hover:text-white p-1"><X size={22} /></button>
               <div className="relative z-10">
                 <Image src="/assets/logo unherd white.svg" alt="unHeard" width={80} height={20} className="h-[20px] w-auto mb-1.5" />
                 <h2 className="font-georgia text-[20px] font-bold text-white leading-tight">Book Your Session</h2>
               </div>
            </div>

            {/* Right Form Content Section */}
            <div className="flex-1 p-5 md:p-8 flex flex-col min-w-0 h-full relative bg-white text-black overflow-hidden">
              {/* CARING IN PROGRESS LOADING OVERLAY */}
              <AnimatePresence>
                {isCaringInProgress && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="flex flex-col items-center gap-6 max-w-sm">
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#0F9393]/20 rounded-full blur-xl animate-pulse scale-150" />
                        <div className="w-20 h-20 rounded-[28px] bg-[#0F9393]/10 flex items-center justify-center text-[#0F9393] relative shadow-inner">
                          <Heart size={38} className="animate-pulse duration-1000 fill-current animate-bounce" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center">
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-[#0F9393]/20 border-t-[#0F9393] animate-spin" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <h3 className="font-georgia font-bold text-[22px] text-gray-900">Caring in progress...</h3>
                        <div className="h-9 flex items-center justify-center">
                          <AnimatePresence mode="wait">
                            <motion.p
                              key={caringMessageIndex}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              transition={{ duration: 0.2 }}
                              className="font-nunito font-semibold text-[13px] text-gray-500 italic"
                            >
                              {caringMessages[caringMessageIndex]}
                            </motion.p>
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Header: Step Dots & Close Button */}
              <div className="flex items-center justify-between pb-3 shrink-0">
                <div className="flex items-center gap-1.5">
                  {activeSteps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentStepIndex === i ? 'w-7 bg-[#0F9393]' : 'w-2.5 bg-gray-200'}`} />
                  ))}
                  <span className="ml-2 font-nunito font-bold text-[11px] text-gray-400 uppercase tracking-wider">
                    Step {currentStepIndex + 1}/{activeSteps.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isReturningUser && (
                    <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-teal-50 border border-teal-200 rounded-full text-[#0F9393] text-[11px] font-bold">
                      <CheckCircle2 size={12} /> Profile Loaded
                    </div>
                  )}
                  <button onClick={closeAndReset} className="text-gray-400 hover:text-black p-1.5 rounded-full hover:bg-gray-100 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Welcome Back Banner for Returning Users */}
              {welcomeBanner && currentStep === 'personal_info' && isReturningUser && (
                <div className="mb-2.5 px-3.5 py-2 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-[12px] text-[#0F9393] font-nunito font-bold shrink-0">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{welcomeBanner}</span>
                </div>
              )}

              {/* Middle Scrollable Body */}
              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 py-1">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={`${currentStep}-${isEnteringOtp}`}
                    custom={direction}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    className="w-full flex flex-col gap-4"
                  >
                    {/* STEP: PHONE INPUT */}
                    {currentStep === 'phone' && !isEnteringOtp && (
                      <div className="flex flex-col gap-4">
                        {/* Emergency Helpline Banner */}
                        <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-3 flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-200/80 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
                            <Phone size={14} />
                          </div>
                          <div className="flex flex-col gap-0.5 text-[12px] text-amber-950 leading-snug">
                            <span className="font-bold flex items-center gap-1 text-amber-900">
                              <AlertCircle size={13} /> Not a substitute for emergency care
                            </span>
                            <p className="text-amber-900/90 font-medium">
                              If you are experiencing a crisis, please call the <a href="tel:18005990019" className="font-bold underline text-amber-950 hover:text-black">KIRAN Helpline (1800-599-0019)</a> or nearest emergency care.
                            </p>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-georgia font-bold text-[22px] text-black mb-1">Enter Your Phone Number</h3>
                          <p className="font-nunito text-gray-500 text-[13px]">
                            Returning clients are loaded directly from our database. New clients verify via WhatsApp.
                          </p>
                        </div>

                        <div className="flex flex-col gap-1.5 mt-1">
                          <label className="font-nunito font-bold text-[12px] text-gray-700 flex items-center justify-between">
                            <span>WhatsApp Phone Number *</span>
                            <span className="text-[11px] text-gray-400">e.g. +91 98765 43210</span>
                          </label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0F9393]" />
                            <input 
                              type="tel" 
                              autoFocus
                              value={formData.phone} 
                              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                              placeholder="Enter WhatsApp number" 
                              className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 font-nunito font-bold text-[15px] text-black placeholder:text-gray-400 focus:outline-none focus:border-[#0F9393] focus:ring-1 focus:ring-[#0F9393] bg-gray-50/50" 
                            />
                          </div>
                        </div>

                        <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-center mt-2">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Before you begin, review our agreements:</span>
                          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold">
                            <button type="button" onClick={() => setPreviewLegal('consent')} className="text-gray-600 hover:text-[#0F9393] hover:underline px-1.5 py-0.5 rounded hover:bg-gray-50">Informed Consent</button>
                            <span className="text-gray-300">•</span>
                            <button type="button" onClick={() => setPreviewLegal('telehealth')} className="text-gray-600 hover:text-[#0F9393] hover:underline px-1.5 py-0.5 rounded hover:bg-gray-50">Telehealth Consent</button>
                            <span className="text-gray-300">•</span>
                            <button type="button" onClick={() => setPreviewLegal('privacy')} className="text-gray-600 hover:text-[#0F9393] hover:underline px-1.5 py-0.5 rounded hover:bg-gray-50">Data Privacy (DPDP)</button>
                            <span className="text-gray-300">•</span>
                            <button type="button" onClick={() => setPreviewLegal('terms')} className="text-gray-600 hover:text-[#0F9393] hover:underline px-1.5 py-0.5 rounded hover:bg-gray-50">Terms</button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP: OTP SUB-SCREEN */}
                    {currentStep === 'phone' && isEnteringOtp && (
                      <div className="flex flex-col gap-5 text-center justify-center py-4">
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                          <ShieldCheck size={28} />
                        </div>
                        <div>
                          <h3 className="font-georgia font-bold text-[22px] text-black mb-1">Check WhatsApp</h3>
                          <p className="font-nunito text-gray-500 text-[13px]">
                            We sent a 6-digit verification code to <strong>{formData.phone}</strong>.
                          </p>
                        </div>
                        <div className="max-w-[260px] mx-auto w-full">
                          <input 
                            type="text" 
                            autoFocus
                            value={formData.otp} 
                            onChange={(e) => setFormData({...formData, otp: e.target.value})} 
                            placeholder="0 0 0 0 0 0" 
                            className="w-full border-b-2 border-gray-300 px-3 py-2 font-bold text-center text-[24px] tracking-[0.5rem] text-black focus:outline-none focus:border-[#0F9393] bg-transparent" 
                            maxLength={6} 
                          />
                        </div>
                        <div className="flex items-center justify-center gap-3 text-[12px]">
                          <button type="button" onClick={() => setIsEnteringOtp(false)} className="text-gray-400 hover:text-black font-bold">Change Number</button>
                          <span className="text-gray-300">•</span>
                          <button type="button" onClick={dispatchOTP} className="text-[#0F9393] hover:underline font-bold">Resend Code</button>
                        </div>
                      </div>
                    )}

                    {/* STEP: 1. INFORMED CONSENT FORM (First-time users only) */}
                    {currentStep === 'informed_consent' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <span className="text-[11px] font-bold text-[#0F9393] uppercase tracking-wider">Client-Facing • Before First Session</span>
                          <h3 className="font-georgia font-bold text-[20px] text-black">Informed Consent for Online Counseling Services— unHeard</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">By proceeding, you acknowledge and agree to the following:</p>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/70 max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-3 text-[12px] leading-relaxed text-gray-700">
                          <div>
                            <h4 className="font-bold text-gray-900">1. Nature of services.</h4>
                            <p>unHeard provides psychological counseling and therapy services delivered remotely (via video, audio, or text, as agreed with your therapist). This is not emergency or crisis intervention care.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-red-700">2. Not a substitute for emergency care.</h4>
                            <p>If you are experiencing a mental health emergency, including suicidal ideation or intent to harm yourself or others, please contact the KIRAN Mental Health Helpline (1800-599-0019) or your nearest emergency service immediately. unHeard therapists may not be immediately reachable outside scheduled sessions.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">3. Confidentiality and its limits.</h4>
                            <p>What you share in session is confidential, with the following legally and ethically required exceptions: (a) where there is a risk of serious harm to yourself or others, (b) where required by law or court order, (c) in cases of suspected abuse of a minor or vulnerable adult, as mandated by applicable law. Your therapist will explain these exceptions in plain language during your first session.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">4. Nature of online therapy.</h4>
                            <p>Online counseling can be as effective as in-person therapy for many concerns, but is not appropriate for every situation. Your therapist will discuss with you if a different or additional level of care (including in-person psychiatric evaluation) is more appropriate for your circumstances.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">5. Technology risks.</h4>
                            <p>While unHeard uses encrypted communication channels, no digital communication is completely free of risk (e.g., technical failure, unauthorized interception in rare circumstances). You are responsible for ensuring you&apos;re in a private setting during sessions.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">6. Your rights.</h4>
                            <p>You may ask questions about your therapist&apos;s qualifications and approach at any time. You may request a change of therapist. You may discontinue services at any time; we recommend discussing this with your therapist first where safely possible.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">7. Fees and cancellation.</h4>
                            <p>Please provide at least 24 hours notice to reschedule or cancel a session to avoid forfeiture of the session fee, consistent with published pricing terms.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">8. For minors (under 18).</h4>
                            <p>Where the client is a minor, this consent must be additionally signed by a parent or legal guardian, and the specific confidentiality arrangement for adolescent clients applies.</p>
                          </div>
                        </div>

                        {/* Acceptance & Signature */}
                        <div className="flex flex-col gap-2.5 pt-1">
                          <label className="flex items-start gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={formData.informedConsentAgreed}
                              onChange={(e) => setFormData({...formData, informedConsentAgreed: e.target.checked})}
                              className="mt-0.5 w-4 h-4 rounded text-[#0F9393] focus:ring-[#0F9393] border-gray-300"
                            />
                            <span className="text-[12px] font-semibold text-gray-800 leading-snug">
                              I confirm that I have read, understood, and voluntarily agree to the above.
                            </span>
                          </label>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Digital Signature (Full Name) *</label>
                              <input
                                type="text"
                                value={formData.digitalSignature}
                                onChange={(e) => setFormData({...formData, digitalSignature: e.target.value})}
                                placeholder="Type your full name"
                                className="border border-gray-200 rounded-xl px-3.5 py-2 text-[13px] bg-gray-50/50 text-black font-semibold focus:outline-none focus:border-[#0F9393]"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Date</span>
                              <div className="bg-gray-100 rounded-xl px-3.5 py-2 text-[12px] text-gray-600 font-bold select-none cursor-not-allowed">
                                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP: PERSONAL INFORMATION ("name and stuffs") */}
                    {currentStep === 'personal_info' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <h3 className="font-georgia font-bold text-[20px] text-black mb-0.5">Personal Information</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">
                            {isReturningUser ? 'Your details are pre-filled directly from our database. Click Continue to proceed.' : 'Please enter your details to initialize your clinical assignment.'}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">First Name *</label>
                            <input 
                              type="text" 
                              value={formData.firstName} 
                              onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
                              placeholder="First name" 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Last Name *</label>
                            <input 
                              type="text" 
                              value={formData.lastName} 
                              onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
                              placeholder="Last name" 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Email Address *</label>
                            <input 
                              type="email" 
                              value={formData.email} 
                              onChange={(e) => setFormData({...formData, email: e.target.value})} 
                              placeholder="name@example.com" 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Date of Birth *</label>
                            <input 
                              type="date" 
                              max={new Date().toISOString().split('T')[0]}
                              value={formData.dob} 
                              onChange={(e) => setFormData({...formData, dob: e.target.value})} 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]" 
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Gender Identity</label>
                            <select 
                              value={formData.gender} 
                              onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]"
                            >
                              <option value="">Select...</option>
                              <option value="Female">Female</option>
                              <option value="Male">Male</option>
                              <option value="Non-binary">Non-binary</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Relationship Status</label>
                            <select 
                              value={formData.relationshipStatus} 
                              onChange={(e) => setFormData({...formData, relationshipStatus: e.target.value})} 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]"
                            >
                              <option value="">Select...</option>
                              <option value="Single">Single</option>
                              <option value="In a relationship">In a relationship</option>
                              <option value="Married">Married</option>
                              <option value="Separated">Separated</option>
                              <option value="Divorced">Divorced</option>
                              <option value="Widowed">Widowed</option>
                              <option value="Prefer not to say">Prefer not to say</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2 flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[11px] text-gray-700">Occupation</label>
                            <input 
                              type="text" 
                              value={formData.occupation} 
                              onChange={(e) => setFormData({...formData, occupation: e.target.value})} 
                              placeholder="e.g. Student, Architect, Consultant" 
                              className="border border-gray-200 rounded-xl px-3.5 py-2 font-nunito text-[13px] text-black bg-gray-50/50 focus:outline-none focus:border-[#0F9393]" 
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP: 6. MINOR / ADOLESCENT PARENTAL CONSENT ADDENDUM (Only shown if age < 18) */}
                    {currentStep === 'minor_consent' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <span className="text-[11px] font-bold text-[#0F9393] uppercase tracking-wider">Required for Clients Under 18</span>
                          <h3 className="font-georgia font-bold text-[20px] text-black">6. Minor / Adolescent Parental Consent Addendum</h3>
                        </div>

                        <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex flex-col gap-2.5 text-[12px] text-gray-700 leading-relaxed">
                          <p>
                            As the parent/legal guardian of <strong>{formData.firstName || 'the minor client'}</strong>, I consent to their participation in counseling services provided by unHeard. I understand that:
                          </p>
                          <ul className="list-disc pl-5 flex flex-col gap-1 text-gray-800 font-medium">
                            <li>My child&apos;s therapist will explain, in age-appropriate terms, what will and won&apos;t be shared with me.</li>
                            <li>I will be informed immediately of any safety concern involving risk of serious harm, regardless of the general confidentiality arrangement.</li>
                            <li>Routine session content will generally remain confidential between my child and their therapist, to support the development of trust necessary for effective therapy—consistent with accepted clinical practice for adolescent mental health care.</li>
                          </ul>
                        </div>

                        <div className="flex flex-col gap-2.5 pt-1">
                          <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-gray-700">Parent / Legal Guardian Full Name *</label>
                            <input 
                              type="text"
                              value={formData.minorParentName}
                              onChange={(e) => setFormData({...formData, minorParentName: e.target.value})}
                              placeholder="Full legal name of parent or guardian"
                              className="border border-gray-200 rounded-xl px-3.5 py-2 text-[13px] bg-white text-black font-semibold focus:outline-none focus:border-[#0F9393]"
                            />
                          </div>

                          <label className="flex items-start gap-2.5 cursor-pointer group mt-1">
                            <input 
                              type="checkbox"
                              checked={formData.minorConsent}
                              onChange={(e) => setFormData({...formData, minorConsent: e.target.checked})}
                              className="mt-0.5 w-4 h-4 rounded text-[#0F9393] focus:ring-[#0F9393]"
                            />
                            <span className="text-[12px] font-bold text-gray-800">
                              I confirm that I am the parent/legal guardian and give my explicit consent.
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* STEP: 3. CONFIDENTIALITY & PRIVACY AGREEMENT (First-time users only) */}
                    {currentStep === 'privacy_agreement' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <span className="text-[11px] font-bold text-[#0F9393] uppercase tracking-wider">Data-Handling Specific Document</span>
                          <h3 className="font-georgia font-bold text-[20px] text-black">Confidentiality & Data Privacy Agreement— unHeard</h3>
                        </div>

                        <div className="border border-gray-200 rounded-2xl p-3.5 bg-gray-50/70 max-h-[250px] overflow-y-auto custom-scrollbar flex flex-col gap-3 text-[12px] leading-relaxed text-gray-700">
                          <div>
                            <h4 className="font-bold text-gray-900">What we collect:</h4>
                            <p>Your intake information, session notes maintained by your therapist, billing information, and any communication through the platform.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">How it&apos;s stored:</h4>
                            <p>Encrypted at rest and in transit, stored on secure cloud servers located in India, accessible only to your assigned therapist and authorized clinical/administrative staff.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Who can access your information:</h4>
                            <p>Your assigned therapist, and, only where legally or clinically necessary (e.g., a supervision context, or a handover to another therapist with your consent), specified other clinical staff. unHeard does not sell or share your personal or session data with third parties, including employers, insurers, or family members, without your explicit written consent, except where legally mandated.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Your rights under the DPDP Act, 2023:</h4>
                            <p>You may request a copy of your data, request corrections, and request deletion of your data (subject to legally mandated retention periods for clinical records, which your therapist will explain).</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Retention period:</h4>
                            <p>In compliance with clinical record-keeping standards, records are retained for a minimum statutory period (typically 3 to 7 years) after service ends.</p>
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900">Breach notification:</h4>
                            <p>In the event of a data breach affecting your information, unHeard will notify you in accordance with applicable law.</p>
                          </div>
                        </div>

                        <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
                          <input
                            type="checkbox"
                            checked={formData.confidentialityAgreed}
                            onChange={(e) => setFormData({...formData, confidentialityAgreed: e.target.checked})}
                            className="mt-0.5 w-4 h-4 rounded text-[#0F9393] focus:ring-[#0F9393] border-gray-300"
                          />
                          <span className="text-[12px] font-semibold text-gray-800 leading-snug group-hover:text-black">
                            I have read, understood, and voluntarily agree to the Confidentiality & Data Privacy Agreement.
                          </span>
                        </label>
                      </div>
                    )}

                    {/* STEP: CARE PREFERENCES */}
                    {currentStep === 'care_preferences' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <h3 className="font-georgia font-bold text-[20px] text-black mb-0.5">Care Preferences</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">Choose your session preferences. These are selected fresh for each booking.</p>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Therapy Type</label>
                            <div className="flex flex-wrap gap-2">
                              {['Individual', 'Couple', 'Teenager', 'Family'].map((t) => (
                                <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} className={`px-4 py-1.5 rounded-full text-[12px] font-bold border-2 transition-all ${formData.type === t ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}>{t}</button>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Preferred Session Format</label>
                            <div className="flex flex-wrap gap-2">
                              {['Video call', 'Phone call', 'In person'].map((format) => (
                                <button
                                  key={format}
                                  type="button"
                                  onClick={() => setFormData({...formData, preferredFormat: format})}
                                  className={`px-4 py-1.5 rounded-full text-[12px] font-bold border-2 transition-all ${formData.preferredFormat === format ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                                >
                                  {format}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="flex flex-col gap-1">
                              <label className="font-nunito font-bold text-[12px] text-gray-900">Preferred Language</label>
                              <select 
                                value={formData.language} 
                                onChange={(e) => setFormData({...formData, language: e.target.value})} 
                                className="border border-gray-200 rounded-xl px-3.5 py-2 bg-white text-black font-semibold text-[13px]"
                              >
                                <option value="English">English</option>
                                <option value="Hindi">Hindi</option>
                                <option value="Malayalam">Malayalam</option>
                                <option value="Tamil">Tamil</option>
                                <option value="Telugu">Telugu</option>
                              </select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="font-nunito font-bold text-[12px] text-gray-900">Primary Concern</label>
                              <input 
                                type="text" 
                                value={formData.service} 
                                onChange={(e) => setFormData({...formData, service: e.target.value})} 
                                placeholder="e.g. Anxiety, Grief, Stress" 
                                className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50 text-black text-[13px]" 
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Anything else your therapist should know?</label>
                            <textarea
                              value={formData.additionalInfo}
                              onChange={(e) => setFormData({...formData, additionalInfo: e.target.value})}
                              placeholder="Share background, specific context, or focus areas..."
                              className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50 text-black text-[12px] min-h-[60px] resize-none font-nunito"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STEP: SCHEDULING */}
                    {currentStep === 'scheduling' && (
                      <div className="flex flex-col gap-4">
                        <div>
                          <h3 className="font-georgia font-bold text-[20px] text-black mb-0.5">Schedule Appointment</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">Select your preferred date and slot with unHeard.</p>
                        </div>
                        <div className="flex flex-col gap-3">
                           <div className="flex flex-col gap-1">
                             <label className="font-nunito font-bold text-[12px] text-gray-900 flex items-center gap-1.5"><Calendar size={14}/> Select Date *</label>
                             <input 
                               type="date" 
                               min={new Date().toISOString().split('T')[0]}
                               value={formData.scheduled_date} 
                               onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                               className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#0F9393] bg-gray-50/50 font-bold text-black text-[13px]" 
                             />
                           </div>
                           
                           <div className="flex flex-col gap-1 mt-1">
                             <label className="font-nunito font-bold text-[12px] text-gray-900 flex items-center gap-1.5"><Clock size={14}/> Select Slot *</label>
                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                               {['09:00', '10:00', '11:00', '13:00', '15:00', '16:00', '18:00', '19:00'].map((time) => {
                                 const isToday = formData.scheduled_date === new Date().toISOString().split('T')[0];
                                 const [hours, minutes] = time.split(':').map(Number);
                                 const slotDate = new Date();
                                 slotDate.setHours(hours, minutes, 0, 0);
                                 const isDisabled = isToday && (slotDate.getTime() < Date.now() + 30 * 60 * 1000);

                                 return (
                                   <button 
                                     key={time} 
                                     disabled={isDisabled}
                                     type="button"
                                     onClick={() => setFormData({...formData, scheduled_time: time})} 
                                     className={`py-2 rounded-xl text-[12px] font-bold border-2 transition-all ${isDisabled ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed' : (formData.scheduled_time === time ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm' : 'bg-white border-gray-100 text-gray-600 hover:border-gray-300')}`}
                                   >
                                     {time}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* STEP: CLINICAL CHECK-IN (1 to 5 ratings asked fresh for all bookings) */}
                    {currentStep === 'clinical_checkin' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <h3 className="font-georgia font-bold text-[20px] text-black mb-0.5">Clinical Check-in</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">A fresh assessment for this session. Static contact info remains saved.</p>
                        </div>
                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          {/* WELLBEING RATING (1 to 5) */}
                          <div className="flex flex-col gap-1.5 p-2.5 bg-gray-50/80 border border-gray-100 rounded-xl">
                            <label className="font-nunito font-bold text-[12px] text-gray-900 flex items-center justify-between">
                              <span>How would you rate your overall wellbeing right now? *</span>
                              {formData.wellbeing > 0 && <span className="text-[#0F9393] font-black">{formData.wellbeing}/5</span>}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {[
                                { val: 1, label: 'Very poor' },
                                { val: 2, label: 'Poor' },
                                { val: 3, label: 'Fair' },
                                { val: 4, label: 'Good' },
                                { val: 5, label: 'Excellent' }
                              ].map(({ val, label }) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, wellbeing: val })}
                                  className={`py-1.5 rounded-lg font-bold flex flex-col items-center justify-center text-[11px] border transition-all ${
                                    formData.wellbeing === val
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0F9393]/40'
                                  }`}
                                >
                                  <span className="text-[14px] font-black">{val}</span>
                                  <span className="text-[9px] opacity-80">{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* STRESS LEVEL RATING (1 to 5) */}
                          <div className="flex flex-col gap-1.5 p-2.5 bg-gray-50/80 border border-gray-100 rounded-xl">
                            <label className="font-nunito font-bold text-[12px] text-gray-900 flex items-center justify-between">
                              <span>How would you rate your current stress level? *</span>
                              {formData.stressLevel > 0 && <span className="text-[#0F9393] font-black">{formData.stressLevel}/5</span>}
                            </label>
                            <div className="grid grid-cols-5 gap-1.5">
                              {[
                                { val: 1, label: 'Very low' },
                                { val: 2, label: 'Low' },
                                { val: 3, label: 'Moderate' },
                                { val: 4, label: 'High' },
                                { val: 5, label: 'Very high' }
                              ].map(({ val, label }) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, stressLevel: val })}
                                  className={`py-1.5 rounded-lg font-bold flex flex-col items-center justify-center text-[11px] border transition-all ${
                                    formData.stressLevel === val
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-700 hover:border-[#0F9393]/40'
                                  }`}
                                >
                                  <span className="text-[14px] font-black">{val}</span>
                                  <span className="text-[9px] opacity-80">{label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Therapy History */}
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Have you received counselling or therapy before?</label>
                            <div className="flex gap-2">
                              {['Yes', 'No'].map((opt) => (
                                <button key={opt} type="button" onClick={() => setFormData({...formData, therapyBefore: opt})} className={`px-4 py-1 rounded-full text-[12px] font-bold border-2 ${formData.therapyBefore === opt ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{opt}</button>
                              ))}
                            </div>
                          </div>

                          {/* Medication / Doctor Care */}
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Are you currently taking mental health medication or under doctor&apos;s care?</label>
                            <div className="flex flex-wrap gap-2">
                              {['No', 'Medication only', 'Under doctor care', 'Both', 'Prefer not to say'].map((opt) => (
                                <button key={opt} type="button" onClick={() => setFormData({...formData, medication: opt})} className={`px-3 py-1 rounded-full text-[11px] font-bold border-2 ${formData.medication === opt ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{opt}</button>
                              ))}
                            </div>
                          </div>

                          {/* Crisis Screening */}
                          <div className="flex flex-col gap-1">
                            <label className="font-nunito font-bold text-[12px] text-gray-900">Are you currently having thoughts of harming yourself or ending your life? *</label>
                            <div className="flex flex-wrap gap-1.5">
                              {['No', 'Yes — sometimes', 'Yes — frequently', 'Prefer not to say'].map((option) => (
                                <button
                                  key={option}
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData, 
                                    harmingThoughts: option,
                                    ...(option === 'No' ? { trustedPerson: '' } : {})
                                  })}
                                  className={`px-3 py-1 rounded-full text-[11px] font-bold border-2 transition-all ${
                                    formData.harmingThoughts === option
                                      ? 'bg-[#0F9393] border-[#0F9393] text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                  }`}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          </div>

                          {formData.harmingThoughts !== '' && formData.harmingThoughts !== 'No' && (
                            <div className="flex flex-col gap-2.5 border-l-2 border-[#0F9393] pl-2.5 py-1">
                              <div className="flex flex-col gap-1">
                                <label className="font-nunito font-bold text-[11px] text-gray-900">Do you have a trusted person you can contact in a crisis? *</label>
                                <div className="flex gap-2">
                                  {['Yes', 'No', 'Not sure'].map((option) => (
                                    <button key={option} type="button" onClick={() => setFormData({...formData, trustedPerson: option})} className={`px-3.5 py-1 rounded-full text-[11px] font-bold border-2 ${formData.trustedPerson === option ? 'bg-[#0F9393] border-[#0F9393] text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{option}</button>
                                  ))}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="font-nunito font-bold text-[11px] text-gray-900">Emergency Contact Details *</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})} placeholder="Contact Name" className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-[12px] bg-gray-50/50" />
                                  <input type="text" value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})} placeholder="Phone Number" className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-[12px] bg-gray-50/50" />
                                </div>
                                <select value={formData.emergencyContactRelation} onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})} className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-[12px] bg-gray-50/50">
                                  <option value="" disabled>Relationship...</option>
                                  {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Guardian', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP: PLAN SELECTION & CHECKOUT */}
                    {currentStep === 'plan_selection' && (
                      <div className="flex flex-col gap-3.5">
                        <div>
                          <h3 className="font-georgia font-bold text-[20px] text-black mb-0.5">Select Plan</h3>
                          <p className="font-nunito text-gray-500 text-[12px]">Choose a session plan. Your first intro call is on us if eligible.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                          {[
                            { label: 'Trial Session', price: currentPricing.trial, isTrial: true, available: isTrialAvailable },
                            { label: 'Single Session', price: currentPricing.single, isTrial: false, available: true },
                            { label: 'Standard Pack', price: currentPricing.standard, isTrial: false, available: true },
                            { label: 'Premium Pack', price: currentPricing.premium, isTrial: false, available: true }
                          ].map((plan, i) => {
                            const isSelected = formData.plan_type === plan.label;
                            const isDisabled = !plan.available;

                            return (
                              <div 
                                key={i} 
                                onClick={() => !isDisabled && setFormData({...formData, is_trial: plan.isTrial, plan_type: plan.label})}
                                className={`group relative border-2 ${isSelected ? 'border-[#0F9393] bg-[#0F9393]/5' : 'border-gray-100'} ${isDisabled ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:border-gray-200 cursor-pointer'} rounded-xl p-3 transition-all flex flex-col items-center justify-center text-center`}
                              >
                                {plan.isTrial && plan.available && (
                                  <div className="absolute top-2 right-2 text-[#0F9393]">
                                    <ShieldCheck size={14} />
                                  </div>
                                )}
                                
                                <span className="font-nunito font-bold text-[10px] text-[#0F9393] uppercase tracking-wider mb-0.5">
                                  {isDisabled ? 'Intro Call (Availed)' : plan.label}
                                </span>

                                <div className="flex flex-col items-center">
                                  {isDisabled ? (
                                    <span className="font-georgia font-bold text-[18px] text-gray-400 line-through">₹75/-</span>
                                  ) : (
                                    <h4 className="font-georgia font-bold text-[22px] text-black">
                                      {plan.isTrial ? 'FREE' : `₹${plan.price}/-`}
                                    </h4>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Coupon Code Input */}
                        <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-1">
                          <label className="font-nunito font-bold text-[10px] text-gray-400 uppercase tracking-widest ml-1">Have a Coupon?</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={couponCode}
                              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                              placeholder="ENTER CODE"
                              className="flex-grow bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-[12px] font-bold text-gray-900 outline-none focus:border-[#0F9393]"
                            />
                            <button type="button" className="bg-black text-white px-4 py-1.5 rounded-lg font-bold text-[11px] hover:bg-gray-800">Apply</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Footer */}
              <div className="pt-3 mt-auto shrink-0 border-t border-gray-100 flex items-center justify-between">
                <div className="min-w-[60px]">
                  {(currentStepIndex > 0 || (currentStep === 'phone' && isEnteringOtp)) && (
                    <button onClick={handlePrev} className="group flex items-center gap-1 font-nunito font-bold text-gray-400 hover:text-black transition-colors text-[13px]">
                      <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" /> Back
                    </button>
                  )}
                </div>
                
                <div>
                  {!isLastStep ? (
                    <button 
                      onClick={handleNext} 
                      disabled={loading || !isStepValid(currentStep)}
                      className="bg-black text-white px-6 py-2.5 md:px-7 md:py-2.5 rounded-xl font-nunito font-bold flex items-center gap-2 shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[13px]"
                    >
                      {loading ? 'Verifying...' : 'Continue'}
                      <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleBookNow} 
                      disabled={loading} 
                      className="bg-[#0F9393] text-white px-7 py-2.5 md:px-8 md:py-2.5 rounded-xl font-nunito font-bold flex items-center gap-2 shadow-lg shadow-[#0F9393]/20 hover:bg-[#0D7F7F] transition-all active:scale-95 disabled:opacity-50 text-[13px]"
                    >
                      {loading ? 'Processing...' : 'Complete'}
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* LEGAL PREVIEW MODAL OVERLAY */}
            <AnimatePresence>
              {previewLegal && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[120] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                  <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }} className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl relative">
                    <button onClick={() => setPreviewLegal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100"><X size={18} /></button>
                    
                    <h3 className="font-georgia font-bold text-[18px] text-gray-900 mb-3">
                      {previewLegal === 'consent' && 'Informed Consent for Online Counseling'}
                      {previewLegal === 'telehealth' && 'Telehealth Technology Consent'}
                      {previewLegal === 'privacy' && 'Data Privacy Agreement (DPDP Act, 2023)'}
                      {previewLegal === 'terms' && 'Terms of Service & Cancellation Policy'}
                    </h3>

                    <div className="overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2.5 text-[12px] text-gray-600 leading-relaxed">
                      {previewLegal === 'consent' && (
                        <>
                          <p><strong>1. Nature of services:</strong> Psychological counseling and therapy delivered remotely. Not emergency care.</p>
                          <p className="text-red-700 font-semibold"><strong>2. Not emergency care:</strong> Contact KIRAN Helpline (1800-599-0019) or nearest emergency care if experiencing a crisis.</p>
                          <p><strong>3. Confidentiality:</strong> What you share is confidential except where legally mandated (harm, court order, abuse).</p>
                          <p><strong>4. Client rights:</strong> Inquire about qualifications, request change of therapist, or discontinue anytime.</p>
                          <p><strong>5. 24-hour notice:</strong> Cancellation requires 24 hours notice to avoid fee forfeiture.</p>
                        </>
                      )}

                      {previewLegal === 'telehealth' && (
                        <>
                          <p>Sessions conducted remotely via encrypted unHeard platform.</p>
                          <p>Confirm you are in a private, confidential setting for the session.</p>
                          <p>Recording sessions requires mutual explicit consent and is prohibited otherwise.</p>
                        </>
                      )}

                      {previewLegal === 'privacy' && (
                        <>
                          <p><strong>Collection:</strong> Intake information, clinical session notes, billing details.</p>
                          <p><strong>Storage:</strong> Encrypted on secure servers located in India.</p>
                          <p><strong>Access:</strong> Assigned therapist and clinical supervisors only. Never sold to third parties.</p>
                          <p><strong>DPDP Act Rights:</strong> Right to access, correction, and deletion under statutory retention rules.</p>
                        </>
                      )}

                      {previewLegal === 'terms' && (
                        <>
                          <p>Bookings must be confirmed before appointment start time.</p>
                          <p>Rescheduling available with 24 hours notice.</p>
                          <p>Clinical coordination team assigns verified psychologists.</p>
                        </>
                      )}
                    </div>

                    <button onClick={() => setPreviewLegal(null)} className="mt-4 w-full bg-black text-white rounded-xl py-2.5 font-bold text-[13px] hover:bg-gray-800 transition-all">
                      Close
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* THERAPIST PREVIEW POPOVER */}
            <AnimatePresence>
              {previewTherapist && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col p-8 overflow-y-auto">
                  <button onClick={() => setPreviewTherapist(null)} className="absolute top-5 right-5 text-black/50 hover:text-black bg-gray-100 p-1.5 rounded-full"><X size={20} /></button>
                  <div className="flex items-center gap-4 mb-5">
                     <Image src={previewTherapist.avatar_url || `/assets/section_2_3.webp`} width={80} height={80} className="rounded-xl object-cover shadow-lg" alt="" />
                     <div>
                       <h3 className="font-georgia text-[24px] font-bold text-black">{previewTherapist.full_name}</h3>
                       <p className="text-[#0F9393] font-bold tracking-widest uppercase text-[11px]">{previewTherapist.qualification}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="font-nunito text-[14px] text-gray-700 leading-relaxed italic border-l-4 border-[#0F9393]/20 pl-3">{previewTherapist.bio || 'Navigating mental clarity with evidence-based support.'}</p>
                    <div>
                       <h4 className="font-bold text-black mb-2 text-[13px]">Specialties</h4>
                       <div className="flex flex-wrap gap-1.5">
                        {(previewTherapist.specialties || ['Growth', 'Anxiety']).map((s: string) => (
                            <span key={s} className="bg-gray-100 px-3 py-1 rounded-full text-[11px] font-bold text-gray-600">{s}</span>
                        ))}
                       </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-5">
                     <button
                       onClick={() => {
                         setFormData({...formData, therapist_id: previewTherapist.user_id});
                         setPreviewTherapist(null);
                         handleNext();
                       }}
                       className="w-full bg-black text-white rounded-xl py-3 font-bold active:scale-95 transition-all text-[14px]"
                     >
                       Select Therapist
                     </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
      
      <AnimatedModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
      />
    </>
  );
}
