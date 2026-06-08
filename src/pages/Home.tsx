import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { getPlans, getTiers } from '../api/catalog';
import { TierBadge } from '../components/TierBadge';
import type { PlanResponse, TierResponse, PlanType, TierName } from '../types/api';

const planMeta: Record<PlanType, { label: string; sub: string; highlight?: boolean }> = {
  MONTHLY:   { label: 'Monthly',   sub: 'Try it out' },
  QUARTERLY: { label: 'Quarterly', sub: 'Settle in' },
  YEARLY:    { label: 'Yearly',    sub: 'Best value', highlight: true },
};

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
      <section className="mx-auto max-w-7xl px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 chip bg-brand-50 text-brand-700 mb-6">
          <Sparkles className="size-3.5" /> Curated Slow. Delivered Fast.
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.05] mb-6">
          Become a <span className="text-brand-600">FirstClub</span> Member
        </h1>
        <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10">
          Quality you don't have to second guess. Pick a plan, unlock benefits,
          and watch them grow as you shop.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/subscribe" className="btn-primary btn-lg">
            Subscribe now <ArrowRight className="size-4" />
          </Link>
          <Link to="/membership" className="btn-secondary btn-lg">
            View my membership
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Choose your plan</h2>
          <p className="text-muted">All plans unlock the same tier benefits — pick what fits your rhythm.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => {
            const meta = planMeta[plan.planType];
            return (
              <div key={plan.id} className={`card p-8 relative ${meta.highlight ? 'ring-2 ring-brand-600' : ''}`}>
                {meta.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 chip bg-brand-600 text-white">
                    Most popular
                  </span>
                )}
                <div className="text-sm text-muted">{meta.sub}</div>
                <div className="text-2xl font-bold mt-1">{meta.label}</div>
                <div className="mt-6 mb-6">
                  <span className="text-5xl font-extrabold">₹{Number(plan.price).toFixed(0)}</span>
                  <span className="text-muted ml-1">/ {plan.durationDays} days</span>
                </div>
                <button
                  onClick={() => navigate(`/subscribe?planId=${plan.id}`)}
                  className={meta.highlight ? 'btn-primary btn-md w-full' : 'btn-secondary btn-md w-full'}
                >
                  Choose {meta.label}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tier comparison */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Three tiers of belonging</h2>
          <p className="text-muted">Earn higher tiers through your activity. Bigger spend, more perks.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {tiers.map(tier => (
            <div key={tier.id} className="card p-8">
              <TierBadge tier={tier.tierName} size="lg" />
              <p className="mt-4 text-sm text-muted">{tier.description}</p>
              <div className="mt-6 space-y-3">
                {(tierPerks[tier.tierName] || []).map(p => (
                  <div key={p} className="flex items-start gap-3">
                    <Check className="size-5 text-emerald-600 mt-0.5" />
                    <span className="text-sm">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bar */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl p-10 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-3">Ready to join?</h3>
              <p className="text-brand-100">Pick a plan, choose your tier, and start unlocking perks today.</p>
            </div>
            <div className="md:text-right">
              <Link to="/subscribe" className="btn bg-white text-brand-700 hover:bg-brand-50 btn-lg">
                Subscribe now <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
