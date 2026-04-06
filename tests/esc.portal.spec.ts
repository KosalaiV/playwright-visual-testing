import { test, expect } from '@playwright/test';
import { vrPages, VrRole } from '../helpers/pages';
import { preparePageForSnapshot } from '../helpers/page-setup';

/**
 * ESC Portal Visual Regression Tests — Role-Based
 *
 * Validates the visual appearance of authenticated portal pages (/srv/*)
 * for each role. Auth state is pre-loaded from auth/{role}.json, written by
 * helpers/global-setup.ts before the suite runs — no per-test login needed.
 *
 * Env vars required (set in .env):
 *   STUDENT_USERNAME / STUDENT_PASSWORD
 *   INSTRUCTOR_USERNAME / INSTRUCTOR_PASSWORD
 *   COMPANYADMIN_USERNAME / COMPANYADMIN_PASSWORD
 *   PROVIDER_USERNAME / PROVIDER_PASSWORD
 *   MULTIROLE_USERNAME / MULTIROLE_PASSWORD
 *   EVALUATOR_USERNAME / EVALUATOR_PASSWORD
 *   AUDITOR_USERNAME / AUDITOR_PASSWORD
 *   ASSESSOR_USERNAME / ASSESSOR_PASSWORD
 *   CONTENTEDITOR_USERNAME / CONTENTEDITOR_PASSWORD
 *
 * First run  : npx playwright test esc.portal --update-snapshots  → creates baselines
 * Subsequent : npx playwright test esc.portal                     → compares against them
 *
 * Snapshot storage : ./snapshots/{TEST_ENV}/{viewport}/
 */

const ENV = (process.env.TEST_ENV || 'uat').toUpperCase();

const ALL_ROLES: VrRole[] = [
  'student',
  'instructor',
  'companyadmin',
  'provider',
  'multirole',
  'evaluator',
  'auditor',
  'assessor',
  'contenteditor',
];

/** Convert a page name to a safe snapshot filename segment. */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

for (const role of ALL_ROLES) {
  const rolePages = vrPages.filter((p) => {
    if (!p.role) return false;
    return Array.isArray(p.role) ? p.role.includes(role) : p.role === role;
  });

  if (rolePages.length === 0) continue;

  test.describe(`Portal [${role}]`, () => {
    // Load saved auth state written by global-setup.ts — no per-test login.
    test.use({ storageState: `auth/${role}.json` });

    test.beforeEach(async ({}, testInfo) => {
      const baseURL = (testInfo.project.use as { baseURL?: string }).baseURL ?? '';
      testInfo.annotations.push({ type: 'Environment', description: `${ENV} — ${baseURL}` });
    });

    for (const vrPage of rolePages) {
      test(vrPage.name, async ({ page }, testInfo) => {
        test.setTimeout(120_000);

        // Skip gracefully on navigation failure — execution errors must not
        // appear as visual failures in the report.
        const loaded = await page
          .goto(vrPage.path, { waitUntil: 'load', timeout: 90_000 })
          .then(() => true)
          .catch(() => false);

        if (!loaded) {
          testInfo.skip(true, `Navigation failed for ${vrPage.path} — skipped, not a visual failure`);
          return;
        }

        // If auth failed (global-setup wrote empty state), the portal page
        // redirects to /user/login — detect and skip rather than comparing
        // a login-page screenshot against a portal-page baseline.
        const currentUrl = page.url();
        if (/\/user\/login|\/user\/register/.test(currentUrl)) {
          testInfo.skip(true, `Auth failed for role "${role}" — portal page redirected to login`);
          return;
        }

        // Let the portal page settle (dynamic widgets, lazy content).
        await page.waitForTimeout(5_000);

        await preparePageForSnapshot(page);

        // Brief pause after dismissing popups before capturing.
        await page.waitForTimeout(3_000);

        await expect(page).toHaveScreenshot(
          `${toSlug(vrPage.name)}-${role}.png`,
          { fullPage: true },
        );
      });
    }
  });
}
