import { Page } from '@playwright/test';

const COOKIE_AGREE_SELECTOR    = 'button.agree-button';
const COOKIE_POPUP_CLASS       = 'eu-cookie-compliance-popup-open';
const ANNOUNCEMENT_CLOSE       = '.esc-announcement-banner__close';
const MAX_WAIT_MS              = 15_000;
const POLL_INTERVAL_MS         = 400;

/**
 * CSS that hides third-party chat/feedback widgets before a snapshot.
 * Covers the most common embed patterns (fixed iframes, known vendor IDs/classes).
 * Add selectors here whenever a new widget causes visual noise.
 */
const HIDE_WIDGETS_CSS = `
  /* Generic: hide any fixed-position iframe (chat, feedback, survey widgets) */
  iframe[style*="position: fixed"],
  iframe[style*="position:fixed"] { display: none !important; }

  /* Google reCAPTCHA badge */
  .grecaptcha-badge { display: none !important; }

  /* Salesforce Embedded Service */
  .embeddedServiceHelpButton,
  .embeddedServiceSidebar,
  embeddedservice-chat-header,
  .slds-utility-panel { display: none !important; }

  /* Drift */
  #drift-widget,
  #drift-frame-controller,
  #drift-frame-chat { display: none !important; }

  /* Intercom */
  #intercom-container,
  .intercom-lightweight-app,
  .intercom-namespace { display: none !important; }

  /* Zendesk */
  #launcher,
  #webWidget { display: none !important; }

  /* HubSpot */
  #hubspot-messages-iframe-container { display: none !important; }

  /* LiveChat */
  #chat-widget-container { display: none !important; }

  /* Freshdesk / Freshchat */
  #freshworks-container,
  #fc_frame { display: none !important; }

  /* Generic "Chat" floating buttons that haven't fully initialised */
  [id*="chat"][style*="position: fixed"],
  [class*="chat-widget"][style*="position: fixed"],
  [id*="livechat"],
  [class*="livechat"] { display: none !important; }
`;

/**
 * Click the EU cookie consent agree button and wait for the popup to close.
 * Safe to call on any page — does nothing if the popup is not present.
 */
export async function acceptCookies(page: Page): Promise<void> {
  const isOpen = await page.evaluate(
    (cls) => document.body.classList.contains(cls),
    COOKIE_POPUP_CLASS,
  ).catch(() => false);

  if (!isOpen) return;

  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    const clicked = await page.evaluate((selector) => {
      const btn = document.querySelector(selector) as HTMLButtonElement | null;
      if (!btn) return false;
      btn.click();
      return true;
    }, COOKIE_AGREE_SELECTOR);

    if (!clicked) return;

    const closed = await page
      .waitForFunction(
        (cls) => !document.body.classList.contains(cls),
        COOKIE_POPUP_CLASS,
        { timeout: 5_000 },
      )
      .then(() => true)
      .catch(() => false);

    if (closed) return;

    await page.waitForTimeout(POLL_INTERVAL_MS);
  }
}

/**
 * Click the ESC announcement banner close button and wait for it to disappear.
 * Safe to call on any page — does nothing if the banner is not present.
 */
export async function dismissAnnouncementBanner(page: Page): Promise<void> {
  const closeBtn = page.locator(ANNOUNCEMENT_CLOSE).first();
  const isVisible = await closeBtn.isVisible().catch(() => false);

  if (!isVisible) return;

  const deadline = Date.now() + MAX_WAIT_MS;

  while (Date.now() < deadline) {
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(POLL_INTERVAL_MS);

    const stillVisible = await closeBtn.isVisible().catch(() => false);
    if (!stillVisible) return;
  }
}

/**
 * Hide third-party chat / feedback widgets before a snapshot.
 *
 * Two-pass strategy:
 *  1. CSS injection — covers known vendors by selector (fast, declarative).
 *  2. Computed-style sweep — walks every DOM element and forcibly hides
 *     anything with `position:fixed` and z-index > 999.  This catches widgets
 *     that use non-standard class/id names and is immune to selector changes.
 *     A MutationObserver keeps newly-injected widget nodes hidden too.
 *
 * Root cause of "duplicated" widget in full-page screenshots: Playwright
 * scrolls the page to stitch a full-page image, so a `position:fixed` element
 * that isn't hidden appears once per viewport-height of content.
 */
