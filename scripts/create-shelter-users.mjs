import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhkjbziuaotvuwviyouj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const SHELTERS = [
  {
    shelter_id: '44444444-4444-4444-4444-444444444444',
    email: 'coquitlam@test.com',
    password: 'Test1234',
    name: 'Coquitlam Shelter Owner',
  },
  {
    shelter_id: '55555555-5555-5555-5555-555555555555',
    email: 'richmond@test.com',
    password: 'Test1234',
    name: 'Richmond Shelter Owner',
  },
  {
    shelter_id: '66666666-6666-6666-6666-666666666666',
    email: 'langley@test.com',
    password: 'Test1234',
    name: 'Langley Shelter Owner',
  },
  {
    shelter_id: '77777777-7777-7777-7777-777777777777',
    email: 'delta@test.com',
    password: 'Test1234',
    name: 'Delta Shelter Owner',
  },
];

for (const s of SHELTERS) {
  console.log(`\nCreating user: ${s.email}`);

  // 1. Create auth user (auto-confirmed)
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: s.email,
    password: s.password,
    email_confirm: true,
    user_metadata: { name: s.name, role: 'shelter' },
  });

  if (authErr) {
    console.error(`  Auth error: ${authErr.message}`);
    continue;
  }

  const userId = authData.user.id;
  console.log(`  User created: ${userId}`);

  // 2. Update profile to shelter role (trigger should have created it)
  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ role: 'shelter', name: s.name })
    .eq('id', userId);

  if (profileErr) {
    console.error(`  Profile update error: ${profileErr.message}`);
  } else {
    console.log(`  Profile set to shelter role.`);
  }

  // 3. Link shelter to this user
  const { error: shelterErr } = await supabase
    .from('shelters')
    .update({ owner_user_id: userId })
    .eq('id', s.shelter_id);

  if (shelterErr) {
    console.error(`  Shelter link error: ${shelterErr.message}`);
  } else {
    console.log(`  Linked to shelter ${s.shelter_id}`);
  }
}

console.log('\n=== Done! ===');
console.log('\nLogin credentials (password for all: Test1234):');
SHELTERS.forEach((s) => console.log(`  ${s.email}`));
