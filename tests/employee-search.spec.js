// @ts-check
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { PimPage } from '../pages/PimPage';

const VALID_USERNAME = 'Admin';
const VALID_PASSWORD = 'admin123';

const UNKNOWN_EMPLOYEE_ID = '999999999';

test.describe('OrangeHRM - PIM employee search', () => {
  test('TC03 - an admin can log in, search the employee list, reset the filters and log out', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const pimPage = new PimPage(page);

    await test.step('log in as an admin', async () => {
      await loginPage.goto();
      await loginPage.login(VALID_USERNAME, VALID_PASSWORD);

      await expect(page).toHaveURL(/dashboard/);
      await expect(dashboardPage.dashboardHeader).toBeVisible();
    });

    await test.step('open the PIM module from the side panel', async () => {
      await dashboardPage.openModule('PIM');

      await expect(page).toHaveURL(/pim\/viewEmployeeList/);
      await expect(dashboardPage.headerTitle).toHaveText('PIM');
      await expect(pimPage.panelHeading).toBeVisible();
    });

    let firstEmployeeId = '';
    let firstEmployeeName = '';

    await test.step('the unfiltered grid lists employees', async () => {
      await expect(pimPage.recordsFound).toHaveText(/\(\d+\) Records? Found/);

      const totalRecords = await pimPage.getRecordCount();
      expect(totalRecords).toBeGreaterThan(0);
      await expect(pimPage.resultRows).toHaveCount(Math.min(totalRecords, 50));

      firstEmployeeId = await pimPage.getFirstEmployeeId();
      expect(firstEmployeeId, 'expected at least one employee to have an id').not.toBe('');
      firstEmployeeName = (await pimPage.cell(0, 'firstName').innerText()).trim();
    });

    await test.step('searching by an existing employee id narrows the grid', async () => {
      await pimPage.searchByEmployeeId(firstEmployeeId);

      await expect(pimPage.recordsFound).toHaveText(/\(\d+\) Records? Found/);
      const matches = await pimPage.getRecordCount();
      expect(matches).toBeGreaterThan(0);
      await expect(pimPage.resultRows).toHaveCount(matches);

      const ids = await pimPage.resultRows.locator('.oxd-table-cell:nth-child(2)').allInnerTexts();
      for (const id of ids) {
        expect(id.trim()).toContain(firstEmployeeId);
      }
      await expect(pimPage.cell(0, 'firstName')).toHaveText(firstEmployeeName);
    });

    await test.step('searching by an unknown employee id returns nothing', async () => {
      await pimPage.searchByEmployeeId(UNKNOWN_EMPLOYEE_ID);

      await expect(pimPage.recordsFound).toHaveText('No Records Found');
      await expect(pimPage.resultRows).toHaveCount(0);
      expect(await pimPage.getRecordCount()).toBe(0);
    });

    await test.step('resetting the filters brings the full list back', async () => {
      await pimPage.resetFilters();

      await expect(pimPage.employeeIdInput).toHaveValue('');
      await expect(pimPage.recordsFound).toHaveText(/\(\d+\) Records? Found/);
      expect(await pimPage.getRecordCount()).toBeGreaterThan(1);
    });

    await test.step('log out', async () => {
      await dashboardPage.logout();

      await expect(page).toHaveURL(/auth\/login/);
      await expect(loginPage.loginButton).toBeVisible();
    });
  });
});
