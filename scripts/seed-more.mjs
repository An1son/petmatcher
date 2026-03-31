import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhkjbziuaotvuwviyouj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Shelter owner placeholder ID (same as seed.sql)
const OWNER_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

const NEW_SHELTERS = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    owner_user_id: OWNER_ID,
    name: 'Fur-Ever Friends Rescue',
    email: 'info@fureverfriends.ca',
    phone: '604-555-1234',
    address: '210 Pinetree Way',
    city: 'Coquitlam',
    province: 'BC',
    website_url: 'https://fureverfriends.ca',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    owner_user_id: OWNER_ID,
    name: 'Pacific Paws Sanctuary',
    email: 'adopt@pacificpaws.ca',
    phone: '604-555-5678',
    address: '8100 No. 3 Road',
    city: 'Richmond',
    province: 'BC',
    website_url: 'https://pacificpaws.ca',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    owner_user_id: OWNER_ID,
    name: 'Valley Animal Rescue',
    email: 'hello@valleyanimalrescue.ca',
    phone: '604-555-9012',
    address: '5501 204th Street',
    city: 'Langley',
    province: 'BC',
    website_url: 'https://valleyanimalrescue.ca',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    owner_user_id: OWNER_ID,
    name: 'Delta Pet Haven',
    email: 'info@deltapethaven.ca',
    phone: '604-555-3456',
    address: '4920 Ladner Trunk Road',
    city: 'Delta',
    province: 'BC',
    website_url: 'https://deltapethaven.ca',
  },
];

// Each pet has an unsplash source URL to download from
const NEW_PETS = [
  // --- Fur-Ever Friends Rescue (Coquitlam) ---
  {
    shelter_id: '44444444-4444-4444-4444-444444444444',
    name: 'Mocha',
    species: 'dog',
    breed: 'Chocolate Labrador',
    age_years: 3,
    size: 'large',
    sex: 'female',
    energy_level: 'medium',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Mocha is a sweet Chocolate Lab who loves swimming and playing fetch. She has a calm temperament indoors and gets along with everyone.',
    city: 'Coquitlam',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1579213838058-4a5765f049f5?w=600',
  },
  {
    shelter_id: '44444444-4444-4444-4444-444444444444',
    name: 'Simba',
    species: 'cat',
    breed: 'Orange Tabby',
    age_years: 1,
    size: 'medium',
    sex: 'male',
    energy_level: 'high',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Simba is a playful orange tabby kitten who loves chasing laser pointers and climbing everything in sight. Full of energy and affection!',
    city: 'Coquitlam',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1570824104453-508955ab713e?w=600',
  },
  {
    shelter_id: '44444444-4444-4444-4444-444444444444',
    name: 'Pearl',
    species: 'rabbit',
    breed: 'Angora',
    age_years: 2,
    size: 'small',
    sex: 'female',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: false,
    description: 'Pearl is a fluffy white Angora rabbit with the softest fur. She enjoys gentle handling and quiet environments.',
    city: 'Coquitlam',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1535241749838-299277c6fc2e?w=600',
  },
  {
    shelter_id: '44444444-4444-4444-4444-444444444444',
    name: 'Zeus',
    species: 'dog',
    breed: 'Great Dane',
    age_years: 4,
    size: 'large',
    sex: 'male',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Zeus is a gentle giant who thinks he is a lap dog. Despite his size he is incredibly calm and loves nothing more than a cozy nap on the couch.',
    city: 'Coquitlam',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=600',
  },

  // --- Pacific Paws Sanctuary (Richmond) ---
  {
    shelter_id: '55555555-5555-5555-5555-555555555555',
    name: 'Rosie',
    species: 'dog',
    breed: 'Shih Tzu',
    age_years: 5,
    size: 'small',
    sex: 'female',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Rosie is a sweet little Shih Tzu who loves lap time and short walks around the block. Perfect for apartment living!',
    city: 'Richmond',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1596797882870-8c33deeac224?w=600',
  },
  {
    shelter_id: '55555555-5555-5555-5555-555555555555',
    name: 'Jasper',
    species: 'cat',
    breed: 'Russian Blue',
    age_years: 3,
    size: 'medium',
    sex: 'male',
    energy_level: 'medium',
    good_with_kids: false,
    good_with_pets: false,
    description: 'Jasper is an elegant Russian Blue with shimmering grey fur. He is independent but bonds deeply with his person. Best as an only pet in an adult home.',
    city: 'Richmond',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1568043210943-1f5e75df39a0?w=600',
  },
  {
    shelter_id: '55555555-5555-5555-5555-555555555555',
    name: 'Scout',
    species: 'dog',
    breed: 'Australian Shepherd',
    age_years: 2,
    size: 'medium',
    sex: 'male',
    energy_level: 'high',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Scout is a stunning Aussie with a merle coat and boundless energy. He excels at agility and needs an active family who loves the outdoors.',
    city: 'Richmond',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1605897472476-c24324e4b246?w=600',
  },
  {
    shelter_id: '55555555-5555-5555-5555-555555555555',
    name: 'Nala',
    species: 'cat',
    breed: 'Bengal',
    age_years: 2,
    size: 'medium',
    sex: 'female',
    energy_level: 'high',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Nala is a gorgeous Bengal with leopard-like spots. She is incredibly playful and loves interactive toys. Very social and vocal!',
    city: 'Richmond',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1598463166228-c0d803a0d228?w=600',
  },

  // --- Valley Animal Rescue (Langley) ---
  {
    shelter_id: '66666666-6666-6666-6666-666666666666',
    name: 'Bear',
    species: 'dog',
    breed: 'Bernese Mountain Dog',
    age_years: 3,
    size: 'large',
    sex: 'male',
    energy_level: 'medium',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Bear is a lovable Bernese Mountain Dog with a gorgeous tri-color coat. He enjoys moderate hikes and is wonderful with children.',
    city: 'Langley',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1587628736664-fdc50efb57b7?w=600',
  },
  {
    shelter_id: '66666666-6666-6666-6666-666666666666',
    name: 'Olive',
    species: 'cat',
    breed: 'Calico',
    age_years: 4,
    size: 'medium',
    sex: 'female',
    energy_level: 'medium',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Olive is a beautiful calico with a patchwork coat of orange, black, and white. She is curious, social, and loves window-watching.',
    city: 'Langley',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600',
  },
  {
    shelter_id: '66666666-6666-6666-6666-666666666666',
    name: 'Patches',
    species: 'rabbit',
    breed: 'Mini Rex',
    age_years: 1,
    size: 'small',
    sex: 'male',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Patches is a velvety Mini Rex rabbit with adorable spotted markings. He loves to be held and will nudge your hand for pets.',
    city: 'Langley',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1518882104687-2c7e9e5e3795?w=600',
  },
  {
    shelter_id: '66666666-6666-6666-6666-666666666666',
    name: 'Willow',
    species: 'dog',
    breed: 'Border Collie',
    age_years: 2,
    size: 'medium',
    sex: 'female',
    energy_level: 'high',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Willow is a brilliant Border Collie who loves to learn new tricks and play frisbee. She needs plenty of mental stimulation and exercise.',
    city: 'Langley',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=600',
  },

  // --- Delta Pet Haven (Delta) ---
  {
    shelter_id: '77777777-7777-7777-7777-777777777777',
    name: 'Maple',
    species: 'dog',
    breed: 'Siberian Husky',
    age_years: 3,
    size: 'large',
    sex: 'female',
    energy_level: 'high',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Maple is a stunning Husky with bright blue eyes. She loves long runs, snowy days, and will howl along to your favorite songs!',
    city: 'Delta',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?w=600',
  },
  {
    shelter_id: '77777777-7777-7777-7777-777777777777',
    name: 'Mochi',
    species: 'cat',
    breed: 'Scottish Fold',
    age_years: 2,
    size: 'small',
    sex: 'female',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Mochi is an adorable Scottish Fold with folded ears and big round eyes. She is quiet, cuddly, and perfect for a calm household.',
    city: 'Delta',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600',
  },
  {
    shelter_id: '77777777-7777-7777-7777-777777777777',
    name: 'Thor',
    species: 'dog',
    breed: 'Rottweiler',
    age_years: 4,
    size: 'large',
    sex: 'male',
    energy_level: 'high',
    good_with_kids: false,
    good_with_pets: false,
    description: 'Thor is a powerful and loyal Rottweiler looking for an experienced owner. He is protective, well-trained, and thrives with structure.',
    city: 'Delta',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1567752881298-894bb81f9379?w=600',
  },
  {
    shelter_id: '77777777-7777-7777-7777-777777777777',
    name: 'Biscuit',
    species: 'rabbit',
    breed: 'Lionhead',
    age_years: 1,
    size: 'small',
    sex: 'male',
    energy_level: 'low',
    good_with_kids: true,
    good_with_pets: true,
    description: 'Biscuit is a fluffy Lionhead rabbit with a mane that makes him look like a tiny lion. He is gentle, curious, and loves fresh herbs.',
    city: 'Delta',
    province: 'BC',
    image_url: 'https://images.unsplash.com/photo-1591382696684-38c427c7547a?w=600',
  },
];

