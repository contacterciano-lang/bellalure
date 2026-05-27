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
  price: number | null;
  show_price: boolean | null;
  action: string;
  whatsapp_number: string | null;
  quantity: number | null;
  size: string | null;
  color: string | null;
  status: string;
  customer_phone: string | null;
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
    price: Number(r.price || 0),
    showPrice: r.show_price !== false,
    action: (r.action as WhatsAppOrderAction) || 'commander',
    whatsappNumber: r.whatsapp_number || '',
    quantity: r.quantity || 1,
    size: r.size || undefined,
    color: r.color || undefined,
    status: (r.status as OrderStatus) || 'nouveau',
    customerPhone: r.customer_phone || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

interface PgError { message?: string; code?: string; }

/** True when the error is "customer_phone column missing" (migration 003 not run yet). */
function missingCustomerPhone(error: PgError | null): boolean {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  const isMissing =
    error.code === 'PGRST204' || error.code === '42703' ||
    msg.includes('does not exist') || msg.includes('could not find');
  return isMissing && msg.includes('customer_phone');
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('whatsapp_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
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
    const row: Record<string, unknown> = {
      id: o.id || `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      product_id: o.productId || null,
      product_name: o.productName,
      product_image: o.productImage || null,
      product_category: o.productCategory || null,
      price: o.price ?? 0,
      show_price: o.showPrice !== false,
      action: o.action || 'commander',
      whatsapp_number: o.whatsappNumber || null,
      quantity: o.quantity ?? 1,
      size: o.size || null,
      color: o.color || null,
      status: o.status || 'nouveau',
      customer_phone: o.customerPhone || null,
      created_at: o.createdAt || now,
      updated_at: now,
    };

    let { error } = await getSupabase().from('whatsapp_orders').insert(row);
    if (missingCustomerPhone(error)) {
      delete row.customer_phone;
      ({ error } = await getSupabase().from('whatsapp_orders').insert(row));
    }

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, customerPhone } = await request.json();
    if (!id) {
      return Response.json({ error: 'id requis' }, { status: 400 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status !== undefined) updates.status = status;
    if (customerPhone !== undefined) updates.customer_phone = customerPhone || null;

    let { error } = await getSupabase().from('whatsapp_orders').update(updates).eq('id', id);
    if (missingCustomerPhone(error)) {
      delete updates.customer_phone;
      ({ error } = await getSupabase().from('whatsapp_orders').update(updates).eq('id', id));
    }

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ error: 'id requis' }, { status: 400 });
    }

    const { error } = await getSupabase().from('whatsapp_orders').delete().eq('id', id);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    return Response.json({ error: message }, { status: 500 });
  }
}
