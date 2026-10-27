# MiQR-BuildProject

## Rancangan Teknis dan Product Blueprint MiQR — SaaS QR Code Generator
**Versi Dokumen:** 2.1 (Hardened Architecture, OWASP Compliant & Production-Ready)\
**Status Dokumen:** Blueprint Implementasi Final\
**Nama Produk:** MiQR\
**Jenis Aplikasi:** SaaS Web Application (Self-Hosted Capable)\
**Tujuan:** Membangun platform QR Code Generator yang aman, performan, responsif, zero-paid-dependency, dan dapat di-deploy secara mandiri di Ubuntu Server menggunakan Docker Compose.

---

## 1. Ringkasan Produk

MiQR adalah aplikasi SaaS untuk membuat, mengkustomisasi, mengelola, menyimpan, dan mengunduh QR Code. Pengguna diwajibkan memiliki akun dan login untuk membuat serta mengelola QR Code mereka. Pengguna dapat menghasilkan QR Code standar atau berlogo, memilih tingkat koreksi kesalahan (*Error Correction Level* L, M, Q, H), mengatur gaya modul dan warna dengan pengecekan kontras otomatis, menyimpan aset ke cloud privat MiQR, serta mengunduh hasil dalam format PNG dan SVG.

### Tujuan Core MVP (Fase 1)
1. **Autentikasi & Akun:** Registrasi, login, logout, sesi terenkripsi yang aman, dan proteksi rute dashboard.
2. **Dashboard Pengguna:** Ringkasan statistik, daftar QR milik pengguna, pencarian, filter tipe, dan pengelolaan status.
3. **QR Code Generator Berperforma Tinggi:**
   - **Client-Side Live Preview:** Rendering instan di browser (0ms latency, zero server disk I/O).
   - **Server-Side Final Processing:** Kompilasi resolusi tinggi dan komposit logo aman saat simpan/unduh.
4. **Pilihan Error Correction (L, M, Q, H):** Panduan kontekstual kapasitas dan toleransi kerusakan.
5. **Kustomisasi Desain Modern:** Warna foreground/background dengan validasi rasio kontras WCAG, margin/quiet zone, ukuran ekspor, dan pilihan bentuk modul (Square, Rounded, Dots).
6. **Pemrosesan Logo Aman:** Unggah logo (PNG, JPEG, WebP) dengan sanitasi EXIF, deteksi *decompression bomb*, dan penyesuaian rasio area otomatis.
7. **Penyimpanan Cloud Privat & Kuota:** Disimpan di Docker persistent volume terenkripsi/terisolasi dengan kuota default 100 MB per pengguna via *Atomic SQL Conditional Update*.
8. **Ekspor Fleksibel:** Preset unduhan cepat (Media Sosial 512px, Cetak 1024px, Vektor SVG).
9. **UI/UX Standar Industri:** Default tema terang (*clean & professional*), opsi dark mode (*deep navy/purple*), dan aksesibilitas keyboard/kontras.
10. **Deployment Siap Produksi:** Docker Compose multi-container (`web`, `db`, `redis`, `proxy`, `migrate`) dengan reverse proxy Caddy (otomatisasi HTTPS).

### Batasan Ruang Lingkup (Di Luar Core MVP)
- QR Code dinamis dengan URL redirect (masuk ke Fase C).
- Analitik kunjungan/scan mendalam (masuk ke Fase C).
- Billing, payment gateway, dan paket berbayar (tetap self-hosted/gratis di sisi stack).
- Kolaborasi tim multi-tenant dan integrasi SSO/OAuth (fitur lanjutan).

---

## 2. Prinsip Produk dan Rekayasa

