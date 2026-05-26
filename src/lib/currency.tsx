'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'CDF';

interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // rate relative to USD
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', label: 'USD ($)', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rate: 0.92 },
  { code: 'CDF', symbol: 'FC', label: 'CDF (FC)', rate: 2800 },
];

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrency: (code: CurrencyCode) => void;
  convert: (usdAmount: number) => number;
  format: (usdAmount: number) => string;
  formatRaw: (amount: number, currencyCode?: CurrencyCode) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyInfo>(CURRENCIES[0]);

  const setCurrency = useCallback((code: CurrencyCode) => {
    const found = CURRENCIES.find((c) => c.code === code);
    if (found) {
      setCurrencyState(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bellalure-currency', code);
      }
    }
  }, []);

  // Load saved preference on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bellalure-currency') as CurrencyCode | null;
      if (saved) {
        const found = CURRENCIES.find((c) => c.code === saved);
        if (found) setCurrencyState(found);
      }
    }
  });

  const convert = useCallback(
    (usdAmount: number) => usdAmount * currency.rate,
    [currency.rate],
  );

  const format = useCallback(
    (usdAmount: number) => {
      const converted = usdAmount * currency.rate;
      if (currency.code === 'CDF') {
        return `${Math.round(converted).toLocaleString('fr-FR')} FC`;
      }
      return `${currency.symbol}${converted.toFixed(2)}`;
    },
    [currency],
  );

  const formatRaw = useCallback(
    (amount: number, currencyCode?: CurrencyCode) => {
      const cur = currencyCode
        ? CURRENCIES.find((c) => c.code === currencyCode) || currency
        : currency;
      if (cur.code === 'CDF') {
        return `${Math.round(amount).toLocaleString('fr-FR')} FC`;
      }
      return `${cur.symbol}${amount.toFixed(2)}`;
    },
    [currency],
  );

  return (
    <CurrencyContext value={{ currency, setCurrency, convert, format, formatRaw }}>
      {children}
    </CurrencyContext>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be inside CurrencyProvider');
  return ctx;
}
