'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '@/data/products';
import ProductCard from './ProductCard';

export default function NewArrivals() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const newProducts = products.filter((p) => p.newArrival === true);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = scrollRef.current.clientWidth * 0.7;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  if (newProducts.length === 0) return null;

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Nouveaut&eacute;s
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="w-12 h-px bg-[#C9A96E]" />
              <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Scroll controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 flex items-center justify-center border border-neutral-200 text-neutral-500 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                aria-label="Faire défiler vers la gauche"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 flex items-center justify-center border border-neutral-200 text-neutral-500 hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
                aria-label="Faire défiler vers la droite"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/catalogue?filter=nouveautes"
              className="group flex items-center gap-2 text-sm tracking-[0.1em] uppercase text-neutral-500 hover:text-[#C9A96E] transition-colors font-medium"
            >
              Voir tout
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Scrollable product row */}
        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {newProducts.map((product, i) => (
            <motion.div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[300px] snap-start"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
