import { test, expect } from '@playwright/test';
import { TEST_USER } from './helpers';

const viewports = [
  { width: 375, height: 667, name: 'Mobile (375x667)' },
  { width: 390, height: 844, name: 'Mobile (390x844)' },
  { width: 768, height: 1024, name: 'Tablet (768x1024)' },
  { width: 1366, height: 768, name: 'Desktop (1366x768)' },
  { width: 1440, height: 900, name: 'Desktop (1440x900)' },
  { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
];

test.describe('Login Page Functional Audit', () => {
  for (const vp of viewports) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });
      });

      test('empty form submission validation', async ({ page }) => {
        await page.getByRole('button', { name: /sign in/i }).click();
        
        // Form stays on login page and displays native or custom HTML5 error
        await expect(page).toHaveURL(/.*login/);
      });

      test('invalid email validation', async ({ page }) => {
        await page.getByLabel(/email/i).fill('invalidemail');
        await page.getByRole('button', { name: /sign in/i }).click();
        
        await expect(page).toHaveURL(/.*login/);
      });

      test('wrong password shows error banner without crash', async ({ page }) => {
        await page.getByLabel(/email/i).fill(TEST_USER.email);
        await page.getByLabel(/password/i).fill('incorrectpassword123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL(/.*login/);
        const errorBanner = page.locator('text=/invalid|incorrect|wrong|failed|credentials/i');
        await expect(errorBanner).toBeVisible();
      });

      test('password show/hide functionality works', async ({ page }) => {
        const pwField = page.getByLabel(/password/i);
        await pwField.fill('secretPassword123');
        await expect(pwField).toHaveAttribute('type', 'password');

        // Click eye toggle button
        const toggleBtn = page.locator('form button').nth(0); // Right side inline button
        await toggleBtn.click();
        await expect(pwField).toHaveAttribute('type', 'text');
        
        await toggleBtn.click();
        await expect(pwField).toHaveAttribute('type', 'password');
      });

      test('successful login flow and session preservation', async ({ page }) => {
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];

        page.on('console', (msg) => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        page.on('requestfailed', (req) => {
          const errText = req.failure()?.errorText || '';
          if (errText.includes('ERR_ABORTED')) return;
          if (!req.url().includes('/api/v1/events')) {
            failedRequests.push(`${req.method()} ${req.url()}`);
          }
        });

        // Fill form
        await page.getByLabel(/email/i).fill(TEST_USER.email);
        await page.getByLabel(/password/i).fill(TEST_USER.password);

        // Submit form
        const submitBtn = page.getByRole('button', { name: /sign in/i });
        await submitBtn.click();

        // Expect dashboard redirect
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Refresh and check session is preserved
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

        // Verify clean browser logs
        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);
      });
    });
  }
});
