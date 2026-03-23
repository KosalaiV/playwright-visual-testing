# Playwright Visual Regression Testing — Energy Safety Canada

Native Playwright visual regression test suite for the ESC website and portal. Captures full-page screenshots across multiple viewports and roles, then compares them pixel-by-pixel against a rolling baseline to catch unintended UI changes.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Project Structure](#project-structure)
- [Environments](#environments)
- [Test Suites](#test-suites)
- [Viewports](#viewports)
- [Roles](#roles)
- [Running Locally](#running-locally)
- [CI Pipeline](#ci-pipeline)
- [Snapshot Naming](#snapshot-naming)
- [How Baselines Work](#how-baselines-work)
- [Viewing Reports](#viewing-reports)
- [Adding Pages](#adding-pages)
- [Environment Variables](#environment-variables)

---

## How It Works

1. Playwright navigates to each page defined in `helpers/pages.ts`
2. Waits for the page to fully settle (hero carousels, lazy images, JS widgets)
3. Dismisses popups, cookie banners, and hides fixed-position chat widgets
4. Takes a full-page screenshot at each viewport (desktop, tablet, mobile)
5. Compares the screenshot pixel-by-pixel against the stored baseline
6. Fails the test if the difference exceeds 0.5% of total pixels

---

## Project Structure

```
playwright-visual-testing/
├── tests/
│   ├── esc.visual.spec.ts      # Public pages (no login)
│   └── esc.portal.spec.ts      # Authenticated portal pages
├── helpers/
│   ├── pages.ts                # All page definitions (paths + roles)
│   ├── page-setup.ts           # Cookie/banner/widget dismissal before screenshot
│   └── auth.ts                 # Login helpers (with and without TOTP 2FA)
├── styles/
│   └── snapshot.css            # CSS injected before screenshots to hide noise
├── snapshots/                  # Baseline screenshots (auto-managed)
├── playwright-report/          # HTML test report (generated after each run)
├── test-results/               # Diffs and traces (generated on failure)
├── playwright.config.ts        # Playwright configuration
└── .github/workflows/
    └── visual-tests.yml        # CI pipeline
```

---

## Environments

| Key    | Base URL                                        |
|--------|-------------------------------------------------|
| `dev`  | https://drupal.dev.energysafetycanada.com       |
| `test` | https://drupal.test.energysafetycanada.com      |
| `uat`  | https://drupal.uat.energysafetycanada.com       |
| `beta` | https://beta.energysafetycanada.com             |
| `prod` | https://energysafetycanada.com                  |

Set the environment via the `TEST_ENV` variable. Defaults to `uat` if not specified.

---

## Test Suites

| Suite           | File                    | Description                              |
|-----------------|-------------------------|------------------------------------------|
| Public pages    | `esc.visual.spec.ts`    | All pages that require no login          |
| Portal pages    | `esc.portal.spec.ts`    | Authenticated pages tested per role      |

Both suites run together by default.

---

## Viewports

Every page is tested at three viewport sizes:

| Name    | Resolution   | Device              |
|---------|--------------|---------------------|
| desktop | 1440 × 900   | Desktop Chrome      |
| tablet  | 768 × 1024   | Desktop Chrome      |
| mobile  | 390 × 844    | Pixel 5             |

---

## Roles

Portal pages are tested once per role that has access to them:

| Role            | Description                              |
|-----------------|------------------------------------------|
| `student`       | Learner / course participant             |
| `instructor`    | Course instructor                        |
| `companyadmin`  | Company administrator                    |
| `provider`      | Authorised training provider             |
| `multirole`     | User with multiple roles                 |
| `evaluator`     | Evaluator role                           |
| `auditor`       | Auditor role                             |
| `assessor`      | H2S Alive assessor                       |
| `contenteditor` | Content editor                           |

---

## Running Locally

### Prerequisites

```bash
node >= 18
npm install
npx playwright install chromium --with-deps
```

### Environment setup

Create a `.env` file in the project root:

```env
# HTTP basic auth (required for dev/test/uat)
HTACCESS_USER=your_user
HTACCESS_PASS=your_pass

# Portal role credentials
STUDENT_USERNAME=
STUDENT_PASSWORD=
INSTRUCTOR_USERNAME=
INSTRUCTOR_PASSWORD=
COMPANYADMIN_USERNAME=
COMPANYADMIN_PASSWORD=
PROVIDER_USERNAME=
PROVIDER_PASSWORD=
MULTIROLE_USERNAME=
MULTIROLE_PASSWORD=
EVALUATOR_USERNAME=
EVALUATOR_PASSWORD=
AUDITOR_USERNAME=
AUDITOR_PASSWORD=
ASSESSOR_USERNAME=
ASSESSOR_PASSWORD=
CONTENTEDITOR_USERNAME=
CONTENTEDITOR_PASSWORD=

```

### Commands

| Command                        | Description                                      |
|-------------------------------|--------------------------------------------------|
| `npm run test:uat`            | Run all tests against UAT                        |
| `npm run test:dev`            | Run all tests against DEV                        |
| `npm run test:test`           | Run all tests against TEST                       |
| `npm run test:prod`           | Run all tests against PROD                       |
| `npm run baseline:uat`        | Capture fresh baseline for UAT                   |
| `npm run baseline:dev`        | Capture fresh baseline for DEV                   |
| `npm run test:public:uat`     | Run public pages only against UAT                |
| `npm run test:portal:uat`     | Run portal pages only against UAT                |
| `npm run baseline:public:uat` | Capture baseline for public pages only           |
| `npm run baseline:portal:uat` | Capture baseline for portal pages only           |
| `npm run clear:snapshots`     | Delete all local baseline snapshots              |
| `npm run report`              | Open the last HTML report in browser             |

To watch tests run in a headed browser:
```bash
HEADED=1 npm run test:uat
```

---

## CI Pipeline

The pipeline is in `.github/workflows/visual-tests.yml`.

### Triggering manually

Go to **Actions → Visual Regression Tests → Run workflow** and select the environment:

```
Environment:  [ uat ▼ ]   (dev / test / uat / prod)

              [ Run workflow ]
```

That's all. The pipeline handles everything else automatically.

### What the pipeline does

The pipeline runs two jobs **in parallel** on separate runners, then merges results:

```
public job  ──┐
              ├── run simultaneously ──► merge ──► save new baseline
portal job  ──┘
```

1. **Public** and **Portal** jobs start at the same time on separate runners
2. Each job installs Node, Playwright, and logs the environment and base URL
3. Each job downloads the `visual-baseline` artifact from the last passing run
4. If a baseline exists → runs comparison
5. If no baseline exists (first run) → captures initial baseline automatically
6. Each job uploads its own partial snapshots on pass
7. **Both pass** → merge job combines snapshots and saves new `visual-baseline`
8. **Either fails** → baseline is not updated; previous baseline retained
9. Each job always uploads its own HTML report
10. On failure, each job uploads diffs and traces for debugging

### Artifacts produced

| Artifact                                     | When         | Retained  |
|----------------------------------------------|--------------|-----------|
| `visual-baseline`                            | Both pass    | 90 days   |
| `playwright-report-public-{env}-{run}`       | Always       | 30 days   |
| `playwright-report-portal-{env}-{run}`       | Always       | 30 days   |
| `test-results-public-{env}-{run}`            | Public fails | 7 days    |
| `test-results-portal-{env}-{run}`            | Portal fails | 7 days    |

---

## Snapshot Naming

Snapshots are named automatically by Playwright using the pattern:

```
{page-slug}-{role}-{viewport}-{platform}.png
```

Examples:
```
home-desktop-darwin.png
courses-tablet-darwin.png
my-certifications-student-mobile-darwin.png
user-profile-companyadmin-desktop-darwin.png
```

- Public pages have no role segment
- Portal pages include the role that accessed the page
- Platform is `darwin` locally, `linux` in CI

> **Note:** Baselines captured locally (darwin) are not compatible with CI (linux). Always use CI-captured baselines as the source of truth, or re-capture locally on the same OS.

---

## How Baselines Work

This project uses a **rolling baseline** strategy:

```
Build 1  →  no baseline found  →  captures initial baseline  →  saves as visual-baseline
Build 2  →  downloads Build 1  →  compares  →  pass  →  saves Build 2 as visual-baseline
Build 3  →  downloads Build 2  →  compares  →  pass  →  saves Build 3 as visual-baseline
Build 4  →  downloads Build 3  →  compares  →  FAIL  →  visual-baseline stays as Build 3
Build 5  →  downloads Build 3  →  compares  →  pass  →  saves Build 5 as visual-baseline
```

Key rules:
- The baseline is **always the last passing build** — no manual management needed
- A failing run never corrupts the baseline
- Cross-environment runs are supported — comparison is image vs image by filename; the environment used is always visible in the run logs and job summary

---

## Viewing Reports

After a CI run, scroll to the **Artifacts** section at the bottom of the run page and download `playwright-report-{env}-{run}`. Extract the zip and open `index.html` in a browser.

The report shows:
- Pass/fail status per test
- Screenshots attached to every test
- Visual diffs for failing tests (expected vs actual vs diff)
- Traces for step-by-step debugging

---

## Adding Pages

All pages are defined in `helpers/pages.ts`.

**Public page:**
```ts
{ name: 'My New Page', path: '/my-new-page' },
```

**Portal page (single role):**
```ts
{ name: 'My Portal Page', path: '/srv/my-portal-page', role: 'student' },
```

**Portal page (multiple roles):**
```ts
{ name: 'My Portal Page', path: '/srv/my-portal-page', role: ['student', 'instructor'] },
```

Pages without a `role` are picked up by `esc.visual.spec.ts`. Pages with a `role` are picked up by `esc.portal.spec.ts`.

After adding a page, run the baseline command once to capture its initial snapshot before running comparisons.

---

## Environment Variables

| Variable                  | Required        | Description                                      |
|---------------------------|-----------------|--------------------------------------------------|
| `TEST_ENV`                | No (default: uat) | Target environment: dev, test, uat, prod       |
| `HTACCESS_USER`           | Dev/Test/UAT    | HTTP basic auth username                         |
| `HTACCESS_PASS`           | Dev/Test/UAT    | HTTP basic auth password                         |
| `STUDENT_USERNAME`        | Portal tests    | Login credential for student role                |
| `STUDENT_PASSWORD`        | Portal tests    | Login credential for student role                |
| `INSTRUCTOR_USERNAME`     | Portal tests    | Login credential for instructor role             |
| `INSTRUCTOR_PASSWORD`     | Portal tests    | Login credential for instructor role             |
| `COMPANYADMIN_USERNAME`   | Portal tests    | Login credential for companyadmin role           |
| `COMPANYADMIN_PASSWORD`   | Portal tests    | Login credential for companyadmin role           |
| `PROVIDER_USERNAME`       | Portal tests    | Login credential for provider role               |
| `PROVIDER_PASSWORD`       | Portal tests    | Login credential for provider role               |
| `MULTIROLE_USERNAME`      | Portal tests    | Login credential for multirole role              |
| `MULTIROLE_PASSWORD`      | Portal tests    | Login credential for multirole role              |
| `EVALUATOR_USERNAME`      | Portal tests    | Login credential for evaluator role              |
| `EVALUATOR_PASSWORD`      | Portal tests    | Login credential for evaluator role              |
| `AUDITOR_USERNAME`        | Portal tests    | Login credential for auditor role                |
| `AUDITOR_PASSWORD`        | Portal tests    | Login credential for auditor role                |
| `ASSESSOR_USERNAME`       | Portal tests    | Login credential for assessor role               |
| `ASSESSOR_PASSWORD`       | Portal tests    | Login credential for assessor role               |
| `CONTENTEDITOR_USERNAME`  | Portal tests    | Login credential for contenteditor role          |
| `CONTENTEDITOR_PASSWORD`  | Portal tests    | Login credential for contenteditor role          |
| `HEADED`                  | No              | Set to `1` to run browser in headed mode locally |
| `CI`                      | Auto (GitHub)   | Enables JSON + GitHub reporters when set         |
