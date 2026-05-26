'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface LookbookItem {
  id: number;
  image: string;
  title: string;
  span: string;
}

const lookbookItems: LookbookItem[] = [
  {
    id: 1,
    image: 'https://picsum.photos/seed/bellalure-look1/800/1000',
    title: 'Urban Elegance',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 2,
    image: 'https://picsum.photos/seed/bellalure-look2/800/600',
    title: 'Street Luxe',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 3,
    image: 'https://picsum.photos/seed/bellalure-look3/800/600',
    title: 'Casual Chic',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 4,
    image: 'https://picsum.photos/seed/bellalure-look4/1200/600',
    title: 'Night Out',
    span: 'col-span-2 row-span-1',
  },
];

export default function LookbookSection() {
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
          <span className="text-xs tracking-[0.3em] uppercase text-[#C9A96E] font-medium">
            Inspiration
          </span>
          <h2
            className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Lookbook
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Masonry-like grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-[280px] sm:auto-rows-[300px] gap-3 sm:gap-4">
          {lookbookItems.map((item, i) => (
            <motion.div
              key={item.id}
              className={`group relative overflow-hidden cursor-pointer ${item.span}`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: 'easeOut',
              }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                unoptimized
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-700" />

              {/* Hover content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <motion.h3
                  className="text-white text-xl sm:text-2xl font-light tracking-wide translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  {item.title}
                </motion.h3>
                <div className="mt-4 flex items-center gap-2 text-[#C9A96E] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <span className="text-xs tracking-[0.2em] uppercase font-medium">
                    Voir le look
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom gradient with title (visible by default) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 sm:p-5 group-hover:opacity-0 transition-opacity duration-500">
                <p className="text-white/80 text-sm font-light tracking-wide">
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
