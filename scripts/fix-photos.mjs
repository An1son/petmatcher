import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nhkjbziuaotvuwviyouj.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const FIXES = [
  { name: 'Mocha', image_url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=600' },
  { name: 'Pearl', image_url: 'https://images.unsplash.com/photo-1617398881039-4c977f633b0e?w=600' },
  { name: 'Jasper', image_url: 'https://images.unsplash.com/photo-1599582292739-d37615cc7882?w=600' },
  { name: 'Scout', image_url: 'https://images.unsplash.com/photo-1532117423220-2990b8531c94?w=600' },
  { name: 'Nala', image_url: 'https://images.unsplash.com/photo-1741882683989-471737318766?w=600' },
  { name: 'Patches', image_url: 'https://images.unsplash.com/photo-1705587226156-13b263423b25?w=600' },
];

for (const fix of FIXES) {
  try {
    console.log(`${fix.name} - downloading...`);
    const res = await fetch(fix.image_url, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `pets/${Date.now()}-${fix.name.toLowerCase()}.${ext}`;

    console.log(`${fix.name} - uploading to storage...`);
    const { data, error } = await supabase.storage
      .from('pet-photos')
      .upload(fileName, buffer, { contentType, cacheControl: '3600', upsert: false });
    if (error) throw error;

    const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(data.path);
    const publicUrl = urlData.publicUrl;

    console.log(`${fix.name} - updating database...`);
    const { error: updateErr } = await supabase
      .from('pets')
      .update({ photos: [publicUrl] })
      .eq('name', fix.name)
      .is('photos', null)
      .single();

    // If null check didn't match, try empty array
    if (updateErr) {
      await supabase
        .from('pets')
        .update({ photos: [publicUrl] })
        .eq('name', fix.name)
        .eq('photos', '{}');
    }

    console.log(`${fix.name} - done! (${publicUrl})\n`);
  } catch (err) {
    console.error(`${fix.name} - FAILED: ${err.message}\n`);
  }
}

console.log('=== All fixes applied ===');
