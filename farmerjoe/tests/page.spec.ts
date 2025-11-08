import { test, expect } from '@playwright/test';

test.use({
  // Configure the base URL for the development server
  baseURL: 'http://localhost:3000',
});

test('shows authentication configuration notice when Supabase is missing', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('home-title')).toBeVisible();
  await expect(page.getByTestId('home-login-button')).toBeVisible();
  await expect(page.getByTestId('home-register-button')).toBeVisible();
});


