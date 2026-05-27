'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Clock,
  Truck,
  PackageCheck,
  CreditCard,
  ArrowUpRight,
  CalendarDays,
} from 'lucide-react';
import type { Product, WhatsAppOrder, OrderStatus } from '@/lib/types';
import { fetchWhatsAppOrders } from '@/lib/whatsappOrders';
import { ORDER_STATUSES, formatPrice } from '@/lib/admin/constants';

/* ─── CA logic ───
   Commandes comptées dans le CA : acompte payé → livré.
   Exclues : nouvelle commande, confirmé (pas encore payé), annulé. */
const VALIDATED: OrderStatus[] = [
  'acompte_paye',
  'commande_fournisseur',
  'en_transit',
  'arrive_kinshasa',
  'livre',
];
const SUPPLIER_STATUSES: OrderStatus[] = [
  'acompte_paye',
  'commande_fournisseur',
  'en_transit',
  'arrive_kinshasa',
];

function isToday(s: string): boolean {
  const d = new Date(s);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
}
function isThisMonth(s: string): boolean {
  const d = new Date(s);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}
function statusStyle(status: string) {
  return ORDER_STATUSES.find((s) => s.value === status) || { label: status, color: 'text-gray-700', bg: 'bg-gray-50' };
}

function StatCard({
  label, value, sub, icon: Icon, color, index,
}: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchWhatsAppOrders(),
      fetch('/api/products', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ]).then(([o, p]) => {
      setOrders(Array.isArray(o) ? o : []);
      setProducts(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, []);

  const m = useMemo(() => {
    const validated = orders.filter((o) => VALIDATED.includes(o.status));
    const validatedToday = validated.filter((o) => isToday(o.createdAt));
    const validatedMonth = validated.filter((o) => isThisMonth(o.createdAt));
    const sum = (arr: WhatsAppOrder[], k: 'totalAmount' | 'profit') =>
      arr.reduce((s, o) => s + (o[k] ?? 0), 0);

    const count = (st: OrderStatus | OrderStatus[]) => {
      const set = Array.isArray(st) ? st : [st];
      return orders.filter((o) => set.includes(o.status)).length;
    };

    const caMonth = sum(validatedMonth, 'totalAmount');
    const avgBasket = validatedMonth.length ? caMonth / validatedMonth.length : 0;

    // Top produits par quantité commandée (toutes commandes hors annulées)
    const byProduct = new Map<string, { name: string; image: string; qty: number; revenue: number }>();
    for (const o of orders) {
      if (o.status === 'annule') continue;
      const key = o.productId || o.productName;
      const cur = byProduct.get(key) || { name: o.productName, image: o.productImage, qty: 0, revenue: 0 };
      cur.qty += o.quantity || 1;
      if (VALIDATED.includes(o.status)) cur.revenue += o.totalAmount ?? 0;
      byProduct.set(key, cur);
    }
    const topProducts = [...byProduct.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);

    const recent = [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return {
      caToday: sum(validatedToday, 'totalAmount'),
      caMonth,
      profitToday: sum(validatedToday, 'profit'),
      profitMonth: sum(validatedMonth, 'profit'),
      ordersToday: orders.filter((o) => isToday(o.createdAt)).length,
      pending: count('nouveau'),
      acompte: count('acompte_paye'),
      supplier: count(SUPPLIER_STATUSES),
      transit: count('en_transit'),
      delivered: count('livre'),
      avgBasket,
      topProducts,
      recent,
      totalOrders: orders.length,
    };
  }, [orders]);

  const cards = [
    { label: "CA du jour", value: formatPrice(m.caToday), sub: `${m.ordersToday} commande(s) aujourd'hui`, icon: DollarSign, color: 'bg-emerald-600' },
    { label: 'CA du mois', value: formatPrice(m.caMonth), sub: 'Commandes validées', icon: CalendarDays, color: 'bg-emerald-700' },
    { label: 'Bénéfice du jour', value: formatPrice(m.profitToday), sub: `Mois : ${formatPrice(m.profitMonth)}`, icon: TrendingUp, color: 'bg-indigo-600' },
    { label: 'Panier moyen', value: formatPrice(m.avgBasket), sub: 'Sur le mois', icon: Wallet, color: 'bg-purple-600' },
    { label: 'En attente', value: String(m.pending), sub: 'Nouvelles commandes', icon: Clock, color: 'bg-blue-600' },
    { label: 'Cmd. fournisseur', value: String(m.supplier), sub: 'Acompte → arrivé', icon: Truck, color: 'bg-orange-500' },
    { label: 'En transit', value: String(m.transit), icon: PackageCheck, color: 'bg-yellow-500' },
    { label: 'Livrées', value: String(m.delivered), icon: CreditCard, color: 'bg-teal-600' },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">
          {loading ? 'Chargement…' : `Vue d'ensemble — ${m.totalOrders} commande(s) au total`}
        </p>
      </motion.div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top produits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <TrendingUp className="h-5 w-5 text-purple-500" />
            <h2 className="text-sm font-semibold text-gray-900">Produits les plus commandés</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {m.topProducts.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Aucune commande pour le moment</div>
            ) : m.topProducts.map((p, i) => (
              <div key={p.name + i} className="flex items-center gap-3 px-5 py-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-500">{i + 1}</span>
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" sizes="40px" unoptimized />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.qty} commandé(s)</p>
                </div>
                <span className="text-xs font-semibold text-gray-700">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">Commandes récentes</h2>
            </div>
            <Link href="/admin/commandes" className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
              Voir tout <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {m.recent.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-400">Aucune commande</div>
            ) : m.recent.map((o) => {
              const s = statusStyle(o.status);
              return (
                <div key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {o.productImage && <Image src={o.productImage} alt={o.productName} fill className="object-cover" sizes="40px" unoptimized />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{o.productName}</p>
                    <p className="text-[11px] text-gray-400">
                      {o.customerName || o.customerPhone || 'Client WhatsApp'} · {new Date(o.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatPrice(o.totalAmount ?? o.price)}</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.color}`}>{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
