import { test, expect } from '@playwright/test';

const DEMO = { email: 'demo@shopverse.dev', password: 'Demo123!' };

test.describe('Shopping flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(DEMO.email);
    await page.getByTestId('login-password').fill(DEMO.password);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL(/\/products/);
  });

  test('add to cart and place order (demo checkout)', async ({ page }) => {
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: /headphones/i }).first().click();
    await expect(page).toHaveURL(/\/products\//);

    await page.getByTestId('add-to-cart').click();
    await expect(page.getByText('Added to cart')).toBeVisible({ timeout: 10_000 });

    await page.goto('/cart');
    await expect(page.getByTestId('proceed-checkout')).toBeVisible();
    await page.getByTestId('proceed-checkout').click();
    await expect(page).toHaveURL(/\/checkout/);
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();

    await page.getByTestId('checkout-fullName').fill('Test User');
    await page.getByTestId('checkout-street').fill('123 Test St');
    await page.getByTestId('checkout-city').fill('Testville');
    await page.getByTestId('checkout-state').fill('CA');
    await page.getByTestId('checkout-zip').fill('90210');
    await page.getByTestId('checkout-country').fill('United States');

    await page.getByTestId('place-order').click();

    await expect(page).toHaveURL(/\/account\/orders\//, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: /order #/i })).toBeVisible();
  });
});
