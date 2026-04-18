'use server'

import { createClient } from '@/utils/supabase/server'
import { mailer } from '@/lib/mailer'
import { revalidatePath } from 'next/cache'

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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('therapist_profiles')
    .upsert({
      user_id: user.id,
      ...formData
    })

  if (error) throw error
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Clear existing and insert new
  await supabase
    .from('therapist_availability')
    .delete()
    .eq('therapist_id', user.id)

  const { error } = await supabase
    .from('therapist_availability')
    .insert(
      availability.map(a => ({ ...a, therapist_id: user.id }))
    )

  if (error) throw error
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
  const { error } = await supabase
    .from('contact_inquiries')
    .insert([data])

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

/**
 * BOOKING & TRIAL SESSIONS
 * Now handles availability validation, overlap detection, guest data, and WhatsApp alerts.
 */
export async function requestSession(data: {
  therapist_id: string;
  start_time: string;
  is_trial: boolean;
  questionnaire: any;
  phone: string; 
  patient_details?: { name: string; email: string };
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. FORMAT & VALIDATE DATE
  const start = new Date(data.start_time)
  const duration = data.is_trial ? 30 : 60
  const end = new Date(start.getTime() + duration * 60000)
  const dayOfWeek = start.getDay()
  const timeStr = start.toTimeString().split(' ')[0] 

  // 2. AVAILABILITY GUARD
  const { data: allRules } = await supabase
    .from('therapist_availability')
    .select('id')
    .eq('therapist_id', data.therapist_id)
    .limit(1)

  if (allRules && allRules.length > 0) {
    const { data: slot, error: slotError } = await supabase
      .from('therapist_availability')
      .select('*')
      .eq('therapist_id', data.therapist_id)
      .eq('day_of_week', dayOfWeek)
      .lte('start_time', timeStr)
      .gte('end_time', timeStr)
      .eq('is_available', true)
      .maybeSingle()

    if (slotError || !slot) {
      throw new Error('Selected therapist is not available at this specific time slot based on their calendar.')
    }
  }

  // 3. OVERLAP GUARD
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('therapist_id', data.therapist_id)
    .neq('status', 'cancelled')
    .lt('start_time', end.toISOString())
    .gt('end_time', start.toISOString())
    .maybeSingle()

  if (existing) {
    throw new Error('This time slot has already been booked. Please select another time.')
  }

  // 4. CREATE APPOINTMENT (Hybrid Auth/Guest)
  const appointmentPayload: any = {
    therapist_id: data.therapist_id,
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    is_trial: data.is_trial,
    status: 'pending'
  }

  if (user) {
    appointmentPayload.patient_id = user.id
  } else {
    appointmentPayload.guest_name = data.patient_details?.name || 'Guest'
    appointmentPayload.guest_email = data.patient_details?.email || ''
    appointmentPayload.guest_phone = data.phone
  }

  const { data: appointment, error: aptError } = await supabase
    .from('appointments')
    .insert([appointmentPayload])
    .select()
    .single()

  if (aptError) throw aptError

  // 5. SAVE QUESTIONNAIRE
  const { error: qError } = await supabase
    .from('pre_booking_questionnaires')
    .insert([{
      appointment_id: appointment.id,
      answers: data.questionnaire
    }])

  if (qError) throw qError

  // 6. WHATSAPP NOTIFICATIONS
  const formattedDate = start.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const formattedTime = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  const displayName = user?.user_metadata?.full_name || data.patient_details?.name || 'there'

  // A. Notify Patient
  if (data.phone) {
    const patientMsg = `*Booking Requested!* 🧘‍♀️\n\nHi ${displayName}, your session has been requested for *${formattedDate}* at *${formattedTime}*.\n\nWe will notify you once the therapist confirms the slot.`
    await WhatsAppManager.sendMessage(data.phone, patientMsg)
  }

  // B. Notify Therapist
  const { data: therapistProfile } = await supabase
    .from('therapist_profiles')
    .select('full_name, phone')
    .eq('user_id', data.therapist_id)
    .single()

  if (therapistProfile?.phone) {
    const therapistMsg = `*New Booking Alert!* 🔔\n\nDr. ${therapistProfile.full_name}, you have a new ${data.is_trial ? 'Trial' : 'Standard'} session request from *${displayName}* for *${formattedDate}* at *${formattedTime}*.\n\nPlease log in to confirm the appointment.`
    await WhatsAppManager.sendMessage(therapistProfile.phone, therapistMsg)
  }

  revalidatePath('/admin/dashboard')
  return { success: true, appointmentId: appointment.id }
}
