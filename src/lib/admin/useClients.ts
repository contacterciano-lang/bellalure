'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from './localStorage';
import type { Client } from '@/lib/types';

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    setClients(getItem<Client[]>(STORAGE_KEYS.CLIENTS, []));
  }, []);

  const save = (updated: Client[]) => {
    setClients(updated);
    setItem(STORAGE_KEYS.CLIENTS, updated);
  };

  const addClient = useCallback((client: Client) => {
    save([client, ...clients]);
  }, [clients]);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    save(clients.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, [clients]);

  const deleteClient = useCallback((id: string) => {
    save(clients.filter((c) => c.id !== id));
  }, [clients]);

  const getClient = useCallback((id: string) => {
    return clients.find((c) => c.id === id) || null;
  }, [clients]);

  const getOrCreateClient = useCallback((name: string, phone: string): Client => {
    const existing = clients.find((c) => c.phone === phone);
    if (existing) return existing;
    const newClient: Client = {
      id: `cl-${Date.now()}`,
      name,
      phone,
      city: 'Kinshasa',
      country: 'RDC',
      totalOrders: 0,
      totalSpent: 0,
      currency: 'USD',
      isVip: false,
      notes: '',
      createdAt: new Date().toISOString(),
    };
    save([newClient, ...clients]);
    return newClient;
  }, [clients]);

  return { clients, addClient, updateClient, deleteClient, getClient, getOrCreateClient };
}
