'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  QrCode,
  LayoutDashboard,
  PlusCircle,
  HardDrive,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const navItems = [
    { label: 'Ringkasan', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Buat QR Baru', href: '/qr/new', icon: PlusCircle },
    { label: 'Penyimpanan', href: '/storage', icon: HardDrive },
    { label: 'Pengaturan', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[var(--bg-surface)] border-r border-[var(--border-color)] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 border-b border-[var(--border-color)] flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[var(--text-primary)]">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shadow-xs">
              <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-outfit font-extrabold text-white">
              Mi<span className="text-orange-500">QR</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            id="btn-close-sidebar"
            aria-label="Tutup menu navigasi"
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 font-bold shadow-xs border border-orange-200 dark:border-orange-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User info & Logout */}
        <div className="p-4 border-t border-[var(--border-color)] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-950 dark:to-amber-950 text-orange-700 dark:text-orange-300 flex items-center justify-center font-bold text-sm border border-orange-200 dark:border-orange-800">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {currentUser?.name || 'Pengguna MiQR'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || ''}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            id="btn-logout"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-[var(--bg-surface)]/85 backdrop-blur-md border-b border-[var(--border-color)] px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              id="btn-open-sidebar"
              className="md:hidden p-2 rounded-lg border border-[var(--border-color)] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="md:hidden flex items-center gap-2">
              <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-6 h-6 object-contain" />
              <span className="font-outfit font-extrabold text-sm text-white">Mi<span className="text-orange-500">QR</span></span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sesi Terenkripsi & Cloud Mandiri</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/qr/new"
              id="header-btn-create"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Buat QR</span>
            </Link>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
