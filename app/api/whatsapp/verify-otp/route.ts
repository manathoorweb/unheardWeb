import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ success: false, error: 'Phone and OTP are required' }, { status: 400 });

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('booking_otps')
      .select('*')
      .eq('phone_number', phone)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
       return NextResponse.json({ success: false, error: 'OTP is missing or has expired.' }, { status: 400 });
    }

    if (data.otp_code !== otp) {
       return NextResponse.json({ success: false, error: 'Incorrect OTP code.' }, { status: 400 });
    }

    await supabase.from('booking_otps').update({ verified: true }).eq('id', data.id);

    return NextResponse.json({ success: true, message: 'Phone number successfully verified.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
