'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, SiteSettings } from '@/lib/types';

const SETTINGS_KEY = 'bellalure-settings';

export function usePriceVisibility() {
  const [globalShowPrice, setGlobalShowPrice] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings: SiteSettings = JSON.parse(raw);
        // showPrices defaults to true when undefined
        setGlobalShowPrice(settings.showPrices !== false);
      }
    } catch { /* ignore */ }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY && e.newValue) {
        try {
          const settings: SiteSettings = JSON.parse(e.newValue);
          setGlobalShowPrice(settings.showPrices !== false);
        } catch { /* ignore */ }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const shouldHidePrice = useCallback(
    (product: Product): boolean => {
      // Price is hidden when global setting is false OR product's showPrice is false
      if (!globalShowPrice) return true;
      if (product.showPrice === false) return true;
      return false;
    },
    [globalShowPrice],
  );

  return { globalShowPrice, shouldHidePrice };
}
