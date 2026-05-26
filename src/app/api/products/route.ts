import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface DbRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  original_price: number | null;
  currency: string;
  description: string;
  images: string[];
  sizes: string[];
  badge: string | null;
  stock: number;
  rating: number;
  reviews: number;
  new_arrival: boolean;
  source_url: string | null;
}

function rowToProduct(row: DbRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category as Product['category'],
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    currency: row.currency,
    description: row.description,
    images: row.images,
    sizes: row.sizes,
    badge: row.badge as Product['badge'] | undefined,
    stock: row.stock,
    rating: Number(row.rating),
    reviews: row.reviews,
    newArrival: row.new_arrival,
  };
}

export async function GET() {
  const { data, error } = await getSupabase()
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const products: Product[] = (data || []).map(rowToProduct);
  return Response.json(products);
}

export async function POST(request: NextRequest) {
  try {
    const product: Product & { sourceUrl?: string } = await request.json();

    if (!product.name || !product.slug || !product.category) {
      return Response.json({ error: 'Champs requis manquants (name, slug, category)' }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from('products')
      .insert({
        id: product.id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        original_price: product.originalPrice || null,
        currency: product.currency || 'USD',
        description: product.description || '',
        images: product.images || [],
        sizes: product.sizes || [],
        badge: product.badge || null,
        stock: product.stock ?? 10,
        rating: product.rating ?? 4.5,
        reviews: product.reviews ?? 0,
        new_arrival: product.newArrival ?? true,
        source_url: product.sourceUrl || null,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return Response.json({ error: 'Un produit avec cet ID ou slug existe déjà' }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, product: rowToProduct(data) }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: 'ID requis' }, { status: 400 });
    }

    const { error, count } = await getSupabase()
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (count === 0) {
      return Response.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