async function downloadImage(url) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  return { buffer, contentType };
}

async function uploadToStorage(buffer, contentType, petName) {
  const ext = contentType.includes('png') ? 'png' : 'jpg';
  const fileName = `pets/${Date.now()}-${petName.toLowerCase().replace(/\s/g, '-')}.${ext}`;

  const { data, error } = await supabase.storage
    .from('pet-photos')
    .upload(fileName, buffer, {
      contentType,
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

async function main() {
  console.log('=== Seeding new shelters and pets ===\n');

  // 1. Insert shelters
  console.log('Inserting shelters...');
  const { error: shelterErr } = await supabase
    .from('shelters')
    .upsert(NEW_SHELTERS, { onConflict: 'id' });

  if (shelterErr) {
    console.error('Error inserting shelters:', shelterErr);
    process.exit(1);
  }
  console.log(`  Inserted ${NEW_SHELTERS.length} shelters.\n`);

  // 2. Download images, upload to storage, insert pets
  console.log('Processing pets...');
  for (const pet of NEW_PETS) {
    const { image_url, ...petData } = pet;
    try {
      console.log(`  ${pet.name} (${pet.breed}) - downloading image...`);
      const { buffer, contentType } = await downloadImage(image_url);

      console.log(`  ${pet.name} - uploading to storage...`);
      const publicUrl = await uploadToStorage(buffer, contentType, pet.name);

      console.log(`  ${pet.name} - inserting into database...`);
      const { error: petErr } = await supabase.from('pets').insert({
        ...petData,
        photos: [publicUrl],
      });

      if (petErr) {
        console.error(`  ERROR inserting ${pet.name}:`, petErr.message);
      } else {
        console.log(`  ${pet.name} - done!\n`);
      }
    } catch (err) {
      console.error(`  ERROR processing ${pet.name}:`, err.message);
      // Insert pet without photo as fallback
      const { error: petErr } = await supabase.from('pets').insert({
        ...petData,
        photos: [],
      });
      if (petErr) console.error(`  Also failed to insert without photo:`, petErr.message);
      else console.log(`  ${pet.name} - inserted without photo.\n`);
    }
  }

  console.log('=== Done! ===');
}

main().catch(console.error);