- **Zero Hidden Paid Dependency:** Seluruh core stack dan dependensi build 100% open-source tanpa kewajiban langganan SaaS pihak ketiga (seperti AWS S3, Cloudinary, atau API AI berbayar).
- **Security by Design (OWASP Top 10 Aligned):** Setiap endpoint memvalidasi kepemilikan objek (anti-BOLA/IDOR), data di-sanitize, file upload diperiksa hingga tingkat *magic bytes*, dan database terisolasi dari akses publik.
- **Client-Compute for Preview, Server-Compute for Production:** Live preview memanfaatkan CPU browser; server hanya memproses rendering saat penyimpanan final atau ekspor resolusi tinggi untuk mencegah I/O thrashing.
- **Data Integrity & Atomic Operations:** Sinkronisasi konsisten antara filesystem lokal dan PostgreSQL menggunakan pola kompensasi dan conditional update.
- **Accessibility & Scannability First:** Sistem secara aktif mencegah pengguna membuat QR yang cacat cetak (misalnya kontras terlalu rendah atau logo terlalu besar).

---

## 3. Rekomendasi Tech Stack

| Layer | Teknologi Terpilih | Alasan & Peran Teknis |
| :--- | :--- | :--- |
| **Web Framework** | **Next.js (App Router, TypeScript)** | Fullstack framework, Server Components, Route Handlers backend-for-frontend, mode `output: 'standalone'` untuk Docker. |
| **UI & Styling** | **Tailwind CSS + shadcn/ui** | Desain fleksibel, konsisten, komponen headless yang accessible (Radix UI). |
| **Iconography** | **Lucide React** | Ikon visual konsisten dan ringan. |
| **Form & Validasi** | **React Hook Form + Zod** | Validasi skema tipe-aman di browser dan server. |
| **Database** | **PostgreSQL (v16 LTS)** | Penyimpanan relasional ACID untuk user, metadata QR, sesi, dan kuota. |
| **ORM** | **Prisma ORM** | Skema terpusat, migrasi deklaratif, dan query parameterized bebas SQL Injection. |
| **Caching & Throttling** | **Redis (v7 Alpine)** | Rate limiting endpoint sensitif (login, register, generate) dan temporary locking. |
| **QR Engine (Server)** | **`qrcode` / `qr-code-styling-node`** | Kompilasi matriks QR, error correction L/M/Q/H, dan stream buffer PNG/SVG. |
| **QR Engine (Client)** | **Canvas / SVG Rendering di Browser** | Live preview instan tanpa lag dan tanpa beban request server. |
| **Image Processing** | **`sharp`** | Resize logo aman, penghapusan metadata EXIF, mitigasi *decompression bomb*, komposit buffer. |
| **Password Hashing** | **Argon2id** (atau `bcryptjs` fallback) | Standar kriptografi tahan GPU/ASIC cracking, dieksekusi di Node.js runtime. |
| **Autentikasi & Sesi** | **Encrypted HTTP-Only Cookie Session** | Sesi stateless/terenkripsi aman via `jose` atau database session via Prisma. |
| **Storage Engine** | **Docker Named Volume Privat (`/var/lib/miqr`)** | Penyimpanan aset mandiri tanpa biaya cloud object storage eksternal. |
| **Reverse Proxy** | **Caddy Server** | Reverse proxy berkinerja tinggi dengan HTTPS/TLS otomatis via Let's Encrypt / ZeroSSL. |
| **Containerization** | **Docker Engine + Docker Compose** | Multi-stage build, user non-root, isolasi network internal. |
| **Quality & Tests** | **Vitest, Playwright, ESLint, Prettier** | Unit testing, integration, E2E testing, dan standardisasi kode. |

---

## 4. Arsitektur Sistem dan Jaringan

