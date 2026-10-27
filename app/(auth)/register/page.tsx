'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { QrCode, Lock, Mail, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan saat pendaftaran.');
        setLoading(false);
        return;
      }

      // Berhasil register & auto-login via cookie
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Gagal menghubungi server. Silakan coba beberapa saat lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-primary)] p-4 relative">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8 space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-2xl tracking-tight text-[var(--text-primary)]">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shadow-sm">
              <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-outfit font-extrabold tracking-tight text-white">
              Mi<span className="text-orange-500">QR</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-outfit text-white">Daftar Akun Baru</h1>
          <p className="text-sm text-slate-400 font-medium">Dapatkan kuota cloud 100 MB mandiri secara gratis</p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl shadow-orange-500/5 space-y-6">
          {error && (
            <div id="register-error-alert" role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                />
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Akun...</span>
                </>
              ) : (
                <>
                  <span>Daftar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[var(--border-color)] text-center text-sm text-slate-400 font-medium">
            Sudah memiliki akun?{' '}
            <Link href="/login" id="link-to-login" className="font-semibold text-orange-400 hover:underline">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
