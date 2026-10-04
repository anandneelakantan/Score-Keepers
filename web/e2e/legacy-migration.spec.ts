import { test, expect } from '@playwright/test';
import { deleteDatabase, resetAppState } from './helpers';

const LEGACY_STATE = {
  rankDir: 'high',
  players: ['Alice', 'Bob'],
  rounds: [{ scores: { Alice: 10, Bob: 5 }, winner: 'Alice' }],
  gameName: 'Legacy Game',
  trackWinner: true,
};

test('imports legacy single-game localStorage state on first load, only once', async ({ page }) => {
  await resetAppState(page);
  await page.evaluate((legacy) => localStorage.setItem('sb-state', JSON.stringify(legacy)), LEGACY_STATE);
  await deleteDatabase(page); // clears the "already imported" flag set on first load
  await page.reload();

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
