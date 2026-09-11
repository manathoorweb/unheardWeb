import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/server';
import { normalizePhone } from '@/utils/phone';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone: rawPhone } = body;

    if (!rawPhone) {
      return NextResponse.json({ success: false, error: 'Phone number is required' }, { status: 400 });
    }

    const normalized = normalizePhone(rawPhone);
    const clean10 = rawPhone.replace(/\D/g, '').slice(-10);

    if (clean10.length !== 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit phone number' }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // 1. Check for existing questionnaires by this phone (clean 10-digit or normalized)
    const { data: previousQuestionnaires, error: qError } = await adminSupabase
      .from('pre_booking_questionnaires')
      .select('*')
      .or(`guest_phone.eq.${clean10},guest_phone.eq.${normalized}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (qError) {
      console.warn('Check Phone - Questionnaire Query Error:', qError);
    }

    // 2. Check for existing user in user_roles or auth.users
    const { data: existingRole } = await adminSupabase
      .from('user_roles')
      .select('*')
      .or(`phone_number.eq.${clean10},phone_number.eq.${normalized}`)
      .maybeSingle();

    const isRegistered = Boolean(
      (previousQuestionnaires && previousQuestionnaires.length > 0) || existingRole
    );

    if (isRegistered) {
      const latestQ = previousQuestionnaires && previousQuestionnaires.length > 0 ? previousQuestionnaires[0] : null;
      const answers = latestQ?.answers || {};

      // Name parts split if guest_name is available but firstName wasn't directly in answers
      let firstName = answers.firstName || '';
      let lastName = answers.lastName || '';
      if (!firstName && latestQ?.guest_name) {
        const parts = latestQ.guest_name.trim().split(/\s+/);
        firstName = parts[0] || '';
        lastName = parts.slice(1).join(' ') || '';
      }

      return NextResponse.json({
        success: true,
        registered: true,
        consentsOnRecord: Boolean(answers.acceptTerms || answers.informed_consent_agreed || answers.digitalSignature),
        data: {
          firstName: firstName,
          lastName: lastName,
          email: latestQ?.guest_email || answers.email || '',
          phone: normalized,
          dob: answers.dob || '',
          gender: answers.gender || '',
          occupation: answers.occupation || '',
          relationshipStatus: answers.relationshipStatus || '',
          language: answers.language || 'English',
          age: answers.age || '26-35',
          service: answers.service || '',
          emergencyContactName: answers.emergencyContactName || '',
          emergencyContactPhone: answers.emergencyContactPhone || '',
          emergencyContactRelation: answers.emergencyContactRelation || '',
          trustedPerson: answers.trustedPerson || '',
          digitalSignature: answers.digitalSignature || `${firstName} ${lastName}`.trim()
        }
      });
    }

    // 3. New Phone Number -> Automatically dispatch WhatsApp OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 mins

    // Rate limiting check
    const { data: lastOtp } = await adminSupabase
      .from('booking_otps')
      .select('created_at')
      .eq('phone_number', normalized)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.created_at).getTime();
      if (diff < 60 * 1000) {
        return NextResponse.json({
          success: true,
          registered: false,
          otpDispatched: true,
          message: 'OTP already active. Please enter the code sent to your WhatsApp.'
        });
      }
    }

    await adminSupabase.from('booking_otps').insert({
      phone_number: normalized,
      otp_code: otpCode,
      expires_at: expiresAt
    });

    const message = `*unHeard Authorization*\n\nYour verification code is: *${otpCode}*\n\n_Do not share this code._`;
    const wsStatus = await WhatsAppManager.sendMessage(normalized, message);

    if (!wsStatus.success) {
      console.warn('WhatsApp OTP dispatch warning:', wsStatus.error);
    }

    return NextResponse.json({
      success: true,
      registered: false,
      otpDispatched: true,
      message: 'Verification code sent via WhatsApp.'
    });
  } catch (error: any) {
    console.error('Check Phone API Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
