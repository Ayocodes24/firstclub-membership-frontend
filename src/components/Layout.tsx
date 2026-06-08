import { Outlet } from 'react-router-dom';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex flex-col min-h-full">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="mx-auto max-w-7xl px-6 text-xs text-muted text-center">
          FirstClub Membership · Demo frontend · Backend API on <code>:8080</code>
        </div>
      </footer>
    </div>
  );
}
