import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAppointment() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', '7b563733-7d5a-4468-b480-7a81b1ce533b')
    .single();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Appointment Data:', JSON.stringify(data, null, 2));
  }
}

checkAppointment();
