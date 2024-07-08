import { chromium } from '@playwright/test';
import https from 'https';

async function globalSetup() {
  console.log('Starting global setup...');

  // Check if the server is responding using Node's https module
  await new Promise((resolve, reject) => {
    const checkServer = () => {
      console.log('Checking server availability...');
      https.get('https://localhost:3000', {
        rejectUnauthorized: false // Ignore self-signed certificate errors
      }, (res) => {
        console.log(`Server responded with status code: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log('Server is available!');
          resolve();
        } else {
          setTimeout(checkServer, 2000);
        }
      }).on('error', (err) => {
        console.log('Error when checking server:', err.message);
        setTimeout(checkServer, 2000);
      });
    };
    checkServer();
  });

  console.log('Server check passed, launching browser...');

  const browser = await chromium.launch({ ignoreHTTPSErrors: true });
  const page = await browser.newPage();

  try {
    console.log('Navigating to https://localhost:3000...');
    await page.goto('https://localhost:3000', { timeout: 60000 });
    console.log('Navigation successful');
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    console.log('Page loaded successfully');
  } catch (error) {
    console.error('Error during page load:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('Global setup completed successfully');
}

export default globalSetup;
