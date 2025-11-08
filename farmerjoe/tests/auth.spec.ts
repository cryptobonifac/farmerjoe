import { expect, test } from '@playwright/test';

test.describe('Registration', () => {
  test('allows producers to register with full profile details', async ({ page }) => {
    const uniqueSuffix = Date.now();

    await page.goto('/register');
    await page.getByTestId('producer-basic-full-name').fill('Producer Test User');
    await page.getByTestId('producer-basic-email').fill(`producer-${uniqueSuffix}@example.test`);
    await page.getByTestId('producer-basic-phone').fill('+441234567890');
    await page.getByTestId('producer-basic-password').fill('Password123!');
    await page.getByTestId('producer-basic-business-name').fill('Producer Test Farm');
    await page.getByTestId('producer-next-button').click();

    await page.getByTestId('producer-social-website').fill('https://producer.example.test');
    await page.getByTestId('producer-social-instagram').fill('@producerfarm');
    await page.getByTestId('producer-next-button').click();

    await page.getByTestId('producer-preferences-category-fresh-produce').click();
    await page.getByTestId('producer-location-map').click();
    await expect(page.getByTestId('producer-location-entry-0')).toBeVisible();
    await page.getByTestId('producer-preferences-notes').fill('Seasonal veg, pick-up on Saturdays.');
    await page.getByTestId('producer-next-button').click();

    await page.getByTestId('producer-store-item-name').fill('Organic Carrots');
    await page.getByTestId('producer-store-item-quantity').fill('20');
    await page.getByTestId('producer-store-item-unit').selectOption('kg');
    await page.getByTestId('producer-store-item-price').fill('45');
    await page.getByTestId('producer-store-item-save').click();
    await expect(page.getByTestId('producer-store-row-0')).toBeVisible();
    await page.getByTestId('producer-next-button').click();

    await Promise.all([
      page.waitForURL(/\/login\?message=confirm/i, { timeout: 15_000 }),
      page.getByTestId('producer-confirm-submit').click(),
    ]);

    await expect(page.getByTestId('login-confirmation-message')).toBeVisible();
  });

  test('allows customers to register with full profile details', async ({ page }) => {
    const uniqueSuffix = Date.now();

    await page.goto('/register');
    await page.getByTestId('register-role-option-customer').click();

    await page.getByTestId('register-full-name').fill('Customer Test User');
    await page.getByTestId('register-email').fill(`customer-${uniqueSuffix}@example.test`);
    await page.getByTestId('register-password').fill('Password123!');

    await Promise.all([
      page.waitForURL(/\/login\?message=confirm/i, { timeout: 15_000 }),
      page.getByTestId('register-submit-button').click(),
    ]);

    await expect(page.getByTestId('login-confirmation-message')).toBeVisible();
  });
});

test.describe('Login', () => {
  const existingEmail = process.env.TEST_USER_EMAIL ?? 'producer@example.test';
  const existingPassword = process.env.TEST_USER_PASSWORD ?? 'Password123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('allows existing users to sign in with email and password', async ({ page }) => {
    await page.getByTestId('login-email').fill(existingEmail);
    await page.getByTestId('login-password').fill(existingPassword);

    await Promise.all([
      page.waitForURL(/\/dashboard$/, { timeout: 15_000 }),
      page.getByTestId('login-submit-button').click(),
    ]);

    await expect(page.getByTestId('dashboard-welcome-title')).toBeVisible();
  });

  const socialProviders: Array<{
    id: 'google' | 'facebook' | 'twitter';
    buttonTestId: string;
    spinnerTestId: string;
  }> = [
    { id: 'google', buttonTestId: 'login-google-button', spinnerTestId: 'login-google-spinner' },
    {
      id: 'facebook',
      buttonTestId: 'login-facebook-button',
      spinnerTestId: 'login-facebook-spinner',
    },
    { id: 'twitter', buttonTestId: 'login-twitter-button', spinnerTestId: 'login-twitter-spinner' },
  ];

  for (const provider of socialProviders) {
    test(`initiates ${provider.id} OAuth sign-in`, async ({ page }) => {
      const button = page.getByTestId(provider.buttonTestId);

      await button.click();

      await expect(button).toBeDisabled();
      await expect(page.getByTestId(provider.spinnerTestId)).toBeVisible();
    });
  }
});


