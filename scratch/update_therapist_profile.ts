import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function updateProfile() {
  const { data, error } = await supabase
    .from('therapist_profiles')
    .update({
      qualification: 'M.Sc. Clinical Psychology',
      microtag: 'Gentle Support',
      tagline: 'For when things feel overwhelming, but hard to put into words.',
      bio: 'Works with anxiety, self-worth, emotional overwhelm, and relationship concerns. Her space is steady, supportive and non-judgemental. Clients can begin wherever they are, without pressure to articulate everything clearly.',
      good_fit_for: [
        'Anxiety, low mood, and emotional overwhelm',
        'Self-esteem and self-compassion work',
        'Relationship and family concerns',
        'Children on the autism spectrum'
      ]
    })
    .eq('user_id', '769132a4-be29-4569-bff9-127e05a9fe1e')

  if (error) console.error('Error updating profile:', error)
  else console.log('Profile updated successfully!')
}

updateProfile()
