import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { createAdminClient } from '@/utils/supabase/server';
import { decrypt } from '@/lib/security/encryption';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const encryptedPayload = searchParams.get('p');

    let qid = '';
    let sessionData: any = null;

    if (encryptedPayload) {
      // 1. Handle Encrypted Payload (New Flow)
      try {
        const decrypted = decrypt(decodeURIComponent(encryptedPayload));
        sessionData = JSON.parse(decrypted);
        qid = sessionData.qid;
      } catch (err) {
        throw new Error('Invalid secure link data');
      }
    } else if (token) {
      // 2. Handle JWT Token (Legacy Flow)
      const decoded: any = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
      qid = decoded.qid;
    } else {
      throw new Error('Missing secure identifier');
    }

    const adminSupabase = await createAdminClient();

    // Verify against DB for the latest status and amount
    const { data: q, error } = await adminSupabase
      .from('pre_booking_questionnaires')
      .select('id, amount, guest_name, guest_phone, expires_at, payment_status')
      .eq('id', qid)
      .single();

    if (error || !q) {
        // If not in DB but we have sessionData, we could theoretically still allow it, 
        // but for security we should ensure the session exists and is pending.
        throw new Error('Booking session no longer exists');
    }

    if (q.payment_status === 'completed') {
        throw new Error('This booking has already been paid for.');
    }

    if (q.expires_at && new Date(q.expires_at) < new Date()) {
        throw new Error('This secure link has expired. Please start over.');
    }

    return NextResponse.json({ 
      success: true, 
      payload: { 
        qid: q.id, 
        amount: q.amount, 
        name: q.guest_name, 
        phone: q.guest_phone,
        answers: sessionData?.answers || null
      } 
    });
  } catch (error: any) {
    console.error('Token Verification Error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
