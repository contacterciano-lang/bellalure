'use client';

import { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { getItem } from '@/lib/admin/localStorage';
import type { Order } from '@/lib/types';

interface AdminTopbarProps {
  onMenuToggle: () => void;
}

export default function AdminTopbar({ onMenuToggle }: AdminTopbarProps) {
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    const orders = getItem<Order[]>('bellalure-orders', []);
    const count = orders.filter((o) => o.status === 'nouveau').length;
    setNewOrderCount(count);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          {newOrderCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {newOrderCount > 9 ? '9+' : newOrderCount}
            </span>
          )}
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
