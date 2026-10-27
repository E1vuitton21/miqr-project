'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import {
  QrCode as QrIcon,
  Palette,
  Sliders,
  Image as ImageIcon,
  Download,
  CloudUpload,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Wifi,
  Contact,
  Globe,
  FileText,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { calculateContrastRatio, ContrastResult } from '@/lib/qr/contrast';
import { formatWifiPayload, formatVCardPayload, formatEmailPayload, formatPhonePayload } from '@/lib/qr/parser';

export default function NewQrPage() {
  const router = useRouter();

  // Basic info
  const [name, setName] = useState('My QR Code');
  const [contentType, setContentType] = useState<'URL' | 'TEXT' | 'WIFI' | 'VCARD' | 'EMAIL' | 'PHONE'>('URL');

  // Payload subfields
  const [urlInput, setUrlInput] = useState('https://miqr.example.com');
  const [textInput, setTextInput] = useState('');
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Design config
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [foreground, setForeground] = useState('#000000');
  const [background, setBackground] = useState('#FFFFFF');
  const [margin, setMargin] = useState(4);
  const [dotsStyle, setDotsStyle] = useState<'SQUARE' | 'ROUNDED' | 'DOTS'>('SQUARE');

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);

  // States
  const [contrast, setContrast] = useState<ContrastResult>({
    ratio: 21,
    isGood: true,
    level: 'EXCELLENT',
    message: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Canvas ref for live preview
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate compiled payload
  const getCompiledPayload = useCallback(() => {
    switch (contentType) {
      case 'URL':
        return urlInput.startsWith('http://') || urlInput.startsWith('https://') ? urlInput : `https://${urlInput}`;
      case 'TEXT':
        return textInput || 'Sample QR Text';
      case 'WIFI':
        return formatWifiPayload({ ssid: wifiSsid || 'MyWifi', security: wifiSecurity, password: wifiPassword });
      case 'VCARD':
        return formatVCardPayload({ fullName: vcardName || 'Nama Kontak', phone: vcardPhone, email: vcardEmail, organization: vcardOrg });
      case 'EMAIL':
        return formatEmailPayload(emailTo || 'halo@example.com', emailSubject, emailBody);
      case 'PHONE':
        return formatPhonePayload(phoneInput || '+6281234567890');
      default:
        return 'MiQR Generator';
    }
  }, [contentType, urlInput, textInput, wifiSsid, wifiPassword, wifiSecurity, vcardName, vcardPhone, vcardEmail, vcardOrg, emailTo, emailSubject, emailBody, phoneInput]);

  // Update contrast evaluation
  useEffect(() => {
    const res = calculateContrastRatio(foreground, background);
    setContrast(res);
  }, [foreground, background]);

  // Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran logo maksimal 2 MB');
      return;
    }

    if (!file.type.match(/image\/(png|jpeg|webp)/)) {
      alert('Format logo harus PNG, JPEG, atau WebP. Format SVG mentah dilarang untuk keamanan.');
      return;
    }

    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(objectUrl);

    // Otomatis sarankan error correction Q atau H saat logo digunakan
    if (errorCorrection === 'L' || errorCorrection === 'M') {
      setErrorCorrection('Q');
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
      setLogoPreviewUrl(null);
    }
  };

  // Render Client-Side Live Preview on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const payload = getCompiledPayload();

    QRCode.toCanvas(
      canvas,
      payload,
      {
        width: 380,
        margin,
        color: {
          dark: foreground,
          light: background,
        },
        errorCorrectionLevel: logoPreviewUrl ? (errorCorrection === 'L' ? 'Q' : errorCorrection) : errorCorrection,
      },
      (err) => {
        if (err) {
          console.error('Canvas render error:', err);
          return;
        }

        // Jika ada logo, tempelkan di tengah canvas dengan white pad
        if (logoPreviewUrl) {
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const img = new Image();
          img.onload = () => {
            const logoSize = Math.floor(canvas.width * 0.22);
            const padSize = Math.floor(logoSize * 1.15);
            const padX = (canvas.width - padSize) / 2;
            const padY = (canvas.height - padSize) / 2;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = (canvas.height - logoSize) / 2;

            // Draw white background pad for logo
            ctx.fillStyle = background === '#FFFFFF' ? '#FFFFFF' : '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(padX, padY, padSize, padSize, 12);
            ctx.fill();

            // Draw logo inside
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          };
          img.src = logoPreviewUrl;
        }
      }
    );
  }, [getCompiledPayload, foreground, background, margin, errorCorrection, logoPreviewUrl]);

  // Client-Side Fast Download
  const handleClientDownload = (size: number, label: string) => {
    const payload = getCompiledPayload();
    const tempCanvas = document.createElement('canvas');

    QRCode.toCanvas(
      tempCanvas,
      payload,
      {
        width: size,
        margin,
        color: { dark: foreground, light: background },
        errorCorrectionLevel: logoPreviewUrl ? (errorCorrection === 'L' ? 'Q' : errorCorrection) : errorCorrection,
      },
      (err) => {
        if (err) {
          alert('Gagal membuat file unduhan');
          return;
        }

        const downloadAction = (c: HTMLCanvasElement) => {
          const a = document.createElement('a');
          a.download = `${name.replace(/\s+/g, '_')}_${label}.png`;
          a.href = c.toDataURL('image/png');
          a.click();
        };

        if (logoPreviewUrl) {
          const ctx = tempCanvas.getContext('2d');
          if (!ctx) return;
          const img = new Image();
          img.onload = () => {
            const logoSize = Math.floor(tempCanvas.width * 0.22);
            const padSize = Math.floor(logoSize * 1.15);
            const padX = (tempCanvas.width - padSize) / 2;
            const padY = (tempCanvas.height - padSize) / 2;
            const logoX = (tempCanvas.width - logoSize) / 2;
            const logoY = (tempCanvas.height - logoSize) / 2;

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.roundRect(padX, padY, padSize, padSize, Math.floor(padSize * 0.15));
            ctx.fill();
            ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

            downloadAction(tempCanvas);
          };
          img.src = logoPreviewUrl;
        } else {
          downloadAction(tempCanvas);
        }
      }
    );
  };

  // SVG Download Client-side
  const handleSvgDownload = async () => {
    try {
      const payload = getCompiledPayload();
      const svg = await QRCode.toString(payload, {
        type: 'svg',
        width: 1024,
        margin,
        color: { dark: foreground, light: background },
        errorCorrectionLevel: errorCorrection,
      });

      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.download = `${name.replace(/\s+/g, '_')}_vector.svg`;
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Gagal mengunduh SVG');
    }
  };

  // Submit to Server Cloud Storage
  const handleSaveToCloud = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);

    try {
      const payload = getCompiledPayload();

      const formData = new FormData();
      formData.append('name', name);
      formData.append('contentType', contentType);
      formData.append('payload', payload);
      formData.append('errorCorrection', errorCorrection);
      formData.append('foreground', foreground);
      formData.append('background', background);
      formData.append('width', '1024');
      formData.append('margin', margin.toString());
      formData.append('dotsStyle', dotsStyle);
      formData.append('fileFormat', 'PNG');

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      const res = await fetch('/api/qr', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal menyimpan ke cloud');
        setSaving(false);
        return;
      }

      setSuccessMsg('QR Code berhasil disimpan ke cloud MiQR!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1000);
    } catch {
      setErrorMsg('Terjadi kesalahan jaringan saat menyimpan.');
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
          Studio Generator QR Code
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Kustomisasi visual QR Code dengan evaluasi kontras dan live preview instan di browser
        </p>
      </div>

      {/* 2-Panel Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PANEL KIRI: Konfigurasi Form (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Nama & Tipe Konten */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <QrIcon className="w-4 h-4 text-blue-600" />
              <span>1. Nama & Jenis Konten</span>
            </h2>

            <div className="space-y-1.5">
              <label htmlFor="qr-name-input" className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Nama QR Code
              </label>
              <input
                id="qr-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Menu Resto Cabang Jakarta"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
              />
            </div>

            {/* Type selector pill buttons */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">
                Pilih Tipe Konten
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[
                  { type: 'URL', label: 'URL Web', icon: Globe },
                  { type: 'TEXT', label: 'Teks', icon: FileText },
                  { type: 'WIFI', label: 'Wi-Fi', icon: Wifi },
                  { type: 'VCARD', label: 'Kontak', icon: Contact },
                  { type: 'EMAIL', label: 'Email', icon: Mail },
                  { type: 'PHONE', label: 'Telepon', icon: Phone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = contentType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      id={`type-btn-${item.type.toLowerCase()}`}
                      onClick={() => setContentType(item.type as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 shadow-xs font-bold'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] text-slate-600 dark:text-slate-400 hover:border-orange-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Content Form Inputs */}
            <div className="pt-2">
              {contentType === 'URL' && (
                <div className="space-y-1.5">
                  <label htmlFor="url-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                    URL Website Tujuan
                  </label>
                  <input
                    id="url-input"
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)] font-mono"
                  />
                </div>
              )}

              {contentType === 'TEXT' && (
                <div className="space-y-1.5">
                  <label htmlFor="text-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Teks Bebas / Pesan
                  </label>
                  <textarea
                    id="text-input"
                    rows={3}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Tuliskan pesan atau catatan yang akan muncul saat QR discan..."
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                  />
                </div>
              )}

              {contentType === 'WIFI' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="wifi-ssid-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Nama Jaringan (SSID)
                    </label>
                    <input
                      id="wifi-ssid-input"
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="Misal: KafeKopi_FreeWifi"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="wifi-password-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Password Wi-Fi
                      </label>
                      <input
                        id="wifi-password-input"
                        type="text"
                        value={wifiPassword}
                        onChange={(e) => setWifiPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="wifi-sec-select" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Keamanan
                      </label>
                      <select
                        id="wifi-sec-select"
                        value={wifiSecurity}
                        onChange={(e) => setWifiSecurity(e.target.value as any)}
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      >
                        <option value="WPA">WPA / WPA2 (Umum)</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Tanpa Password</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {contentType === 'VCARD' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="vcard-name-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Nama Lengkap
                      </label>
                      <input
                        id="vcard-name-input"
                        type="text"
                        value={vcardName}
                        onChange={(e) => setVcardName(e.target.value)}
                        placeholder="Dr. Andi Pratama"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="vcard-phone-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Nomor Ponsel
                      </label>
                      <input
                        id="vcard-phone-input"
                        type="tel"
                        value={vcardPhone}
                        onChange={(e) => setVcardPhone(e.target.value)}
                        placeholder="+628123456789"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="vcard-email-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Email Kontak
                      </label>
                      <input
                        id="vcard-email-input"
                        type="email"
                        value={vcardEmail}
                        onChange={(e) => setVcardEmail(e.target.value)}
                        placeholder="andi@kantor.com"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="vcard-org-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                        Perusahaan / Organisasi
                      </label>
                      <input
                        id="vcard-org-input"
                        type="text"
                        value={vcardOrg}
                        onChange={(e) => setVcardOrg(e.target.value)}
                        placeholder="PT Maju Bersama"
                        className="w-full px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {contentType === 'EMAIL' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="email-to-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Tujuan Email
                    </label>
                    <input
                      id="email-to-input"
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="kontak@perusahaan.com"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="email-sub-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                      Subjek Email
                    </label>
                    <input
                      id="email-sub-input"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Pertanyaan Produk"
                      className="w-full px-3.5 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
              )}

              {contentType === 'PHONE' && (
                <div className="space-y-1.5">
                  <label htmlFor="phone-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                    Nomor Telepon
                  </label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+628123456789"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:border-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Error Correction Level */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>2. Error Correction Level</span>
              </h2>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Toleransi Kerusakan</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { level: 'L', title: 'Low (~7%)', desc: 'Kapasitas data maksimal' },
                { level: 'M', title: 'Medium (~15%)', desc: 'Pilihan umum seimbang' },
                { level: 'Q', title: 'Quartile (~25%)', desc: 'Disarankan jika ada logo' },
                { level: 'H', title: 'High (~30%)', desc: 'Toleransi tertinggi' },
              ].map((item) => (
                <button
                  key={item.level}
                  type="button"
                  id={`ec-btn-${item.level.toLowerCase()}`}
                  onClick={() => setErrorCorrection(item.level as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    errorCorrection === item.level
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 shadow-xs'
                      : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-[var(--border-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--text-primary)]">{item.level}</span>
                    {errorCorrection === item.level && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] font-semibold text-[var(--text-primary)] mt-1">{item.title}</p>
                  <p className="text-[10px] text-[var(--text-muted)] leading-tight mt-0.5">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Card 3: Warna & Evaluasi Kontras WCAG */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>3. Kustomisasi Warna & Kontras</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Foreground Color */}
              <div className="space-y-1.5">
                <label htmlFor="color-fg-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Warna QR (Foreground)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="color-fg-picker"
                    type="color"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[var(--border-color)] p-0.5 cursor-pointer bg-transparent"
                  />
                  <input
                    id="color-fg-input"
                    type="text"
                    value={foreground}
                    onChange={(e) => setForeground(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label htmlFor="color-bg-input" className="block text-xs font-semibold text-[var(--text-secondary)]">
                  Warna Latar (Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="color-bg-picker"
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-10 h-10 rounded-lg border border-[var(--border-color)] p-0.5 cursor-pointer bg-transparent"
                  />
                  <input
                    id="color-bg-input"
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] font-mono text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </div>

            {/* Widget Evaluasi Kontras WCAG */}
            <div
              id="wcag-contrast-badge"
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                contrast.isGood
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
              }`}
            >
              {contrast.isGood ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <p className="font-semibold">{contrast.message}</p>
                <p className="text-[11px] opacity-80">
                  Standar WCAG merekomendasikan rasio luminansi minimal 4.5:1 agar barcode dapat dibaca dengan stabil oleh sensor kamera ponsel.
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Logo Overlay */}
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>4. Logo Overlay (Opsional)</span>
              </h2>
              <span className="text-[11px] text-[var(--text-muted)]">PNG, JPEG, WebP (Maks 2MB)</span>
            </div>

            {logoPreviewUrl ? (
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-white border p-1 flex items-center justify-center shadow-xs">
                    <img src={logoPreviewUrl} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-xs">
                      {logoFile?.name || 'Logo Terunggah'}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {(logoFile?.size ? (logoFile.size / 1024).toFixed(1) : 0)} KB • EXIF dibersihkan
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-remove-logo"
                  onClick={removeLogo}
                  className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Hapus</span>
                </button>
              </div>
            ) : (
              <label
                htmlFor="logo-file-input"
                className="border-2 border-dashed border-[var(--border-color)] hover:border-blue-500 rounded-xl p-5 text-center block cursor-pointer transition-colors bg-[var(--bg-primary)]"
              >
                <CloudUpload className="w-7 h-7 text-[var(--text-muted)] mx-auto mb-2" />
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Pilih file logo dari perangkat</span>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Logo akan ditempatkan di tengah QR Code dengan bantalan pelindung kontras otomatis.
                </p>
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* PANEL KANAN: Sticky Live Preview & Ekspor (5 Kolom) */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-lg shadow-slate-900/5 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Live Preview Instan</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                0ms Browser Render
              </span>
            </div>

            {/* Canvas Box */}
            <div className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-color)] flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                id="qr-preview-canvas"
                className="max-w-full h-auto rounded-xl shadow-md border border-[var(--border-color)]"
              />
            </div>

            {/* Error & Success Messages */}
            {errorMsg && (
              <div role="alert" className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div role="alert" className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tombol Utama: Simpan ke Cloud MiQR */}
            <button
              type="button"
              id="btn-save-to-cloud"
              disabled={saving}
              onClick={handleSaveToCloud}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses & Menyimpan ke Cloud...</span>
                </>
              ) : (
                <>
                  <CloudUpload className="w-4 h-4" />
                  <span>Simpan ke Cloud MiQR</span>
                </>
              )}
            </button>

            {/* Unduh Cepat Client-Side (Tanpa Simpan) */}
            <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Unduh Cepat Langsung (Client-Side):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-download-512"
                  onClick={() => handleClientDownload(512, '512px')}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-orange-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>512px PNG</span>
                </button>
                <button
                  type="button"
                  id="btn-download-1024"
                  onClick={() => handleClientDownload(1024, '1024px')}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-orange-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>1024px PNG</span>
                </button>
                <button
                  type="button"
                  id="btn-download-svg"
                  onClick={handleSvgDownload}
                  className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-orange-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                  <span>Vektor SVG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
