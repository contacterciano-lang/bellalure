'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem, STORAGE_KEYS } from './localStorage';
import { DEFAULT_SETTINGS } from './constants';
import type { SiteSettings } from '@/lib/types';

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getItem<SiteSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS));
  }, []);

  const updateSettings = useCallback((updates: Partial<SiteSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    setItem(STORAGE_KEYS.SETTINGS, updated);
  }, [settings]);

  return { settings, updateSettings };
}
