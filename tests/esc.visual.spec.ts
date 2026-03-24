import { test, expect } from '@playwright/test';
import { preparePageForSnapshot } from '../helpers/page-setup';
import { vrPages } from '../helpers/pages';

/**
 * ESC Visual Regression Tests — Public Pages
 *
 * Iterates every public (no-login) page defined in helpers/pages.ts,
 * waits for the page to settle, then takes a full-page screenshot and
 * compares it against the stored baseline.
 *
 * First run  : npx playwright test esc.visual --update-snapshots  → creates baselines
 * Subsequent : npx playwright test esc.visual                     → compares against them
 *
 * Snapshot storage : ./snapshots/{TEST_ENV}/{viewport}/
 */

// Public pages only — pages with a `role` are handled by esc.portal.spec.ts.
const PUBLIC_PAGES = vrPages.filter((p) => !p.role);

/** Convert a page name to a safe snapshot filename. */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

for (const p of PUBLIC_PAGES) {
  test(p.name, async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto(p.path, { waitUntil: 'load', timeout: 90_000 });

    // Let the page fully settle (hero carousel, lazy images, JS widgets).
    await page.waitForTimeout(5_000);

    await preparePageForSnapshot(page);

    // Pause after dismissing popups and stopping carousels before capturing.
    await page.waitForTimeout(3_000);

    await expect(page).toHaveScreenshot(`${toSlug(p.name)}.png`, {
      fullPage: true,
    });
  });
}
