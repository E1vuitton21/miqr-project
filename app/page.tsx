import Link from 'next/link';
import { QrCode, Shield, Zap, Database, Download, Palette, ArrowRight, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--bg-surface)]/85 border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-[var(--text-primary)]">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-1 shadow-sm">
              <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-outfit font-extrabold tracking-tight text-white text-xl">
              Mi<span className="text-orange-500">QR</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#fitur" className="hover:text-orange-400 transition-colors">Fitur Unggulan</a>
            <a href="#keamanan" className="hover:text-orange-400 transition-colors">Keamanan Siber</a>
            <a href="#spesifikasi" className="hover:text-orange-400 transition-colors">Spesifikasi</a>
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/dashboard"
                id="btn-nav-dashboard"
                className="glow-btn px-4 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-500/25 flex items-center gap-1.5"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  id="btn-nav-login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  id="btn-nav-register"
                  className="glow-btn px-4 py-2 text-sm font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-md shadow-orange-500/20"
                >
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-orange-500/15 via-amber-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-orange-950/60 text-orange-300 border border-orange-800/60 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Next-Gen Self-Hosted QR Code Studio</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-outfit text-white leading-[1.15]">
                Generate QR Code Profesional, Aman &{' '}
                <span className="text-orange-500">
                  Bebas Ketergantungan Berbayar
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 leading-relaxed font-normal">
                Buat QR Code dengan koreksi kesalahan L/M/Q/H, logo overlay terproteksi, pengecekan kontras WCAG otomatis, dan penyimpanan cloud mandiri berkeamanan tinggi.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  href={session ? '/qr/new' : '/register'}
                  id="hero-cta-create"
                  className="glow-btn w-full sm:w-auto px-7 py-3.5 text-base font-semibold rounded-xl bg-orange-600 hover:bg-orange-700 text-white shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Mulai Buat QR Code Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#fitur"
                  className="w-full sm:w-auto px-6 py-3.5 text-base font-semibold rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-white transition-all flex items-center justify-center cursor-pointer shadow-xs"
                >
                  Pelajari Fitur
                </a>
              </div>

              {/* Badges checklist */}
              <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>100% Zero-Paid Dependency</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Proteksi OWASP Top 10</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ekspor High-Res PNG & SVG</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Kuota Cloud 100 MB Mandiri</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section id="fitur" className="py-20 bg-[var(--bg-surface)] border-y border-[var(--border-color)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                Semua yang Anda Butuhkan dalam Satu Platform
              </h2>
              <p className="text-[var(--text-secondary)]">
                Dirancang khusus dengan standar industri untuk performa maksimal dan keterbacaan scan tanpa cela.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Client-Side Live Preview</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Perubahan warna, teks, dan margin di-render instan di browser via Canvas tanpa lag dan tanpa membebani disk server.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Evaluator Kontras WCAG</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Sistem secara otomatis menghitung rasio kontras luminansi warna dan memberi peringatan jika kontras di bawah 4.5:1.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Logo Overlay Terproteksi</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Pembersihan metadata EXIF dan mitigasi decompression bomb via Sharp. Menolak SVG berbahaya demi mencegah celah Stored XSS.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Database className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Atomic Quota Deduction</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Kuota 100 MB per user dipotong secara kondisional di PostgreSQL untuk mengeliminasi celah race condition / TOCTOU.
                </p>
              </div>

              {/* Card 5 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Download className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Preset Ekspor Siap Cetak</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Opsi unduhan 1-klik: Media Sosial (512px), Cetak Dokumen (1024px), dan Vektor Skalabel (SVG) untuk kebutuhan percetakan baliho.
                </p>
              </div>

              {/* Card 6 */}
              <div className="p-7 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--primary)] transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Isolasi Hak Akses (Anti-IDOR)</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  Aset disimpan di volume privat server. Pengguna lain tidak dapat melihat, memodifikasi, atau mengunduh QR Code Anda.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Architecture Callout */}
        <section id="keamanan" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Hardened Architecture</span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Dirancang Khusus Berdasarkan Standar OWASP Top 10
                </h2>

                <p className="text-slate-300 leading-relaxed">
                  MiQR menerapkan hashing password Argon2id/Bcrypt, cookie sesi HttpOnly/Secure/SameSite, rate limiting via Redis, parameterized queries via Prisma, sanitasi upload berbasis magic bytes, dan container non-root di balik reverse proxy Caddy dengan TLS otomatis.
                </p>

                <div className="pt-2">
                  <Link
                    href={session ? '/dashboard' : '/register'}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <span>Coba MiQR Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Decorative graphic */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:flex items-center justify-center pointer-events-none opacity-20">
                <Shield className="w-80 h-80 text-white" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1E293B] bg-[#0E1424] py-8 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 font-bold text-white">
            <img src="/brand/MiQR.png" alt="MiQR Logo" className="w-6 h-6 object-contain" />
            <span>Mi<span className="text-orange-500">QR</span> Platform &copy; 2026. Self-Hosted & Secure.</span>
          </div>
          <div className="flex items-center gap-6 font-medium text-slate-300">
            <Link href="/login" className="hover:text-orange-400 transition-colors">Login</Link>
            <Link href="/register" className="hover:text-orange-400 transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-orange-400 transition-colors">Dashboard</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
