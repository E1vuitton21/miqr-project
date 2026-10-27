'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  QrCode,
  PlusCircle,
  HardDrive,
  Search,
  Download,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface QrItem {
  id: string;
  name: string;
  contentType: string;
  payload: string;
  errorCorrection: string;
  foreground: string;
  background: string;
  width: number;
  margin: number;
  dotsStyle: string;
  fileFormat: string;
  fileSize: number;
  logoSize: number;
  createdAt: string;
}

interface QuotaData {
  quotaBytes: number;
  usedBytes: number;
  availableBytes: number;
  percentUsed: number;
}

export default function DashboardPage() {
  const [items, setItems] = useState<QrItem[]>([]);
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (typeFilter) query.append('contentType', typeFilter);

      const [qrRes, quotaRes] = await Promise.all([
        fetch(`/api/qr?${query.toString()}`),
        fetch('/api/storage'),
      ]);

      if (qrRes.ok) {
        const qrData = await qrRes.json();
        setItems(qrData.items || []);
      }

      if (quotaRes.ok) {
        const qData = await quotaRes.json();
        setQuota(qData);
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus QR Code "${name}"? Kuota penyimpanan akan dipulihkan.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/qr/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setToastMessage(`QR Code "${name}" berhasil dihapus.`);
        setTimeout(() => setToastMessage(null), 3000);
        fetchData();
      } else {
        alert('Gagal menghapus QR Code');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-emerald-600 text-white shadow-xl flex items-center gap-2.5 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Stats */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Dashboard Ringkasan
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Kelola, pantau penyimpanan, dan unduh seluruh kode QR Anda
            </p>
          </div>

          <Link
            href="/qr/new"
            id="btn-create-qr-dashboard"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-all shadow-md shadow-orange-500/25 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat QR Code Baru</span>
          </Link>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Metric 1 */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-3 glass-card hover:border-orange-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Total QR Disimpan
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <QrCode className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white" id="stat-total-qr">
              {items.length} Kode
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Penyimpanan volume privat aktif</span>
            </p>
          </div>

          {/* Metric 2 */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-3 glass-card hover:border-emerald-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Pemakaian Kuota Cloud
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white" id="stat-storage-used">
              {quota ? formatBytes(quota.usedBytes) : '0 MB'}
            </div>
            <div className="w-full bg-[var(--border-color)] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${quota?.percentUsed || 0}%` }}
              />
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-3 glass-card hover:border-purple-400/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sisa Kapasitas Kuota
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white" id="stat-storage-available">
              {quota ? formatBytes(quota.availableBytes) : '100 MB'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dari total kuota default 100 MB
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="search-input"
            type="text"
            placeholder="Cari berdasarkan nama QR atau isi payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            id="filter-type-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-900 dark:text-white focus:border-orange-500 cursor-pointer outline-none"
          >
            <option value="">Semua Tipe Konten</option>
            <option value="URL">URL / Website</option>
            <option value="TEXT">Teks Biasa</option>
            <option value="WIFI">Wi-Fi Network</option>
            <option value="VCARD">Kontak vCard</option>
            <option value="EMAIL">Email</option>
            <option value="PHONE">Nomor Telepon</option>
          </select>
        </div>
      </div>

      {/* QR Code Cards Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-sm font-medium">Memuat aset QR Code...</p>
        </div>
      ) : items.length === 0 ? (
        /* Empty State */
        <div className="py-16 px-4 rounded-2xl border-2 border-dashed border-[var(--border-color)] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 flex items-center justify-center mx-auto shadow-xs">
            <QrCode className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Belum Ada QR Code Tersimpan</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {search || typeFilter
                ? 'Tidak ditemukan QR Code yang cocok dengan kriteria pencarian Anda.'
                : 'Mulai buat QR Code kustom pertama Anda dengan error correction L/M/Q/H dan simpan ke cloud MiQR.'}
            </p>
          </div>
          <div>
            <Link
              href="/qr/new"
              id="empty-cta-create"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold transition-all shadow-md shadow-orange-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat QR Code Pertama</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Grid of QR Code cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="qr-items-grid">
          {items.map((qr) => (
            <div
              key={qr.id}
              className="p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-900/40">
                      {qr.contentType}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white truncate" title={qr.name}>
                      {qr.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-elevated)] text-slate-600 dark:text-slate-400 border border-[var(--border-color)]">
                    EC: {qr.errorCorrection}
                  </span>
                </div>

                {/* Payload snippet */}
                <div className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-mono line-clamp-2 break-all">
                    {qr.payload}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(qr.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                  <span>{formatBytes(qr.fileSize + qr.logoSize)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                <a
                  href={`/api/qr/${qr.id}/download`}
                  download
                  id={`btn-download-${qr.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-orange-50 dark:bg-orange-950/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh {qr.fileFormat}</span>
                </a>

                <button
                  onClick={() => handleDelete(qr.id, qr.name)}
                  disabled={deletingId === qr.id}
                  id={`btn-delete-${qr.id}`}
                  title="Hapus QR Code"
                  className="p-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {deletingId === qr.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
