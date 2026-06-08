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
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="inline-flex items-center gap-2 chip bg-amber-50 text-amber-700 mb-4">
        <Zap className="size-3.5" /> Demo tool
      </div>
      <h1 className="text-4xl font-bold mb-2">Order Simulator</h1>
      <p className="text-muted mb-8">
        In the real product, completed orders would arrive from the checkout service.
        Use this page to simulate one — it triggers tier re-evaluation for{' '}
        <span className="font-semibold text-ink">{user.name}</span>, and you'll see any
        resulting upgrade/downgrade notifications on{' '}
        <Link to="/membership" className="text-brand-600 underline">My Membership</Link>.
      </p>

      <div className="card p-6 mb-8">
        <label className="block text-sm font-medium mb-2">Order total (₹)</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            className="flex-1 rounded-lg border border-slate-200 px-4 h-11 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="150"
          />
          <button onClick={submit} disabled={busy} className="btn-primary btn-md">
            {busy ? 'Placing…' : (<>Place order <ArrowRight className="size-4" /></>)}
          </button>
        </div>
        <div className="mt-4 text-xs text-muted">
          Tip: For Diya (GOLD_INVITEE), one small order is enough to trigger a GOLD upgrade
          via the cohort rule. For users without a cohort, you'll need 5+ orders or
          ≥ ₹5,000 spend in 30 days.
        </div>
      </div>

      {recent.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-3">Recent orders this session</h2>
          <div className="card divide-y divide-slate-100">
            {recent.map(o => (
              <div key={o.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="size-4 text-muted" />
                  <span className="font-medium text-sm">Order #{o.id}</span>
                  <span className="text-xs text-muted">
                    {o.completedAt ? new Date(o.completedAt).toLocaleTimeString() : ''}
                  </span>
                </div>
                <div className="font-semibold">₹{Number(o.totalAmount).toFixed(0)}</div>
              </div>
            ))}
          </div>
          <Link to="/membership" className="btn-primary btn-md mt-6">
            Open My Membership <ArrowRight className="size-4" />
          </Link>
        </>
      )}
    </div>
  );
}
