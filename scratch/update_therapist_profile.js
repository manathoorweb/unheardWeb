const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://voozpnzzhsoabmonkfxl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3pwbnp6aHNvYWJtb25rZnhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA3MDczNCwiZXhwIjoyMDg5NjQ2NzM0fQ.ctTMCspAEyyxVLnTYbCm0qIJFoGI1aCNy2EN2nyJAkI'
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
