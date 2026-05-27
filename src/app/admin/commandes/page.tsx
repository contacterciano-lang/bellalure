'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  Package,
  Clock,
  ChevronDown,
  Check,
  AlertTriangle,
  MapPin,
  Phone,
  User,
  CreditCard,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Hash,
  MessageCircle,
  RefreshCw,
} from 'lucide-react';
import { products as staticProducts } from '@/data/products';
import type { Order, OrderItem, OrderStatus, PaymentMethod, Product, Client, WhatsAppOrder } from '@/lib/types';
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  formatPrice,
  generateOrderNumber,
} from '@/lib/admin/constants';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/admin/localStorage';
import { DEFAULT_SETTINGS } from '@/lib/admin/constants';
import { fetchWhatsAppOrders, updateOrderStatus as updateWAStatus, deleteWhatsAppOrder, updateOrderPhone, buildNotifyUrl } from '@/lib/whatsappOrders';

/* ─── Types ─── */

type StatusTab = 'tous' | OrderStatus;
type ViewMode = 'whatsapp' | 'orders';

interface NewOrderForm {
  clientName: string;
  clientPhone: string;
  clientCity: string;
  clientAddress: string;
  deliveryZone: string;
  items: OrderItemDraft[];
  paymentMethod: PaymentMethod | '';
  deliveryFee: number;
  acompte: number;
  internalNotes: string;
}

interface OrderItemDraft {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  size: string;
  color: string;
  unitPrice: number;
  availableSizes: string[];
  availableColors: string[];
}

const EMPTY_ORDER_FORM: NewOrderForm = {
  clientName: '',
  clientPhone: '',
  clientCity: 'Kinshasa',
  clientAddress: '',
  deliveryZone: 'Kinshasa',
  items: [],
  paymentMethod: '',
  deliveryFee: 5,
  acompte: 0,
  internalNotes: '',
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
          className={`w-full rounded-2xl bg-white shadow-xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}
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
   Status Badge
   ═══════════════════════════════════════════════ */

function StatusBadge({ status }: { status: OrderStatus }) {
  const found = ORDER_STATUSES.find((s) => s.value === status);
  if (!found) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${found.color} ${found.bg}`}
    >
      {found.label}
    </span>
  );
}

/* ═══════════════════════════════════════════════
   Inline Status Dropdown
   ═══════════════════════════════════════════════ */

