import { test, expect } from '@playwright/test';

test('list/detail status parity via server summary', async ({ page }) => {
  await page.goto('/patients');
  await page.getByTestId('patient-row-123').click();
  await page.getByTestId('facility-select').selectOption('Facility A');
  await page.getByTestId('select-for-transfer').click();
  await page.goto('/patients');
  await expect(page.getByTestId('patient-row-123-status')).toHaveText('SELECTED_FOR_TRANSFER');
});
