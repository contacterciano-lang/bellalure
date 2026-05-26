'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

function FloatingShape({
  delay,
  x,
  y,
  size,
  opacity,
}: {
  delay: number;
  x: string;
  y: string;
  size: number;
  opacity: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(201,169,110,${opacity}) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -30, 0, 30, 0],
        x: [0, 15, -15, 10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const titleLetters = 'BELLALURE'.split('');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 60, rotateX: -90 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    }),
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-900 to-[#F5F0EB]" />

      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating shapes */}
      {mounted && (
        <>
          <FloatingShape delay={0} x="10%" y="20%" size={200} opacity={0.15} />
          <FloatingShape delay={2} x="75%" y="15%" size={150} opacity={0.1} />
          <FloatingShape delay={4} x="60%" y="70%" size={180} opacity={0.12} />
          <FloatingShape delay={1} x="25%" y="75%" size={120} opacity={0.08} />
          <FloatingShape delay={3} x="85%" y="55%" size={100} opacity={0.1} />
        </>
      )}

      {/* Decorative lines */}
      <motion.div
        className="absolute left-0 top-1/3 w-32 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1.5 }}
      />
      <motion.div
        className="absolute right-0 top-2/3 w-32 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1.8 }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Small pre-title */}
        <motion.p
          className="text-[#C9A96E] text-xs sm:text-sm tracking-[0.4em] uppercase mb-6 sm:mb-8 font-light"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={0.1}
        >
          Collection 2026
        </motion.p>

        {/* Main title */}
        <motion.h1
          className="flex justify-center items-center mb-6 sm:mb-8 perspective-[1000px]"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {titleLetters.map((letter, i) => (
            <motion.span
              key={i}
              variants={letterVariants}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extralight text-white tracking-[0.15em] sm:tracking-[0.2em] inline-block"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.h1>

        {/* Decorative divider */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-6 sm:mb-8"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={1.0}
        >
          <span className="w-12 sm:w-16 h-px bg-[#C9A96E]/50" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
          <span className="w-12 sm:w-16 h-px bg-[#C9A96E]/50" />
        </motion.div>

        {/* Subtitle */}
        <motion.p
          className="text-white/70 text-base sm:text-lg md:text-xl font-light max-w-xl mx-auto mb-10 sm:mb-12 leading-relaxed"
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={1.2}
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
        >
          La mode et les tendances du monde entier, livr&eacute;es jusqu&rsquo;&agrave; vous.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          custom={1.5}
        >
          <Link
            href="/catalogue"
            className="group relative inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 border border-[#C9A96E] text-[#C9A96E] text-sm tracking-[0.2em] uppercase font-light overflow-hidden transition-colors duration-500 hover:text-black"
          >
            <span className="absolute inset-0 bg-[#C9A96E] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <span className="relative z-10">D&eacute;couvrir la collection</span>
            <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <motion.div
            className="w-px h-16 bg-gradient-to-b from-[#C9A96E]/50 to-transparent mx-auto"
            animate={{ scaleY: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}
