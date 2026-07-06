import { test, expect } from '@playwright/test';

const viewports = [
  { width: 375, height: 667, name: 'Mobile (375x667)' },
  { width: 390, height: 844, name: 'Mobile (390x844)' },
  { width: 768, height: 1024, name: 'Tablet (768x1024)' },
  { width: 1366, height: 768, name: 'Desktop (1366x768)' },
  { width: 1440, height: 900, name: 'Desktop (1440x900)' },
  { width: 1920, height: 1080, name: 'Desktop (1920x1080)' },
];

test.describe('Onboarding Wizard Functional Audit', () => {
  for (const vp of viewports) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.use({ viewport: { width: vp.width, height: vp.height } });

      test.beforeEach(async ({ page }) => {
        (page as any).allowedHttpErrors = [
          { method: 'GET', pathname: '/api/v1/auth/me', status: 401 }
        ];

        page.on('response', (response) => {
          const status = response.status();
          if (status >= 400) {
            try {
              const url = new URL(response.url());
              const method = response.request().method();
              const pathname = url.pathname;
              const allowed = (page as any).allowedHttpErrors as { method: string; pathname: string; status: number }[];
              const isAllowed = allowed.some(a => a.method === method && a.pathname === pathname && a.status === status);
              if (!isAllowed) {
                console.error(`Unexpected HTTP response: ${method} ${pathname} ${status}`);
              }
            } catch (e) {
              // Ignore invalid URLs
            }
          }
        });

        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            const text = msg.text();
            const url = msg.location()?.url;
            const allowed = (page as any).allowedHttpErrors as { method: string; pathname: string; status: number }[];
            
            let isAllowed = false;
            
            if (url) {
              try {
                const parsedUrl = new URL(url);
                isAllowed = allowed.some(a => parsedUrl.pathname.includes(a.pathname) && text.includes(a.status.toString()));
              } catch(e) {}
            }
            if (!isAllowed && text.includes('Failed to load resource')) {
              isAllowed = allowed.some(a => text.includes(a.status.toString()));
            }

            if (!isAllowed) {
              throw new Error(`Unexpected Browser console error: ${text}`);
            }
          }
        });

        page.on('pageerror', (err) => {
          throw new Error(`Uncaught page error: ${err.message}`);
        });
      });

      test('unauthenticated visitors should be redirected to login', async ({ page }) => {
        await page.goto('/onboarding/workspace');
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });
        await expect(page).toHaveURL(/.*login/);
      });

      test('verify-email path redirects instantly to workspace onboarding', async ({ page }) => {
        const uniqueEmail = `redir-${Date.now()}@stockflow.com`;
        await page.goto('/signup');
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });

        await page.getByLabel(/first name/i).fill('Sam');
        await page.getByLabel(/last name/i).fill('Onboarder');
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/^password$/i).fill('StrongPassword1');
        await page.getByLabel(/confirm password/i).fill('StrongPassword1');
        await page.getByRole('button', { name: /sign up/i }).click();

        await expect(page).toHaveURL(/.*workspace/, { timeout: 10000 });

        await page.goto('/onboarding/verify-email');
        await expect(page).toHaveURL(/.*workspace/);
      });

      test('complete onboarding flow with invitation partial failure and retry', async ({ page }) => {
        // 1. Signup fresh user
        const uniqueEmail = `onboard-${Date.now()}@stockflow.com`;
        await page.goto('/signup');
        await page.locator('#app-loader').waitFor({ state: 'detached', timeout: 10000 });

        await page.getByLabel(/first name/i).fill('Sam');
        await page.getByLabel(/last name/i).fill('Onboarder');
        await page.getByLabel(/email/i).fill(uniqueEmail);
        await page.getByLabel(/^password$/i).fill('StrongPassword1');
        await page.getByLabel(/confirm password/i).fill('StrongPassword1');
        await page.getByRole('button', { name: /sign up/i }).click();

        // 2. Workspace creation step
        await expect(page).toHaveURL(/.*workspace/, { timeout: 10000 });
        const uniqueWorkspaceName = `Workspace-${Date.now()}`;
        await page.getByLabel(/workspace name/i).fill(uniqueWorkspaceName);
        await page.getByRole('button', { name: /continue/i }).click();

        // 3. Business details
        await expect(page).toHaveURL(/.*industry/, { timeout: 10000 });
        await page.getByRole('combobox').first().click();
        await page.getByRole('option', { name: 'Retail' }).click();
        await page.getByRole('button', { name: /continue/i }).click();

        // 4. Team Invites step
        await expect(page).toHaveURL(/.*invite/, { timeout: 10000 });

        (page as any).allowedHttpErrors.push({ method: 'POST', pathname: '/api/v1/workspaces/invitations', status: 409 });

        // Add rows to have A, B, and C
        await page.getByRole('button', { name: /add another/i }).click(); // row index 1
        await page.getByRole('button', { name: /add another/i }).click(); // row index 2

        // Input A (succeeds)
        await page.locator('input[placeholder="teammate@company.com"]').nth(0).fill('invite-a@stockflow.com');
        // Input B (fails - using own email which causes conflict error)
        await page.locator('input[placeholder="teammate@company.com"]').nth(1).fill(uniqueEmail);
        // Input C (succeeds)
        await page.locator('input[placeholder="teammate@company.com"]').nth(2).fill('invite-c@stockflow.com');

        await page.getByRole('button', { name: /send invites/i }).click();

        // After first submission:
        // A is removed. C is removed. B remains visible. B remains editable. B remains retryable.
        // Current URL is still /onboarding/invite.
        // No success completion message is shown.
        // Dashboard navigation did not occur.
        await expect(page.locator('text=/failed to send invitations/i')).toBeVisible({ timeout: 10000 });
        
        const inputs = page.locator('input[placeholder="teammate@company.com"]');
        await expect(inputs).toHaveCount(1);
        await expect(inputs.first()).toHaveValue(uniqueEmail);
        await expect(inputs.first()).toBeEditable();

        await expect(page).toHaveURL(/.*invite/);
        await expect(page.locator('text=/success/i')).not.toBeVisible();
        await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible();

        // Before retrying B: Record all POST requests to /api/v1/workspaces/invitations.
        const invitationRequests: any[] = [];
        page.on('request', request => {
          if (request.url().includes('/api/v1/workspaces/invitations') && request.method() === 'POST') {
            invitationRequests.push(request.postDataJSON());
          }
        });

        // Retry B (without changing email, should fail again with 409)
        await page.getByRole('button', { name: /send invites/i }).click();
        
        // Assert retry creates exactly ONE additional invitation POST request.
        await page.waitForResponse(resp => resp.url().includes('/api/v1/workspaces/invitations') && resp.request().method() === 'POST');

        expect(invitationRequests.length).toBe(1);
        // Assert request body contains B's email only
        expect(invitationRequests[0].email).toEqual(uniqueEmail);

        // Assert B still remains visible/editable after retry
        await expect(inputs).toHaveCount(1);
        await expect(inputs.first()).toHaveValue(uniqueEmail);
        await expect(inputs.first()).toBeEditable();
        
        // Assert application still does not navigate automatically
        await expect(page).toHaveURL(/.*invite/);
        
        // Explicitly click Skip/Continue and verify navigation to /dashboard.
        await page.getByRole('button', { name: /skip for now/i }).click();
        await expect(page).toHaveURL(/.*dashboard/, { timeout: 15_000 });

        // Session persistence check
        await page.reload();
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      });
    });
  }
});
