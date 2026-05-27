'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { getWhatsAppUrl } from '@/lib/config';
import { useAllProducts } from '@/lib/useAllProducts';

export default function FeaturedProducts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
  const products = useAllProducts();

  const featuredProducts = products
    .filter((p) => p.featured === true || p.badge === 'best-seller')
    .slice(0, 8);

  if (featuredProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-neutral-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <span className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] font-medium">
            Exclusivit&eacute;s
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            S&eacute;lection Premium
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Featured grid - first item larger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {featuredProducts.map((product, i) => {
            const isLarge = i === 0 || i === 3;
            const hasPromo =
              product.originalPrice && product.originalPrice > product.price;
            const discount = hasPromo
              ? Math.round(
                  ((product.originalPrice! - product.price) /
                    product.originalPrice!) *
                    100
                )
              : 0;

            return (
              <motion.div
                key={product.id}
                className={isLarge ? 'sm:col-span-2 md:col-span-1' : ''}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.08,
                  ease: 'easeOut',
                }}
              >
                <div className="group relative bg-white overflow-hidden">
                  {/* Image */}
                  <Link
                    href={`/produit/${product.slug}`}
                    className={`relative block overflow-hidden bg-[#F5F0EB] ${
                      isLarge ? 'aspect-[4/5] sm:aspect-[3/4]' : 'aspect-[3/4]'
                    }`}
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes={
                        isLarge
                          ? '(max-width: 768px) 100vw, 50vw'
                          : '(max-width: 640px) 100vw, 50vw'
                      }
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Badge */}
                    {product.badge && (
                      <span className="absolute top-3 left-3 px-3 py-1.5 bg-[#C9A96E] text-black text-[10px] tracking-[0.15em] uppercase font-semibold">
                        {product.badge === 'nouveau'
                          ? 'Nouveau'
                          : product.badge === 'best-seller'
                          ? 'Best-seller'
                          : product.badge === 'promo'
                          ? 'Promo'
                          : 'Tendance'}
                      </span>
                    )}

                    {hasPromo && (
                      <span className="absolute top-3 right-3 px-2.5 py-1 bg-red-600 text-white text-[10px] font-semibold">
                        -{discount}%
                      </span>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="p-4 sm:p-5">
                    <Link href={`/produit/${product.slug}`}>
                      <h3 className="text-sm sm:text-base font-medium text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#C9A96E] transition-colors duration-300">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-neutral-900">
                          {product.price.toFixed(2)} {product.currency}
                        </span>
                        {hasPromo && (
                          <span className="text-sm text-neutral-400 line-through">
                            {product.originalPrice!.toFixed(2)}{' '}
                            {product.currency}
                          </span>
                        )}
                      </div>

                      <a
                        href={getWhatsAppUrl(product.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 flex items-center justify-center bg-neutral-100 hover:bg-[#C9A96E] text-neutral-600 hover:text-white transition-all duration-300 rounded-full"
                        aria-label={`Commander ${product.name}`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
