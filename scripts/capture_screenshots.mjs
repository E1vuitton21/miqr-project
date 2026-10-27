import { chromium } from '@playwright/test';
import path from 'path';

import fs from 'fs';

const ARTIFACT_DIR = process.env.ARTIFACT_DIR || path.join(process.cwd(), 'screenshots');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function capture() {
  console.log('Launching Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // 1. Landing Page
  console.log('Capturing Landing Page...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'landing_page.png'), fullPage: true });

  // 2. Register Page
  console.log('Capturing Register Page...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'register_page.png') });

  // Register user
  const email = `visual_${Date.now()}@miqr.io`;
  await page.fill('#reg-name', 'Visual Reviewer');
  await page.fill('#reg-email', email);
  await page.fill('#reg-password', 'Password123!');
  await page.fill('#reg-confirm-password', 'Password123!');
  await page.click('#btn-submit-register');
  await page.waitForURL('**/dashboard');

  // 3. Dashboard Empty State
  console.log('Capturing Dashboard Empty State...');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_empty.png'), fullPage: true });

  // 4. QR Studio Page
  console.log('Capturing QR Studio Page...');
  await page.goto(`${BASE_URL}/qr/new`, { waitUntil: 'networkidle' });
  await page.fill('#qr-name-input', 'QR Promosi UMKM 2026');
  await page.fill('#url-input', 'https://miqr.example.com/promo');
  await page.click('#ec-btn-q');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'qr_studio.png'), fullPage: true });

  // Save QR to cloud
  await page.click('#btn-save-to-cloud');
  await page.waitForURL('**/dashboard');

  // 5. Dashboard with QR Card
  console.log('Capturing Dashboard with Active QR Code...');
  await page.waitForSelector('#qr-items-grid');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'dashboard_with_qr.png'), fullPage: true });

  // 6. Storage Page
  console.log('Capturing Storage Page...');
  await page.goto(`${BASE_URL}/storage`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'storage_page.png'), fullPage: true });

  // 7. Settings Page
  console.log('Capturing Settings Page...');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'settings_page.png'), fullPage: true });

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((e) => {
  console.error('Error capturing screenshots:', e);
  process.exit(1);
});
