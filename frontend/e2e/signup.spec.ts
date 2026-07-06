import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 667, name: 'Mobile (375x667)' },
  { width: 390, height: 844, name: 'Mobile (390x844)' },
  { width: 768, height: 1024, name: 'Tablet (768x1024)' },
  { width: 1366, height: 768, name: 'Desktop (1366x768)' },
  { width: 1440, height: 900, name: 'Desktop (1440x900)' },
  { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
];

test.describe('Signup Page Functional Audit', () => {
  for (const vp of viewports) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test.beforeEach(async ({ page }) => {
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            const isExpectedAuthMe401 = text.includes('401') && (
              text.includes('/api/v1/auth/me') || 
              (msg.location()?.url && msg.location().url.includes('/api/v1/auth/me')) || 
              text === 'Failed to load resource: the server responded with a status of 401 (Unauthorized)'
            );
            if (isExpectedAuthMe401) {
              return;
            }
            throw new Error(`Browser console error: ${text}`);
          }
        });
        page.on('pageerror', (err) => {
          throw new Error(`Uncaught page error: ${err.message}`);
        });

        await page.goto('/signup');
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });
      });

      test('empty form submission validation', async ({ page }) => {
        await page.getByRole('button', { name: /sign up/i }).click();
        await expect(page).toHaveURL(/.*signup/);
      });

      test('invalid email format validation', async ({ page }) => {
        await page.getByLabel(/first name/i).fill('Max');
        await page.getByLabel(/last name/i).fill('Robinson');
        await page.getByLabel(/email/i).fill('invalidemail');
        await page.getByLabel(/^password$/i).fill('StrongPassword1');
        await page.getByLabel(/confirm password/i).fill('StrongPassword1');
        await page.getByRole('button', { name: /sign up/i }).click();

        await expect(page).toHaveURL(/.*signup/);
        const errorText = page.locator('text=/email/i');
        await expect(errorText).toBeVisible();
      });

      test('weak password validation', async ({ page }) => {
        await page.getByLabel(/first name/i).fill('Max');
        await page.getByLabel(/last name/i).fill('Robinson');
        await page.getByLabel(/email/i).fill('m@company.com');
        await page.getByLabel(/^password$/i).fill('123');
        await page.getByLabel(/confirm password/i).fill('123');
        await page.getByRole('button', { name: /sign up/i }).click();

        await expect(page).toHaveURL(/.*signup/);
        const errorText = page.locator('p.text-destructive:has-text("at least 8 characters")');
        await expect(errorText).toBeVisible();
      });

      test('password mismatch validation', async ({ page }) => {
        await page.getByLabel(/first name/i).fill('Max');
        await page.getByLabel(/last name/i).fill('Robinson');
        await page.getByLabel(/email/i).fill('m@company.com');
        await page.getByLabel(/^password$/i).fill('StrongPassword1');
        await page.getByLabel(/confirm password/i).fill('DifferentPassword2');
        await page.getByRole('button', { name: /sign up/i }).click();

        await expect(page).toHaveURL(/.*signup/);
        const errorText = page.locator('text=/do not match/i');
        await expect(errorText).toBeVisible();
      });

      test('password show/hide functionality works', async ({ page }) => {
        const pwField = page.getByLabel(/^password$/i);
        await pwField.fill('StrongPassword1');
        await expect(pwField).toHaveAttribute('type', 'password');

        const toggleBtn = page.locator('form button').nth(0);
        await toggleBtn.click();
        await expect(pwField).toHaveAttribute('type', 'text');
        
        await toggleBtn.click();
        await expect(pwField).toHaveAttribute('type', 'password');
      });

      test('successful signup flow', async ({ page }) => {
        const uniqueEmail = `test-${Date.now()}@stockflow.com`;
        
        await page.getByLabel(/first name/i).fill('Max');
        await page.getByLabel(/last name/i).fill('Robinson');
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/^password$/i).fill('StrongPassword1');
        await page.getByLabel(/confirm password/i).fill('StrongPassword1');

        await page.getByRole('button', { name: /sign up/i }).click();

        await expect(page).toHaveURL(/.*onboarding\/workspace/, { timeout: 15_000 });
      });
    });
  }
});
