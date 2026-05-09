const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Use rpc if possible or just raw SQL via an existing endpoint if any
  // But usually we have to tell the user to run it in SQL editor
  console.log("Attempting to add column via RPC if allowed...");
  const { error } = await supabase.rpc('exec_sql', { sql: 'ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_blogger BOOLEAN DEFAULT false;' });
  if (error) {
    console.error("RPC exec_sql failed (as expected if not defined):", error.message);
    console.log("\nPLEASE RUN THIS IN SUPABASE SQL EDITOR:\nALTER TABLE user_roles ADD COLUMN is_blogger BOOLEAN DEFAULT false;");
  } else {
    console.log("Column added successfully!");
  }
}
run();
