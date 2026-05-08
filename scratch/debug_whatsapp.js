const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: lock } = await supabase.from('whatsapp_auth').select('*').eq('id', 'connection_lock').single();
  console.log("Connection Lock:", lock);
  
  const { data: queue } = await supabase.from('whatsapp_queue').select('*').eq('status', 'pending');
  console.log(`Pending Messages: ${queue ? queue.length : 0}`);
  if (queue && queue.length > 0) {
     console.log("Oldest pending:", queue[0]);
  }
}
run();
