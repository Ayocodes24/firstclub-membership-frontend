import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { getPlans, getTiers } from '../api/catalog';
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
  const [tiers, setTiers] = useState<TierResponse[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [tierId, setTierId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Promise.all([getPlans(), getTiers()]).then(([p, t]) => {
      const sortedT = [...t].sort((a, b) => a.level - b.level);
      setPlans(p);
      setTiers(sortedT);
      const preselect = Number(search.get('planId'));
      if (preselect && p.find(x => x.id === preselect)) setPlanId(preselect);
      else if (p[0]) setPlanId(p[0].id);
      if (sortedT[0]) setTierId(sortedT[0].id);
    });
  }, [search]);

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
          {tiers.map(t => (
            <button
              key={t.id}
              onClick={() => setTierId(t.id)}
              className={`card text-left p-5 transition ${tierId === t.id ? 'ring-2 ring-brand-600 border-brand-600' : 'hover:border-slate-300'}`}
            >
              <TierBadge tier={t.tierName} />
              <div className="text-xs text-muted mt-3">{t.description}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-start gap-2 text-xs text-muted">
          <AlertCircle className="size-4 mt-0.5" />
          <p>You can pick any tier at signup. Tier upgrades later are activity-based and require your confirmation.</p>
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
