const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: superAdmins } = await supabase.from('user_roles').select('*').eq('role', 'super_admin');
  console.log("Super Admins:", superAdmins);
  
  if (superAdmins) {
     for (const admin of superAdmins) {
       const { data: tp } = await supabase.from('therapist_profiles').select('*').eq('user_id', admin.user_id).single();
       console.log(`Therapist profile for ${admin.user_id}:`, !!tp);
       
       const { data: up } = await supabase.from('user_profiles').select('*').eq('user_id', admin.user_id).single();
       console.log(`User profile for ${admin.user_id}:`, !!up);
       
       if (up) {
         console.log("User Profile Data:", up);
       }
     }
  }
}
run();
