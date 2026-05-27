'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  Truck,
  CreditCard,
  Shield,
  Save,
  Plus,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Loader2,
  Eye,
  EyeOff,
  Phone,
  DollarSign,
  Lock,
  ToggleLeft,
  ToggleRight,
  Edit3,
} from 'lucide-react';
import type { SiteSettings, DeliveryZone, PaymentMethodConfig } from '@/lib/types';
import { DEFAULT_SETTINGS } from '@/lib/admin/constants';
import { getItem, setItem } from '@/lib/admin/localStorage';

/* ─── Types ─── */

type TabId = 'general' | 'livraison' | 'paiement' | 'securite';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  description: string;
}

/* ─── Constants ─── */

const TABS: TabDef[] = [
  { id: 'general', label: 'General', icon: <Globe className="h-4 w-4" />, description: 'Informations generales de la boutique' },
  { id: 'livraison', label: 'Livraison', icon: <Truck className="h-4 w-4" />, description: 'Zones et frais de livraison' },
  { id: 'paiement', label: 'Paiement', icon: <CreditCard className="h-4 w-4" />, description: 'Methodes de paiement acceptees' },
  { id: 'securite', label: 'Securite', icon: <Shield className="h-4 w-4" />, description: 'Mot de passe administrateur' },
];

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'Dollar US (USD)', symbol: '$' },
  { value: 'CDF', label: 'Franc Congolais (CDF)', symbol: 'FC' },
];

/* ─── Inline Toast Component ─── */

function Toast({ toast }: { toast: { msg: string; type: 'success' | 'error' } | null }) {
  return (
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
  );
}

/* ─── Settings Card Wrapper ─── */

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 px-6 py-5">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <div className="px-6 py-6">{children}</div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   GENERAL SECTION
   ═══════════════════════════════════════════════ */

