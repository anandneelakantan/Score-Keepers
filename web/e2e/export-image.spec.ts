import { test, expect } from '@playwright/test';
import { resetAppState, createGame, setPlayers, goToTab, fillScore } from './helpers';

test('exports the leaderboard as a downloaded image', async ({ page }) => {
  await resetAppState(page);
  await createGame(page, 'Export Test');
  await setPlayers(page, ['Alice', 'Bob']);
  await goToTab(page, 'Rounds');
  await fillScore(page, 'Alice', '10');
  await fillScore(page, 'Bob', '5');
  await page.getByRole('button', { name: 'Submit Round ✓' }).click();

  await goToTab(page, 'Leaderboard');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export as Image' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('leaderboard_round1.png');
});
