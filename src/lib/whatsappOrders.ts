'use client';

import type { WhatsAppOrder, WhatsAppOrderAction, OrderStatus, Product } from '@/lib/types';

const STORAGE_KEY = 'bellalure-whatsapp-orders';

export function getWhatsAppOrders(): WhatsAppOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWhatsAppOrders(orders: WhatsAppOrder[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch { /* ignore */ }
}

export function createWhatsAppOrder(
  product: Product,
  action: WhatsAppOrderAction,
  quantity: number = 1,
  size?: string,
  color?: string,
): WhatsAppOrder {
  const order: WhatsAppOrder = {
    id: `wa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    productId: product.id,
    productName: product.name,
    productImage: product.images[0] || '',
    productCategory: product.category,
    price: product.price,
    showPrice: product.showPrice !== false,
    action,
    whatsappNumber: '+33758167830',
    quantity,
    size,
    color,
    status: 'nouveau',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const orders = getWhatsAppOrders();
  orders.unshift(order);
  saveWhatsAppOrders(orders);
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus): void {
  const orders = getWhatsAppOrders();
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    saveWhatsAppOrders(orders);
  }
}

export function deleteWhatsAppOrder(orderId: string): void {
  const orders = getWhatsAppOrders();
  saveWhatsAppOrders(orders.filter((o) => o.id !== orderId));
}
