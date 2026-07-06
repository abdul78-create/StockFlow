import { test, expect } from '@playwright/test';
import { login, goto, assertNoUndefined } from './helpers';

const UNIQUE_SKU = `TEST-${Date.now()}`;
const PRODUCT_NAME = `Playwright Test Product ${Date.now()}`;

test.describe('Product CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('products list loads without errors', async ({ page }) => {
    await goto(page, '/products');
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
    await assertNoUndefined(page);
  });

  test('create product — form submits and new product appears in list', async ({ page }) => {
    await goto(page, '/products');

    // Click "Add Product" button
    const addBtn = page.getByRole('button', { name: /add product/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();

    // Wait for drawer/modal to open
    await page.waitForTimeout(500);

    // Fill the form
    await page.getByLabel(/name/i).first().fill(PRODUCT_NAME);
    await page.getByLabel(/sku/i).first().fill(UNIQUE_SKU);

    // Selling price
    const priceInput = page.getByLabel(/selling price/i).first();
    if (await priceInput.isVisible()) {
      await priceInput.fill('99.99');
    }

    // Cost price
    const costInput = page.getByLabel(/cost price/i).first();
    if (await costInput.isVisible()) {
      await costInput.fill('50.00');
    }

    // Submit
    const submitBtn = page.getByRole('button', { name: /create|save|submit/i }).last();
    await submitBtn.click();

    // Toast should appear
    await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 8_000 });

    // Product should now appear in the table
    await expect(page.getByText(PRODUCT_NAME)).toBeVisible({ timeout: 5_000 });
  });

  test('search products filters the list', async ({ page }) => {
    await goto(page, '/products');

    const searchInput = page.getByPlaceholder(/search/i).first();
    await searchInput.fill('nonexistent-product-xyz');
    await page.waitForTimeout(500);

    // Should show empty state or zero results
    const emptyState = page.getByText(/no (products|results|data)/i);
    const tableRows = page.locator('tbody tr:not([class*="skeleton"])');
    const rowCount = await tableRows.count();

    // Either empty state message or zero rows
    const hasEmptyState = await emptyState.isVisible();
    expect(hasEmptyState || rowCount === 0).toBeTruthy();
  });

  test('clicking a product row navigates to product detail', async ({ page }) => {
    await goto(page, '/products');

    // Wait for table rows
    const rows = page.locator('tbody tr').first();
    await rows.waitFor({ timeout: 5_000 });
    await rows.click();

    // Should navigate to /products/:id
    await expect(page).toHaveURL(/\/products\/[a-zA-Z0-9-]+/, { timeout: 5_000 });
    await assertNoUndefined(page);
  });
});
