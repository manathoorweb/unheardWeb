'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle } from 'lucide-react';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const supabase = createClient();

  const addNotification = (notif: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotif = { ...notif, id, createdAt: new Date() };
    setNotifications((prev) => [newNotif, ...prev]);

    // Auto-remove after 5 seconds
    setTimeout(() => removeNotification(id), 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    // 1. Listen for new Therapist Registrations (for Admins)
    const therapistSubscription = supabase
      .channel('therapist-registrations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'therapist_profiles' },
        (payload) => {
          addNotification({
            title: 'New Therapist Registration',
            message: `${payload.new.full_name} has joined the platform.`,
            type: 'info',
          });
        }
      )
      .subscribe();

    // 2. Listen for new Appointments
    const appointmentSubscription = supabase
      .channel('new-appointments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments' },
        (payload) => {
          addNotification({
            title: 'New Appointment Booked',
            message: `A new session has been scheduled for ${payload.new.date} at ${payload.new.time}.`,
            type: 'success',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(therapistSubscription);
      supabase.removeChannel(appointmentSubscription);
    };
  }, [addNotification, supabase]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearNotifications }}>
      {children}
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className={`
                p-5 rounded-[24px] shadow-2xl flex gap-4 border backdrop-blur-xl relative overflow-hidden group
                ${notif.type === 'success' ? 'bg-[#0F9393]/90 border-[#0F9393]/20 text-white' : 
                  notif.type === 'info' ? 'bg-black/90 border-white/10 text-white' :
                  'bg-red-500/90 border-red-400/20 text-white'}
              `}>
                <div className="shrink-0 mt-1">
                  {notif.type === 'success' ? <CheckCircle size={20} /> : <Bell size={20} />}
                </div>
                <div className="flex flex-col gap-1 pr-6">
                  <span className="font-bold text-[15px] tracking-tight">{notif.title}</span>
                  <p className="text-[14px] opacity-80 leading-snug">{notif.message}</p>
                </div>
                <button 
                  onClick={() => removeNotification(notif.id)}
                  className="absolute top-4 right-4 opacity-50 hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
                {/* Progress bar */}
                <motion.div 
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-white/20"
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
