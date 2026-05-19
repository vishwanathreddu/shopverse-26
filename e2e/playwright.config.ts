import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT ?? '5173';
const API_PORT = process.env.API_PORT ?? '5000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  globalSetup: './global-setup.ts',
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../backend',
      url: `http://localhost:${API_PORT}/api/health`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: {
        NODE_ENV: 'development',
        PORT: API_PORT,
        MONGODB_URI: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/shopverse',
      },
    },
    {
      command: 'npm run dev',
      cwd: '../frontend',
      url: `http://localhost:${PORT}`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