```text
               +--------------------------------------------------+
               |                  INTERNET / USER                 |
               +--------------------------------------------------+
                                        |
                                        | HTTPS (Port 443) / HTTP (Port 80 redirect)
                                        v
+---------------------------------------------------------------------------------+
| DOCKER HOST (Ubuntu Server)                                                     |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | CADDY REVERSE PROXY CONTAINER                                           |   |
|   | - Terminasi SSL/TLS otomatis                                            |   |
|   | - Security Headers Injection (HSTS, CSP, X-Frame-Options)               |   |
|   | - Gzip / Zstd Compression                                               |   |
|   +-------------------------------------------------------------------------+   |
|                                        |                                        |
|                          Internal Network (`miqr-network`)                      |
|                                        v                                        |
|   +-------------------------------------------------------------------------+   |
|   | NEXT.JS APPLICATION CONTAINER (`web`) [Non-root User: node]             |   |
|   |                                                                         |   |
|   |   [UI Layer (React Server & Client Components)]                         |   |
|   |         |                                                               |   |
|   |   [Route Handlers & Server Actions]                                     |   |
|   |         |-- Auth Guard & Rate Limit Guard (Redis)                       |   |
|   |         |-- Zod Request Validation                                      |   |
|   |         |-- QR Generator & Sharp Image Processor                        |   |
|   |         |-- Atomic Quota Engine                                         |   |
|   +-------------------------------------------------------------------------+   |
|               |                                      |                          |
|    Internal   |                           Internal   |                          |
|    Port 5432  v                           Port 6379  v                          |
|   +-----------------------+              +-----------------------+              |
|   | POSTGRESQL CONTAINER  |              | REDIS CONTAINER       |              |
|   | (`db`)                |              | (`redis`)             |              |
|   | - Data relasional     |              | - Rate limit counters |              |
|   | - Tidak expose port   |              | - Temporary cache     |              |
|   +-----------------------+              +-----------------------+              |
|               |                                                                 |
|   +-----------v-------------------------------------------------------------+   |
|   | DOCKER PERSISTENT VOLUMES (Mounted to Host Disk)                        |   |
|   | - `postgres_data` : Database binary files                               |   |
|   | - `miqr_storage`  : File aset QR dan logo pengguna terisolasi           |   |
|   +-------------------------------------------------------------------------+   |
+---------------------------------------------------------------------------------+
```

### Isolasi Jaringan
- Container `db` dan `redis` **TIDAK MEMILIKI** binding port ke host (tidak ada `ports: "5432:5432"`).
- Hanya container `proxy` (Caddy) yang membuka port publik 80 dan 443 ke host.
- Aplikasi `web` berkomunikasi dengan database dan cache murni melalui DNS internal Docker (`db:5432` dan `redis:6379`).

---

## 5. Struktur Direktori Repository

