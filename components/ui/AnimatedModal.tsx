'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, MessageCircle } from 'lucide-react';
import Button from './Button';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
  contactLink?: string;
}

export default function AnimatedModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  contactLink = 'https://wa.me/919606083755'
}: AnimatedModalProps) {
  const isError = type === 'error';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              {/* Decorative Background Glow */}
              <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full blur-[60px] opacity-20 pointer-events-none ${isError ? 'bg-red-500' : 'bg-[#0F9393]'}`} />

              <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isError ? 'bg-red-50 text-red-500' : 'bg-[#0F9393]/10 text-[#0F9393]'}`}>
                  {isError ? <AlertCircle size={28} /> : <CheckCircle2 size={28} />}
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-[24px] font-bold text-gray-900 tracking-tight mb-3">
                {title}
              </h3>
              
              <p className="text-[15px] text-gray-500 leading-relaxed mb-8">
                {message}
              </p>

              <div className="flex gap-3">
                {isError ? (
                  <>
                    <Button
                      onClick={onClose}
                      variant="gray"
                      className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 h-[52px] rounded-xl font-bold"
                    >
                      Dismiss
                    </Button>
                    <a
                      href={contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-900 h-[52px] rounded-xl font-bold transition-all shadow-md active:scale-95"
                    >
                      <MessageCircle size={18} />
                      Contact Us
                    </a>
                  </>
                ) : (
                  <Button
                    onClick={onClose}
                    variant="black"
                    className="w-full bg-[#0F9393] hover:bg-[#0D7F7F] text-white h-[52px] rounded-xl font-bold shadow-md"
                  >
                    Continue
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
