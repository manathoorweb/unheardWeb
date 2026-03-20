import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { resend } from '@/lib/resend'

export async function POST(request: Request) {
  const supabase = await createClient()

  // 1. Check if the current user is a Super Admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (roleData?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name } = await request.json()

  if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })

  // 2. We use Supabase Auth Admin API (Service Role) to create a user with a temp password
  // (In a real production app, you might just send an invite link using Supabase internal invite)
  // For this case, we will use Resend to send a custom "Unheard" branded invitation.

  // NOTE: To use Supabase Admin API, we'd need a separate server client initialized with SERVICE_ROLE_KEY
  // For now, let's assume we're just sending the email via Resend to lead them to a registration page.

  const inviteLink = `${new URL(request.url).origin}/login?invite=true&email=${encodeURIComponent(email)}`

  try {
    const { data, error } = await resend.emails.send({
      from: 'Unheard <onboarding@unheard.care>',
      to: [email],
      subject: 'Invite: Join the Unheard Therapist Team',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0F9393;">Welcome to unHeard.</h2>
          <p>Hi ${full_name || 'there'},</p>
          <p>You have been invited to join unHeard as a specialized therapist (Admin).</p>
          <p>Please click the link below to complete your onboarding and set up your public profile:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">Complete Onboarding</a>
          <p style="margin-top: 20px; font-size: 14px; color: #666;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}
