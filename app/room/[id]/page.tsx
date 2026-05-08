import { createAdminClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { logAdminActivity } from '@/utils/logger';
import { WhatsAppManager } from '@/lib/whatsapp/WhatsAppClient';
import { NotificationController } from '@/lib/notifications/NotificationController';

export default async function RoomGateway({ params, searchParams }: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ type?: string }> 
}) {
  const { id } = await params;
  const { type } = await searchParams;
  const adminSupabase = await createAdminClient();

  const { data: appointment, error } = await adminSupabase
    .from('appointments')
    .select('id, start_time, status, meeting_link, joined_at_patient, joined_at_therapist, guest_name, guest_phone, therapist_id, pre_booking_id')
    .eq('id', id)
    .single();

  if (error || !appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div>
           <h1 className="text-3xl font-bold text-red-600 mb-2">Invalid Session Link 🛑</h1>
           <p className="text-gray-600 font-nunito">The meeting room you are trying to access does not exist.</p>
        </div>
      </div>
    );
  }


  // 1. CHECK IF SESSION IS COMPLETED
  if (appointment.status === 'completed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">Session Completed </h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This therapy session has been successfully concluded and securely archived. Thank you for choosing unHeard.
           </p>
        </div>
      </div>
    );
  }

  // 2. CHECK IF SESSION IS CANCELLED
  if (appointment.status === 'cancelled') {
     return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">Session Cancelled</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This session has been cancelled. Please contact support if you believe this is an error.
           </p>
        </div>
      </div>
    );
  }

  // 3. CHECK FOR PENDING CONFIRMATION
  if (appointment.status !== 'confirmed' && appointment.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <h1 className="text-3xl font-bold text-yellow-600 mb-4">Pending Confirmation </h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             The session has not yet been confirmed by our admins. Check your WhatsApp for updates!
           </p>
        </div>
      </div>
    );
  }

  const start = new Date(appointment.start_time).getTime();
  const now = new Date().getTime();
  const diffHours = (now - start) / (1000 * 60 * 60);

  if (diffHours < -0.5) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
         <div className="max-w-md">
           <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">You're a bit early!</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This session has not started yet.<br/>The secure meeting room will unlock <strong>30 minutes</strong> before your scheduled time.
           </p>
         </div>
      </div>
    );
  }

  if (diffHours > 6) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FEFEFC] font-georgia text-center p-8">
        <div className="max-w-md">
           <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
           </div>
           <h1 className="text-3xl font-bold text-gray-900 mb-4">Session Expired</h1>
           <p className="text-gray-600 font-nunito leading-relaxed">
             This session link has securely expired. UnHeard meeting links are strictly valid for only <strong>6 hours</strong> after the scheduled start time to protect your privacy and ensure exclusivity.
           </p>
        </div>
      </div>
    );
  }

  // LOG JOIN EVENT
  const userType = type;
  // Ensure we only log and notify for ACTIVE sessions
  if ((userType === 'patient' || userType === 'therapist') && (appointment.status === 'confirmed' || appointment.status === 'approved')) {
    // 1. Create a detailed audit log entry
    await adminSupabase.from('session_logs').insert([{
        appointment_id: id,
        user_type: userType,
        event_type: 'join'
    }]);

    // 2. Also update the convenience columns on appointments for quick dashboard UI
    const updateColumn = userType === 'patient' ? 'joined_at_patient' : 'joined_at_therapist';
    
    if (!appointment[updateColumn]) {
        await adminSupabase
          .from('appointments')
          .update({ [updateColumn]: new Date().toISOString() })
          .eq('id', id);
    }

    // 3. WHATSAPP NOTIFICATIONS: Triggered on FIRST join of each party
    const redirectBase = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in'}/api/room-redirect/${id}`;

    if (userType === 'therapist' && !appointment.joined_at_therapist && appointment.guest_phone) {
       // Notify Patient that therapist has arrived
       const { data: tProfile } = await adminSupabase.from('therapist_profiles').select('full_name').eq('user_id', appointment.therapist_id).single();
       const therapistName = tProfile?.full_name || 'Your therapist';
       const pRoomLink = `${redirectBase}?type=patient`;
       const pMsg = `*Therapist has joined the room!* 🩺\n\nHi ${appointment.guest_name || ''}, Dr. ${therapistName} is waiting for you in the session room.\n\n🔗 *Join Room Now:* ${pRoomLink}\n\nPlease join immediately to begin your session.\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;
       await WhatsAppManager.enqueueMessage(appointment.guest_phone, pMsg);
       // Trigger queue processing
       fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in'}/api/whatsapp/process-queue`).catch(() => {});
    } 
    
    if (userType === 'patient' && !appointment.joined_at_patient && appointment.therapist_id) {
       // Notify Therapist that patient has arrived
       const { data: tProfile } = await adminSupabase.from('therapist_profiles').select('full_name, phone').eq('user_id', appointment.therapist_id).single();
       if (tProfile?.phone) {
          const patientName = appointment.guest_name || 'Your patient';
          const tRoomLink = `${redirectBase}?type=therapist`;
          const tMsg = `*Patient has joined the room!* 👤\n\n ${tProfile.full_name}, your patient *${patientName}* has entered the session room and is waiting.\n\n🔗 *Join Session Now:* ${tRoomLink}\n\n💡 *Note:* If links are not clickable, please reply with a "Hi" to this message.`;
          await Promise.all([
            NotificationController.sendWhatsApp(tProfile.phone, tMsg),
            NotificationController.sendPush(
              tProfile.phone, 
              'Patient Joined! 👤', 
              `${patientName} has entered the session room and is waiting.`, 
              tRoomLink
            )
          ]);
          // Trigger queue processing
          fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in'}/api/whatsapp/process-queue`).catch(() => {});
       }
    }

    // Log Therapist Entry in Admin Logs
    if (userType === 'therapist') {
       const { data: { user } } = await adminSupabase.auth.getUser();
       if (user) {
         await logAdminActivity(user.id, 'meeting_join', id, { role: 'therapist' });
       }
    }
  }

  // If therapist, redirect immediately
  if (type === 'therapist') {
    redirect(appointment.meeting_link || `https://meet.jit.si/unHeard-Session-${id.substring(0,8)}`);
  }

  // If patient, show the "Check-in" gate
  const { data: q } = appointment.pre_booking_id ? 
    await adminSupabase.from('pre_booking_questionnaires').select('guest_email').eq('id', appointment.pre_booking_id).single() : 
    { data: null };

  const displayEmail = q?.guest_email || 'the email used during booking';

  return (
    <div className="min-h-screen bg-[#FEFEFC] flex items-center justify-center p-6 font-nunito">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 text-center">
        <div className="w-20 h-20 bg-[#0F9393]/10 rounded-full flex items-center justify-center mx-auto mb-8">
           <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0F9393" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-georgia">Secure Check-in</h1>
        <p className="text-gray-500 mb-8 text-sm">Welcome back, {appointment.guest_name || 'there'}.</p>
        
        <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100 text-left">
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#0F9393] mb-1">Registered Email</p>
          <p className="text-[15px] font-bold text-gray-800 break-all">{displayEmail}</p>
        </div>

        <div className="flex flex-col gap-4">
          <a 
            href={appointment.meeting_link || '#'} 
            className="w-full bg-black text-white rounded-3xl py-5 font-bold uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all block"
          >
            Enter Session Room
          </a>
          
          <div className="flex items-center gap-3 justify-center text-xs text-gray-400 mt-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <p>Please join using your registered Google account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
