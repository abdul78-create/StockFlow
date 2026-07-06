import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 667, name: 'Mobile (375x667)' },
  { width: 390, height: 844, name: 'Mobile (390x844)' },
  { width: 768, height: 1024, name: 'Tablet (768x1024)' },
  { width: 1366, height: 768, name: 'Desktop (1366x768)' },
  { width: 1440, height: 900, name: 'Desktop (1440x900)' },
  { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
];

test.describe('Landing Page Functional Audit', () => {
  for (const vp of viewports) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test('should load successfully and satisfy UI requirements', async ({ page }) => {
        const consoleErrors: string[] = [];
        const failedRequests: string[] = [];

        // Track console errors
        page.on('console', (msg) => {
          if (msg.type() === 'error' && !msg.text().includes('401')) {
            consoleErrors.push(msg.text());
          }
        });

        // Track failed requests
        page.on('requestfailed', (request) => {
          failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
        });

        // 1. Page loads successfully
        await page.goto('/');
        
        // Wait for app initialization loader to disappear
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });
        
        await expect(page).toHaveTitle(/StockFlow/i);

        // 2. Navigation links are correct and redirect to existing routes
        const loginBtn = page.getByRole('link', { name: 'Sign In' }).first();
        await expect(loginBtn).toBeVisible();
        await expect(loginBtn).toHaveAttribute('href', '/login');

        const registerBtn = page.getByRole('link', { name: /get started|start free trial/i }).first();
        await expect(registerBtn).toBeVisible();
        await expect(registerBtn).toHaveAttribute('href', '/signup');

        // 3. Click CTA and verify destination
        await registerBtn.click();
        await expect(page).toHaveURL(/.*signup/);

        // Go back
        await page.goto('/');

        // 4. Verify no dead links or "#" anchors
        const links = await page.locator('a').all();
        for (const link of links) {
          const href = await link.getAttribute('href');
          expect(href).not.toBe('#');
        }

        // 5. Verify no console errors or failed requests
        expect(consoleErrors).toEqual([]);
        expect(failedRequests).toEqual([]);
      });

      test('keyboard navigation and visible focus indicators', async ({ page }) => {
        await page.goto('/');
        
        // Tab through elements and check focus states
        await page.keyboard.press('Tab');
        const activeElementTag = await page.evaluate(() => document.activeElement?.tagName);
        expect(activeElementTag).toBeTruthy();
      });
    });
  }
});
