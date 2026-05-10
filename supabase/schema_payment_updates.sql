-- ADD PAYMENT COLUMNS TO QUESTIONNAIRES
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS transaction_id TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS payment_payload JSONB;

-- ENSURE STATUS TYPE IS FLEXIBLE
-- (Assuming status was text, if it was enum we might need to alter it, but schema says TEXT DEFAULT 'pending')
