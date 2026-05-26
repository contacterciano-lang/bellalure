'use client';

import type { Badge as BadgeType } from '@/lib/types';

interface BadgeProps {
  type: BadgeType;
  className?: string;
}

const badgeStyles: Record<BadgeType, string> = {
  nouveau: 'bg-black text-white',
  'best-seller': 'bg-[#C9A96E] text-white',
  tendance: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white',
  promo: 'bg-red-600 text-white',
};

const badgeLabels: Record<BadgeType, string> = {
  nouveau: 'Nouveau',
  'best-seller': 'Best-seller',
  tendance: 'Tendance',
  promo: 'Promo',
};

export default function Badge({ type, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 text-[10px] font-semibold
        uppercase tracking-wider rounded-full select-none
        ${badgeStyles[type]}
        ${className}
      `}
    >
      {badgeLabels[type]}
    </span>
  );
}
