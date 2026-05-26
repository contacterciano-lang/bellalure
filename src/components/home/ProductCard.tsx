'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/config';

const badgeStyles: Record<string, string> = {
  nouveau: 'bg-black text-white',
  'best-seller': 'bg-[#C9A96E] text-black',
  tendance: 'bg-rose-500 text-white',
  promo: 'bg-red-600 text-white',
};

const badgeLabels: Record<string, string> = {
  nouveau: 'Nouveau',
  'best-seller': 'Best-seller',
  tendance: 'Tendance',
  promo: 'Promo',
};

export default function ProductCard({ product }: { product: Product }) {
  const hasPromo = product.originalPrice && product.originalPrice > product.price;
  const discount = hasPromo
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  return (
    <motion.div
      className="group relative flex flex-col bg-white"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Image container */}
      <Link
        href={`/produit/${product.slug}`}
        className="relative aspect-[3/4] overflow-hidden bg-[#F5F0EB]"
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 text-[10px] tracking-[0.15em] uppercase font-medium ${badgeStyles[product.badge]}`}
          >
            {badgeLabels[product.badge]}
          </span>
        )}

        {/* Discount badge */}
        {hasPromo && (
          <span className="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-semibold bg-red-600 text-white tracking-wide">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Product info */}
      <div className="flex flex-col gap-1.5 pt-4 pb-2 px-1">
        <Link href={`/produit/${product.slug}`}>
          <h3 className="text-sm font-medium text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#C9A96E] transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            {product.price.toFixed(2)} {product.currency}
          </span>
          {hasPromo && (
            <span className="text-xs text-neutral-400 line-through">
              {product.originalPrice!.toFixed(2)} {product.currency}
            </span>
          )}
        </div>

        {/* Quick order button */}
        <motion.a
          href={getWhatsAppUrl(product.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white text-xs tracking-[0.15em] uppercase font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 hover:bg-[#C9A96E] hover:text-black"
          whileTap={{ scale: 0.97 }}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Commander
        </motion.a>
      </div>
    </motion.div>
  );
}
