'use client';
import React, { useState } from 'react';
import Button from './ui/Button';
import { requestSession } from '@/lib/actions';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: '',
    type: '',
    age: '',
    service: '',
    therapist_id: '1', // Default mock ID
    is_trial: true
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 5));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  
  const closeAndReset = () => {
    onClose();
    setTimeout(() => setStep(1), 300);
  };

  const handleBookNow = async () => {
    setLoading(true);
    try {
      await requestSession({
        therapist_id: formData.therapist_id,
        start_time: new Date().toISOString(),
        is_trial: formData.is_trial,
        questionnaire: {
          age: formData.age,
          language: formData.language,
          type: formData.type,
          service: formData.service
        }
      });
      alert('Booking Request Sent Successfully!');
      closeAndReset();
    } catch (err: any) {
      alert(err.message || 'Failed to book');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const renderStepIndicator = () => {
    return (
      <div className="w-full flex justify-end items-center mb-8">
        <span className="font-nunito font-semibold text-gray-500 mr-2">Step {step}/5</span>
        <button onClick={handleNext} className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors disabled:opacity-50">
          ▶
        </button>
      </div>
    );
  };

  const renderBottomNav = (navText: string) => {
    return (
      <div className="w-full pt-6 border-t border-gray-200 flex items-center gap-3">
        <div className="flex -space-x-2">
          <div className={`w-4 h-4 rounded-full ${step >= 1 ? 'bg-gray-400' : 'bg-gray-200'}`}></div>
          <div className={`w-4 h-4 rounded-full ${step >= 2 ? 'bg-gray-400' : 'bg-gray-200'} opacity-75`}></div>
          <div className={`w-4 h-4 rounded-full ${step >= 3 ? 'bg-gray-400' : 'bg-gray-200'} opacity-50`}></div>
        </div>
        <span className="text-[12px] font-nunito font-bold text-[#0F9393]">
          {navText}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[600px] max-h-[90vh] bg-white rounded-lg shadow-2xl p-8 overflow-y-auto flex flex-col">
        
        {/* Close Button */}
        <button onClick={closeAndReset} className="absolute top-6 right-6 text-gray-400 hover:text-black font-bold text-xl">✕</button>
        
        {renderStepIndicator()}
        
        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div className="flex flex-col h-full gap-6">
            <h3 className="font-georgia font-bold text-[24px]">Basic Details</h3>
            <div className="flex flex-col gap-4 flex-grow">
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Good Name
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your name" 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Email
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email" 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Phone Number
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter your phone" 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Preferred Language
                <input 
                  type="text" 
                  value={formData.language}
                  onChange={(e) => setFormData({...formData, language: e.target.value})}
                  placeholder="English, Hindi, etc." 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
            </div>
            <div className="mt-4 pb-6">
              <button onClick={handleNext} className="bg-black text-white px-8 py-2 rounded-full font-bold flex items-center justify-between w-[150px] shadow-lg hover:bg-gray-800 transition-colors">
                Continue <span className="arrow-icon">→</span>
              </button>
            </div>
            {renderBottomNav('Basic Details')}
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <div className="flex flex-col h-full gap-6">
            <h3 className="font-georgia font-bold text-[24px]">Service Details</h3>
            <div className="flex flex-col gap-6 flex-grow">
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Select The Type
                <input 
                  type="text" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  placeholder="Individual, Couple, etc." 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Age
                <input 
                  type="text" 
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="Enter your age" 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
              <label className="flex flex-col font-nunito font-bold text-[14px]">
                Select Service
                <input 
                  type="text" 
                  value={formData.service}
                  onChange={(e) => setFormData({...formData, service: e.target.value})}
                  placeholder="Therapy, Consultation, etc." 
                  className="mt-1 border border-gray-300 rounded-full px-4 py-2 font-normal focus:outline-none focus:border-[#0F9393]" 
                />
              </label>
            </div>
            <div className="mt-8 pb-6 flex gap-4">
              <button onClick={handlePrev} className="border border-black text-black px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">Back</button>
              <button onClick={handleNext} className="bg-black text-white px-8 py-2 rounded-full font-bold flex items-center justify-between w-[150px] shadow-lg hover:bg-gray-800 transition-colors">
                Continue <span className="arrow-icon">→</span>
              </button>
            </div>
            {renderBottomNav('Basic Details > Select Service')}
          </div>
        )}

        {/* Step 3: Select Therapist */}
        {step === 3 && (
          <div className="flex flex-col h-full gap-6">
            <h3 className="font-georgia font-bold text-[20px] mb-2">Select Your Therapist</h3>
            <input type="text" placeholder="Search Your Therapist" className="w-full border border-gray-300 rounded-full px-4 py-2 font-nunito text-[14px] focus:outline-none focus:border-[#0F9393] mb-4" />
            
            <div className="grid grid-cols-2 gap-4 flex-grow">
              {[1,2,3,4].map((i) => (
                <div 
                  key={i} 
                  onClick={() => setFormData({...formData, therapist_id: String(i)})}
                  className={`border ${formData.therapist_id === String(i) ? 'border-[#0F9393] border-2 shadow-md' : 'border-gray-200'} rounded-md p-3 relative cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className={`absolute top-2 right-2 w-3 h-3 bg-[#0F9393] rounded-full ${formData.therapist_id === String(i) ? 'block' : 'hidden'}`}></div>
                  <div className="w-full aspect-square bg-gray-200 rounded-md overflow-hidden mb-3">
                     <img src="/assets/section_2_2.png" className="w-full h-full object-cover" alt="Therapist" />
                  </div>
                  <h4 className="font-georgia font-bold text-[16px] text-[#0F9393]">Ashaya Rathor</h4>
                </div>
              ))}
            </div>

            <div className="mt-4 pb-6 flex items-center justify-between">
              <button className="border-2 border-gray-300 text-gray-500 font-bold px-6 py-2 rounded-md hover:bg-gray-50 transition-colors text-[14px]">
                Load More
              </button>
              <button onClick={handleNext} className="bg-black text-white px-8 py-2 rounded-full font-bold flex items-center justify-between w-[150px] shadow-lg hover:bg-gray-800 transition-colors">
                Continue <span className="arrow-icon">→</span>
              </button>
            </div>
            {renderBottomNav('Basic Details > Select Service > Select Your Therapist')}
          </div>
        )}

        {/* Step 4: Pricing Options */}
        {step >= 4 && (
          <div className="flex flex-col h-full gap-6">
            <h3 className="font-georgia font-bold text-[24px]">Select Pricing</h3>
            <div className="grid grid-cols-2 gap-4 flex-grow mb-8">
              {['399/-', '999/-', '2999/-', '1999/-'].map((price, i) => (
                <div 
                  key={i} 
                  onClick={() => setFormData({...formData, is_trial: i === 0})}
                  className={`border ${((i === 0 && formData.is_trial) || (i !== 0 && !formData.is_trial && i === 1)) ? 'border-[#0F9393] border-2 shadow-lg' : 'border-gray-200'} rounded-md p-6 relative cursor-pointer hover:shadow-md transition-all flex items-center justify-center min-h-[120px]`}
                >
                  <div className={`absolute top-3 right-3 w-3 h-3 bg-[#0F9393] rounded-full ${((i === 0 && formData.is_trial) || (i !== 0 && !formData.is_trial && i === 1)) ? 'block' : 'hidden'}`}></div>
                  <div className="absolute top-1/2 left-0 w-full border-t border-gray-200"></div>
                  <h4 className="font-georgia font-bold text-[28px] text-black relative z-10 bg-white px-2 mt-[-30px]">{price}</h4>
                </div>
              ))}
            </div>
            <div className="mt-4 pb-6 flex gap-4">
              <button onClick={handlePrev} className="border border-black text-black px-6 py-2 rounded-full font-bold hover:bg-gray-100 transition-colors">Back</button>
              <button onClick={handleBookNow} disabled={loading} className="bg-black text-white px-8 py-2 rounded-full font-bold flex items-center justify-between w-[200px] shadow-lg hover:bg-gray-800 transition-colors disabled:opacity-50">
                {loading ? 'Booking...' : 'Book Now'} <span className="arrow-icon">→</span>
              </button>
            </div>
            {renderBottomNav('Basic Details > Details > Options confirmed')}
          </div>
        )}
      </div>
    </div>
  );
}
