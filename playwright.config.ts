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

  retries: 1,
  fullyParallel: true,
  workers: process.env.CI ? 5 : undefined, // better local dev

  reporter: process.env.CI
    ? [
        ['blob'],
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
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
});