import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const BUCKET = 'product-images';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return Response.json({ error: 'Aucune image fournie' }, { status: 400 });
    }

    if (files.length > 10) {
      return Response.json({ error: 'Maximum 10 images à la fois' }, { status: 400 });
    }

    const supabase = getSupabase();
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: type non supporté (${file.type})`);
        continue;
      }

      // Validate size
      if (file.size > MAX_SIZE) {
        errors.push(`${file.name}: trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB, max 5 MB)`);
        continue;
      }

      // Generate unique filename
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `products/${filename}`;

      // Read file buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, buffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        });

      if (uploadError) {
        errors.push(`${file.name}: ${uploadError.message}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      uploadedUrls.push(urlData.publicUrl);
    }

    return Response.json({
      success: true,
      urls: uploadedUrls,
      errors: errors.length > 0 ? errors : undefined,
      count: uploadedUrls.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
