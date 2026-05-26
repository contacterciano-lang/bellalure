'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/ThemeProvider';
import SearchOverlay from '@/components/ui/SearchOverlay';

const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/catalogue?filter=nouveau', label: 'Nouveautés' },
  { href: '/catalogue?filter=tendance', label: 'Tendances' },
  { href: '/contact', label: 'Contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${
            scrolled
              ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl shadow-sm shadow-black/5'
              : 'bg-white dark:bg-black'
          }
        `}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-black dark:text-white transition-colors hover:bg-black/5 dark:hover:bg-white/10 lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-light tracking-[0.3em] text-black dark:text-white uppercase select-none"
          >
            BELLALURE
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-medium uppercase tracking-widest text-black/70 dark:text-white/70 transition-colors hover:text-black dark:hover:text-white group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-black dark:bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 dark:text-white/70 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
              aria-label="Rechercher"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>

            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full text-black/70 dark:text-white/70 transition-colors hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white"
              aria-label={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacer to account for fixed header */}
      <div className="h-16" />

      {/* Mobile slide-in menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-y-0 left-0 z-[70] w-[300px] bg-white dark:bg-black shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Panel header */}
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 px-6 py-5">
                  <span className="text-sm font-light tracking-[0.3em] text-black dark:text-white uppercase">
                    BELLALURE
                  </span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-black/60 dark:text-white/60 transition-colors hover:bg-black/5 dark:hover:bg-white/10"
                    aria-label="Fermer le menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 overflow-y-auto px-6 py-8">
                  <div className="space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center py-3 text-sm font-medium uppercase tracking-widest text-black/70 dark:text-white/70 transition-colors hover:text-black dark:hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </nav>

                {/* Panel footer */}
                <div className="border-t border-black/5 dark:border-white/10 px-6 py-5">
                  <button
                    onClick={() => {
                      toggleTheme();
                    }}
                    className="flex w-full items-center gap-3 py-2 text-xs font-medium uppercase tracking-widest text-black/50 dark:text-white/50 transition-colors hover:text-black dark:hover:text-white"
                  >
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
