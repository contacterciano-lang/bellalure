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
          const staticIds = new Set(staticProducts.map((p) => p.id));
          const newProducts = dynamic.filter((p) => !staticIds.has(p.id));
          if (newProducts.length > 0) {
            setAllProducts([...staticProducts, ...newProducts]);
          }
        }
      })
      .catch(() => {});
  }, []);

  return allProducts;
}
