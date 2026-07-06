import { test, expect } from '@playwright/test';
import { login, goto, assertNoUndefined } from './helpers';

test.describe('Purchase Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('purchase orders list loads without errors', async ({ page }) => {
    await goto(page, '/purchase-orders');
    await expect(page.getByRole('heading', { name: /purchase orders/i })).toBeVisible();
    await assertNoUndefined(page);
  });

  test('purchase order form opens without crash', async ({ page }) => {
    await goto(page, '/purchase-orders/new');
    // The form page should load — not blank
    const heading = page.getByRole('heading', { name: /purchase order|new order|create/i });
    await expect(heading).toBeVisible({ timeout: 8_000 });
    await assertNoUndefined(page);
  });

  test('clicking a PO row navigates to detail without crash', async ({ page }) => {
    await goto(page, '/purchase-orders');

    const rows = page.locator('tbody tr').first();
    const hasRows = await rows.isVisible();
    if (!hasRows) {
      test.skip(); // No POs yet, skip detail test
      return;
    }

    await rows.click();
    await expect(page).toHaveURL(/\/purchase-orders\/[a-zA-Z0-9-]+/, { timeout: 8_000 });
    await assertNoUndefined(page);
  });
});

test.describe('Sales Orders', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('sales orders list loads without errors', async ({ page }) => {
    await goto(page, '/sales-orders');
    await expect(page.getByRole('heading', { name: /sales orders/i })).toBeVisible();
    await assertNoUndefined(page);
  });

  test('sales order form opens without crash', async ({ page }) => {
    await goto(page, '/sales-orders/new');
    const heading = page.getByRole('heading', { name: /sales order|new order|create/i });
    await expect(heading).toBeVisible({ timeout: 8_000 });
    await assertNoUndefined(page);
  });

  test('clicking a SO row navigates to detail without crash', async ({ page }) => {
    await goto(page, '/sales-orders');

    const rows = page.locator('tbody tr').first();
    const hasRows = await rows.isVisible();
    if (!hasRows) {
      test.skip();
      return;
    }

    await rows.click();
    await expect(page).toHaveURL(/\/sales-orders\/[a-zA-Z0-9-]+/, { timeout: 8_000 });
    await assertNoUndefined(page);
  });
});
