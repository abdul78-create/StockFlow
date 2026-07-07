import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'admin@stockflow.com',
  password: 'AdminPassword123!',
};

/**
 * Logs in to StockFlow and waits for the dashboard to load.
 * Call at the start of any authenticated test.
 */
export async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10_000 });
}

/**
 * Navigates to a route and waits for the page to settle (no network requests in flight).
 */
export async function goto(page: Page, path: string) {
  await page.goto(path);
  await page.waitForSelector('#app-loader', { state: 'detached', timeout: 10_000 });
}

/**
 * Asserts the page has no visible 'undefined' text (a key stability check).
 */
export async function assertNoUndefined(page: Page) {
  const bodyText = await page.locator('body').innerText();
  const hasUndefined = bodyText.includes(' undefined') || bodyText.includes('>undefined<');
  if (hasUndefined) {
    throw new Error(`Page contains the literal text "undefined". Check data rendering.`);
  }
}
