import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore } from './helpers';

test.beforeEach(async ({ page }) => {
  await resetAppState(page);
});

test('ranks players correctly with highest-first and shows move indicators', async ({ page }) => {
  await createGame(page, 'Leaderboard High');
  await setPlayers(page, ['Alice', 'Bob', 'Carol']);
  await goToTab(page, 'Rounds');

  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await fillScore(page, 'Carol', '20');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await fillScore(page, 'Alice', '15');
  await fillScore(page, 'Bob', '1');
  await fillScore(page, 'Carol', '0');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');
  const rows = page.locator('.lb-row');
  await expect(rows).toHaveCount(3);

  await expect(rows.nth(0).locator('.lb-name-text')).toHaveText('Alice');
  await expect(rows.nth(0).locator('.lb-medal')).toHaveText('🥇');
  await expect(rows.nth(0).locator('.lb-move')).toContainText('+1');
  await expect(rows.nth(0).locator('.lb-score')).toHaveText('+25');

  await expect(rows.nth(1).locator('.lb-name-text')).toHaveText('Carol');
  await expect(rows.nth(1).locator('.lb-medal')).toHaveText('🥈');
  await expect(rows.nth(1).locator('.lb-move')).toContainText('-1');
  await expect(rows.nth(1).locator('.lb-score')).toHaveText('+20');

  await expect(rows.nth(2).locator('.lb-name-text')).toHaveText('Bob');
  await expect(rows.nth(2).locator('.lb-medal')).toHaveText('🥉');
  await expect(rows.nth(2).locator('.lb-score')).toHaveText('+6');
});

test('shows a worm chart with one line per player once two rounds are played', async ({ page }) => {
  await createGame(page, 'Leaderboard Worm');
  await setPlayers(page, ['Alice', 'Bob', 'Carol']);
  await goToTab(page, 'Rounds');

  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await fillScore(page, 'Carol', '20');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');
  await expect(page.locator('.worm-chart')).toHaveCount(0);

  await goToTab(page, 'Rounds');
  await fillScore(page, 'Alice', '15');
  await fillScore(page, 'Bob', '1');
  await fillScore(page, 'Carol', '0');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');
  const wormChart = page.locator('.worm-chart');
  await expect(wormChart).toHaveCount(1);
  await expect(wormChart.locator('.worm-line-group')).toHaveCount(3);
  await expect(wormChart.locator('.worm-label-name')).toHaveText(['Alice', 'Bob', 'Carol']);
});

test('toggles the worm chart between rank and points views', async ({ page }) => {
  await createGame(page, 'Leaderboard Worm Toggle');
  await setPlayers(page, ['Alice', 'Bob', 'Carol']);
  await goToTab(page, 'Rounds');

  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await fillScore(page, 'Carol', '20');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await fillScore(page, 'Alice', '15');
  await fillScore(page, 'Bob', '1');
  await fillScore(page, 'Carol', '0');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');

  await expect(page.locator('.worm-chart-title')).toHaveText('Rank Over Time');
  await expect(page.locator('.worm-axis-label')).toHaveCount(0);

  await page.locator('.worm-metric-toggle').getByRole('button', { name: 'Points' }).click();
  await expect(page.locator('.worm-chart-title')).toHaveText('Points Over Time');
  await expect(page.locator('.worm-axis-label').first()).toBeVisible();

  await page.locator('.worm-metric-toggle').getByRole('button', { name: 'Rank' }).click();
  await expect(page.locator('.worm-chart-title')).toHaveText('Rank Over Time');
  await expect(page.locator('.worm-axis-label')).toHaveCount(0);
});

test('ranks players correctly with lowest-first', async ({ page }) => {
  await createGame(page, 'Leaderboard Low');
  await page.getByRole('button', { name: 'Lowest first' }).click();
  await setPlayers(page, ['Alice', 'Bob', 'Carol']);
  await goToTab(page, 'Rounds');

  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await fillScore(page, 'Carol', '20');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');
  const rows = page.locator('.lb-row');
  await expect(rows.nth(0).locator('.lb-name-text')).toHaveText('Bob');
  await expect(rows.nth(1).locator('.lb-name-text')).toHaveText('Alice');
  await expect(rows.nth(2).locator('.lb-name-text')).toHaveText('Carol');
});
