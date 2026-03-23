import { Page, expect } from '@playwright/test';
import * as OTPAuth from 'otpauth';

export interface LoginOptions {
  username?: string;
  password?: string;
  totpSecret?: string;
  loginUrl?: string;
  expectedUrlPattern?: RegExp;
  /** Role for role-specific credentials (e.g. 'student' -> STUDENT_USERNAME) */
  role?: string;
}

export async function loginWithTOTP(
  page: Page,
  options: LoginOptions = {},
): Promise<void> {
  const {
    username = process.env.DEFAULT_2FA_USERNAME!,
    password = process.env.DEFAULT_2FA_PASSWORD!,
    totpSecret = process.env.DEFAULT_2FA_TOTP_SECRET!,
    loginUrl = '/user/login?type=default',
    expectedUrlPattern = /check_logged_in=1/,
  } = options;

  if (!username || !password || !totpSecret) {
    throw new Error(
      'Missing required credentials. Provide username, password, and totpSecret, or set DEFAULT_2FA_USERNAME, DEFAULT_2FA_PASSWORD, and DEFAULT_2FA_TOTP_SECRET environment variables.',
    );
  }

  await page.goto(loginUrl);

  await page.fill('#edit-name', username);
  await page.fill('#edit-pass', password);
  await page.locator('#edit-submit').click();

  await expect(page.locator('#edit-code')).toBeVisible({ timeout: 5000 });
  const code = new OTPAuth.TOTP({
    secret: totpSecret,
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  }).generate();
  console.log('Generated OTP:', code);
  await page.fill('#edit-code', code);

  await page.locator('#edit-login').click();

  await expect(page).toHaveURL(expectedUrlPattern, { timeout: 30000 });
}

/**
 * Basic form login without TOTP.
 * Supply username/password via args or DEFAULT_USERNAME / DEFAULT_PASSWORD env vars.
 */
export async function loginWithoutTOTP(
  page: Page,
  options: LoginOptions = {},
): Promise<void> {
  const {
    username,
    password,
    loginUrl = '/user/login?type=default',
    expectedUrlPattern = /check_logged_in=1/,
    // Allows role-specific creds: e.g., role: 'student' -> STUDENT_USERNAME/STUDENT_PASSWORD
    // Falls back to DEFAULT_USERNAME/DEFAULT_PASSWORD if role vars are missing.
    role = 'default',
  } = options;

  const roleKey = (role || 'default').toUpperCase();
  const resolvedUsername =
    username ||
    process.env[`${roleKey}_USERNAME`] ||
    process.env.DEFAULT_USERNAME!;
  const resolvedPassword =
    password ||
    process.env[`${roleKey}_PASSWORD`] ||
    process.env.DEFAULT_PASSWORD!;

  if (!resolvedUsername || !resolvedPassword) {
    throw new Error(
      'Missing credentials. Provide username/password or set role-specific envs (e.g., STUDENT_USERNAME/STUDENT_PASSWORD) or DEFAULT_USERNAME/DEFAULT_PASSWORD.',
    );
  }

  await page.goto(loginUrl);

  const usernameField = page.locator('#edit-name');
  const passwordField = page.locator('#edit-pass');
  const loginVisible =
    (await usernameField.isVisible().catch(() => false)) &&
    (await passwordField.isVisible().catch(() => false));

  if (loginVisible) {
    await usernameField.fill(resolvedUsername);
    await passwordField.fill(resolvedPassword);
    await page.locator('#edit-submit').click();
  }

  await expect(page).toHaveURL(expectedUrlPattern, { timeout: 30000 });
}