export async function hideChatWidgets(page: Page): Promise<void> {
  // Pass 1 — inject CSS for known vendor selectors.
  await page.addStyleTag({ content: HIDE_WIDGETS_CSS });

  // Wait for any asynchronously-loaded widget scripts to finish rendering.
  await page.waitForLoadState('networkidle').catch(() => { /* ignore timeout */ });

  // Pass 2 — computed-style sweep + MutationObserver to catch anything that
  // doesn't match our CSS selectors.
  await page.evaluate(() => {
    const hideFixed = () => {
      // Hide fixed-position elements in the bottom half of the viewport —
      // chat launchers and reCAPTCHA badges always live there.
      // Elements in the top half (nav/header) are left untouched.
      const midpoint = window.innerHeight / 2;

      document.querySelectorAll<HTMLElement>('body *').forEach((el) => {
        try {
          const s = window.getComputedStyle(el);
          if (s.position !== 'fixed') return;
          const rect = el.getBoundingClientRect();
          // Hide if the element starts in the bottom half OR is an iframe
          // (iframes used by chat widgets are always fixed regardless of position).
          const isBottomHalf = rect.top >= midpoint;
          const isFixedIframe = el.tagName === 'IFRAME';
          if (isBottomHalf || isFixedIframe) {
            el.style.setProperty('display', 'none', 'important');
          }
        } catch (_) { /* skip inaccessible elements */ }
      });
    };

    hideFixed();

    // Watch for widget nodes injected after the initial sweep.
    const observer = new MutationObserver(hideFixed);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 8_000);
  }).catch(() => {}); // best-effort — don't fail the test if page is in a bad state

  // One extra frame for styles to apply before the caller captures.
  await page.waitForTimeout(300);
}

/**
 * Pause all videos and freeze CSS animations before a snapshot.
 * The hero on the home page is a looping background video — pausing it
 * and snapping to frame 0 ensures two consecutive screenshots are identical.
 */
export async function stopCarousels(page: Page): Promise<void> {
  await page.evaluate(() => {
    // ── Videos ───────────────────────────────────────────────────────────────
    document.querySelectorAll<HTMLVideoElement>('video').forEach((v) => {
      v.pause();
      v.currentTime = 0;
    });

    // ── CSS animations / transitions ─────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `*, *::before, *::after {
      animation: none !important;
      animation-play-state: paused !important;
      transition: none !important;
    }`;
    document.head.appendChild(style);

    // ── JavaScript carousel libraries ────────────────────────────────────────
    // Swiper (used on many ESC pages)
    document.querySelectorAll<HTMLElement & { swiper?: any }>('.swiper, [class*="swiper"]').forEach((el) => {
      try { el.swiper?.autoplay?.stop(); el.swiper?.disable(); } catch (_) {}
    });

    // Slick slider
    document.querySelectorAll<HTMLElement & { slick?: any }>('.slick-slider').forEach((el) => {
      try { (el as any).slick?.slickPause(); } catch (_) {}
    });

    // Glide.js
    document.querySelectorAll<HTMLElement & { _g?: any }>('[data-glide-el]').forEach((el) => {
      try { el._g?.pause(); } catch (_) {}
    });

    // Splide
    document.querySelectorAll<HTMLElement & { splide?: any }>('.splide').forEach((el) => {
      try { el.splide?.Components?.Autoplay?.pause(); } catch (_) {}
    });

    // Generic: pause any element that exposes autoplay/play controls
    document.querySelectorAll<HTMLElement>('[data-autoplay], [data-cycling="true"]').forEach((el) => {
      try {
        (el as any).stop?.();
        (el as any).pause?.();
      } catch (_) {}
    });

    // ── requestAnimationFrame — replace with a no-op to stop JS render loops ─
    // This is the last resort for any custom JS animation not covered above.
    // Safe to do here because we take the screenshot immediately after.
    const _raf = window.requestAnimationFrame;
    window.requestAnimationFrame = (cb) => window.setTimeout(cb, 100_000) as unknown as number;
    window.cancelAnimationFrame = (id) => window.clearTimeout(id);
    // Restore after 10s so other page functionality isn't permanently broken
    // in case the test needs further interaction after the screenshot.
    setTimeout(() => { window.requestAnimationFrame = _raf; }, 10_000);
  }).catch(() => {});

  // Wait for one paint cycle after all animations are frozen.
  await page.waitForTimeout(500);
}

/**
 * Run all pre-screenshot setup steps in order:
 * 1. Accept cookie consent popup
 * 2. Dismiss announcement banner
 * 3. Hide third-party chat / feedback widgets
 * 4. Stop carousels / sliders
 *
 * Call this in beforeEach or at the start of each test after navigation.
 */
export async function preparePageForSnapshot(page: Page): Promise<void> {
  await acceptCookies(page).catch(() => {});
  await dismissAnnouncementBanner(page).catch(() => {});
  await hideChatWidgets(page).catch(() => {});
  await stopCarousels(page).catch(() => {});
}
