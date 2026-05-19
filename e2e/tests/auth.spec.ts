import { test, expect } from '@playwright/test';

const DEMO = { email: 'demo@shopverse.dev', password: 'Demo123!' };
const ADMIN = { email: 'admin@shopverse.dev', password: 'Admin123!' };

test.describe('Authentication', () => {
  test('customer can sign in and reach products', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill(DEMO.email);
    await page.getByTestId('login-password').fill(DEMO.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('link', { name: 'ShopVerse' })).toBeVisible();
  });

  test('admin is redirected to admin dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-email').fill(ADMIN.email);
    await page.getByTestId('login-password').fill(ADMIN.password);
    await page.getByTestId('login-submit').click();

    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });

  test('admin mobile menu opens and closes', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(ADMIN.email);
    await page.getByTestId('login-password').fill(ADMIN.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/admin/);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.locator('#mobile-drawer');
    await expect(drawer.getByRole('link', { name: 'Orders', exact: true })).toBeVisible();
    await drawer.getByRole('button', { name: 'Close menu' }).click();
  });
});
