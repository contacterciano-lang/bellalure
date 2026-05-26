'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';

function getTargetDate(): Date {
  if (typeof window === 'undefined') {
    return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  }

  const storageKey = 'bellalure_promo_target';
  const stored = localStorage.getItem(storageKey);

  if (stored) {
    const date = new Date(stored);
    if (date.getTime() > Date.now()) {
      return date;
    }
  }

  const target = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  localStorage.setItem(storageKey, target.toISOString());
  return target;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(target: Date): TimeLeft {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountdownBox({
  value,
  label,
  delay,
}: {
  value: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-[#C9A96E]/30">
        <span className="text-2xl sm:text-3xl font-light text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs tracking-[0.2em] uppercase text-[#C9A96E] font-medium">
        {label}
      </span>
    </motion.div>
  );
}

export default function PromoCountdown() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-50px' });
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const target = getTargetDate();
    setTimeLeft(calculateTimeLeft(target));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(target));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 sm:py-24 overflow-hidden"
    >
      {/* Dark background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

      {/* Gold accent shapes */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#C9A96E]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#C9A96E]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      {/* Decorative borders */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A96E]/30 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="w-12 h-12 flex items-center justify-center border border-[#C9A96E]/30 rotate-45">
            <Clock className="w-5 h-5 text-[#C9A96E] -rotate-45" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-extralight text-white tracking-tight mb-3"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Arrivage Sp&eacute;cial &mdash; Offre Limit&eacute;e
        </motion.h2>

        <motion.p
          className="text-white/50 text-sm sm:text-base font-light mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Profitez de nos prix exclusifs avant la fin du d&eacute;compte
        </motion.p>

        {/* Countdown */}
        {mounted && (
          <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10 sm:mb-12">
            <CountdownBox value={timeLeft.days} label="Jours" delay={0.3} />
            <span className="text-[#C9A96E]/50 text-2xl font-extralight mt-[-20px]">
              :
            </span>
            <CountdownBox value={timeLeft.hours} label="Heures" delay={0.4} />
            <span className="text-[#C9A96E]/50 text-2xl font-extralight mt-[-20px]">
              :
            </span>
            <CountdownBox
              value={timeLeft.minutes}
              label="Minutes"
              delay={0.5}
            />
            <span className="text-[#C9A96E]/50 text-2xl font-extralight mt-[-20px]">
              :
            </span>
            <CountdownBox
              value={timeLeft.seconds}
              label="Secondes"
              delay={0.6}
            />
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Link
            href="/catalogue?filter=promo"
            className="group inline-flex items-center gap-3 px-8 sm:px-10 py-4 bg-[#C9A96E] text-black text-xs sm:text-sm tracking-[0.2em] uppercase font-medium hover:bg-white transition-colors duration-400"
          >
            Voir les promos
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
