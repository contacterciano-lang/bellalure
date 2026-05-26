'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Search, Flame, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import SearchOverlay from '@/components/ui/SearchOverlay';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  action?: 'search';
}

const navItems: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Catalogue', href: '/catalogue', icon: Grid3X3 },
  { label: 'Recherche', href: '#', icon: Search, action: 'search' },
  { label: 'Tendances', href: '/catalogue?filter=tendance', icon: Flame },
  { label: 'Menu', href: '/menu', icon: Menu },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
        <div className="border-t border-black/5 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !item.action && isActive(item.href);

              if (item.action === 'search') {
                return (
                  <button
                    key={item.label}
                    onClick={() => setSearchOpen(true)}
                    className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1"
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5 text-black/40 dark:text-white/40 transition-colors" />
                    <span className="text-[9px] font-medium text-black/40 dark:text-white/40">
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative flex flex-col items-center justify-center gap-0.5 px-3 py-1"
                  aria-label={item.label}
                >
                  <Icon
                    className={`h-5 w-5 transition-colors ${
                      active
                        ? 'text-black dark:text-white'
                        : 'text-black/40 dark:text-white/40'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-medium transition-colors ${
                      active
                        ? 'text-black dark:text-white'
                        : 'text-black/40 dark:text-white/40'
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="mobile-nav-indicator"
                      className="absolute -top-px left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-[#C9A96E]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile nav spacer */}
      <div className="h-16 md:hidden" />

      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
