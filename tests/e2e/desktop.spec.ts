import { test, expect, Page, BrowserContext } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe.serial('Desktop Viewport & Functional QE Audit (1280x800)', () => {
  let context: BrowserContext;
  let page: Page;

  const timestamp = Date.now();
  const desktopUser = {
    name: 'Dimas Desktop Engineer',
    email: `desktop_qe_${timestamp}@miqr.test`,
    password: 'Password123!',
  };

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('TC-DSK-01: Landing Page Desktop Layout & Section Architecture', async () => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/MiQR/);

    // 1. Assert Desktop Navigation Links in Header Nav
    await expect(page.locator('header nav a[href="#fitur"]')).toBeVisible();
    await expect(page.locator('header nav a[href="#keamanan"]')).toBeVisible();
    await expect(page.locator('header nav a[href="#spesifikasi"]')).toBeVisible();
    await expect(page.locator('#btn-nav-login')).toBeVisible();
    await expect(page.locator('#btn-nav-register')).toBeVisible();

    // 2. Assert Zero Horizontal Overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // 3. Assert Feature Section Exists
    const featureSection = page.locator('#fitur');
    await expect(featureSection).toBeVisible();

    // 4. Assert Pure Dark Mode
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('TC-DSK-02: Authentication Flow, Validation & Security Controls', async () => {
    // 1. Test Login Error Handling with invalid credentials
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#login-email', 'nonexistent_user@miqr.test');
    await page.fill('#login-password', 'WrongPassword123');
    await page.click('#btn-submit-login');
    await expect(page.locator('#login-error-alert')).toBeVisible();

    // 2. Test Registration with valid credentials
    await page.goto(`${BASE_URL}/register`);
    await page.fill('#reg-name', desktopUser.name);
    await page.fill('#reg-email', desktopUser.email);
    await page.fill('#reg-password', desktopUser.password);
    await page.fill('#reg-confirm-password', desktopUser.password);
    await page.click('#btn-submit-register');

    // 3. Auto-redirect to Dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page).toHaveURL(`${BASE_URL}/dashboard`);
    await expect(page.locator('#stat-total-qr')).toContainText('0 Kode');
  });

  test('TC-DSK-03: Desktop Dashboard & 3-Column Metric Cards', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Verify Sticky Sidebar is visible on desktop
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
    await expect(sidebar).toHaveClass(/md:sticky/);

    // Verify 3 Metric Cards are horizontally aligned and visible
    await expect(page.locator('#stat-total-qr')).toBeVisible();
    await expect(page.locator('#stat-storage-used')).toBeVisible();
    await expect(page.locator('#stat-storage-available')).toBeVisible();

    // Verify Navigation links in sidebar
    await expect(page.locator('#nav-link-ringkasan')).toBeVisible();
    await expect(page.locator('#nav-link-buat-qr-baru')).toBeVisible();
    await expect(page.locator('#nav-link-penyimpanan')).toBeVisible();
    await expect(page.locator('#nav-link-pengaturan')).toBeVisible();
  });

  test('TC-DSK-04: QR Studio 2-Panel Layout, WCAG Contrast & Generation', async () => {
    await page.goto(`${BASE_URL}/qr/new`);

    // Verify 2-panel grid layout (Form left, Sticky Preview right)
    await expect(page.locator('#qr-name-input')).toBeVisible();
    await expect(page.locator('#qr-preview-canvas')).toBeVisible();

    // Configure QR parameters
    await page.fill('#qr-name-input', 'Desktop Enterprise QR');
    await page.click('#type-btn-url');
    await page.fill('#url-input', 'https://github.com/google');

    // Test WCAG Contrast calculation
    const contrastBadge = page.locator('#wcag-contrast-badge');
    await expect(contrastBadge).toBeVisible();
    await expect(contrastBadge).toContainText('Kontras Luar Biasa');

    // Select Error Correction H
    await page.click('#ec-btn-h');

    // Save to Cloud
    await page.click('#btn-save-to-cloud');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Assert item shows up in grid with EC: H
    await expect(page.locator('#stat-total-qr')).toContainText('1 Kode');
    await expect(page.locator('#qr-items-grid')).toContainText('Desktop Enterprise QR');
    await expect(page.locator('#qr-items-grid')).toContainText('EC: H');
  });

  test('TC-DSK-05: Storage Quota Reflection & Settings Verification', async () => {
    // 1. Storage Quota Page
    await page.click('#nav-link-penyimpanan');
    await page.waitForURL('**/storage');
    await expect(page.locator('h1')).toContainText('Penyimpanan Cloud Mandiri');

    // 2. Settings Page
    await page.click('#nav-link-pengaturan');
    await page.waitForURL('**/settings');
    await expect(page.locator('#profile-name')).toContainText(desktopUser.name);
    await expect(page.locator('#profile-email')).toContainText(desktopUser.email);
  });

  test('TC-DSK-06: Cleanup (Delete QR) & Logout Middleware Security Boundary', async () => {
    await page.click('#nav-link-ringkasan');
    await page.waitForURL('**/dashboard');

    // Delete item
    page.on('dialog', (dialog) => dialog.accept());
    const deleteBtn = page.locator('button[id^="btn-delete-"]').first();
    await deleteBtn.click();
    await expect(page.locator('#stat-total-qr')).toContainText('0 Kode', { timeout: 5000 });

    // Logout
    await page.click('#btn-logout');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // Verify Middleware rejects unauthorized dashboard access
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL('**/login**');
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`));
  });
});
