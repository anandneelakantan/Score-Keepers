import { test, expect } from '@playwright/test';
import { resetAppState } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('switches theme and persists across reload', async ({ page }) => {
  await page.getByTestId('theme-dark').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  await page.getByTestId('theme-light').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
