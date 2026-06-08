import { Link, NavLink } from 'react-router-dom';
import { UserSwitcher } from './UserSwitcher';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative text-sm font-medium transition px-1 ${
    isActive
      ? 'text-brand-800 after:absolute after:left-0 after:right-0 after:-bottom-1.5 after:h-0.5 after:bg-brand-800 after:rounded-full'
      : 'text-ink/80 hover:text-brand-800'
  }`;

export function Header() {
  return (
    <div className="sticky top-0 z-40 header-capsule">
      <div className="bg-cream-50 border border-brand-800/25 rounded-full pl-6 pr-2 h-16 flex items-center justify-between shadow-soft">
        {/* Wordmark */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="size-7 grid place-items-center">
            {/* Tiny leaf glyph */}
            <svg viewBox="0 0 24 24" className="size-5 text-brand-800" fill="currentColor">
              <path d="M12 2C7 4 4 8 4 13c0 5 4 9 8 9V2z" opacity="0.85"/>
              <path d="M12 2v20c4 0 8-4 8-9 0-5-3-9-8-11z"/>
            </svg>
          </span>
          <span className="font-display font-bold text-xl tracking-tight text-brand-800 uppercase">
            Firstclub
          </span>
          <span className="hidden sm:inline text-sm text-muted ml-1">Membership</span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-10">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/membership" className={navLinkClass}>My Membership</NavLink>
          <NavLink to="/subscribe" className={navLinkClass}>Subscribe</NavLink>
          <NavLink to="/simulator" className={navLinkClass}>Simulator</NavLink>
        </nav>

        {/* Right side: user switcher styled as primary pill */}
        <UserSwitcher />
      </div>
    </div>
  );
}
