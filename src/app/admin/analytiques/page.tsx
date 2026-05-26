'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import type { Product, Order, Client } from '@/lib/types';
import { getItem } from '@/lib/admin/localStorage';
import { ORDER_STATUSES, formatPrice } from '@/lib/admin/constants';

/* ─── Types ─── */

type Period = '7' | '30' | 'all';

/* ─── Helpers ─── */

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isWithinPeriod(dateStr: string, period: Period): boolean {
  if (period === 'all') return true;
  const date = new Date(dateStr);
  const cutoff = daysAgo(Number(period));
  return date >= cutoff;
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "A l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD < 7) return `Il y a ${diffD}j`;
  return formatDate(dateStr);
}

/* ─── Status Bar Color Map ─── */

const STATUS_BAR_COLORS: Record<string, string> = {
  nouveau: 'bg-blue-500',
  confirme: 'bg-indigo-500',
  acompte_paye: 'bg-cyan-500',
  commande_fournisseur: 'bg-orange-500',
  en_transit: 'bg-yellow-500',
  arrive_kinshasa: 'bg-teal-500',
  livre: 'bg-emerald-500',
  annule: 'bg-red-500',
};

const CATEGORY_COLORS: Record<string, string> = {
  femme: 'bg-pink-500',
  homme: 'bg-blue-500',
  chaussures: 'bg-amber-500',
  accessoires: 'bg-purple-500',
  sacs: 'bg-emerald-500',
};

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  index,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  index: number;
  trend?: { value: string; positive: boolean } | null;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-bold text-gray-900 truncate">
            {value}
          </p>
          {trend && (
            <div className="mt-1.5 flex items-center gap-1">
              {trend.positive ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  trend.positive ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Section Wrapper ─── */

function Section({
  title,
  icon: Icon,
  iconColor,
  delay = 0,
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  delay?: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Main Analytics Page ─── */

export default function AnalytiquesPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([...staticProducts]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [period, setPeriod] = useState<Period>('30');

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

  /* ─── Filtered orders by period ─── */

  const filteredOrders = useMemo(
    () => orders.filter((o) => isWithinPeriod(o.createdAt, period)),
    [orders, period],
  );

  /* ─── Summary Stats ─── */

  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders],
  );

  const avgOrderValue = useMemo(
    () => (filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0),
    [totalRevenue, filteredOrders],
  );

  const newOrdersThisMonth = useMemo(() => {
    const now = new Date();
    return orders.filter((o) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [orders]);

  const repeatCustomers = useMemo(
    () => clients.filter((c) => c.totalOrders > 1).length,
    [clients],
  );

  const stats = [
    {
      label: "Chiffre d'affaires",
      value: formatPrice(totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-600',
      trend: filteredOrders.length > 0
        ? { value: `${filteredOrders.length} commandes`, positive: true }
        : null,
    },
    {
      label: 'Total commandes',
      value: String(filteredOrders.length),
      icon: ShoppingCart,
      color: 'bg-blue-600',
      trend: null,
    },
    {
      label: 'Panier moyen',
      value: formatPrice(avgOrderValue),
      icon: TrendingUp,
      color: 'bg-purple-600',
      trend: null,
    },
    {
      label: 'Total clients',
      value: String(clients.length),
      icon: Users,
      color: 'bg-amber-500',
      trend: null,
    },
    {
      label: 'Commandes ce mois',
      value: String(newOrdersThisMonth),
      icon: Calendar,
      color: 'bg-cyan-600',
      trend: null,
    },
    {
      label: 'Clients fideles',
      value: String(repeatCustomers),
      icon: Activity,
      color: 'bg-rose-500',
      trend: repeatCustomers > 0
        ? {
            value: `${((repeatCustomers / Math.max(clients.length, 1)) * 100).toFixed(0)}% du total`,
            positive: true,
          }
        : null,
    },
  ];

  /* ─── Revenue by Day (bar chart data) ─── */

  const dailyRevenue = useMemo(() => {
    const numDays = period === 'all' ? 30 : Number(period);
    const days: { date: Date; label: string; revenue: number; orderCount: number }[] = [];

    for (let i = numDays - 1; i >= 0; i--) {
      const d = daysAgo(i);
      days.push({
        date: d,
        label: formatShortDate(d.toISOString()),
        revenue: 0,
        orderCount: 0,
      });
    }

    filteredOrders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const dayEntry = days.find((d) => isSameDay(d.date, orderDate));
      if (dayEntry) {
        dayEntry.revenue += order.total;
        dayEntry.orderCount += 1;
      }
    });

    return days;
  }, [filteredOrders, period]);

  const maxRevenue = useMemo(
    () => Math.max(...dailyRevenue.map((d) => d.revenue), 1),
    [dailyRevenue],
  );

  /* ─── Orders by Status ─── */

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return ORDER_STATUSES.map((s) => ({
      ...s,
      count: counts[s.value] || 0,
    })).filter((s) => s.count > 0);
  }, [filteredOrders]);

  const maxStatusCount = useMemo(
    () => Math.max(...ordersByStatus.map((s) => s.count), 1),
    [ordersByStatus],
  );

  /* ─── Top Products by Order Count ─── */

  const topProducts = useMemo(() => {
    const productCounts: Record<string, { count: number; revenue: number; name: string; productId: string }> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productCounts[item.productId]) {
          productCounts[item.productId] = {
            count: 0,
            revenue: 0,
            name: item.productName,
            productId: item.productId,
          };
        }
        productCounts[item.productId].count += item.quantity;
        productCounts[item.productId].revenue += item.unitPrice * item.quantity;
      });
    });

    return Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredOrders]);

  /* ─── Revenue by Category ─── */

  const revenueByCategory = useMemo(() => {
    const catRevenue: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const product = allProducts.find((p) => p.id === item.productId);
        const cat = product?.category || 'autre';
        catRevenue[cat] = (catRevenue[cat] || 0) + item.unitPrice * item.quantity;
      });
    });

    const totalCatRevenue = Object.values(catRevenue).reduce((s, v) => s + v, 0);

    return Object.entries(catRevenue)
      .sort(([, a], [, b]) => b - a)
      .map(([category, revenue]) => ({
        category,
        label: getCategoryLabel(category),
        revenue,
        percentage: totalCatRevenue > 0 ? (revenue / totalCatRevenue) * 100 : 0,
        color: CATEGORY_COLORS[category] || 'bg-gray-500',
      }));
  }, [filteredOrders, allProducts]);

  /* ─── Recent Activity (last 10 orders) ─── */

  const recentActivity = useMemo(
    () =>
      [...filteredOrders]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 10),
    [filteredOrders],
  );

  /* ─── Top Clients ─── */

  const topClients = useMemo(
    () =>
      [...clients]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5),
    [clients],
  );

  /* ─── Period Selector Buttons ─── */

  const periods: { value: Period; label: string }[] = [
    { value: '7', label: '7 jours' },
    { value: '30', label: '30 jours' },
    { value: 'all', label: 'Tout' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytiques</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performances et tendances de votre boutique
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ─── Stat Cards ─── */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.label} {...stat} index={i} />
        ))}
      </div>

      {/* ─── Revenue Chart ─── */}
      <Section
        title="Revenus par jour"
        icon={BarChart3}
        iconColor="text-emerald-500"
        delay={0.3}
      >
        <div className="p-5">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <BarChart3 className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">
                Aucune donnee pour cette periode
              </p>
            </div>
          ) : (
            <>
              {/* Bar chart */}
              <div className="flex items-end gap-1 sm:gap-1.5" style={{ height: 220 }}>
                {dailyRevenue.map((day, i) => {
                  const heightPercent = (day.revenue / maxRevenue) * 100;
                  return (
                    <div
                      key={i}
                      className="group relative flex-1 flex flex-col items-center justify-end"
                      style={{ height: '100%' }}
                    >
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute -top-14 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-center opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                        <p className="whitespace-nowrap text-xs font-medium text-white">
                          {formatPrice(day.revenue)}
                        </p>
                        <p className="whitespace-nowrap text-[10px] text-gray-400">
                          {day.orderCount} cmd{day.orderCount !== 1 ? 's' : ''}
                        </p>
                        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>

                      {/* Bar */}
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercent, day.revenue > 0 ? 4 : 0)}%` }}
                        transition={{ delay: 0.4 + i * 0.02, duration: 0.5, ease: 'easeOut' }}
                        className={`w-full rounded-t-sm transition-colors ${
                          day.revenue > 0
                            ? 'bg-emerald-500 group-hover:bg-emerald-400'
                            : 'bg-gray-100'
                        }`}
                        style={{ minHeight: day.revenue > 0 ? 4 : 2 }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* X-axis labels */}
              <div className="mt-2 flex gap-1 sm:gap-1.5">
                {dailyRevenue.map((day, i) => (
                  <div key={i} className="flex-1 text-center">
                    {(period === '7' || i % Math.ceil(dailyRevenue.length / 10) === 0) && (
                      <span className="text-[9px] text-gray-400">{day.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Section>

      {/* ─── Two Columns: Orders by Status + Revenue by Category ─── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <Section
          title="Commandes par statut"
          icon={ShoppingCart}
          iconColor="text-blue-500"
          delay={0.35}
        >
          <div className="p-5">
            {ordersByStatus.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <ShoppingCart className="mb-2 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersByStatus.map((status, i) => {
                  const widthPercent = (status.count / maxStatusCount) * 100;
                  return (
                    <motion.div
                      key={status.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                    >
                      <div className="mb-1 flex items-center justify-between">
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                        <span className="text-xs font-bold text-gray-700">
                          {status.count}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${widthPercent}%` }}
                          transition={{ delay: 0.5 + i * 0.05, duration: 0.6, ease: 'easeOut' }}
                          className={`h-full rounded-full ${STATUS_BAR_COLORS[status.value] || 'bg-gray-400'}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        {/* Revenue by Category */}
        <Section
          title="Revenus par categorie"
          icon={Package}
          iconColor="text-purple-500"
          delay={0.4}
        >
          <div className="p-5">
            {revenueByCategory.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Package className="mb-2 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune donnee</p>
              </div>
            ) : (
              <>
                {/* Visual breakdown bar */}
                <div className="mb-5 flex h-4 overflow-hidden rounded-full bg-gray-100">
                  {revenueByCategory.map((cat, i) => (
                    <motion.div
                      key={cat.category}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                      className={`${cat.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === revenueByCategory.length - 1 ? 'rounded-r-full' : ''}`}
                    />
                  ))}
                </div>

                {/* Category list */}
                <div className="space-y-3">
                  {revenueByCategory.map((cat, i) => (
                    <motion.div
                      key={cat.category}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 + i * 0.05 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                        <span className="text-sm font-medium text-gray-700">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(cat.revenue)}
                        </span>
                        <span className="w-12 text-right text-xs text-gray-400">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Section>
      </div>

      {/* ─── Top Products ─── */}
      <div className="mt-6">
        <Section
          title="Top produits"
          icon={TrendingUp}
          iconColor="text-amber-500"
          delay={0.45}
        >
          {topProducts.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">
                Aucune vente pour cette periode
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      #
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Produit
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Vendus
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Revenus
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topProducts.map((item, i) => (
                    <motion.tr
                      key={item.productId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-600">
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[250px]">
                          {item.name}
                        </p>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {item.count} {item.count > 1 ? 'unites' : 'unite'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatPrice(item.revenue)}
                        </p>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* ─── Two Columns: Recent Activity + Top Clients ─── */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity Timeline */}
        <Section
          title="Activite recente"
          icon={Activity}
          iconColor="text-cyan-500"
          delay={0.5}
        >
          <div className="p-5">
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <Activity className="mb-2 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-400">Aucune activite</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gray-100" />

                <div className="space-y-4">
                  {recentActivity.map((order, i) => {
                    const statusInfo = getStatusStyle(order.status);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55 + i * 0.04 }}
                        className="relative flex gap-4 pl-7"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white shadow-sm ${
                            STATUS_BAR_COLORS[order.status] || 'bg-gray-400'
                          }`}
                        />

                        <div className="min-w-0 flex-1 rounded-lg bg-gray-50 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {order.orderNumber}
                              </p>
                              <p className="mt-0.5 text-xs text-gray-500 truncate">
                                {order.clientName}
                              </p>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <p className="text-sm font-bold text-gray-900">
                                {formatPrice(order.total)}
                              </p>
                              <span
                                className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusInfo.bg} ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1.5 text-[10px] text-gray-400">
                            {relativeTime(order.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Top Clients */}
        <Section
          title="Meilleurs clients"
          icon={Users}
          iconColor="text-rose-500"
          delay={0.55}
        >
          {topClients.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Users className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm text-gray-400">Aucun client</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Client
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Commandes
                    </th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Total depense
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topClients.map((client, i) => (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.05 }}
                      className="transition-colors hover:bg-gray-50/50"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              i === 0
                                ? 'bg-amber-500'
                                : i === 1
                                  ? 'bg-gray-400'
                                  : i === 2
                                    ? 'bg-amber-700'
                                    : 'bg-gray-300'
                            }`}
                          >
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {client.name}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {client.city}
                              {client.isVip && (
                                <span className="ml-1.5 inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-600">
                                  VIP
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm text-gray-600">
                          {client.totalOrders}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(client.totalSpent)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
