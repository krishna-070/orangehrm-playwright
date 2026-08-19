// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

test.describe('OrangeHRM - Login', () => {
  /** @type {LoginPage} */
  let loginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC01 - valid credentials log the user in and load the dashboard', async ({ page }) => {
    await loginPage.login(VALID_USERNAME, VALID_PASSWORD);

    await expect(page).toHaveURL(/dashboard/);
    await expect(loginPage.dashboardHeader).toBeVisible();
  });

  test('TC02 - invalid credentials show an "Invalid credentials" error', async ({ page }) => {
    await loginPage.login('InvalidUser', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid credentials');
    await expect(page).toHaveURL(/auth\/login/);
  });
});
