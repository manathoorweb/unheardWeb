'use server'
import { normalizePhone } from '@/utils/phone'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { mailer } from '@/lib/mailer'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

/**
 * THERAPIST ONBOARDING & PROFILE
 */
export async function updateTherapistProfile(formData: {
  full_name: string;
  bio: string;
  qualification: string;
  specialties: string[];
  avatar_url?: string;
}) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await adminSupabase
    .from('therapist_profiles')
    .upsert({
      user_id: user.id,
      ...formData
    })

  if (error) {
    console.error('DATABASE ERROR [profile]:', error)
    throw error
  }

  // Also ensure they have the proper role
  await adminSupabase.from('user_roles').upsert({ user_id: user.id, role: 'admin' })
  revalidatePath('/admin/dashboard')
}

/**
 * SCHEDULING ENGINE: SET AVAILABILITY
 */
export async function setTherapistAvailability(availability: {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}[]) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Clear existing and insert new
  await adminSupabase
    .from('therapist_availability')
    .delete()
    .eq('therapist_id', user.id)

  const { error } = await adminSupabase
    .from('therapist_availability')
    .insert(
      availability.map(a => ({ ...a, therapist_id: user.id }))
    )

  if (error) {
    console.error('DATABASE ERROR [availability]:', error)
    throw error
  }
  revalidatePath('/admin/dashboard')
}

/**
 * CONTACT US HANDLING
 */
