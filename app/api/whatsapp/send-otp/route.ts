import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

    const supabase = await createClient();
    
    const { error: dbError } = await supabase.from('booking_otps').insert({
      phone_number: phone,
      otp_code: otpCode,
      expires_at: expiresAt
    });
    
    if (dbError) throw dbError;

    const message = `*unHeard Authorization*\n\nYour session booking verification code is: *${otpCode}*\n\n_Do not share this code._`;
    const wsStatus = await WhatsAppManager.sendMessage(phone, message);

    if (!wsStatus.success) {
      console.warn("WhatsApp OTP dispatch failed.", wsStatus.error);
      return NextResponse.json({ success: false, error: 'Messaging Bot Offline. Please ask admin to scan QR.' }, { status: 503 });
    }

    return NextResponse.json({ success: true, message: 'WhatsApp OTP generated and dispatched.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
