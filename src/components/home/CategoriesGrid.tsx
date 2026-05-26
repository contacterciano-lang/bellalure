'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { CATEGORIES } from '@/lib/types';

export default function CategoriesGrid() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  return (
    <section ref={sectionRef} className="py-16 sm:py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Nos Cat&eacute;gories
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Categories grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((category, i) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.06,
                ease: 'easeOut',
              }}
            >
              <Link
                href={`/catalogue?category=${category.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden bg-neutral-100"
              >
                {/* Category image */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 group-hover:via-black/30 transition-all duration-500" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5">
                  <motion.div
                    className="transform transition-transform duration-500 group-hover:-translate-y-2"
                  >
                    <h3 className="text-white text-lg sm:text-xl font-light tracking-wide">
                      {category.name}
                    </h3>
                    <p className="text-white/60 text-xs sm:text-sm mt-1 font-light">
                      {category.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <span className="text-[#C9A96E] text-xs tracking-[0.15em] uppercase font-medium">
                        Explorer
                      </span>
                      <span className="w-4 h-px bg-[#C9A96E]" />
                    </div>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
