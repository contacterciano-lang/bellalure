'use client';

export const STORAGE_KEYS = {
  ORDERS: 'bellalure-orders',
  CLIENTS: 'bellalure-clients',
  COLLECTIONS: 'bellalure-collections',
  SETTINGS: 'bellalure-settings',
  ADMIN_SESSION: 'bellalure-admin-session',
  ADMIN_PASSWORD: 'bellalure-admin-password',
  WHATSAPP_ORDERS: 'bellalure-whatsapp-orders',
} as const;

export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded — silent
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
