import { test, expect, Page } from '@playwright/test';
import { goto } from './helpers';

test.describe.serial('Business Flow Audit', () => {
  test.setTimeout(120000); // 120s per test
  
  let page: Page;
  let uniqueId: string;
  
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    uniqueId = Date.now().toString();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test('Flow 1: Setup to Procurement', async () => {
    // Log all errors
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('console', msg => {
      console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`);
    });
    
    const urlInterval = setInterval(() => {
      console.log('CURRENT URL:', page.url());
    }, 5000);
    
    page.on('close', () => clearInterval(urlInterval));
    
    page.on('response', async response => {
      if (response.url().includes('/api/v1/purchase-orders') && response.request().method() === 'POST') {
        try {
          const body = await response.text();
          console.log('API POST /purchase-orders RESPONSE:', body);
        } catch (e) {
          // ignore
        }
      }
      if (response.status() >= 400) {
        console.log(`NETWORK ERROR ${response.status()}: ${response.request().method()} ${response.url()}`);
        if (response.status() === 422) {
          try {
            const body = await response.text();
            console.log(`422 ERROR BODY: ${body}`);
          } catch (e) {
            // ignore
          }
        }
      }
    });

    const email = `audit-${uniqueId}@stockflow.com`;
    
    // 1. Signup & Workspace Setup
    await page.goto('/signup');
    await page.waitForSelector('#app-loader', { state: 'detached', timeout: 10_000 });
    
    await page.getByLabel(/first name/i).fill('Flow');
    await page.getByLabel(/last name/i).fill('Auditor');
    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/^password$/i).fill('StrongPassword1!');
    await page.getByLabel(/confirm password/i).fill('StrongPassword1!');
    await page.getByRole('button', { name: /sign up/i }).click();

    await page.waitForURL(/.*workspace/, { timeout: 10000 });
    await page.getByLabel(/workspace name/i).fill(`Audit Workspace ${uniqueId}`);
    await page.getByRole('button', { name: /continue/i }).click();

    await page.waitForURL(/.*industry/, { timeout: 10000 });
    await page.getByRole('combobox').first().click();
    await page.getByRole('option', { name: 'Retail' }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    await page.waitForURL(/.*invite/, { timeout: 10000 });
    await page.getByRole('button', { name: /skip for now/i }).click();

    await page.waitForURL(/.*dashboard/, { timeout: 15_000 });
    await page.waitForSelector('#app-loader', { state: 'detached', timeout: 10_000 });

    // 2. Add Warehouse
    await page.locator('nav a[href="/warehouses"]').first().click();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await page.locator('button', { hasText: 'Add Warehouse' }).first().click();
    await page.getByPlaceholder(/Main Distribution Center/i).fill('Main Distribution Center');
    await page.getByPlaceholder(/Full street address/i).fill('123 Warehouse St, NY');
    await page.getByRole('button', { name: /create warehouse/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Main Distribution Center')).toBeVisible();

    // 3. Add Category & Product
    await page.locator('nav a[href="/products"]').first().click();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await page.locator('button', { hasText: 'Add Product' }).first().click();
    await page.getByLabel(/product name/i).fill('Audit Laptop Pro');
    await page.getByLabel(/sku/i).fill(`SKU-${uniqueId}`);
    await page.getByLabel(/cost price/i).fill('1000');
    await page.getByLabel(/selling price/i).fill('1200');
    
    // Attempt to select category
    await page.getByRole('combobox', { name: /category/i }).click();
    // Select the first option available
    await page.getByRole('option').first().click();

    await page.getByRole('button', { name: /create product/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    // Verify drawer closed and product in list
    await expect(page.getByText('Audit Laptop Pro')).toBeVisible();

    // 4. Add Supplier
    await page.locator('nav a[href="/suppliers"]').first().click();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await page.locator('button', { hasText: 'Add Supplier' }).first().click();
    await page.getByLabel(/company name/i).fill('Tech Supplies Inc');
    await page.getByLabel(/email/i).fill('tech@supplies.com');
    await page.getByRole('button', { name: /create supplier/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Tech Supplies Inc')).toBeVisible();

    // 5. Create Purchase Order
    await page.locator('nav a[href="/purchase-orders"]').first().click();
    await page.getByRole('button', { name: /create order/i }).first().click();
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Tech Supplies Inc' }).click();
    
    await page.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option', { name: 'Audit Laptop Pro' }).click();
    
    await page.getByLabel(/quantity/i).first().fill('10');
    await page.getByLabel(/unit price/i).first().fill('1000');
    await page.getByRole('button', { name: /create draft order/i }).click();
    
    await page.waitForURL(/\/purchase-orders\/[0-9a-fA-F-]+$/, { timeout: 10000 });

    await expect(page.locator('.animate-pulse')).toHaveCount(0);

    // 6. Receive Goods
    await page.getByRole('button', { name: /approve order/i }).click();
    
    await page.getByRole('button', { name: /receive goods/i }).click();
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: /main distribution center/i }).click();
    await page.getByRole('button', { name: /confirm receipt/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    // 7. Verify Inventory Updated
    await page.locator('nav a[href="/inventory"]').first().click();
    await expect(page.locator(`text=Audit Laptop Pro`).first()).toBeVisible();
    await expect(page.locator(`text=10`).first()).toBeVisible();
  });

  test('Flow 2: Selling & Revenue', async () => {
    // 1. Add Customer
    await page.locator('nav a[href="/customers"]').first().click();
    await expect(page.locator('.animate-pulse')).toHaveCount(0);
    await page.locator('button', { hasText: 'Add Customer' }).first().click();
    await page.getByLabel(/customer name/i).fill('Acme Corp');
    await page.getByLabel(/email/i).fill('contact@acme.com');
    await page.getByRole('button', { name: /create customer/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Acme Corp')).toBeVisible();

    // 2. Create Sales Order
    await page.locator('nav a[href="/sales-orders"]').first().click();
    await page.getByRole('button', { name: /create order/i }).first().click();
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Acme Corp' }).click();

    await page.locator('button[role="combobox"]').nth(1).click();
    await page.getByRole('option', { name: 'Audit Laptop Pro' }).click();
    
    await page.getByLabel(/quantity/i).first().fill('2');
    await page.getByRole('button', { name: /create draft order/i }).click();
    await page.waitForURL(/.*sales-orders\/.+/, { timeout: 10000 });

    await expect(page.locator('.animate-pulse')).toHaveCount(0);

    // 3. Approve & Ship & Deliver
    await page.getByRole('button', { name: /approve order/i }).click();
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: /main distribution center/i }).click();
    await page.getByRole('button', { name: /confirm approval/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    
    await page.getByRole('button', { name: /dispatch goods/i }).click();
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: /main distribution center/i }).click();
    await page.getByRole('button', { name: /confirm dispatch/i }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.getByRole('button', { name: /mark delivered/i }).click();
    // 4. Verify Inventory Reduced (should be 8)
    await page.locator('nav a[href="/inventory"]').first().click();
    await expect(page.locator(`text=Audit Laptop Pro`).first()).toBeVisible();
    await expect(page.locator(`text=8`).first()).toBeVisible();
  });

  test('Flow 3: Customer Returns', async () => {
    await page.goto('/sales-returns/new');
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Acme Corp' }).click();
    
    // Wait for pre-populated items
    await page.waitForSelector('input[type="number"]');
    
    // Fill return quantity
    await page.locator('input[type="number"]').first().fill('1');
    await page.getByLabel(/reason/i).fill('Defective unit');
    
    await page.getByRole('button', { name: /create sales return/i }).click();
    await page.waitForURL(/.*sales-returns\/.+/, { timeout: 10000 });

    await expect(page.locator('.animate-pulse')).toHaveCount(0);

    await page.getByRole('button', { name: /approve & credit stock/i }).click();
    
    // Verify Inventory Restored (should be 9)
    await page.locator('nav a[href="/inventory"]').first().click();
    await expect(page.locator(`text=Audit Laptop Pro`).first()).toBeVisible();
    await expect(page.locator(`text=9`).first()).toBeVisible();
  });

  test('Flow 4: Supplier Returns', async () => {
    await page.goto('/purchase-returns/new');
    await page.locator('button[role="combobox"]').first().click();
    await page.getByRole('option', { name: 'Tech Supplies Inc' }).click();
    
    // Wait for pre-populated items
    await page.waitForSelector('input[type="number"]');
    
    // Fill return quantity
    await page.locator('input[type="number"]').first().fill('2');
    await page.getByLabel(/reason/i).fill('Sending back excess stock');
    
    await page.getByRole('button', { name: /create purchase return/i }).click();
    await page.waitForURL(/.*purchase-returns\/.+/, { timeout: 10000 });

    await expect(page.locator('.animate-pulse')).toHaveCount(0);

    await page.getByRole('button', { name: /approve & revert stock/i }).click();
    
    // Verify Inventory Reduced (should be 7)
    await page.locator('nav a[href="/inventory"]').first().click();
    await expect(page.locator(`text=Audit Laptop Pro`).first()).toBeVisible();
    await expect(page.locator(`text=7`).first()).toBeVisible();
  });
});
