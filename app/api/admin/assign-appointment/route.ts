import { createAdminClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';

export async function POST(req: Request) {
  try {
    const { questionnaire_id, therapist_id, meeting_link } = await req.json();

    if (!questionnaire_id || !therapist_id) {
      return NextResponse.json({ success: false, error: 'Questionnaire ID and Therapist ID are required' }, { status: 400 });
    }

    const adminSupabase = await createAdminClient();

    // 1. Get the questionnaire details
    const { data: questionnaire, error: qError } = await adminSupabase
      .from('pre_booking_questionnaires')
      .select('*')
      .eq('id', questionnaire_id)
      .single();

    if (qError || !questionnaire) {
      return NextResponse.json({ success: false, error: 'Session request not found' }, { status: 404 });
    }

    // 2. Perform Virtual Room Allocation
    let final_meeting_link = meeting_link;
    const startIso = new Date(questionnaire.requested_start_time).toISOString();
    const duration = questionnaire.is_trial ? 30 : 60;
    const endIso = new Date(new Date(questionnaire.requested_start_time).getTime() + duration * 60 * 1000).toISOString();

    if (!final_meeting_link) {
      // Find overlapping appointments directly conflicting with this block
      const { data: overlaps } = await adminSupabase
        .from('appointments')
        .select('meeting_link')
        .in('status', ['confirmed', 'approved'])
        .not('meeting_link', 'is', null)
        .gte('start_time', startIso)
        .lte('start_time', endIso);

      const busyLinks = (overlaps || []).map(o => o.meeting_link).filter(link => link.includes('google'));
      const { data: activeRooms } = await adminSupabase
        .from('virtual_rooms')
        .select('gmeet_link')
        .eq('is_active', true);

      const availableRoom = activeRooms?.find(room => !busyLinks.includes(room.gmeet_link));
      if (availableRoom) {
        final_meeting_link = availableRoom.gmeet_link;
      } else {
        return NextResponse.json({ 
          success: false, 
          error: 'All Virtual Google Meet rooms are currently occupied for this exact time slot. Please paste a manual Meet Link to assign.' 
        }, { status: 400 });
      }
    }

    // 3. Create the appointment
    const { data: appointment, error: aptError } = await adminSupabase
      .from('appointments')
      .insert([{
        patient_id: questionnaire.patient_id,
        therapist_id: therapist_id,
        start_time: startIso,
        end_time: endIso,
        status: 'confirmed',
        is_trial: questionnaire.is_trial,
        meeting_link: final_meeting_link,
        pre_booking_id: questionnaire.id,
        guest_name: questionnaire.guest_name,
        guest_phone: questionnaire.guest_phone
      }])
      .select()
      .single();

    if (aptError) {
      return NextResponse.json({ success: false, error: aptError.message }, { status: 500 });
    }

    // 4. Update the questionnaire
    await adminSupabase
      .from('pre_booking_questionnaires')
      .update({
        appointment_id: appointment.id,
        status: 'allotted'
      })
      .eq('id', questionnaire.id);

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://unheard.co.in';
    const gateway_link = `${baseUrl}/room/${appointment.id}`;

    // 5. Fetch Therapist info to dispatch WhatsApp
    const { data: therapistProfile } = await adminSupabase
      .from('therapist_profiles')
      .select('full_name, phone, qualification')
      .eq('user_id', therapist_id)
      .maybeSingle();

    const formattedDate = new Date(startIso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedTime = new Date(startIso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const qAnswers = questionnaire.answers || {};
    const patientPhone = questionnaire.guest_phone;
    const patientName = questionnaire.guest_name || 'Anonymous User';

    // 6. Send WhatsApp to Therapist
    if (therapistProfile?.phone) {
      const tGatewayLink = `${gateway_link}?type=therapist`;
      const therapistMsg = `*New Appointment Assigned!* ✅\n\nDr. ${therapistProfile.full_name}, an admin has assigned a new session to you.\n\n*Patient:* ${patientName}\n*Date:* ${formattedDate}\n*Time:* ${formattedTime}\n*Type:* ${qAnswers.type || 'Individual'} (${qAnswers.service || 'General'})\n\n🔗 *Join Session Room:* ${tGatewayLink}\n\nPlease check your dashboard for details.`;
      await WhatsAppManager.sendMessage(therapistProfile.phone, therapistMsg);
    }

    // 7. Send WhatsApp to Patient
    if (patientPhone) {
      const therapistName = therapistProfile?.full_name || 'your assigned therapist';
      const therapistQual = therapistProfile?.qualification ? `\n*Specialization:* ${therapistProfile.qualification}` : '';
      
      let msgAction = `🔒 *Meeting Access:* A secure Google Meet link will be generated and shared with you strictly *6 hours* before your session starts.`;
      
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
        msgAction = `🔗 *Test Link (Dev Mode):* ${gateway_link}\n\nNote: In production, this link is only shared 6 hours before.`;
      }

      const patientMsg = `*Therapist Assigned & Confirmed!* 🎉\n\nHi ${patientName}, great news! Your session has been officially confirmed.\n\nYou have been matched with *Dr. ${therapistName}* who is highly experienced and specifically trained for your needs.${therapistQual}\n\n🗓️ *Date:* ${formattedDate}\n⏰ *Time:* ${formattedTime}\n\n${msgAction}\n\nSee you soon!`;
      await WhatsAppManager.sendMessage(patientPhone, patientMsg);

      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost')) {
         const pGatewayLink = `${gateway_link}?type=patient`;
         const reminderMsg = `*Your Session is Starting Soon!* ⏳ (Dev Test)\n\nHi ${patientName}, your session is starting in *15 minutes*.\n\n🔗 *Join Now:* ${pGatewayLink}\n\nPlease join 2 minutes early to test your audio and video.`;
         await WhatsAppManager.sendMessage(patientPhone, reminderMsg);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Assign Therapist Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
