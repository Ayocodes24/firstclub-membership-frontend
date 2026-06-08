import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowRight, Package } from 'lucide-react';
import { recordCompletedOrder } from '../api/orders';
import { useUser } from '../context/UserContext';
import { useToast } from '../components/Toast';
import type { OrderResponse } from '../types/api';

export function Simulator() {
  const { user } = useUser();
  const toast = useToast();
  const [amount, setAmount] = useState('150');
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<OrderResponse[]>([]);

  const submit = async () => {
    const value = Number(amount);
    if (!value || value <= 0) {
      toast.push('error', 'Amount must be greater than 0');
      return;
    }
    setBusy(true);
    try {
      const order = await recordCompletedOrder(user.id, value);
      setRecent(prev => [order, ...prev].slice(0, 10));
      toast.push('success', `Order #${order.id} placed (₹${value}). Check My Membership for notifications.`);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      toast.push('error', e?.response?.data?.message || 'Order failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-8 pt-16 pb-24">
      <div className="inline-flex items-center gap-2 chip bg-amber-100 text-amber-900 mb-5">
        <Zap className="size-3.5" /> Demo tool
      </div>
      <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 leading-[1]">
        Order <span className="serif-italic font-bold">Simulator.</span>
      </h1>
      <p className="text-muted mb-10 text-lg leading-relaxed">
        In the real product, completed orders would arrive from the checkout
        service. Use this page to simulate one — it triggers tier re-evaluation
        for <span className="font-semibold text-ink">{user.name}</span>, and
        you'll see any resulting upgrade/downgrade notifications on{' '}
        <Link to="/membership" className="text-brand-800 underline underline-offset-4">
          My Membership
        </Link>.
      </p>

      <div className="card p-8 mb-10">
        <label className="block text-sm font-medium mb-3 text-ink">Order total (₹)</label>
        <div className="flex gap-3">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            className="flex-1 rounded-full border border-brand-800/15 bg-cream-50 px-5 h-12 text-base focus:outline-none focus:ring-2 focus:ring-brand-700"
            placeholder="150"
          />
          <button onClick={submit} disabled={busy} className="btn-primary btn-lg">
            {busy ? 'Placing…' : (<>Place order <ArrowRight className="size-4" /></>)}
          </button>
        </div>
        <div className="mt-5 text-sm text-muted">
          <span className="font-medium text-ink">Tip:</span> For Diya
          (GOLD_INVITEE), one small order is enough to trigger a GOLD upgrade
          via the cohort rule. For users without a cohort, you'll need 5+ orders
          or ≥ ₹5,000 spend in 30 days.
        </div>
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="font-display text-2xl font-bold mb-4 text-ink">
            Recent orders this session
          </h2>
          <div className="card divide-y divide-brand-800/10">
            {recent.map(o => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="size-4 text-brand-800" />
                  <span className="font-medium text-sm text-ink">Order #{o.id}</span>
                  <span className="text-xs text-muted">
                    {o.completedAt ? new Date(o.completedAt).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className="font-display font-bold text-lg">
                  ₹{Number(o.totalAmount).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
          <Link to="/membership" className="btn-primary btn-md mt-8">
            Open My Membership <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </div>
  );
}
