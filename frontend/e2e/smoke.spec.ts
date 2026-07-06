import { test, expect } from '@playwright/test';
import { login, goto, assertNoUndefined } from './helpers';

/**
 * Page stability smoke tests — visits every major route and verifies:
 * 1. Page renders (no blank screen)
 * 2. No "undefined" text visible
 * 3. No console errors (excluding known 3rd-party noise)
 */

const PAGES = [
  { name: 'Inventory',       path: '/inventory' },
  { name: 'Cycle Counts',    path: '/inventory/cycle-counts' },
  { name: 'Expiring Stock',  path: '/inventory/expiring' },
  { name: 'Warehouses',      path: '/warehouses' },
  { name: 'Purchase Returns',path: '/purchase-returns' },
  { name: 'Sales Returns',   path: '/sales-returns' },
  { name: 'Quotations',      path: '/quotations' },
  { name: 'Customers',       path: '/customers' },
  { name: 'Suppliers',       path: '/suppliers' },
  { name: 'Invoices',        path: '/finance/invoices' },
  { name: 'Bills',           path: '/finance/bills' },
  { name: 'Reports',         path: '/reports' },
  { name: 'Team Settings',   path: '/settings/team' },
  { name: 'Profile Settings',path: '/settings/profile' },
  { name: 'Tax Rules',       path: '/settings/tax-rules' },
  { name: 'Workspace',       path: '/settings/workspace' },
];

for (const { name, path } of PAGES) {
  test(`${name} (${path}) — loads without crash or undefined`, async ({ page }) => {
    await login(page);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known benign browser/extension messages
        if (
          !text.includes('favicon') &&
          !text.includes('ResizeObserver') &&
          !text.includes('non-passive') &&
          !text.includes('ERR_ABORTED') // cancelled requests on unmount
        ) {
          consoleErrors.push(text);
        }
      }
    });

    await goto(page, path);

    // Page must not be blank — some element should be visible
    const body = page.locator('body');
    const bodyText = await body.innerText();
    expect(bodyText.trim().length).toBeGreaterThan(10);

    // No "undefined" visible to the user
    await assertNoUndefined(page);

    // No console errors
    if (consoleErrors.length > 0) {
      throw new Error(
        `Console errors on ${path}:\n${consoleErrors.join('\n')}`
      );
    }
  });
}
