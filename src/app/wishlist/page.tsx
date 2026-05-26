'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist';
import { useAllProducts } from '@/lib/useAllProducts';
import ProductCard from '@/components/home/ProductCard';

export default function WishlistPage() {
  const { ids, count, clear } = useWishlist();
  const allProducts = useAllProducts();

  const wishlistedProducts = useMemo(
    () => allProducts.filter((p) => ids.includes(p.id)),
    [allProducts, ids],
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center justify-center gap-2 text-xs tracking-[0.1em] uppercase text-black/40">
              <Link
                href="/"
                className="transition-colors hover:text-[#C9A96E]"
              >
                Accueil
              </Link>
              <span>/</span>
              <span className="text-black/70">Favoris</span>
            </nav>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-[0.15em] text-black uppercase"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Mes Favoris
            </h1>

            {/* Gold decorative divider */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-[#C9A96E]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="w-12 h-px bg-[#C9A96E]/50" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {count > 0 ? (
          <>
            {/* Toolbar: count + clear */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center justify-between mb-8"
            >
              <p className="text-sm text-black/50">
                {count} produit{count !== 1 ? 's' : ''} dans vos favoris
              </p>
              <button
                onClick={clear}
                className="flex items-center gap-2 text-sm text-black/40 transition-colors hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                Tout supprimer
              </button>
            </motion.div>

            {/* Product grid */}
            <motion.div
              layout
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              <AnimatePresence mode="popLayout">
                {wishlistedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F0EB]">
              <Heart className="h-8 w-8 text-[#C9A96E]" />
            </div>
            <h2
              className="text-xl sm:text-2xl font-extralight tracking-[0.1em] text-black uppercase mb-3"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Votre liste de favoris est vide
            </h2>
            <p className="text-sm text-black/40 max-w-md mb-8">
              Parcourez notre catalogue et ajoutez vos articles
              pr&eacute;f&eacute;r&eacute;s en cliquant sur le c&oelig;ur.
            </p>
            <Link
              href="/catalogue"
              className="inline-block bg-black px-8 py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C9A96E]"
            >
              Voir le catalogue
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
