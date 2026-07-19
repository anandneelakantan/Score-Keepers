import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
  await createGame(page, 'Rounds Test');
  await setPlayers(page, ['Alice', 'Bob']);
  await goToTab(page, 'Rounds');
});

test('submits a round with a winner and shows it in history', async ({ page }) => {
  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '7');
  await page.locator('select').selectOption({ label: 'Alice' });
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await expect(page.getByText('RD 1')).toBeVisible();
  await expect(page.getByText('🏅 Alice')).toBeVisible();
  await expect(page.locator('.round-badge')).toHaveText('Round 2');
});

test('undo last round removes it from history', async ({ page }) => {
  await fillScore(page, 'Alice', '5');
  await fillScore(page, 'Bob', '3');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();
  await expect(page.getByText('RD 1')).toBeVisible();

  await page.getByRole('button', { name: 'Undo Last Round' }).click();
  await expect(page.getByText('No rounds yet.')).toBeVisible();
  await expect(page.locator('.round-badge')).toHaveText('Round 1');
});

test('disabling winner tracking clears winner badges from history', async ({ page }) => {
  await fillScore(page, 'Alice', '5');
  await fillScore(page, 'Bob', '3');
  await page.locator('select').selectOption({ label: 'Alice' });
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();
  await expect(page.getByText('🏅 Alice')).toBeVisible();

  await goToTab(page, 'Game setup');
  // The native checkbox is visually hidden behind a custom slider (see .toggle-slider
  // in global.css), so a real click is intercepted by the slider; force it like a user
  // clicking the slider would.
  await page.getByLabel('Track round winner').click({ force: true });
  await goToTab(page, 'Rounds');
  await expect(page.getByText('🏅 Alice')).toHaveCount(0);
});
