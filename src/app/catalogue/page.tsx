'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Search,
} from 'lucide-react';
import { useAllProducts } from '@/lib/useAllProducts';
import { CATEGORIES, type Category, type Badge, type Product } from '@/lib/types';
import ProductCard from '@/components/home/ProductCard';

type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'popular';

interface PriceRange {
  label: string;
  min: number;
  max: number;
}

const PRICE_RANGES: PriceRange[] = [
  { label: '0 - 25 $', min: 0, max: 25 },
  { label: '25 - 50 $', min: 25, max: 50 },
  { label: '50 - 100 $', min: 50, max: 100 },
  { label: '100 - 200 $', min: 100, max: 200 },
  { label: '200 $ +', min: 200, max: Infinity },
];

const BADGE_OPTIONS: { value: Badge; label: string }[] = [
  { value: 'nouveau', label: 'Nouveau' },
  { value: 'best-seller', label: 'Best Seller' },
  { value: 'tendance', label: 'Tendance' },
  { value: 'promo', label: 'Promo' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popular', label: 'Popularite' },
  { value: 'newest', label: 'Nouveautes' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix decroissant' },
];

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/10 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-black">
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-black/40" />
        ) : (
          <ChevronDown className="h-4 w-4 text-black/40" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex items-center gap-3 py-1.5 cursor-pointer group">
      <div
        className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-[#C9A96E] bg-[#C9A96E]'
            : 'border-black/25 group-hover:border-black/50'
        }`}
      >
        {checked && (
          <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6L5 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-sm text-black/70 group-hover:text-black transition-colors flex-1">
        {label}
      </span>
      {count !== undefined && (
        <span className="text-xs text-black/30">{count}</span>
      )}
    </label>
  );
}

function SidebarFilters({
  products,
  selectedCategories,
  toggleCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedBadges,
  toggleBadge,
  sort,
  setSort,
  searchQuery,
  setSearchQuery,
  clearAllFilters,
  activeFilterCount,
}: {
  products: Product[];
  selectedCategories: Category[];
  toggleCategory: (cat: Category) => void;
  selectedPriceRange: PriceRange | null;
  setSelectedPriceRange: (range: PriceRange | null) => void;
  selectedBadges: Badge[];
  toggleBadge: (badge: Badge) => void;
  sort: SortOption;
  setSort: (sort: SortOption) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  clearAllFilters: () => void;
  activeFilterCount: number;
}) {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  return (
    <div className="space-y-0">
      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher..."
          className="w-full rounded-lg border border-black/10 bg-[#F5F0EB]/50 py-2.5 pl-10 pr-4 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#C9A96E] focus:bg-white"
        />
      </div>

      {/* Active filters indicator */}
      {activeFilterCount > 0 && (
        <div className="mb-5 flex items-center justify-between">
          <span className="text-xs text-black/50">
            {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
          </span>
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#C9A96E] hover:text-[#B8944F] transition-colors"
          >
            Tout effacer
          </button>
        </div>
      )}

      {/* Sort */}
      <FilterSection title="Trier par">
        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-3 py-1.5 cursor-pointer group">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                  sort === option.value
                    ? 'border-[#C9A96E] bg-[#C9A96E]'
                    : 'border-black/25 group-hover:border-black/50'
                }`}
              >
                {sort === option.value && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                className={`text-sm transition-colors ${
                  sort === option.value ? 'text-black font-medium' : 'text-black/70 group-hover:text-black'
                }`}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Categories">
        <div className="space-y-0.5 max-h-60 overflow-y-auto hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <Checkbox
              key={cat.slug}
              checked={selectedCategories.includes(cat.slug)}
              onChange={() => toggleCategory(cat.slug)}
              label={cat.name}
              count={categoryCounts[cat.slug] || 0}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Prix">
        <div className="space-y-0.5">
          {PRICE_RANGES.map((range) => (
            <label key={range.label} className="flex items-center gap-3 py-1.5 cursor-pointer group">
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                  selectedPriceRange?.label === range.label
                    ? 'border-[#C9A96E] bg-[#C9A96E]'
                    : 'border-black/25 group-hover:border-black/50'
                }`}
              >
                {selectedPriceRange?.label === range.label && (
                  <div className="h-1.5 w-1.5 rounded-full bg-white" />
                )}
              </div>
              <span
                onClick={() =>
                  setSelectedPriceRange(
                    selectedPriceRange?.label === range.label ? null : range
                  )
                }
                className={`text-sm transition-colors cursor-pointer ${
                  selectedPriceRange?.label === range.label
                    ? 'text-black font-medium'
                    : 'text-black/70 group-hover:text-black'
                }`}
              >
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Badges */}
      <FilterSection title="Etiquettes">
        <div className="space-y-0.5">
          {BADGE_OPTIONS.map((option) => (
            <Checkbox
              key={option.value}
              checked={selectedBadges.includes(option.value)}
              onChange={() => toggleBadge(option.value)}
              label={option.label}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export default function CataloguePageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CataloguePage />
    </Suspense>
  );
}

function CataloguePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const products = useAllProducts();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read initial state from URL search params
  const initialCategories = (searchParams.get('category')?.split(',').filter(Boolean) || []) as Category[];
  const initialSort = (searchParams.get('sort') as SortOption) || 'popular';
  const initialBadge = (searchParams.get('badge')?.split(',').filter(Boolean) || []) as Badge[];
  const initialSearch = searchParams.get('q') || '';
  const initialPrice = searchParams.get('price') || '';

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(initialCategories);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange | null>(
    PRICE_RANGES.find((r) => r.label === initialPrice) || null
  );
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>(initialBadge);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sync state to URL
  const updateURL = useCallback(
    (categories: Category[], priceRange: PriceRange | null, badges: Badge[], sortOption: SortOption, query: string) => {
      const params = new URLSearchParams();
      if (categories.length > 0) params.set('category', categories.join(','));
      if (priceRange) params.set('price', priceRange.label);
      if (badges.length > 0) params.set('badge', badges.join(','));
      if (sortOption !== 'popular') params.set('sort', sortOption);
      if (query) params.set('q', query);
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/catalogue', { scroll: false });
    },
    [router]
  );

  const toggleCategory = useCallback(
    (cat: Category) => {
      setSelectedCategories((prev) => {
        const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
        updateURL(next, selectedPriceRange, selectedBadges, sort, searchQuery);
        return next;
      });
    },
    [selectedPriceRange, selectedBadges, sort, searchQuery, updateURL]
  );

  const toggleBadge = useCallback(
    (badge: Badge) => {
      setSelectedBadges((prev) => {
        const next = prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge];
        updateURL(selectedCategories, selectedPriceRange, next, sort, searchQuery);
        return next;
      });
    },
    [selectedCategories, selectedPriceRange, sort, searchQuery, updateURL]
  );

  const handlePriceRange = useCallback(
    (range: PriceRange | null) => {
      setSelectedPriceRange(range);
      updateURL(selectedCategories, range, selectedBadges, sort, searchQuery);
    },
    [selectedCategories, selectedBadges, sort, searchQuery, updateURL]
  );

  const handleSort = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      updateURL(selectedCategories, selectedPriceRange, selectedBadges, newSort, searchQuery);
    },
    [selectedCategories, selectedPriceRange, selectedBadges, searchQuery, updateURL]
  );

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      updateURL(selectedCategories, selectedPriceRange, selectedBadges, sort, q);
    },
    [selectedCategories, selectedPriceRange, selectedBadges, sort, updateURL]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedBadges([]);
    setSort('popular');
    setSearchQuery('');
    router.replace('/catalogue', { scroll: false });
  }, [router]);

  const activeFilterCount =
    selectedCategories.length +
    (selectedPriceRange ? 1 : 0) +
    selectedBadges.length +
    (searchQuery ? 1 : 0);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price range filter
    if (selectedPriceRange) {
      result = result.filter(
        (p) => p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );
    }

    // Badge filter
    if (selectedBadges.length > 0) {
      result = result.filter((p) => p.badge && selectedBadges.includes(p.badge));
    }

    // Sort
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0));
        break;
      case 'popular':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [products, selectedCategories, selectedPriceRange, selectedBadges, sort, searchQuery]);

  // Lock body scroll when mobile filters are open
  useEffect(() => {
    if (mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFiltersOpen]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-extralight tracking-[0.15em] text-black uppercase"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              Notre Collection
            </h1>
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-[#C9A96E]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="w-12 h-px bg-[#C9A96E]/50" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Mobile: filter bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <p className="text-sm text-black/50">
            {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}{' '}
            trouv&eacute;{filteredProducts.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2.5 text-sm font-medium text-black transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A96E] text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-10">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-8">
              <SidebarFilters
                products={products}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedPriceRange={selectedPriceRange}
                setSelectedPriceRange={handlePriceRange}
                selectedBadges={selectedBadges}
                toggleBadge={toggleBadge}
                sort={sort}
                setSort={handleSort}
                searchQuery={searchQuery}
                setSearchQuery={handleSearch}
                clearAllFilters={clearAllFilters}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {/* Desktop count + sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-black/50">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}{' '}
                trouv&eacute;{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-black/40 uppercase tracking-wider">Trier:</span>
                <select
                  value={sort}
                  onChange={(e) => handleSort(e.target.value as SortOption)}
                  className="rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-black outline-none focus:border-[#C9A96E] cursor-pointer"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <Search className="mb-4 h-16 w-16 text-black/10" />
                <h3 className="text-lg font-medium text-black/60 mb-2">
                  Aucun produit trouv&eacute;
                </h3>
                <p className="text-sm text-black/40 max-w-md">
                  Essayez de modifier vos filtres ou votre recherche pour trouver ce que vous cherchez.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#C9A96E]"
                >
                  Effacer les filtres
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setMobileFiltersOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl"
            >
              {/* Handle */}
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white px-6 py-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-black">
                  Filtres
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6">
                <SidebarFilters
                  products={products}
                  selectedCategories={selectedCategories}
                  toggleCategory={toggleCategory}
                  selectedPriceRange={selectedPriceRange}
                  setSelectedPriceRange={handlePriceRange}
                  selectedBadges={selectedBadges}
                  toggleBadge={toggleBadge}
                  sort={sort}
                  setSort={handleSort}
                  searchQuery={searchQuery}
                  setSearchQuery={handleSearch}
                  clearAllFilters={clearAllFilters}
                  activeFilterCount={activeFilterCount}
                />
              </div>

              {/* Apply button */}
              <div className="sticky bottom-0 border-t border-black/5 bg-white px-6 py-4">
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full rounded-lg bg-black py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#C9A96E]"
                >
                  Voir {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