export async function submitContactInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  const supabase = await createClient()

  // 1. Save to DB
  const insertData = { ...data };
  if (insertData.phone) {
    insertData.phone = normalizePhone(insertData.phone);
  }

  const { error } = await supabase
    .from('contact_inquiries')
    .insert([insertData])

  if (error) throw error

  // 2. Notify via Email using Nodemailer
  await mailer.sendMail({
    from: '"unHeard" <notifications@unheard.care>',
    to: 'support@unheard.care', // Company email
    subject: `New Inquiry from ${data.name}`,
    html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Message:</strong> ${data.message}</p>`
  })

  return { success: true }
}

import { WhatsAppManager } from './whatsapp/WhatsAppClient'
import { IdentityManager } from './identity/IdentityManager'

/**
 * HELPERS (Moved to utils/phone.ts)
 */

/**
 * BOOKING & TRIAL SESSIONS
 */
export async function requestSession(data: {
  therapist_id?: string;
  start_time: string;
  is_trial: boolean;
  questionnaire: any;
  phone: string; 
  deviceId?: string;
  patient_details?: { name: string; email: string };
}) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 0. NORMALIZE PHONE
    const cleanPhone = normalizePhone(data.phone)

    // 1. FORMAT & VALIDATE DATE
  const start = new Date(data.start_time)
  const duration = data.is_trial ? 30 : 60
  const end = new Date(start.getTime() + duration * 60000)
  const dayOfWeek = start.getDay()
  const timeStr = start.toTimeString().split(' ')[0] 
  
  // 1.2 GET CLIENT IP
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    // 1.5. OTP VERIFICATION GUARD (For guests)
    // 1.5. RESOLVE IDENTITY (ROBUST TRACKING)
    const identity = await IdentityManager.resolveIdentity(cleanPhone, data.deviceId, user?.id);

    // 1.6. OTP VERIFICATION GUARD (For guests)
    if (!user) {
      const { data: otpVerified, error: otpError } = await adminSupabase
        .from('booking_otps')
        .select('id')
        .eq('phone_number', data.phone)
        .eq('verified', true)
        .gte('created_at', new Date(Date.now() - 15 * 60000).toISOString())
        .limit(1)
        .maybeSingle();

      if (otpError || !otpVerified) {
        return { success: false, error: 'Verification required. Please verify your phone number via OTP before booking.' };
      }
    }

    // 1.7 ANTI-EXPLOIT (Identity-based Trial Protection)
    if (data.is_trial && identity?.is_trial_claimed) {
      return { 
        success: false, 
        error: 'Our records indicate that you (or this device) have already claimed a free consultation. Please select a standard session.' 
      };
    }

  // 2. AVAILABILITY GUARD
  if (data.therapist_id) {
    const { data: allRules } = await adminSupabase
      .from('therapist_availability')
      .select('id')
      .eq('therapist_id', data.therapist_id)
      .limit(1)

    if (allRules && allRules.length > 0) {
      const { data: slot, error: slotError } = await adminSupabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', data.therapist_id)
        .eq('day_of_week', dayOfWeek)
        .lte('start_time', timeStr)
        .gte('end_time', timeStr)
        .eq('is_available', true)
        .maybeSingle()

      if ((slotError || !slot) && !(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost'))) {
        return { success: false, error: 'Selected therapist is not available at this specific time slot.' }
      }
    }
  }

  // 3. OVERLAP GUARD
  if (data.therapist_id) {
    const { data: existing } = await adminSupabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', data.therapist_id)
      .neq('status', 'cancelled')
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString())
      .maybeSingle()

    if (existing && !(process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SITE_URL?.includes('localhost'))) {
      return { success: false, error: 'This time slot has already been booked. Please select another time.' }
    }
  }

  // 4. CREATE PENDING QUESTIONNAIRE (Primary Entry Point)
  const questionnairePayload: any = {
    patient_id: user?.id || null,
    guest_name: data.patient_details?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || 'Guest',
    guest_phone: cleanPhone,
    guest_email: data.patient_details?.email || user?.email || '',
    requested_start_time: start.toISOString(),
    is_trial: data.is_trial,
    status: 'pending',
    answers: {
      ...data.questionnaire,
      ip_address: ip
    }
  }

  const { data: questionnaire, error: qError } = await adminSupabase
    .from('pre_booking_questionnaires')
    .insert([questionnairePayload])
    .select()
    .single()

    if (qError) {
      console.error('DATABASE ERROR [questionnaire]:', qError)
      return { success: false, error: 'Database error: Could not save session request.' }
    }

  // 6. WHATSAPP NOTIFICATIONS
  try {
    const formattedDate = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    const formattedTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

    const displayName = user?.user_metadata?.full_name || data.patient_details?.name || 'there'

    // A. Notify Patient
    if (data.phone) {
      const patientMsg = `*Registration Under Review!* 🧘‍♀️\n\nHi ${displayName}, we have successfully received your session request for *${formattedDate}* at *${formattedTime}*.\n\nYour problems are being carefully assessed by a real human expert to ensure you get the most appropriate care. We are currently matching you and assigning the best therapist for your specific needs.\n\nYou will receive an update confirming your assigned therapist within *30 mins*.\n\nFor any issues, please contact +919606083755.\n\nThanks, and take care!`;
      await WhatsAppManager.enqueueMessage(data.phone, patientMsg);
      
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in');
      await fetch(`${baseUrl}/api/whatsapp/process-queue`).catch(console.error);
    }

    // B. Notify Super Admin
    const { data: superAdmins } = await adminSupabase.from('user_roles').select('phone_number').eq('role', 'super_admin');
    if (superAdmins && superAdmins.length > 0) {
      const adminMsg = `*New Session Request!* 🚨\n\n*${displayName}* (${cleanPhone}) has just submitted a new session request for ${formattedDate} at ${formattedTime}.\n\nPlease check the admin dashboard to review and assign a therapist.`;
      for (const admin of superAdmins) {
        if (admin.phone_number) {
          await WhatsAppManager.enqueueMessage(admin.phone_number, adminMsg);
        }
      }
    }
  } catch (error) {
    console.error('Non-blocking WhatsApp Notification Error:', error)
  }

    // 7. RECORD IDENTITY UPDATE & COUPON CLAIM
    if (identity) {
      await IdentityManager.claimCoupon(identity.id, data.is_trial ? 'FREE_TRIAL' : 'STANDARD', data.is_trial);
    }

    revalidatePath('/super-admin')
    return { success: true, questionnaireId: questionnaire.id }
  } catch (error: any) {
    console.error('CRITICAL SESSION REQUEST ERROR:', error)
    return { success: false, error: error.message || 'An unexpected internal error occurred.' }
  }
}

// ----------------------------------------------------------------------------
// ERROR REPORTING ACTION
// ----------------------------------------------------------------------------
export async function reportClientError(errorMessage: string, context: string) {
  try {
    const adminSupabase = await createAdminClient();
    
    // 1. Fetch super admins
    const { data: superAdmins } = await adminSupabase.from('user_roles').select('phone_number').eq('role', 'super_admin');
    
    if (superAdmins && superAdmins.length > 0) {
      const adminMsg = `*Critical Client Error!* 🚨\n\n*Context:* ${context}\n*Error:* ${errorMessage}\n\nPlease check the logs or debug the client flow.`;
      
      for (const admin of superAdmins) {
        if (admin.phone_number) {
          await WhatsAppManager.enqueueMessage(admin.phone_number, adminMsg);
        }
      }

      // 2. Trigger Queue
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.unheard.co.in');
      await fetch(`${baseUrl}/api/whatsapp/process-queue`).catch(console.error);
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to report client error:', err);
    return { success: false };
  }
}
