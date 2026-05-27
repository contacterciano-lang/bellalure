import { getSupabase } from '@/lib/supabase';
import { products as staticProducts } from '@/data/products';

export const dynamic = 'force-dynamic';

/**
 * One-time import of the static catalog (src/data/products.ts) into Supabase.
 * Idempotent: uses upsert with ignoreDuplicates so re-running never clobbers
 * products already edited in the admin. Requires migration 004.
 *
 * Trigger once:  curl -X POST https://bellalure.vercel.app/api/admin/seed-products
 */
export async function POST() {
  try {
    const rows = staticProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      original_price: p.originalPrice ?? null,
      currency: p.currency || 'USD',
      description: p.description || '',
      images: p.images || [],
      sizes: p.sizes || [],
      colors: p.colors ?? [],
      badge: p.badge || null,
      stock: p.stock ?? 10,
      rating: p.rating ?? 4.5,
      reviews: p.reviews ?? 0,
      new_arrival: p.newArrival ?? false,
      source_url: null,
      show_price: p.showPrice === false ? false : true,
      supplier_price: 0,
      status: 'active',
    }));

    const supabase = getSupabase();
    let inserted = 0;
    const errors: string[] = [];

    // Insert in batches; ignoreDuplicates so existing rows are left untouched.
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const { data, error } = await supabase
        .from('products')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })
        .select('id');
      if (error) {
        errors.push(error.message);
      } else {
        inserted += data?.length ?? 0;
      }
    }

    return Response.json({
      success: errors.length === 0,
      totalStatic: rows.length,
      inserted,
      skippedExisting: rows.length - inserted,
      errors,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
