import { test, expect } from '@playwright/test';

test.describe('Complete Business E2E Journey', () => {
  // Use a unique email for each run
  const uniqueId = Date.now();
  const testEmail = `admin_${uniqueId}@stockflow.test`;
  const testPassword = 'Password123!';

  test('Full Workflow: Signup to Finance', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes timeout for full flow

    // 1. Landing & Signup
    await page.goto('/');
    await expect(page.getByRole('banner').getByText('StockFlow')).toBeVisible();
    
    await page.goto('/signup');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');

    // 2. Onboarding
    await expect(page.getByText('Name your workspace')).toBeVisible({ timeout: 10000 });
    await page.fill('input[name="name"]', 'E2E Corp');
    await page.click('button:has-text("Continue")');
    
    await page.click('button:has-text("Select industry")');
    await page.getByText('E-commerce').click();
    await page.click('button:has-text("Continue")');
    
    await page.click('button:has-text("Skip for now")');

    // 3. Dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('E2E Corp')).toBeVisible();

    // 4. Create Warehouse
    await page.goto('/warehouses');
    await page.click('button:has-text("Add Warehouse")');
    await page.fill('input[name="name"]', 'Main DC');
    await page.fill('input[name="code"]', 'MDC');
    await page.fill('input[name="location"]', 'New York');
    await page.click('button:has-text("Create")');
    await expect(page.getByText('Main DC')).toBeVisible();

    // 5. Create Category
    await page.goto('/products');
    await page.click('button:has-text("Categories")');
    await page.click('button:has-text("Add Category")');
    await page.fill('input[name="name"]', 'Electronics');
    await page.click('button:has-text("Create")');
    await expect(page.getByText('Electronics')).toBeVisible();
    // Assuming dialog closes on create, if not we need to close it. We'll rely on the modal closing automatically.
    // Close category dialog if needed: await page.locator('[aria-label="Close"]').click();
    
    // 6. Create Supplier
    await page.goto('/suppliers');
    await page.click('button:has-text("Add Supplier")');
    await page.fill('input[name="name"]', 'Tech Supply Inc');
    await page.fill('input[name="email"]', 'sales@techsupply.test');
    await page.click('button:has-text("Create")');
    await expect(page.getByText('Tech Supply Inc')).toBeVisible();

    // 7. Create Product
    await page.goto('/products');
    await page.click('button:has-text("Add Product")');
    await page.fill('input[name="name"]', 'MacBook Pro');
    await page.fill('input[name="sku"]', 'MBP-001');
    await page.click('button:has-text("Select Category")');
    await page.getByText('Electronics').click();
    await page.fill('input[name="price"]', '1999.99');
    await page.fill('input[name="cost"]', '1500.00');
    await page.click('button:has-text("Save")');
    await expect(page.getByText('MacBook Pro')).toBeVisible();

    // 8. Purchase Order -> Approve -> Receive
    await page.goto('/purchase-orders');
    await page.click('button:has-text("Create PO")');
    await page.click('button:has-text("Select Supplier")');
    await page.getByText('Tech Supply Inc').click();
    await page.click('button:has-text("Select Warehouse")');
    await page.getByText('Main DC').click();
    await page.click('button:has-text("Add Item")');
    await page.click('button:has-text("Select Product")');
    await page.getByText('MacBook Pro').click();
    await page.fill('input[type="number"]', '10'); // Quantity
    await page.click('button:has-text("Create")');
    
    // Approve PO
    await page.click('button:has-text("Approve")');
    // Receive PO
    await page.click('button:has-text("Receive")');
    await page.click('button:has-text("Confirm Receipt")');

    // 9. Inventory Updated
    await page.goto('/inventory');
    await expect(page.getByText('10')).toBeVisible(); // 10 MacBooks

    // 10. Create Customer
    await page.goto('/customers');
    await page.click('button:has-text("Add Customer")');
    await page.fill('input[name="name"]', 'Acme Corp');
    await page.fill('input[name="email"]', 'buy@acme.test');
    await page.click('button:has-text("Create")');
    await expect(page.getByText('Acme Corp')).toBeVisible();

    // 11. Sales Order -> Approve -> Dispatch
    await page.goto('/sales-orders');
    await page.click('button:has-text("Create Order")');
    await page.click('button:has-text("Select Customer")');
    await page.getByText('Acme Corp').click();
    await page.click('button:has-text("Select Warehouse")');
    await page.getByText('Main DC').click();
    await page.click('button:has-text("Add Item")');
    await page.click('button:has-text("Select Product")');
    await page.getByText('MacBook Pro').click();
    await page.fill('input[type="number"]', '2'); // Quantity
    await page.click('button:has-text("Create")');

    // Approve SO
    await page.click('button:has-text("Approve")');
    // Dispatch SO
    await page.click('button:has-text("Dispatch")');
    await page.click('button:has-text("Confirm Dispatch")');

    // 12. Create Invoice
    await page.goto('/finance/invoices');
    await page.click('button:has-text("Create Invoice")');
    await page.click('button:has-text("Select Customer")');
    await page.getByText('Acme Corp').click();
    await page.click('button:has-text("Create")');

    // 13. Reports load
    await page.goto('/reports');
    await expect(page.getByText('Inventory Value')).toBeVisible();

    // 14. Settings
    await page.goto('/settings/workspace');
    await expect(page.getByText('Workspace Settings')).toBeVisible();

    // 15. Logout & Login
    await page.click('button:has-text("E2E Corp")'); // Click user menu
    await page.click('text="Log out"');
    await expect(page).toHaveURL(/\/login/);
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
