import type { Badge, OrderStatus, PaymentMethod, SiteSettings } from '@/lib/types';

export const BADGE_OPTIONS: { value: Badge | ''; label: string; color: string }[] = [
  { value: '', label: 'Aucun', color: 'bg-gray-100 text-gray-500' },
  { value: 'nouveau', label: 'Nouveau', color: 'bg-gray-900 text-white' },
  { value: 'best-seller', label: 'Best Seller', color: 'bg-amber-500 text-white' },
  { value: 'tendance', label: 'Tendance', color: 'bg-purple-500 text-white' },
  { value: 'promo', label: 'Promo', color: 'bg-red-500 text-white' },
];

export const SIZE_PRESETS: Record<string, string[]> = {
  vetements: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  chaussures: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  unique: ['Taille unique'],
};

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string; bg: string }[] = [
  { value: 'nouveau', label: 'Nouveau', color: 'text-blue-700', bg: 'bg-blue-50' },
  { value: 'confirme', label: 'Confirmé', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { value: 'acompte_paye', label: 'Acompte payé', color: 'text-cyan-700', bg: 'bg-cyan-50' },
  { value: 'commande_fournisseur', label: 'Commandé fournisseur', color: 'text-orange-700', bg: 'bg-orange-50' },
  { value: 'en_transit', label: 'En transit', color: 'text-yellow-700', bg: 'bg-yellow-50' },
  { value: 'arrive_kinshasa', label: 'Arrivé Kinshasa', color: 'text-teal-700', bg: 'bg-teal-50' },
  { value: 'livre', label: 'Livré', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { value: 'annule', label: 'Annulé', color: 'text-red-700', bg: 'bg-red-50' },
];

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'orange_money', label: 'Orange Money' },
  { value: 'wave', label: 'Wave' },
  { value: 'cash', label: 'Cash' },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: '+243851845573',
  currency: 'USD',
  currencySymbol: '$',
  countries: ['RDC', 'Congo-Brazzaville', 'France', 'Belgique', 'Canada'],
  deliveryZones: [
    { name: 'Kinshasa', fee: 5, estimatedDays: '1-2 jours' },
    { name: 'Provinces RDC', fee: 15, estimatedDays: '5-10 jours' },
    { name: 'International', fee: 30, estimatedDays: '15-30 jours' },
  ],
  paymentMethods: [
    { id: 'mobile_money', label: 'Mobile Money (Vodacom M-Pesa)', isActive: true, instructions: 'Envoyez au +243...' },
    { id: 'airtel_money', label: 'Airtel Money', isActive: true, instructions: 'Envoyez au +243...' },
    { id: 'orange_money', label: 'Orange Money', isActive: true, instructions: 'Envoyez au +243...' },
    { id: 'wave', label: 'Wave', isActive: false },
    { id: 'cash', label: 'Cash à la livraison', isActive: true },
  ],
  orderPrefix: 'BL',
  lowStockThreshold: 5,
  storeOpen: true,
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function generateOrderNumber(prefix: string, existingCount: number): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const num = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${dateStr}-${num}`;
}

export function formatPrice(price: number, symbol = '$'): string {
  return `${symbol}${price.toFixed(0)}`;
}
