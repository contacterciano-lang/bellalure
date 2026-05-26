'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import type { Product, Order, Client } from '@/lib/types';
import { getItem } from '@/lib/admin/localStorage';
import { ORDER_STATUSES, formatPrice } from '@/lib/admin/constants';

/* ─── Helpers ─── */

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function getStatusStyle(status: string) {
  const found = ORDER_STATUSES.find((s) => s.value === status);
  return found || { label: status, color: 'text-gray-700', bg: 'bg-gray-50' };
}

function getCategoryLabel(slug: string): string {
  const map: Record<string, string> = {
    femme: 'Femme',
    homme: 'Homme',
    chaussures: 'Chaussures',
    accessoires: 'Accessoires',
    sacs: 'Sacs',
  };
  return map[slug] || slug;
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  index,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Dashboard ─── */

export default function AdminDashboardPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([...staticProducts]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  /* Load dynamic products from API + merge with static */
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((dynamic: Product[]) => {
        if (Array.isArray(dynamic) && dynamic.length > 0) {
          const dynamicIds = new Set(dynamic.map((p) => p.id));
          const remainingStatic = staticProducts.filter(
            (p) => !dynamicIds.has(p.id),
          );
          setAllProducts([...remainingStatic, ...dynamic]);
        }
      })
      .catch(() => {});
  }, []);

  /* Load orders & clients from localStorage */
  useEffect(() => {
    setOrders(getItem<Order[]>('bellalure-orders', []));
    setClients(getItem<Client[]>('bellalure-clients', []));
  }, []);

  /* ─── Computed stats ─── */

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const ordersToday = useMemo(
    () => orders.filter((o) => isToday(o.createdAt)),
    [orders],
  );

  const activeProducts = useMemo(
    () => allProducts.filter((p) => p.stock > 0).length,
    [allProducts],
  );

  /* Low-stock products (stock <= 5, excluding 0) */
  const lowStockProducts = useMemo(
    () =>
      allProducts
        .filter((p) => p.stock > 0 && p.stock <= 5)
        .sort((a, b) => a.stock - b.stock),
    [allProducts],
  );

  /* Top 5 products by reviews */
  const popularProducts = useMemo(
    () =>
      [...allProducts]
        .sort((a, b) => b.reviews - a.reviews)
        .slice(0, 5),
    [allProducts],
  );

  /* Recent 5 orders */
  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5),
    [orders],
  );

  const stats = [
    {
      label: "Chiffre d'affaires",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-600',
    },
    {
      label: 'Commandes du jour',
      value: String(ordersToday.length),
      icon: ShoppingCart,
      color: 'bg-blue-600',
    },
    {
      label: 'Produits actifs',
      value: String(activeProducts),
      icon: Package,
      color: 'bg-purple-600',
    },
    {
      label: 'Clients',
      value: String(clients.length),
      icon: Users,
      color: 'bg-amber-500',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          Vue d&apos;ensemble de votre boutique Bellalure
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* Two-column grid: Low stock + Popular */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ─── Low Stock Alerts ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              Alertes de stock
            </h2>
            {lowStockProducts.length > 0 && (
              <span className="ml-auto inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                {lowStockProducts.length}
              </span>
            )}
          </div>

          <div className="divide-y divide-gray-50">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Package className="mb-2 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">
                  Tous les stocks sont suffisants
                </p>
              </div>
            ) : (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {product.name}
                    </p>
                  </div>
                  <span
                    className={`inline-flex min-w-[2rem] items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      product.stock <= 2
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {product.stock}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* ─── Popular Products ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              Produits populaires
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {popularProducts.map((product, i) => (
              <div
                key={product.id}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">
                  {i + 1}
                </span>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {getCategoryLabel(product.category)}
                  </p>
                </div>
                <span className="text-xs font-medium text-gray-500">
                  {product.reviews} avis
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ─── Recent Orders ─── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
            <h2 className="text-sm font-semibold text-gray-900">
              Commandes r&eacute;centes
            </h2>
          </div>
          {orders.length > 0 && (
            <Link
              href="/admin/commandes"
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Voir tout
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <ShoppingCart className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              Aucune commande pour le moment
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Les commandes appara&icirc;tront ici d&egrave;s qu&apos;un
              client passera une commande.
            </p>
            <Link
              href="/admin/commandes"
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <ShoppingCart className="h-4 w-4" />
              Cr&eacute;er une commande
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Commande
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const statusInfo = getStatusStyle(order.status);
                  return (
                    <tr
                      key={order.id}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            'fr-FR',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-700">
                          {order.clientName}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.total, order.currency === 'USD' ? '$' : order.currency)}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
