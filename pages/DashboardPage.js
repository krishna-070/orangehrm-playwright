// @ts-check

export class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Top bar
    this.headerTitle = this.page.locator('.oxd-topbar-header-breadcrumb h6');
    this.dashboardHeader = this.page.getByRole('heading', { name: 'Dashboard' });

    // Side panel
    this.sidePanel = this.page.getByRole('navigation', { name: 'Sidepanel' });

    // User dropdown
    this.userDropdown = this.page.locator('.oxd-userdropdown-tab');
    this.logoutMenuItem = this.page.getByRole('menuitem', { name: 'Logout' });
  }

  /**
   * Open a module from the left side panel, e.g. 'PIM' or 'Admin'.
   * @param {string} moduleName
   */
  async openModule(moduleName) {
    await this.sidePanel.getByRole('link', { name: moduleName, exact: true }).click();
  }

  /** Log out through the user dropdown in the top bar. */
  async logout() {
    await this.userDropdown.click();
    await this.logoutMenuItem.click();
  }
}
