'use client';

import type { WhatsAppOrder, WhatsAppOrderAction, OrderStatus, Product } from '@/lib/types';

/**
 * WhatsApp orders are stored server-side in Supabase (table `whatsapp_orders`)
 * so the admin sees every client's click on ANY device — not just the browser
 * where it happened. Requires migration 002.
 */

const WHATSAPP_NUMBER = '+33758167830';

/**
 * Fire-and-forget creation. Called from client click handlers right before the
 * WhatsApp link opens, so it must not block navigation: we POST in the
 * background and ignore failures.
 */
export function createWhatsAppOrder(
  product: Product,
  action: WhatsAppOrderAction,
  quantity: number = 1,
  size?: string,
  color?: string,
): WhatsAppOrder {
  const now = new Date().toISOString();
  const order: WhatsAppOrder = {
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    productName: product.name,
    productImage: product.images[0] || '',
    productCategory: product.category,
    price: product.price,
    showPrice: product.showPrice !== false,
    action,
    whatsappNumber: WHATSAPP_NUMBER,
    quantity,
    size,
    color,
    status: 'nouveau',
    createdAt: now,
    updatedAt: now,
  };

  try {
    void fetch('/api/whatsapp-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
      keepalive: true, // let it complete even if the page navigates to WhatsApp
    }).catch(() => {});
  } catch {
    /* ignore */
  }

  return order;
}

/** Loads all WhatsApp orders from the server (newest first). */
export async function fetchWhatsAppOrders(): Promise<WhatsAppOrder[]> {
  try {
    const res = await fetch('/api/whatsapp-orders', { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Updates a single order's status on the server. */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  try {
    const res = await fetch('/api/whatsapp-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, status }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Deletes a single order on the server. */
export async function deleteWhatsAppOrder(orderId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/whatsapp-orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Saves the customer's phone number on an order (so they can be notified). */
export async function updateOrderPhone(orderId: string, customerPhone: string): Promise<boolean> {
  try {
    const res = await fetch('/api/whatsapp-orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: orderId, customerPhone }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Pre-written WhatsApp message sent to the customer for each order status.
 * The shop owner just taps "Send" — we never send automatically.
 */
export function statusNotificationMessage(status: OrderStatus, productName: string): string {
  const p = productName;
  switch (status) {
    case 'nouveau':
      return `Bonjour ! Nous avons bien reçu votre commande : ${p}. Nous la traitons et revenons vers vous très vite. — Bellalure`;
    case 'confirme':
      return `Bonjour ! Votre commande « ${p} » est confirmée ✅. Merci pour votre confiance ! — Bellalure`;
    case 'acompte_paye':
      return `Bonjour ! Nous confirmons la réception de votre acompte pour « ${p} » 💰. Nous lançons la commande. — Bellalure`;
    case 'commande_fournisseur':
      return `Bonjour ! Votre « ${p} » a été commandé auprès de notre fournisseur 📦. Nous vous tenons informé(e). — Bellalure`;
    case 'en_transit':
      return `Bonjour ! Bonne nouvelle : votre « ${p} » est en transit ✈️. Plus que quelques jours ! — Bellalure`;
    case 'arrive_kinshasa':
      return `Bonjour ! Votre « ${p} » est arrivé à Kinshasa 🎉. Nous organisons la livraison avec vous. — Bellalure`;
    case 'livre':
      return `Bonjour ! Votre commande « ${p} » a été livrée ✅. Merci d'avoir choisi Bellalure ! 💛`;
    case 'annule':
      return `Bonjour, votre commande « ${p} » a été annulée. Contactez-nous pour toute question. — Bellalure`;
    default:
      return `Bonjour ! Mise à jour de votre commande « ${p} ». — Bellalure`;
  }
}

/** Builds the wa.me link to notify the customer for the order's current status. */
export function buildNotifyUrl(order: { customerPhone?: string; status: OrderStatus; productName: string }): string | null {
  const digits = (order.customerPhone || '').replace(/[^0-9]/g, '');
  if (!digits) return null;
  const msg = statusNotificationMessage(order.status, order.productName);
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}
