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
  // CI: 4 workers is safe on 2-core GitHub runners; workflows override per-job
  workers: process.env.CI ? 4 : undefined,

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
    // Tablet: iPad Mini — 768×1024 @ 2x DPR, touch, iPad UA
    // NOTE: devices['iPad Mini'] sets defaultBrowserType:'webkit' — override to chromium.
    {
      name: 'tablet-chromium',
      use: { ...devices['iPad Mini'], defaultBrowserType: 'chromium' },
    },
    // Mobile: 375×812 — standard modern phone viewport (matches iPhone X CSS pixels)
    // No Playwright Android preset exists at 375px, so we define it explicitly.
    {
      name: 'mobile-chromium',
      use: {
        viewport:          { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile:          true,
        hasTouch:          true,
        defaultBrowserType: 'chromium',
      },
    },

    // ── Firefox (Gecko engine) ───────────────────────────────────────────────
    // Desktop: standard desktop Firefox UA, 1440×900
    {
      name: 'desktop-firefox',
      use: { ...devices['Desktop Firefox'],  viewport: { width: 1440, height: 900 } },
    },
    // Tablet: 768×1024 on Gecko engine — uses Desktop Firefox UA
    // (iPad UA is Safari-specific; emulating it in Firefox produces inconsistent results)
    {
      name: 'tablet-firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 768, height: 1024 } },
    },
    // Mobile: 375×812 — matches the chromium and webkit mobile viewport exactly
    {
      name: 'mobile-firefox',
      use: {
        viewport:          { width: 375, height: 812 },
        deviceScaleFactor: 2,
        isMobile:          true,
        hasTouch:          true,
        defaultBrowserType: 'firefox',
      },
    },

    // ── Safari (WebKit engine) ───────────────────────────────────────────────
    // Desktop: standard desktop Safari UA, 1440×900
    {
      name: 'desktop-webkit',
      use: { ...devices['Desktop Safari'],   viewport: { width: 1440, height: 900 } },
    },
    // Tablet: iPad Mini — 768×1024 @ 2x DPR, real iPad Safari UA, touch
    {
      name: 'tablet-webkit',
      use: { ...devices['iPad Mini'] },
    },
    // Mobile: iPhone X — 375×812 @ 3x DPR, real iPhone Safari UA, touch
    // Consistent viewport width with mobile-chromium and mobile-firefox.
    {
      name: 'mobile-webkit',
      use: { ...devices['iPhone X'] },
    },
  ],
});