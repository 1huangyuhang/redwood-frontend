import { defineConfig, devices } from '@playwright/test';

/**
 * 管理端 E2E：默认假设本机已启动后端（如 :3000）与管理端 Vite（:3001）。
 * 可选：PLAYWRIGHT_WEB_SERVER=1 时由 Playwright 拉起 `npm run dev:management`（仍需自行启动后端）。
 */
const startWeb =
  process.env['PLAYWRIGHT_WEB_SERVER'] === '1'
    ? {
        command: 'npm run dev:management',
        url: 'http://127.0.0.1:3001',
        reuseExistingServer: !process.env['CI'],
        timeout: 120_000,
      }
    : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env['MANAGEMENT_BASE_URL'] || 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: startWeb,
});
