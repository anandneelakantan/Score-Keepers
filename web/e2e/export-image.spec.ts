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

  // iOS WebKit ignores the `download` attribute, so the app opens the image
  // in a new tab instead of triggering a download (see ExportImageButton.tsx).
  const isIOS = await page.evaluate(
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  );

  if (isIOS) {
    const popupPromise = page.waitForEvent('popup');
    await page.getByRole('button', { name: 'Share' }).click();
    const popup = await popupPromise;
    expect(popup.url()).toMatch(/^blob:/);
    await expect(page.getByTestId('toast')).toContainText('Long-press the image to save it.');
  } else {
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Share' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('leaderboard_round1.png');
  }
});
