import { Crown, Award, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TierName } from '../types/api';

const styles: Record<TierName, { bg: string; text: string; icon: LucideIcon }> = {
  SILVER:   { bg: 'bg-slate-100',  text: 'text-slate-700',  icon: Star },
  GOLD:     { bg: 'bg-amber-50',   text: 'text-amber-700',  icon: Award },
  PLATINUM: { bg: 'bg-violet-50',  text: 'text-violet-700', icon: Crown },
};

interface Props {
  tier: TierName;
  size?: 'sm' | 'md' | 'lg';
}

export function TierBadge({ tier, size = 'md' }: Props) {
  const s = styles[tier];
  const cls =
    size === 'sm' ? 'text-xs px-2 py-0.5' :
    size === 'lg' ? 'text-base px-4 py-2' :
    'text-sm px-3 py-1';
  const iconCls =
    size === 'sm' ? 'size-3' :
    size === 'lg' ? 'size-5' :
    'size-4';
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${s.bg} ${s.text} ${cls}`}>
      <Icon className={iconCls} />
      {tier}
    </span>
  );
}
