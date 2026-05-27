'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Package,
  Edit3,
  Trash2,
  X,
  Link as LinkIcon,
  Loader2,
  ChevronDown,
  ImagePlus,
  Check,
  AlertTriangle,
  EyeOff,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import type { Product, Badge, Category } from '@/lib/types';
import {
  BADGE_OPTIONS,
  SIZE_PRESETS,
  slugify,
  formatPrice,
} from '@/lib/admin/constants';
import { CATEGORIES } from '@/lib/types';

/* ─── Types ─── */

type Tab = 'tous' | Category;

interface ProductFormData {
  name: string;
  category: Category;
  price: number;
  originalPrice: number;
  currency: string;
  description: string;
  images: string[];
  sizes: string[];
  badge: Badge | '';
  stock: number;
  rating: number;
  reviews: number;
  newArrival: boolean;
  featured: boolean;
  trending: boolean;
  hidePrice: boolean;
}

const EMPTY_FORM: ProductFormData = {
  name: '',
  category: 'femme',
  price: 0,
  originalPrice: 0,
  currency: 'USD',
  description: '',
  images: [],
  sizes: [],
  badge: '',
  stock: 10,
  rating: 4.5,
  reviews: 0,
  newArrival: true,
  featured: false,
  trending: false,
  hidePrice: false,
};

/* ═══════════════════════════════════════════════
   Product Form Component (used in Add & Edit)
   ═══════════════════════════════════════════════ */

