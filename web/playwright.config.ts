import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173/Score-Keepers/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'iphone-pro-max',
      use: { ...devices['iPhone 15 Pro Max'] },
    },
    {
      name: 'iphone-mini',
      use: { ...devices['iPhone 12 Mini'] },
    },
    {
      name: 'ipad',
      use: { ...devices['iPad (gen 11)'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173/Score-Keepers/',
    reuseExistingServer: !process.env.CI,
  },
});
