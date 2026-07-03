const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('response', async res => {
    if (res.url().includes('/api/v1/auth/me')) {
      const text = await res.text();
      console.log('API /auth/me STATUS:', res.status());
      console.log('API /auth/me BODY:', text);
    }
  });

  console.log('Logging in...');
  await page.goto('http://localhost:5173/login');
  await page.type('input[type="email"]', 'admin@stockflow.com');
  await page.type('input[type="password"]', 'AdminPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  
  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
  console.log('Current URL:', page.url());

  await browser.close();
})();
