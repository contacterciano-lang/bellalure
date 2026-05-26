'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Star,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  AlertTriangle,
  Check,
  Loader2,
  Crown,
  Eye,
  DollarSign,
  Calendar,
  FileText,
} from 'lucide-react';
import { getItem, setItem } from '@/lib/admin/localStorage';
import { formatPrice } from '@/lib/admin/constants';
import type { Client } from '@/lib/types';

/* ─── Constants ─── */

const STORAGE_KEY = 'bellalure-clients';

type VipFilter = 'tous' | 'vip' | 'standard';

interface ClientFormData {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  notes: string;
  isVip: boolean;
}

const EMPTY_FORM: ClientFormData = {
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  country: 'RDC',
  notes: '',
  isVip: false,
};

/* ═══════════════════════════════════════════════
   Modal Wrapper
   ═══════════════════════════════════════════════ */

function Modal({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10"
        onClick={onClose}
      >
        <motion.div
          key="dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full rounded-2xl bg-white shadow-xl ${wide ? 'max-w-2xl' : 'max-w-lg'}`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   Stat Card
   ═══════════════════════════════════════════════ */

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   VIP Badge
   ═══════════════════════════════════════════════ */

function VipBadge({ isVip }: { isVip: boolean }) {
  if (!isVip) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
      <Crown className="h-3 w-3" />
      VIP
    </span>
  );
}

/* ═══════════════════════════════════════════════
   Client Form
   ═══════════════════════════════════════════════ */

function ClientForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
  showVipToggle,
}: {
  data: ClientFormData;
  onChange: (d: ClientFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  showVipToggle?: boolean;
}) {
  const set = <K extends keyof ClientFormData>(key: K, val: ClientFormData[K]) =>
    onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Nom complet *
        </label>
        <input
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Ex: Jean-Pierre Mukendi"
        />
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Telephone *
          </label>
          <input
            value={data.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="+243 ..."
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => set('email', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="client@email.com"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Adresse
        </label>
        <input
          value={data.address}
          onChange={(e) => set('address', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Avenue, n°, quartier..."
        />
      </div>

      {/* City + Country */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Ville
          </label>
          <input
            value={data.city}
            onChange={(e) => set('city', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="Kinshasa"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Pays
          </label>
          <select
            value={data.country}
            onChange={(e) => set('country', e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            <option value="RDC">RDC</option>
            <option value="Congo-Brazzaville">Congo-Brazzaville</option>
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Canada">Canada</option>
          </select>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Notes
        </label>
        <textarea
          value={data.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Notes internes sur ce client..."
        />
      </div>

      {/* VIP toggle (only in edit mode) */}
      {showVipToggle && (
        <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-amber-200 bg-amber-50/50 p-4">
          <input
            type="checkbox"
            checked={data.isVip}
            onChange={(e) => set('isVip', e.target.checked)}
            className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
          />
          <div className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Statut VIP</span>
          </div>
        </label>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !data.name.trim() || !data.phone.trim()}
          className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function ClientsPage() {
  /* ─── State ─── */
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [vipFilter, setVipFilter] = useState<VipFilter>('tous');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Form
  const [formData, setFormData] = useState<ClientFormData>({ ...EMPTY_FORM });

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  /* ─── Load clients from localStorage ─── */
  useEffect(() => {
    const stored = getItem<Client[]>(STORAGE_KEY, []);
    setClients(stored);
  }, []);

  /* ─── Persist helper ─── */
  const persistClients = useCallback((updated: Client[]) => {
    setClients(updated);
    setItem(STORAGE_KEY, updated);
  }, []);

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    let list = clients;

    // VIP filter
    if (vipFilter === 'vip') list = list.filter((c) => c.isVip);
    if (vipFilter === 'standard') list = list.filter((c) => !c.isVip);

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          (c.email && c.email.toLowerCase().includes(q)),
      );
    }

    // Sort by most recent first
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [clients, vipFilter, search]);

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    const total = clients.length;
    const vip = clients.filter((c) => c.isVip).length;
    const revenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
    return { total, vip, revenue };
  }, [clients]);

  /* ─── Handlers ─── */

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setShowAddModal(true);
  };

  const openEdit = (client: Client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      city: client.city,
      country: client.country,
      notes: client.notes,
      isVip: client.isVip,
    });
    setEditingClient(client);
  };

  const handleAdd = () => {
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setLoading(true);

    const newClient: Client = {
      id: `cli-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || 'Kinshasa',
      country: formData.country || 'RDC',
      totalOrders: 0,
      totalSpent: 0,
      currency: 'USD',
      isVip: false,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...clients, newClient];
    persistClients(updated);
    showToast(`Client "${formData.name}" ajoute avec succes`);
    setShowAddModal(false);
    setFormData({ ...EMPTY_FORM });
    setLoading(false);
  };

  const handleEdit = () => {
    if (!editingClient || !formData.name.trim() || !formData.phone.trim()) return;
    setLoading(true);

    const updated = clients.map((c) =>
      c.id === editingClient.id
        ? {
            ...c,
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim() || undefined,
            address: formData.address.trim() || undefined,
            city: formData.city.trim() || c.city,
            country: formData.country || c.country,
            notes: formData.notes.trim(),
            isVip: formData.isVip,
          }
        : c,
    );

    persistClients(updated);
    showToast(`Client "${formData.name}" mis a jour`);
    setEditingClient(null);
    setFormData({ ...EMPTY_FORM });
    setLoading(false);
  };

  const handleDelete = () => {
    if (!deletingClient) return;
    setLoading(true);

    const updated = clients.filter((c) => c.id !== deletingClient.id);
    persistClients(updated);
    showToast(`Client "${deletingClient.name}" supprime`);
    setDeletingClient(null);
    setLoading(false);
  };

  const toggleVip = (client: Client) => {
    const updated = clients.map((c) =>
      c.id === client.id ? { ...c, isVip: !c.isVip } : c,
    );
    persistClients(updated);
    showToast(
      client.isVip
        ? `"${client.name}" n'est plus VIP`
        : `"${client.name}" est maintenant VIP`,
    );
  };

  /* ─── Date formatting ─── */
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /* ─── VIP filter tabs ─── */
  const vipTabs: { value: VipFilter; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    { value: 'vip', label: 'VIP' },
    { value: 'standard', label: 'Standard' },
  ];

  const filterCounts = useMemo(() => ({
    tous: clients.length,
    vip: clients.filter((c) => c.isVip).length,
    standard: clients.filter((c) => !c.isVip).length,
  }), [clients]);

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {clients.length} client{clients.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Ajouter un client
        </button>
      </motion.div>

      {/* Stat Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Users}
          label="Total clients"
          value={String(stats.total)}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={Crown}
          label="Clients VIP"
          value={String(stats.vip)}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={DollarSign}
          label="Revenus clients"
          value={formatPrice(stats.revenue)}
          color="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Search + Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 space-y-4"
      >
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom ou telephone..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* VIP Filter Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {vipTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setVipFilter(tab.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                vipFilter === tab.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.value === 'vip' && <Crown className="h-3.5 w-3.5" />}
              {tab.label}
              <span
                className={`text-[11px] ${
                  vipFilter === tab.value ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {filterCounts[tab.value]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Client Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Aucun client trouve</p>
            <p className="mt-1 text-xs text-gray-400">
              Modifiez vos filtres ou ajoutez un nouveau client
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Telephone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Ville / Pays
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Commandes
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total depense
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Dern. commande
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((client) => (
                  <tr
                    key={client.id}
                    className="group transition-colors hover:bg-gray-50/60"
                  >
                    {/* Name + avatar */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            client.isVip
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {client.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 max-w-[180px]">
                            {client.name}
                          </p>
                          {client.email && (
                            <p className="truncate text-[11px] text-gray-400 max-w-[180px]">
                              {client.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{client.phone}</span>
                    </td>

                    {/* City / Country */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {client.city}{client.city && client.country ? ', ' : ''}{client.country}
                      </span>
                    </td>

                    {/* Total Orders */}
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-700">
                        {client.totalOrders}
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatPrice(client.totalSpent, client.currency === 'USD' ? '$' : client.currency)}
                      </span>
                    </td>

                    {/* VIP Status */}
                    <td className="px-4 py-3 text-center">
                      {client.isVip ? (
                        <VipBadge isVip />
                      ) : (
                        <span className="inline-flex rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-400">
                          Standard
                        </span>
                      )}
                    </td>

                    {/* Last Order */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {formatDate(client.lastOrderAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {/* View */}
                        <button
                          onClick={() => setViewingClient(client)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Voir les details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {/* VIP toggle */}
                        <button
                          onClick={() => toggleVip(client)}
                          className={`rounded-lg p-2 transition-colors ${
                            client.isVip
                              ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-600'
                              : 'text-gray-400 hover:bg-amber-50 hover:text-amber-500'
                          }`}
                          title={client.isVip ? 'Retirer VIP' : 'Marquer VIP'}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(client)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {/* Delete */}
                        <button
                          onClick={() => setDeletingClient(client)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              {filtered.length} client{filtered.length > 1 ? 's' : ''} affiche{filtered.length > 1 ? 's' : ''}
              {vipFilter !== 'tous' || search
                ? ` (filtres sur ${clients.length})`
                : ''}
            </p>
          </div>
        )}
      </motion.div>

      {/* ═══ Modals ═══ */}

      {/* Add Client Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ ...EMPTY_FORM });
        }}
        title="Ajouter un client"
        wide
      >
        <ClientForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleAdd}
          onCancel={() => {
            setShowAddModal(false);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Ajouter le client"
        />
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        open={!!editingClient}
        onClose={() => {
          setEditingClient(null);
          setFormData({ ...EMPTY_FORM });
        }}
        title={`Modifier — ${editingClient?.name || ''}`}
        wide
      >
        <ClientForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setEditingClient(null);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Enregistrer"
          showVipToggle
        />
      </Modal>

      {/* Client Detail View Modal */}
      <Modal
        open={!!viewingClient}
        onClose={() => setViewingClient(null)}
        title="Details du client"
        wide
      >
        {viewingClient && (
          <div className="space-y-6">
            {/* Client header */}
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold ${
                  viewingClient.isVip
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {viewingClient.name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {viewingClient.name}
                  </h3>
                  <VipBadge isVip={viewingClient.isVip} />
                </div>
                <p className="mt-0.5 text-xs text-gray-400">
                  Client depuis le {formatDate(viewingClient.createdAt)}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-gray-400" />
                <p className="text-lg font-bold text-gray-900">{viewingClient.totalOrders}</p>
                <p className="text-[11px] text-gray-500">Commandes</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <DollarSign className="mx-auto mb-1 h-5 w-5 text-emerald-500" />
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(viewingClient.totalSpent, viewingClient.currency === 'USD' ? '$' : viewingClient.currency)}
                </p>
                <p className="text-[11px] text-gray-500">Total depense</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4 text-center">
                <Calendar className="mx-auto mb-1 h-5 w-5 text-blue-500" />
                <p className="text-sm font-bold text-gray-900">
                  {formatDate(viewingClient.lastOrderAt)}
                </p>
                <p className="text-[11px] text-gray-500">Dern. commande</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3 rounded-xl border border-gray-100 p-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">Coordonnees</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm text-gray-700">
                  <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span>{viewingClient.phone}</span>
                </div>
                {viewingClient.email && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>{viewingClient.email}</span>
                  </div>
                )}
                {(viewingClient.address || viewingClient.city) && (
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                    <span>
                      {viewingClient.address && `${viewingClient.address}, `}
                      {viewingClient.city}
                      {viewingClient.country && `, ${viewingClient.country}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {viewingClient.notes && (
              <div className="space-y-2 rounded-xl border border-gray-100 p-4">
                <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase">
                  <FileText className="h-3.5 w-3.5" />
                  Notes
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {viewingClient.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => {
                  setViewingClient(null);
                  toggleVip(viewingClient);
                }}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  viewingClient.isVip
                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Star className="h-4 w-4" />
                {viewingClient.isVip ? 'Retirer VIP' : 'Marquer VIP'}
              </button>
              <button
                onClick={() => {
                  setViewingClient(null);
                  openEdit(viewingClient);
                }}
                className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Edit3 className="h-4 w-4" />
                Modifier
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        title="Supprimer le client"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Etes-vous sur de vouloir supprimer ce client ?
              </p>
              <p className="mt-1 text-xs text-red-600">
                Le client &laquo;&nbsp;{deletingClient?.name}&nbsp;&raquo; sera
                definitivement supprime. Cette action est irreversible.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingClient(null)}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 30, x: '-50%' }}
            className={`fixed bottom-6 left-1/2 z-[60] flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