```text
miqr/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                  # Landing page & info fitur
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx            # Form login
│   │   ├── register/page.tsx         # Form registrasi
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/page.tsx        # Overview & daftar QR
│   │   ├── qr/
│   │   │   ├── new/page.tsx          # Studio pembuatan QR
│   │   │   └── [id]/page.tsx         # Detail, edit metadata, & ekspor
│   │   ├── storage/page.tsx          # Detail penggunaan kuota storage
│   │   ├── settings/page.tsx         # Pengaturan profil, tema, & akun
│   │   └── layout.tsx                # Dashboard shell dengan sidebar & header
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── qr/
│   │   │   ├── route.ts              # GET (list) & POST (save QR)
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET, PATCH, DELETE (soft-delete)
│   │   │       └── download/route.ts # GET file streaming terotentikasi
│   │   ├── storage/
│   │   │   └── route.ts              # GET kuota pengguna
│   │   └── health/
│   │       └── route.ts              # Health check untuk Docker & Caddy
│   ├── layout.tsx                    # Root layout (Font, Theme Provider, Toast)
│   └── globals.css                   # Tailwind tokens & CSS variables
├── components/
│   ├── ui/                           # Button, Input, Modal, Badge, Dropdown, Slider
│   ├── layout/                       # Navbar, Sidebar, Footer, UserMenu
│   ├── qr/
│   │   ├── QrLivePreview.tsx         # Preview instan via Canvas/SVG sisi klien
│   │   ├── QrConfigForm.tsx          # Kontrol payload, warna, L/M/Q/H, dots style
│   │   ├── QrLogoUploader.tsx        # Upload & crop logo dengan proteksi format
│   │   └── QrContrastBadge.tsx       # Indikator kontras WCAG real-time
│   └── forms/                        # Auth forms & profil forms
├── lib/
│   ├── auth/
│   │   ├── session.ts                # Session management & token verification
│   │   └── password.ts               # Argon2id hashing & timing-safe compare
│   ├── db.ts                         # Prisma Client singleton
│   ├── redis.ts                      # Redis connection singleton
│   ├── qr/
│   │   ├── generator.ts              # Node.js backend QR generator
│   │   ├── contrast.ts               # Perhitungan rasio kontras WCAG
│   │   └── parser.ts                 # Formatting vCard, Wi-Fi, URL, Teks
│   ├── storage/
│   │   ├── filesystem.ts             # I/O file, atomic move, cleanup file
│   │   └── quota.ts                  # Atomic quota updates via Prisma raw SQL
│   ├── image/
│   │   └── processor.ts              # Sanitasi & composite gambar via Sharp
│   ├── validation/
│   │   └── schemas.ts                # Zod schemas (Auth, QR Payload, Settings)
│   └── security/
│       ├── rate-limit.ts             # Redis sliding-window / token-bucket limiter
│       └── headers.ts                # Security headers helper
├── prisma/
│   ├── schema.prisma                 # Schema database
│   └── migrations/                   # Riwayat migrasi SQL
├── public/                           # Static assets umum (favicon, logo MiQR)
├── storage/                          # Direktori lokal khusus dev (di-ignore git)
├── tests/
│   ├── unit/                         # Tes contrast, payload parser, quota math
│   └── e2e/                          # Playwright E2E tests (auth -> generate -> save)
├── Dockerfile                        # Multi-stage production build (non-root)
├── compose.yaml                      # Docker Compose orchestrator produksi
├── compose.dev.yaml                  # Docker Compose dev environment
├── Caddyfile                         # Konfigurasi reverse proxy & TLS Caddy
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

---

## 6. Model Data Database (Prisma Schema yang Sinkron & Aman)

> **Pembaruan Arsitektur Penting:**
> - Field kuota dan ukuran file menggunakan `Int` (bukan `BigInt`) dengan satuan **bytes**. Nilai maksimum `Int` PostgreSQL adalah $2.147.483.647$ (~2.14 GB), sangat memadai untuk kuota 100 MB dan dapat di-serialize langsung oleh `JSON.stringify()` tanpa error runtime.
> - Ditambahkan model `Session` untuk mendukung pelacakan sesi server-side yang dapat di-revoke kapan saja.
> - Ditambahkan field `status` (`ACTIVE`, `ARCHIVED`) dan `deletedAt` untuk mendukung *Soft Delete* agar aset tidak hilang mendadak.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum QrContentType {
  URL
  TEXT
  EMAIL
  PHONE
  WIFI
  VCARD
}

enum QrErrorCorrection {
  L
  M
  Q
  H
}

enum QrFileFormat {
  PNG
  SVG
}

enum QrDotsStyle {
  SQUARE
  ROUNDED
  DOTS
}

enum QrStatus {
  ACTIVE
  ARCHIVED
}

model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  passwordHash   String
  theme          String    @default("light")
  storageQuota   Int       @default(104857600) // 100 MB (dalam bytes)
  storageUsed    Int       @default(0)         // Penggunaan aktual (dalam bytes)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  qrCodes        QrCode[]
  sessions       Session[]

  @@index([email])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expiresAt    DateTime
  createdAt    DateTime @default(now())
  
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionToken])
}

model QrCode {
  id              String             @id @default(cuid())
  userId          String
  name            String
  contentType     QrContentType
  payload         String             @db.Text
  errorCorrection QrErrorCorrection  @default(M)
  foreground      String             @default("#000000")
  background      String             @default("#FFFFFF")
  width           Int                @default(1024)
  margin          Int                @default(4)
  dotsStyle       QrDotsStyle        @default(SQUARE)
  fileFormat      QrFileFormat       @default(PNG)
  filePath        String?            // Path relatif di volume storage privat
  fileSize        Int                @default(0) // Ukuran file QR dalam bytes
  logoPath        String?            // Path relatif file logo jika disimpan
  logoSize        Int                @default(0) // Ukuran logo dalam bytes
  status          QrStatus           @default(ACTIVE)
  deletedAt       DateTime?          // Soft delete timestamp
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  user            User               @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, status, createdAt])
  @@index([userId, contentType])
}
```

---

## 7. Alur Pembuatan QR Code (Client-Preview + Atomic Server Processing)

