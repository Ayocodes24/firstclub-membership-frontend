import { Crown, Award, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TierName } from '../types/api';

const styles: Record<TierName, { bg: string; text: string; icon: LucideIcon }> = {
  SILVER:   { bg: 'bg-cream-200/70',  text: 'text-brand-800',  icon: Star },
  GOLD:     { bg: 'bg-amber-100',     text: 'text-amber-900',  icon: Award },
  PLATINUM: { bg: 'bg-brand-800',     text: 'text-cream-50',   icon: Crown },
};

interface Props {
  tier: TierName;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, size = 'md' }: Props) {
  const s = styles[tier];
  const cls =
    size === 'sm' ? 'text-xs px-2.5 py-1' :
    size === 'lg' ? 'text-base px-5 py-2.5' :
    'text-sm px-3.5 py-1.5';
  const iconCls =
    size === 'sm' ? 'size-3' :
    size === 'lg' ? 'size-5' :
    'size-4';
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold tracking-wide ${s.bg} ${s.text} ${cls}`}>
      <Icon className={iconCls} />
      {tier}
    </span>
  );
}
