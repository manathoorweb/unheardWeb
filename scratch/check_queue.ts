import { createAdminClient } from '../lib/supabase/admin';

async function check() {
  const sb = await createAdminClient();
  const { data, error } = await sb.from('whatsapp_queue').select('*').limit(5);
  console.log('Queue Status:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

check();