```text
[ USER BROWSER ]
       |
       | 1. Input teks/URL/warna/margin/L-M-Q-H
       | 2. Perhitungan rasio kontras WCAG di browser (< 4.5:1 -> Munculkan Warning)
       | 3. Render Live Preview secara lokal di HTML5 Canvas / SVG (0ms, 0 byte ke server)
       |
       |-- A. Jika User memilih "Download Cepat (Tanpa Simpan)"
       |      --> Unduh langsung dari Canvas browser sebagai PNG/SVG client-side (Server tidak tersentuh)
       |
       |-- B. Jika User memilih "Simpan ke Akun MiQR"
              |
              v (Kirim POST /api/qr dengan Payload & File Logo opsional)
[ NEXT.JS BACKEND ]
       |
       | 4. Auth & Rate-Limit Guard (Periksa Cookie Sesi & Redis Limiter)
       | 5. Validasi Skema Zod (Panjang string, format warna hex, error correction valid)
       | 6. Image Sanitization (Jika ada logo):
       |    - Verifikasi magic bytes (Hanya PNG, JPEG, WebP)
       |    - Tolak raw SVG logo dari pengguna (Cegah Stored XSS)
       |    - Sharp: Bersihkan EXIF, periksa batas pixel (max 2000x2000), resize proporsional (< 20% area QR)
       | 7. Generate High-Res Master File di direktori temporary (`/var/lib/miqr/tmp/`)
       | 8. Hitung total bytes (fileSize + logoSize)
       | 9. ATOMIC QUOTA DEDUCTION di PostgreSQL:
       |    UPDATE "User"
       |    SET "storageUsed" = "storageUsed" + :totalBytes
       |    WHERE "id" = :userId AND ("storageUsed" + :totalBytes) <= "storageQuota";
       |
       |    [Apakah baris ter-update = 1?]
       |          |
       |          +--- TIDAK (Kuota Penuh):
       |          |    - Hapus file di `/tmp/`
       |          |    - Return 413 "Storage Quota Exceeded"
       |          |
       |          +--- YA (Kuota Cukup):
       |               - Pindahkan file dari `/tmp/` ke `/var/lib/miqr/users/:userId/`
       |               - Insert metadata ke tabel `QrCode`
       |               - Commit selesai -> Return 201 Created JSON
```

---

## 8. Spesifikasi Endpoint API

Semua endpoint dilindungi oleh middleware sesi terenkripsi (kecuali auth publik dan health check).

| Method | Endpoint | Fungsi & Proteksi Keamanan |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Pendaftaran akun baru. Rate limit: 5 req / 15 menit per IP. Validasi email unik & kekuatan password. |
| `POST` | `/api/auth/login` | Login akun & penerbitan sesi. Rate limit: 5 req / 15 menit per IP. Pesan error generik (anti-enumeration). |
| `POST` | `/api/auth/logout` | Revoke sesi & penghapusan HTTP-Only cookie. |
| `GET` | `/api/qr` | Mengambil daftar QR Code user. Filter: `contentType`, `status`, `search`. Pagination: `page`, `limit`. |
| `POST` | `/api/qr` | Memvalidasi, memproses logo, memotong kuota secara atomik, dan menyimpan aset QR. |
| `GET` | `/api/qr/:id` | Mengambil detail spesifik QR Code. Validasi kepemilikan wajib (`userId = session.userId`). |
| `PATCH`| `/api/qr/:id` | Mengubah metadata nama atau status (`ACTIVE`/`ARCHIVED`). Tidak mengubah payload fisik QR. |
| `DELETE`| `/api/qr/:id`| Soft delete QR (`status = ARCHIVED`, `deletedAt = NOW()`). Pengurangan pemakaian kuota dilakukan secara sinkron. |
| `GET` | `/api/qr/:id/download` | Streaming file PNG/SVG dari volume privat dengan header `Content-Disposition: attachment`. Verifikasi otorisasi. |
| `GET` | `/api/storage` | Mengambil ringkasan kuota (`storageQuota`, `storageUsed`, `percentageUsed`). |
| `GET` | `/api/health` | Health probe untuk Caddy dan Docker (`{ status: "ok", db: true, redis: true }`). |

---

## 9. Desain Keamanan Siber Komprehensif (OWASP Top 10 Mitigation)

