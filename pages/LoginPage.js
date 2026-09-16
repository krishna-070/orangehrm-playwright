// @ts-check

/**
 * Page Object for the OrangeHRM login page.
 * @see https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 */
export class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });

    this.errorAlert = page.locator('.oxd-alert-content--error');
    this.errorMessage = this.errorAlert.locator('.oxd-alert-content-text');
    this.dashboardHeader = page.getByRole('heading', { name: 'Dashboard' });

    // Static page furniture
    this.brandingLogo = page.locator('.orangehrm-login-branding img');
    this.loginHeading = page.getByRole('heading', { name: 'Login', exact: true });
    this.demoCredentials = page.locator('.orangehrm-demo-credentials');
    this.forgotPasswordLink = page.getByText('Forgot your password?', { exact: false });

    // Inline "Required" validation messages under the credential fields
    this.fieldErrors = page.locator('.oxd-input-field-error-message');

    // Reset-password screen reached from "Forgot your password?"
    this.resetPasswordHeading = page.getByRole('heading', { name: 'Reset Password', exact: true });
    this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  /** Navigate to the login page. */
  async goto() {
    await this.page.goto('/web/index.php/auth/login');
    await this.usernameInput.waitFor();
  }

  /**
   * Fill the credentials and submit the login form.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /** Submit the form without typing anything, to trigger field validation. */
  async submitEmptyForm() {
    await this.usernameInput.fill('');
    await this.passwordInput.fill('');
    await this.loginButton.click();
  }

  /**
   * The inline validation message that belongs to a field, located by the
   * field's placeholder so it does not depend on DOM ordering.
   * @param {string} placeholder
   */
  fieldErrorFor(placeholder) {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByPlaceholder(placeholder) })
      .locator('.oxd-input-field-error-message');
  }

  /** Open the "Forgot your password?" screen. */
  async openForgotPassword() {
    await this.forgotPasswordLink.click();
    await this.resetPasswordHeading.waitFor();
  }
}
