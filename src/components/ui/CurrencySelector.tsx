'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCurrency, CURRENCIES, type CurrencyCode } from '@/lib/currency';

export default function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full border border-black/10 dark:border-white/10 px-2.5 py-1.5 text-[11px] font-medium text-black/60 dark:text-white/60 transition-colors hover:border-[#C9A96E] hover:text-[#C9A96E]"
      >
        {currency.code}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 min-w-[120px] rounded-lg border border-black/10 bg-white py-1 shadow-lg z-50">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => {
                setCurrency(c.code);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-[#F5F0EB] ${
                currency.code === c.code ? 'font-semibold text-[#C9A96E]' : 'text-black/70'
              }`}
            >
              <span className="w-5 text-center font-mono">{c.symbol}</span>
              {c.code}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