Rancangan arsitektur MiQR secara eksplisit mengimplementasikan perlindungan terhadap risiko **OWASP Top 10**:

### A01: Broken Access Control (Pencegahan IDOR / BOLA)
- **Aturan Otoritas Server:** `userId` diambil dari sesi cookie server yang terverifikasi, **bukan** dari parameter body atau URL yang dikirim client.
- **Data Filtering Ketat:** Setiap query database Prisma wajib menyertakan filter identitas pengguna:
  ```typescript
  const qr = await prisma.qrCode.findFirst({
    where: { id: params.id, userId: session.userId }
  });
  if (!qr) return NextResponse.json({ error: "Not Found" }, { status: 404 });
  ```
- **Penyimpanan Terisolasi:** File QR disimpan di luar folder `public` Next.js (`/var/lib/miqr/users/[userId]/[fileId].png`). Tidak ada URL statis langsung yang bisa diakses tanpa melewati Route Handler yang memvalidasi hak akses.

### A02: Cryptographic Failures
- **Password Storage:** Hashing password menggunakan algoritma **Argon2id** dengan konfigurasi tangguh (Memory: 64MB, Iterations: 3, Parallelism: 4).
- **Transport Security:** Caddy secara otomatis memberlakukan TLS 1.3/1.2 dan menyuntikkan header `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- **Cookie Flags:** Cookie sesi disetel dengan atribut wajib: `HttpOnly=true`, `Secure=true`, `SameSite=Lax`, dan `Path=/`.

### A03: Injection (SQLi, XSS, Command Injection)
- **Anti-SQLi:** Seluruh interaksi database menggunakan Prisma ORM dengan parameterized queries.
- **Anti-XSS:** 
  - React secara default melakukan encoding karakter pada teks.
  - **Tolak Logo Berformat SVG:** Pengguna tidak diizinkan mengunggah file SVG sebagai logo kustom (SVG berbasis XML dan dapat disisipi tag `<script>` jahat yang memicu Stored XSS). Logo hanya diterima dalam format raster: PNG, JPEG, WebP.
- **Anti-Command Injection:** Tidak menggunakan pemanggilan `child_process.exec()` atau shell command untuk memanipulasi file. Seluruh operasi komposit gambar menggunakan library Node.js native (`sharp`).

### A04: Insecure Design
- **Atomic Quota System:** Kuota diperiksa dan dipotong dalam satu query database kondisional untuk mengeliminasi celah *Race Condition* (*Time-of-Check to Time-of-Use* / TOCTOU).
- **Scannability Guard:** Sistem UI menghitung kontras WCAG ($L_1/L_2$). Jika kontras $< 4.5:1$, sistem memunculkan peringatan keras agar pengguna tidak mencetak QR yang gagal dibaca kamera.

### A05: Security Misconfiguration
- **Non-Root Container:** Dockerfile menggunakan user `node` berhak akses terbatas (`USER node`), bukan `root`.
- **Network Isolation:** PostgreSQL dan Redis berada di internal Docker network tanpa port publik.
- **Security Headers Default:**
  ```http
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  ```

### A06: Vulnerable and Outdated Components
- Pinning versi Docker Image LTS (`node:20-alpine`, `postgres:16-alpine`, `redis:7-alpine`, `caddy:2-alpine`).
- Audit otomatis melalui `npm audit` dan penguncian dependensi menggunakan `package-lock.json`.

### A07: Identification and Authentication Failures
- **Anti-Brute Force:** Endpoint login dibatasi oleh Redis Rate Limiter (maksimal 5 kegagalan per 15 menit per alamat IP).
- **Generic Responses:** Pesan error login tidak membedakan apakah email terdaftar atau password salah (*"Email atau password tidak valid"*).
- **Timing-Attack Resistance:** Pengecekan password menggunakan pembandingan waktu konstan (*constant-time comparison*).

### A08: Software and Data Integrity Failures
- **Magic Bytes Verification:** Tipe MIME upload logo diverifikasi dari byte pertama file menggunakan library inspeksi buffer (bukan mempercayai ekstensi nama file `.png` dari browser).
- **Mitigasi Decompression Bomb:** Gambar logo dibatasi maksimal ukuran upload 2 MB dan batas dimensi $2000 \times 2000$ piksel sebelum diproses oleh Sharp.

### A09: Security Logging and Monitoring Failures
- **Structured JSON Logging:** Pencatatan log terstruktur untuk audit keamanan (kegagalan login, pemulihan akun, penghapusan data).
- **Sanitasi Log:** Password, token sesi, dan payload sensitif (misalnya password Wi-Fi pengguna) difilter secara otomatis agar tidak bocor ke log container.

### A10: Server-Side Request Forgery (SSRF)
- **Larangan Fetch Remote URL di MVP:** Server tidak menyediakan fitur "Ambil logo dari URL". Seluruh logo harus diunggah langsung dari perangkat pengguna.
- **QR Dinamis (Fase C):** Ketika fitur redirect diaktifkan nantinya, URL tujuan diwajibkan menggunakan allowlist protokol (`http://` dan `https://` saja, dilarang keras `file://`, `gopher://`, `dict://`, `javascript:`).

