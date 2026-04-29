const { createClient } = require('@supabase/supabase-js');

async function migrate() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('🚀 Starting Database Migration & Cleanup...');

  // 1. Clear existing data
  console.log('🧹 Clearing old appointments and questionnaires...');
  await supabase.from('appointments').delete().not('id', 'is', 'null');
  await supabase.from('pre_booking_questionnaires').delete().not('id', 'is', 'null');

  // 2. Perform Schema Updates via RPC (or just hope the table structure is enough for now)
  // Since we can't run raw SQL easily without an RPC, we will assume we can use the JS client 
  // to insert into new columns if they exist.
  // Actually, I should probably use a SQL migration if possible.
  
  console.log('✅ Data cleared. Please run the following SQL in your Supabase Dashboard:');
  console.log(`
    -- 1. Modify pre_booking_questionnaires to be the primary entry point
    ALTER TABLE public.pre_booking_questionnaires DROP CONSTRAINT IF EXISTS pre_booking_questionnaires_appointment_id_fkey;
    ALTER TABLE public.pre_booking_questionnaires ALTER COLUMN appointment_id DROP NOT NULL;
    
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_name TEXT;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_phone TEXT;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS guest_email TEXT;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS requested_start_time TIMESTAMP WITH TIME ZONE;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS is_trial BOOLEAN DEFAULT FALSE;
    ALTER TABLE public.pre_booking_questionnaires ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

    -- 2. Link Appointments back to Questionnaires
    ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS pre_booking_id UUID REFERENCES public.pre_booking_questionnaires(id) ON DELETE SET NULL;
    
    -- 3. Relax appointments constraints for therapist-first assignment if needed
    ALTER TABLE public.appointments ALTER COLUMN patient_id DROP NOT NULL;
    ALTER TABLE public.appointments ALTER COLUMN therapist_id DROP NOT NULL;
  `);
}

migrate();
