'use client';

import { useState, useEffect } from 'react';
import { products as staticProducts } from '@/data/products';
import type { Product } from '@/lib/types';

export function useAllProducts(): Product[] {
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((dynamic: Product[]) => {
        // Supabase is the single source of truth (all products are seeded there).
        // We replace — never merge — so deleted products do NOT reappear.
        // Static array is only a fallback if the API is unreachable / empty.
        if (Array.isArray(dynamic) && dynamic.length > 0) {
          setAllProducts(dynamic);
        }
      })
      .catch(() => {});
  }, []);

  return allProducts;
}
