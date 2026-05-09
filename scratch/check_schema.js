const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('user_roles').select('*').limit(1);
  if (error) {
    console.error("Error fetching user_roles:", error);
  } else {
    console.log("user_roles columns:", Object.keys(data[0] || {}));
  }
}
run();
