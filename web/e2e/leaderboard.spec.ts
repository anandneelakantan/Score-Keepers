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
  await expect(rows.nth(0).locator('.lb-score')).toHaveText('25');

  await expect(rows.nth(1).locator('.lb-name-text')).toHaveText('Carol');
  await expect(rows.nth(1).locator('.lb-medal')).toHaveText('🥈');
  await expect(rows.nth(1).locator('.lb-move')).toContainText('-1');
  await expect(rows.nth(1).locator('.lb-score')).toHaveText('20');

  await expect(rows.nth(2).locator('.lb-name-text')).toHaveText('Bob');
  await expect(rows.nth(2).locator('.lb-medal')).toHaveText('🥉');
  await expect(rows.nth(2).locator('.lb-score')).toHaveText('6');
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
  await expect(wormChart.locator('.worm-label-name')).toHaveText([/^Alice/, /^Bob/, /^Carol/]);
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

  await expect(page.locator('.worm-chart-title')).toHaveText('Points Over Time');
  await expect(page.locator('.worm-axis-label').first()).toBeVisible();

  await page.locator('.worm-metric-toggle').getByRole('button', { name: 'Rank' }).click();
  await expect(page.locator('.worm-chart-title')).toHaveText('Rank Over Time');
  await expect(page.locator('.worm-axis-label')).toHaveCount(0);

  await page.locator('.worm-metric-toggle').getByRole('button', { name: 'Points' }).click();
  await expect(page.locator('.worm-chart-title')).toHaveText('Points Over Time');
  await expect(page.locator('.worm-axis-label').first()).toBeVisible();
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

test('flips the points worm chart so the lowest total sits on top for lowest-first games', async ({ page }) => {
  await createGame(page, 'Leaderboard Low Worm');
  await page.getByRole('button', { name: 'Lowest first' }).click();
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
  await expect(page.locator('.worm-chart-title')).toHaveText('Points Over Time');

  // Bob totals 6 (lowest, rank #1); Alice totals 25 (highest, rank #3).
  const bestPoint = page
    .locator('circle.worm-point')
    .filter({ has: page.locator('title', { hasText: 'Round 2 · Rank #1' }) });
  const worstPoint = page
    .locator('circle.worm-point')
    .filter({ has: page.locator('title', { hasText: 'Round 2 · Rank #3' }) });

  const bestCy = Number(await bestPoint.getAttribute('cy'));
  const worstCy = Number(await worstPoint.getAttribute('cy'));

  expect(bestCy).toBeLessThan(worstCy);
});

test('draws the winning points target on the points chart', async ({ page }) => {
  await createGame(page, 'Leaderboard Target');
  await page.getByLabel('Winning points').fill('100');
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
  await expect(page.locator('.worm-target-label')).toHaveText('🏁 100');

  // The target (100) exceeds every total, so its line sits above the leader's point.
  const targetY = Number(await page.locator('.worm-target-line').getAttribute('y1'));
  const leaderCy = Number(
    await page
      .locator('circle.worm-point')
      .filter({ has: page.locator('title', { hasText: 'Round 2 · Rank #1' }) })
      .getAttribute('cy'),
  );
  expect(targetY).toBeLessThan(leaderCy);

  await page.locator('.worm-metric-toggle').getByRole('button', { name: 'Rank' }).click();
  await expect(page.locator('.worm-target')).toHaveCount(0);
});

test('omits the target line when no winning points are set', async ({ page }) => {
  await createGame(page, 'Leaderboard No Target');
  await setPlayers(page, ['Alice', 'Bob']);
  await goToTab(page, 'Rounds');

  for (const [a, b] of [['10', '5'], ['3', '8']]) {
    await fillScore(page, 'Alice', a);
    await fillScore(page, 'Bob', b);
    await page.getByRole('button', { name: 'Submit Round ✓' }).click();
  }

  await goToTab(page, 'Leaderboard');
  await expect(page.locator('.worm-chart')).toHaveCount(1);
  await expect(page.locator('.worm-target')).toHaveCount(0);
});

test('hides winning points for lowest-first games', async ({ page }) => {
  await createGame(page, 'Leaderboard Low Target');
  await page.getByLabel('Winning points').fill('100');
  await setPlayers(page, ['Alice', 'Bob']);
  await page.getByRole('button', { name: 'Lowest first' }).click();
  await expect(page.getByLabel('Winning points')).toHaveCount(0);
  await goToTab(page, 'Rounds');

  for (const [a, b] of [['10', '5'], ['3', '8']]) {
    await fillScore(page, 'Alice', a);
    await fillScore(page, 'Bob', b);
    await page.getByRole('button', { name: 'Submit Round ✓' }).click();
  }

  await goToTab(page, 'Leaderboard');
  await expect(page.locator('.worm-chart')).toHaveCount(1);
  await expect(page.locator('.worm-target')).toHaveCount(0);
});
