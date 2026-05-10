import { PhonePe } from '@/lib/payment/PhonePe';
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';
import { mailer } from '@/lib/mailer';
import { finalizeBooking } from '@/lib/actions';
import { encrypt } from '@/lib/security/encryption';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { response } = body; // PhonePe sends base64 response in 'response' field
    
    if (!response) {
       return NextResponse.json({ success: false, error: 'No response data' }, { status: 400 });
    }

    const decoded = JSON.parse(Buffer.from(response, 'base64').toString());
    const transactionId = decoded.data.merchantTransactionId;
    const adminSupabase = await createAdminClient();

    // Verify status from PhonePe directly for security
    const statusResult = await PhonePe.checkStatus(transactionId);

    if (statusResult.success && statusResult.code === 'PAYMENT_SUCCESS') {
      if (!statusResult.data) throw new Error('Payment success but no data returned');

      // 1. UPDATE DB
      const { data: questionnaire } = await adminSupabase
        .from('pre_booking_questionnaires')
        .update({ 
          payment_status: 'completed',
          payment_id: statusResult.data.transactionId 
        })
        .eq('transaction_id', transactionId)
        .select()
        .single();

      if (questionnaire) {
        // 2. TRIGGER NOTIFICATIONS
        await finalizeBooking(questionnaire.id);
      }
    } else {
      // PAYMENT FAILED or PENDING
      const { data: questionnaire } = await adminSupabase
        .from('pre_booking_questionnaires')
        .select('*')
        .eq('transaction_id', transactionId)
        .single();

      if (questionnaire && statusResult.code !== 'PAYMENT_PENDING') {
        // 1. Prepare Secure Payload
        const sessionData = {
          qid: questionnaire.id,
          amount: questionnaire.amount,
          phone: questionnaire.guest_phone,
          name: questionnaire.guest_name,
          email: questionnaire.guest_email,
          answers: questionnaire.answers,
          expires_at: questionnaire.expires_at || new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        };

        // 2. Encrypt Entire Session Data
        const encryptedPayload = encrypt(JSON.stringify(sessionData));

        // 3. Generate Secure Link
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in';
        const resumeLink = `${baseUrl}/payment/resume?p=${encodeURIComponent(encryptedPayload)}`;

        // 4. Send Notifications
        const msg = `*Payment Unsuccessful* ⚠️\n\nHi ${questionnaire.guest_name}, we noticed your payment for the session was not completed.\n\nYou can resume your booking and complete the payment using this secure link (valid for 2 hours):\n\n🔗 ${resumeLink}\n\nNo need to fill the questionnaire again. Everything is securely saved.`;
        
        await WhatsAppManager.enqueueMessage(questionnaire.guest_phone, msg);
        
        // Trigger queue processing
        await fetch(`${baseUrl}/api/whatsapp/process-queue`).catch(console.error);

        await mailer.sendMail({
          from: '"unHeard" <support@unheard.co.in>',
          to: questionnaire.guest_email,
          subject: 'Action Required: Complete your session booking',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Payment Unsuccessful</h2>
              <p>Hi ${questionnaire.guest_name},</p>
              <p>We noticed your payment for the session booking was not completed. You can resume your booking and complete the payment using the link below:</p>
              <p><a href="${resumeLink}" style="background: #0F9393; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Resume My Booking</a></p>
              <p>This link is secure and valid for 2 hours. Your questionnaire answers have been saved.</p>
              <hr />
              <p><small>If you have any issues, please contact us at support@unheard.co.in</small></p>
            </div>
          `
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Payment Callback Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
