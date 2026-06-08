import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell, Calendar, Check, Crown, Truck, Percent, Clock, Headphones,
  X, AlertTriangle, RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  getCurrentMembership, getBenefits, getNotifications, ackNotification,
} from '../api/membership';
import { confirmUpgrade, downgrade, cancel as cancelSub } from '../api/subscriptions';
import { getTiers } from '../api/catalog';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import { TierBadge } from '../components/TierBadge';
import type {
  SubscriptionResponse, AppliedBenefit, NotificationResponse, TierResponse,
  BenefitType,
} from '../types/api';

const benefitIcon: Record<BenefitType, LucideIcon> = {
  FREE_DELIVERY: Truck,
  DISCOUNT_PERCENTAGE: Percent,
  EARLY_ACCESS: Clock,
  PRIORITY_SUPPORT: Headphones,
};

export function Membership() {
  const { user } = useUser();
  const toast = useToast();
  const [sub, setSub] = useState<SubscriptionResponse | null>(null);
  const [benefits, setBenefits] = useState<AppliedBenefit[]>([]);
  const [notifs, setNotifs] = useState<NotificationResponse[]>([]);
  const [tiers, setTiers] = useState<TierResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const m = await getCurrentMembership(user.id);
      setSub(m);
      const [b, n, t] = await Promise.all([
        getBenefits(user.id),
        getNotifications(user.id),
        getTiers(),
      ]);
      setBenefits(b);
      setNotifs(n);
      setTiers([...t].sort((a, b) => a.level - b.level));
    } catch (err: unknown) {
      setSub(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      if (e?.response?.status === 404) setError(null);
      else setError(e?.response?.data?.message || 'Failed to load membership');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => { reload(); }, [reload]);

  const handleConfirmUpgrade = async (notifId: number) => {
    if (!sub) return;
    try {
      await confirmUpgrade(sub.id);
      await ackNotification(notifId);
      toast.push('success', 'Upgrade confirmed');
      reload();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.push('error', e?.response?.data?.message || 'Upgrade failed');
    }
  };

  const handleAck = async (notifId: number) => {
    try { await ackNotification(notifId); reload(); }
    catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.push('error', e?.response?.data?.message || 'Acknowledge failed');
    }
  };

  const handleDowngrade = async (targetTierId: number) => {
    if (!sub) return;
    try {
      await downgrade(sub.id, targetTierId);
      toast.push('success', 'Downgraded');
      reload();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.push('error', e?.response?.data?.message || 'Downgrade failed');
    }
  };

  const handleCancel = async () => {
    if (!sub) return;
    try {
      await cancelSub(sub.id);
      toast.push('success', 'Subscription cancelled');
      setConfirmCancel(false);
      reload();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.push('error', e?.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) {
    return <div className="mx-auto max-w-5xl px-8 py-16 text-muted">Loading…</div>;
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
          No active <span className="serif-italic font-bold">membership.</span>
        </h1>
        <p className="text-muted mb-10 text-lg">
          {user.name} doesn't have an active subscription right now.
        </p>
        <Link to="/subscribe" className="btn-primary btn-lg">Subscribe now</Link>
        {error && <p className="text-red-700 mt-6 text-sm">{error}</p>}
      </div>
    );
  }

  const currentTier = tiers.find(t => t.id === sub.tierId);
  const lowerTiers = tiers.filter(t => currentTier && t.level < currentTier.level);

  return (
    <div className="mx-auto max-w-5xl px-8 pt-12 pb-24">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h1 className="text-5xl md:text-6xl font-display font-bold leading-[1]">
            My <span className="serif-italic font-bold">Membership</span>
          </h1>
          <p className="text-muted text-sm mt-3">Logged in as {user.name}</p>
        </div>
        <button onClick={reload} className="btn-secondary btn-sm">
          <RefreshCw className="size-4" /> Refresh
        </button>
      </div>

      {/* Notifications */}
      {notifs.length > 0 && (
        <div className="mb-8 space-y-3">
          {notifs.map(n => {
            const toTier = tiers.find(t => t.id === n.toTierId);
            const isUpgrade = n.type === 'UPGRADE_ELIGIBLE';
            return (
              <div
                key={n.id}
                className={`rounded-3xl p-6 border ${
                  isUpgrade
                    ? 'bg-brand-800 text-cream-50 border-brand-900'
                    : 'bg-amber-100 text-amber-950 border-amber-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`size-11 rounded-2xl grid place-items-center shrink-0 ${
                      isUpgrade
                        ? 'bg-cream-50 text-brand-800'
                        : 'bg-amber-500 text-cream-50'
                    }`}
                  >
                    <Bell className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-bold text-lg flex items-center gap-2">
                      {isUpgrade ? 'Upgrade available' : 'Tier changed'}
                      {toTier && <TierBadge tier={toTier.tierName} size="sm" />}
                    </div>
                    <p className={`text-sm mt-1 ${isUpgrade ? 'text-cream-100' : 'text-amber-900'}`}>
                      {n.reason}
                    </p>
                    <div className="flex gap-2 mt-4">
                      {isUpgrade ? (
                        <>
                          <button
                            onClick={() => handleConfirmUpgrade(n.id)}
                            className="btn bg-cream-50 text-brand-800 hover:bg-cream-200 btn-md"
                          >
                            Confirm upgrade
                          </button>
                          <button
                            onClick={() => handleAck(n.id)}
                            className="btn text-cream-100 hover:bg-brand-700 btn-md"
                          >
                            Not now
                          </button>
                        </>
                      ) : (
                        <button onClick={() => handleAck(n.id)} className="btn-secondary btn-sm">
                          <Check className="size-4" /> Got it
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Current subscription */}
      <div className="card-warm p-10 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-brand-800 font-semibold mb-3">
              Current Tier
            </div>
            <TierBadge tier={sub.tierName} size="lg" />
            <div className="mt-6 flex flex-wrap gap-3 items-center text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {sub.planType} plan · expires {new Date(sub.expiresAt).toLocaleDateString()}
              </span>
              <span className="chip bg-brand-800 text-cream-50">{sub.status}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowerTiers.length > 0 && (
              <select
                onChange={e => e.target.value && handleDowngrade(Number(e.target.value))}
                defaultValue=""
                className="rounded-full border border-brand-800/20 bg-cream-50 px-4 h-11 text-sm text-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
              >
                <option value="" disabled>Downgrade to…</option>
                {lowerTiers.map(t => <option key={t.id} value={t.id}>{t.tierName}</option>)}
              </select>
            )}
            <button onClick={() => setConfirmCancel(true)} className="btn-secondary btn-md">
              <X className="size-4" /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <h2 className="font-display text-3xl font-bold mb-5 text-ink">
        Your <span className="serif-italic font-bold">benefits.</span>
      </h2>
      {benefits.length === 0 ? (
        <p className="text-muted">No benefits unlocked at this tier.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {benefits.map((b, i) => {
            const Icon = benefitIcon[b.type] || Crown;
            return (
              <div key={i} className="card p-6">
                <div className="size-11 rounded-2xl bg-brand-800 text-cream-50 grid place-items-center mb-4">
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold text-ink mb-1">{b.description}</div>
                <div className="text-xs text-muted uppercase tracking-wide">
                  {b.type.replace(/_/g, ' ')}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirm dialog */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4"
          onClick={() => setConfirmCancel(false)}
        >
          <div className="card p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4">
              <div className="size-11 rounded-2xl bg-amber-100 text-amber-700 grid place-items-center shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl mb-2">Cancel subscription?</h3>
                <p className="text-sm text-muted">
                  This will end {user.name}'s membership immediately. You can
                  re-subscribe afterwards.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-8">
              <button onClick={() => setConfirmCancel(false)} className="btn-secondary btn-md">
                Keep it
              </button>
              <button onClick={handleCancel} className="btn-primary btn-md">
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
