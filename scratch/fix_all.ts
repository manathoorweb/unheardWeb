import { createAdminClient } from '../utils/supabase/server';

async function fixAll() {
  const supabase = await createAdminClient();
  
  console.log('--- 1. Checking Database Columns ---');
  const { data: qData, error: qError } = await supabase.from('pre_booking_questionnaires').select('*').limit(1);
  
  if (qError) {
    console.error('❌ Table access error:', qError.message);
  } else {
    const columns = qData.length > 0 ? Object.keys(qData[0]) : [];
    console.log('Current columns:', columns);
    
    const required = ['amount', 'payment_status', 'expires_at', 'order_id'];
    const missing = required.filter(c => !columns.includes(c));
    
    if (missing.length > 0) {
      console.log('⚠️ Missing columns detected:', missing);
      console.log('Please run the SQL in supabase/schema_payment_updates.sql in your Supabase SQL Editor.');
    } else {
      console.log('✅ Database columns look correct.');
    }
  }

  console.log('\n--- 2. Resetting WhatsApp Session (Fixing Bad MAC) ---');
  try {
    // Delete all auth data to force a fresh login
    const { error: waError } = await supabase.from('whatsapp_auth').delete().not('id', 'is', 'null');
    if (waError) throw waError;
    console.log('✅ WhatsApp session cleared. Please visit the admin dashboard to scan the new QR code.');
  } catch (err: any) {
    console.error('❌ Failed to clear WhatsApp session:', err.message);
  }
}

fixAll();
