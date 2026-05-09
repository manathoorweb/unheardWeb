const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Attempting to force add column via direct query...");
  // We try to use the 'pre_booking_questionnaires' table trick if RLS allows, 
  // but usually we need a dedicated RPC. Let's try one more time or give the user the SQL.
  
  const { data, error } = await supabase.from('user_roles').select('*').limit(1);
  if (error) {
     console.error("Error:", error);
  } else {
     console.log("Current columns:", Object.keys(data[0] || {}));
  }
}
run();