---

## 10. Konfigurasi Environment Variables (`.env.example`)

```dotenv
# Environment Mode
NODE_ENV=production
APP_URL=https://miqr.example.com

# Session Secret (Minimal 32 karakter acak kuat)
# Generate via: openssl rand -base64 32
AUTH_SECRET=ganti_dengan_kunci_rahasia_acak_minimal_32_karakter

# Database (PostgreSQL internal Docker)
POSTGRES_DB=miqr_db
POSTGRES_USER=miqr_user
POSTGRES_PASSWORD=ganti_password_database_kuat
DATABASE_URL=postgresql://miqr_user:ganti_password_database_kuat@db:5432/miqr_db?schema=public

# Cache & Rate Limiter (Redis internal Docker)
REDIS_URL=redis://redis:6379

# Storage Configuration
STORAGE_ROOT=/var/lib/miqr
DEFAULT_STORAGE_QUOTA_BYTES=104857600
MAX_LOGO_UPLOAD_BYTES=2097152
MAX_QR_PAYLOAD_CHARS=4096

# Public App Metadata
NEXT_PUBLIC_APP_NAME="MiQR"
NEXT_PUBLIC_APP_URL=https://miqr.example.com
```

---

## 11. Deployment Produksi (Docker Compose & Caddy)

### 11.1 File `compose.yaml` Produksi

```yaml
services:
  proxy:
    image: caddy:2.8-alpine
    container_name: miqr_proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      web:
        condition: service_healthy
    networks:
      - miqr-network

  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: miqr_web
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?schema=public
      - REDIS_URL=redis://redis:6379
      - AUTH_SECRET=${AUTH_SECRET}
      - STORAGE_ROOT=/var/lib/miqr
      - DEFAULT_STORAGE_QUOTA_BYTES=${DEFAULT_STORAGE_QUOTA_BYTES:-104857600}
      - MAX_LOGO_UPLOAD_BYTES=${MAX_LOGO_UPLOAD_BYTES:-2097152}
    volumes:
      - miqr_storage:/var/lib/miqr
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 15s
      timeout: 5s
      retries: 3
      start_period: 20s
    networks:
      - miqr-network

  db:
    image: postgres:16-alpine
    container_name: miqr_db
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - miqr-network

  redis:
    image: redis:7-alpine
    container_name: miqr_redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes", "--maxmemory", "128mb", "--maxmemory-policy", "volatile-lru"]
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - miqr-network

volumes:
  caddy_data:
  caddy_config:
  postgres_data:
  redis_data:
  miqr_storage:

networks:
  miqr-network:
    driver: bridge
```

### 11.2 File `Caddyfile`

```caddy
{$APP_URL:miqr.example.com} {
    encode zstd gzip

    # Reverse proxy ke Next.js container
    reverse_proxy web:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }

    # Security Headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
        -Server
    }
}
```

---

## 12. Tahapan Implementasi Bertahap (Step-by-Step Roadmap)

Pembangunan proyek diinstruksikan berjalan secara teratur per fase:

