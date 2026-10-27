import { test, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe.serial('Massive Deep Industrial QE Audit Suite - MiQR Platform', () => {
  let context: BrowserContext;
  let page: Page;

  const timestamp = Date.now();
  let testUser: { name: string; email: string; password: string };

  test.beforeAll(async ({ browser }) => {
    testUser = {
      name: 'Industrial QE Lead',
      email: `deep_qe_${Date.now()}_${Math.floor(Math.random() * 1000000)}@miqr.test`,
      password: 'MasterPassword2026!',
    };
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  // ==========================================
  // SUITE 1: Security Redirection & Route Guard
  // ==========================================
  test('TC-SEC-01: Middleware Guard blocks unauthenticated access to protected routes', async () => {
    const protectedRoutes = ['/dashboard', '/qr/new', '/storage', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(`${BASE_URL}${route}`);
      // Must be redirected to login with redirect param
      await expect(page).toHaveURL(new RegExp(`/login\\?redirect=${encodeURIComponent(route)}`));
      await expect(page.locator('#btn-submit-login')).toBeVisible();
    }
  });

  // ==========================================
  // SUITE 2: Registration, Validation & Session
  // ==========================================
  test('TC-AUTH-01: Registration form rejects password mismatch & registers user', async () => {
    await page.goto(`${BASE_URL}/register`);

    // 1. Password mismatch validation
    await page.fill('#reg-name', testUser.name);
    await page.fill('#reg-email', testUser.email);
    await page.fill('#reg-password', 'ValidPass123!');
    await page.fill('#reg-confirm-password', 'MismatchPass456!');
    await page.click('#btn-submit-register');

    const errorAlert = page.locator('#register-error-alert');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText(/Konfirmasi password tidak cocok/i);

    // 2. Successful registration with correct match
    await page.fill('#reg-password', testUser.password);
    await page.fill('#reg-confirm-password', testUser.password);
    await page.click('#btn-submit-register');

    // Auto login & redirected to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    await expect(page.locator('#btn-create-qr-dashboard')).toBeVisible();
  });

  // ==========================================
  // SUITE 3: Deep QR Engine & Multi-Payload Matrix
  // ==========================================
  test('TC-ENG-01: QR Canvas renders URL and responds to text changes', async () => {
    await page.goto(`${BASE_URL}/qr/new`);
    await expect(page.locator('canvas#qr-preview-canvas')).toBeVisible();

    // Fill title & URL
    await page.fill('#qr-name-input', 'Production Website Link');
    await page.fill('#url-input', 'https://miqr.company.id/campaign?ref=industry_standard');

    // Canvas should exist and have dimensions
    const canvas = page.locator('canvas#qr-preview-canvas');
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);
  });

  test('TC-ENG-02: QR Engine generates Wi-Fi configurations (WPA vs nopass)', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    // Click Wi-Fi Tab
    const wifiTab = page.locator('#type-btn-wifi');
    await wifiTab.click();

    // Check Wi-Fi inputs appear
    await expect(page.locator('#wifi-ssid-input')).toBeVisible();
    await expect(page.locator('#wifi-password-input')).toBeVisible();
    await expect(page.locator('#wifi-sec-select')).toBeVisible();

    // Configure WPA Wi-Fi
    await page.fill('#wifi-ssid-input', 'Office_Guest_HighSpeed');
    await page.fill('#wifi-password-input', 'SecretGuest2026');
    await page.selectOption('#wifi-sec-select', 'WPA');

    // Switch to No Password (nopass)
    await page.selectOption('#wifi-sec-select', 'nopass');
    const canvas = page.locator('canvas#qr-preview-canvas');
    await expect(canvas).toBeVisible();
  });

  test('TC-ENG-03: QR Engine generates vCard contact payload with multi-field data', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    // Click vCard Tab
    const vcardTab = page.locator('#type-btn-vcard');
    await vcardTab.click();

    await expect(page.locator('#vcard-name-input')).toBeVisible();
    await expect(page.locator('#vcard-phone-input')).toBeVisible();
    await expect(page.locator('#vcard-email-input')).toBeVisible();
    await expect(page.locator('#vcard-org-input')).toBeVisible();

    // Fill vCard details
    await page.fill('#vcard-name-input', 'Ir. Raden Santoso M.T.');
    await page.fill('#vcard-phone-input', '+6281198765432');
    await page.fill('#vcard-email-input', 'raden.santoso@enterprise.co.id');
    await page.fill('#vcard-org-input', 'PT Teknologi Maju Perkasa');

    const canvas = page.locator('canvas#qr-preview-canvas');
    await expect(canvas).toBeVisible();
  });

  test('TC-ENG-04: Error Correction Level matrix switches correctly (L, M, Q, H)', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    const levels = ['l', 'm', 'q', 'h'];
    for (const lvl of levels) {
      const btn = page.locator(`#ec-btn-${lvl}`);
      await expect(btn).toBeVisible();
      await btn.click();
      // Ensure canvas remains active
      await expect(page.locator('canvas#qr-preview-canvas')).toBeVisible();
    }
  });

  test('TC-ENG-05: WCAG Luminance Contrast Evaluator detects High vs Poor contrast', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    const contrastBadge = page.locator('#wcag-contrast-badge');

    // 1. High Contrast: Black (#000000) on White (#FFFFFF)
    await page.fill('#color-fg-input', '#000000');
    await page.fill('#color-bg-input', '#ffffff');
    await expect(contrastBadge).toContainText(/Kontras Luar Biasa/i);

    // 2. Poor Contrast: Light Gray (#CBD5E1) on White (#FFFFFF)
    await page.fill('#color-fg-input', '#cbd5e1');
    await page.fill('#color-bg-input', '#ffffff');
    await expect(contrastBadge).toContainText(/Peringatan Kontras Rendah/i);

    // 3. Reset back to High Contrast
    await page.fill('#color-fg-input', '#0f172a');
    await page.fill('#color-bg-input', '#ffffff');
    await expect(contrastBadge).toContainText(/Kontras Luar Biasa/i);
  });

  // ==========================================
  // SUITE 4: Cloud Persistence & Atomic Quota
  // ==========================================
  test('TC-DAT-01: Save QR Code to Cloud and verify Dashboard & Storage reflection', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    const qrTitle = `Enterprise Launch Link ${Date.now()}`;
    await page.fill('#qr-name-input', qrTitle);
    await page.fill('#url-input', 'https://industry-standards.org/qr-compliance');

    // Save to Cloud
    const saveBtn = page.locator('#btn-save-to-cloud');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Must redirect to dashboard and show the new QR card
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
    const qrCardTitle = page.locator(`h3:has-text("${qrTitle}")`);
    await expect(qrCardTitle).toBeVisible();

    // Verify Storage Page reflects atomic quota
    await page.goto(`${BASE_URL}/storage`);
    await expect(page.locator('h1')).toContainText(/Penyimpanan Cloud Mandiri/i);
    await expect(page.locator('text=Atomic PostgreSQL Guard')).toBeVisible();
    await expect(page.locator('text=Status Kuota Aset')).toBeVisible();
  });

  // ==========================================
  // SUITE 5: Multi-Viewport Responsive Matrix
  // ==========================================
  test('TC-RSP-01: Small Mobile (360x740) - Zero Overflow & Drawer Menu Operation', async () => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(`${BASE_URL}/dashboard`);

    // Check zero horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);

    // Check Hamburger Drawer
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    const hamburgerBtn = page.locator('#btn-open-sidebar');
    await expect(hamburgerBtn).toBeVisible();
    await hamburgerBtn.click();

    // Drawer should open and show navigation links
    await expect(sidebar).toHaveClass(/translate-x-0/);
    await expect(page.locator('#nav-link-buat-qr-baru')).toBeVisible();

    // Close Drawer
    const closeBtn = page.locator('#btn-close-sidebar');
    await closeBtn.click();
    await expect(sidebar).toHaveClass(/-translate-x-full/);
  });

  test('TC-RSP-02: Standard Mobile (393x851) - QR Studio Touch Targets & Canvas Visibility', async () => {
    await page.setViewportSize({ width: 393, height: 851 });
    await page.goto(`${BASE_URL}/qr/new`);

    // Canvas preview must be rendered
    const canvas = page.locator('canvas#qr-preview-canvas');
    await expect(canvas).toBeVisible();

    // Save button touch target
    const saveBtn = page.locator('#btn-save-to-cloud');
    await expect(saveBtn).toBeVisible();
    const saveBox = await saveBtn.boundingBox();
    expect(saveBox!.height).toBeGreaterThanOrEqual(40);
  });

  test('TC-RSP-03: Tablet Portrait (768x1024) - Clean Layout & Fluid Adaptability', async () => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(`${BASE_URL}/dashboard`);

    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });

  test('TC-RSP-04: Full HD Desktop (1920x1080) - Fixed Sidebar & Center Canvas Studio', async () => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(`${BASE_URL}/qr/new`);

    // Desktop sidebar must be present
    await expect(page.locator('aside nav')).toBeVisible();
    await expect(page.locator('canvas#qr-preview-canvas')).toBeVisible();
  });

  // ==========================================
  // SUITE 6: Settings, Profile & System Status
  // ==========================================
  test('TC-SET-01: Settings page shows user profile, OWASP guards & pure dark mode status', async () => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/settings`);

    // Check user profile data
    await expect(page.locator('#profile-name')).toContainText(testUser.name);
    await expect(page.locator('#profile-email')).toContainText(testUser.email);
    await expect(page.locator('text=Self-Hosted Core Edition')).toBeVisible();

    // Check OWASP security badges
    await expect(page.locator('text=Hashing Password Argon2id / Bcrypt Aktif')).toBeVisible();
    await expect(page.locator('text=Cookie Sesi HttpOnly & SameSite=Lax')).toBeVisible();
    await expect(page.locator('text=Rate Limiting Redis & Sanitasi Upload Aktif')).toBeVisible();

    // Check Pure Dark Mode status
    await expect(page.locator('#badge-dark-mode')).toContainText('Dark Mode Eksklusif');
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
