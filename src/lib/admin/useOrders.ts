'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from './localStorage';
import type { Order } from '@/lib/types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getItem<Order[]>(STORAGE_KEYS.ORDERS, []));
  }, []);

  const save = (updated: Order[]) => {
    setOrders(updated);
    setItem(STORAGE_KEYS.ORDERS, updated);
  };

  const addOrder = useCallback((order: Order) => {
    save([order, ...orders]);
  }, [orders]);

  const updateOrder = useCallback((id: string, updates: Partial<Order>) => {
    save(orders.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o)));
  }, [orders]);

  const deleteOrder = useCallback((id: string) => {
    save(orders.filter((o) => o.id !== id));
  }, [orders]);

  const getOrder = useCallback((id: string) => {
    return orders.find((o) => o.id === id) || null;
  }, [orders]);

  return { orders, addOrder, updateOrder, deleteOrder, getOrder };
}
