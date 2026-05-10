import { createAdminClient } from '../utils/supabase/server';

async function inspectSchema() {
  const supabase = await createAdminClient();
  
  // Try to insert a dummy row to see what columns are available
  // or just use a query that selects from information_schema if possible (Supabase might block this via API)
  // Instead, we'll try to fetch one row and see the keys
  
  const { data, error } = await supabase
    .from('pre_booking_questionnaires')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching table info:', error);
  } else if (data && data.length > 0) {
    console.log('Available columns:', Object.keys(data[0]));
  } else {
    console.log('Table is empty. Trying to insert and catch error for missing columns...');
    const { error: insertError } = await supabase
        .from('pre_booking_questionnaires')
        .insert([{
            guest_name: 'Test',
            guest_phone: '1234567890',
            answers: {},
            amount: 0,
            payment_status: 'pending',
            expires_at: new Date().toISOString(),
            status: 'pending'
        }]);
    
    if (insertError) {
        console.error('Insert Error Detail:', JSON.stringify(insertError, null, 2));
    } else {
        console.log('Insert succeeded! Columns seem to be correct.');
    }
  }
}

inspectSchema();