### Tahap 1 — Fondasi Proyek & Lingkungan
- Inisialisasi Next.js (App Router, TypeScript).
- Setup Tailwind CSS, shadcn/ui, Lucide React, ESLint, dan Prettier.
- Setup skema `prisma/schema.prisma` (Model `User`, `Session`, `QrCode`).
- Setup multi-stage Dockerfile dan `compose.yaml` (PostgreSQL, Redis, Web).
- Implementasi endpoint `/api/health` untuk memastikan database & Redis terhubung.

### Tahap 2 — Autentikasi & Keamanan Dasar
- Implementasi hashing password dengan Argon2id.
- Implementasi endpoint registrasi, login, logout, dan session cookie terenkripsi.
- Middleware pelindung rute `/(dashboard)/*` dan API privat.
- Integrasi Redis Rate Limiter pada rute autentikasi.

### Tahap 3 — Generator Studio & Client Preview
- Form konfigurasi jenis konten (URL, Teks, Wi-Fi, vCard, Email, Telepon).
- Selector Error Correction (L, M, Q, H) disertai keterangan interaktif.
- Color Picker dengan WCAG Contrast Ratio Evaluator instan.
- Selector gaya modul: Square, Rounded, Dots.
- Komponen Live Preview sisi klien via Canvas/SVG.
- Unduh langsung sisi klien (PNG/SVG tanpa simpan).

### Tahap 4 — Pemrosesan Logo & Penyimpanan Cloud Privat
- Komponen upload logo dengan validasi magic bytes (PNG, JPEG, WebP) dan penolakan raw SVG.
- Backend processor dengan `sharp` (EXIF stripping, resize otomatis, composite).
- Implementasi *Atomic Quota Deduction* di PostgreSQL.
- Endpoint penyimpanan QR (`POST /api/qr`) dan download terotentikasi (`GET /api/qr/:id/download`).

### Tahap 5 — Dashboard & Manajemen Koleksi
- Tampilan daftar QR dengan pencarian, filter jenis konten, dan pengurutan tanggal.
- Komponen indikator kuota penyimpanan (`X MB dari 100 MB terpakai`).
- Fitur ubah metadata (nama QR) dan Soft Delete.
- Empty states, skeleton loading, dan error boundary.

### Tahap 6 — Polish Desain, Dark Mode & Uji Coba
- Implementasi switch tema (Default Light / Dark Mode Deep Navy).
- Audit aksesibilitas (Navigasi keyboard, focus visible, kontras warna).
- Pengujian unit test dan E2E test menggunakan Vitest & Playwright.

### Tahap 7 — Deployment Siap Produksi
- Finalisasi konfigurasi Caddyfile dan otomatisasi SSL.
- Verifikasi user non-root pada Dockerfile.
- Dokumentasi panduan operasional, backup database (`pg_dump`), dan restore.

---

## 13. Definisi Selesai (Definition of Done — DoD)

Proyek MiQR Core MVP dinyatakan selesai jika:
- [ ] Pengguna dapat mendaftar, login, logout, dan mengelola sesi dengan aman.
- [ ] Fitur pembuatan dan penyimpanan QR hanya dapat diakses oleh pengguna yang terautentikasi.
- [ ] Live preview bekerja instan di browser tanpa mengirim request berulang ke disk server.
- [ ] Pilihan L, M, Q, H berfungsi akurat dan memiliki panduan yang jelas.
- [ ] Kalkulator kontras warna memberi peringatan jika kontras $< 4.5:1$.
- [ ] Logo terunggah dibersihkan dari metadata EXIF dan disesuaikan ukurannya secara aman via `sharp`.
- [ ] Kuota 100 MB ditegakkan secara atomik tanpa risiko *race condition*.
- [ ] Pengguna A tidak dapat melihat, mengubah, atau mengunduh QR milik Pengguna B (Anti-IDOR teruji).
- [ ] Ekspor PNG resolusi tinggi dan SVG vektor berfungsi dengan baik.
- [ ] Seluruh layanan (`web`, `db`, `redis`, `proxy`) berjalan lancar via satu perintah `docker compose up -d`.
- [ ] Seluruh pengujian (lint, typecheck, unit test) lulus tanpa error.
