const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'));
const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('therapist_profiles').update({
    microtag: "Beyond patterns",
    tagline: "For when you’re ready to understand what’s really driving your patterns.",
    bio: "Her work focuses on emotional patterns, self-perception, and relational dynamics, with particular attention to the internal processes that sustain them. She works with anxiety, mood disturbances, identity concerns, and recurring patterns that often persist despite conscious awareness or prior attempts at change.\n\nGrounded in psychotherapy, her approach is depth-oriented and analytically informed, examining how early experiences, attachment patterns, and internal conflicts continue to shape present-day functioning. The work emphasises developing psychological insight, emotional differentiation and accuracy with greater coherence while integrating meaningful shifts.",
    good_fit_for: [
      "Recurring emotional or relational patterns",
      "Self-worth, identity, and inner conflict",
      "Anxiety, overthinking, and emotional complexity",
      "Adolescents and adults navigating personal, relational, or academic and professional challenges",
      "Those seeking deeper, insight-oriented therapy beyond surface-level coping"
    ]
  }).eq('user_id', '7e52da92-a36b-4813-ae82-80fccdaea64d').select();

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Success:", data);
  }
}

run();
