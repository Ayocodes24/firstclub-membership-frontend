import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Leaf, Truck, Percent, Clock, Headphones } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getPlans, getTiers } from '../api/catalog';
import { TierBadge } from '../components/TierBadge';
import type { PlanResponse, TierResponse, PlanType, TierName } from '../types/api';

const planMeta: Record<PlanType, { label: string; sub: string; highlight?: boolean }> = {
  MONTHLY:   { label: 'Monthly',   sub: 'Dip your toes in' },
  QUARTERLY: { label: 'Quarterly', sub: 'Settle in' },
  YEARLY:    { label: 'Yearly',    sub: 'Best value', highlight: true },
};

const tierPerkIcons: { icon: LucideIcon; text: string; tiers: TierName[] }[] = [
  { icon: Truck,      text: 'Free delivery',           tiers: ['SILVER', 'GOLD', 'PLATINUM'] },
  { icon: Percent,    text: 'Member discounts',        tiers: ['GOLD', 'PLATINUM'] },
  { icon: Clock,      text: 'Early access to sales',   tiers: ['PLATINUM'] },
  { icon: Headphones, text: 'Priority support',        tiers: ['PLATINUM'] },
];

const tierPerks: Record<TierName, string[]> = {
  SILVER:   ['Free delivery above ₹199'],
  GOLD:     ['Free delivery on every order', '5% off, capped at ₹200'],
  PLATINUM: ['Free delivery on every order', '10% off, capped at ₹500', '24h early access to sales', '2-hour priority support SLA'],
};

export function Home() {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [tiers, setTiers] = useState<TierResponse[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getPlans(), getTiers()]).then(([p, t]) => {
      setPlans(p);
      setTiers([...t].sort((a, b) => a.level - b.level));
    }).catch(() => { /* shown via empty state */ });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-[1400px] px-8 pt-16 pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end">
          <h1 className="text-6xl md:text-7xl lg:text-[88px] leading-[0.95] font-display font-bold text-ink">
            Membership,
            <br />
            <span className="serif-italic font-bold">the FirstClub way.</span>
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-md lg:pb-4">
            Pick a plan that fits your rhythm. Earn higher tiers as you shop — we'll
            prompt you the moment a new one opens up, and never change your tier
            without telling you why.
          </p>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link to="/subscribe" className="btn-primary btn-lg">
            Subscribe now <ArrowRight className="size-4" />
          </Link>
          <Link to="/membership" className="btn-secondary btn-lg">
            View my membership
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-[1400px] px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-ink leading-[1]">
            Choose your <span className="serif-italic font-bold">plan</span>
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-md">
            All plans unlock the same tier benefits. Pick the cadence that
            matches how often you shop.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map(plan => {
            const meta = planMeta[plan.planType];
            return (
              <div
                key={plan.id}
                className={`card-warm p-8 relative flex flex-col ${
                  meta.highlight ? 'ring-2 ring-brand-800' : ''
                }`}
              >
                {meta.highlight && (
                  <span className="absolute -top-3 left-8 chip bg-brand-800 text-cream-50">
                    Most popular
                  </span>
                )}
                <div className="text-xs uppercase tracking-wider text-brand-800 font-semibold">
                  {meta.sub}
                </div>
                <div className="font-display text-3xl font-bold mt-2">{meta.label}</div>
                <div className="mt-6 mb-8">
                  <span className="font-display text-6xl font-bold text-ink">
                    ₹{Number(plan.price).toFixed(0)}
                  </span>
                  <span className="text-muted ml-2 text-sm">
                    / {plan.durationDays} days
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/subscribe?planId=${plan.id}`)}
                  className={
                    meta.highlight
                      ? 'btn-primary btn-md w-full mt-auto'
                      : 'btn-secondary btn-md w-full mt-auto'
                  }
                >
                  Choose {meta.label}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tier comparison */}
      <section className="mx-auto max-w-[1400px] px-8 pt-20 pb-12">
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-10 items-end mb-12">
          <h2 className="text-5xl md:text-6xl font-display font-bold text-ink leading-[1]">
            Three tiers <span className="serif-italic font-bold">of belonging.</span>
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-md">
            Start where you're ready. Earn the next tier through your shopping
            activity — orders, spend, or a special cohort invite.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {tiers.map(tier => (
            <div key={tier.id} className="card-warm p-8 flex flex-col">
              <TierBadge tier={tier.tierName} size="lg" />
              <p className="mt-5 text-sm text-muted leading-relaxed">
                {tier.description}
              </p>
              <div className="mt-8 space-y-3 flex-1">
                {(tierPerks[tier.tierName] || []).map(p => (
                  <div key={p} className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-brand-800 grid place-items-center mt-0.5 shrink-0">
                      <Check className="size-3 text-cream-50" strokeWidth={3} />
                    </span>
                    <span className="text-sm text-ink">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Perk icons strip */}
      <section className="mx-auto max-w-[1400px] px-8 py-16">
        <div className="card p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {tierPerkIcons.map(({ icon: Icon, text, tiers }) => (
              <div key={text} className="text-center">
                <div className="size-12 mx-auto rounded-full bg-brand-50 text-brand-800 grid place-items-center mb-3">
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold text-ink">{text}</div>
                <div className="text-xs text-muted mt-1">
                  {tiers.join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bar */}
      <section className="mx-auto max-w-[1400px] px-8 pb-24">
        <div className="rounded-4xl p-12 bg-brand-800 text-cream-50 relative overflow-hidden">
          <Leaf className="absolute -right-10 -top-10 size-64 text-brand-700 opacity-40" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-4">
                Ready to <span className="italic">join?</span>
              </h3>
              <p className="text-cream-100 max-w-md">
                Pick your plan, choose your tier, and start unlocking perks today.
                You'll always be in control of where your membership goes.
              </p>
            </div>
            <div className="md:text-right">
              <Link to="/subscribe" className="btn bg-cream-50 text-brand-800 hover:bg-cream-200 btn-lg">
                Subscribe now <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
