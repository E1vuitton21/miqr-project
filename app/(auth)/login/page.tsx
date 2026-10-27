'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat login.');
        setLoading(false);
        return;
      }

      // Berhasil login
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server. Pastikan koneksi internet stabil.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] p-4 relative">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-md">
              <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-9 h-9 object-contain" />
            </div>
            <span className="font-outfit font-extrabold tracking-tight text-white text-2xl">
              Mi<span className="text-orange-500">QR</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-outfit text-white">Masuk ke Akun Anda</h1>
          <p className="text-sm text-slate-400">Kelola dan amankan seluruh aset QR Code Anda</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl shadow-slate-900/5 space-y-6 glass-card">
          {error && (
            <div id="login-error-alert" role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 glow-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Sesi...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--border-color)] text-center text-sm text-slate-400">
            Belum punya akun?{' '}
            <Link href="/register" id="link-to-register" className="font-bold text-orange-400 hover:underline">
              Daftar akun gratis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
