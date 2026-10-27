import { test } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/mallfnnm/.gemini/antigravity-ide/brain/4fac79db-d893-4d2a-adb8-98e117603f27/screenshots';
const BASE_URL = 'http://localhost:3001';

test.describe('Automated Visual QE Screenshot Capture', () => {
  const timestamp = Date.now();
  const visualUser = {
    name: 'Visual QE Reviewer',
    email: `visual_qe_${timestamp}@miqr.test`,
    password: 'Password123!',
  };

  test('Capture Complete Desktop Visual Audit (Pure Dark Mode)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // 1. Landing Page (Pure Dark)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_01_landing_dark.png'), fullPage: true });

    // 2. Login Page
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_03_login.png') });

    // 4. Register Page & User Creation
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_04_register.png') });

    await page.fill('#reg-name', visualUser.name);
    await page.fill('#reg-email', visualUser.email);
    await page.fill('#reg-password', visualUser.password);
    await page.fill('#reg-confirm-password', visualUser.password);
    await page.click('#btn-submit-register');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 5. Dashboard Empty State
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_05_dashboard_empty.png'), fullPage: true });

    // 6. QR Studio Page
    await page.goto(`${BASE_URL}/qr/new`, { waitUntil: 'networkidle' });
    await page.fill('#qr-name-input', 'QR Desktop Showcase');
    await page.click('#type-btn-url');
    await page.fill('#url-input', 'https://miqr.example.com/showcase');
    await page.click('#ec-btn-q');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_06_qr_studio_canvas.png'), fullPage: true });

    // Save to Cloud
    await page.click('#btn-save-to-cloud');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 7. Dashboard with Active QR Code Card
    await page.waitForSelector('#qr-items-grid');
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_07_dashboard_with_qr.png'), fullPage: true });

    // 8. Storage Page
    await page.goto(`${BASE_URL}/storage`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_08_storage.png'), fullPage: true });

    // 9. Settings Page
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_09_settings.png'), fullPage: true });

    await context.close();
  });

  test('Capture Complete Mobile Visual Audit (Pure Dark Mode)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 393, height: 851 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();

    // 1. Mobile Landing Page (Pure Dark)
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_01_landing_dark.png'), fullPage: true });

    // 3. Mobile Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_03_login.png') });

    // 4. Mobile Register
    await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_04_register.png') });

    // Login with existing user
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('#login-email', visualUser.email);
    await page.fill('#login-password', visualUser.password);
    await page.click('#btn-submit-login');
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // 5. Mobile Dashboard (Stacked Cards)
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_05_dashboard_cards.png'), fullPage: true });

    // 6. Mobile Drawer Navigation Open
    const openMenuBtn = page.locator('#btn-open-sidebar');
    await openMenuBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_06_drawer_menu_open.png') });

    // Close menu & navigate to QR Studio
    const closeMenuBtn = page.locator('#btn-close-sidebar');
    await closeMenuBtn.click();
    await page.waitForTimeout(300);

    // 7. Mobile QR Studio (Form + Canvas)
    await page.goto(`${BASE_URL}/qr/new`, { waitUntil: 'networkidle' });
    await page.fill('#qr-name-input', 'QR Mobile Showcase');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_07_qr_studio_mobile.png'), fullPage: true });

    // 8. Mobile Storage
    await page.goto(`${BASE_URL}/storage`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_08_storage_mobile.png'), fullPage: true });

    // 9. Mobile Settings
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'mobile_09_settings_mobile.png'), fullPage: true });

    await context.close();
  });
});
