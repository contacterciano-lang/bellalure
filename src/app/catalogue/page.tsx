'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  LayoutGrid,
  Grid2x2,
  Grid3x3,
  PackageOpen,
} from 'lucide-react';
import { useAllProducts } from '@/lib/useAllProducts';
import { CATEGORIES, type Category, type Badge, type Product } from '@/lib/types';
import ProductCard from '@/components/home/ProductCard';

/* ─── Constants ─── */

const PRODUCTS_PER_PAGE = 24;

type SortOption = 'price-asc' | 'price-desc' | 'newest' | 'popular';
type GridColumns = 2 | 3 | 4;

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

/* ─── Reusable sub-components ─── */

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

/* ─── Sidebar filters ─── */

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
            {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif
            {activeFilterCount > 1 ? 's' : ''}
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
            <label
              key={option.value}
              className="flex items-center gap-3 py-1.5 cursor-pointer group"
            >
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
                onClick={() => setSort(option.value)}
                className={`text-sm transition-colors cursor-pointer ${
                  sort === option.value
                    ? 'text-black font-medium'
                    : 'text-black/70 group-hover:text-black'
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
            <label
              key={range.label}
              className="flex items-center gap-3 py-1.5 cursor-pointer group"
            >
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

/* ─── Active Filter Chips ─── */

function ActiveFilterChips({
  selectedCategories,
  toggleCategory,
  selectedPriceRange,
  setSelectedPriceRange,
  selectedBadges,
  toggleBadge,
  searchQuery,
  setSearchQuery,
  clearAllFilters,
}: {
  selectedCategories: Category[];
  toggleCategory: (cat: Category) => void;
  selectedPriceRange: PriceRange | null;
  setSelectedPriceRange: (range: PriceRange | null) => void;
  selectedBadges: Badge[];
  toggleBadge: (badge: Badge) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  clearAllFilters: () => void;
}) {
  const hasAny =
    selectedCategories.length > 0 ||
    selectedPriceRange !== null ||
    selectedBadges.length > 0 ||
    searchQuery.trim().length > 0;

  if (!hasAny) return null;

  const categoryNameMap = Object.fromEntries(
    CATEGORIES.map((c) => [c.slug, c.name])
  );
  const badgeLabelMap = Object.fromEntries(
    BADGE_OPTIONS.map((b) => [b.value, b.label])
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center gap-2 mb-6"
    >
      <span className="text-xs text-black/40 uppercase tracking-wider mr-1">
        Filtres:
      </span>

      {searchQuery.trim() && (
        <Chip label={`"${searchQuery}"`} onRemove={() => setSearchQuery('')} />
      )}

      {selectedCategories.map((cat) => (
        <Chip
          key={cat}
          label={categoryNameMap[cat] || cat}
          onRemove={() => toggleCategory(cat)}
        />
      ))}

      {selectedPriceRange && (
        <Chip
          label={selectedPriceRange.label}
          onRemove={() => setSelectedPriceRange(null)}
        />
      )}

      {selectedBadges.map((badge) => (
        <Chip
          key={badge}
          label={badgeLabelMap[badge] || badge}
          onRemove={() => toggleBadge(badge)}
        />
      ))}

      <button
        onClick={clearAllFilters}
        className="ml-1 text-xs text-[#C9A96E] hover:text-[#B8944F] transition-colors underline underline-offset-2"
      >
        Tout effacer
      </button>
    </motion.div>
  );
}

function Chip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-3 py-1 text-xs font-medium text-black/70"
    >
      {label}
      <button
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[#C9A96E]/20 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </motion.span>
  );
}

/* ─── Grid View Toggle ─── */

function GridViewToggle({
  columns,
  setColumns,
}: {
  columns: GridColumns;
  setColumns: (c: GridColumns) => void;
}) {
  const options: { value: GridColumns; icon: React.ReactNode; label: string }[] = [
    { value: 2, icon: <Grid2x2 className="h-4 w-4" />, label: '2 colonnes' },
    { value: 3, icon: <Grid3x3 className="h-4 w-4" />, label: '3 colonnes' },
    { value: 4, icon: <LayoutGrid className="h-4 w-4" />, label: '4 colonnes' },
  ];

  return (
    <div className="hidden md:flex items-center gap-1 rounded-lg border border-black/10 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setColumns(opt.value)}
          title={opt.label}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
            columns === opt.value
              ? 'bg-[#C9A96E] text-white'
              : 'text-black/30 hover:text-black/60'
          }`}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}

