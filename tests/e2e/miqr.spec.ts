import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('MiQR SaaS QR Code Platform Complete User Flow', () => {
  const timestamp = Date.now();
  const testUser = {
    name: 'Budi Test Engineer',
    email: `budi_flow_${timestamp}@miqr.test`,
    password: 'Password123!',
  };

  test('Complete E2E Journey: Landing -> Register -> Dashboard -> Create QR -> Storage -> Settings -> Delete -> Logout', async ({ page }) => {
    // 1. Landing Page & Theme Toggle
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/MiQR/);
    await expect(page.locator('h1')).toContainText('Generate QR Code Profesional');

    const navigateNav = async (selector: string) => {
      const openBtn = page.locator('#btn-open-sidebar');
      if (await openBtn.isVisible()) {
        await openBtn.click();
        await page.waitForSelector(selector, { state: 'visible' });
      }
      await page.click(selector);
    };

    // 2. Register New User
    await page.click('#btn-nav-register');
    await page.waitForURL('**/register');

    await page.fill('#reg-name', testUser.name);
    await page.fill('#reg-email', testUser.email);
    await page.fill('#reg-password', testUser.password);
    await page.fill('#reg-confirm-password', testUser.password);
    await page.click('#btn-submit-register');

    // Otomatis diarahkan ke Dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await expect(page.locator('#stat-total-qr')).toContainText('0 Kode');

    // 3. Masuk ke Studio & Buat QR Code
    await page.click('#btn-create-qr-dashboard');
    await page.waitForURL('**/qr/new');

    await page.fill('#qr-name-input', 'QR Website Official');
    await page.click('#type-btn-url');
    await page.fill('#url-input', 'https://antigravity.dev');
    await page.click('#ec-btn-h');

    // Verifikasi Canvas Live Preview & Evaluasi WCAG
    await expect(page.locator('#wcag-contrast-badge')).toBeVisible();
    await expect(page.locator('#qr-preview-canvas')).toBeVisible();

    // Simpan ke Cloud MiQR
    await page.click('#btn-save-to-cloud');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 4. Verifikasi di Dashboard
    await expect(page.locator('#stat-total-qr')).toContainText('1 Kode');
    await expect(page.locator('#qr-items-grid')).toContainText('QR Website Official');
    await expect(page.locator('#qr-items-grid')).toContainText('EC: H');

    // 5. Cek Halaman Storage
    await navigateNav('#nav-link-penyimpanan');
    await page.waitForURL('**/storage');
    await expect(page.locator('h1')).toContainText('Penyimpanan Cloud Mandiri');
    await expect(page.locator('body')).toContainText('Status Kuota Aset');

    // 6. Cek Halaman Settings
    await navigateNav('#nav-link-pengaturan');
    await page.waitForURL('**/settings');
    await expect(page.locator('#profile-name')).toContainText(testUser.name);
    await expect(page.locator('#profile-email')).toContainText(testUser.email);

    // 7. Kembali ke Dashboard & Hapus QR Code
    await navigateNav('#nav-link-ringkasan');
    await page.waitForURL('**/dashboard');

    page.on('dialog', (dialog) => dialog.accept());
    const deleteBtn = page.locator('button[id^="btn-delete-"]').first();
    await deleteBtn.click();
    await expect(page.locator('#stat-total-qr')).toContainText('0 Kode', { timeout: 5000 });

    // 8. Logout & Verifikasi Proteksi Rute
    await navigateNav('#btn-logout');
    await page.waitForURL('**/login');
    await expect(page).toHaveURL(`${BASE_URL}/login`);

    // Uji Middleware: Coba akses /dashboard saat logout
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL('**/login**');
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/login`));
  });
});
