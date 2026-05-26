'use client';

import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '@/lib/cart';
import { useCurrency } from '@/lib/currency';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, clearCart, itemCount, subtotal, isOpen, closeCart, getWhatsAppUrl } = useCart();
  const { format } = useCurrency();

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
                  Panier
                </h2>
                {itemCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-black px-1.5 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6">
                <ShoppingBag className="h-16 w-16 text-black/10" />
                <p className="text-sm text-black/40">Votre panier est vide</p>
                <Link
                  href="/catalogue"
                  onClick={closeCart}
                  className="rounded-full bg-black px-6 py-3 text-xs font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C9A96E]"
                >
                  Voir le catalogue
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {items.map((item) => {
                      const key = `${item.product.id}__${item.size || ''}__${item.color || ''}`;
                      return (
                        <motion.div
                          key={key}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50 }}
                          className="flex gap-4 rounded-xl border border-black/5 bg-[#F5F0EB]/30 p-3"
                        >
                          {/* Image */}
                          <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#F5F0EB]">
                            <Image
                              src={item.product.images[0]}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div>
                              <Link
                                href={`/produit/${item.product.slug}`}
                                onClick={closeCart}
                                className="text-sm font-medium text-black leading-tight line-clamp-2 hover:text-[#C9A96E] transition-colors"
                              >
                                {item.product.name}
                              </Link>
                              <div className="mt-1 flex flex-wrap gap-2">
                                {item.size && (
                                  <span className="text-[10px] text-black/40">
                                    Taille: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="text-[10px] text-black/40">
                                    Couleur: {item.color}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              {/* Quantity controls */}
                              <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size, item.color)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:text-black"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-semibold">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size, item.color)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:text-black"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Price + delete */}
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">
                                  {format(item.product.price * item.quantity)}
                                </span>
                                <button
                                  onClick={() => removeItem(item.product.id, item.size, item.color)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full text-black/20 transition-colors hover:bg-red-50 hover:text-red-500"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-black/5 px-6 py-5 space-y-4">
                  {/* Subtotal */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-black/50">Sous-total</span>
                    <span className="text-lg font-semibold">{format(subtotal)}</span>
                  </div>
                  <p className="text-[11px] text-black/30">
                    Frais de livraison calcules apres confirmation WhatsApp
                  </p>

                  {/* WhatsApp CTA */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#25D366] py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-lg shadow-[#25D366]/20 transition-all hover:bg-[#20BD5B] hover:shadow-xl active:scale-[0.98]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Commander via WhatsApp
                  </a>

                  {/* Clear cart */}
                  <button
                    onClick={clearCart}
                    className="w-full text-center text-xs text-black/30 transition-colors hover:text-red-500"
                  >
                    Vider le panier
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
