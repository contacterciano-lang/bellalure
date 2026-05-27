'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product, SiteSettings } from '@/lib/types';

const SETTINGS_KEY = 'bellalure-settings';

/**
 * Hook to determine if a product's price should be hidden.
 * Checks both the global `hidePrices` setting and the per-product `hidePrice` flag.
 */
export function usePriceVisibility() {
  const [globalHide, setGlobalHide] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const settings: SiteSettings = JSON.parse(raw);
        setGlobalHide(!!settings.hidePrices);
      }
    } catch {
      /* ignore */
    }

    // Listen for changes from admin panel (same tab or other tabs)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SETTINGS_KEY && e.newValue) {
        try {
          const settings: SiteSettings = JSON.parse(e.newValue);
          setGlobalHide(!!settings.hidePrices);
        } catch {
          /* ignore */
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Returns true if the price should be hidden for a given product.
   * Price is hidden when:
   * - The global `hidePrices` setting is on, OR
   * - The product's individual `hidePrice` flag is true
   */
  const shouldHidePrice = useCallback(
    (product: Product): boolean => {
      return globalHide || !!product.hidePrice;
    },
    [globalHide],
  );

  return { globalHide, shouldHidePrice };
}
