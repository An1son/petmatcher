import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhkjbziuaotvuwviyouj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Lionhead rabbit photo from Unsplash
const imageUrl = 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600';

async function fix() {
  // 1. Find Biscuit
  const { data: pet, error } = await supabase
    .from('pets')
    .select('id, name, photos')
    .eq('name', 'Biscuit')
    .single();

  if (error || !pet) {
    console.error('Could not find Biscuit:', error);
    process.exit(1);
  }

  console.log('Found Biscuit:', pet.id);

  // 2. Download the image
  const res = await fetch(imageUrl, { redirect: 'follow' });
  if (!res.ok) {
    console.error('Failed to download image:', res.status);
    process.exit(1);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/jpeg';
  console.log(`Downloaded image: ${buffer.length} bytes`);

  // 3. Upload to storage
  const filePath = `${pet.id}/photo-0.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('pet-photos')
    .upload(filePath, buffer, { contentType, upsert: true });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    process.exit(1);
  }

  // 4. Get public URL
  const { data: urlData } = supabase.storage
    .from('pet-photos')
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;
  console.log('New photo URL:', publicUrl);

  // 5. Update pet record
  const { error: updateError } = await supabase
    .from('pets')
    .update({ photos: [publicUrl] })
    .eq('id', pet.id);

  if (updateError) {
    console.error('Update failed:', updateError);
    process.exit(1);
  }

  console.log('Biscuit photo updated successfully!');
}

fix();