function GeneralSection({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
}) {
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave(form);
      setSaving(false);
    }, 400);
  };

  const handleCurrencyChange = (currency: string) => {
    const opt = CURRENCY_OPTIONS.find((c) => c.value === currency);
    setForm((prev) => ({
      ...prev,
      currency,
      currencySymbol: opt?.symbol || '$',
    }));
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Informations de contact"
        description="Numero WhatsApp utilise pour les notifications et le support client."
      >
        <div className="space-y-5">
          {/* WhatsApp Number */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
              Numero WhatsApp
            </label>
            <div className="relative max-w-md">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={form.whatsappNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, whatsappNumber: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="+243..."
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Format international avec indicatif pays (ex: +243851845573)
            </p>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Devise et commandes"
        description="Configuration de la devise, du prefixe de commande et du seuil de stock."
      >
        <div className="space-y-5">
          {/* Currency */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                Devise
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={form.currency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black appearance-none bg-white"
                >
                  {CURRENCY_OPTIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                Symbole
              </label>
              <input
                value={form.currencySymbol}
                onChange={(e) => setForm((prev) => ({ ...prev, currencySymbol: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="$"
              />
            </div>
          </div>

          {/* Order Prefix + Low Stock */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                Prefixe de commande
              </label>
              <input
                value={form.orderPrefix}
                onChange={(e) => setForm((prev) => ({ ...prev, orderPrefix: e.target.value.toUpperCase() }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="BL"
                maxLength={5}
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Ex: BL-20260527-001
              </p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                Seuil de stock bas
              </label>
              <input
                type="number"
                min={1}
                value={form.lowStockThreshold}
                onChange={(e) => setForm((prev) => ({ ...prev, lowStockThreshold: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
              <p className="mt-1.5 text-xs text-gray-400">
                Alerte quand le stock passe en dessous de ce seuil
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Statut de la boutique"
        description="Ouvrir ou fermer la boutique pour les clients. En mode ferme, un message de maintenance est affiche."
      >
        <div className="space-y-5">
          {/* Store Open toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Boutique {form.storeOpen ? 'ouverte' : 'fermee'}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {form.storeOpen
                  ? 'Les clients peuvent passer des commandes'
                  : 'La boutique est en mode maintenance'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, storeOpen: !prev.storeOpen }))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                form.storeOpen ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  form.storeOpen ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Maintenance Message */}
          {!form.storeOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
                Message de maintenance
              </label>
              <textarea
                value={form.maintenanceMessage || ''}
                onChange={(e) => setForm((prev) => ({ ...prev, maintenanceMessage: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Notre boutique est temporairement fermee. Revenez bientot !"
              />
            </motion.div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Visibilite des prix"
        description="Masquer les prix sur la boutique. Les clients devront contacter via WhatsApp pour connaitre les prix."
      >
        <div className="space-y-5">
          {/* Hide Prices toggle */}
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {form.hidePrices ? 'Prix masques' : 'Prix affiches'}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {form.hidePrices
                  ? 'Les prix sont caches. "Prix sur demande" est affiche a la place'
                  : 'Les prix sont visibles pour tous les produits'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, hidePrices: !prev.hidePrices }))}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                form.hidePrices ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                  form.hidePrices ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {form.hidePrices && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-2 rounded-lg bg-amber-50 px-4 py-3"
            >
              <EyeOff className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="text-xs text-amber-700">
                <p className="font-medium">Mode global active</p>
                <p className="mt-0.5">
                  Tous les prix sont masques sur la boutique. Les clients verront
                  &quot;Prix sur demande&quot; avec un lien WhatsApp. Vous pouvez aussi masquer
                  les prix individuellement par produit depuis la page Produits.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DELIVERY SECTION
   ═══════════════════════════════════════════════ */

function DeliverySection({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
}) {
  const [zones, setZones] = useState<DeliveryZone[]>(settings.deliveryZones);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formName, setFormName] = useState('');
  const [formFee, setFormFee] = useState(0);
  const [formDays, setFormDays] = useState('');

  useEffect(() => {
    setZones(settings.deliveryZones);
  }, [settings]);

  const resetForm = () => {
    setFormName('');
    setFormFee(0);
    setFormDays('');
    setAdding(false);
    setEditingIdx(null);
  };

  const startAdd = () => {
    resetForm();
    setAdding(true);
  };

  const startEdit = (idx: number) => {
    const zone = zones[idx];
    setFormName(zone.name);
    setFormFee(zone.fee);
    setFormDays(zone.estimatedDays);
    setEditingIdx(idx);
    setAdding(false);
  };

  const confirmAdd = () => {
    if (!formName.trim()) return;
    setZones((prev) => [...prev, { name: formName.trim(), fee: formFee, estimatedDays: formDays.trim() }]);
    resetForm();
  };

  const confirmEdit = () => {
    if (editingIdx === null || !formName.trim()) return;
    setZones((prev) =>
      prev.map((z, i) =>
        i === editingIdx ? { name: formName.trim(), fee: formFee, estimatedDays: formDays.trim() } : z,
      ),
    );
    resetForm();
  };

  const deleteZone = (idx: number) => {
    setZones((prev) => prev.filter((_, i) => i !== idx));
    if (editingIdx === idx) resetForm();
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...settings, deliveryZones: zones });
      setSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Zones de livraison"
        description="Definissez les zones, frais et delais de livraison pour vos clients."
      >
        <div className="space-y-4">
          {/* Zones list */}
          <div className="space-y-2">
            {zones.map((zone, idx) => (
              <motion.div
                key={`${zone.name}-${idx}`}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3"
              >
                {editingIdx === idx ? (
                  <div className="flex flex-1 flex-wrap items-end gap-3">
                    <div className="min-w-[160px] flex-1">
                      <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                        Zone
                      </label>
                      <input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="w-28">
                      <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                        Frais ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formFee}
                        onChange={(e) => setFormFee(Number(e.target.value))}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      />
                    </div>
                    <div className="min-w-[140px] flex-1">
                      <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                        Delai estime
                      </label>
                      <input
                        value={formDays}
                        onChange={(e) => setFormDays(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        placeholder="1-2 jours"
                      />
                    </div>
                    <div className="flex gap-1.5 pb-0.5">
                      <button
                        onClick={confirmEdit}
                        className="rounded-lg bg-black p-2 text-white hover:bg-gray-800"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={resetForm}
                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{zone.name}</p>
                        <p className="text-xs text-gray-500">{zone.estimatedDays}</p>
                      </div>
                      <span className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-gray-100">
                        {settings.currencySymbol}{zone.fee}
                      </span>
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(idx)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white hover:text-gray-700"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteZone(idx)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          {/* Add zone form */}
          <AnimatePresence>
            {adding && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-4">
                  <div className="min-w-[160px] flex-1">
                    <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                      Nom de la zone
                    </label>
                    <input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="Ex: Lubumbashi"
                      autoFocus
                    />
                  </div>
                  <div className="w-28">
                    <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                      Frais ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formFee || ''}
                      onChange={(e) => setFormFee(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="10"
                    />
                  </div>
                  <div className="min-w-[140px] flex-1">
                    <label className="mb-1 block text-[10px] font-semibold text-gray-400 uppercase">
                      Delai estime
                    </label>
                    <input
                      value={formDays}
                      onChange={(e) => setFormDays(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                      placeholder="3-5 jours"
                    />
                  </div>
                  <div className="flex gap-1.5 pb-0.5">
                    <button
                      onClick={confirmAdd}
                      disabled={!formName.trim()}
                      className="rounded-lg bg-black p-2 text-white hover:bg-gray-800 disabled:opacity-40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={resetForm}
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add zone button */}
          {!adding && editingIdx === null && (
            <button
              onClick={startAdd}
              className="flex items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-500 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="h-4 w-4" />
              Ajouter une zone
            </button>
          )}
        </div>
      </SettingsCard>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAYMENT SECTION
   ═══════════════════════════════════════════════ */

function PaymentSection({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (s: SiteSettings) => void;
}) {
  const [methods, setMethods] = useState<PaymentMethodConfig[]>(settings.paymentMethods);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInstructions, setEditInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMethods(settings.paymentMethods);
  }, [settings]);

  const toggleMethod = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)),
    );
  };

  const startEditInstructions = (method: PaymentMethodConfig) => {
    setEditingId(method.id);
    setEditInstructions(method.instructions || '');
  };

  const saveInstructions = () => {
    if (editingId === null) return;
    setMethods((prev) =>
      prev.map((m) => (m.id === editingId ? { ...m, instructions: editInstructions } : m)),
    );
    setEditingId(null);
    setEditInstructions('');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      onSave({ ...settings, paymentMethods: methods });
      setSaving(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Methodes de paiement"
        description="Activez ou desactivez les methodes de paiement et personnalisez les instructions pour chaque methode."
      >
        <div className="space-y-3">
          {methods.map((method) => (
            <motion.div
              key={method.id}
              layout
              className={`rounded-lg border px-4 py-4 transition-colors ${
                method.isActive
                  ? 'border-gray-200 bg-white'
                  : 'border-gray-100 bg-gray-50/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleMethod(method.id)}
                    className="focus:outline-none"
                  >
                    {method.isActive ? (
                      <ToggleRight className="h-6 w-6 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-300" />
                    )}
                  </button>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        method.isActive ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {method.label}
                    </p>
                    {method.instructions && editingId !== method.id && (
                      <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
                        {method.instructions}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => startEditInstructions(method)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  title="Modifier les instructions"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              {/* Inline edit instructions */}
              <AnimatePresence>
                {editingId === method.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                      <label className="block text-[10px] font-semibold text-gray-400 uppercase">
                        Instructions de paiement
                      </label>
                      <textarea
                        value={editInstructions}
                        onChange={(e) => setEditInstructions(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                        placeholder="Ex: Envoyez le montant au +243... puis partagez la capture d'ecran"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditInstructions('');
                          }}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={saveInstructions}
                          className="flex items-center gap-1.5 rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
                        >
                          <Check className="h-3 w-3" />
                          Valider
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </SettingsCard>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Sauvegarder
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SECURITY SECTION
   ═══════════════════════════════════════════════ */

function SecuritySection({
  showToast,
}: {
  showToast: (msg: string, type: 'success' | 'error') => void;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [error, setError] = useState('');

  const handleChangePassword = () => {
    setError('');

    const storedPassword = getItem<string>('bellalure-admin-password', 'bellalure2024');

    if (currentPassword !== storedPassword) {
      setError('Le mot de passe actuel est incorrect.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le nouveau mot de passe doit contenir au moins 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setItem('bellalure-admin-password', newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSaving(false);
      showToast('Mot de passe mis a jour avec succes', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Mot de passe administrateur"
        description="Changez le mot de passe utilise pour acceder au back-office."
      >
        <div className="max-w-md space-y-5">
          {/* Current password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
              Mot de passe actuel
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Entrez le mot de passe actuel"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Minimum 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Repetez le nouveau mot de passe"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </div>
      </SettingsCard>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={handleChangePassword}
          disabled={saving || !currentPassword || !newPassword || !confirmPassword}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
          Changer le mot de passe
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function ParametresPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getItem<SiteSettings>('bellalure-settings', DEFAULT_SETTINGS);
    setSettings(stored);
  }, []);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  const handleSave = useCallback(
    (updated: SiteSettings) => {
      setSettings(updated);
      setItem('bellalure-settings', updated);
      showToast('Parametres sauvegardes avec succes');
    },
    [showToast],
  );

  if (!mounted) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Settings className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Parametres</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              Configurez votre boutique Bellalure
            </p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Left Sidebar — Tab Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="w-full shrink-0 lg:w-56"
        >
          <div className="sticky top-6 space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span
                  className={
                    activeTab === tab.id ? 'text-white' : 'text-gray-400'
                  }
                >
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </motion.nav>

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <GeneralSection settings={settings} onSave={handleSave} />
              </motion.div>
            )}

            {activeTab === 'livraison' && (
              <motion.div
                key="livraison"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <DeliverySection settings={settings} onSave={handleSave} />
              </motion.div>
            )}

            {activeTab === 'paiement' && (
              <motion.div
                key="paiement"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <PaymentSection settings={settings} onSave={handleSave} />
              </motion.div>
            )}

            {activeTab === 'securite' && (
              <motion.div
                key="securite"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <SecuritySection showToast={showToast} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Toast */}
      <Toast toast={toast} />
    </div>
  );
}
