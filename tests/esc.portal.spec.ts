import { test, expect } from '@playwright/test';
import { loginWithoutTOTP } from '../helpers/auth';
import { vrPages, VrRole } from '../helpers/pages';
import { preparePageForSnapshot } from '../helpers/page-setup';

/**
 * ESC Portal Visual Regression Tests — Role-Based
 *
 * Validates the visual appearance of authenticated portal pages (/srv/*)
 * for each role. Each describe block logs in once per role, then visits
 * every page that role is permitted to see and captures a full-page snapshot.
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
    // Log in before each test. Each Playwright test gets a fresh browser
    // context so we must authenticate per test (no shared session state).
    test.beforeEach(async ({ page }, testInfo) => {
      const baseURL = (testInfo.project.use as { baseURL?: string }).baseURL ?? '';
      testInfo.annotations.push({ type: 'Environment', description: `${ENV} — ${baseURL}` });

      // After login, Drupal may redirect to /srv/dashboard or a profile URL.
      // We use a broad pattern so loginWithoutTOTP doesn't time out waiting
      // for the default /check_logged_in=1 redirect.
      await loginWithoutTOTP(page, {
        role,
        expectedUrlPattern: /srv\/|\/u\/|\/user|check_logged_in/,
      });
    });

    for (const vrPage of rolePages) {
      test(vrPage.name, async ({ page }) => {
        test.setTimeout(120_000);

        await page.goto(vrPage.path, { waitUntil: 'load', timeout: 90_000 });

        // Let the portal page settle (dynamic widgets, lazy content).
        await page.waitForTimeout(3_000);

        await preparePageForSnapshot(page);

        // Brief pause after dismissing popups before capturing.
        await page.waitForTimeout(1_000);

        await expect(page).toHaveScreenshot(
          `${toSlug(vrPage.name)}-${role}.png`,
          { fullPage: true },
        );
      });
    }
  });
}
