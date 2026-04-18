import { createClient } from '@supabase/supabase-js';

// A simple client that doesn't rely on Next.js headers/cookies
// Safe for background tasks and manager singletons
export const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
