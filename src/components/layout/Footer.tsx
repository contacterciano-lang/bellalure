'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, MapPin, CreditCard, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import { siteConfig } from '@/lib/config';

const footerLinks = {
  boutique: [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/catalogue' },
    { label: 'Nouveautes', href: '/catalogue?badge=nouveau' },
    { label: 'Tendances', href: '/catalogue?badge=tendance' },
    { label: 'Promotions', href: '/catalogue?badge=promo' },
  ],
  categories: [
    { label: 'Femme', href: '/catalogue?category=femme' },
    { label: 'Homme', href: '/catalogue?category=homme' },
    { label: 'Chaussures', href: '/catalogue?category=chaussures' },
    { label: 'Accessoires', href: '/catalogue?category=accessoires' },
    { label: 'Sacs', href: '/catalogue?category=sacs' },
  ],
  aide: [
    { label: 'Livraison', href: '/livraison' },
    { label: 'Retours & echanges', href: '/retours' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact', href: '/contact' },
    { label: 'Guide des tailles', href: '/guide-tailles' },
  ],
  legal: [
    { label: 'A propos', href: '/a-propos' },
    { label: 'CGV', href: '/cgv' },
    { label: 'Politique de confidentialite', href: '/confidentialite' },
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

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.16z" />
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
    <footer className="bg-[#F5F0EB]">
      {/* Newsletter */}
      <div className="border-b border-black/5">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md text-center">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.3em] text-black/40">
              Newsletter
            </h3>
            <p className="mt-2 text-lg font-light text-black">
              Recevez nos dernieres tendances
            </p>
            <form onSubmit={handleSubscribe} className="mt-6 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                className="flex-1 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-black placeholder-black/30 outline-none transition-all focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/20"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-[#C9A96E]"
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

      {/* Links grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="text-sm font-light tracking-[0.3em] text-black uppercase">
              BELLALURE
            </Link>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-black/50">
              {siteConfig.slogan}
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { href: siteConfig.social.instagram, Icon: InstagramIcon, label: 'Instagram' },
                { href: siteConfig.social.tiktok, Icon: TikTokIcon, label: 'TikTok' },
                { href: siteConfig.social.facebook, Icon: FacebookIcon, label: 'Facebook' },
              ].map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-black/50 transition-all hover:border-[#C9A96E] hover:text-[#C9A96E]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Boutique */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">Boutique</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.boutique.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-black/60 transition-colors hover:text-black">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">Categories</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.categories.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-black/60 transition-colors hover:text-black">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">Aide</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.aide.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-black/60 transition-colors hover:text-black">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">Informations</h4>
            <ul className="mt-4 space-y-2.5">
              {footerLinks.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs text-black/60 transition-colors hover:text-black">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment & delivery */}
        <div className="mt-12 border-t border-black/5 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 text-black/30" />
              <div className="flex flex-wrap gap-2">
                {siteConfig.delivery.payment.map((m) => (
                  <span key={m} className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-medium text-black/50">{m}</span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-4 w-4 text-black/30" />
              <div className="flex flex-wrap gap-2">
                {siteConfig.delivery.zones.map((z) => (
                  <span key={z.name} className="flex items-center gap-1 text-[10px] font-medium text-black/50">
                    <MapPin className="h-3 w-3" />{z.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <p className="text-[10px] text-black/30">
              &copy; {new Date().getFullYear()} Bellalure. Tous droits reserves.
            </p>
            <div className="flex gap-4">
              <Link href="/cgv" className="text-[10px] text-black/30 hover:text-black">CGV</Link>
              <Link href="/confidentialite" className="text-[10px] text-black/30 hover:text-black">Confidentialite</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
