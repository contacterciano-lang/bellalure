'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem, STORAGE_KEYS } from './localStorage';

const DEFAULT_PASSWORD = 'bellalure2024';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24h

interface Session {
  authenticated: boolean;
  expiresAt: number;
}

export function useAdminAuth() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getItem<Session | null>(STORAGE_KEYS.ADMIN_SESSION, null);
    if (session && session.authenticated && session.expiresAt > Date.now()) {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = useCallback((password: string): boolean => {
    const storedPassword = getItem<string>(STORAGE_KEYS.ADMIN_PASSWORD, DEFAULT_PASSWORD);
    if (password === storedPassword) {
      const session: Session = {
        authenticated: true,
        expiresAt: Date.now() + SESSION_DURATION,
      };
      setItem(STORAGE_KEYS.ADMIN_SESSION, session);
      setAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    removeItem(STORAGE_KEYS.ADMIN_SESSION);
    setAuthenticated(false);
  }, []);

  return { authenticated, loading, login, logout };
}
