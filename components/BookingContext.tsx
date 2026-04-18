'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import BookingModal from '@/components/BookingModal';

export interface BookingConfig {
  therapist_id?: string;
  type?: string;
  age?: string;
  service?: string;
}

interface BookingContextType {
  openBookingModal: (config?: BookingConfig) => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<BookingConfig | undefined>(undefined);

  const value = useMemo(() => ({
    openBookingModal: (config?: BookingConfig) => {
      setModalConfig(config);
      setIsOpen(true);
    },
    closeBookingModal: () => {
      setIsOpen(false);
      setModalConfig(undefined);
    }
  }), []);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        initialConfig={modalConfig} 
      />
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
