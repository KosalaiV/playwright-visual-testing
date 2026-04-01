import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ quiet: true });

// ── Environment selection ────────────────────────────────────────────────────
const ENV = (process.env.TEST_ENV || 'uat').toLowerCase();

const BASE_URLS: Record<string, string> = {
  dev:  'https://drupal.dev.energysafetycanada.com',
  test: 'https://drupal.test.energysafetycanada.com',
  uat:  'https://drupal.uat.energysafetycanada.com',
  beta: 'https://beta.energysafetycanada.com',
  prod: 'https://energysafetycanada.com',
};

if (!BASE_URLS[ENV]) {
  throw new Error(
    `Unknown TEST_ENV "${ENV}".\n` +
    `Valid values: ${Object.keys(BASE_URLS).join(', ')}`
  );
}

const baseURL = BASE_URLS[ENV];

// ── HTTP basic auth ──────────────────────────────────────────────────────────
const httpCredentials = process.env.HTACCESS_USER
  ? { username: process.env.HTACCESS_USER, password: process.env.HTACCESS_PASS || '' }
  : undefined;

export default defineConfig({
  testDir: './tests',
  globalSetup: require.resolve('./helpers/global-setup'),

  // 🔥 IMPORTANT: baseline location (used by CI artifact system)
  snapshotDir: './snapshots',

  // 🔥 IMPORTANT: ensure consistent path across CI + local
  snapshotPathTemplate:
    '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',

  // 🔥 NEW: isolate temp outputs from snapshots (prevents corruption)
  outputDir: 'test-results',

  retries: 0,
  fullyParallel: true,
  workers: process.env.CI ? 5 : undefined, // better local dev

  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : [['html', { open: 'never' }]],

  use: {
    baseURL,
    httpCredentials,

    navigationTimeout: 90_000,
    actionTimeout: 15_000,

    headless: process.env.HEADED !== '1',

    screenshot: 'off',

    ignoreHTTPSErrors: ENV !== 'prod',

    locale: 'en-US',

    // 🔥 NEW: stabilize rendering across environments
    deviceScaleFactor: 1,
  },

  expect: {
    toHaveScreenshot: {
      timeout: 30_000,
      maxDiffPixelRatio: 0.005,

      stylePath: path.join(__dirname, 'styles/snapshot.css'),

      animations: 'disabled',

      // 🔥 NEW: critical for cross-env stability (CI vs local)
      scale: 'css',

      // 🔥 NEW: reduce flaky diffs (especially fonts/rendering)
      caret: 'hide',
    },
  },

  projects: [
    // ── Chrome (Chromium engine) ─────────────────────────────────────────────
    // Desktop: standard desktop Chrome UA, 1440×900
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'],   viewport: { width: 1440, height: 900 } },
    },
    // Tablet: iPad Pro 11 — touch enabled, iPad UA, 834×1194 @ 2x DPR
    {
      name: 'tablet-chromium',
      use: { ...devices['iPad Pro 11'] },
    },
    // Mobile: Pixel 7 — Android Chrome UA, 412×915 @ 2.625x DPR, touch
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },

    // ── Firefox (Gecko engine) ───────────────────────────────────────────────
    // Desktop: standard desktop Firefox UA, 1440×900
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'],  viewport: { width: 1440, height: 900 } },
    },
    // Tablet: iPad Pro 11 characteristics (touch, DPR, viewport) on Gecko engine
    {
      name: 'tablet-firefox',
      use: { ...devices['iPad Pro 11'] },
    },
    // Mobile: Pixel 7 characteristics (touch, DPR, viewport) on Gecko engine
    {
      name: 'mobile-firefox',
      use: { ...devices['Pixel 7'] },
    },

    // ── Safari (WebKit engine) ───────────────────────────────────────────────
    // Desktop: standard desktop Safari UA, 1440×900
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'],   viewport: { width: 1440, height: 900 } },
    },
    // Tablet: iPad Pro 11 — real iPad Safari UA, touch, 2x DPR, on WebKit engine
    {
      name: 'tablet-webkit',
      use: { ...devices['iPad Pro 11'] },
    },
    // Mobile: iPhone 14 — real iPhone Safari UA, touch, 3x DPR, 390×844
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone 14'] },
    },
  ],
});