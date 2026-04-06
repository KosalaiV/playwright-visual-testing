import { chromium, FullConfig } from '@playwright/test';
import { loginWithoutTOTP } from './auth';
import * as fs from 'fs';

const ALL_ROLES = [
  'student',
  'instructor',
  'companyadmin',
  'provider',
  'multirole',
  'evaluator',
  'auditor',
  'assessor',
  'contenteditor',
] as const;

/**
 * Runs once before the entire test suite.
 * Logs in as each role, saves the browser storage state to auth/{role}.json.
 * Portal tests load these files via test.use({ storageState }) — no per-test login.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const projectConfig = config.projects[0].use;
  const baseURL = projectConfig.baseURL as string;
  const httpCredentials = projectConfig.httpCredentials as
    | { username: string; password: string }
    | undefined;

  fs.mkdirSync('auth', { recursive: true });

  const browser = await chromium.launch();

  for (const role of ALL_ROLES) {
    const roleKey = role.toUpperCase();
    const username = process.env[`${roleKey}_USERNAME`];
    const password = process.env[`${roleKey}_PASSWORD`];

    if (!username || !password) {
      console.log(`[global-setup] Skipping ${role} — credentials not set`);
      // Write empty state so test.use({ storageState }) never throws ENOENT.
      // Tests detect the missing auth and skip themselves gracefully.
      fs.writeFileSync(`auth/${role}.json`, JSON.stringify({ cookies: [], origins: [] }));
      continue;
    }

    const context = await browser.newContext({
      baseURL,
      httpCredentials,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    try {
      await loginWithoutTOTP(page, {
        role,
        expectedUrlPattern: /srv\/|\/u\/|\/user|check_logged_in/,
      });
      await context.storageState({ path: `auth/${role}.json` });
      console.log(`[global-setup] ✓ Logged in as ${role}`);
    } catch (err) {
      console.error(`[global-setup] ✗ Login failed for ${role}:`, err);
      // Write empty state so the test file can detect the failure and skip
      // rather than crashing with "ENOENT: no such file or directory".
      fs.writeFileSync(`auth/${role}.json`, JSON.stringify({ cookies: [], origins: [] }));
    } finally {
      await context.close();
    }
  }

  await browser.close();
}
