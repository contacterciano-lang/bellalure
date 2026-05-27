import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface SupplierRow {
  id: string;
  name: string;
  country: string | null;
  whatsapp: string | null;
  product_category: string | null;
  created_at: string;
}

function rowToSupplier(r: SupplierRow) {
  return {
    id: r.id,
    name: r.name,
    country: r.country || '',
    whatsapp: r.whatsapp || '',
    productCategory: r.product_category || '',
    createdAt: r.created_at,
  };
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json((data || []).map(rowToSupplier));
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const s = await request.json();
    if (!s.name) return Response.json({ error: 'name requis' }, { status: 400 });
    const { error } = await getSupabase().from('suppliers').insert({
      id: s.id || `sup-${Date.now()}`,
      name: s.name,
      country: s.country || null,
      whatsapp: s.whatsapp || null,
      product_category: s.productCategory || null,
    });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, ...u } = await request.json();
    if (!id) return Response.json({ error: 'id requis' }, { status: 400 });
    const upd: Record<string, unknown> = {};
    if (u.name !== undefined) upd.name = u.name;
    if (u.country !== undefined) upd.country = u.country || null;
    if (u.whatsapp !== undefined) upd.whatsapp = u.whatsapp || null;
    if (u.productCategory !== undefined) upd.product_category = u.productCategory || null;
    const { error } = await getSupabase().from('suppliers').update(upd).eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: 'id requis' }, { status: 400 });
    const { error } = await getSupabase().from('suppliers').delete().eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : 'Erreur' }, { status: 500 });
  }
}
