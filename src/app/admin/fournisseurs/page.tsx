'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Factory, Plus, Trash2, Edit3, X, Check, Phone, Globe, Tag, MessageCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/types';

interface Supplier {
  id: string;
  name: string;
  country: string;
  whatsapp: string;
  productCategory: string;
  createdAt: string;
}

const EMPTY = { name: '', country: '', whatsapp: '', productCategory: '' };

export default function FournisseursPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/suppliers', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => { setSuppliers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, country: s.country, whatsapp: s.whatsapp, productCategory: s.productCategory });
    setEditing(s); setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const method = editing ? 'PATCH' : 'POST';
    const body = editing ? { id: editing.id, ...form } : form;
    const res = await fetch('/api/suppliers', {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }).catch(() => null);
    setSaving(false);
    if (res?.ok) { showToast(editing ? 'Fournisseur modifié' : 'Fournisseur ajouté'); setShowForm(false); load(); }
    else showToast('Erreur enregistrement', 'error');
  };

  const remove = async (id: string) => {
    setSuppliers((p) => p.filter((s) => s.id !== id));
    const res = await fetch('/api/suppliers', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
    }).catch(() => null);
    if (res?.ok) showToast('Fournisseur supprimé'); else { showToast('Erreur', 'error'); load(); }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Factory className="h-5 w-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fournisseurs</h1>
            <p className="mt-0.5 text-sm text-gray-500">{suppliers.length} fournisseur(s)</p>
          </div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800">
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </motion.div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Factory className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Aucun fournisseur</p>
            <p className="mt-1 text-xs text-gray-400">Ajoute tes fournisseurs (Alibaba, AliExpress, locaux…).</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {suppliers.map((s) => (
              <div key={s.id} className="group flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500">
                  {s.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{s.name}</p>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-400">
                    {s.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{s.country}</span>}
                    {s.productCategory && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{CATEGORIES.find((c) => c.slug === s.productCategory)?.name || s.productCategory}</span>}
                    {s.whatsapp && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{s.whatsapp}</span>}
                  </div>
                </div>
                {s.whatsapp && (
                  <a href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                    className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50" title="Contacter sur WhatsApp">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                <button onClick={() => openEdit(s)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Edit3 className="h-4 w-4" /></button>
                <button onClick={() => remove(s.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-10" onClick={() => setShowForm(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-900">{editing ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}</h2>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-900">Nom *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black" placeholder="Ex: Guangzhou Trading Co." autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-900">Pays</label>
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black" placeholder="Chine" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase text-gray-900">WhatsApp</label>
                  <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-black" placeholder="+86..." />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-900">Catégorie de produits</label>
                <select value={form.productCategory} onChange={(e) => setForm({ ...form, productCategory: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-black">
                  <option value="">— Aucune —</option>
                  {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
              <button onClick={save} disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Enregistrer
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-white shadow-lg ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}{toast.msg}
        </div>
      )}
    </div>
  );
}
