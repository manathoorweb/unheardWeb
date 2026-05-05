import { createAdminClient } from '../lib/supabase/admin';

async function check() {
  const sb = await createAdminClient(); 
  const { data, error } = await sb.from('whatsapp_auth').select('id, updated_at').limit(10);
  console.log('Auth Data:', JSON.stringify(data, null, 2));
  if (error) console.error('Error:', error);
}

check();
