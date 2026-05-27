'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Truck, Search, RefreshCw, MessageCircle, Package, Clock, TrendingUp, DollarSign, Check, AlertTriangle,
} from 'lucide-react';
import type { WhatsAppOrder, OrderStatus } from '@/lib/types';
import { fetchWhatsAppOrders, updateOrderStatus, buildNotifyUrl } from '@/lib/whatsappOrders';
import { ORDER_STATUSES, formatPrice } from '@/lib/admin/constants';

// Étapes "fournisseur" : de l'acompte payé jusqu'à l'arrivée (avant livraison finale).
const SUPPLIER_STATUSES: OrderStatus[] = [
  'acompte_paye', 'commande_fournisseur', 'en_transit', 'arrive_kinshasa',
];
// Statuts sélectionnables dans le flux fournisseur (+ livré pour clôturer).
const FLOW: OrderStatus[] = [...SUPPLIER_STATUSES, 'livre'];

export default function CommandesFournisseurPage() {
  const [orders, setOrders] = useState<WhatsAppOrder[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchWhatsAppOrders().then((o) => { setOrders(o); setLoading(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = orders.filter((o) => SUPPLIER_STATUSES.includes(o.status));
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((o) =>
        o.productName.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.customerPhone || '').includes(q),
      );
    }
    return list;
  }, [orders, search]);

  const totals = useMemo(() => ({
    ca: filtered.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
    cout: filtered.reduce((s, o) => s + (o.supplierTotal ?? 0), 0),
    marge: filtered.reduce((s, o) => s + (o.profit ?? 0), 0),
  }), [filtered]);

  const changeStatus = useCallback(async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const ok = await updateOrderStatus(id, status);
    const label = ORDER_STATUSES.find((s) => s.value === status)?.label || status;
    if (ok) showToast(`Statut: ${label}`);
    else { showToast('Erreur de mise à jour', 'error'); load(); }
  }, [showToast, load]);

  const fmtDate = (s: string) => {
    try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
    catch { return s; }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
            <Truck className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commandes fournisseur</h1>
            <p className="mt-0.5 text-sm text-gray-500">{filtered.length} commande(s) en cours de traitement fournisseur</p>
          </div>
        </div>
      </motion.div>

      {/* Totaux */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'CA (prix de vente)', value: formatPrice(totals.ca), icon: DollarSign, color: 'bg-emerald-600' },
          { label: 'Coût fournisseur', value: formatPrice(totals.cout), icon: Package, color: 'bg-orange-500' },
          { label: 'Marge estimée', value: formatPrice(totals.marge), icon: TrendingUp, color: 'bg-indigo-600' },
        ].map((c) => (
          <div key={c.label} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{c.value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${c.color}`}>
              <c.icon className="h-5 w-5 text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* Recherche + refresh */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher produit ou client..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <button onClick={load} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> <span className="hidden sm:inline">Actualiser</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Truck className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Aucune commande fournisseur</p>
            <p className="mt-1 text-xs text-gray-400">Les commandes passées en « Acompte payé » apparaîtront ici.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3 text-center">Qté</th>
                  <th className="px-4 py-3 text-right">Prix vente</th>
                  <th className="px-4 py-3 text-right">Prix fourn.</th>
                  <th className="px-4 py-3 text-right">Marge</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3 text-center">Statut</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((o) => {
                  const notify = buildNotifyUrl(o);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            {o.productImage && <Image src={o.productImage} alt={o.productName} fill className="object-cover" sizes="40px" unoptimized />}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900" title={o.productName}>
                              {o.productName.length > 40 ? o.productName.slice(0, 40) + '…' : o.productName}
                            </p>
                            <p className="flex items-center gap-1 text-[11px] text-gray-400"><Clock className="h-3 w-3" />{fmtDate(o.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-700">{o.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{formatPrice(o.totalAmount ?? 0)}</td>
                      <td className="px-4 py-3 text-right text-sm text-orange-600">{formatPrice(o.supplierTotal ?? 0)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-sm font-semibold ${(o.profit ?? 0) > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{formatPrice(o.profit ?? 0)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{o.customerName || '—'}</p>
                        <p className="text-[11px] text-gray-400">{o.customerPhone || 'n° non renseigné'}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={o.status}
                          onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-900 outline-none focus:border-black"
                        >
                          {FLOW.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUSES.find((x) => x.value === s)?.label || s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {notify ? (
                          <a href={notify} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#20BD5B]"
                            title="Notifier le client du statut">
                            <MessageCircle className="h-3.5 w-3.5" /> Notifier
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-400" title="N° client manquant (page Commandes)">
                            <MessageCircle className="h-3.5 w-3.5" /> Notifier
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
