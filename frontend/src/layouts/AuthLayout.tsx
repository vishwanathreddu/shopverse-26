import { Link, Outlet } from 'react-router-dom';

/** Minimal layout for login / register */
export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4">
        <Link to="/" className="font-display text-xl font-bold text-brand-700">
          ShopVerse
        </Link>
      </header>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
