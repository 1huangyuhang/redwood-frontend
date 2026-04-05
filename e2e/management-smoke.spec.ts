import { test, expect } from '@playwright/test';

test.describe('Management app smoke', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(
      page.getByRole('heading', { name: '管理员登录' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible();
  });

  test('invalid login shows ant-design message', async ({ page }) => {
    await page.goto('/login');
    await page
      .getByPlaceholder('注册时使用的邮箱或用户名')
      .fill('__e2e_invalid__@test.local');
    await page.getByPlaceholder('请输入密码').fill('wrong-password-e2e');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.locator('.ant-message-notice').first()).toBeVisible({
      timeout: 25_000,
    });
  });
});
