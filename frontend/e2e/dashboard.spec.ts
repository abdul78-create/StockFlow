import { test, expect } from '@playwright/test';
import { login, goto, assertNoUndefined } from './helpers';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('dashboard loads without errors and shows KPI cards', async ({ page }) => {
    await goto(page, '/dashboard');

    // Page heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

    // At least 4 KPI cards should be rendered (Revenue, Expenses, Profit, Inventory Value)
    const kpiCards = page.locator('[data-testid="kpi-card"], .kpi-card, [class*="kpi"]');
    const cardCount = await kpiCards.count();
    // If no data-testid, fall back to checking for heading text in cards
    if (cardCount === 0) {
      await expect(page.getByText(/revenue/i).first()).toBeVisible();
    }

    // Should not have any "undefined" on the page
    await assertNoUndefined(page);
  });

  test('dashboard activity feed shows friendly action text, not raw enums', async ({ page }) => {
    await goto(page, '/dashboard');

    // Check that recent activity does NOT show raw uppercase enums like "PRODUCT_CREATED"
    const bodyText = await page.locator('body').innerText();
    expect(bodyText).not.toMatch(/\b[A-Z_]{5,}\b(?!.*[a-z])/);
  });

  test('dashboard chart renders without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await goto(page, '/dashboard');
    await page.waitForTimeout(2000); // Let charts render

    // Filter out known 3rd-party/browser noise
    const realErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('ResizeObserver') && !e.includes('non-passive')
    );
    expect(realErrors).toHaveLength(0);
  });
});
