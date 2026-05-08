import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';
import { normalizePhone } from '@/utils/phone';

export async function POST(req: Request) {
  try {
    const { subscription, phone } = await req.json();
    
    if (!subscription) {
      return NextResponse.json({ success: false, error: 'Subscription is required' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    
    const normalizedPhone = phone ? normalizePhone(phone) : null;
    
    // Upsert based on the endpoint to avoid duplicates
    const { error } = await supabase.from('push_subscriptions').upsert({
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      phone: normalizedPhone,
    }, { onConflict: 'endpoint' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Push Subscription Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