function ProductForm({
  data,
  onChange,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  data: ProductFormData;
  onChange: (d: ProductFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const set = <K extends keyof ProductFormData>(
    key: K,
    val: ProductFormData[K],
  ) => onChange({ ...data, [key]: val });

  const [newImageUrl, setNewImageUrl] = useState('');
  const [sizeInput, setSizeInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const addImage = () => {
    const url = newImageUrl.trim();
    if (url && !data.images.includes(url)) {
      set('images', [...data.images, url]);
      setNewImageUrl('');
    }
  };

  const removeImage = (i: number) =>
    set(
      'images',
      data.images.filter((_, idx) => idx !== i),
    );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();

      if (!res.ok) {
        setUploadError(result.error || 'Erreur upload');
        return;
      }

      if (result.urls && result.urls.length > 0) {
        set('images', [...data.images, ...result.urls]);
      }

      if (result.errors && result.errors.length > 0) {
        setUploadError(result.errors.join(', '));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addSize = () => {
    const s = sizeInput.trim().toUpperCase();
    if (s && !data.sizes.includes(s)) {
      set('sizes', [...data.sizes, s]);
      setSizeInput('');
    }
  };

  const applySizePreset = (key: string) =>
    set('sizes', SIZE_PRESETS[key] || []);

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Nom du produit *
        </label>
        <input
          value={data.name}
          onChange={(e) => set('name', e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Ex: Sac Épaule Souple Chaîne"
        />
      </div>

      {/* Category + Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Catégorie *
          </label>
          <select
            value={data.category}
            onChange={(e) => set('category', e.target.value as Category)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Badge
          </label>
          <select
            value={data.badge}
            onChange={(e) => set('badge', e.target.value as Badge | '')}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          >
            {BADGE_OPTIONS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price + Original Price + Stock */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Prix ($) *
          </label>
          <input
            type="number"
            min={0}
            value={data.price || ''}
            onChange={(e) => set('price', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Ancien prix
          </label>
          <input
            type="number"
            min={0}
            value={data.originalPrice || ''}
            onChange={(e) => set('originalPrice', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Stock *
          </label>
          <input
            type="number"
            min={0}
            value={data.stock}
            onChange={(e) => set('stock', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
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
          placeholder="Description du produit..."
        />
      </div>

      {/* Images */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Images
        </label>
        {data.images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {data.images.map((img, i) => (
              <div key={i} className="group relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={img}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
                {i === 0 && (
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-center text-[9px] font-bold text-white py-0.5">
                    PRINCIPALE
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload depuis galerie */}
        <div className="mb-2">
          <label
            className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-4 text-sm font-medium transition-colors hover:border-black hover:bg-gray-50 ${
              uploading ? 'opacity-50 pointer-events-none' : 'text-gray-600'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                Ajouter depuis la galerie
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </label>
          <p className="mt-1 text-[11px] text-gray-400">
            JPEG, PNG, WebP ou GIF — max 5 MB par image — jusqu&apos;à 10 images
          </p>
          {uploadError && (
            <p className="mt-1 text-xs text-red-600">{uploadError}</p>
          )}
        </div>

        {/* Ou ajouter par URL */}
        <div className="flex gap-2">
          <input
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="Ou coller une URL d'image..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
          />
          <button
            type="button"
            onClick={addImage}
            className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <LinkIcon className="h-4 w-4" />
            URL
          </button>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
          Tailles
        </label>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {data.sizes.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700"
            >
              {s}
              <button
                type="button"
                onClick={() => set('sizes', data.sizes.filter((x) => x !== s))}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            placeholder="Ex: M, 42..."
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
          />
          <button
            type="button"
            onClick={addSize}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            +
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          {Object.keys(SIZE_PRESETS).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applySizePreset(key)}
              className="rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-50"
            >
              {key === 'vetements'
                ? 'Vêtements'
                : key === 'chaussures'
                  ? 'Chaussures'
                  : 'Unique'}
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        {(
          [
            ['newArrival', 'Nouveauté'],
            ['featured', 'En vedette'],
            ['trending', 'Tendance'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={data[key] as boolean}
              onChange={(e) => set(key, e.target.checked as never)}
              className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            {label}
          </label>
        ))}
      </div>

      {/* Hide price toggle */}
      <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <EyeOff className="h-4 w-4 text-amber-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">Masquer le prix</p>
            <p className="text-xs text-gray-500">Affiche &quot;Prix sur demande&quot; au lieu du prix</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => set('hidePrice', !data.hidePrice)}
          className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
            data.hidePrice ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              data.hidePrice ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Rating + Reviews (compact) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Note (0-5)
          </label>
          <input
            type="number"
            min={0}
            max={5}
            step={0.1}
            value={data.rating}
            onChange={(e) => set('rating', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-500 uppercase">
            Avis
          </label>
          <input
            type="number"
            min={0}
            value={data.reviews}
            onChange={(e) => set('reviews', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>
      </div>

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
          disabled={loading || !data.name || !data.price}
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
   Scrape Form (add via URL)
   ═══════════════════════════════════════════════ */

function ScrapeForm({
  onScraped,
  loading,
  setLoading,
}: {
  onScraped: (data: Partial<ProductFormData> & { images: string[] }) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur scraping');
      onScraped({
        name: data.name || '',
        price: data.price || 0,
        originalPrice: data.originalPrice || 0,
        description: data.description || '',
        images: data.images || [],
        currency: data.currency || 'USD',
      });
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Collez un lien Amazon, AliExpress, Alibaba ou tout autre site.
        Les infos du produit seront extraites automatiquement.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.amazon.com/dp/..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
            onKeyDown={(e) => e.key === 'Enter' && handleScrape()}
          />
        </div>
        <button
          onClick={handleScrape}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Extraire
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Badge Pill
   ═══════════════════════════════════════════════ */

function BadgePill({ badge }: { badge?: Badge }) {
  if (!badge) return null;
  const found = BADGE_OPTIONS.find((b) => b.value === badge);
  if (!found) return null;
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${found.color}`}
    >
      {found.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   Stock Indicator
   ═══════════════════════════════════════════════ */

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
        Épuisé
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
        <AlertTriangle className="h-3 w-3" /> {stock}
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
      {stock}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function ProductsPage() {
  /* ─── State ─── */
  const [allProducts, setAllProducts] = useState<Product[]>([...staticProducts]);
  const [dynamicIds, setDynamicIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('tous');
  const [loading, setLoading] = useState(false);
  const [scrapeLoading, setScrapeLoading] = useState(false);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScrapeModal, setShowScrapeModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Add & edit form data
  const [formData, setFormData] = useState<ProductFormData>({ ...EMPTY_FORM });

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  /* ─── Load products ─── */
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const dynamic: Product[] = await res.json();
      if (Array.isArray(dynamic)) {
        const ids = new Set(dynamic.map((p) => p.id));
        setDynamicIds(ids);
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

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    let list = allProducts;
    if (activeTab !== 'tous') list = list.filter((p) => p.category === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return list;
  }, [allProducts, activeTab, search]);

  /* ─── Category counts ─── */
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { tous: allProducts.length };
    for (const c of CATEGORIES) counts[c.slug] = 0;
    for (const p of allProducts) counts[p.category] = (counts[p.category] || 0) + 1;
    return counts;
  }, [allProducts]);

  /* ─── Handlers ─── */

  const openAdd = (scraped?: Partial<ProductFormData> & { images: string[] }) => {
    setFormData({
      ...EMPTY_FORM,
      ...scraped,
    });
    setShowScrapeModal(false);
    setShowAddModal(true);
  };

  const openEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      currency: product.currency,
      description: product.description,
      images: product.images,
      sizes: product.sizes || [],
      badge: product.badge || '',
      stock: product.stock,
      rating: product.rating,
      reviews: product.reviews,
      newArrival: product.newArrival || false,
      featured: product.featured || false,
      trending: product.trending || false,
      hidePrice: product.hidePrice || false,
    });
    setEditingProduct(product);
  };

  const handleAdd = async () => {
    if (!formData.name || !formData.price) return;
    setLoading(true);
    try {
      const product: Partial<Product> & { sourceUrl?: string } = {
        id: `prod-${Date.now()}`,
        name: formData.name,
        slug: slugify(formData.name),
        category: formData.category,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        currency: formData.currency || 'USD',
        description: formData.description,
        images: formData.images.length > 0 ? formData.images : ['https://placehold.co/400x400/f3f4f6/9ca3af?text=Photo'],
        sizes: formData.sizes,
        badge: formData.badge || undefined,
        stock: formData.stock,
        rating: formData.rating,
        reviews: formData.reviews,
        newArrival: formData.newArrival,
        featured: formData.featured,
        trending: formData.trending,
        hidePrice: formData.hidePrice || undefined,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      showToast(`"${formData.name}" ajouté avec succès`);
      setShowAddModal(false);
      setFormData({ ...EMPTY_FORM });
      fetchProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingProduct || !formData.name || !formData.price) return;
    setLoading(true);
    try {
      const isStatic = !dynamicIds.has(editingProduct.id);

      const payload: Record<string, unknown> = {
        id: isStatic ? `prod-${Date.now()}` : editingProduct.id,
        name: formData.name,
        slug: slugify(formData.name),
        category: formData.category,
        price: formData.price,
        originalPrice: formData.originalPrice || undefined,
        currency: formData.currency,
        description: formData.description,
        images: formData.images,
        sizes: formData.sizes,
        badge: formData.badge || undefined,
        stock: formData.stock,
        rating: formData.rating,
        reviews: formData.reviews,
        newArrival: formData.newArrival,
        hidePrice: formData.hidePrice || undefined,
      };

      const method = isStatic ? 'POST' : 'PATCH';
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erreur serveur');
      }

      showToast(`"${formData.name}" mis à jour`);
      setEditingProduct(null);
      setFormData({ ...EMPTY_FORM });
      fetchProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;
    setLoading(true);
    try {
      const isDynamic = dynamicIds.has(deletingProduct.id);
      if (isDynamic) {
        const res = await fetch('/api/products', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deletingProduct.id }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Erreur suppression');
        }
      }
      showToast(`"${deletingProduct.name}" supprimé`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* Quick inline stock update */
  const quickUpdateStock = async (product: Product, newStock: number) => {
    if (!dynamicIds.has(product.id)) {
      showToast('Modifiez d\'abord ce produit statique via Éditer', 'error');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, stock: newStock }),
      });
      if (!res.ok) throw new Error('Erreur');
      setAllProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p)),
      );
    } catch {
      showToast('Erreur mise à jour stock', 'error');
    }
  };

  /* ═══ Tabs ═══ */
  const tabs: { value: Tab; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    ...CATEGORIES.map((c) => ({ value: c.slug as Tab, label: c.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {allProducts.length} produit{allProducts.length > 1 ? 's' : ''} au total
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowScrapeModal(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LinkIcon className="h-4 w-4" />
            Importer via lien
          </button>
          <button
            onClick={() => openAdd()}
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>
      </motion.div>

      {/* Search + Category Tabs */}
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
            placeholder="Rechercher un produit..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.value
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span
                className={`text-[11px] ${
                  activeTab === tab.value ? 'text-gray-300' : 'text-gray-400'
                }`}
              >
                {categoryCounts[tab.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Product Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Package className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Aucun produit trouvé</p>
            <p className="mt-1 text-xs text-gray-400">
              Modifiez vos filtres ou ajoutez un nouveau produit
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Catégorie
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Badge
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-gray-50/60"
                  >
                    {/* Product image + name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900 max-w-[220px]">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-gray-400">{product.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 capitalize">
                        {CATEGORIES.find((c) => c.slug === product.category)?.name || product.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <div>
                        {product.hidePrice ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                            <EyeOff className="h-3 w-3" />
                            Masque
                          </span>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-gray-900">
                              {formatPrice(product.price)}
                            </p>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <p className="text-[11px] text-gray-400 line-through">
                                {formatPrice(product.originalPrice)}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-center">
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Badge */}
                    <td className="px-4 py-3 text-center">
                      <BadgePill badge={product.badge} />
                      {!product.badge && (
                        <span className="text-[11px] text-gray-300">—</span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          dynamicIds.has(product.id)
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {dynamicIds.has(product.id) ? 'Supabase' : 'Statique'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(product)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
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
              {filtered.length} produit{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
              {activeTab !== 'tous' || search ? ` (filtrés sur ${allProducts.length})` : ''}
            </p>
          </div>
        )}
      </motion.div>

      {/* ═══ Modals ═══ */}

      {/* Scrape Modal */}
      <Modal
        open={showScrapeModal}
        onClose={() => setShowScrapeModal(false)}
        title="Importer via lien"
      >
        <ScrapeForm
          onScraped={(data) => openAdd(data)}
          loading={scrapeLoading}
          setLoading={setScrapeLoading}
        />
      </Modal>

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setFormData({ ...EMPTY_FORM });
        }}
        title="Ajouter un produit"
        wide
      >
        <ProductForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleAdd}
          onCancel={() => {
            setShowAddModal(false);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Ajouter le produit"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editingProduct}
        onClose={() => {
          setEditingProduct(null);
          setFormData({ ...EMPTY_FORM });
        }}
        title={`Modifier — ${editingProduct?.name || ''}`}
        wide
      >
        <ProductForm
          data={formData}
          onChange={setFormData}
          onSubmit={handleEdit}
          onCancel={() => {
            setEditingProduct(null);
            setFormData({ ...EMPTY_FORM });
          }}
          loading={loading}
          submitLabel="Enregistrer"
        />
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        title="Supprimer le produit"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Êtes-vous sûr de vouloir supprimer ce produit ?
              </p>
              <p className="mt-1 text-xs text-red-600">
                &laquo;&nbsp;{deletingProduct?.name}&nbsp;&raquo; sera
                {dynamicIds.has(deletingProduct?.id || '')
                  ? ' définitivement supprimé de la base de données.'
                  : ' masqué (produit statique — il réapparaîtra au rechargement).'}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingProduct(null)}
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
