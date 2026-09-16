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

  test('TC01 - valid credentials log the user in and load the dashboard @AS360TC-6', async ({ page }) => {
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

  test('TC04 - the login page renders its branding, heading and form controls @AS360TC-7', async ({ page }) => {
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page).toHaveTitle(/OrangeHRM/);

    await expect(loginPage.brandingLogo).toBeVisible();
    await expect(loginPage.loginHeading).toBeVisible();

    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toBeEditable();
    await expect(loginPage.usernameInput).toHaveValue('');

    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeEditable();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.loginButton).toBeEnabled();
    await expect(loginPage.forgotPasswordLink).toBeVisible();

    // No validation errors before the form is ever submitted.
    await expect(loginPage.fieldErrors).toHaveCount(0);
  });

  test('TC05 - submitting an empty form shows "Required" under both fields @AS360TC-8', async ({ page }) => {
    await loginPage.submitEmptyForm();

    await expect(loginPage.fieldErrors).toHaveCount(2);
    await expect(loginPage.fieldErrorFor('Username')).toHaveText('Required');
    await expect(loginPage.fieldErrorFor('Password')).toHaveText('Required');

    // Validation is client side: the user stays on the login page and no
    // "Invalid credentials" banner is raised.
    await expect(page).toHaveURL(/auth\/login/);
    await expect(loginPage.errorAlert).toHaveCount(0);

    // Typing a username clears only that field's error.
    await loginPage.usernameInput.fill(VALID_USERNAME);
    await expect(loginPage.fieldErrorFor('Username')).toHaveCount(0);
    await expect(loginPage.fieldErrorFor('Password')).toHaveText('Required');
  });

  test('TC06 - "Forgot your password?" opens the reset screen and Cancel returns to login @AS360TC-9', async ({ page }) => {
    await loginPage.openForgotPassword();

    await expect(page).toHaveURL(/requestPasswordResetCode/);
    await expect(loginPage.resetPasswordHeading).toBeVisible();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.usernameInput).toHaveValue('');
    await expect(loginPage.resetPasswordButton).toBeEnabled();
    await expect(loginPage.cancelButton).toBeEnabled();

    await loginPage.cancelButton.click();

    await expect(page).toHaveURL(/auth\/login/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
  });
});
