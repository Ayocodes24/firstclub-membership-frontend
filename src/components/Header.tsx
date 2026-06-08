import { Link, NavLink } from 'react-router-dom';
import { UserSwitcher } from './UserSwitcher';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition ${
    isActive ? 'text-brand-600' : 'text-ink hover:text-brand-600'
  }`;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-brand-600 text-white grid place-items-center font-extrabold text-lg">
            F
          </div>
          <span className="font-bold text-lg tracking-tight">
            FirstClub <span className="text-brand-600">Membership</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/membership" className={navLinkClass}>My Membership</NavLink>
          <NavLink to="/subscribe" className={navLinkClass}>Subscribe</NavLink>
          <NavLink to="/simulator" className={navLinkClass}>Simulator</NavLink>
        </nav>
        <UserSwitcher />
      </div>
    </header>
  );
}
