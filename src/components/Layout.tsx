import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex flex-col min-h-full bg-cream-100">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-brand-800/10 py-8 mt-16">
        <div className="mx-auto max-w-[1400px] px-6 text-xs text-muted text-center">
          FirstClub Membership · Demo frontend · Backend API on <code className="font-mono">:8080</code>
        </div>
      </footer>
    </div>
  );
}