function StatusDropdown({
  currentStatus,
  onChangeStatus,
}: {
  currentStatus: OrderStatus;
  onChangeStatus: (status: OrderStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 transition-opacity hover:opacity-80"
      >
        <StatusBadge status={currentStatus} />
        <ChevronDown className="h-3 w-3 text-gray-400" />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-30 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => {
                onChangeStatus(s.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                s.value === currentStatus ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${s.bg} ${s.color} ring-1 ring-current`} />
              <span className="text-gray-700">{s.label}</span>
              {s.value === currentStatus && <Check className="ml-auto h-3.5 w-3.5 text-gray-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Product Search for Order Items
   ═══════════════════════════════════════════════ */

function ProductPicker({
  onAddItem,
  allProducts,
}: {
  onAddItem: (item: OrderItemDraft) => void;
  allProducts: Product[];
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const q = search.toLowerCase();
    setResults(
      allProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q),
        )
        .slice(0, 8),
    );
  }, [search, allProducts]);

  const handleSelect = (product: Product) => {
    onAddItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images[0] || '',
      quantity: 1,
      size: product.sizes?.[0] || '',
      color: product.colors?.[0]?.name || '',
      unitPrice: product.price,
      availableSizes: product.sizes || [],
      availableColors: (product.colors || []).map((c) => c.name),
    });
    setSearch('');
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit par nom ou ID..."
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50"
            >
              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="36px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-[11px] text-gray-400">
                  {formatPrice(product.price, product.currency === 'USD' ? '$' : product.currency)} &middot; Stock: {product.stock}
                </p>
              </div>
              <Plus className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function OrdersPage() {
  /* ─── State ─── */
  const [orders, setOrders] = useState<Order[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([...staticProducts]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('tous');
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  // WhatsApp orders view
  const [viewMode, setViewMode] = useState<ViewMode>('whatsapp');
  const [waOrders, setWaOrders] = useState<WhatsAppOrder[]>([]);
  const [waSearch, setWaSearch] = useState('');
  const [waStatusFilter, setWaStatusFilter] = useState<StatusTab>('tous');

  // Create form
  const [formData, setFormData] = useState<NewOrderForm>({ ...EMPTY_ORDER_FORM });
  const [createStep, setCreateStep] = useState(1);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
    },
    [],
  );

  /* ─── Load data ─── */
  useEffect(() => {
    setOrders(getItem<Order[]>(STORAGE_KEYS.ORDERS, []));
    setClients(getItem<Client[]>(STORAGE_KEYS.CLIENTS, []));
    fetchWhatsAppOrders().then(setWaOrders);
  }, []);

  // Merge static + dynamic products
  useEffect(() => {
    const fetchDynamic = async () => {
      try {
        const res = await fetch('/api/products');
        const dynamic: Product[] = await res.json();
        if (Array.isArray(dynamic) && dynamic.length > 0) {
          const dynamicIds = new Set(dynamic.map((p) => p.id));
          const remaining = staticProducts.filter((p) => !dynamicIds.has(p.id));
          setAllProducts([...remaining, ...dynamic]);
        }
      } catch {
        // keep static only
      }
    };
    fetchDynamic();
  }, []);

  /* ─── Helpers ─── */
  const saveOrders = useCallback(
    (updated: Order[]) => {
      setOrders(updated);
      setItem(STORAGE_KEYS.ORDERS, updated);
    },
    [],
  );

  const saveClients = useCallback(
    (updated: Client[]) => {
      setClients(updated);
      setItem(STORAGE_KEYS.CLIENTS, updated);
    },
    [],
  );

  const getOrCreateClient = useCallback(
    (name: string, phone: string, city: string, address: string): Client => {
      const existing = clients.find((c) => c.phone === phone);
      if (existing) {
        // Update name/city/address if changed
        const updatedClient = {
          ...existing,
          name: name || existing.name,
          city: city || existing.city,
          address: address || existing.address,
        };
        const updatedClients = clients.map((c) => (c.id === existing.id ? updatedClient : c));
        saveClients(updatedClients);
        return updatedClient;
      }
      const newClient: Client = {
        id: `cl-${Date.now()}`,
        name,
        phone,
        city: city || 'Kinshasa',
        country: 'RDC',
        totalOrders: 0,
        totalSpent: 0,
        currency: 'USD',
        isVip: false,
        notes: '',
        createdAt: new Date().toISOString(),
      };
      saveClients([newClient, ...clients]);
      return newClient;
    },
    [clients, saveClients],
  );

  /* ─── Filtering ─── */
  const filtered = useMemo(() => {
    let list = orders;
    if (activeTab !== 'tous') list = list.filter((o) => o.status === activeTab);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.clientName.toLowerCase().includes(q) ||
          o.clientPhone.includes(q),
      );
    }
    return list;
  }, [orders, activeTab, search]);

  /* ─── Status counts ─── */
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { tous: orders.length };
    for (const s of ORDER_STATUSES) counts[s.value] = 0;
    for (const o of orders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [orders]);

  /* ─── Create order form calculations ─── */
  const formSubtotal = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  }, [formData.items]);

  const formTotal = formSubtotal + formData.deliveryFee;
  const formRestant = formTotal - formData.acompte;

  /* ─── Handlers ─── */

  const openCreateModal = () => {
    setFormData({ ...EMPTY_ORDER_FORM });
    setCreateStep(1);
    setShowCreateModal(true);
  };

  const handleAddItem = (item: OrderItemDraft) => {
    const existing = formData.items.find((i) => i.productId === item.productId);
    if (existing) {
      setFormData({
        ...formData,
        items: formData.items.map((i) =>
          i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, item],
      });
    }
  };

  const handleRemoveItem = (productId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.productId !== productId),
    });
  };

  const handleUpdateItem = (productId: string, updates: Partial<OrderItemDraft>) => {
    setFormData({
      ...formData,
      items: formData.items.map((i) =>
        i.productId === productId ? { ...i, ...updates } : i,
      ),
    });
  };

  const handleCreateOrder = () => {
    if (!formData.clientName || !formData.clientPhone || formData.items.length === 0) return;
    setLoading(true);

    try {
      const client = getOrCreateClient(
        formData.clientName,
        formData.clientPhone,
        formData.clientCity,
        formData.clientAddress,
      );

      const settings = getItem('bellalure-settings', DEFAULT_SETTINGS);
      const orderNumber = generateOrderNumber(settings.orderPrefix || 'BL', orders.length);

      const orderItems: OrderItem[] = formData.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        productImage: i.productImage,
        quantity: i.quantity,
        size: i.size || undefined,
        color: i.color || undefined,
        unitPrice: i.unitPrice,
      }));

      const now = new Date().toISOString();

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        clientId: client.id,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        items: orderItems,
        subtotal: formSubtotal,
        deliveryFee: formData.deliveryFee,
        total: formTotal,
        acompte: formData.acompte,
        restant: formRestant > 0 ? formRestant : 0,
        currency: 'USD',
        status: 'nouveau',
        paymentMethod: (formData.paymentMethod as PaymentMethod) || undefined,
        deliveryAddress: formData.clientAddress,
        deliveryZone: formData.deliveryZone,
        internalNotes: formData.internalNotes,
        createdAt: now,
        updatedAt: now,
      };

      const updatedOrders = [newOrder, ...orders];
      saveOrders(updatedOrders);

      // Update client stats
      const updatedClients = clients.map((c) =>
        c.id === client.id
          ? {
              ...c,
              totalOrders: c.totalOrders + 1,
              totalSpent: c.totalSpent + formTotal,
              lastOrderAt: now,
            }
          : c,
      );
      saveClients(updatedClients);

      showToast(`Commande ${orderNumber} creee avec succes`);
      setShowCreateModal(false);
      setFormData({ ...EMPTY_ORDER_FORM });
      setCreateStep(1);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = useCallback(
    (orderId: string, newStatus: OrderStatus) => {
      const now = new Date().toISOString();
      const updates: Partial<Order> = {
        status: newStatus,
        updatedAt: now,
      };

      if (newStatus === 'confirme' || newStatus === 'acompte_paye') {
        updates.confirmedAt = now;
      }
      if (newStatus === 'livre') {
        updates.deliveredAt = now;
      }

      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, ...updates } : o,
      );
      saveOrders(updated);

      const statusLabel = ORDER_STATUSES.find((s) => s.value === newStatus)?.label || newStatus;
      showToast(`Statut mis a jour: ${statusLabel}`);

      // Also update viewing order if open
      if (viewingOrder && viewingOrder.id === orderId) {
        setViewingOrder({ ...viewingOrder, ...updates });
      }
    },
    [orders, saveOrders, showToast, viewingOrder],
  );

  const handleUpdateOrder = useCallback(
    (orderId: string, updates: Partial<Order>) => {
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o,
      );
      saveOrders(updated);
    },
    [orders, saveOrders],
  );

  const handleDeleteOrder = () => {
    if (!deletingOrder) return;
    setLoading(true);
    try {
      const updated = orders.filter((o) => o.id !== deletingOrder.id);
      saveOrders(updated);
      showToast(`Commande ${deletingOrder.orderNumber} supprimee`);
      setDeletingOrder(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  /* ═══ Tabs ═══ */
  const tabs: { value: StatusTab; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    ...ORDER_STATUSES.map((s) => ({ value: s.value as StatusTab, label: s.label })),
  ];

  /* ─── WhatsApp Orders Logic ─── */
  const waFiltered = useMemo(() => {
    let list = waOrders;
    if (waStatusFilter !== 'tous') list = list.filter((o) => o.status === waStatusFilter);
    if (waSearch) {
      const q = waSearch.toLowerCase();
      list = list.filter(
        (o) =>
          o.productName.toLowerCase().includes(q) ||
          o.productCategory.toLowerCase().includes(q),
      );
    }
    return list;
  }, [waOrders, waStatusFilter, waSearch]);

  const waStatusCounts = useMemo(() => {
    const counts: Record<string, number> = { tous: waOrders.length };
    for (const s of ORDER_STATUSES) counts[s.value] = 0;
    for (const o of waOrders) counts[o.status] = (counts[o.status] || 0) + 1;
    return counts;
  }, [waOrders]);

  const handleWAStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      // Optimistic UI update, then persist server-side
      setWaOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      const ok = await updateWAStatus(orderId, newStatus);
      const label = ORDER_STATUSES.find((s) => s.value === newStatus)?.label || newStatus;
      if (ok) {
        const order = waOrders.find((o) => o.id === orderId);
        if (order?.customerPhone) {
          showToast(`Statut: ${label} — cliquez "Notifier" pour prevenir le client`);
        } else {
          showToast(`Statut mis a jour: ${label}`);
        }
      } else {
        showToast('Erreur de mise a jour du statut', 'error');
        fetchWhatsAppOrders().then(setWaOrders);
      }
    },
    [showToast, waOrders],
  );

  const handleWAPhoneSave = useCallback(
    async (orderId: string, phone: string) => {
      const current = waOrders.find((o) => o.id === orderId);
      if (current && (current.customerPhone || '') === phone) return; // unchanged
      setWaOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, customerPhone: phone } : o)),
      );
      const ok = await updateOrderPhone(orderId, phone);
      if (!ok) {
        showToast('Erreur enregistrement du numero', 'error');
        fetchWhatsAppOrders().then(setWaOrders);
      }
    },
    [showToast, waOrders],
  );

  const handleWADelete = useCallback(
    async (orderId: string) => {
      setWaOrders((prev) => prev.filter((o) => o.id !== orderId));
      const ok = await deleteWhatsAppOrder(orderId);
      if (ok) {
        showToast('Commande WhatsApp supprimee');
      } else {
        showToast('Erreur de suppression', 'error');
        fetchWhatsAppOrders().then(setWaOrders);
      }
    },
    [showToast],
  );

  const waFormatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const waTabs: { value: StatusTab; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    ...ORDER_STATUSES.map((s) => ({ value: s.value as StatusTab, label: s.label })),
  ];

  /* ─── Delivery zones from settings ─── */
  const settings = useMemo(() => getItem('bellalure-settings', DEFAULT_SETTINGS), []);

  const canGoNextStep = (): boolean => {
    switch (createStep) {
      case 1:
        return !!(formData.clientName.trim() && formData.clientPhone.trim());
      case 2:
        return formData.items.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
            <p className="mt-0.5 text-sm text-gray-500">
              {viewMode === 'whatsapp'
                ? `${waOrders.length} commande${waOrders.length > 1 ? 's' : ''} WhatsApp`
                : `${orders.length} commande${orders.length > 1 ? 's' : ''} au total`}
            </p>
          </div>
          {viewMode === 'orders' && (
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Nouvelle commande
            </button>
          )}
        </div>

        {/* View Mode Tabs */}
        <div className="mt-4 flex gap-2 border-b border-gray-200 pb-0">
          <button
            onClick={() => setViewMode('whatsapp')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              viewMode === 'whatsapp'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            Nouvelles commandes
            {waOrders.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                viewMode === 'whatsapp' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {waOrders.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('orders')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              viewMode === 'orders'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            Commandes classiques
            {orders.length > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                viewMode === 'orders' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {orders.length}
              </span>
            )}
          </button>
        </div>
      </motion.div>

      {/* ═══════ WhatsApp Orders View ═══════ */}
      {viewMode === 'whatsapp' && (
        <>
          {/* WA Search + Status Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={waSearch}
                  onChange={(e) => setWaSearch(e.target.value)}
                  placeholder="Rechercher par produit ou categorie..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
              <button
                onClick={() => fetchWhatsAppOrders().then(setWaOrders)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Actualiser les commandes"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Actualiser</span>
              </button>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {waTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setWaStatusFilter(tab.value)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    waStatusFilter === tab.value
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`text-[11px] ${
                      waStatusFilter === tab.value ? 'text-gray-300' : 'text-gray-400'
                    }`}
                  >
                    {waStatusCounts[tab.value] || 0}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* WA Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {waFiltered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <MessageCircle className="mb-3 h-12 w-12 text-gray-200" />
                <p className="text-sm font-medium text-gray-500">
                  {waOrders.length === 0
                    ? 'Aucune commande WhatsApp'
                    : 'Aucune commande trouvee pour ce filtre'}
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {waOrders.length === 0
                    ? 'Les commandes apparaitront ici quand un client clique sur "Commander" ou "Demander le prix"'
                    : 'Modifiez vos filtres ou la recherche'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50">
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Produit
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Categorie
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Prix
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Action
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        N&deg; Client
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {waFiltered.map((wo) => (
                      <tr
                        key={wo.id}
                        className="group transition-colors hover:bg-gray-50/60"
                      >
                        {/* Product */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                              {wo.productImage ? (
                                <Image
                                  src={wo.productImage}
                                  alt={wo.productName}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package className="h-4 w-4 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900" title={wo.productName}>
                                {wo.productName.length > 45
                                  ? wo.productName.slice(0, 45) + '...'
                                  : wo.productName}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                Qty: {wo.quantity}
                                {wo.size && ` · ${wo.size}`}
                                {wo.color && ` · ${wo.color}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-gray-700">
                            {wo.productCategory}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-right">
                          {wo.showPrice ? (
                            <span className="text-sm font-semibold text-gray-900">
                              ${wo.price.toFixed(0)}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                              <Eye className="h-3 w-3" />
                              Prix masque
                            </span>
                          )}
                        </td>

                        {/* Action type */}
                        <td className="px-4 py-3 text-center">
                          {wo.action === 'commander' ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                              <ShoppingCart className="h-3 w-3" />
                              Commander
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                              <MessageCircle className="h-3 w-3" />
                              Demande prix
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                            {waFormatDate(wo.createdAt)}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusDropdown
                            currentStatus={wo.status}
                            onChangeStatus={(status) => handleWAStatusChange(wo.id, status)}
                          />
                        </td>

                        {/* Customer phone */}
                        <td className="px-4 py-3">
                          <input
                            type="tel"
                            defaultValue={wo.customerPhone || ''}
                            onBlur={(e) => handleWAPhoneSave(wo.id, e.target.value.trim())}
                            placeholder="+243..."
                            className="w-32 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {buildNotifyUrl(wo) ? (
                              <a
                                href={buildNotifyUrl(wo)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#20BD5B]"
                                title="Envoyer la mise a jour de statut au client sur WhatsApp"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Notifier
                              </a>
                            ) : (
                              <span
                                className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-400"
                                title="Ajoutez le numero du client pour pouvoir le notifier"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                                Notifier
                              </span>
                            )}
                            <button
                              onClick={() => handleWADelete(wo.id)}
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

            {/* WA Footer */}
            {waFiltered.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-3">
                <p className="text-xs text-gray-400">
                  {waFiltered.length} commande{waFiltered.length > 1 ? 's' : ''} affichee{waFiltered.length > 1 ? 's' : ''}
                  {waStatusFilter !== 'tous' || waSearch ? ` (filtrees sur ${waOrders.length})` : ''}
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* ═══════ Classic Orders View ═══════ */}
      {viewMode === 'orders' && (
        <>
      {/* Search + Status Tabs */}
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
            placeholder="Rechercher par numero ou client..."
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
                {statusCounts[tab.value] || 0}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ShoppingCart className="mb-3 h-12 w-12 text-gray-200" />
            <p className="text-sm font-medium text-gray-500">Aucune commande trouvee</p>
            <p className="mt-1 text-xs text-gray-400">
              Modifiez vos filtres ou creez une nouvelle commande
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Commande
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="group transition-colors hover:bg-gray-50/60"
                  >
                    {/* Order number */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                          <Hash className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.clientName}</p>
                        <p className="text-[11px] text-gray-400">{order.clientPhone}</p>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(order.createdAt)}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatPrice(order.total, order.currency === 'USD' ? '$' : order.currency)}
                        </p>
                        {order.restant > 0 && (
                          <p className="text-[11px] text-orange-500">
                            Reste: {formatPrice(order.restant, order.currency === 'USD' ? '$' : order.currency)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusDropdown
                        currentStatus={order.status}
                        onChangeStatus={(status) => handleUpdateStatus(order.id, status)}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                          title="Voir / Modifier"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingOrder(order)}
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
              {filtered.length} commande{filtered.length > 1 ? 's' : ''} affichee{filtered.length > 1 ? 's' : ''}
              {activeTab !== 'tous' || search ? ` (filtrees sur ${orders.length})` : ''}
            </p>
          </div>
        )}
      </motion.div>
        </>
      )}

      {/* ═══ Create Order Modal ═══ */}
      <Modal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({ ...EMPTY_ORDER_FORM });
          setCreateStep(1);
        }}
        title="Nouvelle commande"
        wide
      >
        {/* Step indicator */}
        <div className="mb-6 flex items-center justify-between">
          {[
            { step: 1, label: 'Client', icon: User },
            { step: 2, label: 'Articles', icon: Package },
            { step: 3, label: 'Paiement', icon: CreditCard },
            { step: 4, label: 'Confirmation', icon: Check },
          ].map(({ step, label, icon: Icon }) => (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                    createStep === step
                      ? 'bg-black text-white'
                      : createStep > step
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {createStep > step ? <Check className="h-4 w-4" /> : step}
                </div>
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    createStep >= step ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {label}
                </span>
              </div>
              {step < 4 && (
                <div
                  className={`mx-2 h-px flex-1 ${
                    createStep > step ? 'bg-emerald-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Client info */}
        {createStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Nom du client *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Nom complet"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Telephone *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                    placeholder="+243..."
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Ville
                </label>
                <input
                  value={formData.clientCity}
                  onChange={(e) => setFormData({ ...formData, clientCity: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Kinshasa"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Adresse de livraison
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={formData.clientAddress}
                  onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                  placeholder="Quartier, avenue, numero..."
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Zone de livraison
              </label>
              <select
                value={formData.deliveryZone}
                onChange={(e) => {
                  const zone = settings.deliveryZones.find((z) => z.name === e.target.value);
                  setFormData({
                    ...formData,
                    deliveryZone: e.target.value,
                    deliveryFee: zone?.fee || 0,
                  });
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                {settings.deliveryZones.map((zone) => (
                  <option key={zone.name} value={zone.name}>
                    {zone.name} ({formatPrice(zone.fee)} - {zone.estimatedDays})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {createStep === 2 && (
          <div className="space-y-4">
            <ProductPicker onAddItem={handleAddItem} allProducts={allProducts} />

            {formData.items.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Package className="mb-2 h-10 w-10 text-gray-200" />
                <p className="text-sm text-gray-500">
                  Recherchez et ajoutez des produits ci-dessus
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-start gap-3 rounded-xl border border-gray-200 p-3"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="56px"
                          unoptimized
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {formatPrice(item.unitPrice)} x {item.quantity} ={' '}
                        {formatPrice(item.unitPrice * item.quantity)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {/* Quantity */}
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] font-medium uppercase text-gray-400">Qte:</label>
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.productId, {
                                quantity: Math.max(1, parseInt(e.target.value) || 1),
                              })
                            }
                            className="w-14 rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-black"
                          />
                        </div>
                        {/* Size */}
                        {item.availableSizes.length > 0 && (
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] font-medium uppercase text-gray-400">Taille:</label>
                            <select
                              value={item.size}
                              onChange={(e) =>
                                handleUpdateItem(item.productId, { size: e.target.value })
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-black"
                            >
                              <option value="">--</option>
                              {item.availableSizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {/* Color */}
                        {item.availableColors.length > 0 && (
                          <div className="flex items-center gap-1">
                            <label className="text-[10px] font-medium uppercase text-gray-400">Couleur:</label>
                            <select
                              value={item.color}
                              onChange={(e) =>
                                handleUpdateItem(item.productId, { color: e.target.value })
                              }
                              className="rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-black"
                            >
                              <option value="">--</option>
                              {item.availableColors.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="rounded-lg bg-gray-50 px-4 py-2.5 text-right">
                  <span className="text-sm text-gray-500">Sous-total: </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(formSubtotal)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Payment */}
        {createStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Mode de paiement
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod | '' })
                }
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="">-- Selectionner --</option>
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm.value} value={pm.value}>
                    {pm.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Frais de livraison ($)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.deliveryFee}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryFee: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                  Acompte verse ($)
                </label>
                <input
                  type="number"
                  min={0}
                  max={formTotal}
                  value={formData.acompte}
                  onChange={(e) =>
                    setFormData({ ...formData, acompte: Number(e.target.value) || 0 })
                  }
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-gray-500">
                Notes internes
              </label>
              <textarea
                value={formData.internalNotes}
                onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                placeholder="Notes visibles uniquement par l'equipe..."
              />
            </div>
            {/* Summary */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(formSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>{formatPrice(formData.deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(formTotal)}</span>
                </div>
                {formData.acompte > 0 && (
                  <>
                    <div className="flex justify-between text-emerald-600">
                      <span>Acompte verse</span>
                      <span>-{formatPrice(formData.acompte)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-orange-600">
                      <span>Reste a payer</span>
                      <span>{formatPrice(formRestant > 0 ? formRestant : 0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {createStep === 4 && (
          <div className="space-y-4">
            {/* Client Summary */}
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Client</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <User className="h-3.5 w-3.5 text-gray-400" />
                  {formData.clientName}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  {formData.clientPhone}
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  {formData.clientAddress || formData.clientCity}
                </div>
                <div className="text-gray-500">Zone: {formData.deliveryZone}</div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="rounded-xl border border-gray-200 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                Articles ({formData.items.length})
              </h3>
              <div className="space-y-2">
                {formData.items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative h-8 w-8 overflow-hidden rounded bg-gray-100">
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.productName}
                            fill
                            className="object-cover"
                            sizes="32px"
                            unoptimized
                          />
                        )}
                      </div>
                      <span className="text-gray-700">
                        {item.productName}
                        {item.size && <span className="text-gray-400"> ({item.size})</span>}
                        {item.color && <span className="text-gray-400"> - {item.color}</span>}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Paiement</h3>
              <div className="space-y-1.5 text-sm">
                {formData.paymentMethod && (
                  <div className="flex justify-between text-gray-600">
                    <span>Mode</span>
                    <span>
                      {PAYMENT_METHODS.find((pm) => pm.value === formData.paymentMethod)?.label ||
                        formData.paymentMethod}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(formSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison ({formData.deliveryZone})</span>
                  <span>{formatPrice(formData.deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(formTotal)}</span>
                </div>
                {formData.acompte > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Reste a payer</span>
                    <span>{formatPrice(formRestant > 0 ? formRestant : 0)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={() => {
              if (createStep === 1) {
                setShowCreateModal(false);
                setFormData({ ...EMPTY_ORDER_FORM });
                setCreateStep(1);
              } else {
                setCreateStep(createStep - 1);
              }
            }}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
            {createStep === 1 ? 'Annuler' : 'Retour'}
          </button>
          {createStep < 4 ? (
            <button
              type="button"
              onClick={() => setCreateStep(createStep + 1)}
              disabled={!canGoNextStep()}
              className="flex items-center gap-1.5 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Check className="h-4 w-4" />
              Confirmer la commande
            </button>
          )}
        </div>
      </Modal>

      {/* ═══ Order Detail / Edit Modal ═══ */}
      <Modal
        open={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        title={`Commande ${viewingOrder?.orderNumber || ''}`}
        wide
      >
        {viewingOrder && (
          <OrderDetailView
            order={viewingOrder}
            onUpdateStatus={(status) => {
              handleUpdateStatus(viewingOrder.id, status);
            }}
            onUpdateOrder={(updates) => {
              handleUpdateOrder(viewingOrder.id, updates);
              setViewingOrder({ ...viewingOrder, ...updates });
            }}
            onClose={() => setViewingOrder(null)}
            showToast={showToast}
          />
        )}
      </Modal>

      {/* ═══ Delete Confirm Modal ═══ */}
      <Modal
        open={!!deletingOrder}
        onClose={() => setDeletingOrder(null)}
        title="Supprimer la commande"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-medium text-red-800">
                Etes-vous sur de vouloir supprimer cette commande ?
              </p>
              <p className="mt-1 text-xs text-red-600">
                La commande {deletingOrder?.orderNumber} de {deletingOrder?.clientName} sera
                definitivement supprimee.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingOrder(null)}
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteOrder}
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

/* ═══════════════════════════════════════════════
   Order Detail / Edit View Component
   ═══════════════════════════════════════════════ */

function OrderDetailView({
  order,
  onUpdateStatus,
  onUpdateOrder,
  onClose,
  showToast,
}: {
  order: Order;
  onUpdateStatus: (status: OrderStatus) => void;
  onUpdateOrder: (updates: Partial<Order>) => void;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) {
  const [notes, setNotes] = useState(order.internalNotes || '');
  const [acompte, setAcompte] = useState(order.acompte);
  const [editingPayment, setEditingPayment] = useState(false);

  const formatDateTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const handleSaveNotes = () => {
    onUpdateOrder({ internalNotes: notes });
    showToast('Notes mises a jour');
  };

  const handleSavePayment = () => {
    const restant = order.total - acompte;
    onUpdateOrder({
      acompte,
      restant: restant > 0 ? restant : 0,
    });
    setEditingPayment(false);
    showToast('Paiement mis a jour');
  };

  return (
    <div className="space-y-5">
      {/* Status + Timeline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Statut:</span>
          <StatusDropdown currentStatus={order.status} onChangeStatus={onUpdateStatus} />
        </div>
        <span className="text-xs text-gray-400">
          Cree le {formatDateTime(order.createdAt)}
        </span>
      </div>

      {/* Timestamps */}
      {(order.confirmedAt || order.deliveredAt) && (
        <div className="flex flex-wrap gap-3">
          {order.confirmedAt && (
            <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-medium text-indigo-700">
              <Check className="h-3 w-3" />
              Confirme: {formatDateTime(order.confirmedAt)}
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
              <Package className="h-3 w-3" />
              Livre: {formatDateTime(order.deliveredAt)}
            </div>
          )}
        </div>
      )}

      {/* Client Info */}
      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="mb-2.5 text-xs font-semibold uppercase text-gray-500">Client</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <User className="h-4 w-4 text-gray-400" />
            {order.clientName}
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Phone className="h-4 w-4 text-gray-400" />
            {order.clientPhone}
          </div>
          {order.deliveryAddress && (
            <div className="col-span-2 flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4 text-gray-400" />
              {order.deliveryAddress}
            </div>
          )}
          {order.deliveryZone && (
            <div className="text-gray-500">
              Zone: {order.deliveryZone}
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="mb-2.5 text-xs font-semibold uppercase text-gray-500">
          Articles ({order.items.length})
        </h3>
        <div className="space-y-2.5">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {item.productImage && (
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="40px"
                    unoptimized
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.productName}</p>
                <p className="text-[11px] text-gray-400">
                  {item.size && `Taille: ${item.size}`}
                  {item.size && item.color && ' | '}
                  {item.color && `Couleur: ${item.color}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
                <p className="text-[11px] text-gray-400">
                  {item.quantity} x {formatPrice(item.unitPrice)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment / Financials */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase text-gray-500">Paiement</h3>
          <button
            onClick={() => setEditingPayment(!editingPayment)}
            className="text-xs font-medium text-gray-500 hover:text-gray-900"
          >
            {editingPayment ? 'Annuler' : 'Modifier'}
          </button>
        </div>
        <div className="space-y-1.5 text-sm">
          {order.paymentMethod && (
            <div className="flex justify-between text-gray-600">
              <span>Mode</span>
              <span>
                {PAYMENT_METHODS.find((pm) => pm.value === order.paymentMethod)?.label ||
                  order.paymentMethod}
              </span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal, order.currency === 'USD' ? '$' : order.currency)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Livraison</span>
            <span>{formatPrice(order.deliveryFee, order.currency === 'USD' ? '$' : order.currency)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.total, order.currency === 'USD' ? '$' : order.currency)}</span>
          </div>

          {editingPayment ? (
            <div className="mt-2 space-y-2 border-t border-gray-200 pt-2">
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase text-gray-400">
                  Acompte verse ($)
                </label>
                <input
                  type="number"
                  min={0}
                  max={order.total}
                  value={acompte}
                  onChange={(e) => setAcompte(Number(e.target.value) || 0)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                />
              </div>
              <div className="flex justify-between text-orange-600">
                <span>Nouveau reste</span>
                <span>{formatPrice(Math.max(0, order.total - acompte))}</span>
              </div>
              <button
                onClick={handleSavePayment}
                className="w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Enregistrer
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between text-emerald-600">
                <span>Acompte verse</span>
                <span>-{formatPrice(order.acompte, order.currency === 'USD' ? '$' : order.currency)}</span>
              </div>
              {order.restant > 0 && (
                <div className="flex justify-between font-semibold text-orange-600">
                  <span>Reste a payer</span>
                  <span>{formatPrice(order.restant, order.currency === 'USD' ? '$' : order.currency)}</span>
                </div>
              )}
              {order.restant === 0 && order.acompte > 0 && (
                <div className="flex justify-between font-semibold text-emerald-600">
                  <span>Statut paiement</span>
                  <span>Paye integralement</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Internal Notes */}
      <div className="rounded-xl border border-gray-200 p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">Notes internes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
          placeholder="Ajouter des notes internes..."
        />
        {notes !== (order.internalNotes || '') && (
          <div className="mt-2 flex justify-end">
            <button
              onClick={handleSaveNotes}
              className="flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <FileText className="h-3.5 w-3.5" />
              Sauvegarder les notes
            </button>
          </div>
        )}
      </div>

      {/* Close button */}
      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
