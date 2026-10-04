import { test, expect } from '@playwright/test';

const LEGACY_STATE = {
  rankDir: 'high',
  players: ['Alice', 'Bob'],
  rounds: [{ scores: { Alice: 10, Bob: 5 }, winner: 'Alice' }],
  gameName: 'Legacy Game',
  trackWinner: true,
};

test('imports legacy single-game localStorage state on first load, only once', async ({ page }) => {
  // Seed before the app's first load: each test starts with an empty browser profile, so the
  // first load sees the legacy blob with no database yet. Clearing state after the app has
  // started races its startup, which can import the game before the reload.
  await page.addInitScript((legacy) => {
    localStorage.setItem('sb-state', JSON.stringify(legacy));
  }, LEGACY_STATE);
  await page.goto('/');

  await expect(page.getByTestId('toast')).toContainText(
    'Imported your previous scoreboard as "Legacy Game"',
  );
  await expect(page.getByTestId('game-list-item').filter({ hasText: 'Legacy Game' })).toBeVisible();

  await page
    .getByTestId('game-list-item')
    .filter({ hasText: 'Legacy Game' })
    .getByRole('button', { name: 'Open' })
    .click();
  await expect(page.getByLabel('Game name')).toHaveValue('Legacy Game');

  await page.reload();
  await expect(page.getByTestId('game-list-item')).toHaveCount(1);
});
