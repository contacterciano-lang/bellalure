'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      {/* Decorative line */}
      <motion.div
        className="mb-8 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="h-px w-12 bg-[#C9A96E]/40" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#C9A96E]" />
        <span className="h-px w-12 bg-[#C9A96E]/40" />
      </motion.div>

      {/* Large 404 */}
      <motion.h1
        className="text-[120px] sm:text-[180px] md:text-[220px] font-extralight leading-none tracking-[0.1em] text-black/5 select-none"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        404
      </motion.h1>

      {/* Message */}
      <motion.div
        className="-mt-6 sm:-mt-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2
          className="text-2xl sm:text-3xl font-extralight tracking-[0.12em] text-black uppercase"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          Page introuvable
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-black/40">
          La page que vous recherchez n&apos;existe pas ou a
          &eacute;t&eacute; d&eacute;plac&eacute;e.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Link
          href="/"
          className="group relative mt-10 inline-flex items-center gap-3 overflow-hidden border border-[#C9A96E] px-8 py-4 text-xs font-medium uppercase tracking-[0.2em] text-[#C9A96E] transition-colors duration-500 hover:text-white"
        >
          <span className="absolute inset-0 translate-y-full bg-[#C9A96E] transition-transform duration-500 ease-out group-hover:translate-y-0" />
          <span className="relative z-10">Retour &agrave; l&apos;accueil</span>
        </Link>
      </motion.div>

      {/* Bottom decorative line */}
      <motion.div
        className="mt-16 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <span className="h-px w-8 bg-[#C9A96E]/30" />
        <span className="h-1 w-1 rounded-full bg-[#C9A96E]/40" />
        <span className="h-px w-8 bg-[#C9A96E]/30" />
      </motion.div>
    </div>
  );
}
