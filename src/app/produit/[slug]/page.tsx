'use client';

import { use, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  MessageCircle,
  ShoppingBag,
  Star,
  Check,
  AlertTriangle,
  XCircle,
  ZoomIn,
} from 'lucide-react';
import { useAllProducts } from '@/lib/useAllProducts';
import { CATEGORIES, type Product } from '@/lib/types';
import { getWhatsAppUrl } from '@/lib/config';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/home/ProductCard';

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
        <span className="text-sm font-medium">Stock limit&eacute; ({stock} restant{stock > 1 ? 's' : ''})</span>
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
        className="relative aspect-[3/4] overflow-hidden rounded-lg bg-[#F5F0EB] cursor-zoom-in"
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
              className={`relative aspect-square w-20 overflow-hidden rounded-md transition-all ${
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

  const categoryInfo = CATEGORIES.find((c) => c.slug === product?.category);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    notFound();
  }

  const hasPromo = product.originalPrice && product.originalPrice > product.price;
  const discount = hasPromo
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const selectedColorName = product.colors?.find((c) => c.hex === selectedColor)?.name;
  const whatsAppMessage = getWhatsAppUrl(
    product.name,
    selectedSize || undefined,
    selectedColorName || undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white"
    >
      {/* Breadcrumb */}
      <div className="border-b border-black/5 bg-[#F5F0EB]/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-black/40 transition-colors hover:text-[#C9A96E]">
              Accueil
            </Link>
            <ChevronRight className="h-3 w-3 text-black/20" />
            <Link href="/catalogue" className="text-black/40 transition-colors hover:text-[#C9A96E]">
              Catalogue
            </Link>
            <ChevronRight className="h-3 w-3 text-black/20" />
            {categoryInfo && (
              <>
                <Link
                  href={`/catalogue?category=${product.category}`}
                  className="text-black/40 transition-colors hover:text-[#C9A96E]"
                >
                  {categoryInfo.name}
                </Link>
                <ChevronRight className="h-3 w-3 text-black/20" />
              </>
            )}
            <span className="text-black/70 font-medium truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Product section */}
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
            {/* Badge */}
            {product.badge && (
              <div className="mb-4">
                <Badge type={product.badge} />
              </div>
            )}

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
                ${product.price.toFixed(2)}
              </span>
              {hasPromo && (
                <>
                  <span className="text-lg text-black/30 line-through">
                    ${product.originalPrice!.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
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
                      onClick={() => setSelectedSize(selectedSize === size ? null : size)}
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
                        setSelectedColor(selectedColor === color.hex ? null : color.hex)
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

            {/* WhatsApp order button */}
            <motion.a
              href={whatsAppMessage}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex w-full items-center justify-center gap-3 rounded-lg py-4 text-sm font-semibold uppercase tracking-[0.1em] transition-all ${
                product.stock === 0
                  ? 'cursor-not-allowed bg-black/10 text-black/30'
                  : 'bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#20BD5B] hover:shadow-xl hover:shadow-[#25D366]/30 active:scale-[0.98]'
              }`}
              whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
              onClick={(e) => {
                if (product.stock === 0) e.preventDefault();
              }}
            >
              <MessageCircle className="h-5 w-5" />
              Commander via WhatsApp
            </motion.a>

            {/* Trust indicators */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Livraison rapide', icon: '🚚' },
                { label: 'Paiement sécurisé', icon: '🔒' },
                { label: 'Satisfait ou remboursé', icon: '✓' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-black/5 bg-[#F5F0EB]/30 px-2 py-3 text-center"
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[10px] font-medium text-black/50 leading-tight">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Similar products */}
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
    </motion.div>
  );
}
