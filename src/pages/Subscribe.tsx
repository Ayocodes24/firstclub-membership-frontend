import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { getPlans, getTiers } from '../api/catalog';
import { getEligibleTiers } from '../api/membership';
import { subscribe } from '../api/subscriptions';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { TierBadge } from '../components/TierBadge';
import type { PlanResponse, TierResponse } from '../types/api';

export function Subscribe() {
  const { user } = useUser();
  const toast = useToast();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [allTiers, setAllTiers] = useState<TierResponse[]>([]);
  const [eligibleTiers, setEligibleTiers] = useState<TierResponse[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [tierId, setTierId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([
      getPlans(),
      getTiers(),
      getEligibleTiers(user.id),
    ]).then(([p, t, e]) => {
      const sortedAll = [...t].sort((a, b) => a.level - b.level);
      const sortedEligible = [...e].sort((a, b) => a.level - b.level);
      setPlans(p);
      setAllTiers(sortedAll);
      setEligibleTiers(sortedEligible);

      const preselect = Number(search.get('planId'));
      if (preselect && p.find(x => x.id === preselect)) setPlanId(preselect);
      else if (p[0]) setPlanId(p[0].id);
      if (sortedEligible[0]) setTierId(sortedEligible[0].id);
    });
  }, [search, user.id]);

  const eligibleIds = new Set(eligibleTiers.map(t => t.id));
  const hiddenCount = allTiers.length - eligibleTiers.length;

  const submit = async () => {
    if (!planId || !tierId) return;
    setBusy(true);
    try {
      const key = `frontend-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await subscribe(user.id, planId, tierId, key);
      toast.push('success', `Subscribed as ${user.name.split(' ')[0]} — welcome!`);
      navigate('/membership');
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || 'Subscribe failed';
      if (status === 409) {
        toast.push('error', `${msg} — opening your current membership`);
        setTimeout(() => navigate('/membership'), 600);
      } else {
        toast.push('error', msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-8 pt-16 pb-24">
      <h1 className="text-5xl md:text-6xl font-display font-bold mb-3">
        <span className="serif-italic font-bold">Subscribe</span>
      </h1>
      <p className="text-muted mb-12 text-lg">
        Subscribing as <span className="font-semibold text-ink">{user.name}</span>
        {user.cohort && (
          <span className="ml-2 chip bg-cream-200 text-brand-800 border border-brand-800/15">
            cohort: {user.cohort}
          </span>
        )}
      </p>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold mb-5 text-ink">
          1. Pick a plan
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map(p => (
            <button
              key={p.id}
              onClick={() => setPlanId(p.id)}
              className={`card-warm text-left p-6 transition ${
                planId === p.id
                  ? 'ring-2 ring-brand-800'
                  : 'hover:ring-1 hover:ring-brand-800/30'
              }`}
            >
              <div className="text-xs uppercase tracking-wider text-brand-800 font-semibold">
                {p.planType}
              </div>
              <div className="font-display text-4xl font-bold mt-2">
                ₹{Number(p.price).toFixed(0)}
              </div>
              <div className="text-xs text-muted mt-1">{p.durationDays} days</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-display text-2xl font-bold mb-5 text-ink">
          2. Pick a tier
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {allTiers.map(t => {
            const eligible = eligibleIds.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => eligible && setTierId(t.id)}
                disabled={!eligible}
                className={`card-warm text-left p-6 transition relative ${
                  tierId === t.id
                    ? 'ring-2 ring-brand-800'
                    : eligible
                    ? 'hover:ring-1 hover:ring-brand-800/30'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title={eligible ? '' : 'You are not eligible for this tier yet'}
              >
                <TierBadge tier={t.tierName} />
                <div className="text-sm text-ink mt-4 leading-relaxed">{t.description}</div>
                {!eligible && (
                  <span className="absolute top-4 right-4 chip bg-cream-100 text-muted border border-brand-800/10">
                    Locked
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-start gap-2 text-sm text-muted">
          <Info className="size-4 mt-0.5 flex-shrink-0 text-brand-800" />
          <p>
            {hiddenCount > 0 ? (
              <>
                Higher tiers are unlocked through shopping activity (orders, spend)
                or special cohorts. Place orders in the{' '}
                <span className="font-medium text-ink">Simulator</span> to become
                eligible — you'll get a notification on My Membership when a higher
                tier opens up.
              </>
            ) : (
              <>You're eligible for every tier — pick any one.</>
            )}
          </p>
        </div>
      </section>

      <button
        onClick={submit}
        disabled={busy || !planId || !tierId}
        className="btn-primary btn-lg"
      >
        {busy ? 'Subscribing…' : (<>Confirm subscribe <ArrowRight className="size-4" /></>)}
      </button>
    </div>
  );
}
