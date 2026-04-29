import { createClient, createAdminClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NotificationController } from '@/lib/notifications/NotificationController'
import { normalizePhone } from '@/utils/phone'

export async function POST(request: Request) {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()

  // 1. Check if the current user is a Super Admin
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', currentUser.id)
    .single()

  if (roleData?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { email, full_name, phone_number } = await request.json()

  if (!email || !phone_number) return NextResponse.json({ error: 'Email and Phone number are required' }, { status: 400 })

  const formattedPhone = normalizePhone(phone_number)

  let user;
  const { data: userData, error: userError } = await adminSupabase.auth.admin.createUser({
    email,
    phone: formattedPhone,
    email_confirm: true,
    phone_confirm: true,
    user_metadata: { full_name }
  });

  if (userError && userError.message.toLowerCase().includes('already registered')) {
      const { data: userList } = await adminSupabase.auth.admin.listUsers();
      user = userList.users.find(u => u.email === email || u.phone === formattedPhone || u.phone === formattedPhone.replace('+', ''));
  } else {
      user = userData?.user;
  }

  if (!user) {
      return NextResponse.json({ error: 'Could not create or resolve user account.' }, { status: 500 });
  }

  // 3. Insert or update user_roles and therapist_profiles
  await adminSupabase.from('user_roles').upsert({
    user_id: user.id,
    role: 'admin',
    is_therapist: true,
    phone_number: formattedPhone
  }, { onConflict: 'user_id' });

  await adminSupabase.from('therapist_profiles').upsert({
    user_id: user.id,
    full_name: full_name || 'New Therapist',
    phone: formattedPhone
  }, { onConflict: 'user_id' });

  const inviteLink = `${new URL(request.url).origin}/login`
  
  await NotificationController.notifyTherapistInvite({
    email,
    phone: formattedPhone,
    name: full_name,
    inviteLink
  });

  return NextResponse.json({ success: true })
}
