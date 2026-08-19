// @ts-check

/** Column positions in the employee results grid (cell 0 is the checkbox). */
const COLUMN = {
  id: 1,
  firstName: 2,
  lastName: 3,
};

/**
 * Page Object for PIM > Employee List: the search filters and the results grid.
 */
export class PimPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Search panel
    this.searchPanel = page.locator('.oxd-table-filter');
    this.panelHeading = page.getByRole('heading', { name: 'Employee Information' });
    this.employeeNameInput = this.filterInput('Employee Name');
    this.employeeIdInput = this.filterInput('Employee Id');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.resetButton = page.getByRole('button', { name: 'Reset' });

    // Results grid
    this.resultsTable = page.locator('.oxd-table-body');
    this.resultRows = page.locator('.oxd-table-card');
    this.recordsFound = page.locator('.orangehrm-horizontal-padding span');
  }

  /**
   * The text input of a filter, located by its visible label.
   * @param {string} label
   */
  filterInput(label) {
    return this.page
      .locator('.oxd-input-group')
      .filter({ has: this.page.getByText(label, { exact: true }) })
      .locator('input');
  }

  /** Navigate straight to the employee list (skips the side panel click). */
  async goto() {
    await this.page.goto('/web/index.php/pim/viewEmployeeList');
    await this.panelHeading.waitFor();
  }

  /**
   * A cell of a result row, by row index and column name.
   * @param {number} rowIndex
   * @param {keyof typeof COLUMN} column
   */
  cell(rowIndex, column) {
    return this.resultRows.nth(rowIndex).locator('.oxd-table-cell').nth(COLUMN[column]);
  }

  /**
   * The number reported by the "(N) Records Found" label, or 0 when the grid
   * reports "No Records Found".
   * @returns {Promise<number>}
   */
  async getRecordCount() {
    const label = (await this.recordsFound.innerText()).trim();
    const match = label.match(/\((\d+)\)\s+Records?\s+Found/i);
    return match ? Number(match[1]) : 0;
  }

  /**
   * The first employee id in the grid that is not blank — employee records on
   * the public demo are not guaranteed to carry an id.
   * @returns {Promise<string>}
   */
  async getFirstEmployeeId() {
    const ids = await this.resultRows.locator(`.oxd-table-cell:nth-child(${COLUMN.id + 1})`).allInnerTexts();
    return ids.map((id) => id.trim()).find((id) => id.length > 0) ?? '';
  }

  /**
   * Filter the grid by employee id and wait for the results to settle.
   * @param {string} employeeId
   */
  async searchByEmployeeId(employeeId) {
    await this.employeeIdInput.fill(employeeId);
    const response = this.page.waitForResponse((res) => res.url().includes('/api/v2/pim/employees'));
    await this.searchButton.click();
    await response;
  }

  /** Clear every filter and wait for the unfiltered list to come back. */
  async resetFilters() {
    const response = this.page.waitForResponse((res) => res.url().includes('/api/v2/pim/employees'));
    await this.resetButton.click();
    await response;
  }
}
