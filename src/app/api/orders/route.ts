import { type NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import type { WhatsAppOrder, WhatsAppOrderAction, OrderStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface DbRow {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  product_category: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  quantity: number | null;
  selling_price: number | null;
  supplier_price: number | null;
  total_amount: number | null;
  supplier_total: number | null;
  profit: number | null;
  show_price: boolean | null;
  action: string;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

function rowToOrder(r: DbRow): WhatsAppOrder {
  return {
    id: r.id,
    productId: r.product_id || '',
    productName: r.product_name,
    productImage: r.product_image || '',
    productCategory: r.product_category || '',
    price: Number(r.selling_price || 0),
    supplierPrice: Number(r.supplier_price || 0),
    totalAmount: Number(r.total_amount || 0),
    supplierTotal: Number(r.supplier_total || 0),
    profit: Number(r.profit || 0),
    showPrice: r.show_price !== false,
    action: (r.action as WhatsAppOrderAction) || 'commander',
    whatsappNumber: '',
    quantity: r.quantity || 1,
    status: (r.status as OrderStatus) || 'nouveau',
    customerName: r.customer_name || undefined,
    customerPhone: r.customer_phone || undefined,
    source: r.source || 'whatsapp',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json((data || []).map(rowToOrder));
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const o: WhatsAppOrder = await request.json();
    if (!o.productName) {
      return Response.json({ error: 'productName requis' }, { status: 400 });
    }

    const now = new Date().toISOString();
    // total_amount / supplier_total / profit sont des colonnes générées :
    // on ne les insère PAS, la base les calcule.
    const { error } = await getSupabase().from('orders').insert({
      id: o.id || `ord-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      product_id: o.productId || null,
      product_name: o.productName,
      product_image: o.productImage || null,
      product_category: o.productCategory || null,
      customer_name: o.customerName || null,
      customer_phone: o.customerPhone || null,
      quantity: o.quantity ?? 1,
      selling_price: o.price ?? 0,
      supplier_price: o.supplierPrice ?? 0,
      show_price: o.showPrice !== false,
      action: o.action || 'commander',
      status: o.status || 'nouveau',
      source: o.source || 'whatsapp',
      created_at: o.createdAt || now,
      updated_at: now,
    });

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return Response.json({ error: 'id requis' }, { status: 400 });

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) updates.status = body.status;
    if (body.customerPhone !== undefined) updates.customer_phone = body.customerPhone || null;
    if (body.customerName !== undefined) updates.customer_name = body.customerName || null;
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.sellingPrice !== undefined) updates.selling_price = body.sellingPrice;
    if (body.supplierPrice !== undefined) updates.supplier_price = body.supplierPrice;

    const { error } = await getSupabase().from('orders').update(updates).eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) return Response.json({ error: 'id requis' }, { status: 400 });

    const { error } = await getSupabase().from('orders').delete().eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
