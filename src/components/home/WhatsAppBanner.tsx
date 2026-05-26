'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function WhatsAppBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });

  const whatsappLink = `https://wa.me/${siteConfig.whatsapp.number.replace(
    /[^0-9+]/g,
    ''
  )}?text=${encodeURIComponent(
    'Bonjour Bellalure, je souhaite passer une commande.'
  )}`;

  return (
    <section ref={sectionRef} className="relative overflow-hidden">
      {/* Green gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]" />

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)`,
          }}
        />
      </div>

      {/* Floating bubbles */}
      <motion.div
        className="absolute left-10 top-6 w-20 h-20 rounded-full bg-white/5"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-20 bottom-4 w-14 h-14 rounded-full bg-white/5"
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
          {/* Left content */}
          <motion.div
            className="text-center sm:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-4">
              {/* WhatsApp icon */}
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/60 text-xs tracking-[0.2em] uppercase font-medium">
                  Service rapide
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-white tracking-tight leading-snug">
              Commandez facilement
              <br />
              via <span className="font-medium">WhatsApp</span>
            </h2>

            <p className="mt-3 text-white/70 text-sm sm:text-base font-light max-w-md">
              R&eacute;ponse rapide, conseil personnalis&eacute; et suivi de commande en temps r&eacute;el.
            </p>

            {/* Phone number */}
            <p className="mt-4 text-white text-lg sm:text-xl font-light tracking-wide">
              {siteConfig.whatsapp.number}
            </p>
          </motion.div>

          {/* Right CTA */}
          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          >
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-white text-[#075E54] text-sm tracking-[0.15em] uppercase font-semibold hover:bg-neutral-100 transition-colors duration-300 rounded-full shadow-lg shadow-black/10"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Nous &eacute;crire</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