/* ─── Pagination ─── */

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  // Build page numbers to show
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = getVisiblePages();

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-medium text-black/70 transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:pointer-events-none disabled:opacity-30"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Precedent</span>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, i) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-10 w-10 items-center justify-center text-sm text-black/30"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#C9A96E] text-white'
                  : 'text-black/60 hover:bg-[#F5F0EB] hover:text-black'
              }`}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-medium text-black/70 transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E] disabled:pointer-events-none disabled:opacity-30"
      >
        <span className="hidden sm:inline">Suivant</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ─── No Results State ─── */

function NoResults({
  searchQuery,
  clearAllFilters,
}: {
  searchQuery: string;
  clearAllFilters: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#F5F0EB]">
        <PackageOpen className="h-12 w-12 text-[#C9A96E]/60" />
      </div>
      <h3 className="font-display text-xl text-black/80 mb-2">
        Aucun produit trouv&eacute;
      </h3>
      <p className="text-sm text-black/40 max-w-md leading-relaxed">
        {searchQuery.trim()
          ? `Nous n'avons rien trouvé pour "${searchQuery}". Vérifiez l'orthographe ou essayez un autre terme.`
          : 'Essayez de modifier vos filtres pour découvrir notre collection.'}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={clearAllFilters}
          className="rounded-lg bg-black px-6 py-3 text-sm font-medium uppercase tracking-[0.05em] text-white transition-colors hover:bg-[#C9A96E]"
        >
          Effacer les filtres
        </button>
        <Link
          href="/"
          className="text-sm text-[#C9A96E] hover:text-[#B8944F] transition-colors underline underline-offset-2"
        >
          Retour a l&apos;accueil
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Grid column class map ─── */

const gridColsClass: Record<GridColumns, string> = {
  2: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
};

/* ─── Framer Motion variants for grid items ─── */

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
} as const;

const gridItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
} as const;

/* ─── Main exports ─── */

export default function CataloguePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CataloguePage />
    </Suspense>
  );
}

function CataloguePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const products = useAllProducts();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Grid view preference
  const [gridColumns, setGridColumns] = useState<GridColumns>(3);

  // Read initial state from URL search params
  const initialCategories = (searchParams
    .get('category')
    ?.split(',')
    .filter(Boolean) || []) as Category[];
  const initialSort =
    (searchParams.get('sort') as SortOption) || 'popular';
  const initialBadge = (searchParams
    .get('badge')
    ?.split(',')
    .filter(Boolean) || []) as Badge[];
  const initialSearch = searchParams.get('q') || '';
  const initialPrice = searchParams.get('price') || '';
  const initialPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const [selectedCategories, setSelectedCategories] =
    useState<Category[]>(initialCategories);
  const [selectedPriceRange, setSelectedPriceRange] =
    useState<PriceRange | null>(
      PRICE_RANGES.find((r) => r.label === initialPrice) || null
    );
  const [selectedBadges, setSelectedBadges] = useState<Badge[]>(initialBadge);
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Sync state to URL
  const updateURL = useCallback(
    (
      categories: Category[],
      priceRange: PriceRange | null,
      badges: Badge[],
      sortOption: SortOption,
      query: string,
      page: number
    ) => {
      const params = new URLSearchParams();
      if (categories.length > 0) params.set('category', categories.join(','));
      if (priceRange) params.set('price', priceRange.label);
      if (badges.length > 0) params.set('badge', badges.join(','));
      if (sortOption !== 'popular') params.set('sort', sortOption);
      if (query) params.set('q', query);
      if (page > 1) params.set('page', String(page));
      const qs = params.toString();
      router.replace(qs ? `?${qs}` : '/catalogue', { scroll: false });
    },
    [router]
  );

  // Helpers to update filters (reset page to 1 on filter change)
  const toggleCategory = useCallback(
    (cat: Category) => {
      setSelectedCategories((prev) => {
        const next = prev.includes(cat)
          ? prev.filter((c) => c !== cat)
          : [...prev, cat];
        setCurrentPage(1);
        updateURL(next, selectedPriceRange, selectedBadges, sort, searchQuery, 1);
        return next;
      });
    },
    [selectedPriceRange, selectedBadges, sort, searchQuery, updateURL]
  );

  const toggleBadge = useCallback(
    (badge: Badge) => {
      setSelectedBadges((prev) => {
        const next = prev.includes(badge)
          ? prev.filter((b) => b !== badge)
          : [...prev, badge];
        setCurrentPage(1);
        updateURL(selectedCategories, selectedPriceRange, next, sort, searchQuery, 1);
        return next;
      });
    },
    [selectedCategories, selectedPriceRange, sort, searchQuery, updateURL]
  );

  const handlePriceRange = useCallback(
    (range: PriceRange | null) => {
      setSelectedPriceRange(range);
      setCurrentPage(1);
      updateURL(selectedCategories, range, selectedBadges, sort, searchQuery, 1);
    },
    [selectedCategories, selectedBadges, sort, searchQuery, updateURL]
  );

  const handleSort = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      setCurrentPage(1);
      updateURL(
        selectedCategories,
        selectedPriceRange,
        selectedBadges,
        newSort,
        searchQuery,
        1
      );
    },
    [selectedCategories, selectedPriceRange, selectedBadges, searchQuery, updateURL]
  );

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
      setCurrentPage(1);
      updateURL(selectedCategories, selectedPriceRange, selectedBadges, sort, q, 1);
    },
    [selectedCategories, selectedPriceRange, selectedBadges, sort, updateURL]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateURL(
        selectedCategories,
        selectedPriceRange,
        selectedBadges,
        sort,
        searchQuery,
        page
      );
      // Scroll to top of grid area smoothly
      window.scrollTo({ top: 280, behavior: 'smooth' });
    },
    [selectedCategories, selectedPriceRange, selectedBadges, sort, searchQuery, updateURL]
  );

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedBadges([]);
    setSort('popular');
    setSearchQuery('');
    setCurrentPage(1);
    router.replace('/catalogue', { scroll: false });
  }, [router]);

  const activeFilterCount =
    selectedCategories.length +
    (selectedPriceRange ? 1 : 0) +
    selectedBadges.length +
    (searchQuery ? 1 : 0);

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter — nom, description, catégorie, badge, couleurs, tailles
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const haystack = [
          p.name,
          p.description,
          p.category,
          p.badge || '',
          ...(p.colors?.map((c) => c.name) || []),
          ...(p.sizes || []),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Price range filter
    if (selectedPriceRange) {
      result = result.filter(
        (p) =>
          p.price >= selectedPriceRange.min && p.price < selectedPriceRange.max
      );
    }

    // Badge filter
    if (selectedBadges.length > 0) {
      result = result.filter(
        (p) => p.badge && selectedBadges.includes(p.badge)
      );
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
        result.sort(
          (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)
        );
        break;
      case 'popular':
        result.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return result;
  }, [
    products,
    selectedCategories,
    selectedPriceRange,
    selectedBadges,
    sort,
    searchQuery,
  ]);

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  // Clamp current page if filters reduced the result count
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalProducts);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // If safePage diverged from currentPage, sync
  useEffect(() => {
    if (safePage !== currentPage && totalProducts > 0) {
      setCurrentPage(safePage);
    }
  }, [safePage, currentPage, totalProducts]);

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
      {/* ── Premium Header Banner ── */}
      <div className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-[#F5F0EB]/60 via-[#F5F0EB]/30 to-white">
        {/* Subtle decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C9A96E]/5 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#C9A96E]/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-2 text-xs text-black/40 mb-8 justify-center md:justify-start"
          >
            <Link
              href="/"
              className="hover:text-[#C9A96E] transition-colors"
            >
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-black/70 font-medium">Catalogue</span>
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-light tracking-[0.12em] text-black uppercase leading-tight">
              Notre Collection
            </h1>
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="w-12 h-px bg-[#C9A96E]/50" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E]" />
              <span className="w-12 h-px bg-[#C9A96E]/50" />
            </div>
            <p className="mt-4 text-sm text-black/40 tracking-wide max-w-lg mx-auto">
              D&eacute;couvrez notre s&eacute;lection de pi&egrave;ces raffin&eacute;es, choisies avec soin pour votre style
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Mobile: filter bar */}
        <div className="flex items-center justify-between mb-6 lg:hidden">
          <p className="text-sm text-black/50">
            {totalProducts} produit{totalProducts !== 1 ? 's' : ''}
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

          {/* Product grid area */}
          <div className="flex-1 min-w-0">
            {/* Desktop toolbar: count + grid toggle + sort */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-sm text-black/50">
                {totalProducts > 0
                  ? `Affichage ${startIndex + 1}–${endIndex} sur ${totalProducts} produit${totalProducts !== 1 ? 's' : ''}`
                  : '0 produit'}
              </p>
              <div className="flex items-center gap-4">
                <GridViewToggle
                  columns={gridColumns}
                  setColumns={setGridColumns}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-black/40 uppercase tracking-wider">
                    Trier:
                  </span>
                  <select
                    value={sort}
                    onChange={(e) =>
                      handleSort(e.target.value as SortOption)
                    }
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
            </div>

            {/* Active filter chips */}
            <ActiveFilterChips
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              selectedPriceRange={selectedPriceRange}
              setSelectedPriceRange={handlePriceRange}
              selectedBadges={selectedBadges}
              toggleBadge={toggleBadge}
              searchQuery={searchQuery}
              setSearchQuery={handleSearch}
              clearAllFilters={clearAllFilters}
            />

            {/* Product grid or no results */}
            {paginatedProducts.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-${safePage}-${sort}-${selectedCategories.join()}-${selectedBadges.join()}-${selectedPriceRange?.label || ''}-${searchQuery}`}
                    variants={gridContainerVariants}
                    initial="hidden"
                    animate="visible"
                    className={`grid ${gridColsClass[gridColumns]} gap-4 md:gap-6`}
                  >
                    {paginatedProducts.map((product) => (
                      <motion.div
                        key={product.id}
                        variants={gridItemVariants}
                        layout
                      >
                        <ProductCard product={product} />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {/* Page info (mobile) */}
                {totalPages > 1 && (
                  <p className="mt-6 text-center text-xs text-black/30 lg:hidden">
                    Affichage {startIndex + 1}&ndash;{endIndex} sur{' '}
                    {totalProducts} produit
                    {totalProducts !== 1 ? 's' : ''}
                  </p>
                )}

                {/* Pagination */}
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <NoResults
                searchQuery={searchQuery}
                clearAllFilters={clearAllFilters}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter panel ── */}
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
                  Voir {totalProducts} produit
                  {totalProducts !== 1 ? 's' : ''}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
