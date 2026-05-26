'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Truck, Globe, Smartphone, MessageSquare } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface DeliveryCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const cards: DeliveryCard[] = [
  {
    icon: Truck,
    title: 'Livraison Kinshasa',
    description:
      'Livraison rapide dans toute la ville de Kinshasa. Recevez vos commandes en 24 à 48h.',
  },
  {
    icon: Globe,
    title: 'France & Europe',
    description:
      'Expédition vers la France, la Belgique et toute l\'Europe avec suivi en temps réel.',
  },
  {
    icon: Smartphone,
    title: 'Paiement Mobile Money',
    description:
      'Payez facilement via M-Pesa, Airtel Money, Orange Money ou Wave. Simple et sécurisé.',
  },
  {
    icon: MessageSquare,
    title: 'Service Client WhatsApp',
    description:
      'Une question ? Contactez-nous sur WhatsApp pour un service rapide et personnalisé.',
  },
];

export default function DeliverySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

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
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-extralight text-neutral-900 tracking-tight"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Livraison &amp; Paiement
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="w-8 h-px bg-[#C9A96E]" />
            <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
            <span className="w-8 h-px bg-[#C9A96E]" />
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                className="group relative bg-white p-6 sm:p-8 text-center hover:shadow-lg transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                whileHover={{ y: -6 }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-[#C9A96E] transition-all duration-500" />

                {/* Icon */}
                <div className="mx-auto w-14 h-14 flex items-center justify-center border border-neutral-200 group-hover:border-[#C9A96E] group-hover:bg-[#C9A96E]/5 transition-all duration-500 mb-5">
                  <Icon className="w-6 h-6 text-neutral-400 group-hover:text-[#C9A96E] transition-colors duration-500" />
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-neutral-900 tracking-wide uppercase mb-3">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-neutral-500 leading-relaxed font-light">
                  {card.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
