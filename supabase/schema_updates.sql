-- =====================================================================================
-- UNHEARD SCHEMA UPDATES
-- =====================================================================================

-- 11. PUSH SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    keys JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own subscriptions" ON public.push_subscriptions 
    FOR ALL USING (auth.uid() = user_id);

-- 12. OFFLINE BACKGROUND QUEUE
CREATE TABLE IF NOT EXISTS public.offline_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offline_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own offline queue" ON public.offline_queue 
    FOR ALL USING (auth.uid() = user_id);

-- 13. THERAPIST PRICING ADDITION
ALTER TABLE public.therapist_profiles 
ADD COLUMN IF NOT EXISTS pricing JSONB DEFAULT 'null'::jsonb;

-- 14. WHATSAPP BAILEYS PERSISTENCE ENGINE
-- Used to completely bypass Vercel ephemeral storage by pushing keys directly to Supabase
CREATE TABLE IF NOT EXISTS public.whatsapp_auth (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. BOOKING OTP AUTHORIZATION LOGIC
CREATE TABLE IF NOT EXISTS public.booking_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 17. THERAPIST NOTIFICATIONS
-- Support sending WhatsApp notifications to therapists
ALTER TABLE public.therapist_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 18. GUEST BOOKING SUPPORT
-- Allow appointments without a linked auth.user and store guest contact info
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- 19. APPOINTMENT ASSIGNMENTS & NOTIFICATION QUEUE
-- Allow manual assignment of therapists, and tracking for automated cron notifications.
ALTER TABLE public.appointments ALTER COLUMN therapist_id DROP NOT NULL;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS assignment_status TEXT DEFAULT 'pending';
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminded_6h_patient BOOLEAN DEFAULT FALSE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminded_3h_patient BOOLEAN DEFAULT FALSE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS reminded_15m_patient BOOLEAN DEFAULT FALSE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS joined_at_patient TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS joined_at_therapist TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS session_summary TEXT;

-- 21. SESSION LOGS
-- Track every hit to the room gateway for duration auditing and re-join tracking.
CREATE TABLE IF NOT EXISTS public.session_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL, -- 'patient' | 'therapist'
    event_type TEXT DEFAULT 'join',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Super admins view session logs" ON public.session_logs FOR ALL USING (true);

-- 20. VIRTUAL ROOMS POOL
-- Store Google Meet links to be dynamically assigned to appointments.
CREATE TABLE IF NOT EXISTS public.virtual_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    gmeet_link TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.virtual_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Super admins manage virtual rooms" ON public.virtual_rooms;
-- 22. QUEUE STABILIZATION: QUESTIONNAIRE-FIRST WORKFLOW
-- Decouples questionnaires from appointments to allow pending requests before allotment.
ALTER TABLE public.pre_booking_questionnaires DROP CONSTRAINT IF EXISTS pre_booking_questionnaires_appointment_id_fkey;
ALTER TABLE public.pre_booking_questionnaires ALTER COLUMN appointment_id DROP NOT NULL;

ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_name TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_phone TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_email TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS requested_start_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Link Appointments back to Questionnaires
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pre_booking_id UUID REFERENCES public.pre_booking_questionnaires(id) ON DELETE SET NULL;

-- Relax appointments constraints for therapist-first assignment
ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;
ALTER TABLE public.appointments ALTER COLUMN therapist_id DROP NOT NULL;

-- Enable RLS for the new columns
DROP POLICY IF EXISTS "Super admins manage questionnaires" ON public.pre_booking_questionnaires;
CREATE POLICY "Super admins manage questionnaires" ON public.pre_booking_questionnaires FOR ALL USING (true);
