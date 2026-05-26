'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  PackageCheck,
  PackageX,
  Tags,
  Pencil,
  Trash2,
  X,
  Search,
  Lock,
  Eye,
  EyeOff,
  ShoppingBag,
  ChevronDown,
  Link as LinkIcon,
  Loader2,
  Globe,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import { CATEGORIES, type Product, type Badge, type Category } from '@/lib/types';

const ADMIN_PASSWORD = 'bellalure2024';

const BADGE_OPTIONS: { value: Badge | ''; label: string }[] = [
  { value: '', label: 'Aucun' },
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'tendance', label: 'Tendance' },
  { value: 'promo', label: 'Promo' },
];

const SIZE_PRESETS: Record<string, string[]> = {
  vetements: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  chaussures: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  unique: ['Taille unique'],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 z-50 m-auto flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ScrapedData {
  name: string;
  description: string;
  price: number | null;
  originalPrice: number | null;
  currency: string;
  images: string[];
}

function ScrapeForm({ onProductAdded }: { onProductAdded: (product: Product) => void }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scraped, setScraped] = useState<ScrapedData | null>(null);
  const [step, setStep] = useState<'url' | 'edit'>('url');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>();
  const [category, setCategory] = useState<Category>('femme');
  const [badge, setBadge] = useState<Badge | ''>('nouveau');
  const [stock, setStock] = useState(10);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setScraped(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors du scraping');
        return;
      }

      setScraped(data);
      setName(data.name || '');
      setDescription(data.description || '');
      setPrice(data.price || 0);
      setOriginalPrice(data.originalPrice || undefined);
      setSelectedImages(data.images?.slice(0, 5) || []);
      setStep('edit');
    } catch {
      setError('Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    setError('');

    const product: Product = {
      id: `dyn-${Date.now()}`,
      name: name.trim(),
      slug: slugify(name),
      category,
      price,
      originalPrice: originalPrice || undefined,
      currency: 'USD',
      description: description.trim(),
      images: selectedImages.length > 0 ? selectedImages : ['/products/placeholder.jpg'],
      sizes: sizes.length > 0 ? sizes : undefined,
      badge: badge || undefined,
      stock,
      rating: 4.5,
      reviews: 0,
      newArrival: true,
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, sourceUrl: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setSuccess(true);
      onProductAdded(product);

      setTimeout(() => {
        setSuccess(false);
        setStep('url');
        setUrl('');
        setScraped(null);
        setName('');
        setDescription('');
        setPrice(0);
        setOriginalPrice(undefined);
        setSelectedImages([]);
        setSizes([]);
        setBadge('nouveau');
        setStock(10);
        setCategory('femme');
      }, 2000);
    } catch {
      setError('Impossible de sauvegarder le produit');
    } finally {
      setSaving(false);
    }
  };

  const toggleImage = (img: string) => {
    setSelectedImages((prev) =>
      prev.includes(img) ? prev.filter((i) => i !== img) : [...prev, img]
    );
  };

  const applySizePreset = (preset: string) => {
    setSizes(SIZE_PRESETS[preset] || []);
  };

  const inputClass =
    'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500';
  const labelClass = 'block text-xs font-medium text-gray-600 mb-1.5';

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
        <h3 className="text-lg font-semibold text-gray-900">Produit ajout&eacute; !</h3>
        <p className="mt-1 text-sm text-gray-500">
          Le produit a &eacute;t&eacute; ajout&eacute; au catalogue avec succ&egrave;s.
        </p>
      </motion.div>
    );
  }

  if (step === 'url') {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
          <Globe className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-sm font-semibold text-gray-900">
            Ajouter un produit depuis un lien
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            Collez le lien d&apos;un produit et les informations seront r&eacute;cup&eacute;r&eacute;es automatiquement
          </p>

          <form onSubmit={handleScrape} className="mt-6 flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://exemple.com/produit..."
                className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse...
                </>
              ) : (
                'Scraper'
              )}
            </button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center justify-center gap-2 text-sm text-red-600"
            >
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">
          Modifier les informations scrap&eacute;es
        </h3>
        <button
          onClick={() => {
            setStep('url');
            setScraped(null);
          }}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          &larr; Retour
        </button>
      </div>

      {scraped && scraped.images.length > 0 && (
        <div>
          <label className={labelClass}>
            Images ({selectedImages.length} s&eacute;lectionn&eacute;e{selectedImages.length > 1 ? 's' : ''})
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {scraped.images.map((img, i) => (
              <button
                key={i}
                onClick={() => toggleImage(img)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImages.includes(img)
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-gray-200 opacity-60 hover:opacity-100'
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" unoptimized />
                {selectedImages.includes(img) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Nom du produit *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Cat&eacute;gorie *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={inputClass}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>&Eacute;tiquette</label>
          <select
            value={badge}
            onChange={(e) => setBadge(e.target.value as Badge | '')}
            className={inputClass}
          >
            {BADGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Prix ($) *</label>
          <input
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            className={inputClass}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className={labelClass}>Prix original ($)</label>
          <input
            type="number"
            value={originalPrice || ''}
            onChange={(e) =>
              setOriginalPrice(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className={inputClass}
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className={labelClass}>Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value) || 0)}
            className={inputClass}
            min="0"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputClass} resize-none`}
          rows={3}
        />
      </div>

      <div>
        <label className={labelClass}>Tailles</label>
        <div className="mb-2 flex gap-2">
          <button
            type="button"
            onClick={() => applySizePreset('vetements')}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            V&ecirc;tements (XS-XXL)
          </button>
          <button
            type="button"
            onClick={() => applySizePreset('chaussures')}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            Chaussures (36-45)
          </button>
          <button
            type="button"
            onClick={() => applySizePreset('unique')}
            className="rounded-md border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
          >
            Taille unique
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((size) => (
            <span
              key={size}
              className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
            >
              {size}
              <button
                type="button"
                onClick={() => setSizes((prev) => prev.filter((s) => s !== size))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {sizes.length === 0 && (
            <span className="text-xs text-gray-400">Aucune taille s&eacute;lectionn&eacute;e</span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-5">
        <button
          type="button"
          onClick={() => {
            setStep('url');
            setScraped(null);
          }}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Ajout en cours...
            </>
          ) : (
            'Ajouter au catalogue'
          )}
        </button>
      </div>
    </div>
  );
}

function PasswordGate({ onAuthenticate }: { onAuthenticate: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onAuthenticate();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Administration</h1>
            <p className="mt-1 text-sm text-gray-500">
              Entrez le mot de passe pour acc&eacute;der au panneau d&apos;administration.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Mot de passe"
                className={`w-full rounded-lg border bg-white px-4 py-3 pr-12 text-sm outline-none transition-colors ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                    : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'
                }`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs text-red-600"
              >
                Mot de passe incorrect
              </motion.p>
            )}
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-black py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Acc&eacute;der
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [productList, setProductList] = useState<Product[]>([...staticProducts]);
  const [dynamicProducts, setDynamicProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [scrapeModalOpen, setScrapeModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        setDynamicProducts(data);
        setProductList([...staticProducts, ...data]);
      })
      .catch(() => {});
  }, []);

  const stats = useMemo(
    () => ({
      total: productList.length,
      inStock: productList.filter((p) => p.stock > 0).length,
      outOfStock: productList.filter((p) => p.stock === 0).length,
      promos: productList.filter(
        (p) => p.badge === 'promo' || (p.originalPrice && p.originalPrice > p.price)
      ).length,
    }),
    [productList]
  );

  const filteredProducts = useMemo(() => {
    let result = [...productList];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (filterCategory) {
      result = result.filter((p) => p.category === filterCategory);
    }
    return result;
  }, [productList, searchQuery, filterCategory]);

  const handleProductAdded = useCallback((product: Product) => {
    setDynamicProducts((prev) => [...prev, product]);
    setProductList((prev) => [...prev, product]);
  }, []);

  const handleEdit = useCallback((product: Product) => {
    setEditingProduct(product);
    setEditModalOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const isDynamic = dynamicProducts.some((p) => p.id === id);
      if (isDynamic) {
        try {
          await fetch('/api/products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });
          setDynamicProducts((prev) => prev.filter((p) => p.id !== id));
        } catch {
          // silent fail
        }
      }
      setProductList((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    },
    [dynamicProducts]
  );

  const getCategoryName = (slug: string) =>
    CATEGORIES.find((c) => c.slug === slug)?.name || slug;

  const getBadgeLabel = (badge: Badge) => {
    const labels: Record<Badge, string> = {
      nouveau: 'Nouveau',
      'best-seller': 'Best Seller',
      tendance: 'Tendance',
      promo: 'Promo',
    };
    return labels[badge];
  };

  const getBadgeColor = (badge: Badge) => {
    const colors: Record<Badge, string> = {
      nouveau: 'bg-gray-900 text-white',
      'best-seller': 'bg-amber-500 text-white',
      tendance: 'bg-purple-500 text-white',
      promo: 'bg-red-500 text-white',
    };
    return colors[badge];
  };

  if (!authenticated) {
    return <PasswordGate onAuthenticate={() => setAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Administration Bellalure</h1>
              <p className="mt-1 text-sm text-gray-500">
                G&eacute;rer vos produits et votre catalogue
              </p>
            </div>
            <button
              onClick={() => setScrapeModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              <LinkIcon className="h-4 w-4" />
              Ajouter via lien
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total produits" value={stats.total} icon={Package} color="bg-blue-600" />
          <StatCard
            label="En stock"
            value={stats.inStock}
            icon={PackageCheck}
            color="bg-emerald-600"
          />
          <StatCard
            label="En rupture"
            value={stats.outOfStock}
            icon={PackageX}
            color="bg-red-500"
          />
          <StatCard
            label="Promos actives"
            value={stats.promos}
            icon={Tags}
            color="bg-amber-500"
          />
        </div>

        {/* Search and filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Toutes les cat&eacute;gories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Product table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Produit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Cat&eacute;gorie
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Prix
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    &Eacute;tiquette
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Source
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
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
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {product.name}
                          </p>
                          <p className="truncate text-xs text-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {getCategoryName(product.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="ml-1.5 text-xs text-gray-400 line-through">
                            ${product.originalPrice}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.stock === 0
                            ? 'bg-red-50 text-red-700'
                            : product.stock <= 5
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.badge ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getBadgeColor(product.badge)}`}
                        >
                          {getBadgeLabel(product.badge)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          product.id.startsWith('dyn-')
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-gray-50 text-gray-500'
                        }`}
                      >
                        {product.id.startsWith('dyn-') ? (
                          <>
                            <Globe className="h-3 w-3" />
                            Scrap&eacute;
                          </>
                        ) : (
                          'Statique'
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600"
                            >
                              Confirmer
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="mb-3 h-12 w-12 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">Aucun produit trouv&eacute;</p>
              <p className="mt-1 text-xs text-gray-400">
                Modifiez vos filtres ou ajoutez un nouveau produit.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scrape Modal */}
      <Modal
        isOpen={scrapeModalOpen}
        onClose={() => setScrapeModalOpen(false)}
        title="Ajouter un produit via lien"
      >
        <ScrapeForm onProductAdded={handleProductAdded} />
      </Modal>
    </div>
  );
}
