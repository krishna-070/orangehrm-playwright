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
}
