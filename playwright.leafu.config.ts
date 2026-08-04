import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  testMatch: ['leafu-companion.spec.ts', 'leafu-patterns.spec.ts', 'leafu-senior-qa.spec.ts'],
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run functions:build && npm run dev:firebase:functions',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 240000,
  },
})
