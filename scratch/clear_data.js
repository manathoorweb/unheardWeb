const { createClient } = require('@supabase/supabase-js');

// These should be set in your environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearData() {
  console.log('Clearing clinical data for testing...');
  
  // Delete all appointments (cascades to questionnaires if set up, but let's be explicit)
  const { error: aptError } = await supabase
    .from('appointments')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (aptError) console.error('Error deleting appointments:', aptError);
  else console.log('Successfully cleared appointments.');

  // Delete all questionnaires
  const { error: qError } = await supabase
    .from('pre_booking_questionnaires')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (qError) console.error('Error deleting questionnaires:', qError);
  else console.log('Successfully cleared questionnaires.');

  console.log('Cleanup complete.');
}

clearData();
