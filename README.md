# MiQR — Platform Generator & Cloud Storage QR Code Mandiri

<p align="center">
  <img src="public/brand/MiQR.png" alt="MiQR Official Logo" width="120" />
</p>

<p align="center">
  <strong>Solusi Enterprise-Grade QR Code Mandiri Bebas Biaya Langganan & Batasan Scan</strong>
</p>

<p align="center">
  <a href="#fitur-utama">Fitur Utama</a> •
  <a href="#arsitektur-teknologi">Arsitektur</a> •
  <a href="#persyaratan-sistem">Prasyarat</a> •
  <a href="#cara-instalasi--menjalankan">Instalasi</a> •
  <a href="#pengujian--quality-engineering">Pengujian (QE)</a> •
  <a href="#struktur-direktori">Struktur Proyek</a>
</p>

---

## 🚀 Gambaran Proyek

**MiQR** adalah aplikasi web modern berbasis Next.js 16 (App Router), PostgreSQL 16, Redis 7, dan Caddy Reverse Proxy yang dirancang untuk menghasilkan, mengkustomisasi, dan menyimpan aset QR Code secara mandiri (self-hosted). Aplikasi ini menghilangkan ketergantungan pada vendor SaaS pihak ketiga berbayar dengan memberikan kontrol penuh atas data dan kuota penyimpanan persisten.

---

## ✨ Fitur Utama

- **Studio Generator QR Code Interaktif**:
  - Live preview instan berbasis HTML5 Canvas di browser (0ms server latency).
  - Pilihan Level Koreksi Kesalahan (*Error Correction*): Low (7%), Medium (15%), Quartile (25%), High (30%).
  - Dukungan beragam tipe konten: URL Website, Teks Bebas, Wi-Fi Network (WPA/WEP/Open), Kontak vCard, Email (mailto), dan Nomor Telepon (tel).
  - Kalkulator rasio kontras visual otomatis berstandar WCAG AA/AAA untuk menjamin keterbacaan scanner fisik di lapangan.
  - Dukungan penyematan logo kustom di tengah QR dengan bantalan pelindung kontras otomatis (*logo contrast buffer*).
  - Ekspor multi-resolusi instan: 512px PNG, 1024px PNG, dan Vektor SVG tanpa batas.
- **Penyimpanan Cloud Mandiri (Self-Hosted Storage)**:
  - Kuota kuantitatif terisolasi per akun (default 100 MB).
  - Transaksi atomik kuota berbasis PostgreSQL row-level locks (`SELECT ... FOR UPDATE`).
  - Manajemen berkas QR dan logo yang disimpan di Docker Persistent Volume dengan sanitasi EXIF otomatis via Sharp.
  - Penghapusan aset yang langsung memulihkan kuota secara instan.
- **Keamanan Siber Berstandar Industri (OWASP Top 10 Compliant)**:
  - Otentikasi sesi via cookie HttpOnly, Secure, dan SameSite=Lax.
  - Hashing kata sandi berkekuatan tinggi menggunakan Argon2id / Bcrypt dengan dynamic salting.
  - Rate limiting berbasis Redis di tingkat middleware dan API endpoint untuk mitigasi brute force dan DDoS.
  - Sanitasi file upload ketat: deteksi MIME tipe riil, batasan ukuran 2 MB, dan isolasi nama file UUIDv4.
- **Desain Responsif & Aksesibilitas Visual**:
  - Tema Eksklusif Pure Dark Mode: Estetika modern Cyber Midnight & Neon Brand Orange dengan kontras tajam (WCAG AA compliant).
  - Dukungan penuh perangkat bergerak (*mobile-friendly* dengan drawer navigasi dan layout adaptif).

---

## 🛠️ Arsitektur Teknologi

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend & Backend** | Next.js 16 (Turbopack standalone) | React 19, TypeScript 5, Tailwind CSS |
| **Database Relasional** | PostgreSQL 16 Alpine | Persistent volume storage, Prisma ORM |
| **Cache & In-Memory** | Redis 7 Alpine | Distributed Rate Limiter & Token Storage |
| **Reverse Proxy** | Caddy v2 Alpine | Automatic HTTPS & reverse proxying |
| **Pemrosesan Gambar** | Sharp | EXIF stripping, buffer sanitization |
| **Generator QR** | node-qrcode | Vector SVG & raster PNG engine |
| **Quality Engineering** | Playwright Test | Automated E2E, visual regression, & mobile audits |

