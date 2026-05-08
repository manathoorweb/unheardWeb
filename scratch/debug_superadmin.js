const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: roles } = await supabase.from('user_roles').select('*').eq('role', 'super_admin');
  console.log("Super Admins:", roles);
  
  if (roles && roles.length > 0) {
     const superAdminId = roles[0].user_id;
     console.log("Super Admin ID:", superAdminId);
     
     // Check therapist_profiles
     const { data: tp } = await supabase.from('therapist_profiles').select('*').eq('user_id', superAdminId);
     console.log("Therapist Profile:", tp);
  }
}
run();
