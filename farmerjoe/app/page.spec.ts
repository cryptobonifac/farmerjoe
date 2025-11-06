import { test, expect } from '@playwright/test';

test.use({
  // Configure the base URL for the development server
  baseURL: 'http://localhost:3000',
});

test('renders the main logo', async ({ page }) => {
  await page.goto('/'); // Navigate to the home page

  // Find the heading element and assert its text content
  const logo = page.getByRole('img', { name: 'Next.js logo' });
  await expect(logo).toBeVisible();
});
