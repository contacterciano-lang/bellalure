export type Badge = 'nouveau' | 'best-seller' | 'tendance' | 'promo';

export type Category =
  | 'femme'
  | 'homme'
  | 'chaussures'
  | 'accessoires'
  | 'sacs';

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  originalPrice?: number;
  currency: string;
  description: string;
  images: string[];
  sizes?: string[];
  colors?: ProductColor[];
  badge?: Badge;
  stock: number;
  rating: number;
  reviews: number;
  featured?: boolean;
  trending?: boolean;
  newArrival?: boolean;
}

export interface CategoryInfo {
  slug: Category;
  name: string;
  description: string;
  image: string;
}

/* ─── Orders ─── */
export type OrderStatus =
  | 'nouveau'
  | 'confirme'
  | 'acompte_paye'
  | 'commande_fournisseur'
  | 'en_transit'
  | 'arrive_kinshasa'
  | 'livre'
  | 'annule';

export type PaymentMethod =
  | 'mobile_money'
  | 'airtel_money'
  | 'orange_money'
  | 'wave'
  | 'cash';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  size?: string;
  color?: string;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  acompte: number;
  restant: number;
  currency: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentProofUrl?: string;
  deliveryAddress: string;
  deliveryZone: string;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
}

/* ─── Clients ─── */
export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  isVip: boolean;
  notes: string;
  createdAt: string;
  lastOrderAt?: string;
}

/* ─── Collections ─── */
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productIds: string[];
  isActive: boolean;
  isFeaturedOnHome: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/* ─── Settings ─── */
export interface DeliveryZone {
  name: string;
  fee: number;
  estimatedDays: string;
}

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  isActive: boolean;
  instructions?: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  currency: string;
  currencySymbol: string;
  countries: string[];
  deliveryZones: DeliveryZone[];
  paymentMethods: PaymentMethodConfig[];
  orderPrefix: string;
  lowStockThreshold: number;
  storeOpen: boolean;
  maintenanceMessage?: string;
}

/* ─── Analytics ─── */
export interface DailySales {
  date: string;
  revenue: number;
  orderCount: number;
}

export const CATEGORIES: CategoryInfo[] = [
  { slug: 'femme', name: 'Femme', description: 'Mode féminine tendance', image: 'https://img.baba-blog.com/2024/06/the-womens-clothing6.jpg?x-oss-process=style%2Ffull' },
  { slug: 'homme', name: 'Homme', description: 'Style masculin moderne', image: 'https://img.baba-blog.com/2024/02/boomber-jacket.jpeg?x-oss-process=style%2Ffull' },
  { slug: 'chaussures', name: 'Chaussures', description: 'Sneakers & chaussures sport', image: 'https://img.baba-blog.com/2025/04/Wholesale-New-Men-Running-Shoes.jpg?x-oss-process=style%2Ffull' },
  { slug: 'accessoires', name: 'Accessoires', description: 'Montres, bijoux & accessoires', image: 'https://xcimg.szwego.com/img/126da278/20250822/i1755803206442_9024_0_0.jpg' },
  { slug: 'sacs', name: 'Sacs', description: 'Sacs & maroquinerie', image: 'https://xcimg.szwego.com/img/755f7c0e/20231104/i1699103077_4944_0.jpg' },
];
