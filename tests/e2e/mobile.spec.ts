import { test, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe.serial('Mobile Viewport & Responsiveness QE Audit (393x851)', () => {
  let context: BrowserContext;
  let page: Page;

  const timestamp = Date.now();
  const mobileUser = {
    name: 'Rian Mobile Tester',
    email: `mobile_qe_${timestamp}@miqr.test`,
    password: 'Password123!',
  };

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 393, height: 851 },
      isMobile: true,
      hasTouch: true,
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('TC-MOB-01: Landing Page Mobile Responsiveness & Zero Horizontal Overflow', async () => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/MiQR/);

    // 1. Assert No Horizontal Scroll on Mobile
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 2. Hero Elements are visible and properly sized
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Generate QR Code Profesional');

    // 3. CTA Buttons are touch friendly (min 44px)
    const ctaButton = page.locator('#hero-cta-create');
    await expect(ctaButton).toBeVisible();
    const ctaBox = await ctaButton.boundingBox();
    expect(ctaBox).not.toBeNull();
    if (ctaBox) {
      expect(ctaBox.height).toBeGreaterThanOrEqual(44);
    }

    // 4. Mobile Pure Dark Mode
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('TC-MOB-02: Mobile Registration & Form Usability', async () => {
    await page.goto(`${BASE_URL}/register`);

    // Verify zero horizontal overflow on register
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify fields are visible and touch-accessible
    await expect(page.locator('#reg-name')).toBeVisible();
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-password')).toBeVisible();
    await expect(page.locator('#reg-confirm-password')).toBeVisible();

    await page.fill('#reg-name', mobileUser.name);
    await page.fill('#reg-email', mobileUser.email);
    await page.fill('#reg-password', mobileUser.password);
    await page.fill('#reg-confirm-password', mobileUser.password);

    await page.click('#btn-submit-register');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
  });

  test('TC-MOB-03: Mobile Dashboard, Drawer Navigation & Responsive Card Stacking', async () => {
    // Verify zero horizontal overflow on Dashboard
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify metric cards are stacked vertically (all visible)
    await expect(page.locator('#stat-total-qr')).toBeVisible();
    await expect(page.locator('#stat-storage-used')).toBeVisible();
    await expect(page.locator('#stat-storage-available')).toBeVisible();

    // Verify sidebar is hidden by default on mobile
    const sidebar = page.locator('aside');
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    // Open Mobile Drawer Menu
    const openBtn = page.locator('#btn-open-sidebar');
    await expect(openBtn).toBeVisible();
    await openBtn.click();

    // Verify sidebar is now open
    await expect(sidebar).toHaveClass(/translate-x-0/);

    // Close Mobile Drawer via close button
    const closeBtn = page.locator('#btn-close-sidebar');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();
    await expect(sidebar).toHaveClass(/-translate-x-full/);

    // Reopen drawer and navigate to QR studio
    await openBtn.click();
    await expect(sidebar).toHaveClass(/translate-x-0/);
    await page.waitForSelector('#nav-link-buat-qr-baru', { state: 'visible' });
    await page.click('#nav-link-buat-qr-baru');
    await page.waitForURL('**/qr/new');
  });

  test('TC-MOB-04: Mobile QR Studio Layout & Canvas Rendering', async () => {
    // Verify zero horizontal overflow on QR Studio
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 1. Form Inputs
    await page.fill('#qr-name-input', 'QR Cafe Mobile Test');

    // 2. Tipe Konten Selector (3 cols on mobile)
    await expect(page.locator('#type-btn-url')).toBeVisible();
    await expect(page.locator('#type-btn-wifi')).toBeVisible();
    await page.click('#type-btn-wifi');

    await page.fill('#wifi-ssid-input', 'Cafe_Free_Wifi');
    await page.fill('#wifi-password-input', 'KopiEnak2026');

    // 3. Error Correction Buttons
    await page.click('#ec-btn-q');

    // 4. WCAG Contrast Badge
    const contrastBadge = page.locator('#wcag-contrast-badge');
    await expect(contrastBadge).toBeVisible();

    // 5. Canvas Live Preview on Mobile (must scale and not exceed viewport)
    const canvas = page.locator('#qr-preview-canvas');
    await expect(canvas).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    if (canvasBox) {
      expect(canvasBox.width).toBeLessThanOrEqual(393);
    }

    // 6. Save Button on Mobile
    const saveBtn = page.locator('#btn-save-to-cloud');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('#qr-items-grid')).toContainText('QR Cafe Mobile Test');
  });

  test('TC-MOB-05: Mobile Storage & Settings Views', async () => {
    const openBtn = page.locator('#btn-open-sidebar');

    // Storage page
    await openBtn.click();
    await page.waitForSelector('#nav-link-penyimpanan', { state: 'visible' });
    await page.click('#nav-link-penyimpanan');
    await page.waitForURL('**/storage');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    await expect(page.locator('h1')).toContainText('Penyimpanan Cloud Mandiri');

    // Settings page
    await openBtn.click();
    await page.waitForSelector('#nav-link-pengaturan', { state: 'visible' });
    await page.click('#nav-link-pengaturan');
    await page.waitForURL('**/settings');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
    await expect(page.locator('h1')).toContainText('Pengaturan Akun & Preferensi');
    await expect(page.locator('#profile-name')).toContainText(mobileUser.name);
    await expect(page.locator('#profile-email')).toContainText(mobileUser.email);
  });
});
