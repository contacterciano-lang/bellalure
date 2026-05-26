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
        if (Array.isArray(dynamic) && dynamic.length > 0) {
          // Supabase versions override static products (for edited products)
          const dynamicIds = new Set(dynamic.map((p) => p.id));
          const remainingStatic = staticProducts.filter((p) => !dynamicIds.has(p.id));
          setAllProducts([...remainingStatic, ...dynamic]);
        }
      })
      .catch(() => {});
  }, []);

  return allProducts;
}
