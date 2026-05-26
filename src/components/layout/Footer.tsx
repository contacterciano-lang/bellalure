'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  MapPin,
  CreditCard,
  Truck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/config';

const footerLinks = {
  boutique: [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Nouveautés', href: '/catalogue?filter=nouveau' },
    { label: 'Tendances', href: '/catalogue?filter=tendance' },
    { label: 'Promotions', href: '/catalogue?filter=promo' },
  ],
  categories: [
    { label: 'Femme', href: '/catalogue?category=femme' },
    { label: 'Homme', href: '/catalogue?category=homme' },
    { label: 'Chaussures', href: '/catalogue?category=chaussures' },
    { label: 'Accessoires', href: '/catalogue?category=accessoires' },
    { label: 'Sacs', href: '/catalogue?category=sacs' },
  ],
  aide: [
    { label: 'Comment commander', href: `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Bonjour Bellalure, comment puis-je passer une commande ?')}` },
    { label: 'Livraison', href: `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Bonjour Bellalure, quels sont vos délais et zones de livraison ?')}` },
    { label: 'Retours', href: `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Bonjour Bellalure, quelle est votre politique de retours ?')}` },
    { label: 'FAQ', href: `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}?text=${encodeURIComponent('Bonjour Bellalure, j\'ai une question.')}` },
  ],
  contact: [
    { label: 'WhatsApp', href: `https://wa.me/${siteConfig.whatsapp.number.replace(/[^0-9+]/g, '')}` },
    { label: 'Instagram', href: siteConfig.social.instagram },
    { label: 'Email', href: 'mailto:contact@bellalure.com' },
  ],
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z" />
    </svg>
  );
}

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#F5F0EB] dark:bg-zinc-900">
      {/* Newsletter section */}
      <div className="border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-xs font-medium uppercase tracking-[0.3em] text-black/50 dark:text-white/50">
              Newsletter
            </h3>
            <p className="mt-2 text-lg font-light text-black dark:text-white">
              Recevez nos derni&egrave;res tendances
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-black px-5 py-3 text-sm text-black dark:text-white placeholder-black/30 dark:placeholder-white/30 outline-none transition-all focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/20"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black transition-colors hover:bg-black/80 dark:hover:bg-white/80"
                aria-label="S'inscrire"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
            {subscribed && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-xs text-[#C9A96E]"
              >
                Merci pour votre inscription !
              </motion.p>
            )}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link
              href="/"
              className="text-sm font-light tracking-[0.3em] text-black dark:text-white uppercase"
            >
              BELLALURE
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-black/50 dark:text-white/50">
              {siteConfig.slogan}
            </p>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E]"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E]"
                aria-label="TikTok"
              >
                <TikTokIcon className="h-4 w-4" />
              </a>
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 dark:border-white/10 text-black/50 dark:text-white/50 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E]"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
              Boutique
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.boutique.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Catégories */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
              Cat&eacute;gories
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
              Aide
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.aide.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40 dark:text-white/40">
              Contact
            </h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.contact.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-xs text-black/60 dark:text-white/60 transition-colors hover:text-black dark:hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment, delivery & copyright */}
        <div className="mt-12 border-t border-black/5 dark:border-white/10 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Payment methods */}
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-black/30 dark:text-white/30" />
              <div className="flex flex-wrap gap-2">
                {siteConfig.delivery.payment.slice(0, 4).map((method) => (
                  <span
                    key={method}
                    className="rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-black px-2.5 py-1 text-[10px] font-medium text-black/50 dark:text-white/50"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Delivery zones */}
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-black/30 dark:text-white/30" />
              <div className="flex flex-wrap gap-2">
                {['Kinshasa', 'France', 'International'].map((zone) => (
                  <span
                    key={zone}
                    className="flex items-center gap-1 text-[10px] font-medium text-black/50 dark:text-white/50"
                  >
                    <MapPin className="h-3 w-3" />
                    {zone}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-black/30 dark:text-white/30">
              &copy; 2024 Bellalure. Tous droits r&eacute;serv&eacute;s.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
