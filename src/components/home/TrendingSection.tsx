'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import { products } from '@/data/products';

export default function TrendingSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const trendingProducts = products.filter((p) => p.trending === true);

  if (trendingProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-[#F5F0EB]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-xs tracking-[0.3em] uppercase text-neutral-500 font-medium">
              Populaire maintenant
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Tendances TikTok
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {trendingProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.08,
                ease: 'easeOut',
              }}
            >
              <Link
                href={`/produit/${product.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden bg-neutral-200"
              >
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center">
                  <motion.span
                    className="px-5 py-2.5 border border-white text-white text-xs tracking-[0.15em] uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                    whileTap={{ scale: 0.95 }}
                  >
                    Voir le produit
                  </motion.span>
                </div>

                {/* Product badge */}
                {product.badge && (
                  <span className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-[10px] tracking-[0.15em] uppercase font-medium">
                    Tendance
                  </span>
                )}

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-12">
                  <h3 className="text-white text-sm font-medium leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1 font-light">
                    {product.price.toFixed(2)} {product.currency}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View all link */}
        <motion.div
          className="text-center mt-10 sm:mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Link
            href="/catalogue?filter=tendances"
            className="group inline-flex items-center gap-2 px-8 py-3 border border-neutral-900 text-neutral-900 text-xs tracking-[0.2em] uppercase font-medium hover:bg-neutral-900 hover:text-white transition-all duration-400"
          >
            Voir toutes les tendances
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
