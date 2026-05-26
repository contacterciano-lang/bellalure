'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import CurrencySelector from '@/components/ui/CurrencySelector';
import SearchOverlay from '@/components/ui/SearchOverlay';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/catalogue?badge=nouveau', label: 'Nouveautes' },
  { href: '/catalogue?badge=tendance', label: 'Tendances' },
  { href: '/a-propos', label: 'A propos' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-black text-white">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-center px-4 text-[10px] font-medium uppercase tracking-[0.2em]">
          Livraison Kinshasa &bull; Provinces RDC &bull; International
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-sm shadow-black/5'
            : 'bg-white'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: mobile menu + nav */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-[11px] font-medium uppercase tracking-[0.12em] text-black/60 transition-colors hover:text-black group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#C9A96E] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-lg font-light tracking-[0.35em] text-black uppercase select-none lg:text-xl"
          >
            BELLALURE
          </Link>

          {/* Right: actions */}
          <div className="flex items-center gap-1">
            <div className="hidden sm:block">
              <CurrencySelector />
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              aria-label="Rechercher"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <Link
              href="/wishlist"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              aria-label="Favoris"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#C9A96E] px-1 text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <button
              onClick={openCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-black/60 transition-colors hover:bg-black/5 hover:text-black"
              aria-label="Panier"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-[70] w-[300px] bg-white shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-black/5 px-6 py-5">
                  <span className="text-sm font-light tracking-[0.3em] uppercase">BELLALURE</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-black/60 hover:bg-black/5"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 py-8">
                  <div className="space-y-1">
                    {navLinks.map((link, i) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center py-3 text-sm font-medium uppercase tracking-widest text-black/70 hover:text-black"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-8 border-t border-black/5 pt-6 space-y-1">
                    {[
                      { href: '/livraison', label: 'Livraison' },
                      { href: '/faq', label: 'FAQ' },
                      { href: '/contact', label: 'Contact' },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center py-2.5 text-xs font-medium uppercase tracking-widest text-black/40 hover:text-black"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="border-t border-black/5 px-6 py-4">
                  <CurrencySelector />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
