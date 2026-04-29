import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';
import { normalizePhone } from '@/utils/phone';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { phone } = body;
    const { type = 'booking' } = body;
    if (!phone) return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });

    phone = normalizePhone(phone);

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

    const supabase = await createAdminClient();

    // 1. RATE LIMITING (Cooldown)
    const { data: lastOtp } = await supabase
      .from('booking_otps')
      .select('created_at')
      .eq('phone_number', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.created_at).getTime();
      if (diff < 60 * 1000) { // 60 seconds cooldown
        return NextResponse.json({ success: false, error: `Please wait ${Math.ceil((60 * 1000 - diff) / 1000)}s before requesting a new code.` }, { status: 429 });
      }
    }
    
    const { error: dbError } = await supabase.from('booking_otps').insert({
      phone_number: phone,
      otp_code: otpCode,
      expires_at: expiresAt
    });
    
    if (dbError) throw dbError;

    // Contextual messaging
    let message = '';
    if (type === 'login') {
      message = `*unHeard Therapist Studio*\n\nYour dashboard access code is: *${otpCode}*\n\n_Keep this code confidential._`;
    } else {
      message = `*unHeard Authorization*\n\nYour session booking verification code is: *${otpCode}*\n\n_Do not share this code._`;
    }
    
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
