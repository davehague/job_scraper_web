import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://localhost:3000', 
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true, 
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'https://localhost:3000', 
    ignoreHTTPSErrors: true, 
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  globalSetup: fileURLToPath(new URL('./global-setup.mjs', import.meta.url)),
  globalTimeout: 600000, // 10 minutes total timeout for the entire test run
});
