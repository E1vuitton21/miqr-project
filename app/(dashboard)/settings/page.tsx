'use client';

import { useState, useEffect } from 'react';
import { User, Shield, Moon, Lock, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [user, setUser] = useState<{ name: string; email: string; createdAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-[var(--text-primary)]">
          Pengaturan Akun & Preferensi
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Kelola profil pengguna dan tinjau status keamanan akun
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Card 1: Profil Akun */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <h2 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-orange-600" />
              <span>Profil Pengguna</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Nama Lengkap</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white" id="profile-name">
                  {user?.name || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Email Terdaftar</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono" id="profile-email">
                  {user?.email || '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tanggal Bergabung</span>
                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tipe Akun</span>
                <div>
                  <p className="text-xs font-bold text-white bg-slate-900 dark:bg-orange-600 px-3 py-1 rounded-full inline-block shadow-xs">
                    Self-Hosted Core Edition
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Tema Sistem Eksklusif */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
                  <Moon className="w-4 h-4 text-orange-400" />
                  <span>Tema Sistem</span>
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Antarmuka eksklusif Cyber Midnight Dark Mode aktif secara permanen
                </p>
              </div>
              <span id="badge-dark-mode" className="text-xs font-bold text-orange-400 bg-orange-950/60 border border-orange-800/60 px-3 py-1 rounded-full">
                Dark Mode Eksklusif
              </span>
            </div>
          </div>

          {/* Card 3: Keamanan Siber (OWASP Status) */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <h2 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Status Proteksi Keamanan Siber</span>
            </h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <p className="font-bold">Hashing Password Argon2id / Bcrypt Aktif</p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">Password disimpan dalam bentuk hash kriptografi dengan salt round tinggi. Teks password asli tidak pernah disimpan.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-900 dark:text-orange-200 text-xs">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-orange-600" />
                <div>
                  <p className="font-bold">Cookie Sesi HttpOnly & SameSite=Lax</p>
                  <p className="text-[11px] text-orange-800 dark:text-orange-300 mt-0.5">Token sesi dilindungi dari script injeksi sisi klien (XSS Protection) dan serangan Cross-Site Request Forgery (CSRF).</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200 text-xs">
                <Shield className="w-4 h-4 shrink-0 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-bold">Rate Limiting Redis & Sanitasi Upload Aktif</p>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-0.5">Endpoint dibatasi untuk mencegah brute force dan file upload dibersihkan dari metadata berbahaya via Sharp.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
