import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

// This API should be called periodically by Vercel Cron (e.g. every 5 minutes)
// Keep in mind to secure it with a cron secret in production
export async function GET(req: Request) {
  try {
    // Basic auth guard for CRON secret if deployed
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized Cron Request' }, { status: 401 });
    }

    const adminSupabase = await createAdminClient();
    const now = new Date();

    // Look for upcoming appointments that haven't passed yet
    const timeWindowStart = now.toISOString();
    const timeWindowMax = new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString(); // Look up to 7h ahead

    const { data: upcomingAppointments, error } = await adminSupabase
      .from('appointments')
      .select('*')
      .gte('start_time', timeWindowStart)
      .lte('start_time', timeWindowMax)
      .eq('status', 'confirmed');

    if (error || !upcomingAppointments) {
      console.error('Failed to fetch upcoming appointments:', error);
      return NextResponse.json({ success: false, error: 'Failed fetching appointments' }, { status: 500 });
    }

    let dispatchedCount = 0;

    for (const appt of upcomingAppointments) {
      const startTime = new Date(appt.start_time).getTime();
      const differenceMs = startTime - now.getTime();
      const diffMinutes = differenceMs / (1000 * 60);

      const patientPhone = appt.guest_phone;
      const patientName = appt.guest_name || 'there';
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in';
      
      const istTime = new Date(appt.start_time).toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      // ==========================================
      // 2. PATIENT: 15 MINUTES BEFORE NOTIFICATION
      // ==========================================
      if (diffMinutes <= 15 && diffMinutes > 0 && !appt.reminded_15m_patient && patientPhone) {
        const pGatewayLink = `${baseUrl}/api/room-redirect/${appt.id}?type=patient`;
        const msg = `*Starting at ${istTime} IST* ⏳\n\nHi ${patientName}, your session is starting in *15 minutes* (at ${istTime}).\n\n🔗 *Join Now:* ${pGatewayLink}\n\nPlease join 2 minutes early to test your audio and video.\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;
        
        await WhatsAppManager.sendMessage(patientPhone, msg);
        await adminSupabase.from('appointments').update({ reminded_15m_patient: true }).eq('id', appt.id);
        dispatchedCount++;
      }

      // ==========================================
      // 3. THERAPIST: 15 MINUTES BEFORE NOTIFICATION
      // ==========================================
      if (diffMinutes <= 15 && diffMinutes > 0 && !appt.reminded_15m_therapist && appt.therapist_id) {
        // Fetch therapist profile for phone
        const { data: tProfile } = await adminSupabase
          .from('therapist_profiles')
          .select('full_name, phone')
          .eq('user_id', appt.therapist_id)
          .single();

        if (tProfile?.phone) {
          const tGatewayLink = `${baseUrl}/api/room-redirect/${appt.id}?type=therapist`;
          const msg = `*Session at ${istTime} IST* ⏳\n\nDr. ${tProfile.full_name}, your session with *${patientName}* begins in *15 minutes* (at ${istTime}).\n\n🔗 *Join Space:* ${tGatewayLink}\n\nPlease be ready.\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;
          
          await WhatsAppManager.sendMessage(tProfile.phone, msg);
          
          // Mark as sent - use 15m patient flag if therapist flag doesn't exist yet, or just update the DB
          await adminSupabase.from('appointments').update({ reminded_15m_therapist: true }).eq('id', appt.id);
          dispatchedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, processed: upcomingAppointments.length, dispatched: dispatchedCount });
  } catch (error: any) {
    console.error('CRON Notification Dispacth Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
