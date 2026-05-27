'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Factory,
  Layers,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { label: 'Produits', href: '/admin/produits', icon: Package },
  { label: 'Commandes', href: '/admin/commandes', icon: ShoppingCart },
  { label: 'Commandes fournisseur', href: '/admin/commandes-fournisseur', icon: Truck },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Fournisseurs', href: '/admin/fournisseurs', icon: Factory },
  { label: 'Collections', href: '/admin/collections', icon: Layers },
  { label: 'Analytiques', href: '/admin/analytiques', icon: BarChart3 },
  { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({ open, onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <Link href="/admin" className="text-lg font-bold tracking-wider text-gray-900">
            BELLALURE
          </Link>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-900"
          >
            <ExternalLink className="h-5 w-5 text-gray-400" />
            Voir la boutique
          </a>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
