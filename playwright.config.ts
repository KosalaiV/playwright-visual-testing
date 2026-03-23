import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ quiet: true });

// ── Environment selection ────────────────────────────────────────────────────
// Set TEST_ENV to choose which environment to run against.
// Defaults to 'uat' if not specified.
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

// ── HTTP basic auth (htaccess) ────────────────────────────────────────────────
// Set HTACCESS_USER and HTACCESS_PASS in .env for environments that require it.
const httpCredentials = process.env.HTACCESS_USER
  ? { username: process.env.HTACCESS_USER, password: process.env.HTACCESS_PASS || '' }
  : undefined;

export default defineConfig({
  testDir: './tests',

  // Single snapshot directory — environment is identified from the run logs.
  snapshotDir: `./snapshots`,

  // Remove platform (darwin/linux/win32) from snapshot filenames so baselines
  // captured in CI (linux) work on any OS and vice versa.
  // Default: {snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}
  snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{projectName}{ext}',

  // Re-run flaky tests once before marking as failed.
  retries: 1,

  // Run tests in parallel across workers.
  fullyParallel: true,
  workers: 5,

  // In CI: blob reporter produces mergeable output so all parallel job reports
  // can be combined into a single HTML report at the end of the run.
  // Locally: standard HTML report opened on demand via `npm run report`.
  reporter: process.env.CI
    ? [
        ['blob'],     // mergeable output — combined into one report by merge-reports job
        ['github'],   // annotates failing tests directly on PRs
      ]
    : [['html', { open: 'never' }]],

  use: {
    baseURL,
    httpCredentials,

    // Per-page navigation timeout.
    navigationTimeout: 90_000,

    // Action timeout (click, fill, etc.).
    actionTimeout: 15_000,

    // Always run headless in CI; set HEADED=1 locally to watch.
    headless: process.env.HEADED !== '1',

    // Attach a screenshot to every test in the HTML report (pass or fail).
    screenshot: 'on',

    // Ignore self-signed certs on dev/test/uat environments.
    ignoreHTTPSErrors: ENV !== 'prod',

    // Locale matches the existing tool config.
    locale: 'en-US',
  },

  expect: {
    // Global screenshot comparison defaults (mirrors toHaveScreenshot options).
    toHaveScreenshot: {
      // Allow up to 0.5% pixel difference (matches existing threshold).
      maxDiffPixelRatio: 0.005,

      // CSS injected before every screenshot.
      // Hides fixed-position third-party widgets (chat, feedback tab, reCAPTCHA)
      // that get duplicated as Playwright scrolls through the full page.
      stylePath: path.join(__dirname, 'styles/snapshot.css'),

      // Disable CSS/JS animations for deterministic screenshots.
      animations: 'disabled',
    },
  },

  // ── Viewport projects ────────────────────────────────────────────────────────
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