---

## 📋 Persyaratan Sistem

- **Docker Desktop** (versi 24.0+ atau lebih baru) dengan Docker Compose V2
- **Node.js** (v20 LTS atau v22 LTS) — *hanya jika menjalankan secara lokal di luar container*
- Minimal RAM sistem: 2 GB
- Port bebas di sistem lokal:
  - `3001` (Akses langsung ke Next.js container)
  - `8080` (Akses melalui Caddy Reverse Proxy)
  - `5432` (PostgreSQL - opsional jika ingin direct client connect)
  - `6379` (Redis - opsional)

---

## 📦 Cara Instalasi & Menjalankan

### 1. Kloning Repositori
```bash
git clone https://github.com/username/miqr.git
cd miqr
```

### 2. Konfigurasi Environment Variables
Salin berkas konfigurasi lingkungan:
```bash
cp .env.example .env
```
Sesuaikan variabel penting di `.env`:
```env
DATABASE_URL="postgresql://miqr_user:miqr_secure_pass_2026@miqr_db:5432/miqr_production?schema=public"
REDIS_URL="redis://miqr_redis:6379"
STORAGE_DIR="/app/storage_data"
MAX_USER_STORAGE_BYTES=104857600
JWT_SECRET="ganti_dengan_random_string_minimal_32_karakter"
```

### 3. Menjalankan via Docker Compose
Build dan jalankan seluruh container secara terorkestrasi:
```bash
docker compose up -d --build
```

Container yang akan aktif:
- `miqr_web`: Web Application Next.js (Port `3001:3000`)
- `miqr_db`: PostgreSQL 16 (Port `5432:5432`)
- `miqr_redis`: Redis 7 Cache & Rate Limiter (Port `6379:6379`)
- `miqr_proxy`: Caddy Reverse Proxy (Port `8080:80`)

### 4. Buka Aplikasi di Browser
- Akses langsung: `http://localhost:3001`
- Akses melalui Reverse Proxy: `http://localhost:8080`

---

## 🧪 Pengujian & Quality Engineering (QE)

MiQR dilengkapi dengan automated test suite berbasis **Playwright** yang mencakup pengujian fungsionalitas, keamanan, keterbacaan estetika, serta responsivitas perangkat bergerak.

Jalankan pengujian E2E:
```bash
# Menjalankan audit menyeluruh (fungsional, mobile drawer, kontras, dan storage)
npx playwright test tests/e2e/massive-deep-audit.spec.ts

# Menjalankan visual capture audit (desktop & mobile)
npx playwright test tests/e2e/visual-audit.spec.ts
```

---

## 📁 Struktur Direktori

```text
miqr/
├── app/                        # Next.js App Router (Layouts, Pages, & API Routes)
│   ├── (auth)/                 # Route Group Otentikasi (login, register)
│   ├── (dashboard)/            # Route Group Dashboard (ringkasan, qr studio, storage, settings)
│   ├── api/                    # RESTful Endpoints (auth, qr, storage)
│   ├── globals.css             # Desain token, tema, & WCAG contrast utility
│   └── layout.tsx              # Root HTML layout & Metadata brand icons
├── lib/                        # Modul utilitas bisnis & keamanan
│   ├── db/                     # Prisma Client wrapper
│   ├── qr/                     # Kontras WCAG engine, parser WIFI/vCard, & generator
│   └── security/               # Argon2/Bcrypt hasher & Redis rate limiter
├── prisma/                     # Skema database relasional & migrasi
├── public/                     # Aset statis publik
│   ├── brand/                  # Direktori resmi logo MiQR (MiQR.png, MiQR.jpg, MiQR.ico)
│   ├── favicon.ico             # Favicon browser
│   └── icon.png                # PWA & Web app shortcut icon
├── scripts/                    # Script otomatisasi & utility
├── tests/                      # Suite pengujian Quality Engineering (Playwright)
├── compose.yaml                # Konfigurasi orkestrasi Docker multi-container
├── Dockerfile                  # Multi-stage standalone production build
└── README.md                   # Dokumentasi resmi proyek
```

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT**. Silakan gunakan, pelajari, dan kembangkan secara mandiri.