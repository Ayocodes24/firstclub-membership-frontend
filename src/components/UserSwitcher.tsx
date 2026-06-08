import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, User } from 'lucide-react';
import { useUser } from '../context/UserContext';

export function UserSwitcher() {
  const { user, setUser, users } = useUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-secondary btn-sm"
      >
        <User className="size-4" />
        {user.name.split(' ')[0]}
        <ChevronDown className="size-4" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 card p-2">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-muted font-medium">
            Demo as
          </div>
          {users.map(u => (
            <button
              key={u.id}
              onClick={() => {
                setUser(u);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-sm">{u.name}</div>
                <div className="text-xs text-muted">
                  {u.cohort ? <>cohort: {u.cohort}</> : <>no cohort</>}
                </div>
              </div>
              {u.id === user.id && <Check className="size-4 text-brand-600" />}
            </button>
          ))}
          <div className="px-3 pt-2 pb-1 text-[11px] text-muted border-t border-slate-100 mt-1">
            Demo users from the backend seed data. No auth — userId is sent on every request.
          </div>
        </div>
      )}
    </div>
  );
}
