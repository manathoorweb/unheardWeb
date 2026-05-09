const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://voozpnzzhsoabmonkfxl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3pwbnp6aHNvYWJtb25rZnhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDA3MDczNCwiZXhwIjoyMDg5NjQ2NzM0fQ.ctTMCspAEyyxVLnTYbCm0qIJFoGI1aCNy2EN2nyJAkI'
)

async function updateProfile() {
  const { data, error } = await supabase
    .from('therapist_profiles')
    .update({
      qualification: 'M.Sc. Counselling Psychology',
      microtag: 'Clarity & Direction',
      tagline: 'For when you’re feeling stuck between choices and need a way forward.',
      bio: 'Her work focuses on decision-making, life transitions, and professional or personal direction. She supports clients in building clarity, strengthening problem-solving, and navigating change with intention. Her approach is structured yet flexible, combining counselling frameworks with practical, real-world application to create sustainable progress.',
      good_fit_for: [
        'Career decisions and early-career uncertainty',
        'Life transitions and change management',
        'Overthinking and difficulty making decisions',
        'Those seeking structured, actionable clarity'
      ]
    })
    .eq('user_id', '2e2ee164-2458-466a-9393-e58e6eb58216')

  if (error) console.error('Error updating profile:', error)
  else console.log('Profile updated successfully!')
}

updateProfile()
