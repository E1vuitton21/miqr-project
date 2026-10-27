'use client';

import { useState, useEffect } from 'react';
import { HardDrive, ShieldCheck, Database, Layers, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface QuotaData {
  quotaBytes: number;
  usedBytes: number;
  availableBytes: number;
  percentUsed: number;
}

export default function StoragePage() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/storage')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setQuota(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-[var(--text-primary)]">
          Penyimpanan Cloud Mandiri
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Pantau batas kuota dan kapasitas berkas QR Code Anda
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Quota Card */}
          <div className="glass-card p-8 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xl shadow-orange-500/5 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-outfit text-slate-900 dark:text-white">Status Kuota Aset</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Persistent Volume Docker Terenkripsi</p>
                </div>
              </div>
              <span className="text-sm font-bold text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-900/50">
                {quota?.percentUsed || 0}% Terpakai
              </span>
            </div>

            {/* Big Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-[var(--border-color)] rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(quota?.percentUsed || 0, 1)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                <span>Terpakai: {quota ? formatBytes(quota.usedBytes) : '0 MB'}</span>
                <span>Total Kuota: {quota ? formatBytes(quota.quotaBytes) : '100 MB'}</span>
              </div>
            </div>

            {/* Metric Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sisa Kapasitas Tersedia</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {quota ? formatBytes(quota.availableBytes) : '100 MB'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mekanisme Pengurangan Kuota</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-orange-600" />
                  <span>Atomic PostgreSQL Guard</span>
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4">
            <h3 className="text-base font-bold font-outfit text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-600" />
              <span>Bagaimana Kuota Dihitung?</span>
            </h3>
            <ul className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium space-y-2 list-disc list-inside">
              <li>Setiap file master PNG atau SVG yang disimpan dihitung sesuai ukuran fisik filenya.</li>
              <li>Logo kustom yang diunggah dikompresi dan disimpan secara terpisah, sehingga pemakaian kuota tetap minimal.</li>
              <li>Jika Anda menghapus QR Code dari dashboard, kuota penyimpanan akan dipulihkan secara instan dan otomatis.</li>
              <li>Unduhan langsung (*client-side*) tidak memakan kuota penyimpanan cloud.</li>
            </ul>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
              >
                <span>Kelola Aset di Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
