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

    // Install fake clock BEFORE navigation so all JS timers (setInterval,
    // setTimeout, requestAnimationFrame) are intercepted from the very first
    // script execution — including carousel auto-play initialisation.
    // The clock starts paused, so no timer callbacks fire automatically.
    await page.clock.install();

    await page.goto(p.path, { waitUntil: 'load', timeout: 90_000 });

    // Advance fake clock by 5s to flush any deferred renders / lazy-load
    // callbacks that fire shortly after page load, without actually waiting 5s.
    await page.clock.runFor(5_000);

    await preparePageForSnapshot(page);

    // Freeze the clock — no more timer callbacks will ever fire again.
    // The carousel is now permanently stuck on the current slide.
    await page.clock.pauseAt(new Date());

    // Brief real-time settle before capture.
    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot(`${toSlug(p.name)}.png`, {
      fullPage: true,
      timeout: 30_000,
    });
  });
}
