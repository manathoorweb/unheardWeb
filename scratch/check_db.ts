import { createClient } from './utils/supabase/server';

async function checkColumns() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'appointments' });
  
  if (error) {
    // If RPC doesn't exist, try a simple query and check the returned object keys
    const { data: sample, error: queryError } = await supabase.from('appointments').select('*').limit(1);
    if (queryError) {
      console.error('Error fetching appointments:', queryError);
    } else {
      console.log('Columns in appointments:', Object.keys(sample[0] || {}));
    }
  } else {
    console.log('Columns from RPC:', data);
  }
}

checkColumns();
