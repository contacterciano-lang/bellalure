'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Eye,
  EyeOff,
  Star,
  GripVertical,
  Check,
  AlertTriangle,
  Loader2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import type { Product, Collection } from '@/lib/types';
import { slugify } from '@/lib/admin/constants';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/admin/localStorage';

/* ─── Constants ─── */

const STORAGE_KEY = STORAGE_KEYS.COLLECTIONS;

/* ─── Types ─── */

interface CollectionFormData {
  name: string;
  description: string;
  image: string;
  productIds: string[];
  isActive: boolean;
  isFeaturedOnHome: boolean;
}

const EMPTY_FORM: CollectionFormData = {
  name: '',
  description: '',
  image: '',
  productIds: [],
  isActive: true,
  isFeaturedOnHome: false,
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
   Product Picker (searchable multi-select)
   ═══════════════════════════════════════════════ */

function ProductPicker({
  allProducts,
  selectedIds,
  onChange,
}: {
  allProducts: Product[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return allProducts;
    const q = query.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q),
    );
  }, [allProducts, query]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAll = () => {
    const allIds = filtered.map((p) => p.id);
    const merged = [...new Set([...selectedIds, ...allIds])];
    onChange(merged);
  };

  const deselectAll = () => {
    const filteredIds = new Set(filtered.map((p) => p.id));
    onChange(selectedIds.filter((id) => !filteredIds.has(id)));
  };

  return (
    <div className="space-y-3">
      <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
        Produits ({selectedIds.length} sélectionnés)
      </label>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={selectAll}
          className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
        >
          Tout sélectionner ({filtered.length})
        </button>
        <button
          type="button"
          onClick={deselectAll}
          className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
        >
          Tout décocher
        </button>
      </div>

      {/* Product list */}
      <div className="max-h-60 overflow-y-auto rounded-lg border border-gray-200">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            Aucun produit trouvé
          </div>
        ) : (
          filtered.map((product) => {
            const isSelected = selectedIds.includes(product.id);
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggle(product.id)}
                className={`flex w-full items-center gap-3 border-b border-gray-50 px-3 py-2 text-left transition-colors last:border-b-0 ${
                  isSelected ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                }`}
              >
                <div
                  className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3" />}
                </div>
                <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="32px"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-gray-400 capitalize">
                    {product.category}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Collection Form (Add & Edit)
   ═══════════════════════════════════════════════ */

function CollectionForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
  allProducts,
}: {
  data: CollectionFormData;
  onChange: (d: CollectionFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  allProducts: Product[];
}) {
  const set = <K extends keyof CollectionFormData>(
    key: K,
    val: CollectionFormData[K],
  ) => onChange({ ...data, [key]: val });

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Nom de la collection *
        </label>
        <input
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Ex: Nouvelle Collection Été"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Description
        </label>
        <textarea
          value={data.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Description de la collection..."
        />
      </div>

      {/* Image URL */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Image de couverture (URL)
        </label>
        <div className="flex gap-3">
          <input
            value={data.image}
            onChange={(e) => set('image', e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="https://..."
          />
          {data.image && (
            <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <Image
                src={data.image}
                alt="Aperçu"
                fill
                className="object-cover"
                sizes="44px"
                unoptimized
              />
            </div>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          Collection active
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={data.isFeaturedOnHome}
            onChange={(e) => set('isFeaturedOnHome', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
          />
          Afficher sur la page d&apos;accueil
        </label>
      </div>

      {/* Product picker */}
      <ProductPicker
        allProducts={allProducts}
        selectedIds={data.productIds}
        onChange={(ids) => set('productIds', ids)}
      />

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
          disabled={loading || !data.name}
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

export default function CollectionsPage() {
  /* ─── State ─── */
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([...staticProducts]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deletingCollection, setDeletingCollection] = useState<Collection | null>(null);

  // Form data
  const [formData, setFormData] = useState<CollectionFormData>({ ...EMPTY_FORM });

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  /* ─── Load collections from localStorage ─── */
  useEffect(() => {
    const stored = getItem<Collection[]>(STORAGE_KEY, []);
    setCollections(stored);
  }, []);

  /* ─── Load products (merge static + dynamic) ─── */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const dynamic: Product[] = await res.json();
      if (Array.isArray(dynamic)) {
        const ids = new Set(dynamic.map((p) => p.id));
        const remaining = staticProducts.filter((p) => !ids.has(p.id));
        setAllProducts([...remaining, ...dynamic]);
      }
    } catch {
      /* keep static */
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ─── Persist helper ─── */
  const persist = useCallback((updated: Collection[]) => {
    setCollections(updated);
    setItem(STORAGE_KEY, updated);
  }, []);

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    if (!search) return collections;
    const q = search.toLowerCase();
    return collections.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    );
  }, [collections, search]);

  /* ─── Product map for quick lookup ─── */
  const productMap = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of allProducts) map.set(p.id, p);
    return map;
  }, [allProducts]);

  /* ─── Handlers ─── */

  const openAdd = () => {
    setFormData({ ...EMPTY_FORM });
    setShowAddModal(true);
  };

  const openEdit = (collection: Collection) => {
    setFormData({
      name: collection.name,
      description: collection.description,
      image: collection.image,
      productIds: collection.productIds,
      isActive: collection.isActive,
      isFeaturedOnHome: collection.isFeaturedOnHome,
    });
    setEditingCollection(collection);
  };

  const handleAdd = () => {
    if (!formData.name) return;
    setLoading(true);

    const now = new Date().toISOString();
    const maxSort = collections.reduce((max, c) => Math.max(max, c.sortOrder), 0);

    const newCollection: Collection = {
      id: `col-${Date.now()}`,
      name: formData.name,
      slug: slugify(formData.name),
      description: formData.description,
      image: formData.image || 'https://placehold.co/600x400/f3f4f6/9ca3af?text=Collection',
      productIds: formData.productIds,
      isActive: formData.isActive,
      isFeaturedOnHome: formData.isFeaturedOnHome,
      sortOrder: maxSort + 1,
      createdAt: now,
      updatedAt: now,
    };

    persist([...collections, newCollection]);
    showToast(`Collection "${formData.name}" créée`);
    setShowAddModal(false);
    setFormData({ ...EMPTY_FORM });
    setLoading(false);
  };

  const handleEdit = () => {
    if (!editingCollection || !formData.name) return;
    setLoading(true);

    const updated = collections.map((c) =>
      c.id === editingCollection.id
        ? {
            ...c,
            name: formData.name,
            slug: slugify(formData.name),
            description: formData.description,
            image: formData.image || c.image,
            productIds: formData.productIds,
            isActive: formData.isActive,
            isFeaturedOnHome: formData.isFeaturedOnHome,
            updatedAt: new Date().toISOString(),
          }
        : c,
    );

    persist(updated);
    showToast(`Collection "${formData.name}" mise à jour`);
    setEditingCollection(null);
    setFormData({ ...EMPTY_FORM });
    setLoading(false);
  };

  const handleDelete = () => {
    if (!deletingCollection) return;
    setLoading(true);

    const updated = collections.filter((c) => c.id !== deletingCollection.id);
    persist(updated);
    showToast(`Collection "${deletingCollection.name}" supprimée`);
    setDeletingCollection(null);
    setLoading(false);
  };

  const toggleActive = (id: string) => {
    const updated = collections.map((c) =>
      c.id === id
        ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
        : c,
    );
    persist(updated);
  };

  const toggleFeatured = (id: string) => {
    const updated = collections.map((c) =>
      c.id === id
        ? { ...c, isFeaturedOnHome: !c.isFeaturedOnHome, updatedAt: new Date().toISOString() }
        : c,
    );
    persist(updated);
  };

  const moveUp = (id: string) => {
    const sorted = [...collections].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx <= 0) return;

    const temp = sorted[idx].sortOrder;
    sorted[idx] = { ...sorted[idx], sortOrder: sorted[idx - 1].sortOrder, updatedAt: new Date().toISOString() };
    sorted[idx - 1] = { ...sorted[idx - 1], sortOrder: temp, updatedAt: new Date().toISOString() };
    persist(sorted);
  };

  const moveDown = (id: string) => {
    const sorted = [...collections].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((c) => c.id === id);
    if (idx < 0 || idx >= sorted.length - 1) return;

    const temp = sorted[idx].sortOrder;
    sorted[idx] = { ...sorted[idx], sortOrder: sorted[idx + 1].sortOrder, updatedAt: new Date().toISOString() };
    sorted[idx + 1] = { ...sorted[idx + 1], sortOrder: temp, updatedAt: new Date().toISOString() };
    persist(sorted);
  };

  /* ─── Sorted collections for display ─── */
  const sortedFiltered = useMemo(
    () => [...filtered].sort((a, b) => a.sortOrder - b.sortOrder),
    [filtered],
  );

  /* ─── Stats ─── */
  const activeCount = collections.filter((c) => c.isActive).length;
  const featuredCount = collections.filter((c) => c.isFeaturedOnHome).length;

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {collections.length} collection{collections.length > 1 ? 's' : ''}
            {' — '}
            {activeCount} active{activeCount > 1 ? 's' : ''}
            {featuredCount > 0 && `, ${featuredCount} en vedette`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus className="h-4 w-4" />
          Nouvelle collection
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une collection..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </motion.div>

      {/* Collection Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {sortedFiltered.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            <Layers className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">
              {collections.length === 0
                ? 'Aucune collection créée'
                : 'Aucune collection trouvée'}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {collections.length === 0
                ? 'Créez votre première collection pour regrouper vos produits'
                : 'Modifiez votre recherche'}
            </p>
            {collections.length === 0 && (
              <button
                onClick={openAdd}
                className="mt-4 flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Créer une collection
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {sortedFiltered.map((collection) => {
                const productCount = collection.productIds.length;
                const previewProducts = collection.productIds
                  .slice(0, 4)
                  .map((id) => productMap.get(id))
                  .filter(Boolean) as Product[];

                return (
                  <motion.div
                    key={collection.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    {/* Collection image header */}
                    <div className="relative h-44 overflow-hidden bg-gray-100">
                      <Image
                        src={collection.image}
                        alt={collection.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        unoptimized
                      />
                      {/* Dark overlay for text readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Badges overlay */}
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {collection.isFeaturedOnHome && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase shadow">
                            <Star className="h-3 w-3" />
                            Vedette
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase shadow ${
                            collection.isActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}
                        >
                          {collection.isActive ? (
                            <>
                              <Eye className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>

                      {/* Reorder + actions overlay */}
                      <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => moveUp(collection.id)}
                          className="rounded-lg bg-white/90 p-1.5 text-gray-700 shadow backdrop-blur-sm hover:bg-white"
                          title="Monter"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveDown(collection.id)}
                          className="rounded-lg bg-white/90 p-1.5 text-gray-700 shadow backdrop-blur-sm hover:bg-white"
                          title="Descendre"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Name + product count overlay on image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-lg font-bold text-white drop-shadow-md">
                          {collection.name}
                        </h3>
                        <p className="mt-0.5 text-sm text-white/80">
                          {productCount} produit{productCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="p-4">
                      {/* Description */}
                      {collection.description && (
                        <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                          {collection.description}
                        </p>
                      )}

                      {/* Product preview thumbnails */}
                      {previewProducts.length > 0 && (
                        <div className="mb-3 flex items-center gap-1.5">
                          {previewProducts.map((p) => (
                            <div
                              key={p.id}
                              className="relative h-9 w-9 overflow-hidden rounded-md bg-gray-100"
                            >
                              <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                className="object-cover"
                                sizes="36px"
                                unoptimized
                              />
                            </div>
                          ))}
                          {productCount > 4 && (
                            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-gray-100 text-[11px] font-semibold text-gray-500">
                              +{productCount - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Quick toggles */}
                      <div className="mb-3 flex gap-2">
                        <button
                          onClick={() => toggleActive(collection.id)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                            collection.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {collection.isActive ? (
                            <Eye className="h-3.5 w-3.5" />
                          ) : (
                            <EyeOff className="h-3.5 w-3.5" />
                          )}
                          {collection.isActive ? 'Active' : 'Inactive'}
                        </button>
                        <button
                          onClick={() => toggleFeatured(collection.id)}
                          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                            collection.isFeaturedOnHome
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          <Star className={`h-3.5 w-3.5 ${collection.isFeaturedOnHome ? 'fill-amber-500' : ''}`} />
                          Vedette
                        </button>
                      </div>

                      {/* Sort order + drag handle indicator */}
                      <div className="mb-3 flex items-center gap-2 text-[11px] text-gray-400">
                        <GripVertical className="h-3.5 w-3.5" />
                        Ordre : {collection.sortOrder}
                      </div>

                      {/* Card actions */}
                      <div className="flex items-center justify-end gap-1 border-t border-gray-100 pt-3">
                        <button
                          onClick={() => openEdit(collection)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCollection(collection)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Footer count */}
        {sortedFiltered.length > 0 && (
          <div className="mt-4 px-1">
            <p className="text-xs text-gray-400">
              {sortedFiltered.length} collection{sortedFiltered.length > 1 ? 's' : ''} affichée{sortedFiltered.length > 1 ? 's' : ''}
              {search ? ` (filtrées sur ${collections.length})` : ''}
            </p>
          </div>
        )}
      </motion.div>

      {/* ═══ Modals ═══ */}

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ ...EMPTY_FORM });
        }}
        title="Nouvelle collection"
        wide
      >
        <CollectionForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleAdd}
          onCancel={() => {
            setShowAddModal(false);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Créer la collection"
          allProducts={allProducts}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingCollection}
        onClose={() => {
          setEditingCollection(null);
          setFormData({ ...EMPTY_FORM });
        }}
        title={`Modifier — ${editingCollection?.name || ''}`}
        wide
      >
        <CollectionForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setEditingCollection(null);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Enregistrer"
          allProducts={allProducts}
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deletingCollection}
        onClose={() => setDeletingCollection(null)}
        title="Supprimer la collection"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Êtes-vous sûr de vouloir supprimer cette collection ?
              </p>
              <p className="mt-1 text-xs text-red-600">
                La collection &laquo;&nbsp;{deletingCollection?.name}&nbsp;&raquo;
                sera définitivement supprimée. Les produits associés ne seront pas affectés.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingCollection(null)}
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
