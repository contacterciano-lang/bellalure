'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { Product } from '@/lib/types';

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getWhatsAppMessage: () => string;
  getWhatsAppUrl: () => string;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = 'bellalure-cart';

function itemKey(productId: string, size?: string, color?: string) {
  return `${productId}__${size || ''}__${color || ''}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  }, [items]);

  const addItem = useCallback((product: Product, quantity = 1, size?: string, color?: string) => {
    setItems((prev) => {
      const key = itemKey(product.id, size, color);
      const existing = prev.find(
        (i) => itemKey(i.product.id, i.size, i.color) === key,
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.product.id, i.size, i.color) === key
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity, size, color }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size?: string, color?: string) => {
    const key = itemKey(productId, size, color);
    setItems((prev) => prev.filter((i) => itemKey(i.product.id, i.size, i.color) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string, color?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size, color);
        return;
      }
      const key = itemKey(productId, size, color);
      setItems((prev) =>
        prev.map((i) =>
          itemKey(i.product.id, i.size, i.color) === key ? { ...i, quantity } : i,
        ),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const getWhatsAppMessage = useCallback(() => {
    if (items.length === 0) return '';

    // Check global price visibility setting
    let globalShow = true;
    try {
      const raw = localStorage.getItem('bellalure-settings');
      if (raw) {
        const settings = JSON.parse(raw);
        globalShow = settings.showPrices !== false;
      }
    } catch { /* ignore */ }

    let hasHiddenPrice = false;

    const lines = items.map((item, i) => {
      const priceHidden = !globalShow || item.product.showPrice === false;
      if (priceHidden) hasHiddenPrice = true;

      let line = `${i + 1}. ${item.product.name}`;
      if (item.size) line += ` | Taille: ${item.size}`;
      if (item.color) line += ` | Couleur: ${item.color}`;
      line += ` | Qty: ${item.quantity}`;
      line += priceHidden ? ` | Prix: a confirmer` : ` | $${(item.product.price * item.quantity).toFixed(2)}`;
      return line;
    });

    const footer = hasHiddenPrice
      ? `Merci de me communiquer les prix et confirmer la disponibilite.`
      : `Total : $${subtotal.toFixed(2)}\n\nMerci de confirmer la disponibilite et les frais de livraison.`;

    return [
      `Bonjour Bellalure !`,
      ``,
      `Je souhaite commander :`,
      ``,
      ...lines,
      ``,
      footer,
    ].join('\n');
  }, [items, subtotal]);

  const getWhatsAppUrl = useCallback(() => {
    const msg = encodeURIComponent(getWhatsAppMessage());
    return `https://wa.me/33758167830?text=${msg}`;
  }, [getWhatsAppMessage]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        isOpen,
        openCart,
        closeCart,
        getWhatsAppMessage,
        getWhatsAppUrl,
      }}
    >
      {children}
    </CartContext>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}
