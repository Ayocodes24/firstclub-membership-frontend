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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl font-bold mb-2">Subscribe</h1>
      <p className="text-muted mb-8">
        Subscribing as <span className="font-semibold text-ink">{user.name}</span>
        {user.cohort && <span className="ml-2 chip bg-slate-100 text-slate-700">cohort: {user.cohort}</span>}
      </p>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">1. Pick a plan</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {plans.map(p => (
            <button
              key={p.id}
              onClick={() => setPlanId(p.id)}
              className={`card text-left p-5 transition ${planId === p.id ? 'ring-2 ring-brand-600 border-brand-600' : 'hover:border-slate-300'}`}
            >
              <div className="text-sm font-semibold">{p.planType}</div>
              <div className="text-2xl font-bold mt-1">₹{Number(p.price).toFixed(0)}</div>
              <div className="text-xs text-muted">{p.durationDays} days</div>
            </button>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">2. Pick a tier</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {allTiers.map(t => {
            const eligible = eligibleIds.has(t.id);
            return (
              <button
                key={t.id}
                onClick={() => eligible && setTierId(t.id)}
                disabled={!eligible}
                className={`card text-left p-5 transition relative ${
                  tierId === t.id
                    ? 'ring-2 ring-brand-600 border-brand-600'
                    : eligible
                    ? 'hover:border-slate-300'
                    : 'opacity-50 cursor-not-allowed'
                }`}
                title={eligible ? '' : 'You are not eligible for this tier yet'}
              >
                <TierBadge tier={t.tierName} />
                <div className="text-xs text-muted mt-3">{t.description}</div>
                {!eligible && (
                  <span className="absolute top-3 right-3 chip bg-slate-100 text-slate-600">
                    Locked
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-muted">
          <Info className="size-4 mt-0.5 flex-shrink-0" />
          <p>
            {hiddenCount > 0 ? (
              <>
                Higher tiers are unlocked through shopping activity (orders, spend)
                or special cohorts. Place orders in the <span className="font-medium">Simulator</span>{' '}
                to become eligible — you'll get a notification on My Membership when a higher
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
