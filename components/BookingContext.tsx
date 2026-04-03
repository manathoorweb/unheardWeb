'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import BookingModal from '@/components/BookingModal';

interface BookingContextType {
  openBookingModal: () => void;
  closeBookingModal: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => ({
    openBookingModal: () => setIsOpen(true),
    closeBookingModal: () => setIsOpen(false)
  }), []);

  return (
    <BookingContext.Provider value={value}>
      {children}
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
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
