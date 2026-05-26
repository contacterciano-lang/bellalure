'use client';

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  MessageCircle,
  ShoppingBag,
  Star,
  Check,
  AlertTriangle,
  XCircle,
  ZoomIn,
  Heart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  Package,
  Clock,
  MapPin,
} from 'lucide-react';
import { useAllProducts } from '@/lib/useAllProducts';
import { CATEGORIES, type Product } from '@/lib/types';
import { getWhatsAppUrl, siteConfig } from '@/lib/config';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import { useCurrency } from '@/lib/currency';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/home/ProductCard';

/* ─────────────────────────── Sub-components ─────────────────────────── */

function StockIndicator({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <div className="flex items-center gap-2 text-red-600">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Rupture de stock</span>
      </div>
    );
  }
  if (stock <= 5) {
    return (
      <div className="flex items-center gap-2 text-amber-600">
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm font-medium">
          Stock limit&eacute; ({stock} restant{stock > 1 ? 's' : ''})
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-emerald-600">
      <Check className="h-4 w-4" />
      <span className="text-sm font-medium">En stock</span>
    </div>
  );
}

function RatingStars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(rating)
                ? 'fill-[#C9A96E] text-[#C9A96E]'
                : 'fill-black/10 text-black/10'
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-black/50">
        {rating} ({reviews} avis)
      </span>
    </div>
  );
}

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div
        className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#F5F0EB] cursor-zoom-in shadow-sm"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {!imageErrors.has(selectedIndex) ? (
          <Image
            src={images[selectedIndex]}
            alt={`${name} - Image ${selectedIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500"
            style={
              isZoomed
                ? {
                    transform: 'scale(2)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : undefined
            }
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3">
            <ShoppingBag className="h-16 w-16 text-black/15" />
            <span className="text-sm text-black/30">Image non disponible</span>
          </div>
        )}

        {/* Zoom hint */}
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-sm">
            <ZoomIn className="h-3 w-3" />
            Survoler pour zoomer
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square w-20 overflow-hidden rounded-lg transition-all ${
                selectedIndex === index
                  ? 'ring-2 ring-[#C9A96E] ring-offset-2'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {!imageErrors.has(index) ? (
                <Image
                  src={img}
                  alt={`${name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F5F0EB]">
                  <ShoppingBag className="h-5 w-5 text-black/20" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function QuantitySelector({
  quantity,
  setQuantity,
  max,
}: {
  quantity: number;
  setQuantity: (q: number) => void;
  max: number;
}) {
  return (
    <div className="flex items-center">
      <button
        onClick={() => setQuantity(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
        className="flex h-11 w-11 items-center justify-center rounded-l-lg border border-black/15 text-black/60 transition-colors hover:bg-[#F5F0EB] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Minus className="h-4 w-4" />
      </button>
      <div className="flex h-11 w-14 items-center justify-center border-y border-black/15 text-sm font-semibold text-black">
        {quantity}
      </div>
      <button
        onClick={() => setQuantity(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className="flex h-11 w-11 items-center justify-center rounded-r-lg border border-black/15 text-black/60 transition-colors hover:bg-[#F5F0EB] disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="text-sm font-semibold uppercase tracking-[0.12em] text-black">
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="h-4 w-4 text-black/40" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm leading-relaxed text-black/60">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SizeGuideTable() {
  const sizes = [
    { eu: 'XS', chest: '82-86', waist: '62-66', hip: '86-90' },
    { eu: 'S', chest: '86-90', waist: '66-70', hip: '90-94' },
    { eu: 'M', chest: '90-94', waist: '70-74', hip: '94-98' },
    { eu: 'L', chest: '94-98', waist: '74-78', hip: '98-102' },
    { eu: 'XL', chest: '98-102', waist: '78-82', hip: '102-106' },
    { eu: 'XXL', chest: '102-106', waist: '82-86', hip: '106-110' },
  ];

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-black/10">
            <th className="pb-3 pr-6 font-semibold text-black/80">Taille</th>
            <th className="pb-3 pr-6 font-semibold text-black/80">
              Poitrine (cm)
            </th>
            <th className="pb-3 pr-6 font-semibold text-black/80">
              Tour de taille (cm)
            </th>
            <th className="pb-3 font-semibold text-black/80">
              Hanches (cm)
            </th>
          </tr>
        </thead>
        <tbody>
          {sizes.map((s) => (
            <tr key={s.eu} className="border-b border-black/5 last:border-0">
              <td className="py-2.5 pr-6 font-medium text-black">{s.eu}</td>
              <td className="py-2.5 pr-6">{s.chest}</td>
              <td className="py-2.5 pr-6">{s.waist}</td>
              <td className="py-2.5">{s.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeliveryInfoSection({ format }: { format: (usd: number) => string }) {
  return (
    <div className="space-y-3">
      {siteConfig.delivery.zones.map((zone) => (
        <div
          key={zone.name}
          className="flex items-center justify-between rounded-lg bg-[#F5F0EB]/50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-[#C9A96E]" />
            <span className="font-medium text-black/80">{zone.name}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-black/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {zone.delay}
            </span>
            <span className="font-semibold text-black/70">
              {zone.fee === 0 ? 'Gratuit' : format(zone.fee)}
            </span>
          </div>
        </div>
      ))}
      <p className="mt-3 text-xs text-black/40">
        Les d&eacute;lais sont donn&eacute;s &agrave; titre indicatif et
        peuvent varier selon la disponibilit&eacute; du produit.
      </p>
    </div>
  );
}

function SampleReviews({ rating, reviews }: { rating: number; reviews: number }) {
  const sampleReviews = [
    {
      name: 'Marie K.',
      date: '12 mai 2026',
      stars: 5,
      comment:
        'Superbe qualité ! Le tissu est très agréable et la coupe parfaite. Livraison rapide à Kinshasa.',
    },
    {
      name: 'Patrick M.',
      date: '28 avril 2026',
      stars: 4,
      comment:
        'Très satisfait de mon achat. Conforme à la description. Je recommande vivement Bellalure.',
    },
    {
      name: 'Sarah L.',
      date: '15 avril 2026',
      stars: 5,
      comment:
        'Produit magnifique, emballage soigné. C\'est exactement ce que je cherchais. Merci !',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex items-center gap-4 rounded-lg bg-[#F5F0EB]/50 px-5 py-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-black">{rating}</div>
          <div className="flex mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(rating)
                    ? 'fill-[#C9A96E] text-[#C9A96E]'
                    : 'fill-black/10 text-black/10'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="h-10 w-px bg-black/10" />
        <div className="text-sm text-black/50">
          Bas&eacute; sur <span className="font-semibold text-black/70">{reviews}</span> avis clients
        </div>
      </div>

      {/* Individual reviews */}
      <div className="space-y-4">
        {sampleReviews.map((review, idx) => (
          <div key={idx} className="rounded-lg border border-black/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/15 text-xs font-bold text-[#C9A96E]">
                  {review.name.charAt(0)}
                </div>
                <span className="text-sm font-semibold text-black/80">
                  {review.name}
                </span>
              </div>
              <span className="text-xs text-black/35">{review.date}</span>
            </div>
            <div className="flex mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < review.stars
                      ? 'fill-[#C9A96E] text-[#C9A96E]'
                      : 'fill-black/10 text-black/10'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-black/60 leading-relaxed">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────── Delivery info bar ─────────────────────────── */

function DeliveryBar({ format }: { format: (usd: number) => string }) {
  return (
    <div className="mt-5 grid grid-cols-3 gap-2">
      {siteConfig.delivery.zones.map((zone) => (
        <div
          key={zone.name}
          className="flex flex-col items-center gap-1 rounded-lg border border-black/5 bg-[#F5F0EB]/30 p-3 text-center"
        >
          <Truck className="h-4 w-4 text-[#C9A96E]" />
          <span className="text-[10px] font-semibold text-black/70 leading-tight">
            {zone.name}
          </span>
          <span className="text-[10px] text-black/40">
            {format(zone.fee)} &middot; {zone.delay}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── Main page ─────────────────────────── */

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const products = useAllProducts();
  const product = products.find((p) => p.slug === slug);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addItem } = useCart();
  const { toggle, has } = useWishlist();
  const { format } = useCurrency();

  const categoryInfo = CATEGORIES.find((c) => c.slug === product?.category);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  const recommendedProducts = useMemo(() => {
    if (!product) return [];
    const otherCategory = products.filter(
      (p) => p.category !== product.category && p.id !== product.id,
    );
    // Deterministic shuffle based on product id to avoid hydration mismatch
    const shuffled = [...otherCategory].sort((a, b) => {
      const hashA = a.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const hashB = b.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return hashA - hashB;
    });
    return shuffled.slice(0, 4);
  }, [product, products]);

  if (!product) {
    notFound();
  }

  const hasPromo = product.originalPrice && product.originalPrice > product.price;
  const discount = hasPromo
    ? Math.round(
        ((product.originalPrice! - product.price) / product.originalPrice!) *
          100,
      )
    : 0;

  const selectedColorName = product.colors?.find(
    (c) => c.hex === selectedColor,
  )?.name;
  const isWished = has(product.id);

  const whatsAppUrl = getWhatsAppUrl(
    product.name,
    selectedSize || undefined,
    selectedColorName || undefined,
    quantity,
    product.price * quantity,
  );

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItem(product, quantity, selectedSize || undefined, selectedColorName || undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white"
    >
      {/* ─── Breadcrumb ─── */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="text-black/40 transition-colors hover:text-[#C9A96E] font-medium"
            >
              Accueil
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#C9A96E]/40" />
            <Link
              href="/catalogue"
              className="text-black/40 transition-colors hover:text-[#C9A96E] font-medium"
            >
              Catalogue
            </Link>
            {categoryInfo && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-[#C9A96E]/40" />
                <Link
                  href={`/catalogue?category=${product.category}`}
                  className="text-black/40 transition-colors hover:text-[#C9A96E] font-medium"
                >
                  {categoryInfo.name}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5 text-[#C9A96E]/40" />
            <span className="truncate max-w-[200px] text-[#C9A96E] font-semibold">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ─── Product section ─── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          {/* Left: Image gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ImageGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Right: Product info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Badge + Wishlist */}
            <div className="flex items-start justify-between mb-4">
              <div>{product.badge && <Badge type={product.badge} />}</div>
              <button
                onClick={() => toggle(product.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all ${
                  isWished
                    ? 'border-red-200 bg-red-50 text-red-500'
                    : 'border-black/10 bg-white text-black/30 hover:border-[#C9A96E]/40 hover:text-[#C9A96E]'
                }`}
                aria-label={isWished ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${
                    isWished ? 'fill-current scale-110' : ''
                  }`}
                />
              </button>
            </div>

            {/* Name */}
            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-extralight tracking-wide text-black leading-tight"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="mt-3">
              <RatingStars rating={product.rating} reviews={product.reviews} />
            </div>

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-black">
                {format(product.price)}
              </span>
              {hasPromo && (
                <>
                  <span className="text-lg text-black/30 line-through">
                    {format(product.originalPrice!)}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Short description */}
            <p className="mt-5 text-sm leading-relaxed text-black/60">
              {product.description}
            </p>

            {/* Divider */}
            <div className="my-6 h-px bg-black/8" />

            {/* Size selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black">
                    Taille
                  </h3>
                  {selectedSize && (
                    <span className="text-xs text-black/40">{selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setSelectedSize(selectedSize === size ? null : size)
                      }
                      className={`flex h-10 min-w-[44px] items-center justify-center rounded-md border px-4 text-sm font-medium transition-all ${
                        selectedSize === size
                          ? 'border-black bg-black text-white'
                          : 'border-black/15 text-black hover:border-black/40'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black">
                    Couleur
                  </h3>
                  {selectedColor && (
                    <span className="text-xs text-black/40">
                      {product.colors.find((c) => c.hex === selectedColor)?.name}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() =>
                        setSelectedColor(
                          selectedColor === color.hex ? null : color.hex,
                        )
                      }
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        selectedColor === color.hex
                          ? 'ring-2 ring-[#C9A96E] ring-offset-2'
                          : 'hover:ring-2 hover:ring-black/20 hover:ring-offset-1'
                      }`}
                      title={color.name}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                      {selectedColor === color.hex && (
                        <Check
                          className={`absolute h-3.5 w-3.5 ${
                            color.hex === '#FFFFFF' || color.hex === '#F5F0EB'
                              ? 'text-black'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock indicator */}
            <div className="mb-6">
              <StockIndicator stock={product.stock} />
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-black mb-3">
                Quantit&eacute;
              </h3>
              <div className="flex items-center gap-4">
                <QuantitySelector
                  quantity={quantity}
                  setQuantity={setQuantity}
                  max={product.stock}
                />
                {quantity > 1 && (
                  <span className="text-sm text-black/40">
                    Total : <span className="font-semibold text-black/70">{format(product.price * quantity)}</span>
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
              {/* Add to cart - primary */}
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex w-full items-center justify-center gap-3 rounded-lg py-4 text-sm font-semibold uppercase tracking-[0.1em] transition-all ${
                  product.stock === 0
                    ? 'cursor-not-allowed bg-black/10 text-black/30'
                    : 'bg-black text-white shadow-lg shadow-black/15 hover:bg-[#C9A96E] hover:text-black hover:shadow-xl hover:shadow-[#C9A96E]/20 active:scale-[0.98]'
                }`}
                whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
              >
                <ShoppingBag className="h-5 w-5" />
                Ajouter au panier
              </motion.button>

              {/* WhatsApp order - secondary */}
              <motion.a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex w-full items-center justify-center gap-3 rounded-lg border-2 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] transition-all ${
                  product.stock === 0
                    ? 'pointer-events-none border-black/5 text-black/20'
                    : 'border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white active:scale-[0.98]'
                }`}
                whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
                onClick={(e) => {
                  if (product.stock === 0) e.preventDefault();
                }}
              >
                <MessageCircle className="h-5 w-5" />
                Commander via WhatsApp
              </motion.a>
            </div>

            {/* Delivery info bar */}
            <DeliveryBar format={format} />

            {/* Trust indicators */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                {
                  label: 'Livraison rapide',
                  icon: <Truck className="h-5 w-5 text-[#C9A96E]" />,
                },
                {
                  label: 'Paiement sécurisé',
                  icon: <Shield className="h-5 w-5 text-[#C9A96E]" />,
                },
                {
                  label: 'Satisfait ou remboursé',
                  icon: <RotateCcw className="h-5 w-5 text-[#C9A96E]" />,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 rounded-xl border border-[#C9A96E]/15 bg-gradient-to-b from-[#F5F0EB]/40 to-transparent px-2 py-4 text-center"
                >
                  {item.icon}
                  <span className="text-[10px] font-semibold text-black/60 leading-tight tracking-wide uppercase">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Accordion sections ─── */}
      <div className="border-t border-black/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <AccordionSection title="Description" defaultOpen>
              <p className="whitespace-pre-line">{product.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {product.category && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0EB] px-3 py-1 text-xs text-black/50">
                    <Package className="h-3 w-3" />
                    {categoryInfo?.name}
                  </span>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#F5F0EB] px-3 py-1 text-xs text-black/50">
                    Tailles : {product.sizes.join(', ')}
                  </span>
                )}
                {product.colors && product.colors.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#F5F0EB] px-3 py-1 text-xs text-black/50">
                    {product.colors.length} couleur{product.colors.length > 1 ? 's' : ''} disponible{product.colors.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="Guide des tailles">
              <SizeGuideTable />
              <p className="mt-4 text-xs text-black/40">
                Les mesures sont en centim&egrave;tres. En cas de doute entre
                deux tailles, nous vous recommandons de prendre la taille
                sup&eacute;rieure pour plus de confort.
              </p>
            </AccordionSection>

            <AccordionSection title="Livraison & retours">
              <div className="mb-5">
                <h4 className="mb-3 text-sm font-semibold text-black/80">
                  Zones de livraison
                </h4>
                <DeliveryInfoSection format={format} />
              </div>
              <div>
                <h4 className="mb-2 text-sm font-semibold text-black/80">
                  Politique de retour
                </h4>
                <p>
                  Vous disposez d&rsquo;un d&eacute;lai de 14 jours apr&egrave;s
                  r&eacute;ception pour retourner un article non port&eacute;,
                  dans son emballage d&rsquo;origine avec toutes les
                  &eacute;tiquettes attach&eacute;es. Les frais de retour sont
                  &agrave; la charge du client. Le remboursement est
                  effectu&eacute; sous 5 jours ouvr&eacute;s apr&egrave;s
                  r&eacute;ception et v&eacute;rification de l&rsquo;article.
                </p>
              </div>
            </AccordionSection>

            <AccordionSection title="Avis clients">
              <SampleReviews
                rating={product.rating}
                reviews={product.reviews}
              />
            </AccordionSection>
          </div>
        </div>
      </div>

      {/* ─── Similar products ─── */}
      {similarProducts.length > 0 && (
        <div className="border-t border-black/5 bg-[#F5F0EB]/15">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2
                className="text-2xl sm:text-3xl font-extralight tracking-[0.1em] text-black uppercase"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Produits similaires
              </h2>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-[#C9A96E]/50" />
                <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
                <span className="w-8 h-px bg-[#C9A96E]/50" />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Vous aimerez aussi (recommended from other categories) ─── */}
      {recommendedProducts.length > 0 && (
        <div className="border-t border-black/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2
                className="text-2xl sm:text-3xl font-extralight tracking-[0.1em] text-black uppercase"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                Vous aimerez aussi
              </h2>
              <div className="mt-3 flex items-center justify-center gap-3">
                <span className="w-8 h-px bg-[#C9A96E]/50" />
                <span className="w-1 h-1 rounded-full bg-[#C9A96E]" />
                <span className="w-8 h-px bg-[#C9A96E]/50" />
              </div>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
