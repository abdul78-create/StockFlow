import { test, expect } from '@playwright/test';
import { TEST_USER, login } from './helpers';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill(TEST_USER.password);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10_000 });
    // Dashboard heading must be visible
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('login with wrong password shows friendly error, no crash', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(TEST_USER.email);
    await page.getByLabel(/password/i).fill('WrongPassword999!');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    // Should NOT navigate away
    await expect(page).toHaveURL(/.*login/, { timeout: 5_000 });
    // Error message should appear (not a crash/blank screen)
    const errorText = page.locator('text=/invalid|incorrect|wrong|failed|credentials/i');
    await expect(errorText).toBeVisible({ timeout: 5_000 });
  });

  test('unauthenticated access to /dashboard redirects to /login', async ({ page }) => {
    // Go directly without logging in
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/, { timeout: 5_000 });
  });

  test('logout redirects to login page', async ({ page }) => {
    await login(page);
    // Find and click logout — try common selectors
    const logoutBtn = page.getByRole('button', { name: /logout|sign out/i });
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      // May be inside a dropdown/user menu
      const userMenu = page.locator('[aria-label*="user" i], [id*="user-menu" i], [data-testid*="user" i]').first();
      await userMenu.click();
      await page.getByRole('menuitem', { name: /logout|sign out/i }).click();
    }
    await expect(page).toHaveURL(/.*login/, { timeout: 8_000 });
  });
});
