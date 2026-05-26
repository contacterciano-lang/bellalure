'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useAllProducts } from '@/lib/useAllProducts';
import type { Product } from '@/lib/types';
import Badge from '@/components/ui/Badge';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const products = useAllProducts();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim().length === 0) {
      setResults([]);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [products]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const formatPrice = (price: number) => `$${price}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-md"
        >
          {/* Close button */}
          <div className="flex justify-end p-6">
            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Fermer la recherche"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search input */}
          <div className="mx-auto w-full max-w-2xl px-6">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Rechercher un produit..."
                className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-lg text-white placeholder-white/40 outline-none transition-colors focus:border-[#C9A96E]/50 focus:bg-white/10"
              />
            </motion.div>
          </div>

          {/* Results */}
          <div className="mx-auto mt-8 w-full max-w-2xl flex-1 overflow-y-auto px-6 pb-6">
            {query.trim().length > 0 && results.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-16 text-center"
              >
                <Search className="mb-4 h-12 w-12 text-white/20" />
                <p className="text-lg font-medium text-white/60">
                  Aucun r&eacute;sultat
                </p>
                <p className="mt-1 text-sm text-white/40">
                  Essayez avec d&apos;autres mots-cl&eacute;s
                </p>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-white/40">
                  {results.length} r&eacute;sultat{results.length > 1 ? 's' : ''}
                </p>
                {results.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/produit/${product.slug}`}
                      onClick={onClose}
                      className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-[#C9A96E]/30 hover:bg-white/10"
                    >
                      {/* Product image */}
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-white/10">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="truncate text-sm font-medium text-white group-hover:text-[#C9A96E] transition-colors">
                            {product.name}
                          </h4>
                          {product.badge && (
                            <Badge type={product.badge} />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-white/40 truncate">
                          {product.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatPrice(product.price)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-xs text-white/40 line-through">
                            {formatPrice(product.originalPrice)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {query.trim().length === 0 && (
              <div className="flex flex-col items-center py-16 text-center">
                <Search className="mb-4 h-12 w-12 text-white/10" />
                <p className="text-sm text-white/30">
                  Tapez pour rechercher parmi nos produits
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
