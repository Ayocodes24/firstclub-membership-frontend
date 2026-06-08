import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  push: (kind: ToastKind, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <ToastView key={t.id} toast={t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ toast }: { toast: Toast }) {
  const palette = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      Icon: CheckCircle2,
      iconCls: 'text-emerald-600',
    },
    error: {
      bg: 'bg-brand-50 border-brand-200 text-brand-900',
      Icon: AlertCircle,
      iconCls: 'text-brand-600',
    },
    info: {
      bg: 'bg-slate-100 border-slate-200 text-slate-900',
      Icon: Info,
      iconCls: 'text-slate-600',
    },
  }[toast.kind];
  const { Icon } = palette;
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 ${palette.bg} border rounded-xl px-4 py-3 shadow-card max-w-md`}
    >
      <Icon className={`size-5 mt-0.5 ${palette.iconCls}`} />
      <p className="text-sm leading-snug">{toast.message}</p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
