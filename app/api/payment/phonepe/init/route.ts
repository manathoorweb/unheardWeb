import { PhonePe } from '@/lib/payment/PhonePe';
import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { questionnaireId, phone, name } = await req.json();
    const adminSupabase = await createAdminClient();

    // 1. FETCH & VALIDATE SESSION
    const { data: questionnaire, error: qError } = await adminSupabase
      .from('pre_booking_questionnaires')
      .select('amount, expires_at, payment_status')
      .eq('id', questionnaireId)
      .single();

    if (qError || !questionnaire) {
      return NextResponse.json({ success: false, error: 'Session not found' });
    }

    if (questionnaire.payment_status === 'completed') {
      return NextResponse.json({ success: false, error: 'Payment already completed for this session' });
    }

    if (questionnaire.expires_at && new Date(questionnaire.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error: 'Session has expired. Please start over.' });
    }

    // 2. GENERATE IDS
    const transactionId = `T${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const orderId = `ORD${Date.now()}`;

    // 3. UPDATE DB
    await adminSupabase
      .from('pre_booking_questionnaires')
      .update({ 
        transaction_id: transactionId,
        order_id: orderId
      })
      .eq('id', questionnaireId);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in';

    const result = await PhonePe.initPayment({
      transactionId,
      merchantUserId: questionnaireId,
      amount: questionnaire.amount,
      mobileNumber: phone,
      callbackUrl: `${baseUrl}/api/payment/phonepe/callback`,
      redirectUrl: `${baseUrl}/payment/success?tid=${transactionId}`
    });

    if (result.success && result.data?.instrumentResponse?.redirectInfo?.url) {
      return NextResponse.json({ 
        success: true, 
        redirectUrl: result.data.instrumentResponse.redirectInfo.url 
      });
    }

    console.error('PhonePe API Error Response:', JSON.stringify(result, null, 2));
    return NextResponse.json({ 
      success: false, 
      error: result.message || 'Failed to initialize payment gateway' 
    });
  } catch (error: any) {
    console.error('Payment Init API Critical Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
