'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  initials: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Maman Grace',
    location: 'Kinshasa',
    rating: 5,
    text: "J'ai commandé trois robes et je suis vraiment impressionnée par la qualité. Le service est rapide et le style est exactement ce que je cherchais. Bellalure ne déçoit jamais !",
    initials: 'MG',
  },
  {
    id: 2,
    name: 'Patrick M.',
    location: 'Paris',
    rating: 5,
    text: "Enfin une boutique en ligne qui comprend notre style. Les chaussures sont authentiques et la livraison en France était plus rapide que prévu. Je recommande à 100 %.",
    initials: 'PM',
  },
  {
    id: 3,
    name: 'Chancelle K.',
    location: 'Bruxelles',
    rating: 4,
    text: "Le sac que j'ai reçu est magnifique, la qualité est au rendez-vous. Le service client via WhatsApp est très réactif et professionnel. Je suis une cliente fidèle désormais.",
    initials: 'CK',
  },
  {
    id: 4,
    name: 'David N.',
    location: 'Kinshasa',
    rating: 5,
    text: "Ma montre est arrivée bien emballée et en parfait état. Le paiement via Mobile Money est super pratique. Bellalure, c'est le luxe accessible pour nous tous.",
    initials: 'DN',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i < rating
              ? 'fill-[#C9A96E] text-[#C9A96E]'
              : 'fill-neutral-200 text-neutral-200'
          }`}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
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
            Ce que disent nos clients
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Testimonials row - horizontal scroll on mobile */}
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.id}
              className="flex-shrink-0 w-[300px] sm:w-auto snap-start"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.1,
                ease: 'easeOut',
              }}
            >
              <div className="relative h-full p-6 sm:p-7 bg-[#F5F0EB]/50 border border-neutral-100 hover:border-[#C9A96E]/20 transition-colors duration-500">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-[#C9A96E]/20 mb-4" />

                {/* Stars */}
                <StarRating rating={testimonial.rating} />

                {/* Text */}
                <p className="mt-4 text-sm text-neutral-600 leading-relaxed font-light">
                  {testimonial.text}
                </p>

                {/* Author */}
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center">
                    <span className="text-xs font-medium text-white tracking-wide">
                      {testimonial.initials}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
