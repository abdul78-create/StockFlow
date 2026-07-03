const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  let pageErrors = [];
  page.on('pageerror', err => {
    pageErrors.push(err.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      pageErrors.push(`Console: ${msg.text()}`);
    }
  });

  const apiStatusMap = {};
  page.on('response', res => {
    if (res.url().includes('/api/v1/')) {
      const path = res.url().split('/api/v1')[1].split('?')[0];
      if (!apiStatusMap[path] || res.status() !== 200) {
        apiStatusMap[path] = res.status();
      }
    }
  });

  console.log('Logging in...');
  await page.goto('http://localhost:5173/login');
  await page.waitForSelector('input[type="email"]');
  await page.type('input[type="email"]', 'admin@stockflow.com');
  await page.type('input[type="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  const pages = [
    { title: 'Dashboard', path: '/dashboard', api: '/dashboard' },
    { title: 'Products', path: '/products', api: '/products' },
    { title: 'Inventory', path: '/inventory', api: '/inventory/balances' },
    { title: 'Purchase Orders', path: '/purchase-orders', api: '/purchase-orders' },
    { title: 'Sales Orders', path: '/sales-orders', api: '/sales-orders' },
    { title: 'Customers', path: '/customers', api: '/customers' },
    { title: 'Suppliers', path: '/suppliers', api: '/suppliers' },
    { title: 'Warehouses', path: '/warehouses', api: '/warehouses' },
    { title: 'Reports', path: '/reports', api: '/reports' },
    { title: 'Workspace', path: '/settings/workspace', api: '/workspaces' },
    { title: 'Team', path: '/settings/team', api: '/users' },
    { title: 'Security', path: '/settings/security', api: '/auth/me' },
    { title: 'Profile', path: '/settings/profile', api: '/auth/me' },
  ];

  console.log('Page | Status | API | Verified');
  console.log('-------------------------------------------');

  for (const p of pages) {
    pageErrors = [];
    await page.goto(`http://localhost:5173${p.path}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1000));
    
    const url = page.url();
    const content = await page.evaluate(() => document.querySelector('main')?.innerText?.substring(0, 50));
    
    const apiCode = apiStatusMap[p.api] || 'N/A';
    const isSuccess = url.includes(p.path) && pageErrors.length === 0 && (apiCode === 200 || apiCode === 304 || apiCode === 'N/A');
    
    let verified = '✅';
    if (url.includes('/login')) verified = '❌ (Redirected to login)';
    else if (pageErrors.length > 0) verified = `❌ (Errors: ${pageErrors[0]})`;
    else if (apiCode >= 400 && apiCode !== 'N/A') verified = `❌ (API HTTP ${apiCode})`;
    else if (!content) verified = '❌ (No content rendered)';
    
    let statusText = 'OK';
    if (verified.includes('❌')) statusText = 'FAIL';

    console.log(`${p.title.padEnd(15)} | ${statusText.padEnd(6)} | ${String(apiCode).padEnd(4)} | ${verified}`);
  }

  await browser.close();
})();
