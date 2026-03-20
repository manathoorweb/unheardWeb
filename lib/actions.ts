'use server'

import { createClient } from '@/utils/supabase/server'
import { resend } from '@/lib/resend'
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

  // 2. Notify via Email using Resend
  await resend.emails.send({
    from: 'Unheard <notifications@unheard.care>',
    to: ['support@unheard.care'], // Company email
    subject: `New Inquiry from ${data.name}`,
    html: `<p><strong>Name:</strong> ${data.name}</p><p><strong>Message:</strong> ${data.message}</p>`
  })

  return { success: true }
}

/**
 * BOOKING & TRIAL SESSIONS
 */
export async function requestSession(data: {
  therapist_id: string;
  start_time: string;
  is_trial: boolean;
  questionnaire: any;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Login required to book')

  // Calculate end_time (30m or 60m based on trial)
  const duration = data.is_trial ? 30 : 60
  const start = new Date(data.start_time)
  const end = new Date(start.getTime() + duration * 60000)

  // 1. Create Appointment
  const { data: appointment, error: aptError } = await supabase
    .from('appointments')
    .insert([{
      patient_id: user.id,
      therapist_id: data.therapist_id,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      is_trial: data.is_trial,
      status: 'pending'
    }])
    .select()
    .single()

  if (aptError) throw aptError

  // 2. Save Questionnaire
  const { error: qError } = await supabase
    .from('pre_booking_questionnaires')
    .insert([{
      appointment_id: appointment.id,
      answers: data.questionnaire
    }])

  if (qError) throw qError

  return { success: true, appointmentId: appointment.id }
}
