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
    return <div className="mx-auto max-w-5xl px-6 py-16 text-muted">Loading…</div>;
  }

  if (!sub) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-3">No active membership</h1>
        <p className="text-muted mb-8">{user.name} doesn't have an active subscription right now.</p>
        <Link to="/subscribe" className="btn-primary btn-lg">Subscribe now</Link>
        {error && <p className="text-brand-700 mt-6 text-sm">{error}</p>}
      </div>
    );
  }

  const currentTier = tiers.find(t => t.id === sub.tierId);
  const lowerTiers = tiers.filter(t => currentTier && t.level < currentTier.level);

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Membership</h1>
          <p className="text-muted text-sm mt-1">Logged in as {user.name}</p>
        </div>
        <button onClick={reload} className="btn-ghost btn-sm">
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
              <div key={n.id} className={`card p-5 ${isUpgrade ? 'border-brand-200 bg-brand-50/40' : 'border-amber-200 bg-amber-50/60'}`}>
                <div className="flex items-start gap-4">
                  <div className={`size-10 rounded-xl grid place-items-center ${isUpgrade ? 'bg-brand-600 text-white' : 'bg-amber-500 text-white'}`}>
                    <Bell className="size-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold flex items-center gap-2">
                      {isUpgrade ? 'Upgrade available' : 'Tier changed'}
                      {toTier && <TierBadge tier={toTier.tierName} size="sm" />}
                    </div>
                    <p className="text-sm text-muted mt-1">{n.reason}</p>
                    <div className="flex gap-2 mt-3">
                      {isUpgrade ? (
                        <>
                          <button onClick={() => handleConfirmUpgrade(n.id)} className="btn-primary btn-sm">
                            Confirm upgrade
                          </button>
                          <button onClick={() => handleAck(n.id)} className="btn-ghost btn-sm">
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
      <div className="card p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted font-medium mb-2">
              Current Tier
            </div>
            <TierBadge tier={sub.tierName} size="lg" />
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" />
                {sub.planType} plan · expires {new Date(sub.expiresAt).toLocaleDateString()}
              </span>
              <span className="chip bg-emerald-50 text-emerald-700">{sub.status}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowerTiers.length > 0 && (
              <select
                onChange={e => e.target.value && handleDowngrade(Number(e.target.value))}
                defaultValue=""
                className="rounded-lg border border-slate-200 px-3 h-11 text-sm bg-white"
              >
                <option value="" disabled>Downgrade to…</option>
                {lowerTiers.map(t => <option key={t.id} value={t.id}>{t.tierName}</option>)}
              </select>
            )}
            <button onClick={() => setConfirmCancel(true)} className="btn-danger btn-md">
              <X className="size-4" /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <h2 className="text-xl font-bold mb-4">Your benefits</h2>
      {benefits.length === 0 ? (
        <p className="text-muted">No benefits unlocked at this tier.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {benefits.map((b, i) => {
            const Icon = benefitIcon[b.type] || Crown;
            return (
              <div key={i} className="card p-5">
                <div className="size-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center mb-3">
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold mb-1">{b.description}</div>
                <div className="text-xs text-muted">{b.type.replace(/_/g, ' ')}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel confirm dialog */}
      {confirmCancel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4"
          onClick={() => setConfirmCancel(false)}
        >
          <div className="card p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
                <AlertTriangle className="size-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-1">Cancel subscription?</h3>
                <p className="text-sm text-muted">
                  This will end {user.name}'s membership immediately. You can re-subscribe afterwards.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setConfirmCancel(false)} className="btn-ghost btn-md">
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
