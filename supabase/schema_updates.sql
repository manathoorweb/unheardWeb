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
